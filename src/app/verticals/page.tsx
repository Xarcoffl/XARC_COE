import React from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import SectionHeader from '@/components/public/SectionHeader';
import VerticalSelector from '@/components/public/VerticalSelector';
import { getPublicVerticals } from '@/lib/db';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const revalidate = 0;

export default function VerticalsPage() {
  const verticals = getPublicVerticals();

  return (
    <div className="public-layout-root" style={{ position: 'relative', overflowX: 'hidden' }}>
      <Navbar />

      {/* Hero */}
      <section className="hero-wrapper" style={{ minHeight: '55vh', paddingBottom: '20px' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div className="section-tag">COE PILLARS OF EXCELLENCE</div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', marginBottom: '16px', lineHeight: '1.1' }}>
              5 Verticals.{' '}
              <span className="text-gradient">Multiple Ways to Grow.</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: '1.6', maxWidth: '680px', margin: '0 auto' }}>
              Whether you are looking for deep multi-semester technical certifications, industry capstone internships, or rapid hackathon squads, our five pathways offer structured avenues to master spatial computing.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Vertical Selector (Spec #25) */}
      <section className="section-spacing" style={{ paddingTop: '20px' }}>
        <div className="container">
          <VerticalSelector verticals={verticals} />

          {/* Cross-Disciplinary Pathway Alignment Note */}
          <div
            className="glass-card hud-corner"
            style={{
              marginTop: '56px',
              padding: '28px 36px',
              textAlign: 'center',
            }}
          >
            <div className="tech-coord">PATHWAYS // MULTIDISCIPLINARY_COHORTS</div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '10px', color: 'var(--text-primary)' }}>
              Cross-Disciplinary Cohort Structure
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', fontSize: '0.92rem', lineHeight: '1.6' }}>
              All 5 pathways operate with synchronized milestones, allowing students from computer science, electronics, mechanical, and biomedical domains to collaborate on integrated hardware-software builds.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
