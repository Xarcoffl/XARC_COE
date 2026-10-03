'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Compass,
  Layers,
  Cpu,
  Calendar,
  Award,
  Globe,
  Radio,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import SoundFxToggle from './SoundFxToggle';
import ThemeToggle from './ThemeToggle';
import { soundFx } from '@/lib/soundFx';

interface NavbarProps {
  institutionName?: string;
  coeName?: string;
}

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'About', href: '/about', icon: Compass },
  { label: 'Verticals', href: '/verticals', icon: Layers },
  { label: 'Projects', href: '/projects', icon: Cpu },
  { label: 'Events', href: '/events', icon: Calendar },
  { label: 'Achievements', href: '/achievements', icon: Award },
  { label: 'Industry', href: '/industry', icon: Globe },
  { label: 'Contact', href: '/contact', icon: Radio },
  { label: 'Join CoE Cohort', href: '/request', icon: UserPlus },
];

export default function Navbar({ institutionName, coeName }: NavbarProps) {
  const [instName, setInstName] = useState(institutionName || 'Centre of Excellence');
  const [centerName, setCenterName] = useState(coeName || 'AR/VR COE');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/public/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.institution_name) {
          setInstName(data.settings.institution_name);
        }
        if (data?.settings?.coe_name) {
          setCenterName(data.settings.coe_name);
        }
      })
      .catch(() => {});
  }, []);

  // Hidden 5-click logo access handler (Spec #49)
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      soundFx.playHoloActivate();
      router.push('/control/auth');
      return;
    }

    clickTimerRef.current = setTimeout(() => {
      if (clickCountRef.current > 0 && clickCountRef.current < 5) {
        if (pathname !== '/') {
          router.push('/');
        }
      }
      clickCountRef.current = 0;
    }, 450);
  };

  return (
    <>
      {/* Mobile Top Branding Beacon (Visible only on viewports < 768px) */}
      <header className="mobile-dock-header">
        <div
          onClick={handleLogoClick}
          className="mobile-dock-brand"
          title={`${centerName} - ${instName}`}
          role="button"
          tabIndex={0}
        >
          <div className="mobile-dock-logo-icon">
            <Sparkles size={16} />
          </div>
          <div className="mobile-dock-brand-text">
            <span className="mobile-dock-title">{centerName}</span>
            <span className="mobile-dock-subtitle">{instName}</span>
          </div>
        </div>

        <div className="mobile-dock-status">
          <span className="beacon-dot" />
          <span className="mobile-beacon-text">ONLINE</span>
        </div>
      </header>

      {/* Floating Vertical Spatial Dock */}
      <aside className="floating-spatial-dock" aria-label="Spatial Navigation Dock">
        {/* Top Branding / Logo Action */}
        <div
          onClick={handleLogoClick}
          className="dock-item dock-brand-item"
          role="button"
          tabIndex={0}
          onMouseEnter={() => soundFx.playSpatialHover()}
        >
          <div className="dock-brand-icon">
            <Sparkles size={20} />
          </div>
          {/* Tooltip on Hover */}
          <div className="dock-tooltip">
            <div className="dock-tooltip-title">{centerName}</div>
            <div className="dock-tooltip-sub">{instName} • 5 clicks for Admin</div>
          </div>
        </div>

        <div className="dock-divider" />

        {/* Center Navigation Icons with Hover Tooltips */}
        <nav className="dock-nav-list">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`dock-item ${isActive ? 'active' : ''}`}
                onClick={() => soundFx.playSpatialClick()}
                onMouseEnter={() => soundFx.playSpatialHover()}
                aria-label={item.label}
              >
                <div className="dock-item-icon">
                  <Icon size={20} />
                </div>

                {/* Subtle Neon Active Glow Pip */}
                {isActive && <span className="dock-active-pip" />}

                {/* Tooltip on Hover */}
                <div className="dock-tooltip">
                  <span className="dock-tooltip-title">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="dock-divider" />

        {/* Bottom Utility Controls */}
        <div className="dock-utils-group">
          {/* Theme Mode Toggle with Tooltip */}
          <div className="dock-item dock-util-item" title="Toggle Light / Dark Mode">
            <ThemeToggle compact />
            <div className="dock-tooltip">
              <span className="dock-tooltip-title">Theme Mode</span>
            </div>
          </div>

          {/* Spatial Audio Toggle with Tooltip */}
          <div className="dock-item dock-util-item" title="Spatial Sound Engine">
            <SoundFxToggle />
            <div className="dock-tooltip">
              <span className="dock-tooltip-title">Audio Engine</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
