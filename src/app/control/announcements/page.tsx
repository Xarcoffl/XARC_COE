'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import VrDeviceLoader from '@/components/VrDeviceLoader';
import { StudentRequest, EmailLog, CustomStudentGroup } from '@/lib/types';
import {
  Send,
  Users,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Sparkles,
  Mail,
  Clock,
  History,
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Search,
  Check,
  X,
  MessageSquare,
  Share2,
  CheckSquare,
  Square,
} from 'lucide-react';

const PRESETS = [
  {
    title: 'Orientation & Onboarding',
    badge: 'COHORT ONBOARDING',
    subject: 'Hardware Orientation this Thursday at 4 PM in Lab 302',
    headline: 'Welcome to the Spatial Computing Cohort',
    message:
      'We are excited to welcome you to the AR/VR Centre of Excellence! Please attend the hardware onboarding session this Thursday at 4:00 PM in Lab 302 (COE Annex).\n\nPlease bring your college ID and a laptop configured with Unity 6 or Blender 4.3 if available. Spatial headsets and dev-kits will be allocated during this session.',
  },
  {
    title: 'Hackathon & Challenge',
    badge: 'COMPETITION ALERT',
    subject: 'Spatial Computing Innovation Challenge 2026 - Registration Open',
    headline: 'Build the Future of Spatial Computing',
    message:
      'Registrations are now open for the Annual Spatial Computing Hackathon! Form squads of 2-4 students to prototype VisionOS, Quest 3, and WebXR applications.\n\nKey dates:\n- Problem statements announced: Next Monday\n- Prototype submission deadline: 2 weeks\n- Top 3 teams receive lab sponsorships and fast-track incubation.',
  },
  {
    title: 'Lab Maintenance & Equipment',
    badge: 'LAB OPERATIONS',
    subject: 'AR/VR Lab Hardware Calibration & Maintenance Window',
    headline: 'Scheduled Lab Systems Upgrade',
    message:
      'The AR/VR Lab will undergo scheduled hardware calibration and firmware upgrades this Saturday between 10:00 AM and 2:00 PM.\n\nAll headset booking slots during this window are postponed. Lab access resumes as normal on Sunday morning.',
  },
];

export default function AnnouncementsPage() {
  const [audience, setAudience] = useState<string>('JOINED');
  const [department, setDepartment] = useState('ALL');
  const [subject, setSubject] = useState(PRESETS[0].subject);
  const [badge, setBadge] = useState(PRESETS[0].badge);
  const [headline, setHeadline] = useState(PRESETS[0].headline);
  const [message, setMessage] = useState(PRESETS[0].message);

  const [students, setStudents] = useState<StudentRequest[]>([]);
  const [recentLogs, setRecentLogs] = useState<EmailLog[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [departmentsList, setDepartmentsList] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  // Custom Student Groups State (WhatsApp-Style Status Broadcast Lists)
  const [customGroups, setCustomGroups] = useState<CustomStudentGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [groupDescInput, setGroupDescInput] = useState('');
  const [groupColorInput, setGroupColorInput] = useState('#25D366');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [groupFilterDept, setGroupFilterDept] = useState('ALL');
  const [groupFilterStatus, setGroupFilterStatus] = useState('ALL');
  const [groupModalTab, setGroupModalTab] = useState<'create' | 'list'>('create');
  const [savingGroup, setSavingGroup] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchRecentLogs();
    fetchCustomGroups();
  }, []);

  const fetchCustomGroups = async () => {
    try {
      setLoadingGroups(true);
      const res = await fetch('/api/admin/groups');
      const data = await res.json();
      if (data.success && Array.isArray(data.groups)) {
        setCustomGroups(data.groups);
      }
    } catch {
      console.error('Failed to load custom groups');
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await fetch('/api/admin/requests');
      const data = await res.json();
      if (data.success && Array.isArray(data.requests)) {
        setStudents(data.requests);
        const depts = Array.from(new Set(data.requests.map((r: StudentRequest) => r.department).filter(Boolean))) as string[];
        setDepartmentsList(depts);
      }
    } catch {
      console.error('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchRecentLogs = async () => {
    try {
      const res = await fetch('/api/admin/email/logs?limit=5');
      const data = await res.json();
      if (data.success) {
        setRecentLogs(data.logs || []);
      }
    } catch {
      console.error('Failed to load logs');
    }
  };

  const matchingStudents = students.filter((s) => {
    let matchesAudience = false;
    if (audience.startsWith('GROUP:')) {
      const groupId = audience.replace('GROUP:', '');
      const group = customGroups.find((g) => g.id === groupId);
      matchesAudience = Boolean(group && Array.isArray(group.student_ids) && group.student_ids.includes(s.id));
    } else if (audience === 'ALL') {
      matchesAudience = true;
    } else {
      matchesAudience = s.status === audience;
    }
    const matchesDept = department === 'ALL' || s.department.toLowerCase() === department.toLowerCase();
    return matchesAudience && matchesDept;
  });

  const selectedGroup = audience.startsWith('GROUP:')
    ? customGroups.find((g) => g.id === audience.replace('GROUP:', ''))
    : null;

  const handleApplyPreset = (p: typeof PRESETS[0]) => {
    setSubject(p.subject);
    setBadge(p.badge);
    setHeadline(p.headline);
    setMessage(p.message);
  };

  const handleOpenCreateGroup = () => {
    setEditingGroupId(null);
    setGroupNameInput('');
    setGroupDescInput('');
    setGroupColorInput('#25D366');
    setSelectedStudentIds([]);
    setStudentSearchTerm('');
    setGroupFilterDept('ALL');
    setGroupFilterStatus('ALL');
    setGroupModalTab('create');
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroup = (grp: CustomStudentGroup) => {
    setEditingGroupId(grp.id);
    setGroupNameInput(grp.name);
    setGroupDescInput(grp.description || '');
    setGroupColorInput(grp.color || '#25D366');
    setSelectedStudentIds(grp.student_ids || []);
    setStudentSearchTerm('');
    setGroupFilterDept('ALL');
    setGroupFilterStatus('ALL');
    setGroupModalTab('create');
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async () => {
    const cleanName = groupNameInput.trim();
    if (!cleanName) {
      alert('Group name is required.');
      return;
    }
    setSavingGroup(true);
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingGroupId || undefined,
          name: cleanName,
          description: groupDescInput.trim(),
          color: groupColorInput,
          student_ids: selectedStudentIds,
        }),
      });
      const data = await res.json();
      if (data.success && data.group) {
        await fetchCustomGroups();
        setAudience(`GROUP:${data.group.id}`);
        setIsGroupModalOpen(false);
        setMsg({
          text: `WhatsApp-style broadcast group "${data.group.name}" saved with ${selectedStudentIds.length} students and set as audience.`,
          type: 'success',
        });
        setTimeout(() => setMsg(null), 4000);
      } else {
        alert(data.message || 'Failed to save group.');
      }
    } catch {
      alert('Network error saving group.');
    } finally {
      setSavingGroup(false);
    }
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`Delete broadcast group "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/groups?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await fetchCustomGroups();
        if (audience === `GROUP:${id}`) {
          setAudience('JOINED');
        }
        setMsg({ text: `Broadcast group "${name}" removed.`, type: 'success' });
        setTimeout(() => setMsg(null), 3000);
      } else {
        alert(data.message || 'Failed to delete group.');
      }
    } catch {
      alert('Network error deleting group.');
    }
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = (ids: string[]) => {
    setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const deselectAllFiltered = (ids: string[]) => {
    setSelectedStudentIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const handleBroadcast = async () => {
    if (!subject.trim() || !headline.trim() || !message.trim()) {
      setMsg({ text: 'Please fill out the subject, headline, and announcement message.', type: 'error' });
      return;
    }

    if (matchingStudents.length === 0) {
      setMsg({ text: 'No students match your selected audience filter.', type: 'error' });
      return;
    }

    setSending(true);
    setShowConfirm(false);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/email/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audience,
          target_status: audience,
          target_group_id: audience.startsWith('GROUP:') ? audience.replace('GROUP:', '') : undefined,
          target_department: department === 'ALL' ? undefined : department,
          department: department === 'ALL' ? undefined : department,
          subject,
          badge,
          headline,
          message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({
          text: data.message || `Broadcast transmitted! Sent: ${data.sentCount} | Failed: ${data.failedCount || 0} out of ${data.recipientCount} recipients.`,
          type: 'success',
        });
        fetchRecentLogs();
      } else {
        setMsg({ text: data.message || 'Broadcast dispatch failed.', type: 'error' });
      }
    } catch {
      setMsg({ text: 'Network error broadcasting announcement.', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminHeader
          title="Cohort Broadcast & Announcements Studio"
          subtitle="Dispatch mass communications, lab briefings, and orientation alerts to active recruits and candidate pools"
        />

        <div className="admin-content" style={{ maxWidth: '1440px' }}>
          {sending && (
            <VrDeviceLoader
              mode="fullscreen"
              title="TRANSMITTING SPATIAL EMAIL BROADCAST..."
              subtext={`Broadcasting notification to ${matchingStudents.length} candidate(s) via SMTP gateway...`}
              badge="BROADCAST GATEWAY"
            />
          )}

          {savingGroup && (
            <VrDeviceLoader
              mode="fullscreen"
              title="COMMITTING BROADCAST GROUP..."
              subtext={`Registering WhatsApp-style student cohort "${groupNameInput}" in registry...`}
              badge="COHORT REGISTRY"
            />
          )}
          {msg && (
            <div
              style={{
                background: msg.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${msg.type === 'success' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                borderRadius: '8px',
                padding: '12px 18px',
                color: msg.type === 'success' ? '#86efac' : '#fca5a5',
                fontSize: '0.9rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{msg.text}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(450px, 1.15fr) minmax(400px, 1fr)', gap: '24px', alignItems: 'start' }}>
            {/* LEFT COLUMN: COMPOSER & TARGETING */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* TARGETING FILTER CARD */}
              <div className="admin-card">
                <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="admin-card-title">01 // AUDIENCE TARGETING MATRIX</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={14} style={{ color: 'var(--accent-cyan)' }} />
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--accent-cyan)',
                        fontFamily: 'var(--font-mono)',
                        background: 'rgba(6, 182, 212, 0.12)',
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}
                    >
                      {loadingStudents ? 'Counting...' : `${matchingStudents.length} Active Targets`}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label className="admin-field-label" style={{ margin: 0 }}>Student Status Segment</label>
                        <button
                          type="button"
                          onClick={handleOpenCreateGroup}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(37, 211, 102, 0.12)',
                            border: '1px solid rgba(37, 211, 102, 0.35)',
                            color: '#25D366',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          title="Create WhatsApp-style broadcast groups with custom student selections"
                        >
                          <Plus size={11} />
                          <span>Custom Groups ({customGroups.length})</span>
                        </button>
                      </div>

                      <select
                        className="admin-select"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                      >
                        <optgroup label="PIPELINE STATUS SEGMENTS">
                          <option value="JOINED">JOINED Cohort (Accepted Active Recruits)</option>
                          <option value="WAITING">WAITING Pool (Shortlisted Candidates)</option>
                          <option value="NEW">NEW Applications (Pending Review)</option>
                          <option value="UNDER_REVIEW">UNDER REVIEW (Faculty Evaluation)</option>
                          <option value="SHORTLISTED">SHORTLISTED (Squad Candidates)</option>
                          <option value="ALL">ALL Registered Applicants (Broad Blast)</option>
                        </optgroup>
                        {customGroups.length > 0 && (
                          <optgroup label="CUSTOM STUDENT GROUPS (WHATSAPP STATUS STYLE)">
                            {customGroups.map((g) => (
                              <option key={g.id} value={`GROUP:${g.id}`}>
                                {g.name} ({g.student_ids?.length || 0} students)
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>

                      {/* Active Custom Group Banner */}
                      {selectedGroup && (
                        <div
                          style={{
                            marginTop: '8px',
                            padding: '8px 12px',
                            background: 'rgba(37, 211, 102, 0.08)',
                            border: '1px solid rgba(37, 211, 102, 0.25)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.74rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: selectedGroup.color || '#25D366',
                                boxShadow: `0 0 8px ${selectedGroup.color || '#25D366'}`,
                                flexShrink: 0,
                              }}
                            />
                            <div>
                              <span style={{ fontWeight: 700, color: '#25D366' }}>{selectedGroup.name}</span>
                              <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>
                                • {selectedGroup.student_ids?.length || 0} students
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEditGroup(selectedGroup)}
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                              style={{ padding: '2px 8px', fontSize: '0.68rem' }}
                            >
                              <Edit3 size={11} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setGroupModalTab('list');
                                setIsGroupModalOpen(true);
                              }}
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                              style={{ padding: '2px 8px', fontSize: '0.68rem' }}
                            >
                              <span>All Groups</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="admin-field-label">Department Scope</label>
                      <select
                        className="admin-select"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      >
                        <option value="ALL">All Departments (Institute-Wide)</option>
                        {departmentsList.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Recipient summary strip */}
                  <div
                    style={{
                      background: 'var(--surface-input)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>
                      Audience: <strong style={{ color: '#38bdf8' }}>{selectedGroup ? `Group: ${selectedGroup.name}` : (audience === 'ALL' ? 'All Applicants' : audience)}</strong> in <strong style={{ color: '#a78bfa' }}>{department === 'ALL' ? 'All Depts' : department}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={fetchStudents}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}
                    >
                      <RefreshCw size={11} /> Refresh Count
                    </button>
                  </div>
                </div>
              </div>

              {/* TEMPLATE QUICK PRESETS */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">02 // INSTANT ANNOUNCEMENT TEMPLATES</h3>
                </div>
                <div style={{ padding: '16px 20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {PRESETS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      style={{
                        background: 'var(--surface-input)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-cyan)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-glass)')}
                    >
                      <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ANNOUNCEMENT COMPOSER */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">03 // MESSAGE COMPOSER</h3>
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
                    <div>
                      <label className="admin-field-label">Email Subject Line</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="e.g. Hardware Orientation this Thursday at 4 PM in Lab 302"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="admin-field-label">Category Badge Text</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="e.g. OFFICIAL COHORT ANNOUNCEMENT"
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="admin-field-label">Card Headline</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. Welcome to the Spatial Computing Cohort"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="admin-field-label">Announcement Content & Next Steps</label>
                    <textarea
                      className="admin-textarea"
                      rows={6}
                      placeholder="Enter announcement text with instructions, times, and lab locations..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Tip: Paragraphs separated by blank lines will render as formatted cyber cards in recipient inboxes.
                    </div>
                  </div>

                  {/* DISPATCH ACTION BAR */}
                  <div
                    style={{
                      borderTop: '1px solid var(--border-glass)',
                      paddingTop: '18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Targeting: <strong style={{ color: '#fff' }}>{matchingStudents.length} recipients</strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowConfirm(true)}
                      disabled={sending || matchingStudents.length === 0}
                      className="admin-btn admin-btn-primary"
                      style={{
                        padding: '10px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: sending || matchingStudents.length === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Send size={15} />
                      <span>{sending ? 'Broadcasting Emails...' : 'Broadcast to Cohort'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RECENT OUTBOX LOGS SNIPPET */}
              {recentLogs.length > 0 && (
                <div className="admin-card">
                  <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="admin-card-title">RECENT TRANSMISSION LOGS</h3>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Last {recentLogs.length} transmissions</span>
                  </div>
                  <div style={{ padding: '12px 16px' }}>
                    {recentLogs.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 0',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          fontSize: '0.75rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              background: log.status === 'SENT' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: log.status === 'SENT' ? '#86efac' : '#fca5a5',
                            }}
                          >
                            {log.status}
                          </span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{log.recipient}</span>
                          <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.subject}
                          </span>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', flexShrink: 0 }}>
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: LIVE CYBER EMAIL SIMULATOR */}
            <div
              style={{
                position: 'sticky',
                top: '90px',
                background: 'var(--surface-card)',
                border: '1px solid var(--border-glass)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                maxHeight: 'calc(100vh - 120px)',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Eye size={16} style={{ color: 'var(--accent-cyan)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE EMAIL INBOX SIMULATOR</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  HTML Preview
                </span>
              </div>

              {/* SIMULATED EMAIL INBOX CONTAINER */}
              <div
                style={{
                  background: '#0a0d14',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                {/* Email Client Header */}
                <div
                  style={{
                    background: '#111827',
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ color: '#9ca3af', marginBottom: '4px' }}>
                    <strong style={{ color: '#f3f4f6' }}>Subject:</strong> {subject || '(No subject entered)'}
                  </div>
                  <div style={{ color: '#6b7280', display: 'flex', justifyContent: 'space-between' }}>
                    <span>From: <strong>AR/VR Centre of Excellence</strong> &lt;admin@coe.edu&gt;</span>
                    <span>To: <strong>Sample Recipient</strong></span>
                  </div>
                </div>

                {/* Email Body Mockup */}
                <div style={{ padding: '24px 20px', background: '#090d16' }}>
                  {/* Brand Header */}
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        background: 'rgba(6, 182, 212, 0.12)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#38bdf8',
                        letterSpacing: '0.05em',
                        marginBottom: '8px',
                      }}
                    >
                      {badge || 'COHORT ANNOUNCEMENT'}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.3 }}>
                      {headline || 'Cohort Update'}
                    </div>
                  </div>

                  {/* Card Message Box */}
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      padding: '18px',
                      marginBottom: '18px',
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {message || 'Announcement details will appear here...'}
                    </div>
                  </div>

                  {/* Institutional Signoff */}
                  <div
                    style={{
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      paddingTop: '14px',
                      textAlign: 'center',
                      fontSize: '0.72rem',
                      color: '#64748b',
                    }}
                  >
                    <div>AR/VR Centre of Excellence • Institutional Innovation Cell</div>
                    <div style={{ marginTop: '2px', fontSize: '0.68rem', color: '#475569' }}>
                      This is an automated transmission to registered spatial computing applicants.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* BROADCAST CONFIRMATION MODAL */}
          {showConfirm && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
              }}
              onClick={() => setShowConfirm(false)}
            >
              <div
                style={{
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '16px',
                  maxWidth: '520px',
                  width: '100%',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                    <Megaphone size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Confirm Cohort Broadcast
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Double-check transmission parameters before sending
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--surface-input)',
                    borderRadius: '8px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '0.8rem',
                    border: '1px solid var(--border-glass)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Recipient Count:</span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>{matchingStudents.length} Students</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Target Audience:</span>
                    <strong style={{ color: '#fff' }}>{selectedGroup ? `Custom Group: "${selectedGroup.name}"` : audience} ({department})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subject:</span>
                    <strong style={{ color: '#fff', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {subject}
                    </strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#fca5a5', lineHeight: 1.4 }}>
                  ⚠️ This will send an individual email to each matching student via your configured SMTP transceiver.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBroadcast}
                    className="admin-btn admin-btn-primary admin-btn-sm"
                  >
                    <Send size={13} />
                    <span>Confirm & Dispatch</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* WHATSAPP-STYLE CUSTOM STUDENT GROUPS MANAGER MODAL */}
          {isGroupModalOpen && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
              }}
              onClick={() => setIsGroupModalOpen(false)}
            >
              <div
                style={{
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '16px',
                  maxWidth: '820px',
                  width: '100%',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
                  overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div
                  style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid var(--border-glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(37, 211, 102, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'rgba(37, 211, 102, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#25D366',
                      }}
                    >
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        WhatsApp-Style Custom Student Groups
                      </h3>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Create targeted broadcast lists by handpicking individual students
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Tabs switch */}
                    <div style={{ display: 'flex', background: 'var(--surface-input)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-glass)' }}>
                      <button
                        type="button"
                        onClick={() => setGroupModalTab('create')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          background: groupModalTab === 'create' ? 'rgba(37, 211, 102, 0.2)' : 'transparent',
                          color: groupModalTab === 'create' ? '#25D366' : 'var(--text-muted)',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {editingGroupId ? 'Edit Group' : 'New Group'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setGroupModalTab('list')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          background: groupModalTab === 'list' ? 'rgba(37, 211, 102, 0.2)' : 'transparent',
                          color: groupModalTab === 'list' ? '#25D366' : 'var(--text-muted)',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Saved Lists ({customGroups.length})
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsGroupModalOpen(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {groupModalTab === 'list' ? (
                    /* LIST OF SAVED GROUPS */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {customGroups.length} broadcast lists currently saved in database
                        </span>
                        <button
                          type="button"
                          onClick={handleOpenCreateGroup}
                          className="admin-btn admin-btn-primary admin-btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}
                        >
                          <Plus size={12} />
                          <span>Create New Group</span>
                        </button>
                      </div>

                      {customGroups.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          No custom broadcast groups created yet. Switch to "New Group" to select students and create your first group.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {customGroups.map((grp) => (
                            <div
                              key={grp.id}
                              style={{
                                background: 'var(--surface-input)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '10px',
                                padding: '14px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                <span
                                  style={{
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '50%',
                                    backgroundColor: grp.color || '#25D366',
                                    boxShadow: `0 0 10px ${grp.color || '#25D366'}`,
                                    flexShrink: 0,
                                  }}
                                />
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                      {grp.name}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: '0.68rem',
                                        fontFamily: 'var(--font-mono)',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        background: 'rgba(37, 211, 102, 0.15)',
                                        color: '#25D366',
                                        fontWeight: 700,
                                      }}
                                    >
                                      {grp.student_ids?.length || 0} students
                                    </span>
                                  </div>
                                  {grp.description && (
                                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                      {grp.description}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAudience(`GROUP:${grp.id}`);
                                    setIsGroupModalOpen(false);
                                    setMsg({ text: `Targeting broadcast group: "${grp.name}"`, type: 'success' });
                                    setTimeout(() => setMsg(null), 3000);
                                  }}
                                  className="admin-btn admin-btn-primary admin-btn-sm"
                                  style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                                >
                                  Target For Broadcast
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditGroup(grp)}
                                  className="admin-btn admin-btn-secondary admin-btn-sm"
                                  style={{ padding: '4px 8px' }}
                                  title="Edit group"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteGroup(grp.id, grp.name)}
                                  className="admin-btn admin-btn-danger admin-btn-sm"
                                  style={{ padding: '4px 8px' }}
                                  title="Delete group"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* CREATE / EDIT GROUP FORM */
                    <>
                      {/* Group Meta Info */}
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                        <div>
                          <label className="admin-field-label">Group Name (e.g. Unity Alpha Squad, XR Capstone 2026)</label>
                          <input
                            type="text"
                            className="admin-input"
                            placeholder="e.g. Mixed Reality Research Group"
                            value={groupNameInput}
                            onChange={(e) => setGroupNameInput(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="admin-field-label">Group Color Badge</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="color"
                              value={groupColorInput}
                              onChange={(e) => setGroupColorInput(e.target.value)}
                              style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            />
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {['#25D366', '#06b6d4', '#818cf8', '#c084fc', '#f59e0b', '#ec4899'].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setGroupColorInput(c)}
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    backgroundColor: c,
                                    border: groupColorInput === c ? '2px solid #fff' : 'none',
                                    cursor: 'pointer',
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="admin-field-label">Group Description / Internal Purpose (Optional)</label>
                        <input
                          type="text"
                          className="admin-input"
                          placeholder="Brief internal note regarding why these students are grouped together"
                          value={groupDescInput}
                          onChange={(e) => setGroupDescInput(e.target.value)}
                        />
                      </div>

                      {/* Student Picker Controls */}
                      <div
                        style={{
                          borderTop: '1px solid var(--border-glass)',
                          paddingTop: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Handpick Candidates (WhatsApp Status Style)
                          </span>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontFamily: 'var(--font-mono)',
                              color: '#25D366',
                              background: 'rgba(37, 211, 102, 0.1)',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontWeight: 700,
                            }}
                          >
                            {selectedStudentIds.length} of {students.length} Students Selected
                          </span>
                        </div>

                        {/* Filters & Search */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
                          <div style={{ position: 'relative' }}>
                            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="Search name, reg number, email..."
                              value={studentSearchTerm}
                              onChange={(e) => setStudentSearchTerm(e.target.value)}
                              style={{ paddingLeft: '32px', fontSize: '0.78rem' }}
                            />
                          </div>

                          <select
                            className="admin-select"
                            value={groupFilterDept}
                            onChange={(e) => setGroupFilterDept(e.target.value)}
                            style={{ fontSize: '0.76rem', padding: '6px 8px' }}
                          >
                            <option value="ALL">All Departments</option>
                            {departmentsList.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>

                          <select
                            className="admin-select"
                            value={groupFilterStatus}
                            onChange={(e) => setGroupFilterStatus(e.target.value)}
                            style={{ fontSize: '0.76rem', padding: '6px 8px' }}
                          >
                            <option value="ALL">All Statuses</option>
                            <option value="JOINED">JOINED</option>
                            <option value="WAITING">WAITING</option>
                            <option value="NEW">NEW</option>
                            <option value="UNDER_REVIEW">UNDER REVIEW</option>
                            <option value="SHORTLISTED">SHORTLISTED</option>
                          </select>
                        </div>

                        {/* Action Toolbar */}
                        {(() => {
                          const filtered = students.filter((s) => {
                            const matchesSearch = !studentSearchTerm.trim() ||
                              s.full_name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                              s.register_number.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                              (s.email && s.email.toLowerCase().includes(studentSearchTerm.toLowerCase()));
                            const matchesDept = groupFilterDept === 'ALL' || s.department.toLowerCase() === groupFilterDept.toLowerCase();
                            const matchesStatus = groupFilterStatus === 'ALL' || s.status === groupFilterStatus;
                            return matchesSearch && matchesDept && matchesStatus;
                          });
                          const filteredIds = filtered.map((s) => s.id);

                          return (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>
                                  Showing {filtered.length} matching candidates
                                </span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    type="button"
                                    onClick={() => selectAllFiltered(filteredIds)}
                                    className="admin-btn admin-btn-secondary admin-btn-sm"
                                    style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                                  >
                                    Select All Shown ({filtered.length})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deselectAllFiltered(filteredIds)}
                                    className="admin-btn admin-btn-secondary admin-btn-sm"
                                    style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                                  >
                                    Deselect Shown
                                  </button>
                                  {selectedStudentIds.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedStudentIds([])}
                                      className="admin-btn admin-btn-danger admin-btn-sm"
                                      style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                                    >
                                      Clear All
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Candidate Selectable Cards */}
                              <div
                                style={{
                                  maxHeight: '320px',
                                  overflowY: 'auto',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px',
                                  paddingRight: '4px',
                                }}
                              >
                                {filtered.length === 0 ? (
                                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    No students match your filter criteria.
                                  </div>
                                ) : (
                                  filtered.map((student) => {
                                    const isSelected = selectedStudentIds.includes(student.id);
                                    return (
                                      <div
                                        key={student.id}
                                        onClick={() => toggleStudentSelection(student.id)}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          padding: '8px 12px',
                                          borderRadius: '8px',
                                          background: isSelected ? 'rgba(37, 211, 102, 0.08)' : 'var(--surface-input)',
                                          border: isSelected ? '1px solid rgba(37, 211, 102, 0.4)' : '1px solid var(--border-glass)',
                                          cursor: 'pointer',
                                          transition: 'all 0.15s ease',
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                          {isSelected ? (
                                            <CheckSquare size={16} color="#25D366" />
                                          ) : (
                                            <Square size={16} color="var(--text-muted)" />
                                          )}
                                          <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <span style={{ fontWeight: 600, fontSize: '0.82rem', color: isSelected ? '#86efac' : 'var(--text-primary)' }}>
                                                {student.full_name}
                                              </span>
                                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                ({student.register_number})
                                              </span>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                              {student.department} • {student.year}
                                            </div>
                                          </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <span
                                            style={{
                                              fontSize: '0.65rem',
                                              fontWeight: 700,
                                              padding: '2px 6px',
                                              borderRadius: '6px',
                                              background: student.status === 'JOINED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                              color: student.status === 'JOINED' ? '#86efac' : '#fde047',
                                              border: `1px solid ${student.status === 'JOINED' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                                            }}
                                          >
                                            {student.status}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </>
                  )}
                </div>

                {/* Modal Footer */}
                {groupModalTab === 'create' && (
                  <div
                    style={{
                      padding: '16px 24px',
                      borderTop: '1px solid var(--border-glass)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--surface-input)',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <strong style={{ color: '#25D366' }}>{selectedStudentIds.length}</strong> students will be enrolled in this group.
                    </span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setIsGroupModalOpen(false)}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveGroup}
                        disabled={savingGroup}
                        className="admin-btn admin-btn-primary admin-btn-sm"
                        style={{ background: '#25D366', borderColor: '#25D366', color: '#090d16', fontWeight: 700 }}
                      >
                        <Check size={14} />
                        <span>{savingGroup ? 'Saving...' : (editingGroupId ? 'Update Group' : 'Save Broadcast Group')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
