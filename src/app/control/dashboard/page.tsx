'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import RequestDetailModal from '@/components/admin/RequestDetailModal';
import { StudentRequest, EventItem, StudentStatus } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Clock,
  UserCheck,
  Calendar,
  FolderGit2,
  Trophy,
  ArrowRight,
  Activity,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<StudentRequest | null>(null);
  const router = useRouter();

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.status === 401) {
        router.push('/control/auth');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleStatusChange = async (id: string, newStatus: StudentStatus, internalNotes?: string) => {
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, internal_notes: internalNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedRequest(null);
        fetchStats();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminHeader title="Executive Overview" subtitle="Operational health, joining pipelines, and content inventory" />

        <div className="admin-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              Loading operational metrics...
            </div>
          ) : stats ? (
            <>
              {/* High-Performance 2D Telemetry & Operations HUD (100% 2D) */}
              <div
                className="admin-card"
                style={{
                  padding: '22px 24px',
                  marginBottom: '24px',
                  background: 'linear-gradient(135deg, var(--surface-card) 0%, var(--surface-card-alt) 100%)',
                  border: '1px solid var(--border-glass)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(14, 165, 233, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                      <Activity size={20} />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        OPERATIONAL TELEMETRY CORE
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                        SYSTEM NODE // 100% HEALTHY • 0 UNRESOLVED ALERTS
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="beacon-dot" />
                      <span>LIVE DISPATCH</span>
                    </span>
                    <span className="badge badge-cyan">AUTONOMOUS SYNC</span>
                  </div>
                </div>

                {/* Live System Specs Bar */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px',
                    padding: '14px',
                    background: 'var(--surface-card-alt)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>NODE STATUS</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981' }}>OPERATIONAL</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>NEW PIPELINE INTAKE</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {stats.counts.new_requests} PENDING
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ACTIVE SQUAD CAPACITY</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                      {stats.counts.joined_requests} ENROLLED
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>EVENT SCHEDULE</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#a855f7' }}>
                      {stats.counts.total_events} PUBLISHED
                    </div>
                  </div>
                </div>
              </div>

              {/* Top 6 KPI Cards */}
              <div className="admin-kpi-grid">
                <Link href="/control/requests?status=NEW" style={{ textDecoration: 'none' }}>
                  <div className="admin-kpi-card" style={{ borderLeft: '4px solid #38bdf8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="admin-kpi-label">NEW REQUESTS</span>
                      <Users size={16} style={{ color: '#38bdf8' }} />
                    </div>
                    <div className="admin-kpi-value" style={{ color: '#38bdf8' }}>
                      {stats.counts.new_requests}
                    </div>
                    <div className="admin-kpi-desc">Pending initial review</div>
                  </div>
                </Link>

                <Link href="/control/requests?status=WAITING" style={{ textDecoration: 'none' }}>
                  <div className="admin-kpi-card" style={{ borderLeft: '4px solid #fbbf24' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="admin-kpi-label">WAITING</span>
                      <Clock size={16} style={{ color: '#fbbf24' }} />
                    </div>
                    <div className="admin-kpi-value" style={{ color: '#fbbf24' }}>
                      {stats.counts.waiting_requests}
                    </div>
                    <div className="admin-kpi-desc">In orientation queue</div>
                  </div>
                </Link>

                <Link href="/control/requests?status=JOINED" style={{ textDecoration: 'none' }}>
                  <div className="admin-kpi-card" style={{ borderLeft: '4px solid #4ade80' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="admin-kpi-label">JOINED</span>
                      <UserCheck size={16} style={{ color: '#4ade80' }} />
                    </div>
                    <div className="admin-kpi-value" style={{ color: '#4ade80' }}>
                      {stats.counts.joined_requests}
                    </div>
                    <div className="admin-kpi-desc">Active cohort members</div>
                  </div>
                </Link>

                <Link href="/control/events" style={{ textDecoration: 'none' }}>
                  <div className="admin-kpi-card" style={{ borderLeft: '4px solid #818cf8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="admin-kpi-label">EVENTS</span>
                      <Calendar size={16} style={{ color: '#818cf8' }} />
                    </div>
                    <div className="admin-kpi-value">{stats.counts.total_events}</div>
                    <div className="admin-kpi-desc">Workshops & sprints</div>
                  </div>
                </Link>

                <Link href="/control/projects" style={{ textDecoration: 'none' }}>
                  <div className="admin-kpi-card" style={{ borderLeft: '4px solid #60a5fa' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="admin-kpi-label">PROJECTS</span>
                      <FolderGit2 size={16} style={{ color: '#60a5fa' }} />
                    </div>
                    <div className="admin-kpi-value">{stats.counts.total_projects}</div>
                    <div className="admin-kpi-desc">Hardware/software prototypes</div>
                  </div>
                </Link>

                <Link href="/control/achievements" style={{ textDecoration: 'none' }}>
                  <div className="admin-kpi-card" style={{ borderLeft: '4px solid #c084fc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="admin-kpi-label">ACHIEVEMENTS</span>
                      <Trophy size={16} style={{ color: '#c084fc' }} />
                    </div>
                    <div className="admin-kpi-value">{stats.counts.total_achievements}</div>
                    <div className="admin-kpi-desc">Awards & publications</div>
                  </div>
                </Link>
              </div>

              {/* Recent Requests Section */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Recent Student Joining Requests</h3>
                  <Link href="/control/requests" className="admin-btn admin-btn-secondary admin-btn-sm">
                    <span>View All Requests</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Reg Number</th>
                        <th>Department</th>
                        <th>Year</th>
                        <th>Interests</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent_requests.map((req: StudentRequest) => (
                        <tr key={req.id}>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.full_name}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {req.register_number}
                          </td>
                          <td>{req.department}</td>
                          <td>{req.year}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {req.interests.slice(0, 2).map((item, i) => (
                                <span key={i} className="badge badge-blue">
                                  {item}
                                </span>
                              ))}
                              {req.interests.length > 2 && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                  +{req.interests.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                req.status === 'JOINED'
                                  ? 'badge-green'
                                  : req.status === 'WAITING'
                                  ? 'badge-amber'
                                  : req.status === 'REJECTED'
                                  ? 'badge-danger'
                                  : 'badge-cyan'
                              }`}
                              style={req.status === 'REJECTED' ? { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444' } : {}}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => setSelectedRequest(req)}
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Upcoming Events Section */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Active & Upcoming Events</h3>
                  <Link href="/control/events" className="admin-btn admin-btn-secondary admin-btn-sm">
                    <span>Manage Events</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Event Title</th>
                        <th>Category</th>
                        <th>Dates</th>
                        <th>Venue</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.upcoming_events.map((ev: EventItem & { status?: string }) => (
                        <tr key={ev.id}>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ev.title}</td>
                          <td>
                            <span className="badge badge-violet">{ev.category}</span>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {ev.start_date}
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{ev.venue}</td>
                          <td>
                            <span className={`badge ${ev.status === 'ongoing' ? 'badge-cyan' : 'badge-green'}`}>
                              {ev.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </main>

      {/* Review Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
