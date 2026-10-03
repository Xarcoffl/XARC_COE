'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { AboutContent } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  Sparkles,
  Target,
  Compass,
  Layers,
  Wand2,
  Sun,
  Moon,
  ArrowUp,
  ArrowDown,
  BookOpen,
  Milestone,
} from 'lucide-react';

const RECOMMENDED_PILLARS = [
  'Spatial Computing & Immersive Algorithms (SLAM, 6DoF, Mesh Reconstruction)',
  'Stereoscopic Optical Systems & Low-Latency Display Pipeline Engineering',
  'Haptic Feedback Rigs & Biosensing Neural Interfaces (EMG, EEG, BCI)',
  'Enterprise Digital Twins & Real-Time Cyber-Physical Synchronization',
  'Cross-Platform XR Software Architecture (WebXR, OpenXR, Unity, Unreal 5)',
  'Tele-Immersion & Spatial Telepresence for Remote High-Precision Robotics',
];

const PRESETS: Record<string, { label: string; vision: string; mission: string }> = {
  frontier: {
    label: 'Spatial Pioneer Lab',
    vision: 'To emerge as a premier global epicentre of spatial computing excellence, advancing human-computer symbiosis through pioneering research, patentable hardware, and world-class engineering.',
    mission: 'To empower undergraduate and postgraduate researchers with direct access to advanced spatial computing infrastructure, fostering multidisciplinary breakthroughs that redefine digital interaction.',
  },
  industrial: {
    label: 'Enterprise XR & Industry 4.0',
    vision: 'To bridge academic discovery with industrial deployment by engineering real-time digital twin architectures and spatial teleoperation workflows for mission-critical sectors.',
    mission: 'To cultivate high-calibre spatial software engineers through direct industry collaboration, funded R&D initiatives, and hands-on production hardware mastery.',
  },
};

export default function AdminAboutContentPage() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'mandate' | 'culture' | 'roadmap'>('hero');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/content?section=about')
      .then((res) => {
        if (res.status === 401) {
          router.push('/control/auth');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.success) {
          // Ensure nested defaults exist
          const c = data.content;
          if (!c.hero) {
            c.hero = { heading: 'About the Centre of Excellence', subheading: 'MANDATE & PURPOSE', description: 'Bridging education, research, and industry in spatial computing.' };
          }
          if (!c.roadmap) {
            c.roadmap = [
              { phase: 'PHASE 01', title: 'Foundational XR Rigs', description: 'Establishment of baseline optical and compute infrastructure.' },
              { phase: 'PHASE 02', title: 'Multidisciplinary Cohorts', description: 'Cross-departmental student intake across computing, design, and biomedical disciplines.' },
              { phase: 'PHASE 03', title: 'Enterprise Digital Twins', description: 'Direct commercialization and deployment with industry partners.' },
            ];
          }
          setContent(c);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content) return;
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'about', content }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'About page content updated successfully.', type: 'success' });
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ text: 'Failed to update content.', type: 'error' });
      }
    } catch {
      setMsg({ text: 'A network error occurred.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddWhatWeDo = (text?: string) => {
    if (!content) return;
    setContent({
      ...content,
      what_we_do: [...content.what_we_do, text || 'New mandate or research capability focus.'],
    });
  };

  const handleRemoveWhatWeDo = (idx: number) => {
    if (!content) return;
    setContent({
      ...content,
      what_we_do: content.what_we_do.filter((_, i) => i !== idx),
    });
  };

  const handleMoveWhatWeDo = (idx: number, dir: 'up' | 'down') => {
    if (!content) return;
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= content.what_we_do.length) return;
    const updated = [...content.what_we_do];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);
    setContent({ ...content, what_we_do: updated });
  };

  const addRoadmapPhase = () => {
    if (!content) return;
    const roadmap = [...(content.roadmap || [])];
    const nextNum = roadmap.length + 1;
    roadmap.push({
      phase: `PHASE 0${nextNum}`,
      title: 'New Strategic Milestone',
      description: 'Milestone objectives and developmental milestones.',
    });
    setContent({ ...content, roadmap });
  };

  const removeRoadmapPhase = (idx: number) => {
    if (!content) return;
    setContent({
      ...content,
      roadmap: (content.roadmap || []).filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminHeader
          title="Interactive About Content Studio"
          subtitle="Refine vision, mission, core mandates, and strategic roadmap with real-time live preview"
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
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{msg.text}</span>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
              Loading about page editable slots...
            </div>
          ) : content ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1.15fr) minmax(400px, 1fr)', gap: '24px', alignItems: 'start' }}>
              
              {/* LEFT COLUMN: EDITOR */}
              <div>
                {/* PRESET THEMES */}
                <div
                  style={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <Wand2 size={16} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontWeight: 600 }}>Vision/Mission Presets:</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Object.entries(PRESETS).map(([k, p]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => {
                          setContent({ ...content, vision: p.vision, mission: p.mission });
                          setMsg({ text: `Loaded "${p.label}" vision & mission!`, type: 'success' });
                          setTimeout(() => setMsg(null), 3000);
                        }}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        style={{ fontSize: '0.78rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Sparkles size={12} />
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* TABS */}
                <div
                  style={{
                    display: 'flex',
                    background: 'var(--surface-input)',
                    borderRadius: '10px',
                    padding: '4px',
                    marginBottom: '20px',
                    gap: '4px',
                    border: '1px solid var(--border-glass)',
                  }}
                >
                  {[
                    { id: 'hero', label: '01 Vision & Mission', icon: Target },
                    { id: 'mandate', label: '02 What We Do', icon: BookOpen },
                    { id: 'culture', label: '03 Co-Working & Culture', icon: Layers },
                    { id: 'roadmap', label: '04 Roadmap', icon: Milestone },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? '#fff' : 'var(--text-muted)',
                          background: isActive ? 'linear-gradient(135deg, #0284c7, #6366f1)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: isActive ? '0 2px 8px rgba(2, 132, 199, 0.3)' : 'none',
                        }}
                      >
                        <Icon size={14} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: HERO & VISION / MISSION */}
                {activeTab === 'hero' && (
                  <div className="admin-card" style={{ marginBottom: '20px' }}>
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">01 // VISION & MISSION NARRATIVES</h3>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">About Page Main Heading</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={content.hero?.heading || ''}
                            onChange={(e) => setContent({ ...content, hero: { ...(content.hero || {} as any), heading: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="admin-field-label">Eyebrow / Subheading</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={content.hero?.subheading || ''}
                            onChange={(e) => setContent({ ...content, hero: { ...(content.hero || {} as any), subheading: e.target.value } })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="admin-field-label">Header Intro Description</label>
                        <textarea
                          className="admin-textarea"
                          rows={2}
                          value={content.hero?.description || ''}
                          onChange={(e) => setContent({ ...content, hero: { ...(content.hero || {} as any), description: e.target.value } })}
                        />
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <label className="admin-field-label" style={{ marginBottom: 0 }}>Institutional Vision</label>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{content.vision.length} chars</span>
                        </div>
                        <textarea
                          className="admin-textarea"
                          rows={3}
                          value={content.vision}
                          onChange={(e) => setContent({ ...content, vision: e.target.value })}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <label className="admin-field-label" style={{ marginBottom: 0 }}>Institutional Mission</label>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{content.mission.length} chars</span>
                        </div>
                        <textarea
                          className="admin-textarea"
                          rows={3}
                          value={content.mission}
                          onChange={(e) => setContent({ ...content, mission: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: WHAT WE DO MANDATE */}
                {activeTab === 'mandate' && (
                  <div className="admin-card" style={{ marginBottom: '20px' }}>
                    <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 className="admin-card-title">02 // WHAT WE DO - CORE MANDATES ({content.what_we_do.length})</h3>
                      <button
                        type="button"
                        onClick={() => handleAddWhatWeDo()}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                      >
                        <Plus size={13} />
                        <span>Add Item</span>
                      </button>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      
                      {/* Suggested Items Inserter */}
                      <div style={{ background: 'var(--surface-input)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                          Quick Add from Recommended Focus Areas:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {RECOMMENDED_PILLARS.map((rec, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleAddWhatWeDo(rec)}
                              style={{
                                background: 'rgba(2, 132, 199, 0.1)',
                                border: '1px solid rgba(2, 132, 199, 0.25)',
                                color: '#38bdf8',
                                borderRadius: '12px',
                                padding: '3px 8px',
                                fontSize: '0.72rem',
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                            >
                              + {rec.split('(')[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mandate Items List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {content.what_we_do.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              gap: '8px',
                              alignItems: 'center',
                              background: 'var(--surface-input)',
                              border: '1px solid var(--border-glass)',
                              padding: '8px 12px',
                              borderRadius: '8px',
                            }}
                          >
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', minWidth: '24px' }}>
                              0{idx + 1}
                            </span>
                            <input
                              type="text"
                              className="admin-input"
                              value={item}
                              onChange={(e) => {
                                const updated = [...content.what_we_do];
                                updated[idx] = e.target.value;
                                setContent({ ...content, what_we_do: updated });
                              }}
                              style={{ flex: 1, padding: '8px 10px', fontSize: '0.85rem' }}
                            />
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => handleMoveWhatWeDo(idx, 'up')}
                                disabled={idx === 0}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid var(--border-glass)',
                                  color: idx === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                                  padding: '5px',
                                  borderRadius: '4px',
                                  cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                }}
                                title="Move Up"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveWhatWeDo(idx, 'down')}
                                disabled={idx === content.what_we_do.length - 1}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid var(--border-glass)',
                                  color: idx === content.what_we_do.length - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                                  padding: '5px',
                                  borderRadius: '4px',
                                  cursor: idx === content.what_we_do.length - 1 ? 'not-allowed' : 'pointer',
                                }}
                                title="Move Down"
                              >
                                <ArrowDown size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveWhatWeDo(idx)}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#ef4444',
                                  padding: '5px 8px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                }}
                                title="Delete Item"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: CO-WORKING & CULTURE */}
                {activeTab === 'culture' && (
                  <div className="admin-card" style={{ marginBottom: '20px' }}>
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">03 // CO-WORKING & MULTIDISCIPLINARY ENVIRONMENT</h3>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label className="admin-field-label">Co-Working Facility Title</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={content.coworking_title}
                          onChange={(e) => setContent({ ...content, coworking_title: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="admin-field-label">Co-Working Overview Description</label>
                        <textarea
                          className="admin-textarea"
                          rows={3}
                          value={content.coworking_description}
                          onChange={(e) => setContent({ ...content, coworking_description: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="admin-field-label">Multidisciplinary Collaboration Culture</label>
                        <textarea
                          className="admin-textarea"
                          rows={3}
                          value={content.multidisciplinary_desc}
                          onChange={(e) => setContent({ ...content, multidisciplinary_desc: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="admin-field-label">Student Development Pipeline</label>
                        <textarea
                          className="admin-textarea"
                          rows={3}
                          value={content.student_development_desc || ''}
                          onChange={(e) => setContent({ ...content, student_development_desc: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="admin-field-label">Industry Orientation & Commercialization</label>
                        <textarea
                          className="admin-textarea"
                          rows={3}
                          value={content.industry_orientation_desc || ''}
                          onChange={(e) => setContent({ ...content, industry_orientation_desc: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: ROADMAP */}
                {activeTab === 'roadmap' && (
                  <div className="admin-card" style={{ marginBottom: '20px' }}>
                    <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 className="admin-card-title">04 // STRATEGIC ROADMAP MILESTONES</h3>
                      <button
                        type="button"
                        onClick={addRoadmapPhase}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                      >
                        <Plus size={13} />
                        <span>Add Phase</span>
                      </button>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {(content.roadmap || []).map((phase, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: 'var(--surface-input)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '8px',
                            padding: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{ width: '130px' }}>
                              <input
                                type="text"
                                className="admin-input"
                                placeholder="PHASE"
                                value={phase.phase}
                                onChange={(e) => {
                                  const updated = [...(content.roadmap || [])];
                                  updated[idx] = { ...updated[idx], phase: e.target.value };
                                  setContent({ ...content, roadmap: updated });
                                }}
                                style={{ fontSize: '0.75rem', fontWeight: 700, padding: '6px 8px' }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <input
                                type="text"
                                className="admin-input"
                                placeholder="Milestone Title"
                                value={phase.title}
                                onChange={(e) => {
                                  const updated = [...(content.roadmap || [])];
                                  updated[idx] = { ...updated[idx], title: e.target.value };
                                  setContent({ ...content, roadmap: updated });
                                }}
                                style={{ fontSize: '0.85rem', fontWeight: 600, padding: '6px 10px' }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeRoadmapPhase(idx)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#ef4444',
                                padding: '6px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                              title="Remove Phase"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <textarea
                            className="admin-textarea"
                            rows={2}
                            placeholder="Milestone description..."
                            value={phase.description}
                            onChange={(e) => {
                              const updated = [...(content.roadmap || [])];
                              updated[idx] = { ...updated[idx], description: e.target.value };
                              setContent({ ...content, roadmap: updated });
                            }}
                            style={{ fontSize: '0.82rem' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SAVE BUTTON */}
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
                    Instant live preview on the right pane.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="admin-btn admin-btn-primary"
                    style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Save size={16} />
                    <span>{saving ? 'Saving...' : 'Save & Publish About Content'}</span>
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: LIVE INTERACTIVE SPLIT PREVIEW */}
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
                    <Eye size={16} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE PUBLIC PREVIEW</span>
                  </div>

                  {/* LIGHT / DARK SIMULATOR */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulate:</span>
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
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: previewTheme === 'dark' ? '#f3f4f6' : '#1e1b4b',
                      }}
                    >
                      {previewTheme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                      <span>{previewTheme.toUpperCase()}</span>
                    </button>
                  </div>
                </div>

                {/* SIMULATED BROWSER CHROME */}
                <div
                  style={{
                    background: previewTheme === 'dark' ? '#090d16' : '#ffffff',
                    color: previewTheme === 'dark' ? '#f3f4f6' : '#0f172a',
                    borderRadius: '12px',
                    border: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Browser Bar */}
                  <div
                    style={{
                      background: previewTheme === 'dark' ? '#111827' : '#f1f5f9',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderBottom: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                    </div>
                    <div
                      style={{
                        flex: 1,
                        background: previewTheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#ffffff',
                        borderRadius: '4px',
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        color: previewTheme === 'dark' ? '#9ca3af' : '#64748b',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                      }}
                    >
                      https://coe.arvr.edu/about
                    </div>
                  </div>

                  {/* PREVIEW CONTAINER BODY */}
                  <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    
                    {/* HERO PREVIEW */}
                    <div>
                      <div
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          color: '#0284c7',
                          marginBottom: '4px',
                        }}
                      >
                        {content.hero?.subheading || 'MANDATE & PURPOSE'}
                      </div>
                      <h2
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          color: previewTheme === 'dark' ? '#f8fafc' : '#0f172a',
                          marginBottom: '8px',
                        }}
                      >
                        {content.hero?.heading || 'About the Centre of Excellence'}
                      </h2>
                      <p
                        style={{
                          fontSize: '0.8rem',
                          color: previewTheme === 'dark' ? '#94a3b8' : '#64748b',
                          lineHeight: 1.5,
                        }}
                      >
                        {content.hero?.description || 'Bridging education, research, and industry in spatial computing.'}
                      </p>
                    </div>

                    {/* VISION & MISSION CARDS */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                      <div
                        style={{
                          padding: '16px',
                          borderRadius: '10px',
                          background: previewTheme === 'dark'
                            ? 'radial-gradient(circle at top left, rgba(2, 132, 199, 0.15) 0%, rgba(15, 23, 42, 0.5) 100%)'
                            : 'radial-gradient(circle at top left, rgba(2, 132, 199, 0.1) 0%, #ffffff 100%)',
                          border: previewTheme === 'dark' ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid rgba(2, 132, 199, 0.3)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', color: '#38bdf8' }}>INSTITUTIONAL VISION</span>
                        </div>
                        <p style={{ fontSize: '0.78rem', lineHeight: 1.55, fontStyle: 'italic', color: previewTheme === 'dark' ? '#e2e8f0' : '#1e293b' }}>
                          &ldquo;{content.vision}&rdquo;
                        </p>
                      </div>

                      <div
                        style={{
                          padding: '16px',
                          borderRadius: '10px',
                          background: previewTheme === 'dark'
                            ? 'radial-gradient(circle at top left, rgba(124, 58, 237, 0.15) 0%, rgba(15, 23, 42, 0.5) 100%)'
                            : 'radial-gradient(circle at top left, rgba(124, 58, 237, 0.1) 0%, #ffffff 100%)',
                          border: previewTheme === 'dark' ? '1px solid rgba(168, 85, 247, 0.25)' : '1px solid rgba(124, 58, 237, 0.3)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', color: '#c084fc' }}>INSTITUTIONAL MISSION</span>
                        </div>
                        <p style={{ fontSize: '0.78rem', lineHeight: 1.55, fontStyle: 'italic', color: previewTheme === 'dark' ? '#e2e8f0' : '#1e293b' }}>
                          &ldquo;{content.mission}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* WHAT WE DO PREVIEW */}
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '8px' }}>
                        WHAT WE DO // MANDATE PILLARS
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {content.what_we_do.slice(0, 4).map((item, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '8px',
                              fontSize: '0.75rem',
                              color: previewTheme === 'dark' ? '#cbd5e1' : '#334155',
                              padding: '6px 10px',
                              background: previewTheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                              borderRadius: '6px',
                              border: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
                            }}
                          >
                            <span style={{ color: '#0284c7', fontWeight: 700 }}>•</span>
                            <span style={{ flex: 1 }}>{item}</span>
                          </div>
                        ))}
                        {content.what_we_do.length > 4 && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '4px' }}>
                            + {content.what_we_do.length - 4} more pillars on full page
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ROADMAP PREVIEW */}
                    {content.roadmap && content.roadmap.length > 0 && (
                      <div style={{ borderTop: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', paddingTop: '14px' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ec4899', marginBottom: '8px' }}>
                          STRATEGIC ROADMAP
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {content.roadmap.map((rm, i) => (
                            <div
                              key={i}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                background: previewTheme === 'dark' ? 'rgba(255,255,255,0.02)' : '#ffffff',
                                borderLeft: '3px solid #ec4899',
                                borderTop: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
                                borderRight: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
                                borderBottom: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ec4899' }}>{rm.phase}</span>
                                <span style={{ fontSize: '0.74rem', fontWeight: 600, color: previewTheme === 'dark' ? '#f1f5f9' : '#1e293b' }}>{rm.title}</span>
                              </div>
                              <p style={{ fontSize: '0.7rem', color: previewTheme === 'dark' ? '#94a3b8' : '#64748b', marginTop: '3px', marginBottom: 0 }}>
                                {rm.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
