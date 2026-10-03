import React from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import SectionHeader from '@/components/public/SectionHeader';
import CoWorkingDiagram from '@/components/public/CoWorkingDiagram';
import { getPublicAboutContent } from '@/lib/db';
import { Target, Eye, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default function AboutPage() {
  const data = getPublicAboutContent();
  const { about_content } = data;

  return (
    <div className="public-layout-root" style={{ position: 'relative', overflowX: 'hidden' }}>
      <Navbar />

      {/* Hero */}
      <section className="hero-wrapper" style={{ minHeight: '65vh', paddingBottom: '40px' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div className="section-tag">INSTITUTIONAL COE PROFILE</div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', marginBottom: '16px', lineHeight: '1.1' }}>
              {about_content.hero.heading}{' '}
              <span className="text-gradient">{about_content.hero.subheading}</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: '1.6', marginBottom: '32px' }}>
              {about_content.hero.description}
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section-spacing" style={{ background: 'var(--bg-secondary)', paddingTop: '0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
              marginBottom: '64px',
            }}
          >
            <div className="glass-card hud-corner" style={{ padding: '36px', boxShadow: 'var(--shadow-glow)' }}>
              <div className="tech-coord">PILLAR: VISION_2030</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(76, 125, 255, 0.16)', border: '1px solid rgba(76, 125, 255, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)', boxShadow: '0 0 16px rgba(76, 125, 255, 0.3)' }}>
                  <Eye size={22} />
                </div>
                <h3 style={{ fontSize: '1.45rem' }}>Our Vision</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.98rem' }}>
                {about_content.vision}
              </p>
            </div>

            <div className="glass-card hud-corner" style={{ padding: '36px', boxShadow: 'var(--shadow-glow)' }}>
              <div className="tech-coord">PILLAR: MANDATE_EXECUTION</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(0, 255, 255, 0.16)', border: '1px solid rgba(0, 255, 255, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)', boxShadow: '0 0 16px rgba(0, 255, 255, 0.3)' }}>
                  <Target size={22} />
                </div>
                <h3 style={{ fontSize: '1.45rem' }}>Our Mission</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.98rem' }}>
                {about_content.mission}
              </p>
            </div>
          </div>

          {/* What We Do */}
          <div className="glass-card hud-corner" style={{ padding: '40px', marginBottom: '64px' }}>
            <div className="tech-coord">SYS_MODULE: CORE_PILLARS // CONTINUOUS_PROGRESSION</div>
            <SectionHeader
              tag="Core Mandate"
              title="What We Do"
              description="A structured institutional approach ensuring continuous student growth and industry relevance."
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {about_content.what_we_do.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', background: 'var(--surface-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-subtle)' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--accent-cyan)', marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.55' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Co-Working Space Diagram (Spec #24) */}
          <div style={{ marginBottom: '64px' }}>
            <CoWorkingDiagram />
          </div>

          {/* Multidisciplinary & Industry Orientation */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '64px' }}>
            <div className="glass-card hud-corner" style={{ padding: '32px' }}>
              <div className="tech-coord">CULTURE: 01 // CROSS-DOMAIN</div>
              <h4 style={{ fontSize: '1.35rem', marginBottom: '12px', color: 'var(--accent-cyan)' }}>
                Multidisciplinary Culture
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: '1.65' }}>
                {about_content.multidisciplinary_desc}
              </p>
            </div>
            <div className="glass-card hud-corner" style={{ padding: '32px' }}>
              <div className="tech-coord">CULTURE: 02 // CAPABILITY_GROWTH</div>
              <h4 style={{ fontSize: '1.35rem', marginBottom: '12px', color: 'var(--accent-blue)' }}>
                Student Development
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: '1.65' }}>
                {about_content.student_development_desc}
              </p>
            </div>
            <div className="glass-card hud-corner" style={{ padding: '32px' }}>
              <div className="tech-coord">CULTURE: 03 // INDUSTRY_PIPELINE</div>
              <h4 style={{ fontSize: '1.35rem', marginBottom: '12px', color: 'var(--accent-violet)' }}>
                Industry Orientation
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: '1.65' }}>
                {about_content.industry_orientation_desc}
              </p>
            </div>
          </div>

          {/* Development Roadmap */}
          <div>
            <SectionHeader
              tag="Engineering Progression"
              title="Development Roadmap"
              description="A calibrated 4-phase framework progressing from fundamentals to enterprise capstone delivery."
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {about_content.roadmap.map((step, idx) => (
                <div key={idx} className="glass-card hud-corner" style={{ padding: '26px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                      {step.phase}
                    </div>
                    <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>STAGE 0{idx + 1}</span>
                  </div>
                  <h4 style={{ fontSize: '1.15rem', marginBottom: '10px' }}>{step.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.55' }}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
