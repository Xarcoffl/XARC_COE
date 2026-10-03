'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Achievement, AchievementCategory } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Star,
  Save,
  Award,
  Trophy,
  ExternalLink,
  Eye,
  Sun,
  Moon,
  Search,
  Calendar,
  Users,
  Check,
  Building,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';

const TROPHY_PRESETS = [
  { label: 'National Hackathon Trophy', url: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?q=80&w=1000&auto=format&fit=crop' },
  { label: 'IEEE Best Research Paper', url: 'https://images.unsplash.com/photo-1579389083078-4e7018379f7e?q=80&w=1000&auto=format&fit=crop' },
  { label: 'Published Patent & IP', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop' },
  { label: 'Global Spatial Finalist', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000&auto=format&fit=crop' },
  { label: 'XR Innovation Fellowship', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop' },
  { label: 'Industry Capstone PPO', url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1000&auto=format&fit=crop' },
];

export default function AdminAchievementsStudioPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAch, setSelectedAch] = useState<Partial<Achievement> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'split' | 'editor' | 'preview'>('split');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const router = useRouter();

  const fetchAchievements = async () => {
    try {
      const res = await fetch('/api/admin/achievements');
      if (res.status === 401) {
        router.push('/control/auth');
        return;
      }
      const data = await res.json();
      if (data.success && data.achievements?.length > 0) {
        setAchievements(data.achievements);
        if (!selectedAch && !isNew) {
          setSelectedAch(data.achievements[0]);
        } else if (selectedAch && !isNew) {
          const updated = data.achievements.find((a: Achievement) => a.id === selectedAch.id);
          if (updated) setSelectedAch(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleOpenNew = () => {
    setIsNew(true);
    setSelectedAch({
      id: `ach-${Date.now()}`,
      title: '',
      category: 'Hackathon',
      year: new Date().getFullYear().toString(),
      date: 'Recent Milestone',
      description: '',
      student_team: 'Student Lead & Squad Members',
      department: 'Computer Science and Engineering',
      image: TROPHY_PRESETS[0].url,
      supporting_info: '',
      is_featured: false,
      is_published: true,
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedAch || !selectedAch.title?.trim()) {
      setMsg({ text: 'Achievement title is required.', type: 'error' });
      return;
    }
    setSaving(true);
    setMsg(null);

    try {
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/achievements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedAch),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: isNew ? 'Achievement created.' : 'Achievement updated.', type: 'success' });
        setIsNew(false);
        fetchAchievements();
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ text: 'Failed to save achievement.', type: 'error' });
      }
    } catch {
      setMsg({ text: 'A network error occurred.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete achievement: "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/achievements?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Achievement removed.', type: 'success' });
        const remaining = achievements.filter((a) => a.id !== id);
        setAchievements(remaining);
        setSelectedAch(remaining[0] || null);
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error deleting achievement:', err);
    }
  };

  const categories: string[] = [
    'All',
    'Hackathon',
    'Competition',
    'Conference',
    'Internship',
    'Patent',
    'Award',
    'Certification',
    'Project',
    'Placement / PPO',
  ];

  const filteredAchievements = achievements.filter((a) => {
    const matchCat = filterCategory === 'All' || a.category === filterCategory;
    const matchQuery =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.student_team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminHeader
          title="Achievements & Accolades Studio"
          subtitle="Dual-pane interactive management of student hackathon victories, patents, and awards with live simulated preview"
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
                <span>Add Achievement</span>
              </button>
              <Link
                href="/achievements"
                target="_blank"
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                <ExternalLink size={13} />
                <span>Test Live /achievements</span>
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
            {/* LEFT COLUMN: ACHIEVEMENTS BROWSER & FORM EDITOR */}
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
                        placeholder="Search awards, teams..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '34px' }}
                      />
                    </div>
                  </div>

                  {/* Horizontal Achievement Selector Chips */}
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                    {loading ? (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Loading accolades...</span>
                    ) : filteredAchievements.length === 0 ? (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No matching achievements found.</span>
                    ) : (
                      filteredAchievements.map((ach) => {
                        const isSelected = selectedAch?.id === ach.id && !isNew;
                        return (
                          <button
                            key={ach.id}
                            type="button"
                            onClick={() => {
                              setSelectedAch(ach);
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
                              src={ach.image}
                              alt=""
                              style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {ach.title}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>{ach.year}</span>
                                <span>•</span>
                                <span>{ach.category}</span>
                              </div>
                            </div>
                            {ach.is_featured && <Star size={12} fill="#eab308" color="#eab308" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 2. Achievement Editor Form */}
                {selectedAch ? (
                  <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Section: Achievement Metadata */}
                    <div className="admin-card">
                      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="admin-card-title">
                          {isNew ? 'ADD NEW ACCOLADE' : `EDIT: ${selectedAch.title || 'Untitled'}`}
                        </h3>
                        <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                          {selectedAch.category}
                        </span>
                      </div>
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">Accolade / Trophy Title</label>
                          <input
                            type="text"
                            className="admin-input"
                            placeholder="e.g. 1st Prize – National Smart India Hackathon (SIH 2025)"
                            value={selectedAch.title || ''}
                            onChange={(e) => setSelectedAch({ ...selectedAch, title: e.target.value })}
                            required
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                          <div>
                            <label className="admin-field-label">Category</label>
                            <select
                              className="admin-select"
                              value={selectedAch.category || 'Hackathon'}
                              onChange={(e) =>
                                setSelectedAch({ ...selectedAch, category: e.target.value as AchievementCategory })
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
                            <label className="admin-field-label">Year</label>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="2026"
                              value={selectedAch.year || ''}
                              onChange={(e) => setSelectedAch({ ...selectedAch, year: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="admin-field-label">Milestone Date</label>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="October 2025"
                              value={selectedAch.date || ''}
                              onChange={(e) => setSelectedAch({ ...selectedAch, date: e.target.value })}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label className="admin-field-label">Student Team / Squad Members</label>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="Vigneshwaran S, Ananya K, Rahul M"
                              value={selectedAch.student_team || ''}
                              onChange={(e) => setSelectedAch({ ...selectedAch, student_team: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="admin-field-label">Department / College</label>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="Dept of Computer Science & Engineering"
                              value={selectedAch.department || ''}
                              onChange={(e) => setSelectedAch({ ...selectedAch, department: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="admin-field-label">Supporting Proof / Verification Link</label>
                          <input
                            type="url"
                            className="admin-input"
                            placeholder="https://..."
                            value={selectedAch.supporting_info || ''}
                            onChange={(e) => setSelectedAch({ ...selectedAch, supporting_info: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section: Certificate / Trophy Photo & Presets */}
                    <div className="admin-card">
                      <div className="admin-card-header">
                        <h3 className="admin-card-title">CERTIFICATE & TROPHY PHOTOGRAPH</h3>
                      </div>
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">Image URL</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="url"
                              className="admin-input"
                              value={selectedAch.image || ''}
                              onChange={(e) => setSelectedAch({ ...selectedAch, image: e.target.value })}
                            />
                            {selectedAch.image && (
                              <img
                                src={selectedAch.image}
                                alt="Preview"
                                style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                              />
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="admin-field-label">Curated Accolade Visual Presets</label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                            {TROPHY_PRESETS.map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => setSelectedAch({ ...selectedAch, image: preset.url })}
                                style={{
                                  background: 'var(--surface-card-alt)',
                                  border: selectedAch.image === preset.url ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
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

                    {/* Section: Narrative Description */}
                    <div className="admin-card">
                      <div className="admin-card-header">
                        <h3 className="admin-card-title">DESCRIPTION & IMPACT NARRATIVE</h3>
                      </div>
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">Accomplishment Summary & Citation</label>
                          <textarea
                            className="admin-textarea"
                            rows={4}
                            placeholder="Detail the competition scope, project submitted, prize amount, jury feedback..."
                            value={selectedAch.description || ''}
                            onChange={(e) => setSelectedAch({ ...selectedAch, description: e.target.value })}
                          />
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.84rem' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(selectedAch.is_featured)}
                            onChange={(e) => setSelectedAch({ ...selectedAch, is_featured: e.target.checked })}
                          />
                          <span>Feature on Hub & Homepage</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.84rem' }}>
                          <input
                            type="checkbox"
                            checked={selectedAch.is_published !== false}
                            onChange={(e) => setSelectedAch({ ...selectedAch, is_published: e.target.checked })}
                          />
                          <span>Publicly Published</span>
                        </label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {!isNew && selectedAch.id && (
                          <button
                            type="button"
                            onClick={() => handleDelete(selectedAch.id!, selectedAch.title || '')}
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
                          <span>{saving ? 'Saving...' : isNew ? 'Publish Accolade' : 'Save Changes'}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                ) : null}
              </div>
            )}

            {/* RIGHT COLUMN: SCROLLABLE LIVE SYNCED PREVIEW */}
            {activeTab !== 'editor' && selectedAch && (
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
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE ACCOLADE PREVIEW</span>
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
                      https://coe.arvr.edu/achievements
                    </div>
                  </div>

                  {/* PREVIEW CONTAINER BODY */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Achievement Card Simulation */}
                    <div
                      style={{
                        borderRadius: '12px',
                        background: previewTheme === 'dark' ? '#0f172a' : '#ffffff',
                        border: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(2, 132, 199, 0.25)',
                        overflow: 'hidden',
                        boxShadow: previewTheme === 'dark' ? '0 10px 25px rgba(0,0,0,0.5)' : '0 10px 25px rgba(2, 132, 199, 0.1)',
                      }}
                    >
                      {/* Photo Header */}
                      <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
                        <img
                          src={selectedAch.image || TROPHY_PRESETS[0].url}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            background: 'rgba(15, 23, 42, 0.85)',
                            backdropFilter: 'blur(8px)',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                          }}
                        >
                          {selectedAch.category}
                        </div>
                        <div
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: '#7c3aed',
                            color: '#ffffff',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                          }}
                        >
                          {selectedAch.year}
                        </div>
                      </div>

                      {/* Content */}
                      <div style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#0284c7', fontWeight: 700, marginBottom: '6px' }}>
                          <Trophy size={14} />
                          <span>{selectedAch.date || 'Milestone Record'}</span>
                        </div>

                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: previewTheme === 'dark' ? '#f8fafc' : '#0f172a', marginBottom: '8px', lineHeight: 1.3 }}>
                          {selectedAch.title || 'Untitled Achievement'}
                        </h3>

                        <p style={{ fontSize: '0.82rem', color: previewTheme === 'dark' ? '#cbd5e1' : '#475569', lineHeight: '1.5', marginBottom: '14px' }}>
                          {selectedAch.description || 'Achievement narrative description will appear here...'}
                        </p>

                        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: previewTheme === 'dark' ? '#94a3b8' : '#64748b' }}>
                            <Users size={12} style={{ color: '#7c3aed' }} />
                            <span>Team: <strong style={{ color: previewTheme === 'dark' ? '#f1f5f9' : '#1e293b' }}>{selectedAch.student_team}</strong></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: previewTheme === 'dark' ? '#94a3b8' : '#64748b' }}>
                            <Building size={12} style={{ color: '#ec4899' }} />
                            <span>{selectedAch.department}</span>
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
