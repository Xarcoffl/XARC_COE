'use client';

import React, { useState, useMemo } from 'react';
import { EventItem, EventStatus } from '@/lib/types';
import EventCard from './EventCard';
import { Search, X, Calendar } from 'lucide-react';

interface EventsFilterViewProps {
  events: Array<EventItem & { status?: EventStatus }>;
}

export default function EventsFilterView({ events }: EventsFilterViewProps) {
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | 'ALL'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  const upcomingCount = events.filter((e) => e.status === 'upcoming').length;
  const ongoingCount = events.filter((e) => e.status === 'ongoing').length;
  const completedCount = events.filter((e) => e.status === 'completed').length;

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchStatus = selectedStatus === 'ALL' || e.status === selectedStatus;
      if (!matchStatus) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        (e.short_desc && e.short_desc.toLowerCase().includes(q)) ||
        (e.venue && e.venue.toLowerCase().includes(q))
      );
    });
  }, [events, selectedStatus, searchQuery]);

  return (
    <div>
      {/* Control Bar: Search + Status Tabs */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '420px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--accent-cyan)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{
                paddingLeft: '42px',
                paddingRight: searchQuery ? '36px' : '14px',
                paddingTop: '10px',
                paddingBottom: '10px',
                fontSize: '0.9rem',
              }}
              placeholder="Search events, workshops, hackathons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Telemetry Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span className="beacon-dot" />
            <span>
              STATUS: <strong style={{ color: 'var(--accent-cyan)' }}>{filtered.length}</strong> ACTIVE SESSIONS
            </span>
          </div>
        </div>

        {/* Status Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              marginRight: '6px',
            }}
          >
            <Calendar size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>CYCLE:</span>
          </div>

          <button
            onClick={() => setSelectedStatus('upcoming')}
            className={`tab-btn ${selectedStatus === 'upcoming' ? 'active' : ''}`}
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          >
            UPCOMING ({upcomingCount})
          </button>
          <button
            onClick={() => setSelectedStatus('ongoing')}
            className={`tab-btn ${selectedStatus === 'ongoing' ? 'active' : ''}`}
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          >
            ONGOING ({ongoingCount})
          </button>
          <button
            onClick={() => setSelectedStatus('completed')}
            className={`tab-btn ${selectedStatus === 'completed' ? 'active' : ''}`}
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          >
            COMPLETED ({completedCount})
          </button>
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`tab-btn ${selectedStatus === 'ALL' ? 'active' : ''}`}
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          >
            ALL EVENTS ({events.length})
          </button>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="glass-card hud-corner" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div className="tech-coord">SYS_EVENT: 0 ENTRIES DISPATCHED</div>
          <h4 style={{ fontSize: '1.3rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
            No events found matching your criteria.
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '20px' }}>
            Check back soon or explore our past completed sessions.
          </p>
          <button
            onClick={() => {
              setSelectedStatus('ALL');
              setSearchQuery('');
            }}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', padding: '8px 20px' }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
          }}
        >
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
