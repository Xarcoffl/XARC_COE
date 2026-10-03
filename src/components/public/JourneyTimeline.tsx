'use client';

import React, { useState } from 'react';
import { Compass, BookOpen, Wrench, Hammer, Trophy, Briefcase, Building } from 'lucide-react';
import JourneyTunnel3D from './JourneyTunnel3D';

export default function JourneyTimeline() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: 'Explore',
      step: '01',
      code: 'STAGE_01 // DISCOVERY',
      desc: 'Discover spatial computing paradigms and open lab orientations.',
      icon: Compass,
    },
    {
      label: 'Learn',
      step: '02',
      code: 'STAGE_02 // FOUNDATIONS',
      desc: 'Master core 3D mathematics, Unity, Unreal, and WebGL pipelines.',
      icon: BookOpen,
    },
    {
      label: 'Practice',
      step: '03',
      code: 'STAGE_03 // SHADERS_LAB',
      desc: 'Hands-on lab assignments, shader scripting, and sensor integration.',
      icon: Wrench,
    },
    {
      label: 'Build',
      step: '04',
      code: 'STAGE_04 // PROTOTYPE',
      desc: 'Develop original prototypes in multidisciplinary student squads.',
      icon: Hammer,
    },
    {
      label: 'Compete',
      step: '05',
      code: 'STAGE_05 // HACKATHONS',
      desc: 'Participate in national XR hackathons, game jams, and patent disclosures.',
      icon: Trophy,
    },
    {
      label: 'Intern',
      step: '06',
      code: 'STAGE_06 // INDUSTRY_BAY',
      desc: 'Corporate internships with industry partners on live client deliverables.',
      icon: Briefcase,
    },
    {
      label: 'Industry',
      step: '07',
      code: 'STAGE_07 // DEPLOYMENT',
      desc: 'Graduation into high-demand spatial computing roles and ventures.',
      icon: Building,
    },
  ];

  return (
    <div style={{ position: 'relative', margin: '48px 0' }}>
      {/* Interactive 3D Spatial Progression Conduit */}
      <JourneyTunnel3D activeStep={activeStep} onSelectStep={(s) => setActiveStep(s)} />

      {/* Horizontal glowing cyber line on desktop */}
      <div
        style={{
          position: 'absolute',
          top: '36px',
          left: '4%',
          right: '4%',
          height: '2px',
          background: 'linear-gradient(90deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 255, 255, 0.7) 50%, rgba(123, 97, 255, 0.5) 100%)',
          boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
          zIndex: 0,
        }}
        className="journey-line"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {steps.map((item, idx) => {
          const Icon = item.icon;
          const isSelected = activeStep === idx;
          return (
            <div
              key={item.label}
              onClick={() => setActiveStep(idx)}
              className="glass-card hud-corner"
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                border: isSelected ? '1px solid var(--accent-cyan)' : undefined,
                background: isSelected ? 'linear-gradient(180deg, rgba(0, 255, 255, 0.16) 0%, var(--surface-card) 100%)' : undefined,
                boxShadow: isSelected ? '0 0 24px rgba(0, 255, 255, 0.3)' : undefined,
                transform: isSelected ? 'translateY(-4px)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.35), rgba(123, 97, 255, 0.35))'
                    : 'linear-gradient(135deg, rgba(0, 255, 255, 0.15), rgba(123, 97, 255, 0.15))',
                  border: isSelected ? '2px solid var(--accent-cyan)' : '1px solid rgba(0, 255, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? 'var(--text-primary)' : 'var(--accent-cyan)',
                  marginBottom: '14px',
                  boxShadow: isSelected ? '0 0 20px rgba(0, 255, 255, 0.45)' : '0 0 12px rgba(0, 255, 255, 0.2)',
                  transition: 'transform var(--transition-fast)',
                }}
              >
                <Icon size={22} />
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: isSelected ? 'var(--text-primary)' : 'var(--accent-cyan)',
                  letterSpacing: '0.06em',
                  marginBottom: '4px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {isSelected && <span className="beacon-dot" style={{ width: '5px', height: '5px' }} />}
                <span>STEP {item.step}</span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}
              >
                {item.label}
              </div>
              <p
                style={{
                  fontSize: '0.78rem',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  lineHeight: '1.45',
                }}
              >
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
