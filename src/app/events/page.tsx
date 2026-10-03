import React from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import EventsFilterView from '@/components/public/EventsFilterView';
import EventArenaHolodeck3D from '@/components/public/EventArenaHolodeck3D';
import { getPublicEvents } from '@/lib/db';

export const revalidate = 0;

export default function EventsPage() {
  const allEvents = getPublicEvents();

  return (
    <div className="public-layout-root" style={{ position: 'relative', overflowX: 'hidden' }}>
      <Navbar />

      {/* Hero */}
      <section className="hero-wrapper" style={{ minHeight: '50vh', paddingBottom: '20px' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div className="section-tag">COMMUNITY & TECHNICAL WORKSHOPS</div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', marginBottom: '16px', lineHeight: '1.1' }}>
              Events & <span className="text-gradient">Experiences</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: '1.6', maxWidth: '640px', margin: '0 auto' }}>
              Engage with immersive workshops, national hackathons, technical bootcamps, and masterclasses led by industry pioneers.
            </p>
          </div>
        </div>
      </section>

      {/* Events Status Filter Tabs (Spec #33, #34) */}
      <section className="section-spacing" style={{ background: 'var(--bg-secondary)', paddingTop: '0' }}>
        <div className="container">
          {/* Interactive 3D Spatial Event Arena */}
          <EventArenaHolodeck3D events={allEvents} />

          <EventsFilterView events={allEvents} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
