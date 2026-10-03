import React from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import ContactRadar3D from '@/components/public/ContactRadar3D';
import { getPublicSettings } from '@/lib/db';
import { MapPin, Mail, Phone, Clock, ArrowRight, Layers, Building } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default function ContactPage() {
  const settings = getPublicSettings();

  return (
    <div className="public-layout-root" style={{ position: 'relative', overflowX: 'hidden' }}>
      <Navbar institutionName={settings.institution_name} coeName={settings.coe_name} />

      {/* Hero */}
      <section className="hero-wrapper" style={{ minHeight: '45vh', paddingBottom: '20px' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div className="section-tag">COMMUNICATIONS & CAMPUS LOCATION</div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.6rem)', marginBottom: '16px', lineHeight: '1.1' }}>
              Contact & <span className="text-gradient">Information</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
              Connect with the {settings.coe_name} at {settings.institution_name}.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Details & Joining CTA (Spec #39) */}
      <section className="section-spacing" style={{ background: 'var(--bg-secondary)', paddingTop: '0' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          {/* 3D Holographic Campus Transmitter & Spatial Radar Beacon */}
          <ContactRadar3D
            officeLocation={settings.office_location}
            campusAddress={settings.campus_address}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '28px',
              marginBottom: '48px',
            }}
          >
            {/* Office Info Card */}
            <div className="glass-card hud-corner" style={{ padding: '36px', position: 'relative', boxShadow: 'var(--shadow-glow)' }}>
              <div className="tech-coord">SYS_TRANSMISSION: CAMPUS_NODE // ONLINE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                <div className="logo-badge" style={{ width: '46px', height: '46px' }}>
                  <Layers size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', lineHeight: '1.2' }}>{settings.coe_name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {settings.institution_name}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', fontSize: '0.92rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(76, 125, 255, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--accent-blue)' }}>
                    <Building size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px', fontSize: '0.86rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Laboratory Location</div>
                    <div style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{settings.office_location}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0, 255, 255, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--accent-cyan)' }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px', fontSize: '0.86rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Campus Address</div>
                    <div style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{settings.campus_address}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(123, 97, 255, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--accent-violet)' }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px', fontSize: '0.86rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official Inquiries</div>
                    <a href={`mailto:${settings.contact_email}`} style={{ color: 'var(--accent-cyan)', wordBreak: 'break-all' }}>
                      {settings.contact_email}
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-muted)' }}>
                    <Clock size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px', fontSize: '0.86rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operational Hours</div>
                    <div style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{settings.working_hours}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Request to Join Callout Card (Spec #39) */}
            <div
              className="glass-card hud-corner"
              style={{
                padding: '40px 36px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
                position: 'relative',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <div className="tech-coord">RECRUITMENT: OPEN_ACCESS</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                <span className="beacon-dot" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-cyan)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  STUDENT ADMISSION OPEN
                </span>
              </div>
              <h3 style={{ fontSize: '2rem', marginBottom: '14px' }}>
                Interested in Joining?
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.65', marginBottom: '32px', maxWidth: '440px', margin: '0 auto 32px auto' }}>
                Students from all engineering branches and academic years are invited to submit joining requests. No prior XR experience required.
              </p>
              <div>
                <Link href="/request" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem', width: '100%' }}>
                  <span>Request to Join CoE</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
