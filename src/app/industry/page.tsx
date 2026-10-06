import React from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import SectionHeader from '@/components/public/SectionHeader';
import { getPublicIndustry } from '@/lib/db';
import { Handshake, Building2, MapPin, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function IndustryPage() {
  const industryRecords = await getPublicIndustry();

  const partners = industryRecords.filter((r) => r.category === 'Partner' || r.category === 'MoU');
  const activities = industryRecords.filter((r) => r.category !== 'Partner' && r.category !== 'MoU');

  return (
    <div className="public-layout-root" style={{ position: 'relative', overflowX: 'hidden' }}>
      <Navbar />

      {/* Hero */}
      <section className="hero-wrapper" style={{ minHeight: '50vh', paddingBottom: '20px' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div className="section-tag">STRATEGIC ALLIANCES</div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', marginBottom: '16px', lineHeight: '1.1' }}>
              Academia × <span className="text-gradient">Industry</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: '1.6', maxWidth: '640px', margin: '0 auto' }}>
              Connecting student development with industry knowledge, corporate mentorship, live projects, and high-impact spatial computing opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Industry Partners & Bilateral MoUs (Spec #38) */}
      <section className="section-spacing" style={{ paddingTop: '20px' }}>
        <div className="container">
          <SectionHeader
            tag="Corporate Alliances"
            title="Partners & MoUs"
            description="Active institutional agreements with leading spatial technology creators, engine maintainers, and industrial XR enterprises."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '28px',
              marginBottom: '64px',
            }}
          >
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="glass-card"
                style={{
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span className="badge badge-cyan">{partner.category}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {partner.date_or_term}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
                    {partner.name}
                  </h3>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '20px' }}>
                    {partner.description}
                  </p>

                  <div style={{ marginBottom: '20px', padding: '14px', background: 'var(--surface-card-alt)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Collaboration Scope
                    </div>
                    <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                      {partner.collaboration_details}
                    </div>
                  </div>
                </div>

                {partner.key_outcomes && partner.key_outcomes.length > 0 && (
                  <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Measurable Outcomes
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {partner.key_outcomes.map((out, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          <CheckCircle2 size={14} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                          <span>{out}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Industrial Visits, Expert Sessions, & Consultancy (Spec #38, #101) */}
          <SectionHeader
            tag="Direct Engagement"
            title="Industrial Visits & Masterclasses"
            description="Regular field visits to motion-capture stages, cleanrooms, and expert lectures by principal architects."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
              marginBottom: '56px',
            }}
          >
            {activities.map((act) => (
              <div
                key={act.id}
                className="glass-card"
                style={{ padding: '28px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span className="badge badge-violet">{act.category}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {act.date_or_term}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.18rem', marginBottom: '10px' }}>
                  {act.name}
                </h4>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.55', marginBottom: '16px' }}>
                  {act.description}
                </p>

                {act.key_outcomes && act.key_outcomes.length > 0 && (
                  <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {act.key_outcomes.map((out, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
                          <span>{out}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Industry Collaboration CTA */}
          <div
            className="glass-card"
            style={{
              padding: '36px',
              textAlign: 'center',
            }}
          >
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
              Corporate Partnership & Research Enquiries
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 20px auto', fontSize: '0.92rem' }}>
              Interested in sponsoring student hackathons, establishing an MoU, or commissioning capstone spatial prototypes? Connect with our advisory board.
            </p>
            <a href="mailto:arvr.coe@institute.edu" className="btn-secondary">
              <span>Contact CoE Advisory</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
