'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EventItem, Project, Achievement, EventStatus } from '@/lib/types';
import ProjectCard from './ProjectCard';
import EventCard from './EventCard';
import { Trophy, ArrowRight, Users } from 'lucide-react';

interface FeaturedTabsProps {
  events: Array<EventItem & { status?: EventStatus }>;
  projects: Project[];
  achievements: Achievement[];
}

export default function FeaturedTabs({ events, projects, achievements }: FeaturedTabsProps) {
  const [activeTab, setActiveTab] = useState<'events' | 'projects' | 'achievements'>('events');

  return (
    <div>
      {/* Tab Switcher */}
      <div className="tab-list">
        <button
          onClick={() => setActiveTab('events')}
          className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
        >
          EVENTS ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
        >
          PROJECTS ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
        >
          ACHIEVEMENTS ({achievements.length})
        </button>
      </div>

      {/* Tab 1: Events */}
      {activeTab === 'events' && (
        <div>
          {events.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                No featured upcoming events at the moment. Explore our completed activities or check back soon.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                marginBottom: '32px',
              }}
            >
              {events.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <Link href="/events" className="btn-secondary">
              <span>View All Events</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Tab 2: Projects */}
      {activeTab === 'projects' && (
        <div>
          {projects.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                New projects are currently being prepared for showcase.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                marginBottom: '32px',
              }}
            >
              {projects.slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <Link href="/projects" className="btn-secondary">
              <span>View All Projects</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Tab 3: Achievements */}
      {activeTab === 'achievements' && (
        <div>
          {achievements.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                Milestones and student awards will appear here soon.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                marginBottom: '32px',
              }}
            >
              {achievements.slice(0, 3).map((ach) => (
                <div
                  key={ach.id}
                  className="glass-card hud-corner"
                  style={{
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <span className="badge badge-cyan">{ach.category}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        [YEAR // {ach.year}]
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', lineHeight: '1.35', marginBottom: '12px', color: 'var(--text-primary)', fontWeight: 700 }}>
                      {ach.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '20px' }}>
                      {ach.description}
                    </p>
                  </div>
                  <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                      <Users size={15} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                      <span style={{ fontWeight: 600 }}>{ach.student_team}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingLeft: '23px', marginTop: '3px' }}>
                      {ach.department}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <Link href="/achievements" className="btn-secondary">
              <span>View All Achievements</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
