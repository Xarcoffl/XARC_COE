'use client';

import React, { useState } from 'react';
import { Vertical } from '@/lib/types';
import { Award, Briefcase, BookOpen, Zap, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import VerticalHologramViewer from './VerticalHologramViewer';

interface VerticalSelectorProps {
  verticals: Vertical[];
}

export default function VerticalSelector({ verticals }: VerticalSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const active = verticals[selectedIndex] || verticals[0];

  const getIcon = (name: string) => {
    switch (name) {
      case 'Award': return Award;
      case 'Briefcase': return Briefcase;
      case 'BookOpen': return BookOpen;
      case 'Zap': return Zap;
      case 'Cpu': return Cpu;
      default: return Cpu;
    }
  };

  return (
    <div style={{ margin: '40px 0' }}>
      {/* Selector Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1fr) 2fr',
          gap: '32px',
          alignItems: 'start',
        }}
        className="vertical-selector-grid"
      >
        {/* Left Side: Vertical Selector Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {verticals.map((v, idx) => {
            const isSelected = selectedIndex === idx;
            const Icon = getIcon(v.icon);
            return (
              <button
                key={v.id}
                onClick={() => setSelectedIndex(idx)}
                className={`vertical-nav-btn ${isSelected ? 'active' : ''}`}
                style={{
                  width: '100%',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  }}
                >
                  {v.number}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      lineHeight: '1.25',
                    }}
                  >
                    {v.title}
                  </div>
                </div>
                <Icon
                  size={18}
                  style={{
                    color: isSelected ? 'var(--accent-cyan)' : 'var(--text-dim)',
                    filter: isSelected ? 'drop-shadow(0 0 6px var(--accent-cyan))' : 'none',
                    flexShrink: 0,
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Right Side: Active Vertical Full Detail Template */}
        {active && (
          <div
            className="glass-card hud-corner"
            style={{
              padding: '36px',
              position: 'relative',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <div className="tech-coord">SYS_VERTICAL: {active.number} // STATUS: ACTIVE_SYLLABUS</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="beacon-dot" />
                <span className="badge badge-cyan">PATHWAY {active.number}</span>
              </div>
              <span className="badge badge-blue">OFFICIAL COE VERTICAL</span>
            </div>

            <h3 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
              {active.title}
            </h3>

            {/* Interactive 3D Holographic Model Inspector (Spec #25) */}
            <VerticalHologramViewer verticalNumber={active.number} title={active.title} />

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.025rem', lineHeight: '1.65', marginBottom: '28px' }}>
              {active.full_description}
            </p>

            {/* Structured Outcomes */}
            <div style={{ marginBottom: '28px' }}>
              <h4
                style={{
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-cyan)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '12px',
                }}
              >
                Key Experiences & Deliverables
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                {active.outcomes.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--accent-cyan)', marginTop: '2px', flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools and Opportunities */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }} className="vertical-meta-grid">
              <div>
                <h5 style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Tools & Technology Stack
                </h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {active.tools.map((t, i) => (
                    <span key={i} className="badge badge-blue">{t}</span>
                  ))}
                </div>
              </div>
              <div>
                <h5 style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Career & Role Outcomes
                </h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {active.opportunities.map((o, i) => (
                    <span key={i} className="badge badge-violet">{o}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Pathway Status */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="beacon-dot" />
                <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                  CURRICULUM ACTIVE // ADMISSIONS OPEN
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Apply via Student Dock or Portal
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
