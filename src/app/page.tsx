import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import SpatialExperience3D from '@/components/public/SpatialExperience3D';
import SectionHeader from '@/components/public/SectionHeader';
import JourneyTimeline from '@/components/public/JourneyTimeline';
import FeaturedTabs from '@/components/public/FeaturedTabs';
import HeroSpatialCockpit from '@/components/public/HeroSpatialCockpit';
import { getPublicHomeContent } from '@/lib/db';
import { ArrowRight, Compass, Award, Briefcase, BookOpen, Zap, Cpu } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Dynamic server rendering

export default async function HomePage() {
  const data = await getPublicHomeContent();
  const { home_content, featured_events, featured_projects, featured_achievements, verticals, settings } = data;

  const getVerticalIcon = (iconName: string) => {
    switch (iconName) {
      case 'Award': return Award;
      case 'Briefcase': return Briefcase;
      case 'BookOpen': return BookOpen;
      case 'Zap': return Zap;
      case 'Cpu': return Cpu;
      default: return Cpu;
    }
  };

  return (
    <div className="public-layout-root" style={{ position: 'relative', overflowX: 'hidden' }}>
      <SpatialExperience3D />
      <Navbar institutionName={settings?.institution_name} coeName={settings?.coe_name} />

      {/* 1. HERO SECTION (Spec #15, #16) */}
      <section className="hero-wrapper" style={{ background: 'transparent' }}>
        <div className="container">
          <div className="hero-grid">
            {/* Left Column: Fixed typography & editable content */}
            <div className="hero-content">
              <div className="hero-badge">
                <span>{(settings?.institution_name || 'CENTRE OF EXCELLENCE').toUpperCase()}</span>
              </div>
              <h1 className="hero-title">
                {home_content.hero.title}
              </h1>
              <div className="hero-headline text-gradient">
                {home_content.hero.subtitle}
              </div>
              <p className="hero-description">
                {home_content.hero.description}
              </p>
              <div className="hero-actions">
                <Link href="/request" className="btn-primary">
                  <span>{home_content.hero.primary_cta_label}</span>
                  <ArrowRight size={16} />
                </Link>
                <Link href="/verticals" className="btn-secondary">
                  <span>{home_content.hero.secondary_cta_label}</span>
                </Link>
              </div>

              {/* Telemetry Stats Strip */}
              <div className="hero-telemetry-bar">
                <div className="hero-telemetry-item">
                  <span className="hero-telemetry-val">4K+</span>
                  <span className="hero-telemetry-lbl">Stereo Visuals</span>
                </div>
                <div className="hero-telemetry-item">
                  <span className="hero-telemetry-val">6-DoF</span>
                  <span className="hero-telemetry-lbl">Spatial Precision</span>
                </div>
                <div className="hero-telemetry-item">
                  <span className="hero-telemetry-val">5</span>
                  <span className="hero-telemetry-lbl">Core Verticals</span>
                </div>
                <div className="hero-telemetry-item">
                  <span className="hero-telemetry-val">100+</span>
                  <span className="hero-telemetry-lbl">Active Builders</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Spatial Cockpit HUD */}
            <div style={{ position: 'relative', minHeight: '480px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <HeroSpatialCockpit />
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT PREVIEW (Spec #17) - Spatial Bento Grid */}
      <section className="section-spacing">
        <div className="container">
          <SectionHeader
            tag="About The CoE"
            title={home_content.about_preview.heading}
            description={home_content.about_preview.description}
          />

          <div className="bento-grid">
            {home_content.about_preview.pillars.map((pillar, i) => (
              <div key={i} className="bento-card bento-col-6 hud-corner">
                <div className="card-radial-glow" />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--accent-cyan)', letterSpacing: '0.08em' }}>
                      // 0{i + 1} • {pillar.tag}
                    </span>
                    <span className="tech-coord">[SECTOR-0{i + 1}]</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
                    {pillar.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/about" className="btn-secondary">
              <span>Discover the CoE</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. FIVE VERTICALS PREVIEW (Spec #18) */}
      <section className="section-spacing">
        <div className="container">
          <SectionHeader
            tag="Curriculum & Pathways"
            title={home_content.verticals_preview.heading}
            description={home_content.verticals_preview.subheading}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
              marginBottom: '44px',
            }}
          >
            {verticals.map((vert) => {
              const Icon = getVerticalIcon(vert.icon);
              return (
                <div
                  key={vert.id}
                  className="glass-card hud-corner vertical-preview-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                      <span
                        className="vertical-number-badge"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '1.3rem',
                          fontWeight: 800,
                          color: 'var(--accent-cyan)',
                        }}
                      >
                        {vert.number}
                      </span>
                      <div className="vertical-icon-box">
                        <Icon size={20} />
                      </div>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', lineHeight: '1.3', marginBottom: '12px', color: 'var(--text-primary)' }}>
                      {vert.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.55' }}>
                      {vert.short_description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/verticals" className="btn-primary">
              <span>Explore All Verticals</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FEATURED CONTENT (Spec #19, #20: One unified dynamic section with tabs for Events, Projects, Achievements, max 3 records) */}
      <section className="section-spacing">
        <div className="container">
          <SectionHeader
            tag="Activity Hub"
            title={home_content.featured_content.heading}
            description="Explore our highlighted events, ongoing engineering prototypes, and student achievements."
          />

          <FeaturedTabs
            events={featured_events}
            projects={featured_projects}
            achievements={featured_achievements}
          />
        </div>
      </section>

      {/* 5. STUDENT JOURNEY (Spec #21) */}
      <section className="section-spacing">
        <div className="container">
          <SectionHeader
            tag="Structured Progression"
            title={home_content.journey.heading}
            description={home_content.journey.description}
          />

          <JourneyTimeline />
        </div>
      </section>

      {/* 6. ADMISSIONS & MANDATE OVERVIEW */}
      <section
        className="section-spacing"
        style={{
          position: 'relative',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '350px',
            background: 'radial-gradient(circle, var(--accent-cyan-glow) 0%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '720px' }}>
          <div className="section-tag" style={{ margin: '0 auto 16px auto' }}>Admission & Enrolment</div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
            {home_content.join_cta.heading}
          </h2>
          <div style={{ fontSize: '1.15rem', color: 'var(--accent-cyan)', marginBottom: '16px', fontWeight: 600 }}>
            {home_content.join_cta.subheading}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', margin: '0 auto', maxWidth: '620px' }}>
            {home_content.join_cta.description}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
