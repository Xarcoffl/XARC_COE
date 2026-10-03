'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { IndustryRecord, IndustryCategory } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Handshake,
  ExternalLink,
  Eye,
  Sun,
  Moon,
  Search,
  Check,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const PARTNER_LOGO_PRESETS = [
  { label: 'Unity Academic Lab', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop' },
  { label: 'PTC Industrial IoT AR', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=400&auto=format&fit=crop' },
  { label: 'Qualcomm XR Research', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=400&auto=format&fit=crop' },
  { label: 'Epic Games Unreal Engine', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop' },
  { label: 'NVIDIA Omniverse Lab', url: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=400&auto=format&fit=crop' },
  { label: 'Meta Reality Labs Partner', url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=400&auto=format&fit=crop' },
];

export default function AdminIndustryStudioPage() {
  const [records, setRecords] = useState<IndustryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<Partial<IndustryRecord> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'split' | 'editor' | 'preview'>('split');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [newOutcome, setNewOutcome] = useState('');
  const router = useRouter();

  const fetchIndustry = async () => {
    try {
      const res = await fetch('/api/admin/industry');
      if (res.status === 401) {
        router.push('/control/auth');
        return;
      }
      const data = await res.json();
      if (data.success && data.industry_records?.length > 0) {
        setRecords(data.industry_records);
        if (!selectedRecord && !isNew) {
          setSelectedRecord(data.industry_records[0]);
        } else if (selectedRecord && !isNew) {
          const updated = data.industry_records.find((r: IndustryRecord) => r.id === selectedRecord.id);
          if (updated) setSelectedRecord(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching industry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndustry();
  }, []);

  const handleOpenNew = () => {
    setIsNew(true);
    setSelectedRecord({
      id: `ind-${Date.now()}`,
      name: '',
      category: 'Partner',
      logo: PARTNER_LOGO_PRESETS[0].url,
      description: '',
      date_or_term: 'MoU signed 2025–2028',
      collaboration_details: '',
      key_outcomes: [
        'Dedicated lab workstations and student licenses',
        'Industry capstone project mentorship',
        'Direct campus internship evaluations',
      ],
      is_published: true,
      order_index: records.length + 1,
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedRecord || !selectedRecord.name?.trim()) {
      setMsg({ text: 'Partner / Organization name is required.', type: 'error' });
      return;
    }
    setSaving(true);
    setMsg(null);

    try {
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/industry', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedRecord),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: isNew ? 'Collaboration record created.' : 'Collaboration record updated.', type: 'success' });
        setIsNew(false);
        fetchIndustry();
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ text: 'Failed to save record.', type: 'error' });
      }
    } catch {
      setMsg({ text: 'A network error occurred.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete industry collaboration with "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/industry?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Record deleted.', type: 'success' });
        const remaining = records.filter((r) => r.id !== id);
        setRecords(remaining);
        setSelectedRecord(remaining[0] || null);
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error deleting record:', err);
    }
  };

  const handleAddOutcome = () => {
    if (!selectedRecord || !newOutcome.trim()) return;
    const current = selectedRecord.key_outcomes || [];
    setSelectedRecord({ ...selectedRecord, key_outcomes: [...current, newOutcome.trim()] });
    setNewOutcome('');
  };

  const handleRemoveOutcome = (idx: number) => {
    if (!selectedRecord) return;
    const current = (selectedRecord.key_outcomes || []).filter((_, i) => i !== idx);
    setSelectedRecord({ ...selectedRecord, key_outcomes: current });
  };

  const categories: string[] = [
    'All',
    'Partner',
    'MoU',
    'Industrial Visit',
    'Expert Session',
    'Internship Collaboration',
    'Consultancy Project',
  ];

  const filteredRecords = records.filter((r) => {
    const matchCat = filterCategory === 'All' || r.category === filterCategory;
    const matchQuery =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminHeader
          title="Industry & MoU Studio"
          subtitle="Dual-pane interactive management of corporate partners, bilateral MoUs, and lab sponsorships with live simulated preview"
        />

        <div className="admin-content" style={{ maxWidth: '1440px' }}>
          {/* Top Control Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {/* View Mode Switchers */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`admin-btn admin-btn-sm ${activeTab === 'split' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              >
                Split View (Live Preview)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`admin-btn admin-btn-sm ${activeTab === 'editor' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              >
                Editor Only
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`admin-btn admin-btn-sm ${activeTab === 'preview' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              >
                Preview Only
              </button>
            </div>

            {/* Quick Actions & Live Link */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleOpenNew}
                className="admin-btn admin-btn-primary admin-btn-sm"
              >
                <Plus size={14} />
                <span>Add Partnership / MoU</span>
              </button>
              <Link
                href="/industry"
                target="_blank"
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                <ExternalLink size={13} />
                <span>Test Live /industry</span>
              </Link>
            </div>
          </div>

          {msg && (
            <div
              style={{
                background: msg.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${msg.type === 'success' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                borderRadius: '6px',
                padding: '12px 16px',
                color: msg.type === 'success' ? '#86efac' : '#fca5a5',
                fontSize: '0.88rem',
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

          {/* Dual-Pane Studio Layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                activeTab === 'split' ? '1.25fr 1fr' : activeTab === 'editor' ? '1fr' : '0fr 1fr',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* LEFT COLUMN: COLLABORATIONS BROWSER & FORM EDITOR */}
            {activeTab !== 'preview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 1. Category Filter & Search Bar */}
                <div className="admin-card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFilterCategory(cat)}
                          className={`admin-btn admin-btn-sm ${filterCategory === cat ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                          style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div style={{ position: 'relative', minWidth: '200px' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Search partners, MoUs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '34px' }}
                      />
                    </div>
                  </div>

                  {/* Horizontal Records Selector Chips */}
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                    {loading ? (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Loading partners...</span>
                    ) : filteredRecords.length === 0 ? (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No matching partnerships found.</span>
                    ) : (
                      filteredRecords.map((rec) => {
                        const isSelected = selectedRecord?.id === rec.id && !isNew;
                        return (
                          <button
                            key={rec.id}
                            type="button"
                            onClick={() => {
                              setSelectedRecord(rec);
                              setIsNew(false);
                            }}
                            style={{
                              background: isSelected ? 'rgba(2, 132, 199, 0.18)' : 'var(--surface-card-alt)',
                              border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              minWidth: '230px',
                              flexShrink: 0,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <img
                              src={rec.logo}
                              alt=""
                              style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {rec.name}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>{rec.category}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 2. Collaboration Editor Form */}
                {selectedRecord ? (
                  <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Section: Partner Information */}
                    <div className="admin-card">
                      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="admin-card-title">
                          {isNew ? 'ADD NEW PARTNERSHIP' : `EDIT: ${selectedRecord.name || 'Untitled'}`}
                        </h3>
                        <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                          {selectedRecord.category}
                        </span>
                      </div>
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">Organization / Partner Name</label>
                          <input
                            type="text"
                            className="admin-input"
                            placeholder="e.g. Unity Technologies Academic Alliance"
                            value={selectedRecord.name || ''}
                            onChange={(e) => setSelectedRecord({ ...selectedRecord, name: e.target.value })}
                            required
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label className="admin-field-label">Category</label>
                            <select
                              className="admin-select"
                              value={selectedRecord.category || 'Partner'}
                              onChange={(e) =>
                                setSelectedRecord({ ...selectedRecord, category: e.target.value as IndustryCategory })
                              }
                            >
                              {categories
                                .filter((c) => c !== 'All')
                                .map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                            </select>
                          </div>
                          <div>
                            <label className="admin-field-label">MoU Term / Status Label</label>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="MoU signed 2024–2027"
                              value={selectedRecord.date_or_term || ''}
                              onChange={(e) => setSelectedRecord({ ...selectedRecord, date_or_term: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="admin-field-label">Strategic Overview</label>
                          <textarea
                            className="admin-textarea"
                            rows={3}
                            placeholder="Brief description of the partnership scope and institutional goals..."
                            value={selectedRecord.description || ''}
                            onChange={(e) => setSelectedRecord({ ...selectedRecord, description: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="admin-field-label">Detailed Collaboration Mechanics</label>
                          <textarea
                            className="admin-textarea"
                            rows={3}
                            placeholder="Hardware rigs, software licensing, faculty development, capstone pipeline..."
                            value={selectedRecord.collaboration_details || ''}
                            onChange={(e) => setSelectedRecord({ ...selectedRecord, collaboration_details: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section: Partner Logo & Presets */}
                    <div className="admin-card">
                      <div className="admin-card-header">
                        <h3 className="admin-card-title">PARTNER BRANDING & LOGO</h3>
                      </div>
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">Logo Image URL</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="url"
                              className="admin-input"
                              value={selectedRecord.logo || ''}
                              onChange={(e) => setSelectedRecord({ ...selectedRecord, logo: e.target.value })}
                            />
                            {selectedRecord.logo && (
                              <img
                                src={selectedRecord.logo}
                                alt="Preview"
                                style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                              />
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="admin-field-label">Curated XR Enterprise Partner Presets</label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                            {PARTNER_LOGO_PRESETS.map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => setSelectedRecord({ ...selectedRecord, logo: preset.url })}
                                style={{
                                  background: 'var(--surface-card-alt)',
                                  border: selectedRecord.logo === preset.url ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                                  borderRadius: '6px',
                                  padding: '6px',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                }}
                              >
                                <img
                                  src={preset.url}
                                  alt=""
                                  style={{ width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover' }}
                                />
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                                  {preset.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section: Key Deliverables & Outcomes */}
                    <div className="admin-card">
                      <div className="admin-card-header">
                        <h3 className="admin-card-title">COLLABORATION OUTCOMES & DELIVERABLES</h3>
                      </div>
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            className="admin-input"
                            placeholder="Add deliverable (e.g. 50 Enterprise Unity Pro student licenses)..."
                            value={newOutcome}
                            onChange={(e) => setNewOutcome(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddOutcome();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddOutcome}
                            className="admin-btn admin-btn-primary admin-btn-sm"
                          >
                            <Plus size={14} />
                            <span>Add</span>
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {(selectedRecord.key_outcomes || []).map((outcome, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'var(--surface-card-alt)',
                                border: '1px solid var(--border-subtle)',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '0.84rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Check size={14} style={{ color: 'var(--accent-cyan)' }} />
                                <span>{outcome}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveOutcome(idx)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Visibility & Actions Bar */}
                    <div
                      style={{
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '12px',
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
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.84rem' }}>
                        <input
                          type="checkbox"
                          checked={selectedRecord.is_published !== false}
                          onChange={(e) => setSelectedRecord({ ...selectedRecord, is_published: e.target.checked })}
                        />
                        <span>Publicly Published</span>
                      </label>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {!isNew && selectedRecord.id && (
                          <button
                            type="button"
                            onClick={() => handleDelete(selectedRecord.id!, selectedRecord.name || '')}
                            className="admin-btn admin-btn-danger admin-btn-sm"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={saving}
                          className="admin-btn admin-btn-primary"
                          style={{ padding: '8px 20px' }}
                        >
                          <Save size={15} />
                          <span>{saving ? 'Saving...' : isNew ? 'Publish Partnership' : 'Save Changes'}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                ) : null}
              </div>
            )}

            {/* RIGHT COLUMN: SCROLLABLE LIVE SYNCED PREVIEW */}
            {activeTab !== 'editor' && selectedRecord && (
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
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE PARTNER PREVIEW</span>
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
                  {/* Browser Address Bar */}
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
                      https://coe.arvr.edu/industry
                    </div>
                  </div>

                  {/* PREVIEW CONTAINER BODY */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Industry Partner Card Simulation */}
                    <div
                      style={{
                        borderRadius: '12px',
                        background: previewTheme === 'dark' ? '#0f172a' : '#ffffff',
                        border: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(2, 132, 199, 0.25)',
                        overflow: 'hidden',
                        boxShadow: previewTheme === 'dark' ? '0 10px 25px rgba(0,0,0,0.5)' : '0 10px 25px rgba(2, 132, 199, 0.1)',
                      }}
                    >
                      <div style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={selectedRecord.logo || PARTNER_LOGO_PRESETS[0].url}
                              alt=""
                              style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                            />
                            <div>
                              <div style={{ fontSize: '0.7rem', color: '#0284c7', fontFamily: 'monospace', fontWeight: 700 }}>
                                {selectedRecord.category?.toUpperCase()}
                              </div>
                              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: previewTheme === 'dark' ? '#f8fafc' : '#0f172a', margin: '2px 0 0 0' }}>
                                {selectedRecord.name || 'Untitled Partner'}
                              </h3>
                            </div>
                          </div>

                          <span
                            style={{
                              fontSize: '0.68rem',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              background: previewTheme === 'dark' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.12)',
                              color: '#10b981',
                              fontWeight: 700,
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                            }}
                          >
                            {selectedRecord.date_or_term || 'Active MoU'}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.84rem', color: previewTheme === 'dark' ? '#cbd5e1' : '#475569', lineHeight: '1.55', marginBottom: '16px' }}>
                          {selectedRecord.description || 'Partnership description will appear here...'}
                        </p>

                        {/* Outcomes */}
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontFamily: 'monospace', fontWeight: 700, marginBottom: '8px' }}>
                            CORE DELIVERABLES & INFRASTRUCTURE:
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {(selectedRecord.key_outcomes || []).map((outcome, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.76rem', color: previewTheme === 'dark' ? '#e2e8f0' : '#334155' }}>
                                <Check size={13} style={{ color: '#0284c7', flexShrink: 0, marginTop: '2px' }} />
                                <span>{outcome}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
