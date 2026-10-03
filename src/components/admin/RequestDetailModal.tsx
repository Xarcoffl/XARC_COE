'use client';

import React, { useState } from 'react';
import { StudentRequest, StudentStatus } from '@/lib/types';
import { X, CheckCircle2, Clock, XCircle, Mail, Phone, Calendar, BookOpen, ShieldCheck, QrCode } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

interface RequestDetailModalProps {
  request: StudentRequest;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: StudentStatus, notes?: string) => Promise<void>;
  onRequestDelete?: (request: StudentRequest) => void;
}

export default function RequestDetailModal({
  request,
  onClose,
  onStatusChange,
}: RequestDetailModalProps) {
  const [viewMode, setViewMode] = useState<'dossier' | 'keycard'>('dossier');
  const [internalNotes, setInternalNotes] = useState(request.internal_notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notesSavedMsg, setNotesSavedMsg] = useState(false);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await onStatusChange(request.id, request.status, internalNotes);
    setSavingNotes(false);
    setNotesSavedMsg(true);
    setTimeout(() => setNotesSavedMsg(false), 2500);
  };

  const handleJoin = async () => {
    setActionLoading(true);
    await onStatusChange(request.id, 'JOINED', internalNotes);
    setActionLoading(false);
  };

  const handleWait = async () => {
    setActionLoading(true);
    await onStatusChange(request.id, 'WAITING', internalNotes);
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!confirm(`Are you sure you want to mark ${request.full_name}'s application as REJECTED? Student records cannot be deleted and will remain archived as Rejected.`)) {
      return;
    }
    setActionLoading(true);
    await onStatusChange(request.id, 'REJECTED', internalNotes);
    setActionLoading(false);
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
            </>
          )}
        </div>

        {/* Footer Actions: Join CoE, Keep Waiting, Reject Request (No Deletion) */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          {/* Reject Request button (Students cannot be deleted, only rejected) */}
          {request.status !== 'REJECTED' ? (
            <button
              type="button"
              onClick={handleReject}
              disabled={actionLoading}
              className="admin-btn admin-btn-danger"
              title="Mark Student Request as Rejected"
            >
              <XCircle size={15} />
              <span>Reject Request</span>
            </button>
          ) : (
            <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>
              Status: REJECTED (Archived)
            </span>
          )}

          {/* Status Transitions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {request.status !== 'WAITING' && request.status !== 'REJECTED' && (
              <button
                type="button"
                onClick={handleWait}
                disabled={actionLoading}
                className="admin-btn admin-btn-warning"
              >
                <Clock size={15} />
                <span>Keep Waiting</span>
              </button>
            )}

            {request.status !== 'JOINED' && (
              <button
                type="button"
                onClick={handleJoin}
                disabled={actionLoading}
                className="admin-btn admin-btn-success"
              >
                <CheckCircle2 size={15} />
                <span>Join CoE</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
