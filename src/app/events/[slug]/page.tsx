import React from 'react';
import { notFound } from 'next/navigation';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import EventCard from '@/components/public/EventCard';
import EventMediaInspector from '@/components/public/EventMediaInspector';
import { getPublicEventBySlug } from '@/lib/db';
import { ArrowLeft, Calendar, Clock, MapPin, ExternalLink, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const result = await getPublicEventBySlug(slug);
  if (!result) return { title: 'Event Not Found | AR/VR CoE' };

  return {
    title: `${result.event.title} | AR/VR CoE`,
    description: result.event.short_desc,
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const result = await getPublicEventBySlug(slug);

  if (!result) {
    notFound();
  }

  const { event, related } = result;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'upcoming': return <span className="badge badge-green">UPCOMING</span>;
      case 'ongoing': return <span className="badge badge-cyan">ONGOING NOW</span>;
      case 'completed': return <span className="badge badge-blue">COMPLETED</span>;
      default: return null;
    }
  };

  return (
    <div className="public-layout-root" style={{ position: 'relative', overflowX: 'hidden' }}>
      <Navbar />

      {/* 1. Poster / Hero (Fixed Event Template) */}
      <section className="hero-wrapper" style={{ minHeight: '60vh', paddingBottom: '32px' }}>
        <div className="container">
          <div style={{ marginBottom: '24px' }}>
            <Link
              href="/events"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--accent-cyan)',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <ArrowLeft size={16} />
              <span>BACK TO ALL EVENTS</span>
            </Link>
          </div>

          <div style={{ maxWidth: '880px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              {getStatusBadge(event.status)}
              <span className="badge badge-violet">{event.category}</span>
            </div>

            {/* 2. Event Name */}
            <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', lineHeight: '1.15', marginBottom: '20px' }}>
              {event.title}
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '28px' }}>
              {event.short_desc}
            </p>

            {/* Registration CTA if exists and upcoming/ongoing */}
            {event.registration_url && event.status !== 'completed' && (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ padding: '12px 28px', fontSize: '0.95rem' }}
              >
                <span>Register for Event</span>
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Main Event Content */}
      <section className="section-spacing" style={{ paddingTop: '0' }}>
        <div className="container">
          {/* 3D Spatial Arena / 2D Poster Switcher */}
          <EventMediaInspector
            poster={event.poster}
            title={event.title}
            category={event.category}
            status={event.status}
            startDate={event.start_date}
          />

          {/* 3. Date + Time + Venue */}
          <div
            className="glass-card"
            style={{
              padding: '28px 36px',
              marginBottom: '40px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'rgba(76, 125, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
                <Calendar size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Date Schedule
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formatDate(event.start_date)}
                  {event.start_date !== event.end_date && ` to ${formatDate(event.end_date)}`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'rgba(43, 217, 254, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                <Clock size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Session Timing
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {event.time}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'rgba(138, 99, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-violet)' }}>
                <MapPin size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Campus Venue
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {event.venue}
                </div>
              </div>
            </div>
          </div>

          {/* 4. About Event */}
          <div className="glass-card" style={{ padding: '36px', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--accent-cyan)' }}>
              About This Event
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7' }}>
              {event.full_desc}
            </p>
          </div>

          {/* 5. Event Highlights */}
          {event.highlights && event.highlights.length > 0 && (
            <div className="glass-card" style={{ padding: '36px', marginBottom: '40px' }}>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '20px' }}>Event Highlights & Schedule Keynotes</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {event.highlights.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--accent-cyan)', marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Gallery */}
          {event.gallery && event.gallery.length > 0 && (
            <div style={{ marginBottom: '48px' }}>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '20px' }}>Event Gallery</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {event.gallery.map((imgUrl, i) => (
                  <div
                    key={i}
                    style={{
                      height: '240px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: '1px solid rgba(76, 125, 255, 0.2)',
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`Event capture ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Related Events */}
          {related.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Other CoE Events</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {related.map((rel) => (
                  <EventCard key={rel.id} event={rel} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
