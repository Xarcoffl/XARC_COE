'use client';

export type Theme = 'dark' | 'light';

type ThemeListener = (theme: Theme) => void;

class ThemeManager {
  private currentTheme: Theme = 'dark';
  private listeners: ThemeListener[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('arvr_theme') as Theme | null;
      if (stored === 'light' || stored === 'dark') {
        this.currentTheme = stored;
      }
      this.applyTheme(this.currentTheme);
    }
  }

  public getTheme(): Theme {
    if (typeof window !== 'undefined') {
      const attr = document.documentElement.getAttribute('data-theme') as Theme | null;
      if (attr === 'light' || attr === 'dark') {
        return attr;
      }
    }
    return this.currentTheme;
  }

  public setTheme(theme: Theme) {
    this.currentTheme = theme;
    if (typeof window !== 'undefined') {
      localStorage.setItem('arvr_theme', theme);
      this.applyTheme(theme);
    }
    this.listeners.forEach((l) => l(theme));
  }

  public toggle(): Theme {
    const next = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  }

  public subscribe(fn: ThemeListener): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private applyTheme(theme: Theme) {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark-theme');
      } else {
        document.documentElement.classList.add('dark-theme');
        document.documentElement.classList.remove('light-theme');
      }
    }
  }
}

export const themeManager = new ThemeManager();
