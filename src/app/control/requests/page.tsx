'use client';

import React, { useState, useEffect, Suspense } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import RequestDetailModal from '@/components/admin/RequestDetailModal';
import { StudentRequest, StudentStatus } from '@/lib/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Users, CheckCircle2, Clock, XCircle, RefreshCw, Layers, Award } from 'lucide-react';

function AdminRequestsContent() {
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [interestFilter, setInterestFilter] = useState('ALL');

  const [selectedRequest, setSelectedRequest] = useState<StudentRequest | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qStatus = searchParams.get('status');
    if (qStatus) {
      setStatusFilter(qStatus);
    }
  }, [searchParams]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== 'ALL') query.set('status', statusFilter);
      if (search) query.set('search', search);
      if (departmentFilter !== 'ALL') query.set('department', departmentFilter);
      if (yearFilter !== 'ALL') query.set('year', yearFilter);
      if (interestFilter !== 'ALL') query.set('interest', interestFilter);

      const res = await fetch(`/api/admin/requests?${query.toString()}`);
      if (res.status === 401) {
        router.push('/control/auth');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error('Error fetching student requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, departmentFilter, yearFilter, interestFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

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
        fetchRequests();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleRejectDirect = async (req: StudentRequest) => {
    if (!confirm(`Mark applicant ${req.full_name} as REJECTED? Student records cannot be deleted and will remain archived as Rejected.`)) {
      return;
    }
    await handleStatusChange(req.id, 'REJECTED');
  };

  const departments = [
    'Computer Science and Engineering',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Artificial Intelligence and Data Science',
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', 'Final Year'];

  const interestsList = [
    'AR',
    'VR',
    'MR',
    'XR',
    '3D Modelling',
    'Game Development',
    'Simulation',
    'Product Development',
    'Hackathons',
  ];

  // Aggregated Department distribution counts
  const deptCounts = departments.map((d) => ({
    name: d,
    short: d.split(' ')[0],
    count: requests.filter((r) => r.department === d).length,
  }));

  // Status counts
  const counts = {
    all: requests.length,
    new: requests.filter((r) => r.status === 'NEW').length,
    waiting: requests.filter((r) => r.status === 'WAITING').length,
    joined: requests.filter((r) => r.status === 'JOINED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminHeader
          title="Student Joining Requests"
          subtitle="Confidential review portal for new, waiting, and inducted student cohorts"
        />

        <div className="admin-content">
          {/* Interactive 2D Department & Cohort Telemetry (Fast & 100% 2D) */}
          <div
            className="admin-card"
            style={{
              padding: '20px',
              marginBottom: '24px',
              background: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="beacon-dot" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  COHORT_INTAKE // TELEMETRY & ACADEMIC DISTRIBUTION
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                TOTAL APPLICANTS: <strong>{requests.length}</strong>
              </div>
            </div>

            {/* Clickable Department Filters */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setDepartmentFilter('ALL')}
                className={`admin-btn admin-btn-sm ${departmentFilter === 'ALL' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                style={{ fontSize: '0.74rem', padding: '4px 12px' }}
              >
                All Departments ({requests.length})
              </button>
              {deptCounts.map((dc) => (
                <button
                  key={dc.name}
                  onClick={() => setDepartmentFilter(dc.name)}
                  className={`admin-btn admin-btn-sm ${departmentFilter === dc.name ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                  style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                >
                  <span>{dc.name}</span>
                  <span style={{ marginLeft: '4px', opacity: 0.75, fontWeight: 700 }}>({dc.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter Tabs (ALL, NEW, WAITING, JOINED, REJECTED) */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`admin-btn ${statusFilter === 'ALL' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            >
              ALL REQUESTS ({counts.all})
            </button>
            <button
              onClick={() => setStatusFilter('NEW')}
              className={`admin-btn ${statusFilter === 'NEW' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            >
              NEW ({counts.new})
            </button>
            <button
              onClick={() => setStatusFilter('WAITING')}
              className={`admin-btn ${statusFilter === 'WAITING' ? 'admin-btn-warning' : 'admin-btn-secondary'}`}
            >
              WAITING ({counts.waiting})
            </button>
            <button
              onClick={() => setStatusFilter('JOINED')}
              className={`admin-btn ${statusFilter === 'JOINED' ? 'admin-btn-success' : 'admin-btn-secondary'}`}
            >
              JOINED COE ({counts.joined})
            </button>
            <button
              onClick={() => setStatusFilter('REJECTED')}
              className={`admin-btn ${statusFilter === 'REJECTED' ? 'admin-btn-danger' : 'admin-btn-secondary'}`}
            >
              REJECTED ({counts.rejected})
            </button>
          </div>

          {/* Toolbar with Search and Filters */}
          <div className="admin-toolbar" style={{ borderRadius: '8px 8px 0 0' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                placeholder="Search by name, register number, email..."
                className="admin-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="admin-btn admin-btn-secondary admin-btn-sm">
                <Search size={14} />
                <span>Search</span>
              </button>
            </form>

            <select
              className="admin-filter-select"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              className="admin-filter-select"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="ALL">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <select
              className="admin-filter-select"
              value={interestFilter}
              onChange={(e) => setInterestFilter(e.target.value)}
            >
              <option value="ALL">All Interests</option>
              {interestsList.map((int) => (
                <option key={int} value={int}>{int}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={fetchRequests}
              className="admin-btn admin-btn-secondary admin-btn-sm"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Table Container */}
          <div className="admin-card" style={{ borderRadius: '0 0 8px 8px', borderTop: 'none' }}>
            <div className="admin-table-container">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Loading pipeline requests...
                </div>
              ) : requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                  No student requests match the current filters.
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Register No</th>
                      <th>Dept & Year</th>
                      <th>Interests</th>
                      <th>Experience</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          <div>{req.full_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)' }}>{req.email || req.college_email}</div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {req.register_number}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          <div>{req.department}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            {req.year} • Sec {req.section || 'A'}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {req.interests.slice(0, 3).map((item, i) => (
                              <span key={i} className="badge badge-blue">
                                {item}
                              </span>
                            ))}
                            {req.interests.length > 3 && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                                +{req.interests.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {req.experience_level}
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
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {new Date(req.submitted_at).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => setSelectedRequest(req)}
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                            >
                              Review
                            </button>
                            {req.status !== 'REJECTED' && (
                              <button
                                onClick={() => handleRejectDirect(req)}
                                className="admin-btn admin-btn-danger admin-btn-sm"
                                title="Reject Application (Cannot be deleted)"
                              >
                                <XCircle size={13} />
                                <span>Reject</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
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

export default function AdminRequestsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Loading student pipeline...
        </div>
      }
    >
      <AdminRequestsContent />
    </Suspense>
  );
}
