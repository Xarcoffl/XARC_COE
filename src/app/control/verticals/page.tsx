'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Vertical } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  Trash2,
  Layers,
  Award,
  Briefcase,
  BookOpen,
  Cpu,
  Sparkles,
  Box,
  Terminal,
  Sun,
  Moon,
  Check,
} from 'lucide-react';

const AVAILABLE_ICONS = [
  { id: 'Award', label: 'Certification / Award', icon: Award },
  { id: 'Briefcase', label: 'Industry / Internship', icon: Briefcase },
  { id: 'BookOpen', label: 'Self-Learning / Academy', icon: BookOpen },
  { id: 'Cpu', label: 'Skill / Hardware', icon: Cpu },
  { id: 'Sparkles', label: 'Innovation / Product', icon: Sparkles },
  { id: 'Box', label: '3D / Spatial Assets', icon: Box },
  { id: 'Terminal', label: 'Core Engineering / Code', icon: Terminal },
];

function getIconComponent(iconName: string) {
  switch (iconName) {
    case 'Award': return Award;
    case 'Briefcase': return Briefcase;
    case 'BookOpen': return BookOpen;
    case 'Cpu': return Cpu;
    case 'Sparkles': return Sparkles;
    case 'Box': return Box;
    case 'Terminal': return Terminal;
    default: return Layers;
  }
}

export default function AdminVerticalsPage() {
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [selectedVertical, setSelectedVertical] = useState<Vertical | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [newTool, setNewTool] = useState('');
  const [newOpportunity, setNewOpportunity] = useState('');
  const router = useRouter();

  const fetchVerticals = async () => {
    try {
      const res = await fetch('/api/admin/verticals');
      if (res.status === 401) {
        router.push('/control/auth');
        return;
      }
      const data = await res.json();
      if (data.success && data.verticals?.length > 0) {
        setVerticals(data.verticals);
        if (!selectedVertical) {
          setSelectedVertical(data.verticals[0]);
        } else {
          const updated = data.verticals.find((v: Vertical) => v.id === selectedVertical.id);
          if (updated) setSelectedVertical(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching verticals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerticals();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedVertical) return;
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/verticals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedVertical),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: `Vertical "${selectedVertical.title}" updated successfully.`, type: 'success' });
        fetchVerticals();
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ text: 'Failed to update vertical.', type: 'error' });
      }
    } catch {
      setMsg({ text: 'A network error occurred.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddOutcome = () => {
    if (!selectedVertical) return;
    setSelectedVertical({
      ...selectedVertical,
      outcomes: [...selectedVertical.outcomes, 'New key deliverable or experience outcome.'],
    });
  };

  const handleUpdateOutcome = (index: number, val: string) => {
    if (!selectedVertical) return;
    const outcomes = [...selectedVertical.outcomes];
    outcomes[index] = val;
    setSelectedVertical({ ...selectedVertical, outcomes });
  };

  const handleRemoveOutcome = (index: number) => {
    if (!selectedVertical) return;
    setSelectedVertical({
      ...selectedVertical,
      outcomes: selectedVertical.outcomes.filter((_, i) => i !== index),
    });
  };

  const handleAddTool = () => {
    if (!selectedVertical || !newTool.trim()) return;
    if (!selectedVertical.tools.includes(newTool.trim())) {
      setSelectedVertical({
        ...selectedVertical,
        tools: [...selectedVertical.tools, newTool.trim()],
      });
    }
    setNewTool('');
  };

  const handleRemoveTool = (tool: string) => {
    if (!selectedVertical) return;
    setSelectedVertical({
      ...selectedVertical,
      tools: selectedVertical.tools.filter((t) => t !== tool),
    });
  };

  const handleAddOpportunity = () => {
    if (!selectedVertical || !newOpportunity.trim()) return;
    if (!selectedVertical.opportunities.includes(newOpportunity.trim())) {
      setSelectedVertical({
        ...selectedVertical,
        opportunities: [...selectedVertical.opportunities, newOpportunity.trim()],
      });
    }
    setNewOpportunity('');
  };

  const handleRemoveOpportunity = (opp: string) => {
    if (!selectedVertical) return;
    setSelectedVertical({
      ...selectedVertical,
      opportunities: selectedVertical.opportunities.filter((o) => o !== opp),
    });
  };

  const ActiveIcon = selectedVertical ? getIconComponent(selectedVertical.icon) : Layers;

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminHeader
          title="Curriculum & Verticals Studio"
          subtitle="Customize institutional pathways, toolchains, deliverable outcomes, and live preview"
        />

        <div className="admin-content" style={{ maxWidth: '1440px' }}>
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
              }}
            >
              {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* VERTICAL SELECTOR CHIPS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {verticals.map((v) => {
              const isSel = selectedVertical?.id === v.id;
              const VIcon = getIconComponent(v.icon);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVertical(v)}
                  style={{
                    background: isSel
                      ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.15), rgba(99, 102, 241, 0.15))'
                      : 'var(--surface-card)',
                    border: isSel ? '2px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    boxShadow: isSel ? '0 4px 16px rgba(2, 132, 199, 0.25)' : 'var(--shadow-subtle)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: isSel ? 'var(--accent-cyan)' : 'var(--surface-input)',
                      color: isSel ? '#ffffff' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <VIcon size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>
                      PATHWAY {v.number}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {v.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              Loading verticals...
            </div>
          ) : selectedVertical ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(440px, 1.15fr) minmax(400px, 1fr)', gap: '24px', alignItems: 'start' }}>
              
              {/* LEFT COLUMN: INTERACTIVE EDITOR */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Core Parameters Card */}
                <div className="admin-card">
                  <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="admin-card-title">01 // PATHWAY IDENTITY & STATUS</h3>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedVertical({
                          ...selectedVertical,
                          is_published: !selectedVertical.is_published,
                        })
                      }
                      style={{
                        background: selectedVertical.is_published ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        border: `1px solid ${selectedVertical.is_published ? '#22c55e' : '#ef4444'}`,
                        color: selectedVertical.is_published ? '#22c55e' : '#ef4444',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {selectedVertical.is_published ? 'LIVE / PUBLISHED' : 'DRAFT / HIDDEN'}
                    </button>
                  </div>
                  
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '14px' }}>
                      <div>
                        <label className="admin-field-label">Number</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={selectedVertical.number}
                          onChange={(e) => setSelectedVertical({ ...selectedVertical, number: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="admin-field-label">Pathway Title</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={selectedVertical.title}
                          onChange={(e) => setSelectedVertical({ ...selectedVertical, title: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Icon Selector */}
                    <div>
                      <label className="admin-field-label">Spatial Graphic Icon</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {AVAILABLE_ICONS.map((opt) => {
                          const isIconSel = selectedVertical.icon === opt.id;
                          const OptIcon = opt.icon;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setSelectedVertical({ ...selectedVertical, icon: opt.id })}
                              style={{
                                background: isIconSel ? 'var(--accent-cyan)' : 'var(--surface-input)',
                                color: isIconSel ? '#ffffff' : 'var(--text-secondary)',
                                border: isIconSel ? '1px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.78rem',
                                fontWeight: isIconSel ? 700 : 500,
                                cursor: 'pointer',
                              }}
                            >
                              <OptIcon size={14} />
                              <span>{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="admin-field-label">Short Summary (Home & Cards)</label>
                      <textarea
                        className="admin-textarea"
                        rows={2}
                        value={selectedVertical.short_description}
                        onChange={(e) => setSelectedVertical({ ...selectedVertical, short_description: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="admin-field-label">Full Syllabus Narrative</label>
                      <textarea
                        className="admin-textarea"
                        rows={4}
                        value={selectedVertical.full_description}
                        onChange={(e) => setSelectedVertical({ ...selectedVertical, full_description: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Outcomes & Deliverables */}
                <div className="admin-card">
                  <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="admin-card-title">02 // DELIVERABLES & OUTCOMES ({selectedVertical.outcomes.length})</h3>
                    <button
                      type="button"
                      onClick={handleAddOutcome}
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                    >
                      <Plus size={13} />
                      <span>Add Outcome</span>
                    </button>
                  </div>

                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedVertical.outcomes.map((out, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', width: '24px' }}>
                          0{idx + 1}
                        </span>
                        <input
                          type="text"
                          className="admin-input"
                          value={out}
                          onChange={(e) => handleUpdateOutcome(idx, e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOutcome(idx)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Toolchain & Career Badges */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">03 // TOOLCHAINS & CAREER OPPORTUNITIES</h3>
                  </div>

                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {/* Tools */}
                    <div>
                      <label className="admin-field-label">Technology & Software Stack</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                        {selectedVertical.tools.map((t) => (
                          <span
                            key={t}
                            style={{
                              background: 'rgba(2, 132, 199, 0.12)',
                              border: '1px solid rgba(2, 132, 199, 0.3)',
                              color: '#0284c7',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <span>{t}</span>
                            <span onClick={() => handleRemoveTool(t)} style={{ cursor: 'pointer', fontWeight: 800 }}>
                              ×
                            </span>
                          </span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          className="admin-input"
                          placeholder="e.g. Unity 6, WebXR, Unreal 5, Blender..."
                          value={newTool}
                          onChange={(e) => setNewTool(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTool(); } }}
                          style={{ flex: 1, padding: '7px 10px', fontSize: '0.82rem' }}
                        />
                        <button type="button" onClick={handleAddTool} className="admin-btn admin-btn-secondary admin-btn-sm">
                          + Add
                        </button>
                      </div>
                    </div>

                    {/* Career Opportunities */}
                    <div>
                      <label className="admin-field-label">Career Roles & Opportunities</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                        {selectedVertical.opportunities.map((o) => (
                          <span
                            key={o}
                            style={{
                              background: 'rgba(124, 58, 237, 0.12)',
                              border: '1px solid rgba(124, 58, 237, 0.3)',
                              color: '#7c3aed',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <span>{o}</span>
                            <span onClick={() => handleRemoveOpportunity(o)} style={{ cursor: 'pointer', fontWeight: 800 }}>
                              ×
                            </span>
                          </span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          className="admin-input"
                          placeholder="e.g. Spatial Systems Engineer, XR Interaction Designer..."
                          value={newOpportunity}
                          onChange={(e) => setNewOpportunity(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOpportunity(); } }}
                          style={{ flex: 1, padding: '7px 10px', fontSize: '0.82rem' }}
                        />
                        <button type="button" onClick={handleAddOpportunity} className="admin-btn admin-btn-secondary admin-btn-sm">
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Bar */}
                <div
                  style={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                    position: 'sticky',
                    bottom: '20px',
                    zIndex: 20,
                  }}
                >
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Pathway {selectedVertical.number} changes synced live.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="admin-btn admin-btn-primary"
                    style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Save size={16} />
                    <span>{saving ? 'Saving...' : 'Save Pathway Changes'}</span>
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: SCROLLABLE LIVE SYNCED PREVIEW */}
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
                {/* PREVIEW HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Eye size={16} style={{ color: 'var(--accent-cyan)' }} />
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE SYLLABUS PREVIEW</span>
                  </div>

                  {/* LIGHT / DARK SIMULATOR */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Simulate:</span>
                    <button
                      type="button"
                      onClick={() => setPreviewTheme(previewTheme === 'dark' ? 'light' : 'dark')}
                      style={{
                        background: previewTheme === 'dark' ? '#1f2937' : '#e0e7ff',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '20px',
                        padding: '4px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: previewTheme === 'dark' ? '#f3f4f6' : '#1e1b4b',
                      }}
                    >
                      {previewTheme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                      <span>{previewTheme.toUpperCase()}</span>
                    </button>
                  </div>
                </div>

                {/* SCROLLABLE INNER BROWSER CONTAINER */}
                <div
                  style={{
                    background: previewTheme === 'dark' ? '#090d16' : '#ffffff',
                    color: previewTheme === 'dark' ? '#f3f4f6' : '#0f172a',
                    borderRadius: '12px',
                    border: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                    overflowY: 'auto',
                    maxHeight: 'calc(100vh - 200px)',
                    padding: '24px 20px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7', display: 'inline-block' }} />
                    <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                      PATHWAY_{selectedVertical.number} // ACTIVE_SYLLABUS
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2), rgba(124, 58, 237, 0.2))',
                        border: '1px solid #0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0284c7',
                        flexShrink: 0,
                      }}
                    >
                      <ActiveIcon size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: previewTheme === 'dark' ? '#ffffff' : '#0f172a' }}>
                        {selectedVertical.title}
                      </h3>
                      <div style={{ fontSize: '0.74rem', color: previewTheme === 'dark' ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                        Curriculum active • {selectedVertical.outcomes.length} core deliverables
                      </div>
                    </div>
                  </div>

                  {/* Summary & Narrative */}
                  <div
                    style={{
                      background: previewTheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                      borderRadius: '8px',
                      padding: '14px',
                      border: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
                      fontSize: '0.8rem',
                      lineHeight: 1.55,
                      color: previewTheme === 'dark' ? '#cbd5e1' : '#334155',
                    }}
                  >
                    <strong style={{ color: previewTheme === 'dark' ? '#ffffff' : '#0f172a', display: 'block', marginBottom: '6px' }}>
                      Pathway Brief:
                    </strong>
                    {selectedVertical.full_description}
                  </div>

                  {/* Deliverables Checklist Preview */}
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', marginBottom: '8px', letterSpacing: '0.05em' }}>
                      KEY EXPERIENCES & DELIVERABLES:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedVertical.outcomes.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.75rem', color: previewTheme === 'dark' ? '#cbd5e1' : '#334155' }}>
                          <Check size={14} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tools Stack Preview */}
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', marginBottom: '6px' }}>
                      TECHNOLOGY & SOFTWARE TOOLS:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {selectedVertical.tools.map((t) => (
                        <span
                          key={t}
                          style={{
                            background: previewTheme === 'dark' ? 'rgba(2, 132, 199, 0.15)' : '#e0f2fe',
                            color: '#0284c7',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Opportunities Preview */}
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', marginBottom: '6px' }}>
                      CAREER & ROLE OUTCOMES:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {selectedVertical.opportunities.map((o) => (
                        <span
                          key={o}
                          style={{
                            background: previewTheme === 'dark' ? 'rgba(124, 58, 237, 0.15)' : '#f3e8ff',
                            color: '#7c3aed',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                          }}
                        >
                          {o}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
