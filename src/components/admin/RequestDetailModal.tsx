'use client';

import React, { useState } from 'react';
import { StudentRequest, StudentStatus, RequestStatusConfig, ReviewChecklistItem } from '@/lib/types';
import { X, CheckCircle2, Clock, XCircle, Mail, Phone, Calendar, BookOpen, ShieldCheck, QrCode, ArrowUpRight, Sparkles, CheckSquare, Square, Check } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

const FALLBACK_MODAL_STATUSES: RequestStatusConfig[] = [
  { key: 'NEW', label: 'New Application', color: '#06b6d4', description: 'Newly received application awaiting review' },
  { key: 'UNDER_REVIEW', label: 'Under Review', color: '#818cf8', description: 'Faculty committee actively evaluating candidate' },
  { key: 'SHORTLISTED', label: 'Shortlisted', color: '#c084fc', description: 'Shortlisted for squad interviews or practical challenge' },
  { key: 'INTERVIEW', label: 'Interview Scheduled', color: '#ec4899', description: 'Candidate invited for lab walkthrough & technical briefing' },
  { key: 'WAITING', label: 'Priority Waitlist', color: '#f59e0b', description: 'Qualified candidate queued on standby' },
  { key: 'ON_HOLD', label: 'On Hold', color: '#eab308', description: 'Pending academic verification or additional portfolio items' },
  { key: 'JOINED', label: 'Joined / Inducted', color: '#10b981', description: 'Officially inducted into an active CoE laboratory squad' },
  { key: 'REJECTED', label: 'Archived / Rejected', color: '#ef4444', description: 'Candidate not selected for current intake cycle' },
];

const DEFAULT_MODAL_CHECKLIST: ReviewChecklistItem[] = [
  { id: 'chk-identity', label: 'College ID & Bonafide Status Verified', description: 'Cross-checked with institution ERP / registrar student records', required: true },
  { id: 'chk-portfolio', label: 'Technical Portfolio & Project Links Screened', description: 'Assessed prior experience with Unity, Unreal, Blender, Three.js, or WebXR', required: false },
  { id: 'chk-interview', label: 'Faculty / Squad Lead Interaction Completed', description: 'Assessed for motivation, problem-solving, and team collaboration fit', required: true },
  { id: 'chk-safety', label: 'XR Hardware Lab Safety & Hygiene Agreement Signed', description: 'Candidate acknowledged headset hygiene protocols and optics care', required: true },
  { id: 'chk-schedule', label: 'Lab Hours & Academic Timetable Clearance', description: 'Verified candidate availability for weekly laboratory sprint commitments', required: false },
];

interface RequestDetailModalProps {
  request: StudentRequest;
  onClose: () => void;
  onStatusChange: (
    id: string,
    newStatus: StudentStatus,
    notes?: string,
    notifyStudent?: boolean,
    emailNote?: string
  ) => Promise<void>;
  onPromoteInterest?: (id: string, targetStatus?: StudentStatus) => Promise<void>;
  statuses?: RequestStatusConfig[];
  checklistItems?: ReviewChecklistItem[];
  onRequestDelete?: (request: StudentRequest) => void;
}

export default function RequestDetailModal({
  request,
  onClose,
  onStatusChange,
  onPromoteInterest,
  statuses = [],
  checklistItems = [],
}: RequestDetailModalProps) {
  const [viewMode, setViewMode] = useState<'dossier' | 'keycard'>('dossier');
  const [internalNotes, setInternalNotes] = useState(request.internal_notes || '');
  const [selectedStatus, setSelectedStatus] = useState<StudentStatus>(request.status);
  const [savingNotes, setSavingNotes] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notesSavedMsg, setNotesSavedMsg] = useState(false);
  const [notifyStudent, setNotifyStudent] = useState(true);
  const [emailNote, setEmailNote] = useState('');

  // Checklist state
  const [checklistProgress, setChecklistProgress] = useState<Record<string, boolean>>(
    request.checklist_progress || {}
  );
  const [savingChecklist, setSavingChecklist] = useState(false);

  const effectiveStatuses = statuses && statuses.length > 0 ? statuses : FALLBACK_MODAL_STATUSES;
  const effectiveChecklist = checklistItems && checklistItems.length > 0 ? checklistItems : DEFAULT_MODAL_CHECKLIST;

  const currentStatusConfig = effectiveStatuses.find((s) => s.key === request.status);
  const completedChecklistCount = effectiveChecklist.filter((item) => checklistProgress[item.id]).length;
  const totalChecklistCount = effectiveChecklist.length;
  const checklistPercent = totalChecklistCount > 0 ? Math.round((completedChecklistCount / totalChecklistCount) * 100) : 0;

  const handleToggleChecklistItem = async (itemId: string) => {
    const updated = {
      ...checklistProgress,
      [itemId]: !checklistProgress[itemId],
    };
    setChecklistProgress(updated);
    try {
      setSavingChecklist(true);
      await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_checklist',
          id: request.id,
          checklist_progress: updated,
        }),
      });
    } catch (err) {
      console.error('Failed to update student checklist progress:', err);
    } finally {
      setSavingChecklist(false);
    }
  };

  const isInterestForm = request.form_type === 'INTEREST' || request.status === 'INTEREST';

  const handlePromote = async () => {
    if (!onPromoteInterest) return;
    setActionLoading(true);
    await onPromoteInterest(request.id, 'NEW');
    setActionLoading(false);
  };

  const handleApplyStatusChange = async (targetStatus: StudentStatus) => {
    setActionLoading(true);
    await onStatusChange(request.id, targetStatus, internalNotes, notifyStudent, emailNote);
    setSelectedStatus(targetStatus);
    setActionLoading(false);
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await onStatusChange(request.id, request.status, internalNotes, false);
    setSavingNotes(false);
    setNotesSavedMsg(true);
    setTimeout(() => setNotesSavedMsg(false), 2500);
  };

  const handleJoin = async () => {
    await handleApplyStatusChange('JOINED');
  };

  const handleWait = async () => {
    await handleApplyStatusChange('WAITING');
  };

  const handleReject = async () => {
    if (!confirm(`Are you sure you want to mark ${request.full_name}'s application as REJECTED? Student records cannot be deleted and will remain archived as Rejected.`)) {
      return;
    }
    await handleApplyStatusChange('REJECTED');
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 className="modal-title">{request.full_name}</h3>
              <span
                className={`badge ${
                  request.status === 'JOINED'
                    ? 'badge-green'
                    : request.status === 'WAITING'
                    ? 'badge-amber'
                    : request.status === 'REJECTED'
                    ? 'badge-danger'
                    : 'badge-cyan'
                }`}
                style={request.status === 'REJECTED' ? { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444' } : {}}
              >
                {request.status}
              </span>
              {isInterestForm && (
                <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#fde047', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                  INTEREST FORM
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              REG: {request.register_number} • {request.department} ({request.year}, Sec {request.section || 'N/A'})
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Expression of Interest Callout Banner */}
        {isInterestForm && (
          <div style={{ padding: '10px 16px', background: 'rgba(234, 179, 8, 0.1)', borderBottom: '1px solid rgba(234, 179, 8, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#fde047' }}>
              <Sparkles size={14} />
              <span>Received as <strong>Expression of Interest</strong> while registration intake was paused.</span>
            </div>
            <button
              type="button"
              onClick={handlePromote}
              disabled={actionLoading}
              className="admin-btn admin-btn-primary admin-btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 12px' }}
            >
              <ArrowUpRight size={13} />
              <span>Add to Requests (Promote)</span>
            </button>
          </div>
        )}

        {/* View Mode Switcher Tabs */}
        <div style={{ display: 'flex', gap: '8px', padding: '12px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-card-alt)' }}>
          <button
            type="button"
            onClick={() => {
              setViewMode('dossier');
              soundFx.playSpatialClick();
            }}
            className={`admin-btn admin-btn-sm ${viewMode === 'dossier' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <BookOpen size={14} />
            <span>Application Dossier</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode('keycard');
              soundFx.playSpatialClick();
            }}
            className={`admin-btn admin-btn-sm ${viewMode === 'keycard' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldCheck size={14} />
            <span>Digital Credentials Pass</span>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {viewMode === 'keycard' ? (
            /* Clean 2D Security Credentials Pass */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0' }}>
              <div
                style={{
                  width: '100%',
                  maxWidth: '460px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, var(--surface-card) 60%, rgba(124, 58, 237, 0.1) 100%)',
                  border: '1px solid var(--border-glass)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-card)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Watermark header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                      AR/VR CENTRE OF EXCELLENCE
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      RESEARCH SQUAD PASS // 2D VERIFIED
                    </div>
                  </div>
                  <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                    {request.status}
                  </span>
                </div>

                {/* Candidate name & department */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CANDIDATE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    {request.full_name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                    {request.department}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>REG NUMBER</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                      {request.register_number}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>EXPERIENCE</div>
                    <div style={{ fontSize: '0.88rem', color: '#ec4899', fontWeight: 700 }}>
                      {request.experience_level}
                    </div>
                  </div>
                </div>

                {/* Barcode & Security hash */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                    SECURITY TOKEN: 0x{Math.abs(request.full_name.length * 9437 + 1092).toString(16).toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                    <QrCode size={18} />
                    <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>6-DoF NFC</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Contact Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--surface-card-alt)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <Mail size={15} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                  <a href={`mailto:${request.email || request.college_email}`} style={{ color: 'var(--accent-blue)' }}>
                    {request.email || request.college_email}
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <Phone size={15} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-primary)' }}>{request.mobile_number}</span>
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="admin-field-label">AREAS OF INTEREST</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {request.interests.map((interest, i) => (
                    <span key={i} className="badge badge-blue">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience & Existing Skills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="admin-field-label">EXPERIENCE LEVEL</label>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {request.experience_level}
                  </div>
                </div>
                <div>
                  <label className="admin-field-label">EXISTING SKILLS</label>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    {request.existing_skills || 'None specified'}
                  </div>
                </div>
              </div>

              {/* Joining Motivation */}
              <div>
                <label className="admin-field-label">WHY THEY WANT TO JOIN</label>
                <div
                  style={{
                    background: 'var(--surface-card-alt)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '14px 16px',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {request.motivation}
                </div>
              </div>

              {/* Custom Form Field Responses */}
              {request.custom_field_responses && Object.keys(request.custom_field_responses).length > 0 && (
                <div>
                  <label className="admin-field-label">ADDITIONAL CUSTOM FORM RESPONSES</label>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      background: 'var(--surface-card-alt)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '14px 16px',
                    }}
                  >
                    {Object.entries(request.custom_field_responses).map(([key, val]) => (
                      <div key={key} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px', marginBottom: '4px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                          {key.replace(/^field_\d+_?/, '').replace(/_/g, ' ') || key}
                        </div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                          {val || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No answer provided</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <div>Submitted: {formatDate(request.submitted_at)}</div>
                {request.joined_at && (
                  <div style={{ color: '#10b981' }}>Inducted: {formatDate(request.joined_at)}</div>
                )}
              </div>

              {/* SECTION: CANDIDATE VERIFICATION & AUDIT CHECKLIST */}
              <div
                style={{
                  background: 'var(--surface-card-alt)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} style={{ color: 'var(--accent-cyan)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      VERIFICATION & AUDIT CHECKLIST
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {savingChecklist && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Saving...</span>
                    )}
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: checklistPercent === 100 ? '#10b981' : '#94a3b8',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {completedChecklistCount} / {totalChecklistCount} COMPLETED ({checklistPercent}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '14px' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${checklistPercent}%`,
                      background: checklistPercent === 100 ? '#10b981' : 'linear-gradient(90deg, #06b6d4, #3b82f6)',
                      transition: 'width 0.25s ease',
                    }}
                  />
                </div>

                {/* Checklist Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {effectiveChecklist.map((item) => {
                    const isChecked = Boolean(checklistProgress[item.id]);
                    return (
                      <label
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                          border: isChecked ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleChecklistItem(item.id)}
                          style={{
                            marginTop: '2px',
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            accentColor: '#10b981',
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '0.86rem',
                                fontWeight: isChecked ? 600 : 500,
                                color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)',
                              }}
                            >
                              {item.label}
                            </span>
                            {item.required && (
                              <span
                                style={{
                                  fontSize: '0.62rem',
                                  fontFamily: 'var(--font-mono)',
                                  color: '#f59e0b',
                                  background: 'rgba(245, 158, 11, 0.12)',
                                  border: '1px solid rgba(245, 158, 11, 0.3)',
                                  padding: '1px 6px',
                                  borderRadius: '3px',
                                  letterSpacing: '0.04em',
                                }}
                              >
                                REQUIRED
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                              {item.description}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Private Admin Internal Notes */}
              <div style={{ background: 'var(--surface-card-alt)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="admin-field-label" style={{ color: 'var(--accent-blue)', margin: 0 }}>
                    ADMIN INTERNAL NOTES (CONFIDENTIAL)
                  </label>
                  {notesSavedMsg && (
                    <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>✓ Note Saved</span>
                  )}
                </div>
                <textarea
                  className="admin-textarea"
                  placeholder="Private notes regarding student evaluation, interview batch, or cohort placement..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={3}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                  >
                    {savingNotes ? 'Saving...' : 'Save Internal Note'}
                  </button>
                </div>
              </div>

              {/* Student Automated Email Notification Section */}
              <div
                style={{
                  background: 'rgba(6, 182, 212, 0.05)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  borderRadius: '6px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      userSelect: 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={notifyStudent}
                      onChange={(e) => setNotifyStudent(e.target.checked)}
                      style={{ accentColor: 'var(--accent-cyan)', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span>Transmit automated status email to student</span>
                  </label>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--accent-cyan)',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(6, 182, 212, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {request.email || request.college_email}
                  </span>
                </div>

                {notifyStudent && (
                  <div style={{ marginTop: '12px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Optional Coordinator Note / Instructions (appended to student email):
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. Please report to the XR Lab on Monday at 4:00 PM with your laptop."
                      value={emailNote}
                      onChange={(e) => setEmailNote(e.target.value)}
                      style={{ fontSize: '0.82rem' }}
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: 'var(--accent-cyan)' }}>ℹ</span>
                      <span>An official branded HTML email using the configured template for the chosen status will be dispatched via SMTP.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION: WORKFLOW STATUS TRANSITION BUTTONS (Rendered as Buttons With Allotted Color Codes) */}
              <div
                style={{
                  background: 'var(--surface-card-alt)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="beacon-dot" style={{ background: currentStatusConfig?.color || '#06b6d4' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      CANDIDATE STATUS TRANSITIONS
                    </span>
                  </div>

                  {isInterestForm && (
                    <button
                      type="button"
                      onClick={handlePromote}
                      disabled={actionLoading}
                      className="admin-btn admin-btn-primary admin-btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
                    >
                      <ArrowUpRight size={14} />
                      <span>Promote to Active Requests</span>
                    </button>
                  )}
                </div>

                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Click any status button below to apply that status immediately. All statuses available in the admin panel are presented with their allotted color codes.
                </div>

                {/* Status Buttons Grid */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {effectiveStatuses.map((st) => {
                    const isActive = request.status === st.key;
                    return (
                      <button
                        key={st.key}
                        type="button"
                        disabled={actionLoading}
                        onClick={() => {
                          if (st.key === 'REJECTED') {
                            if (!confirm(`Mark ${request.full_name}'s application as REJECTED? Student records cannot be deleted and will remain archived.`)) return;
                          }
                          handleApplyStatusChange(st.key as StudentStatus);
                        }}
                        title={st.description || `Set candidate status to ${st.label}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          letterSpacing: '0.03em',
                          cursor: actionLoading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s ease',
                          border: `1.5px solid ${st.color}`,
                          background: isActive ? st.color : `${st.color}15`,
                          color: isActive ? '#000' : st.color,
                          boxShadow: isActive ? `0 0 16px ${st.color}55` : 'none',
                          transform: isActive ? 'scale(1.02)' : 'scale(1)',
                        }}
                      >
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: isActive ? '#000' : st.color,
                            display: 'inline-block',
                          }}
                        />
                        <span>{st.label}</span>
                        {isActive && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              padding: '1px 6px',
                              borderRadius: '3px',
                              background: 'rgba(0, 0, 0, 0.25)',
                              color: '#000',
                              fontWeight: 800,
                            }}
                          >
                            CURRENT
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Candidate ID: {request.id.slice(0, 12)}...
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="admin-btn admin-btn-secondary"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
