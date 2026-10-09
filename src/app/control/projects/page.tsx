'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import ImageUploadField from '@/components/admin/ImageUploadField';
import VrDeviceLoader from '@/components/VrDeviceLoader';
import { Project, ProjectCategory } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Star,
  Save,
  Eye,
  Search,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Image as ImageIcon,
  Users,
  Code,
  Check,
  X,
} from 'lucide-react';

const CATEGORIES: ProjectCategory[] = ['AR', 'VR', 'MR', 'XR', '3D', 'SIMULATION'];

const SAMPLE_COVERS = [
  'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop',
];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Partial<Project> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editorTab, setEditorTab] = useState<'identity' | 'narrative' | 'squad' | 'gallery'>('identity');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [newTech, setNewTech] = useState('');
  const [newTeamMember, setNewTeamMember] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const router = useRouter();

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/admin/projects');
      if (res.status === 401) {
        router.push('/control/auth');
        return;
      }
      const data = await res.json();
      if (data.success && data.projects) {
        setProjects(data.projects);
        if (!selectedProject && data.projects.length > 0) {
          setSelectedProject(data.projects[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenNew = () => {
    setIsNew(true);
    setSelectedProject({
      title: 'New Spatial Research Project',
      slug: 'new-spatial-project',
      category: 'VR',
      cover_image: SAMPLE_COVERS[0],
      short_desc: 'Short executive summary of the spatial computing project prototype.',
      full_desc: 'Comprehensive engineering details, optics pipelines, and methodology.',
      problem: 'Specific industrial, clinical, or technical bottleneck addressed.',
      solution: 'Immersive architecture, spatial interfaces, and hardware rigs utilized.',
      technologies: ['Unity 6', 'OpenXR', 'C#', 'Blender'],
      team: ['Student Lead (CSE)', 'Hardware Specialist (ECE)'],
      mentor: 'Faculty Research Mentor',
      result_outcome: 'Measured performance outcomes and field deployment metrics.',
      gallery: [SAMPLE_COVERS[1]],
      video_url: '',
      is_featured: true,
      is_published: true,
    });
    setEditorTab('identity');
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedProject) return;
    setSaving(true);
    setMsg(null);

    try {
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedProject),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: isNew ? 'Project created successfully.' : 'Project updated successfully.', type: 'success' });
        setIsNew(false);
        fetchProjects();
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ text: data.message || 'Failed to save project.', type: 'error' });
      }
    } catch {
      setMsg({ text: 'A network error occurred.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete project: "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Project deleted.', type: 'success' });
        fetchProjects();
        setTimeout(() => setMsg(null), 2500);
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const handleAddTech = () => {
    if (!selectedProject || !newTech.trim()) return;
    const techs = [...(selectedProject.technologies || [])];
    if (!techs.includes(newTech.trim())) {
      techs.push(newTech.trim());
      setSelectedProject({ ...selectedProject, technologies: techs });
    }
    setNewTech('');
  };

  const handleRemoveTech = (t: string) => {
    if (!selectedProject) return;
    const techs = (selectedProject.technologies || []).filter((item) => item !== t);
    setSelectedProject({ ...selectedProject, technologies: techs });
  };

  const handleAddTeamMember = () => {
    if (!selectedProject || !newTeamMember.trim()) return;
    const team = [...(selectedProject.team || []), newTeamMember.trim()];
    setSelectedProject({ ...selectedProject, team });
    setNewTeamMember('');
  };

  const handleRemoveTeamMember = (index: number) => {
    if (!selectedProject) return;
    const team = (selectedProject.team || []).filter((_, i) => i !== index);
    setSelectedProject({ ...selectedProject, team });
  };

  const handleAddGalleryImage = () => {
    if (!selectedProject || !newGalleryUrl.trim()) return;
    const gallery = [...(selectedProject.gallery || []), newGalleryUrl.trim()];
    setSelectedProject({ ...selectedProject, gallery });
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    if (!selectedProject) return;
    const gallery = (selectedProject.gallery || []).filter((_, i) => i !== index);
    setSelectedProject({ ...selectedProject, gallery });
  };

  const filteredProjects = projects.filter((p) => {
    const matchesCat = activeCategory === 'ALL' || p.category === activeCategory;
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.short_desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminHeader
          title="Projects Showcase Studio"
          subtitle="Manage immersive research prototypes, industry capstones, and live card previews"
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

          {/* TOP TOOLBAR: FILTER & SEARCH */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {['ALL', ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    background: activeCategory === cat ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'var(--surface-input)',
                    color: activeCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: activeCategory === cat ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="admin-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '32px', paddingRight: '12px', width: '200px', fontSize: '0.82rem' }}
                />
              </div>

              <button
                type="button"
                onClick={handleOpenNew}
                className="admin-btn admin-btn-primary admin-btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                <span>+ Add Project</span>
              </button>
            </div>
          </div>

          {/* PROJECT SELECTOR STRIP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {filteredProjects.map((p) => {
              const isSel = selectedProject?.id === p.id && !isNew;
              return (
                <div
                  key={p.id}
                  onClick={() => { setIsNew(false); setSelectedProject(p); }}
                  style={{
                    background: isSel
                      ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.15), rgba(99, 102, 241, 0.15))'
                      : 'var(--surface-card)',
                    border: isSel ? '2px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                    borderRadius: '10px',
                    padding: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    boxShadow: isSel ? '0 4px 16px rgba(2, 132, 199, 0.25)' : 'var(--shadow-subtle)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <img
                    src={p.cover_image}
                    alt={p.title}
                    style={{ width: '46px', height: '46px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{p.category}</span>
                      {p.is_featured && <Star size={10} color="#f59e0b" fill="#f59e0b" />}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {loading ? (
            <VrDeviceLoader
              mode="card"
              title="LOADING PROJECT SHOWCASE..."
              subtext="Syncing 3D assets, project categories, and engineering specs"
              badge="PROJECT REGISTRY"
            />
          ) : selectedProject ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(460px, 1.2fr) minmax(380px, 1fr)', gap: '24px', alignItems: 'start' }}>
              
              {/* LEFT COLUMN: PROJECT EDITOR */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* EDITOR TABS */}
                <div
                  style={{
                    display: 'flex',
                    background: 'var(--surface-input)',
                    borderRadius: '10px',
                    padding: '4px',
                    gap: '4px',
                    border: '1px solid var(--border-glass)',
                  }}
                >
                  {[
                    { id: 'identity', label: '01 Identity & Media', icon: Sparkles },
                    { id: 'narrative', label: '02 Problem & Solution', icon: Layers },
                    { id: 'squad', label: '03 Tech & Squad', icon: Users },
                    { id: 'gallery', label: '04 Media Gallery', icon: ImageIcon },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = editorTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setEditorTab(tab.id as any)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? '#fff' : 'var(--text-muted)',
                          background: isActive ? 'linear-gradient(135deg, #0284c7, #6366f1)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Icon size={14} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: IDENTITY */}
                {editorTab === 'identity' && (
                  <div className="admin-card">
                    <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 className="admin-card-title">PROJECT IDENTITY & PUBLICATION</h3>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedProject({ ...selectedProject, is_featured: !selectedProject.is_featured })}
                          style={{
                            background: selectedProject.is_featured ? 'rgba(245, 158, 11, 0.15)' : 'var(--surface-input)',
                            border: `1px solid ${selectedProject.is_featured ? '#f59e0b' : 'var(--border-glass)'}`,
                            color: selectedProject.is_featured ? '#f59e0b' : 'var(--text-muted)',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Star size={12} fill={selectedProject.is_featured ? '#f59e0b' : 'none'} />
                          <span>{selectedProject.is_featured ? 'FEATURED' : 'STANDARD'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedProject({ ...selectedProject, is_published: !selectedProject.is_published })}
                          style={{
                            background: selectedProject.is_published ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            border: `1px solid ${selectedProject.is_published ? '#22c55e' : '#ef4444'}`,
                            color: selectedProject.is_published ? '#22c55e' : '#ef4444',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {selectedProject.is_published ? 'PUBLISHED' : 'DRAFT'}
                        </button>
                      </div>
                    </div>

                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">Category</label>
                          <select
                            className="admin-select"
                            value={selectedProject.category}
                            onChange={(e) => setSelectedProject({ ...selectedProject, category: e.target.value as any })}
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="admin-field-label">Project Title</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={selectedProject.title}
                            onChange={(e) => setSelectedProject({ ...selectedProject, title: e.target.value })}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">URL Slug</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={selectedProject.slug}
                            onChange={(e) => setSelectedProject({ ...selectedProject, slug: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="admin-field-label">Video Demo URL (Optional)</label>
                          <input
                            type="url"
                            className="admin-input"
                            placeholder="https://youtube.com/watch?v=..."
                            value={selectedProject.video_url || ''}
                            onChange={(e) => setSelectedProject({ ...selectedProject, video_url: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Cover Image Selector */}
                      <div>
                        <ImageUploadField
                          label="Cover Image Banner"
                          value={selectedProject.cover_image || ''}
                          onChange={(url) => setSelectedProject({ ...selectedProject, cover_image: url })}
                          category="projects"
                          helpText="Primary card banner and case study hero graphic."
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Quick Presets:</span>
                          {SAMPLE_COVERS.map((cov, i) => (
                            <img
                              key={i}
                              src={cov}
                              alt="thumb"
                              onClick={() => setSelectedProject({ ...selectedProject, cover_image: cov })}
                              style={{
                                width: '38px',
                                height: '28px',
                                borderRadius: '4px',
                                objectFit: 'cover',
                                cursor: 'pointer',
                                border: selectedProject.cover_image === cov ? '2px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: NARRATIVE */}
                {editorTab === 'narrative' && (
                  <div className="admin-card">
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">CASE STUDY PROBLEM & OUTCOME</h3>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label className="admin-field-label">Short Description (Cards & Previews)</label>
                        <textarea
                          className="admin-textarea"
                          rows={2}
                          value={selectedProject.short_desc}
                          onChange={(e) => setSelectedProject({ ...selectedProject, short_desc: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="admin-field-label">Full Technical Narrative</label>
                        <textarea
                          className="admin-textarea"
                          rows={3}
                          value={selectedProject.full_desc}
                          onChange={(e) => setSelectedProject({ ...selectedProject, full_desc: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="admin-field-label">Problem Statement</label>
                        <textarea
                          className="admin-textarea"
                          rows={2}
                          value={selectedProject.problem}
                          onChange={(e) => setSelectedProject({ ...selectedProject, problem: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="admin-field-label">Engineered Spatial Solution</label>
                        <textarea
                          className="admin-textarea"
                          rows={2}
                          value={selectedProject.solution}
                          onChange={(e) => setSelectedProject({ ...selectedProject, solution: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="admin-field-label">Measurable Result & Deployment Outcome</label>
                        <textarea
                          className="admin-textarea"
                          rows={2}
                          value={selectedProject.result_outcome}
                          onChange={(e) => setSelectedProject({ ...selectedProject, result_outcome: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: SQUAD */}
                {editorTab === 'squad' && (
                  <div className="admin-card">
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">TECH STACK, STUDENT SQUAD & MENTOR</h3>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      <div>
                        <label className="admin-field-label">Faculty / Industry Mentor</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={selectedProject.mentor}
                          onChange={(e) => setSelectedProject({ ...selectedProject, mentor: e.target.value })}
                        />
                      </div>

                      {/* Technologies */}
                      <div>
                        <label className="admin-field-label">Technologies & Frameworks Stack</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                          {(selectedProject.technologies || []).map((t) => (
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
                              <span onClick={() => handleRemoveTech(t)} style={{ cursor: 'pointer', fontWeight: 800 }}>×</span>
                            </span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            className="admin-input"
                            placeholder="e.g. Unity 6, WebXR, Unreal 5, LiDAR, PyTorch..."
                            value={newTech}
                            onChange={(e) => setNewTech(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTech(); } }}
                            style={{ flex: 1, padding: '7px 10px', fontSize: '0.82rem' }}
                          />
                          <button type="button" onClick={handleAddTech} className="admin-btn admin-btn-secondary admin-btn-sm">+ Add</button>
                        </div>
                      </div>

                      {/* Team Members */}
                      <div>
                        <label className="admin-field-label">Student Engineering Squad</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                          {(selectedProject.team || []).map((mem, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>•</span>
                              <input
                                type="text"
                                className="admin-input"
                                value={mem}
                                onChange={(e) => {
                                  const team = [...(selectedProject.team || [])];
                                  team[i] = e.target.value;
                                  setSelectedProject({ ...selectedProject, team });
                                }}
                                style={{ flex: 1, padding: '6px 10px', fontSize: '0.82rem' }}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveTeamMember(i)}
                                style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            className="admin-input"
                            placeholder="e.g. Rahul S. (Mechanical - Final Year)"
                            value={newTeamMember}
                            onChange={(e) => setNewTeamMember(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTeamMember(); } }}
                            style={{ flex: 1, padding: '7px 10px', fontSize: '0.82rem' }}
                          />
                          <button type="button" onClick={handleAddTeamMember} className="admin-btn admin-btn-secondary admin-btn-sm">+ Add Member</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: GALLERY */}
                {editorTab === 'gallery' && (
                  <div className="admin-card">
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">PROJECT VISUAL GALLERY</h3>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
                        {(selectedProject.gallery || []).map((img, i) => (
                          <div key={i} style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', height: '80px', border: '1px solid var(--border-glass)' }}>
                            <img src={img} alt="gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(i)}
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                background: 'rgba(0,0,0,0.6)',
                                border: 'none',
                                color: '#ef4444',
                                borderRadius: '4px',
                                padding: '2px',
                                cursor: 'pointer',
                              }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="url"
                          className="admin-input"
                          placeholder="https://images.unsplash.com/..."
                          value={newGalleryUrl}
                          onChange={(e) => setNewGalleryUrl(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddGalleryImage(); } }}
                          style={{ flex: 1, padding: '7px 10px', fontSize: '0.82rem' }}
                        />
                        <button type="button" onClick={handleAddGalleryImage} className="admin-btn admin-btn-secondary admin-btn-sm">+ Add Image</button>
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
                  <div>
                    {!isNew && selectedProject.id && (
                      <button
                        type="button"
                        onClick={() => handleDelete(selectedProject.id!, selectedProject.title!)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          padding: '8px 14px',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        Delete Project
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="admin-btn admin-btn-primary"
                    style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Save size={16} />
                    <span>{saving ? 'Saving...' : isNew ? 'Create & Publish Project' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: SCROLLABLE LIVE PREVIEW */}
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
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE PUBLIC CARD PREVIEW</span>
                  </div>

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
                    padding: '20px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                  }}
                >
                  {/* Public Project Card Mockup */}
                  <div
                    style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: previewTheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                      border: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ position: 'relative', height: '170px' }}>
                      <img
                        src={selectedProject.cover_image || SAMPLE_COVERS[0]}
                        alt={selectedProject.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          display: 'flex',
                          gap: '6px',
                        }}
                      >
                        <span style={{ background: '#0284c7', color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                          {selectedProject.category}
                        </span>
                        {selectedProject.is_featured && (
                          <span style={{ background: 'rgba(245, 158, 11, 0.9)', color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Star size={10} fill="#fff" />
                            FEATURED
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ padding: '18px' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 8px 0', color: previewTheme === 'dark' ? '#f8fafc' : '#0f172a', lineHeight: 1.3 }}>
                        {selectedProject.title}
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: previewTheme === 'dark' ? '#94a3b8' : '#475569', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                        {selectedProject.short_desc}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
                        {(selectedProject.technologies || []).map((t) => (
                          <span
                            key={t}
                            style={{
                              background: previewTheme === 'dark' ? 'rgba(2, 132, 199, 0.15)' : '#e0f2fe',
                              color: '#0284c7',
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              padding: '2px 7px',
                              borderRadius: '4px',
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div style={{ borderTop: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: previewTheme === 'dark' ? '#94a3b8' : '#64748b' }}>
                          Mentor: {selectedProject.mentor}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          Case Study <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Case Study Detail Preview */}
                  <div style={{ borderTop: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', paddingTop: '16px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', marginBottom: '8px' }}>
                      ENGINEERED SOLUTION & RESULTS:
                    </div>
                    <div style={{ fontSize: '0.75rem', color: previewTheme === 'dark' ? '#cbd5e1' : '#334155', lineHeight: 1.5, marginBottom: '10px' }}>
                      <strong>Solution:</strong> {selectedProject.solution}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: previewTheme === 'dark' ? '#cbd5e1' : '#334155', lineHeight: 1.5 }}>
                      <strong>Outcome:</strong> {selectedProject.result_outcome}
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
