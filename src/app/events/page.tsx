import React from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import EventsFilterView from '@/components/public/EventsFilterView';
import { getPublicEvents } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EventsPage() {
  const allEvents = await getPublicEvents();

  return (
    <div className="public-layout-root" style={{ position: 'relative', overflowX: 'hidden' }}>
      <Navbar />

      {/* Hero Header */}
      <section style={{ paddingTop: 'calc(var(--header-height) + 32px)', paddingBottom: '16px' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div className="section-tag">COMMUNITY & TECHNICAL WORKSHOPS</div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', marginBottom: '14px', lineHeight: '1.1' }}>
              Events & <span className="text-gradient">Experiences</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.55', maxWidth: '640px', margin: '0 auto' }}>
              Engage with immersive workshops, national hackathons, technical bootcamps, and masterclasses led by industry pioneers.
            </p>
          </div>
        </div>
      </section>

      {/* Events Status Filter Tabs & List */}
      <section style={{ paddingTop: '8px', paddingBottom: '64px' }}>
        <div className="container">
          <EventsFilterView events={allEvents} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
