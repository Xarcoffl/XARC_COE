'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { StudentRequest } from '@/lib/types';
import {
  X,
  Download,
  CheckSquare,
  Square,
  Search,
  RotateCcw,
  Sliders,
  FileSpreadsheet,
  Check,
  Sparkles,
  Info,
  Calendar,
  User,
  Phone,
  Code,
  Shield,
  FileText,
} from 'lucide-react';

export interface CsvFieldOption {
  id: string;
  label: string;
  category: 'identity' | 'contact' | 'technical' | 'pipeline' | 'custom';
  description: string;
  defaultSelected: boolean;
  getValue: (r: StudentRequest, options?: { formatDate?: boolean }) => string;
}

const DEFAULT_7_FIELDS = [
  'register_number',
  'full_name',
  'department',
  'year',
  'interests',
  'email',
  'mobile_number',
];

const STORAGE_KEY = 'arvr_coe_csv_custom_fields';

export const BASE_CSV_FIELDS: CsvFieldOption[] = [
  // 1. Core Identity & Academic
  {
    id: 'register_number',
    label: 'Student Register No',
    category: 'identity',
    description: 'Official university register / roll number',
    defaultSelected: true,
    getValue: (r) => r.register_number || '',
  },
  {
    id: 'full_name',
    label: 'Student Name',
    category: 'identity',
    description: 'Full legal name of the student',
    defaultSelected: true,
    getValue: (r) => r.full_name || '',
  },
  {
    id: 'department',
    label: 'Department',
    category: 'identity',
    description: 'Academic discipline / branch of engineering',
    defaultSelected: true,
    getValue: (r) => r.department || '',
  },
  {
    id: 'year',
    label: 'Year',
    category: 'identity',
    description: 'Current year of study (1st, 2nd, 3rd, Final Year)',
    defaultSelected: true,
    getValue: (r) => r.year || '',
  },
  {
    id: 'section',
    label: 'Section',
    category: 'identity',
    description: 'Class division / classroom section (A, B, C, etc.)',
    defaultSelected: false,
    getValue: (r) => r.section || '',
  },

  // 2. Contact Information
  {
    id: 'email',
    label: 'Mail ID / Email',
    category: 'contact',
    description: 'Primary or personal contact email address',
    defaultSelected: true,
    getValue: (r) => r.email || r.college_email || '',
  },
  {
    id: 'college_email',
    label: 'College Institutional Email',
    category: 'contact',
    description: 'Official institutional email ID (e.g. @sece.ac.in)',
    defaultSelected: false,
    getValue: (r) => r.college_email || '',
  },
  {
    id: 'mobile_number',
    label: 'Phone No',
    category: 'contact',
    description: 'Primary contact or WhatsApp mobile number',
    defaultSelected: true,
    getValue: (r) => r.mobile_number || '',
  },

  // 3. Technical & Interests
  {
    id: 'interests',
    label: 'Interests',
    category: 'technical',
    description: 'Focus domains (AR, VR, MR, 3D, Simulation, Game Dev, etc.)',
    defaultSelected: true,
    getValue: (r) => (Array.isArray(r.interests) ? r.interests.join(', ') : (r.interests || '')),
  },
  {
    id: 'experience_level',
    label: 'Experience Level',
    category: 'technical',
    description: 'Self-reported experience in XR & 3D (New to XR, Beginner, etc.)',
    defaultSelected: false,
    getValue: (r) => r.experience_level || '',
  },
  {
    id: 'existing_skills',
    label: 'Existing Skills & Tools',
    category: 'technical',
    description: 'Prior software, game engines, and coding toolchains',
    defaultSelected: false,
    getValue: (r) => r.existing_skills || '',
  },
  {
    id: 'motivation',
    label: 'Motivation Statement',
    category: 'technical',
    description: 'Applicant explanation on why they want to join the COE',
    defaultSelected: false,
    getValue: (r) => r.motivation || '',
  },

  // 4. Pipeline & Administrative
  {
    id: 'status',
    label: 'Pipeline Status',
    category: 'pipeline',
    description: 'Current intake status (NEW, WAITING, JOINED, REJECTED)',
    defaultSelected: false,
    getValue: (r) => r.status || '',
  },
  {
    id: 'form_type',
    label: 'Application Intake Type',
    category: 'pipeline',
    description: 'Active Intake (REQUEST) or Expression of Interest (INTEREST)',
    defaultSelected: false,
    getValue: (r) => r.form_type || 'REQUEST',
  },
  {
    id: 'submitted_at',
    label: 'Submission Timestamp',
    category: 'pipeline',
    description: 'Date and time application was received',
    defaultSelected: false,
    getValue: (r, opts) => formatTimestamp(r.submitted_at, opts?.formatDate),
  },
  {
    id: 'joined_at',
    label: 'Induction Date',
    category: 'pipeline',
    description: 'Date student was formally inducted into the COE',
    defaultSelected: false,
    getValue: (r, opts) => formatTimestamp(r.joined_at, opts?.formatDate),
  },
  {
    id: 'rejected_at',
    label: 'Rejection / Archive Date',
    category: 'pipeline',
    description: 'Date student application was archived or marked rejected',
    defaultSelected: false,
    getValue: (r, opts) => formatTimestamp(r.rejected_at, opts?.formatDate),
  },
  {
    id: 'internal_notes',
    label: 'Internal Faculty Notes',
    category: 'pipeline',
    description: 'Private administrative review notes and interview feedback',
    defaultSelected: false,
    getValue: (r) => r.internal_notes || '',
  },
  {
    id: 'id',
    label: 'Applicant Database ID',
    category: 'pipeline',
    description: 'Internal system unique identifier',
    defaultSelected: false,
    getValue: (r) => r.id || '',
  },
];

function formatTimestamp(iso?: string, formatHuman = true): string {
  if (!iso) return '';
  if (!formatHuman) return iso;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

interface ExportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: StudentRequest[];
  selectedIds: string[];
  statusFilter: string;
}

export default function ExportCsvModal({
  isOpen,
  onClose,
  requests,
  selectedIds,
  statusFilter,
}: ExportCsvModalProps) {
  // Discover any dynamic custom field keys across available applicants
  const dynamicCustomFields = useMemo(() => {
    const keyMap = new Map<string, string>();
    for (const r of requests) {
      if (r.custom_field_responses && typeof r.custom_field_responses === 'object') {
        for (const [key, val] of Object.entries(r.custom_field_responses)) {
          if (key && !keyMap.has(key)) {
            keyMap.set(key, typeof val === 'string' ? val : '');
          }
        }
      }
    }

    const customOptions: CsvFieldOption[] = [];
    keyMap.forEach((_, key) => {
      // Clean readable label from key
      const readableLabel = key
        .replace(/^cf_/, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      customOptions.push({
        id: `custom:${key}`,
        label: `Custom: ${readableLabel}`,
        category: 'custom',
        description: `Custom intake question response for "${key}"`,
        defaultSelected: false,
        getValue: (r) => (r.custom_field_responses ? r.custom_field_responses[key] || '' : ''),
      });
    });

    return customOptions;
  }, [requests]);

  const allAvailableFields = useMemo(() => {
    return [...BASE_CSV_FIELDS, ...dynamicCustomFields];
  }, [dynamicCustomFields]);

  // Selected fields state - initialized with stored preferences or default 7
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>(DEFAULT_7_FIELDS);
  const [exportScope, setExportScope] = useState<'selected' | 'all'>('all');
  const [formatDatesHuman, setFormatDatesHuman] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize from localStorage or fallback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSelectedFieldIds(parsed);
          }
        }
      } catch (err) {
        console.warn('Failed to parse saved CSV fields preference:', err);
      }
    }
  }, []);

  // Update exportScope when selectedIds changes
  useEffect(() => {
    if (selectedIds.length > 0) {
      setExportScope('selected');
    } else {
      setExportScope('all');
    }
  }, [selectedIds.length]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const targetList =
    exportScope === 'selected' && selectedIds.length > 0
      ? requests.filter((r) => selectedIds.includes(r.id))
      : requests;

  // Categories metadata
  const categories: {
    key: 'identity' | 'contact' | 'technical' | 'pipeline' | 'custom';
    title: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'identity',
      title: 'Core Identity & Academics',
      icon: <User size={15} style={{ color: '#60a5fa' }} />,
    },
    {
      key: 'contact',
      title: 'Contact Information',
      icon: <Phone size={15} style={{ color: '#34d399' }} />,
    },
    {
      key: 'technical',
      title: 'Interests & Technical Profile',
      icon: <Code size={15} style={{ color: '#a78bfa' }} />,
    },
    {
      key: 'pipeline',
      title: 'Pipeline & Administrative Status',
      icon: <Shield size={15} style={{ color: '#fbbf24' }} />,
    },
  ];

  if (dynamicCustomFields.length > 0) {
    categories.push({
      key: 'custom',
      title: `Custom Intake Fields (${dynamicCustomFields.length})`,
      icon: <Sparkles size={15} style={{ color: '#f472b6' }} />,
    });
  }

  // Filter fields by search
  const visibleFields = allAvailableFields.filter((f) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      f.label.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q)
    );
  });

  const toggleField = (id: string) => {
    if (selectedFieldIds.includes(id)) {
      setSelectedFieldIds(selectedFieldIds.filter((item) => item !== id));
    } else {
      setSelectedFieldIds([...selectedFieldIds, id]);
    }
  };

  const selectCategory = (catKey: string) => {
    const catFields = allAvailableFields.filter((f) => f.category === catKey).map((f) => f.id);
    const newSet = new Set([...selectedFieldIds, ...catFields]);
    setSelectedFieldIds(Array.from(newSet));
  };

  const deselectCategory = (catKey: string) => {
    const catFields = new Set(allAvailableFields.filter((f) => f.category === catKey).map((f) => f.id));
    setSelectedFieldIds(selectedFieldIds.filter((id) => !catFields.has(id)));
  };

  // Presets
  const applyPreset = (presetName: string) => {
    let fields: string[] = [];
    if (presetName === 'standard') {
      fields = DEFAULT_7_FIELDS;
    } else if (presetName === 'contact') {
      fields = ['register_number', 'full_name', 'department', 'year', 'email', 'college_email', 'mobile_number'];
    } else if (presetName === 'academic') {
      fields = ['register_number', 'full_name', 'department', 'year', 'section', 'status', 'form_type', 'submitted_at'];
    } else if (presetName === 'technical') {
      fields = ['register_number', 'full_name', 'department', 'year', 'interests', 'experience_level', 'existing_skills', 'motivation'];
    } else if (presetName === 'all') {
      fields = allAvailableFields.map((f) => f.id);
    } else if (presetName === 'none') {
      fields = [];
    }
    setSelectedFieldIds(fields);
    showToast(`Applied preset: ${presetName.toUpperCase()}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const saveAsDefault = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedFieldIds));
      showToast('Saved current field selection as your default!');
    } catch (err) {
      console.error('Failed to save to localStorage', err);
    }
  };

  const resetToDefaultPreset = () => {
    setSelectedFieldIds(DEFAULT_7_FIELDS);
    try {
      localStorage.removeItem(STORAGE_KEY);
      showToast('Reset to Standard 7-Field Preset!');
    } catch {
      // ignore
    }
  };

  // Generate & Download CSV
  const handleDownloadCsv = () => {
    if (targetList.length === 0) {
      alert('No student records available to export for the current selection.');
      return;
    }

    if (selectedFieldIds.length === 0) {
      alert('Please select at least one field to export in the CSV.');
      return;
    }

    // Persist user selection
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedFieldIds));
    } catch {
      // ignore
    }

    // Active field definitions in selection order
    const activeFieldDefs: CsvFieldOption[] = [];
    for (const id of selectedFieldIds) {
      const def = allAvailableFields.find((f) => f.id === id);
      if (def) {
        activeFieldDefs.push(def);
      }
    }

    const headers = activeFieldDefs.map((f) => f.label);

    const escapeCsv = (str: string | undefined | null) => {
      if (str === undefined || str === null) return '""';
      const escaped = String(str).replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rows = targetList.map((r) => {
      return activeFieldDefs.map((def) => {
        const val = def.getValue(r, { formatDate: formatDatesHuman });
        return escapeCsv(val);
      });
    });

    // Use UTF-8 BOM so Excel opens Indian names, symbols, and formatting cleanly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const dateStr = new Date().toISOString().slice(0, 10);
    const filterTag = statusFilter.toLowerCase();
    const scopeTag = exportScope === 'selected' ? `selected_${targetList.length}` : 'roster';
    link.setAttribute('download', `arvr_coe_${scopeTag}_${filterTag}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '850px',
          width: '95vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0f172a',
          borderColor: '#334155',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(59, 130, 246, 0.2)',
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #1e293b',
            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'rgba(37, 99, 235, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
              }}
            >
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="modal-title" style={{ fontSize: '1.15rem', color: '#f8fafc', margin: 0 }}>
                  Export Roster to CSV
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#93c5fd',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {selectedFieldIds.length} of {allAvailableFields.length} Fields
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '3px 0 0 0' }}>
                Choose the exact fields and order to include in your downloaded spreadsheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          className="modal-body"
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {/* Quick Presets Bar */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#1e293b80',
              border: '1px solid #334155',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8' }}>
                <Sliders size={14} style={{ color: '#60a5fa' }} />
                <span>QUICK PRESETS</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={resetToDefaultPreset}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 6px',
                  }}
                  title="Reset to 7-Field Standard Preset"
                >
                  <RotateCcw size={12} />
                  <span>Reset Default</span>
                </button>
                <button
                  type="button"
                  onClick={saveAsDefault}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#60a5fa',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 6px',
                  }}
                  title="Save current selection as default for future exports"
                >
                  <Check size={12} />
                  <span>Save as My Default</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                type="button"
                onClick={() => applyPreset('standard')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  backgroundColor:
                    selectedFieldIds.length === 7 && DEFAULT_7_FIELDS.every((k) => selectedFieldIds.includes(k))
                      ? '#2563eb'
                      : '#1e293b',
                  borderColor:
                    selectedFieldIds.length === 7 && DEFAULT_7_FIELDS.every((k) => selectedFieldIds.includes(k))
                      ? '#3b82f6'
                      : '#475569',
                  color: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>Standard Roster (7 Fields)</span>
                <span style={{ fontSize: '0.65rem', background: '#3b82f640', padding: '1px 5px', borderRadius: '4px' }}>
                  Default
                </span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('contact')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                }}
              >
                Contact Directory (7)
              </button>

              <button
                type="button"
                onClick={() => applyPreset('academic')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                }}
              >
                Academic & Pipeline (8)
              </button>

              <button
                type="button"
                onClick={() => applyPreset('technical')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                }}
              >
                Technical & Skills (8)
              </button>

              <button
                type="button"
                onClick={() => applyPreset('all')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid #334155',
                  backgroundColor: '#1e293b',
                  color: '#94a3b8',
                }}
              >
                Select All ({allAvailableFields.length})
              </button>

              <button
                type="button"
                onClick={() => applyPreset('none')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid #334155',
                  backgroundColor: '#0f172a',
                  color: '#ef4444',
                }}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Export Scope & Options Row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#090d16',
              border: '1px solid #1e293b',
            }}
          >
            {/* Scope Selection */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8' }}>EXPORT SCOPE:</span>
              {selectedIds.length > 0 ? (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#f1f5f9', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === 'selected'}
                      onChange={() => setExportScope('selected')}
                      style={{ accentColor: '#2563eb' }}
                    />
                    <span>Selected Applicants Only (<strong>{selectedIds.length}</strong>)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#94a3b8', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === 'all'}
                      onChange={() => setExportScope('all')}
                      style={{ accentColor: '#2563eb' }}
                    />
                    <span>All Filtered Applicants (<strong>{requests.length}</strong>)</span>
                  </label>
                </div>
              ) : (
                <span style={{ fontSize: '0.82rem', color: '#60a5fa' }}>
                  All <strong>{requests.length}</strong> applicants matching current filters
                </span>
              )}
            </div>

            {/* Date formatting option */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94a3b8', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formatDatesHuman}
                onChange={(e) => setFormatDatesHuman(e.target.checked)}
                style={{ accentColor: '#2563eb', cursor: 'pointer' }}
              />
              <span>Format timestamps for Excel (e.g. 15 Sep 2026)</span>
            </label>
          </div>

          {/* Search Fields Input */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '6px 12px',
                flex: 1,
              }}
            >
              <Search size={14} style={{ color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search fields (e.g. email, department, skills, date)..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#f8fafc',
                  fontSize: '0.82rem',
                  width: '100%',
                }}
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>
              Showing {visibleFields.length} of {allAvailableFields.length}
            </div>
          </div>

          {/* Categorized Field Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categories.map((cat) => {
              const catFields = visibleFields.filter((f) => f.category === cat.key);
              if (catFields.length === 0) return null;

              const totalInCat = allAvailableFields.filter((f) => f.category === cat.key).length;
              const selectedInCat = allAvailableFields
                .filter((f) => f.category === cat.key && selectedFieldIds.includes(f.id))
                .length;

              const allSelected = selectedInCat === totalInCat && totalInCat > 0;

              return (
                <div
                  key={cat.key}
                  style={{
                    background: '#131d31',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Category Header */}
                  <div
                    style={{
                      padding: '10px 16px',
                      background: '#1a243b',
                      borderBottom: '1px solid #1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {cat.icon}
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>{cat.title}</span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          background: selectedInCat > 0 ? 'rgba(37, 99, 235, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                          color: selectedInCat > 0 ? '#60a5fa' : '#64748b',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 600,
                        }}
                      >
                        {selectedInCat} / {totalInCat}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => selectCategory(cat.key)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#60a5fa',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => deselectCategory(cat.key)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Category Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                      gap: '8px',
                      padding: '12px 14px',
                    }}
                  >
                    {catFields.map((field) => {
                      const isSelected = selectedFieldIds.includes(field.id);
                      const orderIndex = selectedFieldIds.indexOf(field.id);

                      return (
                        <div
                          key={field.id}
                          onClick={() => toggleField(field.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(37, 99, 235, 0.12)' : '#0b1120',
                            border: `1px solid ${isSelected ? '#3b82f6' : '#1e293b'}`,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ marginTop: '2px', color: isSelected ? '#3b82f6' : '#475569' }}>
                            {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                              <span
                                style={{
                                  fontSize: '0.82rem',
                                  fontWeight: 600,
                                  color: isSelected ? '#f8fafc' : '#cbd5e1',
                                  lineHeight: 1.2,
                                }}
                              >
                                {field.label}
                              </span>
                              {isSelected && (
                                <span
                                  style={{
                                    fontSize: '0.62rem',
                                    color: '#93c5fd',
                                    background: 'rgba(59, 130, 246, 0.25)',
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    fontFamily: 'var(--font-mono, monospace)',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title={`Export column #${orderIndex + 1}`}
                                >
                                  col {orderIndex + 1}
                                </span>
                              )}
                            </div>
                            <p
                              style={{
                                fontSize: '0.72rem',
                                color: '#64748b',
                                margin: '3px 0 0 0',
                                lineHeight: 1.3,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title={field.description}
                            >
                              {field.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Export Column Order Preview */}
          {selectedFieldIds.length > 0 && (
            <div
              style={{
                padding: '12px 16px',
                background: '#090d16',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>
                EXPORT COLUMN ORDER ({selectedFieldIds.length} COLUMNS):
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  maxHeight: '80px',
                  overflowY: 'auto',
                }}
              >
                {selectedFieldIds.map((id, index) => {
                  const def = allAvailableFields.find((f) => f.id === id);
                  if (!def) return null;
                  return (
                    <div
                      key={id}
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '4px',
                        color: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <span style={{ color: '#60a5fa', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.65rem' }}>
                        {index + 1}.
                      </span>
                      <span>{def.label}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleField(id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: 0,
                          marginLeft: '2px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title="Remove column"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Toast message if present */}
          {toastMessage && (
            <div
              style={{
                position: 'sticky',
                bottom: '0',
                background: '#2563eb',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
              }}
            >
              {toastMessage}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="modal-footer"
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #1e293b',
            background: '#090d16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#94a3b8' }}>
            <Info size={14} style={{ color: '#60a5fa' }} />
            <span>
              Exporting <strong>{targetList.length}</strong> applicant records with{' '}
              <strong>{selectedFieldIds.length}</strong> columns
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="admin-btn admin-btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={selectedFieldIds.length === 0 || targetList.length === 0}
              className="admin-btn admin-btn-primary"
              style={{
                padding: '8px 20px',
                fontSize: '0.85rem',
                opacity: selectedFieldIds.length === 0 || targetList.length === 0 ? 0.5 : 1,
                cursor: selectedFieldIds.length === 0 || targetList.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <Download size={15} />
              <span>
                Download CSV ({targetList.length} rows)
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
