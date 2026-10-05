'use client';

import React, { useState } from 'react';
import { Achievement } from '@/lib/types';
import { Trophy, Award, FileText, Briefcase, Users } from 'lucide-react';

interface AchievementTimelineProps {
  achievements: Achievement[];
}

export default function AchievementTimeline({ achievements }: AchievementTimelineProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Only display categories that actually have at least one achievement recorded
  const categories = React.useMemo(() => {
    const presentCats = new Set<string>();
    achievements.forEach((a) => {
      if (a.category && a.category.trim()) {
        presentCats.add(a.category.trim());
      }
    });

    const standardOrder = ['Hackathon', 'Competition', 'Patent', 'Internship', 'Award', 'Conference'];
    const ordered: string[] = ['All'];
    standardOrder.forEach((cat) => {
      if (presentCats.has(cat)) {
        ordered.push(cat);
        presentCats.delete(cat);
      }
    });
    // Any custom or extra categories with achievements
    Array.from(presentCats).sort().forEach((cat) => {
      ordered.push(cat);
    });

    return ordered;
  }, [achievements]);

  React.useEffect(() => {
    if (selectedCategory !== 'All' && !categories.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [categories, selectedCategory]);

  const filtered = selectedCategory === 'All'
    ? achievements
    : achievements.filter((a) => a.category.toLowerCase() === selectedCategory.toLowerCase());

  // Group by year
  const groupedByYear: { [year: string]: Achievement[] } = {};
  filtered.forEach((a) => {
    if (!groupedByYear[a.year]) {
      groupedByYear[a.year] = [];
    }
    groupedByYear[a.year].push(a);
  });

  const sortedYears = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Hackathon': return Trophy;
      case 'Patent': return FileText;
      case 'Internship': return Briefcase;
      case 'Award': return Award;
      default: return Award;
    }
  };

  return (
    <div>
      {/* Category Filter Tabs */}
      <div className="tab-list">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            No achievements recorded under this category yet. Check back soon for updates.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {sortedYears.map((year) => (
            <div key={year} style={{ position: 'relative' }}>
              {/* Year Marker */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: 'var(--accent-cyan)',
                    background: 'rgba(43, 217, 254, 0.12)',
                    padding: '6px 18px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(43, 217, 254, 0.3)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {year}
                </div>
                <div style={{ height: '1px', width: '120px', background: 'rgba(43, 217, 254, 0.3)' }} />
              </div>

              {/* Achievements Grid for Year */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '20px',
                }}
              >
                {groupedByYear[year].map((ach) => {
                  const Icon = getCategoryIcon(ach.category);
                  return (
                    <div
                      key={ach.id}
                      className="glass-card"
                      style={{
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <span className="badge badge-cyan">{ach.category}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {ach.date}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.15rem', lineHeight: '1.3', marginBottom: '12px', color: 'var(--text-primary)' }}>
                          {ach.title}
                        </h4>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '16px' }}>
                          {ach.description}
                        </p>
                      </div>

                      <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                          <Users size={14} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                          <span style={{ fontWeight: 600 }}>{ach.student_team}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '22px' }}>
                          {ach.department}
                        </div>
                        {ach.supporting_info && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '8px', paddingLeft: '22px' }}>
                            {ach.supporting_info}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
