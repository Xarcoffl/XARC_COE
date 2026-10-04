import React from 'react';
import Link from 'next/link';
import { EventItem, EventStatus } from '@/lib/types';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';

interface EventCardProps {
  event: EventItem & { status?: EventStatus };
}

export default function EventCard({ event }: EventCardProps) {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'upcoming':
        return (
          <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span className="beacon-dot" style={{ background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
            UPCOMING
          </span>
        );
      case 'ongoing':
        return (
          <span className="badge badge-cyan" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span className="beacon-dot" />
            LIVE SPRINT
          </span>
        );
      case 'completed':
        return <span className="badge badge-blue">COMPLETED</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="glass-card hud-corner"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '0',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* Poster Image */}
      <div style={{ position: 'relative', width: '100%', height: '210px', overflow: 'hidden', background: 'var(--surface-card-alt)' }}>
        <img
          src={event.poster}
          alt={event.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="event-poster-img"
        />

        {/* Subtle Gradient Vignette */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '50%',
            background: 'linear-gradient(to top, rgba(7, 9, 26, 0.95), transparent)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'absolute', top: '14px', left: '14px', display: 'flex', gap: '8px', zIndex: 2 }}>
          {getStatusBadge(event.status)}
          <span className="badge badge-violet">{event.category}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--accent-cyan)', letterSpacing: '0.06em' }}>
            [SESSION // {event.category.toUpperCase()}]
          </span>
        </div>

        <h3
          style={{
            fontSize: '1.25rem',
            lineHeight: '1.3',
            marginBottom: '12px',
            color: 'var(--text-primary)',
            fontWeight: 700,
          }}
        >
          {event.title}
        </h3>

        {/* Date & Location */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>
              {formatDate(event.start_date)}
              {event.start_date !== event.end_date && ` – ${formatDate(event.end_date)}`}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={14} style={{ color: 'var(--accent-blue)' }} />
            <span>{event.time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={14} style={{ color: 'var(--accent-violet)' }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {event.venue}
            </span>
          </div>
        </div>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.88rem',
            lineHeight: '1.55',
            marginBottom: '20px',
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.short_desc}
        </p>

        {/* View Details Link */}
        <Link
          href={`/events/${event.slug}`}
          className="btn-outline"
          style={{ width: '100%', justifyContent: 'space-between', padding: '10px 18px' }}
        >
          <span>Event Intelligence</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
