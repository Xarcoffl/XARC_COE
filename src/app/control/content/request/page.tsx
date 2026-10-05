'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { RequestFormContent, CustomFormField } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  ExternalLink,
  Sparkles,
  Layers,
  Check,
  Sun,
  Moon,
  MoveUp,
  MoveDown,
  ListPlus,
  HelpCircle,
  FileText,
  User,
  Mail,
  Phone,
  Hash,
  School,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminRequestContentPage() {
  const [content, setContent] = useState<RequestFormContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [newTag, setNewTag] = useState('');
  const [newDept, setNewDept] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [newOptionTexts, setNewOptionTexts] = useState<Record<string, string>>({});
  const router = useRouter();

  const FALLBACK_DEPARTMENTS = [
    'Computer Science and Engineering',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Artificial Intelligence and Data Science',
    'Cyber Security',
    'Mechatronics Engineering',
    'Civil Engineering',
  ];

  useEffect(() => {
    fetch('/api/admin/content?section=request')
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
        body: JSON.stringify({ section: 'request', content }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Request form configuration saved successfully.', type: 'success' });
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ text: 'Failed to update request form content.', type: 'error' });
      }
    } catch {
      setMsg({ text: 'A network error occurred.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCriteria = () => {
    if (!content) return;
    setContent({
      ...content,
      eligibility_criteria: [...content.eligibility_criteria, ''],
    });
  };

  const handleRemoveCriteria = (index: number) => {
    if (!content) return;
    setContent({
      ...content,
      eligibility_criteria: content.eligibility_criteria.filter((_, i) => i !== index),
    });
  };

  const handleAddInterestTag = () => {
    if (!content || !newTag.trim()) return;
    if (content.interest_options.includes(newTag.trim())) {
      setNewTag('');
      return;
    }
    setContent({
      ...content,
      interest_options: [...content.interest_options, newTag.trim()],
    });
    setNewTag('');
  };

  const handleRemoveInterestTag = (tag: string) => {
    if (!content) return;
    setContent({
      ...content,
      interest_options: content.interest_options.filter((t) => t !== tag),
    });
  };

  // Department Management Handlers
  const handleAddDepartment = () => {
    if (!content || !newDept.trim()) return;
    const current = content.departments || FALLBACK_DEPARTMENTS;
    if (current.includes(newDept.trim())) {
      setNewDept('');
      return;
    }
    setContent({
      ...content,
      departments: [...current, newDept.trim()],
    });
    setNewDept('');
  };

  const handleRemoveDepartment = (index: number) => {
    if (!content) return;
    const current = content.departments || FALLBACK_DEPARTMENTS;
    setContent({
      ...content,
      departments: current.filter((_, i) => i !== index),
    });
  };

  const handleUpdateDepartment = (index: number, val: string) => {
    if (!content) return;
    const current = [...(content.departments || FALLBACK_DEPARTMENTS)];
    current[index] = val;
    setContent({
      ...content,
      departments: current,
    });
  };

  const handleMoveDepartment = (index: number, direction: 'up' | 'down') => {
    if (!content) return;
    const current = [...(content.departments || FALLBACK_DEPARTMENTS)];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= current.length) return;
    const temp = current[index];
    current[index] = current[targetIdx];
    current[targetIdx] = temp;
    setContent({
      ...content,
      departments: current,
    });
  };

  const handleRestoreDefaultDepartments = () => {
    if (!content) return;
    setContent({
      ...content,
      departments: [...FALLBACK_DEPARTMENTS],
    });
  };

  // Custom Fields Builder Handlers
  const handleAddCustomField = () => {
    if (!content) return;
    const newField: CustomFormField = {
      id: `field_${Date.now()}`,
      label: 'New Question / Field',
      type: 'text',
      placeholder: 'Enter response...',
      required: false,
      help_text: '',
      options: [],
    };
    setContent({
      ...content,
      custom_fields: [...(content.custom_fields || []), newField],
    });
  };

  const handleUpdateCustomField = (index: number, updates: Partial<CustomFormField>) => {
    if (!content) return;
    const list = [...(content.custom_fields || [])];
    list[index] = { ...list[index], ...updates };
    setContent({ ...content, custom_fields: list });
  };

  const handleRemoveCustomField = (index: number) => {
    if (!content) return;
    const list = (content.custom_fields || []).filter((_, i) => i !== index);
    setContent({ ...content, custom_fields: list });
  };

  const handleMoveCustomField = (index: number, direction: 'up' | 'down') => {
    if (!content) return;
    const list = [...(content.custom_fields || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setContent({ ...content, custom_fields: list });
  };

  const handleAddOptionToField = (fieldIndex: number, optionText: string) => {
    if (!content || !optionText.trim()) return;
    const list = [...(content.custom_fields || [])];
    const field = list[fieldIndex];
    const currentOptions = field.options || [];
    if (!currentOptions.includes(optionText.trim())) {
      list[fieldIndex] = {
        ...field,
        options: [...currentOptions, optionText.trim()],
      };
      setContent({ ...content, custom_fields: list });
    }
    setNewOptionTexts((prev) => ({ ...prev, [field.id]: '' }));
  };

  const handleRemoveOptionFromField = (fieldIndex: number, optIndex: number) => {
    if (!content) return;
    const list = [...(content.custom_fields || [])];
    const field = list[fieldIndex];
    list[fieldIndex] = {
      ...field,
      options: (field.options || []).filter((_, i) => i !== optIndex),
    };
    setContent({ ...content, custom_fields: list });
  };

  const handleLoadPreset = (preset: 'stem' | 'creative') => {
    if (!content) return;
    if (preset === 'stem') {
      setContent({
        ...content,
        title: 'Apply to Join the AR/VR Centre of Excellence',
        subtitle: 'A high-impact spatial computing laboratory cultivating real-world engineering prototypes and research.',
        interest_options: ['AR', 'VR', 'MR', 'WebXR', 'Spatial SDKs', '3D Modelling', 'Game Development', 'Simulation', 'Robotics & Twins', 'Hackathons'],
        keycard_badge: 'RESEARCH_FELLOW',
      });
    } else {
      setContent({
        ...content,
        title: 'Creative Spatial Computing Cohort Intake',
        subtitle: 'Hands-on training, virtual environment design, 3D asset pipelines, and interactive storytelling.',
        interest_options: ['Spatial UX/UI', '3D Animation', 'Blender / Maya', 'Audio Spatialization', 'Virtual Production', 'World Building', 'XR Art'],
        keycard_badge: 'CREATIVE_FELLOW',
      });
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminHeader
          title="Request Form Content & Custom Fields Studio"
          subtitle="Configure candidate application copy, eligibility guidelines, interest tags, custom questions, and live scrollable preview"
        />

        <div className="admin-content" style={{ maxWidth: '1440px' }}>
          {/* Top Control Bar with Layout Switcher and Test Link */}
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`admin-btn admin-btn-sm ${activeTab === 'editor' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              >
                Editor Only
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`admin-btn admin-btn-sm ${activeTab === 'split' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              >
                Split View (Live Preview)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`admin-btn admin-btn-sm ${activeTab === 'preview' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              >
                Preview Only
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleLoadPreset('stem')}
                className="admin-btn admin-btn-secondary admin-btn-sm"
                title="Load Standard STEM Preset"
              >
                <Sparkles size={13} />
                <span>STEM Preset</span>
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('creative')}
                className="admin-btn admin-btn-secondary admin-btn-sm"
                title="Load Creative XR Preset"
              >
                <Layers size={13} />
                <span>Creative Preset</span>
              </button>
              <Link
                href="/request"
                target="_blank"
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                <ExternalLink size={13} />
                <span>Test Live /request</span>
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

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              Loading request form settings...
            </div>
          ) : content ? (
            <form onSubmit={handleSave}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    activeTab === 'split' ? '1.2fr 1fr' : activeTab === 'editor' ? '1fr' : '0fr 1fr',
                  gap: '24px',
                  alignItems: 'start',
                }}
              >
                {/* LEFT COLUMN: INTERACTIVE FORM CONTROLS */}
                {activeTab !== 'preview' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Section 1: Hero Header */}
                    <div className="admin-card">
                      <div className="admin-card-header">
                        <h3 className="admin-card-title">01 // PAGE HEADER & TAGLINE</h3>
                      </div>
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">Page Title</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={content.title}
                            onChange={(e) => setContent({ ...content, title: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="admin-field-label">Subtitle / Candidate Pitch</label>
                          <textarea
                            className="admin-textarea"
                            rows={3}
                            value={content.subtitle}
                            onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Guidelines & Eligibility Criteria */}
                    <div className="admin-card">
                      <div className="admin-card-header">
                        <h3 className="admin-card-title">02 // ADMISSION GUIDELINES</h3>
                      </div>
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">Guidelines Box Heading</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={content.guidelines_heading}
                            onChange={(e) => setContent({ ...content, guidelines_heading: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="admin-field-label">Guidelines Description</label>
                          <textarea
                            className="admin-textarea"
                            rows={3}
                            value={content.guidelines_description}
                            onChange={(e) => setContent({ ...content, guidelines_description: e.target.value })}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label className="admin-field-label" style={{ margin: 0 }}>
                              Eligibility Bullet Points ({content.eligibility_criteria.length})
                            </label>
                            <button
                              type="button"
                              onClick={handleAddCriteria}
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                            >
                              <Plus size={13} />
                              <span>Add Bullet</span>
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {content.eligibility_criteria.map((crit, idx) => (
                              <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  className="admin-input"
                                  value={crit}
                                  onChange={(e) => {
                                    const updated = [...content.eligibility_criteria];
                                    updated[idx] = e.target.value;
                                    setContent({ ...content, eligibility_criteria: updated });
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCriteria(idx)}
                                  className="admin-btn admin-btn-danger admin-btn-sm"
                                  title="Remove item"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Available Interest Options Tags */}
                    <div className="admin-card">
                      <div className="admin-card-header">
                        <h3 className="admin-card-title">03 // CANDIDATE INTEREST TAGS</h3>
                      </div>
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">Add New Track / Technology Tag</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="e.g. Vision Pro, WebGPU, Haptics, Spatial Audio..."
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddInterestTag();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleAddInterestTag}
                              className="admin-btn admin-btn-primary admin-btn-sm"
                            >
                              <Plus size={14} />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="admin-field-label">Active Interest Tags (Click × to remove)</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {content.interest_options.map((tag) => (
                              <span
                                key={tag}
                                className="badge badge-blue"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 10px',
                                  fontSize: '0.8rem',
                                }}
                              >
                                <span>{tag}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInterestTag(tag)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'inherit',
                                    cursor: 'pointer',
                                    padding: 0,
                                    fontSize: '0.9rem',
                                    lineHeight: 1,
                                  }}
                                  title="Remove tag"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: ELIGIBLE ACADEMIC DEPARTMENTS MANAGEMENT */}
                    <div className="admin-card">
                      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 className="admin-card-title">04 // ELIGIBLE ACADEMIC DEPARTMENTS</h3>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                            Configure engineering and science disciplines permitted to join. Controls the department dropdown on the public application form.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRestoreDefaultDepartments}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          title="Restore standard 9 engineering disciplines"
                        >
                          <School size={13} />
                          <span>Reset Defaults</span>
                        </button>
                      </div>

                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <label className="admin-field-label">Add Department / Discipline</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="e.g. Biomedical Engineering, Robotics & Automation..."
                              value={newDept}
                              onChange={(e) => setNewDept(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddDepartment();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleAddDepartment}
                              className="admin-btn admin-btn-primary admin-btn-sm"
                            >
                              <Plus size={14} />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label className="admin-field-label" style={{ margin: 0 }}>
                              Active Departments ({(content.departments || FALLBACK_DEPARTMENTS).length})
                            </label>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Order in this list matches the public dropdown order
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(!content.departments || content.departments.length === 0) ? (
                              <div
                                style={{
                                  padding: '20px',
                                  textAlign: 'center',
                                  background: 'var(--surface-card-alt)',
                                  borderRadius: '8px',
                                  border: '1px dashed var(--border-subtle)',
                                  color: 'var(--text-muted)',
                                  fontSize: '0.85rem',
                                }}
                              >
                                No departments defined. Click &quot;Reset Defaults&quot; to restore standard disciplines.
                              </div>
                            ) : (
                              content.departments.map((dept, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'var(--surface-card-alt)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '6px',
                                    padding: '8px 12px',
                                  }}
                                >
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: '0.72rem',
                                      color: 'var(--accent-cyan)',
                                      fontWeight: 700,
                                      minWidth: '24px',
                                    }}
                                  >
                                    #{idx + 1}
                                  </span>
                                  <input
                                    type="text"
                                    className="admin-input"
                                    value={dept}
                                    onChange={(e) => handleUpdateDepartment(idx, e.target.value)}
                                    style={{ padding: '6px 10px', fontSize: '0.85rem', flex: 1 }}
                                  />
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleMoveDepartment(idx, 'up')}
                                      disabled={idx === 0}
                                      className="admin-btn admin-btn-secondary admin-btn-sm"
                                      style={{ padding: '4px 6px' }}
                                      title="Move Up"
                                    >
                                      <MoveUp size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMoveDepartment(idx, 'down')}
                                      disabled={idx === (content.departments?.length || 0) - 1}
                                      className="admin-btn admin-btn-secondary admin-btn-sm"
                                      style={{ padding: '4px 6px' }}
                                      title="Move Down"
                                    >
                                      <MoveDown size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveDepartment(idx)}
                                      className="admin-btn admin-btn-danger admin-btn-sm"
                                      style={{ padding: '4px 6px' }}
                                      title="Delete Department"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 5: DYNAMIC CUSTOM APPLICATION FORM FIELDS BUILDER */}
                    <div className="admin-card">
                      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 className="admin-card-title">05 // CUSTOM APPLICATION FORM FIELDS</h3>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                            Add tailored application questions (text, textarea, number, or dropdown) to the public join form.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCustomField}
                          className="admin-btn admin-btn-primary admin-btn-sm"
                        >
                          <Plus size={14} />
                          <span>Add Custom Field</span>
                        </button>
                      </div>

                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {(!content.custom_fields || content.custom_fields.length === 0) ? (
                          <div
                            style={{
                              padding: '30px 20px',
                              textAlign: 'center',
                              background: 'var(--surface-card-alt)',
                              borderRadius: '8px',
                              border: '1px dashed var(--border-subtle)',
                              color: 'var(--text-muted)',
                              fontSize: '0.88rem',
                            }}
                          >
                            No custom form fields added yet. Click <strong>&quot;Add Custom Field&quot;</strong> to ask applicant-specific questions like portfolio URLs, prior engine experience, or hardware access.
                          </div>
                        ) : (
                          content.custom_fields.map((field, idx) => (
                            <div
                              key={field.id || idx}
                              style={{
                                background: 'var(--surface-card-alt)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '8px',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              {/* Field Header / Actions */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      color: 'var(--accent-cyan)',
                                      background: 'rgba(2, 132, 199, 0.1)',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    FIELD #{idx + 1}
                                  </span>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {field.label || 'Untitled Field'}
                                  </span>
                                  {field.required && (
                                    <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                                      REQUIRED
                                    </span>
                                  )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveCustomField(idx, 'up')}
                                    disabled={idx === 0}
                                    className="admin-btn admin-btn-secondary admin-btn-sm"
                                    style={{ padding: '4px 6px' }}
                                    title="Move Up"
                                  >
                                    <MoveUp size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveCustomField(idx, 'down')}
                                    disabled={idx === (content.custom_fields?.length || 0) - 1}
                                    className="admin-btn admin-btn-secondary admin-btn-sm"
                                    style={{ padding: '4px 6px' }}
                                    title="Move Down"
                                  >
                                    <MoveDown size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCustomField(idx)}
                                    className="admin-btn admin-btn-danger admin-btn-sm"
                                    style={{ padding: '4px 6px' }}
                                    title="Delete Field"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>

                              {/* Field Config Row 1: Label & Type */}
                              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                                <div>
                                  <label className="admin-field-label">Field Question / Label</label>
                                  <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="e.g. GitHub / ArtStation / Portfolio URL"
                                    value={field.label}
                                    onChange={(e) => handleUpdateCustomField(idx, { label: e.target.value })}
                                  />
                                </div>

                                <div>
                                  <label className="admin-field-label">Input Type</label>
                                  <select
                                    className="admin-select"
                                    value={field.type}
                                    onChange={(e) =>
                                      handleUpdateCustomField(idx, {
                                        type: e.target.value as CustomFormField['type'],
                                      })
                                    }
                                  >
                                    <option value="text">Single Line Text</option>
                                    <option value="textarea">Multiline Textarea</option>
                                    <option value="number">Number</option>
                                    <option value="select">Dropdown Select</option>
                                  </select>
                                </div>
                              </div>

                              {/* Field Config Row 2: Placeholder & Help Text */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                  <label className="admin-field-label">Placeholder Text</label>
                                  <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="e.g. https://github.com/username..."
                                    value={field.placeholder || ''}
                                    onChange={(e) => handleUpdateCustomField(idx, { placeholder: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label className="admin-field-label">Helper Note (Optional)</label>
                                  <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="e.g. Provide a link to your best repository"
                                    value={field.help_text || ''}
                                    onChange={(e) => handleUpdateCustomField(idx, { help_text: e.target.value })}
                                  />
                                </div>
                              </div>

                              {/* Dropdown Options (Only if type === 'select') */}
                              {field.type === 'select' && (
                                <div style={{ background: 'var(--surface-card)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                                  <label className="admin-field-label" style={{ marginBottom: '6px' }}>
                                    Dropdown Choices (Click × to remove)
                                  </label>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                    {(field.options || []).map((opt, optIdx) => (
                                      <span
                                        key={optIdx}
                                        className="badge badge-cyan"
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 8px' }}
                                      >
                                        <span>{opt}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveOptionFromField(idx, optIdx)}
                                          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
                                        >
                                          ×
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                      type="text"
                                      className="admin-input"
                                      placeholder="Add an option choice (e.g. Yes, No, Maybe)"
                                      value={newOptionTexts[field.id] || ''}
                                      onChange={(e) =>
                                        setNewOptionTexts({ ...newOptionTexts, [field.id]: e.target.value })
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleAddOptionToField(idx, newOptionTexts[field.id] || '');
                                        }
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleAddOptionToField(idx, newOptionTexts[field.id] || '')}
                                      className="admin-btn admin-btn-secondary admin-btn-sm"
                                    >
                                      <Plus size={13} />
                                      <span>Add Choice</span>
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Required Checkbox */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => handleUpdateCustomField(idx, { required: e.target.checked })}
                                  />
                                  <span>Make this question required for applicants</span>
                                </label>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Section 6: Success Message & Keycard Badges */}
                    <div className="admin-card">
                      <div className="admin-card-header">
                        <h3 className="admin-card-title">06 // SUCCESS CONFIRMATION & KEYCARD</h3>
                      </div>
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label className="admin-field-label">Keycard Watermark Title</label>
                            <input
                              type="text"
                              className="admin-input"
                              value={content.keycard_title}
                              onChange={(e) => setContent({ ...content, keycard_title: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="admin-field-label">Keycard Access Badge</label>
                            <input
                              type="text"
                              className="admin-input"
                              value={content.keycard_badge}
                              onChange={(e) => setContent({ ...content, keycard_badge: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="admin-field-label">Success Screen Heading</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={content.success_heading}
                            onChange={(e) => setContent({ ...content, success_heading: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="admin-field-label">Success Screen Message</label>
                          <textarea
                            className="admin-textarea"
                            rows={3}
                            value={content.success_message}
                            onChange={(e) => setContent({ ...content, success_message: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Bar */}
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
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        All changes instantly reflected in the live preview on the right.
                      </span>
                      <button
                        type="submit"
                        disabled={saving}
                        className="admin-btn admin-btn-primary"
                        style={{ padding: '10px 28px', fontSize: '0.95rem' }}
                      >
                        <Save size={16} />
                        <span>{saving ? 'Saving Changes...' : 'Save Request Form Settings'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* RIGHT COLUMN: SCROLLABLE LIVE INTERACTIVE PREVIEW */}
                {activeTab !== 'editor' && (
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
                          https://coe.arvr.edu/request
                        </div>
                      </div>

                      {/* SCROLLABLE INNER PAGE CONTENT */}
                      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                        {/* 1. Header & Tagline Preview */}
                        <div>
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
                              marginBottom: '8px',
                            }}
                          >
                            STUDENT ADMISSION DOSSIER
                          </div>
                          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: previewTheme === 'dark' ? '#f8fafc' : '#0f172a', marginBottom: '8px', lineHeight: 1.25 }}>
                            {content.title}
                          </h2>
                          <p style={{ color: previewTheme === 'dark' ? '#94a3b8' : '#475569', fontSize: '0.84rem', lineHeight: '1.5' }}>
                            {content.subtitle}
                          </p>
                        </div>

                        {/* 2. Keycard 2D Hologram Mockup */}
                        <div
                          style={{
                            borderRadius: '12px',
                            background: previewTheme === 'dark'
                              ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, #0f172a 60%, rgba(124, 58, 237, 0.15) 100%)'
                              : 'linear-gradient(135deg, rgba(2, 132, 199, 0.1) 0%, #ffffff 60%, rgba(124, 58, 237, 0.1) 100%)',
                            border: previewTheme === 'dark' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(2, 132, 199, 0.3)',
                            padding: '16px',
                            boxShadow: previewTheme === 'dark' ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(2, 132, 199, 0.08)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: '#0284c7', fontWeight: 700 }}>
                              {content.keycard_title}
                            </span>
                            <span
                              style={{
                                fontSize: '0.62rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: '#7c3aed',
                                color: '#ffffff',
                                fontWeight: 700,
                              }}
                            >
                              {content.keycard_badge}
                            </span>
                          </div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: previewTheme === 'dark' ? '#ffffff' : '#0f172a' }}>
                            VIGNESHWARAN S
                          </div>
                          <div style={{ fontSize: '0.72rem', color: previewTheme === 'dark' ? '#94a3b8' : '#64748b', fontFamily: 'monospace' }}>
                            REG: 111422104001 • CSE (2nd Year)
                          </div>
                        </div>

                        {/* 3. Guidelines Box Preview */}
                        <div
                          style={{
                            background: previewTheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                            border: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '16px',
                          }}
                        >
                          <div style={{ fontFamily: 'monospace', fontSize: '0.74rem', color: '#0284c7', fontWeight: 700, marginBottom: '6px' }}>
                            {content.guidelines_heading}
                          </div>
                          <p style={{ fontSize: '0.78rem', color: previewTheme === 'dark' ? '#94a3b8' : '#64748b', lineHeight: '1.45', marginBottom: '10px' }}>
                            {content.guidelines_description}
                          </p>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {content.eligibility_criteria.map((item, i) => (
                              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.76rem', color: previewTheme === 'dark' ? '#e2e8f0' : '#1e293b' }}>
                                <Check size={13} style={{ color: '#0284c7', flexShrink: 0, marginTop: '2px' }} />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 4. Candidate Details Preview */}
                        <div
                          style={{
                            padding: '16px',
                            borderRadius: '10px',
                            background: previewTheme === 'dark' ? 'rgba(255,255,255,0.02)' : '#ffffff',
                            border: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
                          }}
                        >
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.08em' }}>
                            01 // STUDENT IDENTITY
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                            <div style={{ padding: '8px', borderRadius: '6px', background: previewTheme === 'dark' ? 'rgba(255,255,255,0.04)' : '#f1f5f9', fontSize: '0.75rem' }}>
                              <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Full Name</div>
                              <div style={{ fontWeight: 600 }}>Jane Doe</div>
                            </div>
                            <div style={{ padding: '8px', borderRadius: '6px', background: previewTheme === 'dark' ? 'rgba(255,255,255,0.04)' : '#f1f5f9', fontSize: '0.75rem' }}>
                              <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Register No</div>
                              <div style={{ fontWeight: 600 }}>111422104088</div>
                            </div>
                          </div>
                        </div>

                        {/* 5. Department Selection Preview */}
                        <div>
                          <div style={{ fontSize: '0.72rem', color: previewTheme === 'dark' ? '#94a3b8' : '#64748b', fontFamily: 'monospace', marginBottom: '8px' }}>
                            02 // ACADEMIC DEPARTMENT OPTIONS ({(content.departments || FALLBACK_DEPARTMENTS).length}):
                          </div>
                          <select
                            disabled
                            style={{
                              width: '100%',
                              padding: '7px 10px',
                              borderRadius: '6px',
                              background: previewTheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                              border: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
                              color: previewTheme === 'dark' ? '#f3f4f6' : '#0f172a',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              cursor: 'not-allowed',
                            }}
                          >
                            {(content.departments && content.departments.length > 0 ? content.departments : FALLBACK_DEPARTMENTS).map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        {/* 6. Active Interest Tags Preview */}
                        <div>
                          <div style={{ fontSize: '0.72rem', color: previewTheme === 'dark' ? '#94a3b8' : '#64748b', fontFamily: 'monospace', marginBottom: '8px' }}>
                            03 // INTEREST CHOICES OFFERED ({content.interest_options.length}):
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {content.interest_options.map((t) => (
                              <span
                                key={t}
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  background: previewTheme === 'dark' ? 'rgba(2, 132, 199, 0.2)' : 'rgba(2, 132, 199, 0.1)',
                                  color: '#0284c7',
                                  border: '1px solid rgba(2, 132, 199, 0.3)',
                                  fontWeight: 600,
                                }}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* 7. Dynamic Custom Form Fields Preview */}
                        <div
                          style={{
                            padding: '16px',
                            borderRadius: '10px',
                            background: previewTheme === 'dark' ? 'rgba(255,255,255,0.02)' : '#ffffff',
                            border: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#ec4899', letterSpacing: '0.08em' }}>
                              04 // CUSTOM FORM FIELDS ({content.custom_fields?.length || 0})
                            </span>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>LIVE RENDERED</span>
                          </div>

                          {(!content.custom_fields || content.custom_fields.length === 0) ? (
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', padding: '10px 0' }}>
                              No custom fields added yet. They will appear here when created.
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {content.custom_fields.map((f, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    padding: '10px',
                                    borderRadius: '6px',
                                    background: previewTheme === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                                    border: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: previewTheme === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                                      {f.label} {f.required && <span style={{ color: '#ef4444' }}>*</span>}
                                    </label>
                                    <span style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#0284c7' }}>
                                      {f.type.toUpperCase()}
                                    </span>
                                  </div>

                                  {f.type === 'textarea' ? (
                                    <div
                                      style={{
                                        padding: '6px 8px',
                                        fontSize: '0.72rem',
                                        color: '#94a3b8',
                                        background: previewTheme === 'dark' ? '#0b0f19' : '#ffffff',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '4px',
                                        minHeight: '44px',
                                      }}
                                    >
                                      {f.placeholder || 'Applicant multiline answer...'}
                                    </div>
                                  ) : f.type === 'select' ? (
                                    <div
                                      style={{
                                        padding: '6px 8px',
                                        fontSize: '0.72rem',
                                        color: '#94a3b8',
                                        background: previewTheme === 'dark' ? '#0b0f19' : '#ffffff',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '4px',
                                      }}
                                    >
                                      Select option: [{(f.options || []).join(' | ') || 'No options configured'}]
                                    </div>
                                  ) : (
                                    <div
                                      style={{
                                        padding: '6px 8px',
                                        fontSize: '0.72rem',
                                        color: '#94a3b8',
                                        background: previewTheme === 'dark' ? '#0b0f19' : '#ffffff',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '4px',
                                      }}
                                    >
                                      {f.placeholder || 'Applicant answer...'}
                                    </div>
                                  )}

                                  {f.help_text && (
                                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '3px' }}>
                                      {f.help_text}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 7. Success Confirmation Preview */}
                        <div
                          style={{
                            padding: '16px',
                            borderRadius: '10px',
                            background: previewTheme === 'dark' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.06)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                          }}
                        >
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.08em' }}>
                            SUCCESS SCREEN PREVIEW
                          </span>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '4px 0 6px 0', color: previewTheme === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                            {content.success_heading}
                          </h4>
                          <p style={{ fontSize: '0.76rem', color: previewTheme === 'dark' ? '#94a3b8' : '#64748b' }}>
                            {content.success_message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          ) : null}
        </div>
      </main>
    </div>
  );
}
