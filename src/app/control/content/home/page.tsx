'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { HomeContent } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  Layout,
  Compass,
  ArrowRight,
  Layers,
  Wand2,
  RefreshCw,
  Plus,
  Trash2,
  Sun,
  Moon,
} from 'lucide-react';

const PRESET_THEMES: Record<string, { label: string; data: Partial<HomeContent> }> = {
  spatial: {
    label: 'Spatial Computing Lab',
    data: {
      hero: {
        title: 'Centre of Excellence in Spatial Computing & XR',
        subtitle: 'NEXT-GENERATION IMMERSIVE RESEARCH & ENGINEERING',
        description: 'Advancing research, prototyping, and industry-grade development across Augmented Reality, Virtual Reality, Mixed Reality, and Spatial AI systems.',
        primary_cta_label: 'Explore Research Verticals',
        secondary_cta_label: 'Enter 3D Universe',
      },
      about_preview: {
        heading: 'Pioneering Spatial Computing & Interactive Realities',
        description: 'A multidisciplinary engineering hub bridging cutting-edge academic research with industrial XR deployment.',
        pillars: [
          { tag: 'RESEARCH', title: 'XR Engineering', desc: 'Developing high-fidelity spatial engines and perceptual computing pipelines.' },
          { tag: 'HARDWARE', title: 'Haptic & Optics Lab', desc: 'Custom optical waveguides, low-latency tracking, and neural haptic interfaces.' },
          { tag: 'COLLABORATION', title: 'Industry Ventures', desc: 'Direct technical pipelines with enterprise spatial computing partners.' },
        ],
      },
      journey: {
        heading: 'From First Principles to Enterprise XR Deployment',
        description: 'A structured developmental framework guiding student engineers from spatial fundamentals to published breakthroughs.',
      },
      join_cta: {
        heading: 'Ready to Pioneer the Spatial Frontier?',
        subheading: 'JOIN THE AR/VR CO-WORKING LAB',
        description: 'Collaborate with multidisciplinary research cohorts, access specialized spatial computing rigs, and develop patentable immersive systems.',
        cta_label: 'Submit Membership Request',
      },
    },
  },
  metaverse: {
    label: 'Industrial Metaverse & Digital Twins',
    data: {
      hero: {
        title: 'Industrial Metaverse & Real-Time Simulation Hub',
        subtitle: 'PHYSICALLY ACCURATE SPATIAL TWINS & TELEOPERATION',
        description: 'Connecting physical operations to real-time spatial digital twins through sensor telemetry, edge computing, and immersive visualization.',
        primary_cta_label: 'View Digital Twin Projects',
        secondary_cta_label: 'Launch Telemetry HUD',
      },
      about_preview: {
        heading: 'Architecting Real-Time Cyber-Physical Ecosystems',
        description: 'High-throughput simulation, robotic telepresence, and spatial data visualization for industry 4.0 environments.',
        pillars: [
          { tag: 'TWINS', title: 'Digital Twin Simulators', desc: 'Physics-accurate synchronized enterprise replicas.' },
          { tag: 'TELEPRESENCE', title: 'Spatial Robotics', desc: 'Low-latency remote operation with stereoscopic tele-immersion.' },
          { tag: 'DATA', title: 'Spatial Telemetry', desc: 'Real-time spatial data stream rendering and sensor fusion.' },
        ],
      },
      journey: {
        heading: 'Empowering Spatial Computing Engineers',
        description: 'Direct hands-on experience deploying enterprise simulations on enterprise headsets and spatial display setups.',
      },
      join_cta: {
        heading: 'Build the Real-Time Spatial Future With Us',
        subheading: 'ANNUAL STUDENT RESEARCH COHORT',
        description: 'Gain credentialed lab access, build production-grade portfolios, and publish peer-reviewed spatial simulations.',
        cta_label: 'Apply for Lab Intake',
      },
    },
  },
};

export default function AdminHomeContentPage() {
  const [content, setContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'journey' | 'cta'>('hero');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/content?section=home')
      .then((res) => {
        if (res.status === 401) {
          router.push('/control/auth');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.success) {
          setContent(data.content);
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
        body: JSON.stringify({ section: 'home', content }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Home page content updated successfully.', type: 'success' });
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

  const applyPreset = (key: string) => {
    if (!content) return;
    const preset = PRESET_THEMES[key];
    if (!preset) return;
    setContent({
      ...content,
      hero: { ...content.hero, ...(preset.data.hero || {}) },
      about_preview: {
        ...content.about_preview,
        ...(preset.data.about_preview || {}),
        pillars: preset.data.about_preview?.pillars || content.about_preview.pillars || [],
      },
      journey: { ...content.journey, ...(preset.data.journey || {}) },
      join_cta: { ...content.join_cta, ...(preset.data.join_cta || {}) },
    });
    setMsg({ text: `Applied "${preset.label}" preset copy! Remember to save changes.`, type: 'success' });
    setTimeout(() => setMsg(null), 3500);
  };

  const updatePillar = (idx: number, field: 'tag' | 'title' | 'desc', val: string) => {
    if (!content) return;
    const pillars = [...(content.about_preview.pillars || [])];
    pillars[idx] = { ...pillars[idx], [field]: val };
    setContent({
      ...content,
      about_preview: { ...content.about_preview, pillars },
    });
  };

  const addPillar = () => {
    if (!content) return;
    const pillars = [...(content.about_preview.pillars || [])];
    pillars.push({ tag: 'INNOVATION', title: 'New Focus Area', desc: 'Describe the research focus or capability.' });
    setContent({
      ...content,
      about_preview: { ...content.about_preview, pillars },
    });
  };

  const removePillar = (idx: number) => {
    if (!content) return;
    const pillars = (content.about_preview.pillars || []).filter((_, i) => i !== idx);
    setContent({
      ...content,
      about_preview: { ...content.about_preview, pillars },
    });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminHeader
          title="Interactive Home Content Studio"
          subtitle="Configure copy, interactive pillars, and CTA parameters with live split-screen preview"
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
              Loading interactive homepage slots...
            </div>
          ) : content ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1.1fr) minmax(400px, 1fr)', gap: '24px', alignItems: 'start' }}>
              
              {/* LEFT COLUMN: INTERACTIVE FORM & CONTROLS */}
              <div>
                {/* PRESETS TOOLBAR */}
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
                    <span style={{ fontWeight: 600 }}>Quick Presets:</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Object.entries(PRESET_THEMES).map(([k, p]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => applyPreset(k)}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        style={{ fontSize: '0.78rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Sparkles size={12} />
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* NAVIGATION TABS */}
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
                    { id: 'hero', label: '01 Hero', icon: Sparkles },
                    { id: 'about', label: '02 About & Pillars', icon: Layout },
                    { id: 'journey', label: '03 Journey', icon: Compass },
                    { id: 'cta', label: '04 Final CTA', icon: ArrowRight },
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
                          fontSize: '0.82rem',
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

                {/* TAB 1: HERO */}
                {activeTab === 'hero' && (
                  <div className="admin-card" style={{ marginBottom: '20px' }}>
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">01 // HERO BANNER CONFIGURATION</h3>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <label className="admin-field-label" style={{ marginBottom: 0 }}>Hero Main Title</label>
                          <span style={{ fontSize: '0.75rem', color: (content.hero.title.length > 50) ? '#f59e0b' : 'var(--text-muted)' }}>
                            {content.hero.title.length} chars
                          </span>
                        </div>
                        <input
                          type="text"
                          className="admin-input"
                          value={content.hero.title}
                          onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <label className="admin-field-label" style={{ marginBottom: 0 }}>Badge / Eyebrow Tagline</label>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {content.hero.subtitle.length} chars
                          </span>
                        </div>
                        <input
                          type="text"
                          className="admin-input"
                          value={content.hero.subtitle}
                          onChange={(e) => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <label className="admin-field-label" style={{ marginBottom: 0 }}>Hero Description Narrative</label>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {content.hero.description.length} chars
                          </span>
                        </div>
                        <textarea
                          className="admin-textarea"
                          rows={3}
                          value={content.hero.description}
                          onChange={(e) => setContent({ ...content, hero: { ...content.hero, description: e.target.value } })}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">Primary CTA Button</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={content.hero.primary_cta_label}
                            onChange={(e) => setContent({ ...content, hero: { ...content.hero, primary_cta_label: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="admin-field-label">Secondary CTA Button</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={content.hero.secondary_cta_label}
                            onChange={(e) => setContent({ ...content, hero: { ...content.hero, secondary_cta_label: e.target.value } })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ABOUT PREVIEW & PILLARS */}
                {activeTab === 'about' && (
                  <div className="admin-card" style={{ marginBottom: '20px' }}>
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">02 // ABOUT PREVIEW & CORE PILLARS</h3>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label className="admin-field-label">Section Heading</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={content.about_preview.heading}
                          onChange={(e) => setContent({ ...content, about_preview: { ...content.about_preview, heading: e.target.value } })}
                        />
                      </div>

                      <div>
                        <label className="admin-field-label">Section Description</label>
                        <textarea
                          className="admin-textarea"
                          rows={3}
                          value={content.about_preview.description}
                          onChange={(e) => setContent({ ...content, about_preview: { ...content.about_preview, description: e.target.value } })}
                        />
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Interactive Core Pillars ({content.about_preview.pillars?.length || 0})
                          </span>
                          <button
                            type="button"
                            onClick={addPillar}
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                          >
                            <Plus size={13} />
                            <span>Add Pillar</span>
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {(content.about_preview.pillars || []).map((pillar, idx) => (
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
                                    placeholder="TAG"
                                    value={pillar.tag}
                                    onChange={(e) => updatePillar(idx, 'tag', e.target.value)}
                                    style={{ fontSize: '0.75rem', fontWeight: 700, padding: '6px 8px' }}
                                  />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="Pillar Title"
                                    value={pillar.title}
                                    onChange={(e) => updatePillar(idx, 'title', e.target.value)}
                                    style={{ fontSize: '0.85rem', fontWeight: 600, padding: '6px 10px' }}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removePillar(idx)}
                                  style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#ef4444',
                                    padding: '6px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                  }}
                                  title="Remove Pillar"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <textarea
                                className="admin-textarea"
                                rows={2}
                                placeholder="Pillar concise description..."
                                value={pillar.desc}
                                onChange={(e) => updatePillar(idx, 'desc', e.target.value)}
                                style={{ fontSize: '0.82rem' }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: STUDENT JOURNEY */}
                {activeTab === 'journey' && (
                  <div className="admin-card" style={{ marginBottom: '20px' }}>
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">03 // STUDENT JOURNEY PIPELINE</h3>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label className="admin-field-label">Journey Heading</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={content.journey.heading}
                          onChange={(e) => setContent({ ...content, journey: { ...content.journey, heading: e.target.value } })}
                        />
                      </div>

                      <div>
                        <label className="admin-field-label">Journey Narrative Summary</label>
                        <textarea
                          className="admin-textarea"
                          rows={3}
                          value={content.journey.description}
                          onChange={(e) => setContent({ ...content, journey: { ...content.journey, description: e.target.value } })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: FINAL CTA */}
                {activeTab === 'cta' && (
                  <div className="admin-card" style={{ marginBottom: '20px' }}>
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">04 // FINAL JOIN CALL-TO-ACTION</h3>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label className="admin-field-label">CTA Banner Heading</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={content.join_cta.heading}
                          onChange={(e) => setContent({ ...content, join_cta: { ...content.join_cta, heading: e.target.value } })}
                        />
                      </div>

                      <div>
                        <label className="admin-field-label">Subheading / Badge</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={content.join_cta.subheading}
                          onChange={(e) => setContent({ ...content, join_cta: { ...content.join_cta, subheading: e.target.value } })}
                        />
                      </div>

                      <div>
                        <label className="admin-field-label">CTA Description</label>
                        <textarea
                          className="admin-textarea"
                          rows={3}
                          value={content.join_cta.description}
                          onChange={(e) => setContent({ ...content, join_cta: { ...content.join_cta, description: e.target.value } })}
                        />
                      </div>

                      <div>
                        <label className="admin-field-label">Action Button Text</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={content.join_cta.cta_label}
                          onChange={(e) => setContent({ ...content, join_cta: { ...content.join_cta, cta_label: e.target.value } })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ACTION BAR */}
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
                    All changes previewed live on the right.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="admin-btn admin-btn-primary"
                    style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Save size={16} />
                    <span>{saving ? 'Publishing...' : 'Save & Publish Homepage'}</span>
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
                      https://coe.arvr.edu/
                    </div>
                  </div>

                  {/* PREVIEW CONTAINER BODY */}
                  <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    
                    {/* HERO PREVIEW */}
                    <div
                      style={{
                        padding: '24px',
                        borderRadius: '12px',
                        background: previewTheme === 'dark'
                          ? 'radial-gradient(ellipse at top, rgba(2, 132, 199, 0.15) 0%, rgba(15, 23, 42, 0.4) 100%)'
                          : 'radial-gradient(ellipse at top, rgba(2, 132, 199, 0.12) 0%, rgba(248, 250, 252, 0.8) 100%)',
                        border: previewTheme === 'dark' ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid rgba(2, 132, 199, 0.25)',
                        position: 'relative',
                        boxShadow: activeTab === 'hero' ? '0 0 0 2px var(--accent-primary)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-block',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          color: '#0284c7',
                          background: previewTheme === 'dark' ? 'rgba(2, 132, 199, 0.15)' : 'rgba(2, 132, 199, 0.12)',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          marginBottom: '10px',
                        }}
                      >
                        {content.hero.subtitle || 'EYEBROW TAGLINE'}
                      </div>
                      <h2
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          lineHeight: 1.25,
                          marginBottom: '10px',
                          color: previewTheme === 'dark' ? '#f8fafc' : '#0f172a',
                        }}
                      >
                        {content.hero.title || 'Hero Main Title'}
                      </h2>
                      <p
                        style={{
                          fontSize: '0.82rem',
                          lineHeight: 1.5,
                          color: previewTheme === 'dark' ? '#94a3b8' : '#475569',
                          marginBottom: '16px',
                        }}
                      >
                        {content.hero.description || 'Hero description narrative...'}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            background: 'linear-gradient(135deg, #0284c7, #6366f1)',
                            color: '#ffffff',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {content.hero.primary_cta_label}
                          <ArrowRight size={12} />
                        </span>
                        <span
                          style={{
                            background: previewTheme === 'dark' ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
                            color: previewTheme === 'dark' ? '#cbd5e1' : '#334155',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {content.hero.secondary_cta_label}
                        </span>
                      </div>
                    </div>

                    {/* ABOUT PREVIEW */}
                    <div
                      style={{
                        padding: '18px',
                        borderRadius: '10px',
                        background: previewTheme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        border: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                        boxShadow: activeTab === 'about' ? '0 0 0 2px var(--accent-primary)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8b5cf6', letterSpacing: '0.08em' }}>ABOUT PREVIEW</span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '6px 0 8px 0', color: previewTheme === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                        {content.about_preview.heading}
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: previewTheme === 'dark' ? '#94a3b8' : '#64748b', marginBottom: '12px' }}>
                        {content.about_preview.description}
                      </p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                        {(content.about_preview.pillars || []).map((p, i) => (
                          <div
                            key={i}
                            style={{
                              background: previewTheme === 'dark' ? 'rgba(255,255,255,0.04)' : '#ffffff',
                              border: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
                              borderRadius: '6px',
                              padding: '8px',
                            }}
                          >
                            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#38bdf8' }}>{p.tag}</span>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, marginTop: '2px', color: previewTheme === 'dark' ? '#e2e8f0' : '#1e293b' }}>{p.title}</div>
                            <div style={{ fontSize: '0.7rem', color: previewTheme === 'dark' ? '#94a3b8' : '#64748b', marginTop: '2px' }}>{p.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* JOURNEY PREVIEW */}
                    <div
                      style={{
                        padding: '16px',
                        borderRadius: '10px',
                        background: previewTheme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        border: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                        boxShadow: activeTab === 'journey' ? '0 0 0 2px var(--accent-primary)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#ec4899', letterSpacing: '0.08em' }}>STUDENT JOURNEY</span>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '4px 0 6px 0', color: previewTheme === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                        {content.journey.heading}
                      </h3>
                      <p style={{ fontSize: '0.76rem', color: previewTheme === 'dark' ? '#94a3b8' : '#64748b' }}>
                        {content.journey.description}
                      </p>
                    </div>

                    {/* CTA PREVIEW */}
                    <div
                      style={{
                        padding: '20px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)',
                        color: '#ffffff',
                        textAlign: 'center',
                        boxShadow: activeTab === 'cta' ? '0 0 0 2px #38bdf8' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.12em', color: '#cbd5e1', textTransform: 'uppercase' }}>
                        {content.join_cta.subheading}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '6px 0 8px 0', color: '#ffffff' }}>
                        {content.join_cta.heading}
                      </h3>
                      <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.85)', marginBottom: '14px', maxWidth: '340px', margin: '0 auto 14px auto' }}>
                        {content.join_cta.description}
                      </p>
                      <button
                        type="button"
                        style={{
                          background: '#ffffff',
                          color: '#4338ca',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 18px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {content.join_cta.cta_label}
                      </button>
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
