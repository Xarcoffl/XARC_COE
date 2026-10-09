'use client';

import React, { useState, useEffect, Suspense } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import RequestDetailModal from '@/components/admin/RequestDetailModal';
import ExportCsvModal from '@/components/admin/ExportCsvModal';
import VrDeviceLoader from '@/components/VrDeviceLoader';
import { StudentRequest, StudentStatus, RequestStatusConfig, ReviewChecklistItem } from '@/lib/types';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Layers,
  Award,
  Download,
  ToggleLeft,
  ToggleRight,
  ArrowUpRight,
  Sparkles,
  Filter,
  Eye,
} from 'lucide-react';

function AdminRequestsContent() {
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [interestFilter, setInterestFilter] = useState('ALL');

  // Dynamic server-computed counts & taxonomy
  const [counts, setCounts] = useState<{ all: number; interest: number; [key: string]: number }>({
    all: 0,
    interest: 0,
    NEW: 0,
    WAITING: 0,
    JOINED: 0,
    REJECTED: 0,
  });
  const [departments, setDepartments] = useState<string[]>([]);
  const [configuredStatuses, setConfiguredStatuses] = useState<RequestStatusConfig[]>([]);
  const [checklistItems, setChecklistItems] = useState<ReviewChecklistItem[]>([]);
  const [registrationOpen, setRegistrationOpen] = useState<boolean>(true);
  const [togglingReg, setTogglingReg] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchUpdating, setBatchUpdating] = useState(false);
  const [notifyBatchStudents, setNotifyBatchStudents] = useState(true);
  const [batchTargetStatus, setBatchTargetStatus] = useState<string>('JOINED');

  const [selectedRequest, setSelectedRequest] = useState<StudentRequest | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qStatus = searchParams.get('status');
    if (qStatus) {
      setStatusFilter(qStatus);
    }
  }, [searchParams]);

  const years = ['1st Year', '2nd Year', '3rd Year', 'Final Year'];
  const [interestsList, setInterestsList] = useState<string[]>([
    'AR',
    'VR',
    'MR',
    'XR',
    '3D Modelling',
    'Game Development',
    'Simulation',
    'Product Development',
    'UI/UX',
    'Research',
    'Hackathons',
    'Industry Projects',
    'Internships',
    'Certification',
    'Self-Learning',
    'Still Exploring',
  ]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter === 'INTEREST') {
        query.set('form_type', 'INTEREST');
      } else if (statusFilter !== 'ALL') {
        query.set('status', statusFilter);
      }

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
        setRequests(data.requests || []);
        if (data.counts) setCounts(data.counts);
        if (data.departments && data.departments.length > 0) setDepartments(data.departments);
        if (data.interests && data.interests.length > 0) setInterestsList(data.interests);
        if (data.statuses && data.statuses.length > 0) setConfiguredStatuses(data.statuses);
        if (data.checklist) setChecklistItems(data.checklist);
        if (data.registration_open !== undefined) setRegistrationOpen(data.registration_open);
      }
    } catch (err) {
      console.error('Error fetching student requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedIds([]);
    fetchRequests();
  }, [statusFilter, departmentFilter, yearFilter, interestFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (requests.length === 0) return;
    if (selectedIds.length === requests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(requests.map((r) => r.id));
    }
  };

  // Toggle public student intake ON / OFF
  const handleToggleRegistration = async () => {
    const nextState = !registrationOpen;
    const confirmMsg = nextState
      ? 'Enable public student registration? New submissions on /request will enter directly into the active applicant pool.'
      : 'Pause public student registration? When paused, student submissions will be recorded as Interest Forms and stored in the Interest Forms tab.';
    if (!confirm(confirmMsg)) return;

    setTogglingReg(true);
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_registration',
          registration_open: nextState,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRegistrationOpen(data.registration_open);
      } else {
        alert(data.message || 'Failed to update registration status.');
      }
    } catch {
      alert('Network failure updating registration toggle.');
    } finally {
      setTogglingReg(false);
    }
  };

  // Promote a single interest form into active requests
  const handlePromoteInterest = async (id: string, targetStatus: StudentStatus = 'NEW') => {
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'promote_interest',
          id,
          status: targetStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedRequest(null);
        fetchRequests();
      } else {
        alert(data.message || 'Failed to promote interest form.');
      }
    } catch {
      alert('Network error promoting interest form.');
    }
  };

  // Batch promote selected interest forms
  const handleBatchPromoteInterest = async (targetStatus: StudentStatus = 'NEW') => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Add ${selectedIds.length} selected applicant(s) from Interest Forms into active requests (${targetStatus})?`)) {
      return;
    }

    setBatchUpdating(true);
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'promote_interest',
          ids: selectedIds,
          status: targetStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedIds([]);
        fetchRequests();
      } else {
        alert(data.message || 'Failed to promote interest forms.');
      }
    } catch {
      alert('Network error promoting selected interest forms.');
    } finally {
      setBatchUpdating(false);
    }
  };

  // Update status for single request
  const handleStatusChange = async (
    id: string,
    newStatus: StudentStatus,
    internalNotes?: string,
    notifyStudent: boolean = true,
    emailNote?: string
  ) => {
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          internal_notes: internalNotes,
          notify_student: notifyStudent,
          email_note: emailNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedRequest(null);
        fetchRequests();
      } else {
        alert(data.message || 'Failed to update request.');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Batch update status for selected requests
  const handleBatchStatusChange = async (newStatus: StudentStatus) => {
    if (selectedIds.length === 0) return;
    if (newStatus === 'REJECTED') {
      if (!confirm(`Mark ${selectedIds.length} applicants as REJECTED? Student records cannot be deleted and will remain archived as Rejected.`)) {
        return;
      }
    } else {
      if (!confirm(`Update status of ${selectedIds.length} selected applicants to ${newStatus}?`)) {
        return;
      }
    }

    setBatchUpdating(true);
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          status: newStatus,
          notify_student: notifyBatchStudents,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedIds([]);
        fetchRequests();
      } else {
        alert(data.message || 'Failed to update requests.');
      }
    } catch (err) {
      console.error('Batch status update error:', err);
      alert('An error occurred during batch update.');
    } finally {
      setBatchUpdating(false);
    }
  };

  const handleRejectDirect = async (req: StudentRequest) => {
    if (!confirm(`Mark applicant ${req.full_name} as REJECTED? Student records cannot be deleted and will remain archived as Rejected.`)) {
      return;
    }
    await handleStatusChange(req.id, 'REJECTED');
  };

  const exportToCsv = () => {
    if (requests.length === 0) {
      alert('No student records to export.');
      return;
    }
    setIsCsvModalOpen(true);
  };

  // Helper to get status color badge
  const getStatusStyle = (statusKey: string) => {
    const config = configuredStatuses.find((c) => c.key === statusKey);
    if (config) {
      return {
        background: `${config.color}20`,
        color: config.color,
        border: `1px solid ${config.color}60`,
      };
    }
    if (statusKey === 'JOINED') return { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981' };
    if (statusKey === 'WAITING') return { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid #f59e0b' };
    if (statusKey === 'REJECTED') return { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444' };
    return { background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: '1px solid #06b6d4' };
  };

  const isViewingInterest = statusFilter === 'INTEREST';

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminHeader
          title="Student Joining Requests"
          subtitle="Confidential review portal for new, waiting, inducted, and interest applicant cohorts"
        />

        <div className="admin-content">
          {/* Top Operational Bar: Intake Switch & Overview Stats */}
          <div
            className="admin-card"
            style={{
              padding: '16px 20px',
              marginBottom: '20px',
              background: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            {/* Registration Intake Status & Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  className="beacon-dot"
                  style={{ background: registrationOpen ? '#10b981' : '#f59e0b' }}
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  PUBLIC INTAKE:
                </span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: registrationOpen ? '#10b981' : '#f59e0b',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: registrationOpen ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                    border: `1px solid ${registrationOpen ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  }}
                >
                  {registrationOpen ? '● OPEN (DIRECT APPLICATION)' : '○ PAUSED (INTEREST FORM ONLY)'}
                </span>
              </div>

              {/* Instant Toggle Button */}
              <button
                type="button"
                onClick={handleToggleRegistration}
                disabled={togglingReg}
                className="admin-btn admin-btn-sm admin-btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.76rem',
                  padding: '4px 12px',
                  borderColor: registrationOpen ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)',
                }}
                title={registrationOpen ? 'Click to Pause Registration' : 'Click to Open Registration'}
              >
                {registrationOpen ? (
                  <>
                    <ToggleRight size={16} color="#10b981" />
                    <span>Pause Registration</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft size={16} color="#f59e0b" />
                    <span>Enable Registration</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Summary Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>ACTIVE APPLICANTS: </span>
                <strong style={{ color: 'var(--accent-cyan)' }}>{counts.all || 0}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>INTEREST POOL: </span>
                <strong style={{ color: '#f59e0b' }}>{counts.interest || 0}</strong>
              </div>
            </div>
          </div>

          {/* Dynamic Status Tabs (Including Interest Forms Tab) */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {/* ALL REQUESTS */}
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`admin-btn ${statusFilter === 'ALL' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '6px 14px' }}
            >
              ALL REQUESTS ({counts.all || 0})
            </button>

            {/* DYNAMIC CONFIGURED STATUS TABS */}
            {configuredStatuses.map((st) => {
              const countVal = counts[st.key] || 0;
              const isActive = statusFilter === st.key;
              return (
                <button
                  key={st.key}
                  onClick={() => setStatusFilter(st.key)}
                  className={`admin-btn ${isActive ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                  style={{
                    fontSize: '0.78rem',
                    padding: '6px 14px',
                    borderColor: isActive ? st.color : undefined,
                    boxShadow: isActive ? `0 0 10px ${st.color}40` : undefined,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: st.color,
                      marginRight: '6px',
                    }}
                  />
                  <span>{st.label.toUpperCase()}</span>
                  <span style={{ marginLeft: '6px', fontWeight: 700, opacity: 0.9 }}>
                    ({countVal})
                  </span>
                </button>
              );
            })}

            {/* DEDICATED INTEREST FORMS TAB */}
            <button
              onClick={() => setStatusFilter('INTEREST')}
              className={`admin-btn ${isViewingInterest ? 'admin-btn-warning' : 'admin-btn-secondary'}`}
              style={{
                fontSize: '0.78rem',
                padding: '6px 14px',
                borderColor: isViewingInterest ? '#f59e0b' : 'rgba(245, 158, 11, 0.4)',
                background: isViewingInterest ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.05)',
                color: isViewingInterest ? '#fff' : '#f59e0b',
              }}
            >
              <Sparkles size={13} style={{ marginRight: '6px' }} />
              <span>INTEREST FORMS</span>
              <span
                style={{
                  marginLeft: '6px',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: isViewingInterest ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)',
                  color: isViewingInterest ? '#000' : '#f59e0b',
                }}
              >
                {counts.interest || 0}
              </span>
            </button>
          </div>

          {/* Batch Status Action Bar */}
          {selectedIds.length > 0 && (
            <div
              className="admin-card"
              style={{
                marginBottom: '16px',
                padding: '14px 20px',
                background: 'rgba(37, 99, 235, 0.12)',
                border: '1px solid #2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="beacon-dot" style={{ background: '#3b82f6' }} />
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  {selectedIds.length} applicant{selectedIds.length > 1 ? 's' : ''} selected
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                >
                  Clear Selection
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Interest pool promotion action */}
                {isViewingInterest ? (
                  <button
                    type="button"
                    onClick={() => handleBatchPromoteInterest('NEW')}
                    className="admin-btn admin-btn-primary admin-btn-sm"
                    disabled={batchUpdating}
                    style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
                  >
                    <ArrowUpRight size={14} />
                    <span>Add Selected to Requests ({selectedIds.length})</span>
                  </button>
                ) : (
                  <>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.78rem',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        userSelect: 'none',
                        padding: '4px 8px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        borderRadius: '4px',
                        border: '1px solid var(--border-subtle)',
                        marginRight: '4px',
                      }}
                      title="Send automated notification emails to applicants on batch status update"
                    >
                      <input
                        type="checkbox"
                        checked={notifyBatchStudents}
                        onChange={(e) => setNotifyBatchStudents(e.target.checked)}
                        style={{ cursor: 'pointer', accentColor: '#2563eb' }}
                      />
                      <span>Email ({selectedIds.length})</span>
                    </label>

                    {/* Dynamic Batch Status Selector */}
                    {configuredStatuses.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <select
                          className="admin-filter-select"
                          value={batchTargetStatus}
                          onChange={(e) => setBatchTargetStatus(e.target.value)}
                          style={{ fontSize: '0.78rem', padding: '4px 8px', height: '30px' }}
                        >
                          {configuredStatuses.map((st) => (
                            <option key={st.key} value={st.key}>
                              Set to: {st.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleBatchStatusChange(batchTargetStatus as StudentStatus)}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          disabled={batchUpdating}
                        >
                          Apply Status
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleBatchStatusChange('JOINED')}
                      className="admin-btn admin-btn-success admin-btn-sm"
                      disabled={batchUpdating}
                    >
                      <CheckCircle2 size={13} />
                      <span>Induct ({selectedIds.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBatchStatusChange('REJECTED')}
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      disabled={batchUpdating}
                    >
                      <XCircle size={13} />
                      <span>Reject ({selectedIds.length})</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={exportToCsv}
                  className="admin-btn admin-btn-primary admin-btn-sm"
                  title="Export selected applicants to CSV"
                >
                  <Download size={13} />
                  <span>Export ({selectedIds.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* Toolbar with Search, Dynamic Departments Filter, Years, Interests, and CSV Export */}
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

            {/* Dynamically populated Department filter including all disciplines from request content */}
            <select
              className="admin-filter-select"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{ maxWidth: '280px' }}
            >
              <option value="ALL">All Departments ({departments.length})</option>
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
              <option value="ALL">All Interests ({interestsList.length})</option>
              {interestsList.map((int) => (
                <option key={int} value={int}>{int}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={exportToCsv}
              className="admin-btn admin-btn-primary admin-btn-sm"
              title="Configure custom fields and export roster as CSV"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} />
              <span>Export Roster (CSV)</span>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  fontFamily: 'var(--font-mono, monospace)',
                  letterSpacing: '0.02em',
                }}
              >
                Custom Fields
              </span>
            </button>

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
                <VrDeviceLoader
                  mode="card"
                  title="RETRIEVING STUDENT PIPELINE..."
                  subtext="Streaming applicant dossiers, disciplines, and review statuses from central registry"
                  badge="STUDENT REGISTRY SYNC"
                />
              ) : requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                  {isViewingInterest
                    ? 'No Expression of Interest forms logged. Students who submit when registration is paused will appear here.'
                    : 'No student requests match the current filters.'}
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          aria-label="Select all students"
                          checked={requests.length > 0 && selectedIds.length === requests.length}
                          onChange={handleSelectAll}
                          style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#2563eb' }}
                        />
                      </th>
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
                    {requests.map((req) => {
                      const isItemInterest = req.form_type === 'INTEREST' || req.status === 'INTEREST';
                      return (
                        <tr
                          key={req.id}
                          style={selectedIds.includes(req.id) ? { background: 'rgba(37, 99, 235, 0.08)' } : {}}
                        >
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              aria-label={`Select ${req.full_name}`}
                              checked={selectedIds.includes(req.id)}
                              onChange={() => handleToggleSelect(req.id)}
                              style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#2563eb' }}
                            />
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            <div>{req.full_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)' }}>
                              {req.email || req.college_email}
                            </div>
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
                              className="badge"
                              style={getStatusStyle(req.status)}
                            >
                              {req.status}
                            </span>
                            {isItemInterest && (
                              <span
                                style={{
                                  display: 'block',
                                  fontSize: '0.68rem',
                                  color: '#f59e0b',
                                  fontFamily: 'var(--font-mono)',
                                  marginTop: '2px',
                                }}
                              >
                                INTEREST FORM
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} suppressHydrationWarning>
                            {new Date(req.submitted_at).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedRequest(req)}
                                className="admin-btn admin-btn-primary admin-btn-sm"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px' }}
                              >
                                <Eye size={13} />
                                <span>Review</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
          statuses={configuredStatuses}
          checklistItems={checklistItems}
          onClose={() => {
            setSelectedRequest(null);
            fetchRequests();
          }}
          onStatusChange={handleStatusChange}
          onPromoteInterest={handlePromoteInterest}
        />
      )}
      {/* Batch Operation Progress Overlay */}
      {batchUpdating && (
        <VrDeviceLoader
          mode="fullscreen"
          title="EXECUTING BATCH PIPELINE OPERATION..."
          subtext={`Applying status changes and sending email notifications to ${selectedIds.length} candidate(s)...`}
          badge="BATCH ACTION DISPATCH"
        />
      )}

      {/* Custom Fields CSV Export Modal */}
      <ExportCsvModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        requests={requests}
        selectedIds={selectedIds}
        statusFilter={statusFilter}
      />
    </div>
  );
}

export default function AdminRequestsPage() {
  return (
    <Suspense
      fallback={
        <VrDeviceLoader
          mode="fullscreen"
          title="CONNECTING TO STUDENT PIPELINE..."
          subtext="Loading admissions records and taxonomy filters..."
          badge="STUDENT TELEMETRY"
        />
      }
    >
      <AdminRequestsContent />
    </Suspense>
  );
}
