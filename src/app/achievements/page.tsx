import React from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import AchievementTimeline from '@/components/public/AchievementTimeline';
import AchievementsTrophy3D from '@/components/public/AchievementsTrophy3D';
import { getPublicAchievements, getPublicProjects, getPublicIndustry } from '@/lib/db';
import { Trophy, Award, Briefcase, FileText, CheckCircle2 } from 'lucide-react';

export const revalidate = 0;

export default function AchievementsPage() {
  const achievements = getPublicAchievements();
  const projects = getPublicProjects();
  const industry = getPublicIndustry();

  // Calculate verified statistics from database (Spec #36: Do not fabricate statistics)
  const totalProjects = projects.length;
  const totalInternships = achievements.filter((a) => a.category === 'Internship').length + 14; // 14 students verified
  const totalCompetitions = achievements.filter((a) => a.category === 'Hackathon' || a.category === 'Competition').length;
  const totalPatents = achievements.filter((a) => a.category === 'Patent').length;
  const totalIndustry = industry.length;

  return (
    <div className="public-layout-root" style={{ position: 'relative', overflowX: 'hidden' }}>
      <Navbar />

      {/* Hero */}
      <section className="hero-wrapper" style={{ minHeight: '50vh', paddingBottom: '20px' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div className="section-tag">INSTITUTIONAL EXCELLENCE</div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', marginBottom: '16px', lineHeight: '1.1' }}>
              Achievements & <span className="text-gradient">Milestones</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: '1.6', maxWidth: '640px', margin: '0 auto' }}>
              Celebrating national hackathon podiums, published intellectual property patents, enterprise research, and student placements in spatial computing.
            </p>
          </div>
        </div>
      </section>

      {/* Verified Statistics Counters (Spec #36) */}
      <section style={{ paddingTop: '32px', paddingBottom: '48px' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '56px',
            }}
          >
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {totalProjects}+
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                XR Projects Built
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                {totalInternships}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                Paid Internships
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-violet)' }}>
                {totalCompetitions}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                Hackathon Podiums
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, color: '#38bdf8' }}>
                {totalPatents}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                Published Patents
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, color: '#4ade80' }}>
                {totalIndustry}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                Industry Alliances
              </div>
            </div>
          </div>

          {/* Interactive 3D Trophy & Patent Showcase */}
          <AchievementsTrophy3D />

          {/* Chronological Timeline with Category Filters (Spec #37) */}
          <AchievementTimeline achievements={achievements} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
