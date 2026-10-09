'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import VrDeviceLoader from '@/components/VrDeviceLoader';
import { SiteSettings, EmailTemplatesSettings, EmailLog, RequestStatusConfig, ReviewChecklistItem, EmailTemplateConfig } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Key,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  Share2,
  ExternalLink,
  Sliders,
  Check,
  X,
  Compass,
  PanelBottom,
  Send,
  RefreshCw,
  Trash2,
  Copy,
  Activity,
  Sparkles,
  Server,
  Inbox,
  Plus,
  ToggleLeft,
  ToggleRight,
  Layers,
  Workflow,
  Tag,
  CheckSquare,
  ListChecks,
  GraduationCap,
  ArrowUp,
  ArrowDown,
  Tags,
} from 'lucide-react';

const FALLBACK_DEPARTMENTS: string[] = [
  'Artificial Intelligence and Data Science',
  'Computer Science and Engineering',
  'Information Technology',
  'Artificial Intelligence and Machine Learning',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Cyber Security',
  'Computer Science and Business System',
  'Bio Technology',
  'Mechanical Engineering',
];

const FALLBACK_INTEREST_OPTIONS: string[] = [
  'AR',
  'VR',
  'MR',
  'XR',
  '3D Modelling',
  'Game Development',
  'Simulation',
  'Product Development',
  'UI/UX',
  'Research',
  'Hackathons',
  'Industry Projects',
  'Internships',
  'Certification',
  'Self-Learning',
  'Still Exploring',
];

const FALLBACK_STATUSES: RequestStatusConfig[] = [
  { key: 'NEW', label: 'New Application', color: '#06b6d4', is_system: true, description: 'Newly received application awaiting review' },
  { key: 'UNDER_REVIEW', label: 'Under Review', color: '#818cf8', is_system: false, description: 'Faculty committee actively evaluating candidate' },
  { key: 'SHORTLISTED', label: 'Shortlisted', color: '#c084fc', is_system: false, description: 'Shortlisted for squad interviews or practical challenge' },
  { key: 'INTERVIEW', label: 'Interview Scheduled', color: '#ec4899', is_system: false, description: 'Candidate invited for lab walkthrough & technical briefing' },
  { key: 'WAITING', label: 'Priority Waitlist', color: '#f59e0b', is_system: true, description: 'Qualified candidate queued on standby' },
  { key: 'ON_HOLD', label: 'On Hold', color: '#eab308', is_system: false, description: 'Pending academic verification or additional portfolio items' },
  { key: 'JOINED', label: 'Joined / Inducted', color: '#10b981', is_system: true, description: 'Officially inducted into an active CoE laboratory squad' },
  { key: 'REJECTED', label: 'Archived / Rejected', color: '#ef4444', is_system: true, description: 'Candidate not selected for current intake cycle' },
];

const FALLBACK_CHECKLIST: ReviewChecklistItem[] = [
  { id: 'chk-identity', label: 'College ID & Bonafide Status Verified', description: 'Cross-checked with institution ERP / registrar student records', required: true },
  { id: 'chk-portfolio', label: 'Technical Portfolio & Project Links Screened', description: 'Assessed prior experience with Unity, Unreal, Blender, Three.js, or WebXR', required: false },
  { id: 'chk-interview', label: 'Faculty / Squad Lead Interaction Completed', description: 'Assessed for motivation, problem-solving, and team collaboration fit', required: true },
  { id: 'chk-safety', label: 'XR Hardware Lab Safety & Hygiene Agreement Signed', description: 'Candidate acknowledged headset hygiene protocols and optics care', required: true },
  { id: 'chk-schedule', label: 'Lab Hours & Academic Timetable Clearance', description: 'Verified candidate availability for weekly laboratory sprint commitments', required: false },
];

const CANONICAL_HOST = 'coe.xarc.online';
const CANONICAL_ORIGIN = 'https://coe.xarc.online';

/**
 * Sanitizes Call-to-Action input to strictly collect only the page route/path.
 * Automatically strips local/dev origins (localhost, 127.0.0.1, dev ports, or full domains)
 * so there is zero environment mismatch when deployed to coe.xarc.online.
 */
function sanitizeActionPath(rawInput: string): string {
  if (!rawInput) return '';
  const trimmed = rawInput.trim();
  if (!trimmed) return '';

  // If a full URL is entered or pasted (e.g. http://localhost:3005/request/status or https://coe.xarc.online/about)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      const pathname = parsed.pathname || '/';
      const search = parsed.search || '';
      const hash = parsed.hash || '';
      const combined = `${pathname}${search}${hash}`;
      return combined.startsWith('/') ? combined : `/${combined}`;
    } catch {
      // Regex fallback if URL constructor fails
      const pathOnly = trimmed.replace(/^https?:\/\/[^/]+/i, '');
      return pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;
    }
  }

  // Ensure single leading slash
  const path = trimmed.replace(/^\/+/, '/');
  return path.startsWith('/') ? path : `/${path}`;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [activeTab, setActiveTab] = useState<'branding' | 'contact' | 'footer' | 'social' | 'security' | 'email' | 'pipeline'>('branding');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();

  // Pipeline & Custom Status Editor State
  const [newStatusKey, setNewStatusKey] = useState('');
  const [newStatusLabel, setNewStatusLabel] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#818cf8');
  const [newStatusDesc, setNewStatusDesc] = useState('');

  // Candidate Review Checklist State
  const [newChecklistLabel, setNewChecklistLabel] = useState('');
  const [newChecklistDesc, setNewChecklistDesc] = useState('');
  const [newChecklistRequired, setNewChecklistRequired] = useState(true);

  // Academic Departments & Interest Fields State
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newInterestName, setNewInterestName] = useState('');

  // Email Automation State
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplatesSettings | null>(null);
  const [activeTemplateKey, setActiveTemplateKey] = useState<string>('NEW');
  const [smtpSummary, setSmtpSummary] = useState<{ configured: boolean; host: string; port: number; secure: boolean; authUser: string; from: string } | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [savingTemplates, setSavingTemplates] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const fetchSmtpSummary = async () => {
    try {
      const res = await fetch('/api/admin/email/test');
      const d = await res.json();
      const sum = d?.summary || d?.config;
      if (d?.success && sum) {
        setSmtpSummary(sum);
      }
    } catch {
      console.error('Failed to load SMTP configuration summary');
    }
  };

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => {
        if (res.status === 401) {
          router.push('/control/auth');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.success) {
          setSettings(data.settings);
          setProfile(data.admin_profile);
          if (data.admin_profile?.email) {
            setTestEmail(data.admin_profile.email);
          }
        }
      })
      .finally(() => setLoading(false));

    // Fetch Email automation data
    fetch('/api/admin/email/templates')
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && d.templates) setEmailTemplates(d.templates);
      })
      .catch(() => {});

    fetchSmtpSummary();
    fetchEmailLogs();
  }, []);

  const fetchEmailLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await fetch('/api/admin/email/logs?limit=30');
      const data = await res.json();
      if (data?.success) {
        setEmailLogs(data.logs || []);
      }
    } catch {
      console.error('Failed to load email logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    setTestResult(null);
    const targetRecipient = (testEmail || profile?.email || '').trim();
    if (!targetRecipient || !targetRecipient.includes('@')) {
      setTestResult({ success: false, message: 'Please enter a valid recipient email address.' });
      setTestingSmtp(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetRecipient,
          recipient: targetRecipient,
        }),
      });
      const data = await res.json();
      setTestResult(data);
      fetchEmailLogs();
      fetchSmtpSummary();
    } catch {
      setTestResult({ success: false, message: 'Network failure dispatching test email.' });
    } finally {
      setTestingSmtp(false);
    }
  };

  // Pipeline Management Handlers
  const handleToggleRegistration = (newVal: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      registration_open: newVal,
    });
  };

  const handleAddCustomStatus = () => {
    if (!settings) return;
    const cleanKey = newStatusKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    const cleanLabel = newStatusLabel.trim();
    if (!cleanKey || !cleanLabel) {
      alert('Status Code and Display Label are required.');
      return;
    }

    const currentStatuses = settings.custom_statuses || FALLBACK_STATUSES;
    if (currentStatuses.some((s) => s.key === cleanKey)) {
      alert(`Status key "${cleanKey}" already exists in your pipeline.`);
      return;
    }

    const newStatus: RequestStatusConfig = {
      key: cleanKey,
      label: cleanLabel,
      color: newStatusColor || '#818cf8',
      description: newStatusDesc.trim() || undefined,
      is_system: false,
    };

    setSettings({
      ...settings,
      custom_statuses: [...currentStatuses, newStatus],
    });

    setNewStatusKey('');
    setNewStatusLabel('');
    setNewStatusDesc('');
    setMsg({ text: `Custom status "${cleanLabel}" added. Click "Save Settings & Credentials" to persist.`, type: 'success' });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleDeleteCustomStatus = (keyToDelete: string) => {
    if (!settings) return;
    const currentStatuses = settings.custom_statuses || FALLBACK_STATUSES;
    const target = currentStatuses.find((s) => s.key === keyToDelete);
    if (target?.is_system) {
      alert('System statuses cannot be removed as they are essential to core pipeline operations.');
      return;
    }
    if (!confirm(`Remove status "${target?.label || keyToDelete}" from pipeline taxonomy?`)) return;

    setSettings({
      ...settings,
      custom_statuses: currentStatuses.filter((s) => s.key !== keyToDelete),
    });
  };

  const handleResetDefaultStatuses = () => {
    if (!settings) return;
    if (!confirm('Reset all applicant pipeline statuses to factory defaults?')) return;
    setSettings({
      ...settings,
      custom_statuses: [...FALLBACK_STATUSES],
    });
    setMsg({ text: 'Pipeline statuses reset to defaults. Remember to save.', type: 'success' });
    setTimeout(() => setMsg(null), 3000);
  };

  // Candidate Review Checklist Handlers
  const handleAddChecklistItem = () => {
    if (!settings) return;
    const label = newChecklistLabel.trim();
    if (!label) {
      alert('Checklist item title/label is required.');
      return;
    }
    const currentList = settings.review_checklist || FALLBACK_CHECKLIST;
    const newItem: ReviewChecklistItem = {
      id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label,
      description: newChecklistDesc.trim() || undefined,
      required: newChecklistRequired,
    };
    setSettings({
      ...settings,
      review_checklist: [...currentList, newItem],
    });
    setNewChecklistLabel('');
    setNewChecklistDesc('');
    setNewChecklistRequired(true);
    setMsg({ text: `Checklist field "${label}" added. Remember to save settings.`, type: 'success' });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDeleteChecklistItem = (id: string) => {
    if (!settings) return;
    const currentList = settings.review_checklist || FALLBACK_CHECKLIST;
    const item = currentList.find((c) => c.id === id);
    if (!confirm(`Delete verification checklist item "${item?.label || id}"?`)) return;
    setSettings({
      ...settings,
      review_checklist: currentList.filter((c) => c.id !== id),
    });
  };

  const handleToggleChecklistRequired = (id: string) => {
    if (!settings) return;
    const currentList = settings.review_checklist || FALLBACK_CHECKLIST;
    setSettings({
      ...settings,
      review_checklist: currentList.map((c) => (c.id === id ? { ...c, required: !c.required } : c)),
    });
  };

  const handleUpdateChecklistItem = (id: string, updates: Partial<ReviewChecklistItem>) => {
    if (!settings) return;
    const currentList = settings.review_checklist || FALLBACK_CHECKLIST;
    setSettings({
      ...settings,
      review_checklist: currentList.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  const handleResetChecklist = () => {
    if (!settings) return;
    if (!confirm('Reset candidate review checklist to institutional defaults?')) return;
    setSettings({
      ...settings,
      review_checklist: [...FALLBACK_CHECKLIST],
    });
    setMsg({ text: 'Checklist reset to institutional defaults. Remember to save.', type: 'success' });
    setTimeout(() => setMsg(null), 3000);
  };

  // Academic Departments Handlers
  const handleAddDepartment = () => {
    if (!settings) return;
    const name = newDepartmentName.trim();
    if (!name) {
      alert('Department name cannot be empty.');
      return;
    }
    const currentList = settings.departments && settings.departments.length > 0 
      ? settings.departments 
      : FALLBACK_DEPARTMENTS;
    if (currentList.some((d) => d.toLowerCase() === name.toLowerCase())) {
      alert(`Department "${name}" is already configured.`);
      return;
    }
    setSettings({
      ...settings,
      departments: [...currentList, name],
    });
    setNewDepartmentName('');
    setMsg({ text: `Department "${name}" added to eligible disciplines. Remember to save settings.`, type: 'success' });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDeleteDepartment = (index: number) => {
    if (!settings) return;
    const currentList = settings.departments && settings.departments.length > 0 
      ? settings.departments 
      : FALLBACK_DEPARTMENTS;
    const target = currentList[index];
    if (currentList.length <= 1) {
      alert('At least one academic department must remain configured.');
      return;
    }
    if (!confirm(`Remove "${target}" from eligible academic departments?`)) return;
    const updated = currentList.filter((_, i) => i !== index);
    setSettings({
      ...settings,
      departments: updated,
    });
  };

  const handleMoveDepartment = (index: number, direction: 'up' | 'down') => {
    if (!settings) return;
    const currentList = [...(settings.departments && settings.departments.length > 0 ? settings.departments : FALLBACK_DEPARTMENTS)];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;
    const temp = currentList[index];
    currentList[index] = currentList[targetIndex];
    currentList[targetIndex] = temp;
    setSettings({
      ...settings,
      departments: currentList,
    });
  };

  const handleUpdateDepartment = (index: number, newName: string) => {
    if (!settings) return;
    const currentList = [...(settings.departments && settings.departments.length > 0 ? settings.departments : FALLBACK_DEPARTMENTS)];
    currentList[index] = newName;
    setSettings({
      ...settings,
      departments: currentList,
    });
  };

  const handleResetDepartments = () => {
    if (!settings) return;
    if (!confirm('Reset academic departments to the 10 canonical disciplines?')) return;
    setSettings({
      ...settings,
      departments: [...FALLBACK_DEPARTMENTS],
    });
    setMsg({ text: 'Departments reset to 10 canonical disciplines. Remember to save.', type: 'success' });
    setTimeout(() => setMsg(null), 3000);
  };

  // Interest Fields Handlers
  const handleAddInterest = () => {
    if (!settings) return;
    const tag = newInterestName.trim();
    if (!tag) {
      alert('Interest tag cannot be empty.');
      return;
    }
    const currentList = settings.interest_options && settings.interest_options.length > 0 
      ? settings.interest_options 
      : FALLBACK_INTEREST_OPTIONS;
    if (currentList.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      alert(`Interest domain "${tag}" already exists.`);
      return;
    }
    setSettings({
      ...settings,
      interest_options: [...currentList, tag],
    });
    setNewInterestName('');
    setMsg({ text: `Interest domain "${tag}" added. Remember to save settings.`, type: 'success' });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDeleteInterest = (index: number) => {
    if (!settings) return;
    const currentList = settings.interest_options && settings.interest_options.length > 0 
      ? settings.interest_options 
      : FALLBACK_INTEREST_OPTIONS;
    const target = currentList[index];
    if (currentList.length <= 1) {
      alert('At least one interest domain must remain configured.');
      return;
    }
    if (!confirm(`Remove "${target}" from candidate interest domains?`)) return;
    const updated = currentList.filter((_, i) => i !== index);
    setSettings({
      ...settings,
      interest_options: updated,
    });
  };

  const handleMoveInterest = (index: number, direction: 'up' | 'down') => {
    if (!settings) return;
    const currentList = [...(settings.interest_options && settings.interest_options.length > 0 ? settings.interest_options : FALLBACK_INTEREST_OPTIONS)];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;
    const temp = currentList[index];
    currentList[index] = currentList[targetIndex];
    currentList[targetIndex] = temp;
    setSettings({
      ...settings,
      interest_options: currentList,
    });
  };

  const handleUpdateInterest = (index: number, newTag: string) => {
    if (!settings) return;
    const currentList = [...(settings.interest_options && settings.interest_options.length > 0 ? settings.interest_options : FALLBACK_INTEREST_OPTIONS)];
    currentList[index] = newTag;
    setSettings({
      ...settings,
      interest_options: currentList,
    });
  };

  const handleResetInterests = () => {
    if (!settings) return;
    if (!confirm('Reset candidate interest domains to default XR specialization tags?')) return;
    setSettings({
      ...settings,
      interest_options: [...FALLBACK_INTEREST_OPTIONS],
    });
    setMsg({ text: 'Interest fields reset to default options. Remember to save.', type: 'success' });
    setTimeout(() => setMsg(null), 3000);
  };

  // Status Email Templates Helper Accessors
  const getActiveTemplate = (key: string): EmailTemplateConfig => {
    const upper = (key || '').toUpperCase();
    const lower = (key || '').toLowerCase();

    let tpl: EmailTemplateConfig | undefined;
    if (emailTemplates?.status_templates && emailTemplates.status_templates[upper]) {
      tpl = emailTemplates.status_templates[upper];
    } else if (lower === 'joined' && emailTemplates?.joined) {
      tpl = emailTemplates.joined;
    } else if (lower === 'waiting' && emailTemplates?.waiting) {
      tpl = emailTemplates.waiting;
    } else if (lower === 'rejected' && emailTemplates?.rejected) {
      tpl = emailTemplates.rejected;
    }

    if (tpl) {
      return {
        ...tpl,
        action_url: tpl.action_url ? sanitizeActionPath(tpl.action_url) : '/request/status',
      };
    }

    const stConfig = (settings?.custom_statuses || FALLBACK_STATUSES).find((s) => s.key === upper);
    return {
      enabled: true,
      subject: `Application Update: ${stConfig?.label || upper} // {{coe_name}}`,
      badge_text: stConfig?.label?.toUpperCase() || upper,
      headline: `Application Status: ${stConfig?.label || upper}`,
      body_text: `Dear {{student_name}}, your application for the AR/VR Centre of Excellence has transitioned to ${stConfig?.label || upper}.`,
      next_steps: ['Review guidelines and prepare portfolio assets', 'Monitor your student portal for further instructions'],
      action_label: 'View Application Status',
      action_url: '/request/status',
    };
  };

  const updateActiveTemplate = (patch: Partial<EmailTemplateConfig>) => {
    if (!emailTemplates) return;
    const upper = (activeTemplateKey || 'NEW').toUpperCase();
    const lower = (activeTemplateKey || 'NEW').toLowerCase();

    // Sanitize action_url if being updated to keep relative path only
    const cleanPatch = { ...patch };
    if (cleanPatch.action_url !== undefined) {
      cleanPatch.action_url = sanitizeActionPath(cleanPatch.action_url);
    }

    const current = getActiveTemplate(activeTemplateKey);
    const updated: EmailTemplateConfig = { ...current, ...cleanPatch };

    const newStatusTemplates = {
      ...(emailTemplates.status_templates || {}),
      [upper]: updated,
    };

    const updatedTemplates: EmailTemplatesSettings = {
      ...emailTemplates,
      status_templates: newStatusTemplates,
    };

    if (upper === 'JOINED' || lower === 'joined') updatedTemplates.joined = updated;
    if (upper === 'WAITING' || lower === 'waiting') updatedTemplates.waiting = updated;
    if (upper === 'REJECTED' || lower === 'rejected') updatedTemplates.rejected = updated;

    setEmailTemplates(updatedTemplates);
  };

  const handleSaveTemplates = async () => {
    if (!emailTemplates) return;
    setSavingTemplates(true);
    try {
      // Normalize all action_urls to relative paths to avoid domain mismatches
      const sanitizedTemplates: EmailTemplatesSettings = {
        ...emailTemplates,
        joined: {
          ...emailTemplates.joined,
          action_url: sanitizeActionPath(emailTemplates.joined?.action_url || '/about'),
        },
        waiting: {
          ...emailTemplates.waiting,
          action_url: sanitizeActionPath(emailTemplates.waiting?.action_url || '/events'),
        },
        rejected: {
          ...emailTemplates.rejected,
          action_url: sanitizeActionPath(emailTemplates.rejected?.action_url || '/'),
        },
        status_templates: Object.fromEntries(
          Object.entries(emailTemplates.status_templates || {}).map(([k, cfg]) => [
            k,
            { ...cfg, action_url: sanitizeActionPath(cfg.action_url || '/request/status') },
          ])
        ),
      };

      const res = await fetch('/api/admin/email/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templates: sanitizedTemplates }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailTemplates(sanitizedTemplates);
        setMsg({ text: 'Email templates updated successfully with normalized hosted URLs.', type: 'success' });
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ text: data.message || 'Failed to update email templates.', type: 'error' });
      }
    } catch {
      setMsg({ text: 'Network error saving templates.', type: 'error' });
    } finally {
      setSavingTemplates(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to clear all transmission outbox logs?')) return;
    try {
      const res = await fetch('/api/admin/email/logs', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setEmailLogs([]);
        setMsg({ text: 'Transmission logs cleared successfully.', type: 'success' });
        setTimeout(() => setMsg(null), 2500);
      }
    } catch {
      console.error('Failed to clear logs');
    }
  };

  const copyVariable = (v: string) => {
    navigator.clipboard.writeText(v);
    setCopiedVar(v);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  // Password Strength Calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Not Entered', color: '#6b7280' };
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;

    if (score <= 25) return { score, label: 'Weak', color: '#ef4444' };
    if (score <= 50) return { score, label: 'Fair', color: '#f59e0b' };
    if (score <= 75) return { score, label: 'Good', color: '#38bdf8' };
    return { score: 100, label: 'Very Strong', color: '#22c55e' };
  };

  const passCriteria = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    symbol: /[^A-Za-z0-9]/.test(newPassword),
    matches: Boolean(newPassword && newPassword === confirmPassword),
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMsg(null);

    // Password validation
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setMsg({ text: 'New password and confirmation do not match.', type: 'error' });
        setSaving(false);
        return;
      }
      if (newPassword.length < 8) {
        setMsg({ text: 'New password must be at least 8 characters long.', type: 'error' });
        setSaving(false);
        return;
      }
      if (!currentPassword) {
        setMsg({ text: 'Current password is required to change password.', type: 'error' });
        setSaving(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings,
          profile,
          current_password: currentPassword || undefined,
          new_password: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Configuration and credentials updated successfully.', type: 'success' });
        if (data.admin_profile) {
          setProfile(data.admin_profile);
        }
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ text: data.message || 'Failed to update settings.', type: 'error' });
      }
    } catch {
      setMsg({ text: 'A network error occurred.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminHeader
          title="Interactive Settings & Security Studio"
          subtitle="Configure institutional branding, contact endpoints, and admin security profile with live simulator"
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

          {saving && (
            <VrDeviceLoader
              mode="fullscreen"
              title="COMMITTING SYSTEM CONFIGURATION..."
              subtext="Persisting branding, security credentials, and department taxonomy to cloud storage..."
              badge="CONFIG TRANSACTION"
            />
          )}

          {loading ? (
            <VrDeviceLoader
              mode="card"
              title="SYNCHRONIZING SYSTEM SETTINGS..."
              subtext="Loading security credentials, department taxonomy, and email gateway"
              badge="CORE CONFIGURATION"
            />
          ) : settings && profile ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1.15fr) minmax(400px, 1fr)', gap: '24px', alignItems: 'start' }}>
              
              {/* LEFT COLUMN: INTERACTIVE TABS & CONTROLS */}
              <div>
                
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
                    { id: 'branding', label: '01 Branding', icon: Globe },
                    { id: 'contact', label: '02 Contact', icon: Building },
                    { id: 'footer', label: '03 Footer', icon: PanelBottom },
                    { id: 'social', label: '04 Social', icon: Share2 },
                    { id: 'security', label: '05 Security', icon: Key },
                    { id: 'email', label: '06 Email & Automation', icon: Mail },
                    { id: 'pipeline', label: '07 Pipeline & Intake', icon: Sliders },
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

                {/* TAB 1: BRANDING & SEO */}
                {activeTab === 'branding' && (
                  <div className="admin-card" style={{ marginBottom: '20px' }}>
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">01 // BRAND IDENTITY & SEO PARAMETERS</h3>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <label className="admin-field-label" style={{ marginBottom: 0 }}>Website Root Title</label>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{settings.site_title?.length || 0} chars</span>
                          </div>
                          <input
                            type="text"
                            className="admin-input"
                            value={settings.site_title || ''}
                            onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                            placeholder="e.g. AR/VR Centre of Excellence | Spatial Computing Lab"
                          />
                        </div>
                        <div>
                          <label className="admin-field-label">Favicon Asset Path</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={settings.favicon_url || ''}
                            onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })}
                            placeholder="/favicon.ico"
                          />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <label className="admin-field-label" style={{ marginBottom: 0 }}>Global SEO Meta Description</label>
                          <span style={{ fontSize: '0.72rem', color: ((settings.meta_description?.length || 0) > 160) ? '#f59e0b' : 'var(--text-muted)' }}>
                            {settings.meta_description?.length || 0} / 160 chars
                          </span>
                        </div>
                        <textarea
                          className="admin-textarea"
                          rows={2}
                          value={settings.meta_description || ''}
                          onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                          placeholder="Global meta description for search engines and social cards..."
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">Institution / University Name</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={settings.institution_name}
                            onChange={(e) => setSettings({ ...settings, institution_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="admin-field-label">Centre of Excellence Name</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={settings.coe_name}
                            onChange={(e) => setSettings({ ...settings, coe_name: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="admin-field-label">Institutional Tagline</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={settings.tagline || ''}
                          onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                          placeholder="e.g. Explore. Learn. Build. Innovate."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: CONTACT & CAMPUS */}
                {activeTab === 'contact' && (
                  <div className="admin-card" style={{ marginBottom: '20px' }}>
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">02 // OFFICIAL CONTACT & CAMPUS LOCATION</h3>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">Official Contact Email</label>
                          <input
                            type="email"
                            className="admin-input"
                            value={settings.contact_email}
                            onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="admin-field-label">Contact Phone</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={settings.contact_phone}
                            onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="admin-field-label">Laboratory Room / Wing</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={settings.office_location}
                          onChange={(e) => setSettings({ ...settings, office_location: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="admin-field-label">Full Campus Postal Address</label>
                        <textarea
                          className="admin-textarea"
                          rows={2}
                          value={settings.campus_address}
                          onChange={(e) => setSettings({ ...settings, campus_address: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="admin-field-label">Working Hours & Lab Access</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={settings.working_hours}
                          onChange={(e) => setSettings({ ...settings, working_hours: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: FOOTER CONTENTS */}
                {activeTab === 'footer' && (
                  <div className="admin-card" style={{ marginBottom: '20px' }}>
                    <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 className="admin-card-title">03 // FOOTER CONTENTS & BRANDING</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                          Configure copyright notice, institution attribution, contact phone & email, and optional spatial taglines.
                        </p>
                      </div>
                      <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                        LIVE FOOTER
                      </span>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">CoE Display Name in Footer</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={settings.coe_name}
                            onChange={(e) => setSettings({ ...settings, coe_name: e.target.value })}
                            placeholder="e.g. AR/VR Centre of Excellence"
                          />
                        </div>
                        <div>
                          <label className="admin-field-label">Institution / University Name in Footer</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={settings.institution_name}
                            onChange={(e) => setSettings({ ...settings, institution_name: e.target.value })}
                            placeholder="e.g. Centre of Excellence"
                          />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <label className="admin-field-label" style={{ marginBottom: 0 }}>Copyright Notice Text</label>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Displays immediately following the institution name</span>
                        </div>
                        <input
                          type="text"
                          className="admin-input"
                          value={settings.footer_copyright || 'All Rights Reserved.'}
                          onChange={(e) => setSettings({ ...settings, footer_copyright: e.target.value })}
                          placeholder="e.g. All Rights Reserved."
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">
                            Footer Contact Email (<span style={{ fontFamily: 'monospace' }}>mailto:</span>)
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)' }} />
                            <input
                              type="email"
                              className="admin-input"
                              style={{ paddingLeft: '36px' }}
                              value={settings.contact_email}
                              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                              placeholder="arvr.coe@institute.edu"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="admin-field-label">
                            Footer Contact Phone (<span style={{ fontFamily: 'monospace' }}>tel:</span>)
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Phone size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4ade80' }} />
                            <input
                              type="text"
                              className="admin-input"
                              style={{ paddingLeft: '36px' }}
                              value={settings.contact_phone}
                              onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                              placeholder="+91 44 2345 6789"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <label className="admin-field-label" style={{ marginBottom: 0 }}>Optional Footer Subtitle / Tagline Badge</label>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Displays as an identification badge</span>
                        </div>
                        <input
                          type="text"
                          className="admin-input"
                          value={settings.footer_tagline || ''}
                          onChange={(e) => setSettings({ ...settings, footer_tagline: e.target.value })}
                          placeholder="e.g. Spatial Computing & Immersive Engineering Digital Ecosystem"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: SOCIAL CHANNELS */}
                {activeTab === 'social' && (
                  <div className="admin-card" style={{ marginBottom: '20px' }}>
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">04 // SOCIAL & REPOSITORY CHANNELS</h3>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      
                      {[
                        { key: 'linkedin', label: 'LinkedIn Page', placeholder: 'https://linkedin.com/company/...' },
                        { key: 'github', label: 'GitHub Organization', placeholder: 'https://github.com/...' },
                        { key: 'youtube', label: 'YouTube Channel', placeholder: 'https://youtube.com/@...' },
                        { key: 'twitter', label: 'Twitter / X Profile', placeholder: 'https://x.com/...' },
                      ].map((item) => {
                        const val = (settings.social_links as any)?.[item.key] || '';
                        const isSet = Boolean(val && val.trim().length > 5);
                        return (
                          <div key={item.key}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <label className="admin-field-label" style={{ marginBottom: 0 }}>{item.label}</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    background: isSet ? 'rgba(34, 197, 94, 0.15)' : 'rgba(156, 163, 175, 0.15)',
                                    color: isSet ? '#86efac' : '#9ca3af',
                                  }}
                                >
                                  {isSet ? 'ACTIVE' : 'UNSET'}
                                </span>
                                {isSet && (
                                  <a
                                    href={val}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center' }}
                                    title="Test Link"
                                  >
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                              </div>
                            </div>
                            <input
                              type="url"
                              className="admin-input"
                              placeholder={item.placeholder}
                              value={val}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  social_links: { ...settings.social_links, [item.key]: e.target.value },
                                })
                              }
                            />
                          </div>
                        );
                      })}

                    </div>
                  </div>
                )}

                {/* TAB 5: PROFILE & SECURITY */}
                {activeTab === 'security' && (
                  <div className="admin-card" style={{ marginBottom: '20px' }}>
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">05 // ADMINISTRATOR PROFILE & SECURITY</h3>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">Administrator Display Name</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="admin-field-label">Admin Email (Login Account)</label>
                          <input
                            type="email"
                            className="admin-input"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            placeholder="admin@coe.edu"
                          />
                        </div>
                      </div>

                      {/* Password Reset Section with Interactive Strength Analyzer */}
                      <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', marginTop: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                          <Key size={16} style={{ color: 'var(--accent-primary)' }} />
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Change Admin Password (Leave blank to keep existing)
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div>
                            <label className="admin-field-label">Current Master Password</label>
                            <div style={{ position: 'relative' }}>
                              <input
                                type={showCurrentPass ? 'text' : 'password'}
                                className="admin-input"
                                placeholder="Required only if changing password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                style={{ paddingRight: '40px' }}
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPass(!showCurrentPass)}
                                style={{
                                  position: 'absolute',
                                  right: '12px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                }}
                              >
                                {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <div>
                              <label className="admin-field-label">New Password</label>
                              <div style={{ position: 'relative' }}>
                                <input
                                  type={showNewPass ? 'text' : 'password'}
                                  className="admin-input"
                                  placeholder="Min 8 characters"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  style={{ paddingRight: '40px' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPass(!showNewPass)}
                                  style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="admin-field-label">Confirm New Password</label>
                              <div style={{ position: 'relative' }}>
                                <input
                                  type={showConfirmPass ? 'text' : 'password'}
                                  className="admin-input"
                                  placeholder="Re-type new password"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  style={{ paddingRight: '40px' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                                  style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* INTERACTIVE PASSWORD METERS & CHECKLIST */}
                          {newPassword && (
                            <div
                              style={{
                                background: 'var(--surface-input)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '10px',
                                padding: '14px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                  Security Strength: <strong style={{ color: strength.color }}>{strength.label}</strong>
                                </span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{strength.score}%</span>
                              </div>

                              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    width: `${strength.score}%`,
                                    height: '100%',
                                    background: strength.color,
                                    transition: 'all 0.3s ease',
                                  }}
                                />
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
                                {[
                                  { label: '8+ Characters', met: passCriteria.length },
                                  { label: 'Uppercase Letter', met: passCriteria.upper },
                                  { label: 'Numeric Digit', met: passCriteria.number },
                                  { label: 'Special Character', met: passCriteria.symbol },
                                  { label: 'Passwords Match', met: passCriteria.matches },
                                ].map((c, i) => (
                                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
                                    {c.met ? <Check size={12} color="#22c55e" /> : <X size={12} color="#ef4444" />}
                                    <span style={{ color: c.met ? 'var(--text-primary)' : 'var(--text-muted)' }}>{c.label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: EMAIL & AUTOMATION */}
                {activeTab === 'email' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                    
                    {/* SECTION 1: IN-APP SMTP TRANSCEIVER & DIAGNOSTICS */}
                    <div className="admin-card">
                      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="admin-card-title">06.1 // SMTP TRANSCEIVER HEALTH & DIAGNOSTICS</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={fetchSmtpSummary}
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Verify SMTP Gateway Connection"
                          >
                            <RefreshCw size={11} />
                            <span>Verify Gateway</span>
                          </button>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: '12px',
                              background: smtpSummary?.configured ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: smtpSummary?.configured ? '#86efac' : '#fca5a5',
                              border: `1px solid ${smtpSummary?.configured ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                            }}
                          >
                            {smtpSummary?.configured ? 'CONFIGURED' : 'UNCONFIGURED'}
                          </span>
                        </div>
                      </div>

                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Config Status Grid */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                            gap: '10px',
                            background: 'var(--surface-input)',
                            padding: '14px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-glass)',
                            fontSize: '0.75rem',
                          }}
                        >
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block' }}>SMTP Host:</span>
                            <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                              {smtpSummary?.host || 'localhost'}
                            </strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Port:</span>
                            <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>
                              {smtpSummary?.port || 587}
                            </strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block' }}>TLS / Secure:</span>
                            <strong style={{ color: smtpSummary?.secure ? '#4ade80' : '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                              {smtpSummary?.secure ? 'YES (465 SSL)' : 'STARTTLS (587)'}
                            </strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Auth Account:</span>
                            <strong style={{ color: '#a78bfa', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                              {smtpSummary?.authUser || 'Not Configured'}
                            </strong>
                          </div>
                        </div>

                        {/* Test Email Dispatcher */}
                        <div>
                          <label className="admin-field-label">Diagnostic Test Email Recipient</label>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                              type="email"
                              className="admin-input"
                              placeholder="admin@coe.edu"
                              value={testEmail}
                              onChange={(e) => setTestEmail(e.target.value)}
                              style={{ flex: 1 }}
                            />
                            <button
                              type="button"
                              onClick={handleTestSmtp}
                              disabled={testingSmtp}
                              className="admin-btn admin-btn-primary"
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', whiteSpace: 'nowrap' }}
                            >
                              <Send size={14} />
                              <span>{testingSmtp ? 'Transmitting...' : 'Test SMTP Connection'}</span>
                            </button>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Dispatches a test ping via transporter.verify() and logs real-time delivery latency to your outbox.
                          </div>
                        </div>

                        {/* Diagnostic Result Banner */}
                        {testResult && (
                          <div
                            style={{
                              background: testResult.success ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                              border: `1px solid ${testResult.success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                              borderRadius: '8px',
                              padding: '12px 16px',
                              fontSize: '0.8rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: testResult.success ? '#86efac' : '#fca5a5' }}>
                              {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                              <span>{testResult.message}</span>
                            </div>
                            {testResult.details && (
                              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                                <span>Latency: <strong style={{ color: '#fff' }}>{testResult.details.latencyMs} ms</strong></span>
                                <span>Host: {testResult.details.host}:{testResult.details.port}</span>
                                {testResult.details.messageId && (
                                  <span>Message-ID: {testResult.details.messageId}</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECTION 2: EDITABLE PIPELINE EMAIL TEMPLATES */}
                    <div className="admin-card">
                      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="admin-card-title">06.2 // EDITABLE PIPELINE EMAIL TEMPLATES</h3>
                        <button
                          type="button"
                          onClick={handleSaveTemplates}
                          disabled={savingTemplates}
                          className="admin-btn admin-btn-primary admin-btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Save size={13} />
                          <span>{savingTemplates ? 'Saving...' : 'Save Email Templates'}</span>
                        </button>
                      </div>

                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Dynamic Status Tabs */}
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
                            SELECT PIPELINE STATUS TEMPLATE ({(settings?.custom_statuses || FALLBACK_STATUSES).length} CONFIGURED):
                          </div>
                          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
                            {(settings?.custom_statuses || FALLBACK_STATUSES).map((st) => {
                              const isSel = (activeTemplateKey || 'NEW').toUpperCase() === st.key.toUpperCase();
                              const tpl = getActiveTemplate(st.key);
                              const isEnabled = tpl.enabled ?? true;
                              return (
                                <button
                                  key={st.key}
                                  type="button"
                                  onClick={() => setActiveTemplateKey(st.key)}
                                  style={{
                                    background: isSel ? 'var(--surface-input)' : 'transparent',
                                    border: isSel ? `1px solid ${st.color}` : '1px solid var(--border-glass)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    fontSize: '0.78rem',
                                    fontWeight: isSel ? 700 : 500,
                                    color: isSel ? '#fff' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    whiteSpace: 'nowrap',
                                    boxShadow: isSel ? `0 0 12px ${st.color}25` : 'none',
                                    transition: 'all 0.15s ease',
                                    opacity: isEnabled ? 1 : 0.65,
                                  }}
                                >
                                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: st.color }} />
                                  <span>{st.label}</span>
                                  {!isEnabled && (
                                    <span style={{ fontSize: '0.62rem', color: '#f87171', fontFamily: 'var(--font-mono)' }}>[MUTED]</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Variable Reference Palette */}
                        <div
                          style={{
                            background: 'var(--surface-input)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                          }}
                        >
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Interactive Placeholders (Click to copy):</span>
                            {copiedVar && <span style={{ color: '#4ade80', fontWeight: 600 }}>Copied {copiedVar}!</span>}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {['{{student_name}}', '{{register_number}}', '{{department}}', '{{year}}', '{{section}}', '{{coe_name}}'].map((v) => (
                              <span
                                key={v}
                                onClick={() => copyVariable(v)}
                                style={{
                                  fontSize: '0.72rem',
                                  fontFamily: 'var(--font-mono)',
                                  background: 'rgba(6, 182, 212, 0.12)',
                                  color: 'var(--accent-cyan)',
                                  border: '1px solid rgba(6, 182, 212, 0.25)',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                }}
                                title="Click to copy placeholder"
                              >
                                {v}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Active Template Editor Form */}
                        {(() => {
                          const activeTemplate = getActiveTemplate(activeTemplateKey);
                          const activeStatus = (settings?.custom_statuses || FALLBACK_STATUSES).find(
                            (s) => s.key === (activeTemplateKey || 'NEW').toUpperCase()
                          ) || { key: activeTemplateKey, label: activeTemplateKey, color: '#06b6d4' };

                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                              {/* Automated Dispatch Toggle Card */}
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '12px 16px',
                                  background: 'var(--surface-input)',
                                  borderRadius: '8px',
                                  border: '1px solid var(--border-glass)',
                                  gap: '12px',
                                  flexWrap: 'wrap',
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>Automated Dispatch for {activeStatus.label}</span>
                                    <span
                                      style={{
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        background: (activeTemplate.enabled ?? true) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                        color: (activeTemplate.enabled ?? true) ? '#86efac' : '#fca5a5',
                                        border: `1px solid ${(activeTemplate.enabled ?? true) ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                                      }}
                                    >
                                      {(activeTemplate.enabled ?? true) ? 'AUTO-DISPATCH ACTIVE' : 'MUTED // NO AUTOMATED EMAIL'}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    {(activeTemplate.enabled ?? true)
                                      ? `When student request status transitions to ${activeStatus.label} with "Notify Student" enabled, this custom email is dispatched.`
                                      : `Automated emails for ${activeStatus.label} are silenced. Status updates will not trigger emails to applicants.`}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => updateActiveTemplate({ enabled: !(activeTemplate.enabled ?? true) })}
                                  className={`admin-btn ${(activeTemplate.enabled ?? true) ? 'admin-btn-secondary' : 'admin-btn-primary'} admin-btn-sm`}
                                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', padding: '6px 14px' }}
                                >
                                  {(activeTemplate.enabled ?? true) ? (
                                    <>
                                      <ToggleRight size={16} color="#10b981" />
                                      <span>Mute Automated Mail</span>
                                    </>
                                  ) : (
                                    <>
                                      <ToggleLeft size={16} color="#ef4444" />
                                      <span>Enable Automated Mail</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <div>
                                <label className="admin-field-label">Subject Line</label>
                                <input
                                  type="text"
                                  className="admin-input"
                                  value={activeTemplate.subject || ''}
                                  onChange={(e) => updateActiveTemplate({ subject: e.target.value })}
                                />
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                  <label className="admin-field-label">Category Badge Text</label>
                                  <input
                                    type="text"
                                    className="admin-input"
                                    value={activeTemplate.badge_text || ''}
                                    onChange={(e) => updateActiveTemplate({ badge_text: e.target.value })}
                                  />
                                </div>

                                <div>
                                  <label className="admin-field-label">Pipeline Stage Theme</label>
                                  <div style={{ display: 'flex', alignItems: 'center', height: '38px', gap: '8px', padding: '0 12px', background: 'var(--surface-input)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: activeStatus.color }} />
                                    <span style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 600 }}>
                                      {activeStatus.label} ({activeStatus.key})
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="admin-field-label">Card Headline</label>
                                <input
                                  type="text"
                                  className="admin-input"
                                  value={activeTemplate.headline || ''}
                                  onChange={(e) => updateActiveTemplate({ headline: e.target.value })}
                                />
                              </div>

                              <div>
                                <label className="admin-field-label">Body Text / Narrative Message</label>
                                <textarea
                                  className="admin-textarea"
                                  rows={3}
                                  value={activeTemplate.body_text || ''}
                                  onChange={(e) => updateActiveTemplate({ body_text: e.target.value })}
                                />
                              </div>

                              <div>
                                <label className="admin-field-label">Next Steps / Instructions (One per line)</label>
                                <textarea
                                  className="admin-textarea"
                                  rows={4}
                                  value={(activeTemplate.next_steps || []).join('\n')}
                                  onChange={(e) =>
                                    updateActiveTemplate({
                                      next_steps: e.target.value.split('\n').filter((s) => s.trim().length > 0),
                                    })
                                  }
                                />
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                  Each line is formatted as a numbered action item in the recipient&apos;s email card.
                                </div>
                              </div>

                              {/* CALL-TO-ACTION BUTTON & TARGET PAGE ROUTE CONFIGURATION */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.9fr', gap: '14px' }}>
                                  <div>
                                    <label className="admin-field-label">Call-to-Action Button Label</label>
                                    <input
                                      type="text"
                                      className="admin-input"
                                      placeholder="e.g. View Lab Portal →"
                                      value={activeTemplate.action_label || ''}
                                      onChange={(e) => updateActiveTemplate({ action_label: e.target.value })}
                                    />
                                  </div>

                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                      <label className="admin-field-label" style={{ marginBottom: 0 }}>
                                        Target Page Route <span style={{ color: 'var(--accent-cyan)' }}>(Path Only)</span>
                                      </label>
                                      <span
                                        style={{
                                          fontSize: '0.66rem',
                                          padding: '2px 8px',
                                          borderRadius: '10px',
                                          background: 'rgba(16, 185, 129, 0.15)',
                                          color: '#86efac',
                                          border: '1px solid rgba(16, 185, 129, 0.3)',
                                          fontFamily: 'var(--font-mono)',
                                        }}
                                      >
                                        HOST: coe.xarc.online
                                      </span>
                                    </div>

                                    {/* Input Group with fixed hosted domain badge */}
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'stretch',
                                        background: 'var(--surface-input)',
                                        border: '1px solid var(--border-glass)',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          padding: '0 12px',
                                          background: 'rgba(255, 255, 255, 0.04)',
                                          borderRight: '1px solid var(--border-glass)',
                                          fontSize: '0.74rem',
                                          fontFamily: 'var(--font-mono)',
                                          color: 'var(--accent-cyan)',
                                          whiteSpace: 'nowrap',
                                          userSelect: 'none',
                                        }}
                                        title="Production domain is locked to coe.xarc.online to prevent hosted environment mismatches."
                                      >
                                        <Globe size={13} />
                                        <span>https://coe.xarc.online</span>
                                      </div>
                                      <input
                                        type="text"
                                        className="admin-input"
                                        style={{
                                          border: 'none',
                                          borderRadius: 0,
                                          background: 'transparent',
                                          flex: 1,
                                          fontFamily: 'var(--font-mono)',
                                          fontSize: '0.8rem',
                                          padding: '8px 12px',
                                        }}
                                        placeholder="/request/status"
                                        value={activeTemplate.action_url || ''}
                                        onChange={(e) => updateActiveTemplate({ action_url: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Quick Route Shortcuts & URL resolution info */}
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                    padding: '10px 14px',
                                    background: 'rgba(0, 0, 0, 0.25)',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Route Shortcuts:</span>
                                    {[
                                      { label: 'Application Status', path: '/request/status' },
                                      { label: 'About & Roadmap', path: '/about' },
                                      { label: 'Lab Projects', path: '/projects' },
                                      { label: 'Events & Sprints', path: '/events' },
                                      { label: 'Contact & Lab', path: '/contact' },
                                      { label: 'Portal Root', path: '/' },
                                    ].map((rt) => {
                                      const isSelected = (activeTemplate.action_url || '') === rt.path;
                                      return (
                                        <button
                                          key={rt.path}
                                          type="button"
                                          onClick={() => updateActiveTemplate({ action_url: rt.path })}
                                          style={{
                                            background: isSelected ? 'rgba(6, 182, 212, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                                            border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                                            color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                                            borderRadius: '4px',
                                            padding: '3px 8px',
                                            fontSize: '0.68rem',
                                            fontFamily: 'var(--font-mono)',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                          }}
                                        >
                                          {rt.path}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <span>Resolved Outbound Link:</span>
                                    <code
                                      style={{
                                        color: '#38bdf8',
                                        background: 'rgba(6, 182, 212, 0.1)',
                                        border: '1px solid rgba(6, 182, 212, 0.2)',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontFamily: 'var(--font-mono)',
                                        fontWeight: 600,
                                      }}
                                    >
                                      https://coe.xarc.online{activeTemplate.action_url ? (activeTemplate.action_url.startsWith('/') ? activeTemplate.action_url : `/${activeTemplate.action_url}`) : '/'}
                                    </code>
                                    <span style={{ color: '#94a3b8', fontSize: '0.68rem' }}>
                                      • Prevents localhost & dev port mismatches when hosted in production.
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* SECTION 3: EMAIL TRANSMISSION OUTBOX / DELIVERY AUDIT LOGS */}
                    <div className="admin-card">
                      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 className="admin-card-title">06.3 // TRANSMISSION OUTBOX & INBOX BOUNCE AUDIT</h3>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {emailLogs.length} transmissions tracked in MongoDB outbox
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={fetchEmailLogs}
                            disabled={loadingLogs}
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            <RefreshCw size={12} />
                            <span>{loadingLogs ? 'Refreshing...' : 'Refresh'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleClearLogs}
                            disabled={emailLogs.length === 0}
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            <Trash2 size={12} />
                            <span>Clear Outbox</span>
                          </button>
                        </div>
                      </div>

                      <div style={{ padding: '0', maxHeight: '320px', overflowY: 'auto' }}>
                        {emailLogs.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            No email transmissions logged yet. Dispatched status emails and broadcasts will appear here.
                          </div>
                        ) : (
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                            <thead>
                              <tr style={{ background: 'var(--surface-input)', borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '10px 14px' }}>Status</th>
                                <th style={{ padding: '10px 14px' }}>Recipient</th>
                                <th style={{ padding: '10px 14px' }}>Subject</th>
                                <th style={{ padding: '10px 14px' }}>Type</th>
                                <th style={{ padding: '10px 14px' }}>Timestamp</th>
                              </tr>
                            </thead>
                            <tbody>
                              {emailLogs.map((log) => (
                                <tr
                                  key={log.id}
                                  style={{
                                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                                    transition: 'background 0.15s ease',
                                  }}
                                >
                                  <td style={{ padding: '10px 14px' }}>
                                    <span
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                        background: log.status === 'SENT' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                        color: log.status === 'SENT' ? '#86efac' : '#fca5a5',
                                      }}
                                    >
                                      {log.status === 'SENT' ? 'DELIVERED' : 'BOUNCED'}
                                    </span>
                                  </td>
                                  <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>
                                    {log.recipient}
                                  </td>
                                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {log.subject}
                                  </td>
                                  <td style={{ padding: '10px 14px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                                    {log.trigger_type}
                                  </td>
                                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                    {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 7: PIPELINE & STUDENT INTAKE MANAGEMENT */}
                {activeTab === 'pipeline' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                    
                    {/* SECTION 1: PUBLIC REGISTRATION INTAKE CONTROL */}
                    <div className="admin-card">
                      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="admin-card-title">07.1 // PUBLIC REGISTRATION INTAKE CONTROL</h3>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            background: (settings.registration_open ?? true) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: (settings.registration_open ?? true) ? '#86efac' : '#fde047',
                            border: `1px solid ${(settings.registration_open ?? true) ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                          }}
                        >
                          {(settings.registration_open ?? true) ? 'INTAKE OPEN' : 'INTEREST FORMS ONLY'}
                        </span>
                      </div>

                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px',
                            background: 'var(--surface-input)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-glass)',
                            flexWrap: 'wrap',
                            gap: '12px',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginBottom: '4px' }}>
                              Accept Active Student Applications (/request)
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', maxWidth: '440px', lineHeight: 1.5 }}>
                              {(settings.registration_open ?? true)
                                ? 'Registration is currently active. Student submissions on the public portal flow directly into the review pipeline as NEW applications.'
                                : 'Direct applications are paused. Students submitting on /request are notified and logged under "Interest Forms". You can promote them anytime into active requests.'}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleRegistration(!(settings.registration_open ?? true))}
                            className={`admin-btn ${(settings.registration_open ?? true) ? 'admin-btn-secondary' : 'admin-btn-primary'}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 18px',
                              fontWeight: 700,
                              borderColor: (settings.registration_open ?? true) ? 'rgba(239, 68, 68, 0.4)' : '#10b981',
                            }}
                          >
                            {(settings.registration_open ?? true) ? (
                              <>
                                <ToggleRight size={18} color="#10b981" />
                                <span>Pause Registration (Enable Interest Forms)</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft size={18} color="#f59e0b" />
                                <span>Re-open Public Registration</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: APPLICATION STATUS TAXONOMY & CUSTOMIZATION */}
                    <div className="admin-card">
                      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="admin-card-title">07.2 // APPLICATION LIFECYCLE & STATUS TAXONOMY</h3>
                        <button
                          type="button"
                          onClick={handleResetDefaultStatuses}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          style={{ fontSize: '0.72rem', padding: '3px 10px' }}
                        >
                          Reset Defaults
                        </button>
                      </div>

                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          Customize the statuses available across your Student Requests portal, review modal, and batch actions. Color tokens and labels render dynamically in all administrator dashboards.
                        </div>

                        {/* Status List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {(settings.custom_statuses || FALLBACK_STATUSES).map((st, idx) => (
                            <div
                              key={st.key}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'var(--surface-input)',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-glass)',
                                flexWrap: 'wrap',
                                gap: '10px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px', flex: 1 }}>
                                <input
                                  type="color"
                                  value={st.color}
                                  onChange={(e) => {
                                    const list = [...(settings.custom_statuses || FALLBACK_STATUSES)];
                                    list[idx] = { ...list[idx], color: e.target.value };
                                    setSettings({ ...settings, custom_statuses: list });
                                  }}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    cursor: 'pointer',
                                    background: 'transparent',
                                    padding: '2px',
                                  }}
                                  title="Change status color"
                                />

                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                      type="text"
                                      value={st.label}
                                      onChange={(e) => {
                                        const list = [...(settings.custom_statuses || FALLBACK_STATUSES)];
                                        list[idx] = { ...list[idx], label: e.target.value };
                                        setSettings({ ...settings, custom_statuses: list });
                                      }}
                                      className="admin-input"
                                      style={{ fontWeight: 600, fontSize: '0.85rem', padding: '4px 8px', maxWidth: '200px' }}
                                    />
                                    <span
                                      style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.7rem',
                                        color: 'var(--accent-cyan)',
                                        background: 'rgba(6, 182, 212, 0.1)',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                      }}
                                    >
                                      {st.key}
                                    </span>
                                    {st.is_system && (
                                      <span
                                        style={{
                                          fontSize: '0.65rem',
                                          fontFamily: 'var(--font-mono)',
                                          color: 'var(--text-muted)',
                                          background: 'rgba(255,255,255,0.06)',
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                        }}
                                      >
                                        CORE SYSTEM
                                      </span>
                                    )}
                                  </div>

                                  <div style={{ marginTop: '4px' }}>
                                    <input
                                      type="text"
                                      placeholder="Status description or next steps"
                                      value={st.description || ''}
                                      onChange={(e) => {
                                        const list = [...(settings.custom_statuses || FALLBACK_STATUSES)];
                                        list[idx] = { ...list[idx], description: e.target.value };
                                        setSettings({ ...settings, custom_statuses: list });
                                      }}
                                      className="admin-input"
                                      style={{ fontSize: '0.74rem', padding: '2px 8px', width: '100%', color: 'var(--text-muted)' }}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    background: `${st.color}20`,
                                    color: st.color,
                                    border: `1px solid ${st.color}60`,
                                  }}
                                >
                                  {st.label}
                                </span>

                                {!st.is_system && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCustomStatus(st.key)}
                                    className="admin-btn admin-btn-danger admin-btn-sm"
                                    style={{ padding: '4px 8px' }}
                                    title="Delete custom status"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add New Custom Status Form */}
                        <div
                          style={{
                            background: 'rgba(6, 182, 212, 0.04)',
                            border: '1px dashed var(--border-glass)',
                            borderRadius: '8px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                            <Plus size={14} />
                            <span>ADD CUSTOM STATUS TO PIPELINE</span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                            <div>
                              <label className="admin-field-label">Status Key (e.g. UNDER_REVIEW)</label>
                              <input
                                type="text"
                                className="admin-input"
                                placeholder="SHORTLISTED"
                                value={newStatusKey}
                                onChange={(e) => setNewStatusKey(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                              />
                            </div>
                            <div>
                              <label className="admin-field-label">Display Label</label>
                              <input
                                type="text"
                                className="admin-input"
                                placeholder="Shortlisted for Squad"
                                value={newStatusLabel}
                                onChange={(e) => setNewStatusLabel(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="admin-field-label">Badge Accent Color</label>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                  type="color"
                                  value={newStatusColor}
                                  onChange={(e) => setNewStatusColor(e.target.value)}
                                  style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                />
                                <input
                                  type="text"
                                  className="admin-input"
                                  value={newStatusColor}
                                  onChange={(e) => setNewStatusColor(e.target.value)}
                                  style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="admin-field-label">Description / Internal Guidance (Optional)</label>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="Faculty review and hardware proficiency screening"
                              value={newStatusDesc}
                              onChange={(e) => setNewStatusDesc(e.target.value)}
                            />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                              type="button"
                              onClick={handleAddCustomStatus}
                              className="admin-btn admin-btn-primary admin-btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
                            >
                              <Plus size={14} />
                              <span>Append Status to Pipeline</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: CANDIDATE VERIFICATION & AUDIT CHECKLIST */}
                    <div className="admin-card">
                      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ListChecks size={16} style={{ color: 'var(--accent-cyan)' }} />
                          <h3 className="admin-card-title">07.3 // CANDIDATE VERIFICATION & AUDIT CHECKLIST</h3>
                        </div>
                        <button
                          type="button"
                          onClick={handleResetChecklist}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          style={{ fontSize: '0.72rem', padding: '3px 10px' }}
                        >
                          Reset Defaults
                        </button>
                      </div>

                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          Configure custom verification checklist criteria evaluated during candidate dossier review. Fields created here reflect immediately in the Student Review Modal and track per-applicant verification compliance.
                        </div>

                        {/* Checklist Items List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {(settings.review_checklist || FALLBACK_CHECKLIST).map((item) => (
                            <div
                              key={item.id}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                background: 'var(--surface-input)',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-glass)',
                                flexWrap: 'wrap',
                                gap: '12px',
                              }}
                            >
                              <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <input
                                    type="text"
                                    value={item.label}
                                    onChange={(e) => handleUpdateChecklistItem(item.id, { label: e.target.value })}
                                    className="admin-input"
                                    style={{ fontWeight: 600, fontSize: '0.85rem', padding: '4px 8px', flex: 1 }}
                                  />
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: '0.65rem',
                                      color: 'var(--accent-cyan)',
                                      background: 'rgba(6, 182, 212, 0.1)',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    {item.id}
                                  </span>
                                </div>
                                <div>
                                  <input
                                    type="text"
                                    placeholder="Audit instructions or verification guidance"
                                    value={item.description || ''}
                                    onChange={(e) => handleUpdateChecklistItem(item.id, { description: e.target.value })}
                                    className="admin-input"
                                    style={{ fontSize: '0.74rem', padding: '3px 8px', width: '100%', color: 'var(--text-muted)' }}
                                  />
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleToggleChecklistRequired(item.id)}
                                  style={{
                                    background: item.required ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                    border: `1px solid ${item.required ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.15)'}`,
                                    color: item.required ? '#fca5a5' : 'var(--text-muted)',
                                    borderRadius: '6px',
                                    padding: '4px 10px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                  }}
                                  title="Click to toggle mandatory requirement"
                                >
                                  {item.required ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                                  <span>{item.required ? 'MANDATORY' : 'OPTIONAL'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteChecklistItem(item.id)}
                                  className="admin-btn admin-btn-danger admin-btn-sm"
                                  style={{ padding: '4px 8px' }}
                                  title="Delete checklist item"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add New Checklist Item Form */}
                        <div
                          style={{
                            background: 'rgba(6, 182, 212, 0.04)',
                            border: '1px dashed var(--border-glass)',
                            borderRadius: '8px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                            <Plus size={14} />
                            <span>ADD CUSTOM VERIFICATION CHECKLIST FIELD</span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                            <div>
                              <label className="admin-field-label">Checklist Item Title / Audit Criterion</label>
                              <input
                                type="text"
                                className="admin-input"
                                placeholder="e.g. XR Headset Optics & Hygiene Compliance"
                                value={newChecklistLabel}
                                onChange={(e) => setNewChecklistLabel(e.target.value)}
                              />
                            </div>

                            <div>
                              <label className="admin-field-label">Requirement Level</label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => setNewChecklistRequired(true)}
                                  style={{
                                    flex: 1,
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    background: newChecklistRequired ? 'rgba(239, 68, 68, 0.2)' : 'var(--surface-input)',
                                    border: newChecklistRequired ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border-glass)',
                                    color: newChecklistRequired ? '#fca5a5' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Mandatory
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setNewChecklistRequired(false)}
                                  style={{
                                    flex: 1,
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    background: !newChecklistRequired ? 'rgba(16, 185, 129, 0.2)' : 'var(--surface-input)',
                                    border: !newChecklistRequired ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border-glass)',
                                    color: !newChecklistRequired ? '#86efac' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Optional
                                </button>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="admin-field-label">Verification Instructions / Guidance for Reviewer</label>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="Guidance for faculty reviewing the student portfolio or credentials"
                              value={newChecklistDesc}
                              onChange={(e) => setNewChecklistDesc(e.target.value)}
                            />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                              type="button"
                              onClick={handleAddChecklistItem}
                              className="admin-btn admin-btn-primary admin-btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
                            >
                              <Plus size={14} />
                              <span>Add to Candidate Review Checklist</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: ELIGIBLE ACADEMIC DEPARTMENTS MANAGEMENT */}
                    <div className="admin-card">
                      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <GraduationCap size={16} style={{ color: 'var(--accent-cyan)' }} />
                          <h3 className="admin-card-title">07.4 // ELIGIBLE ACADEMIC DEPARTMENTS</h3>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontFamily: 'var(--font-mono)',
                              background: 'rgba(6, 182, 212, 0.1)',
                              color: 'var(--accent-cyan)',
                              padding: '2px 8px',
                              borderRadius: '10px',
                            }}
                          >
                            {(settings.departments?.length || FALLBACK_DEPARTMENTS.length)} Disciplines
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleResetDepartments}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          style={{ fontSize: '0.72rem', padding: '3px 10px' }}
                        >
                          Reset to 10 Canonical
                        </button>
                      </div>

                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          Configure eligible undergraduate and postgraduate academic disciplines available for student selection on the public registration portal (<code style={{ color: 'var(--accent-cyan)' }}>/request</code>) and administrative review filters. Changes saved here dynamically update both the public application dropdown and admin applicant tables.
                        </div>

                        {/* Departments List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(settings.departments && settings.departments.length > 0 ? settings.departments : FALLBACK_DEPARTMENTS).map((dept, idx, arr) => (
                            <div
                              key={`${dept}-${idx}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'var(--surface-input)',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-glass)',
                                gap: '10px',
                                flexWrap: 'wrap',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '260px' }}>
                                <span
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.7rem',
                                    color: 'var(--text-muted)',
                                    width: '24px',
                                  }}
                                >
                                  #{String(idx + 1).padStart(2, '0')}
                                </span>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveDepartment(idx, 'up')}
                                    disabled={idx === 0}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: idx === 0 ? 'rgba(255,255,255,0.1)' : 'var(--text-muted)',
                                      cursor: idx === 0 ? 'default' : 'pointer',
                                      padding: '1px',
                                    }}
                                    title="Move up"
                                  >
                                    <ArrowUp size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveDepartment(idx, 'down')}
                                    disabled={idx === arr.length - 1}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: idx === arr.length - 1 ? 'rgba(255,255,255,0.1)' : 'var(--text-muted)',
                                      cursor: idx === arr.length - 1 ? 'default' : 'pointer',
                                      padding: '1px',
                                    }}
                                    title="Move down"
                                  >
                                    <ArrowDown size={12} />
                                  </button>
                                </div>

                                <input
                                  type="text"
                                  value={dept}
                                  onChange={(e) => handleUpdateDepartment(idx, e.target.value)}
                                  className="admin-input"
                                  style={{ flex: 1, fontSize: '0.82rem', padding: '5px 10px', fontWeight: 600 }}
                                />
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                  style={{
                                    padding: '3px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    background: 'rgba(6, 182, 212, 0.1)',
                                    color: 'var(--accent-cyan)',
                                    border: '1px solid rgba(6, 182, 212, 0.25)',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  ACTIVE DISCIPLINE
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteDepartment(idx)}
                                  className="admin-btn admin-btn-danger admin-btn-sm"
                                  style={{ padding: '4px 8px' }}
                                  title="Delete academic department"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add New Department Form */}
                        <div
                          style={{
                            background: 'rgba(6, 182, 212, 0.04)',
                            border: '1px dashed var(--border-glass)',
                            borderRadius: '8px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                            <Plus size={14} />
                            <span>ADD ACADEMIC DEPARTMENT TO SYSTEM</span>
                          </div>

                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="e.g. Robotics and Automation Engineering"
                              value={newDepartmentName}
                              onChange={(e) => setNewDepartmentName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddDepartment();
                                }
                              }}
                              style={{ flex: 1, minWidth: '240px' }}
                            />
                            <button
                              type="button"
                              onClick={handleAddDepartment}
                              className="admin-btn admin-btn-primary admin-btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
                            >
                              <Plus size={14} />
                              <span>Append Department</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 5: CANDIDATE INTEREST & SPECIALIZATION FIELDS */}
                    <div className="admin-card">
                      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Tags size={16} style={{ color: '#c084fc' }} />
                          <h3 className="admin-card-title">07.5 // CANDIDATE INTEREST & SPECIALIZATION FIELDS</h3>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontFamily: 'var(--font-mono)',
                              background: 'rgba(192, 132, 252, 0.1)',
                              color: '#c084fc',
                              padding: '2px 8px',
                              borderRadius: '10px',
                            }}
                          >
                            {(settings.interest_options?.length || FALLBACK_INTEREST_OPTIONS.length)} Specializations
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleResetInterests}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          style={{ fontSize: '0.72rem', padding: '3px 10px' }}
                        >
                          Reset Default XR Interests
                        </button>
                      </div>

                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          Configure the technical domain options, interest tags, and XR focus areas available on the public application form (<code style={{ color: 'var(--accent-cyan)' }}>/request</code>) and filterable across the student applicant roster.
                        </div>

                        {/* Interests List */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
                          {(settings.interest_options && settings.interest_options.length > 0 ? settings.interest_options : FALLBACK_INTEREST_OPTIONS).map((tag, idx, arr) => (
                            <div
                              key={`${tag}-${idx}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'var(--surface-input)',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-glass)',
                                gap: '8px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                                <span
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.68rem',
                                    color: 'var(--text-muted)',
                                    width: '20px',
                                  }}
                                >
                                  #{String(idx + 1).padStart(2, '0')}
                                </span>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveInterest(idx, 'up')}
                                    disabled={idx === 0}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: idx === 0 ? 'rgba(255,255,255,0.1)' : 'var(--text-muted)',
                                      cursor: idx === 0 ? 'default' : 'pointer',
                                      padding: '0',
                                    }}
                                    title="Move up"
                                  >
                                    <ArrowUp size={11} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveInterest(idx, 'down')}
                                    disabled={idx === arr.length - 1}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: idx === arr.length - 1 ? 'rgba(255,255,255,0.1)' : 'var(--text-muted)',
                                      cursor: idx === arr.length - 1 ? 'default' : 'pointer',
                                      padding: '0',
                                    }}
                                    title="Move down"
                                  >
                                    <ArrowDown size={11} />
                                  </button>
                                </div>

                                <input
                                  type="text"
                                  value={tag}
                                  onChange={(e) => handleUpdateInterest(idx, e.target.value)}
                                  className="admin-input"
                                  style={{ flex: 1, fontSize: '0.78rem', padding: '4px 8px', fontWeight: 600 }}
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteInterest(idx)}
                                className="admin-btn admin-btn-danger admin-btn-sm"
                                style={{ padding: '3px 6px' }}
                                title="Delete interest domain"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add New Interest Form */}
                        <div
                          style={{
                            background: 'rgba(192, 132, 252, 0.04)',
                            border: '1px dashed rgba(192, 132, 252, 0.25)',
                            borderRadius: '8px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#c084fc' }}>
                            <Plus size={14} />
                            <span>ADD CANDIDATE INTEREST DOMAIN / SPECIALIZATION TAG</span>
                          </div>

                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="e.g. Spatial Audio, Neural Radiance Fields (NeRF), Haptic Interfaces"
                              value={newInterestName}
                              onChange={(e) => setNewInterestName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddInterest();
                                }
                              }}
                              style={{ flex: 1, minWidth: '240px' }}
                            />
                            <button
                              type="button"
                              onClick={handleAddInterest}
                              className="admin-btn admin-btn-primary admin-btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
                            >
                              <Plus size={14} />
                              <span>Append Interest Domain</span>
                            </button>
                          </div>
                        </div>
                      </div>
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
                    Branding & footer updates reflect across entire site.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSaveSettings()}
                    disabled={saving}
                    className="admin-btn admin-btn-primary"
                    style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Save size={16} />
                    <span>{saving ? 'Saving...' : 'Save Settings & Credentials'}</span>
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: LIVE BRANDING & FOOTER SIMULATOR */}
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
                  gap: '18px',
                  maxHeight: 'calc(100vh - 120px)',
                  overflowY: 'auto',
                }}
              >
                {activeTab === 'email' ? (
                  /* LIVE EMAIL TEMPLATE SIMULATOR */
                  (() => {
                    const currTpl = getActiveTemplate(activeTemplateKey);
                    const currStatus = (settings?.custom_statuses || FALLBACK_STATUSES).find(
                      (s) => s.key === (activeTemplateKey || 'NEW').toUpperCase()
                    ) || { key: activeTemplateKey, label: activeTemplateKey, color: '#06b6d4' };
                    const statusColor = currStatus.color || '#06b6d4';

                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Eye size={16} style={{ color: statusColor }} />
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                              LIVE {currStatus.label.toUpperCase()} EMAIL SIMULATOR
                            </span>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            Client Rendering
                          </span>
                        </div>

                        {currTpl.enabled === false && (
                          <div
                            style={{
                              background: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '0.74rem',
                              color: '#fca5a5',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <AlertCircle size={14} color="#ef4444" />
                            <span>Automated dispatch is MUTED for this status.</span>
                          </div>
                        )}

                        {/* Simulated Email Client Container */}
                        <div
                          style={{
                            background: '#090d16',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            overflow: 'hidden',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                          }}
                        >
                          {/* Email Header */}
                          <div
                            style={{
                              background: '#111827',
                              padding: '12px 16px',
                              borderBottom: '1px solid rgba(255,255,255,0.06)',
                              fontSize: '0.75rem',
                            }}
                          >
                            <div style={{ color: '#9ca3af', marginBottom: '4px' }}>
                              <strong style={{ color: '#f3f4f6' }}>Subject: </strong>
                              {currTpl.subject
                                ?.replace(/{{student_name}}/g, 'Alex Carter')
                                ?.replace(/{{register_number}}/g, 'REG-2026-XR01')
                                ?.replace(/{{coe_name}}/g, settings?.coe_name || 'AR/VR Centre of Excellence') || 'Notification'}
                            </div>
                            <div style={{ color: '#6b7280', display: 'flex', justifyContent: 'space-between' }}>
                              <span>From: <strong>{settings?.coe_name || 'AR/VR Centre of Excellence'}</strong></span>
                              <span>To: <strong>alex.carter@student.edu</strong></span>
                            </div>
                          </div>

                          {/* Email Body Card */}
                          <div style={{ padding: '24px 20px', background: '#090d16' }}>
                            {/* Glowing Pill Badge */}
                            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                              <div
                                style={{
                                  display: 'inline-block',
                                  padding: '5px 14px',
                                  borderRadius: '20px',
                                  background: `${statusColor}20`,
                                  border: `1px solid ${statusColor}50`,
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  color: statusColor,
                                  letterSpacing: '0.05em',
                                  marginBottom: '8px',
                                }}
                              >
                                {currTpl.badge_text || currStatus.label?.toUpperCase() || 'STATUS UPDATE'}
                              </div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.3 }}>
                                {currTpl.headline || 'Application Status Update'}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>
                                {currTpl.body_text || 'AR/VR Centre of Excellence Admissions'}
                              </div>
                            </div>

                            {/* Recipient Details Card */}
                            <div
                              style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '8px',
                                padding: '12px 14px',
                                marginBottom: '16px',
                                fontSize: '0.75rem',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ color: '#64748b' }}>Candidate:</span>
                                <strong style={{ color: '#f1f5f9' }}>Alex Carter</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b' }}>Register Number:</span>
                                <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>REG-2026-XR01</span>
                              </div>
                            </div>

                            {/* Next Steps List */}
                            {currTpl.next_steps && (currTpl.next_steps.length || 0) > 0 && (
                              <div
                                style={{
                                  background: 'rgba(255,255,255,0.02)',
                                  border: '1px solid rgba(255,255,255,0.06)',
                                  borderRadius: '8px',
                                  padding: '14px',
                                  marginBottom: '16px',
                                }}
                              >
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                                  Next Steps & Protocol
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {currTpl.next_steps.map((step: string, idx: number) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem' }}>
                                      <span
                                        style={{
                                          width: '18px',
                                          height: '18px',
                                          borderRadius: '50%',
                                          background: `${statusColor}25`,
                                          color: statusColor,
                                          fontSize: '0.68rem',
                                          fontWeight: 800,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          flexShrink: 0,
                                          marginTop: '1px',
                                        }}
                                      >
                                        {idx + 1}
                                      </span>
                                      <span style={{ color: '#cbd5e1', lineHeight: 1.4 }}>
                                        {step.replace(/{{student_name}}/g, 'Alex Carter').replace(/{{register_number}}/g, 'REG-2026-XR01')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Action CTA Button */}
                            {currTpl.action_label && (
                              <div style={{ textAlign: 'center', marginTop: '12px', marginBottom: '16px' }}>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '9px 24px',
                                    borderRadius: '6px',
                                    background: statusColor,
                                    color: '#000',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    boxShadow: `0 4px 16px ${statusColor}35`,
                                  }}
                                >
                                  {currTpl.action_label}
                                </span>
                                <div
                                  style={{
                                    marginTop: '8px',
                                    fontSize: '0.68rem',
                                    color: '#94a3b8',
                                    fontFamily: 'var(--font-mono)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '5px',
                                  }}
                                >
                                  <ExternalLink size={11} color="var(--accent-cyan)" />
                                  <span>Target: </span>
                                  <span style={{ color: 'var(--accent-cyan)' }}>
                                    https://coe.xarc.online{currTpl.action_url ? (currTpl.action_url.startsWith('/') ? currTpl.action_url : `/${currTpl.action_url}`) : '/'}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Signoff */}
                            <div
                              style={{
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                                paddingTop: '12px',
                                textAlign: 'center',
                                fontSize: '0.7rem',
                                color: '#64748b',
                              }}
                            >
                              <div>{settings?.coe_name || 'AR/VR Centre of Excellence'} • {settings?.institution_name || 'Institution'}</div>
                              <div style={{ marginTop: '2px', fontSize: '0.65rem', color: '#475569' }}>
                                Sent securely via NodeMailer SMTP Transceiver
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()
                ) : activeTab === 'pipeline' ? (
                  /* LIVE INTAKE & STATUS SIMULATOR */
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                      <Eye size={16} style={{ color: 'var(--accent-cyan)' }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE INTAKE & PIPELINE SIMULATOR</span>
                    </div>

                    {/* PUBLIC REQUEST PORTAL MOCKUP */}
                    <div style={{ background: '#090d16', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        MOCKUP: STUDENT EXPERIENCE (/request)
                      </div>

                      <div
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          background: (settings.registration_open ?? true) ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                          border: `1px solid ${(settings.registration_open ?? true) ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                          fontSize: '0.78rem',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: (settings.registration_open ?? true) ? '#86efac' : '#fde047', marginBottom: '4px' }}>
                          {(settings.registration_open ?? true)
                            ? '● PUBLIC REGISTRATION OPEN // SQUAD ALLOCATION CYCLE'
                            : '⚡ DIRECT INTAKE PAUSED // EXPRESSION OF INTEREST'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                          {(settings.registration_open ?? true)
                            ? 'Students submit directly into the active review queue.'
                            : 'Students are notified that regular intake is paused. Submissions route to the Interest Forms tab.'}
                        </div>
                      </div>

                      {/* Configured Status Badges Preview */}
                      <div style={{ marginTop: '6px' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
                          CONFIGURED PIPELINE STATUSES ({(settings.custom_statuses || FALLBACK_STATUSES).length})
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {(settings.custom_statuses || FALLBACK_STATUSES).map((st) => (
                            <span
                              key={st.key}
                              style={{
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                background: `${st.color}20`,
                                color: st.color,
                                border: `1px solid ${st.color}60`,
                              }}
                            >
                              {st.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Verification Checklist Criteria Preview */}
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
                          ACTIVE VERIFICATION CRITERIA ({(settings.review_checklist || FALLBACK_CHECKLIST).length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {(settings.review_checklist || FALLBACK_CHECKLIST).map((chk) => (
                            <div
                              key={chk.id}
                              style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '6px',
                                padding: '8px 10px',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                                <CheckSquare size={13} style={{ color: chk.required ? '#ef4444' : 'var(--accent-cyan)', flexShrink: 0 }} />
                                <span style={{ color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chk.label}</span>
                              </div>
                              <span
                                style={{
                                  fontSize: '0.62rem',
                                  fontFamily: 'var(--font-mono)',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  background: chk.required ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.06)',
                                  color: chk.required ? '#fca5a5' : 'var(--text-muted)',
                                  flexShrink: 0,
                                }}
                              >
                                {chk.required ? 'REQUIRED' : 'OPTIONAL'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* EXISTING BRANDING & FOOTER SIMULATOR */
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                      <Eye size={16} style={{ color: 'var(--accent-primary)' }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE BRANDING & FOOTER SIMULATOR</span>
                    </div>

                    {/* SIMULATED BROWSER TAB */}
                    <div
                      style={{
                        background: '#1e293b',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                        BROWSER TAB MOCKUP
                      </span>
                      <div
                        style={{
                          background: '#0f172a',
                          borderRadius: '6px 6px 0 0',
                          padding: '8px 12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          maxWidth: '100%',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderBottom: 'none',
                        }}
                      >
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#0284c7', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.75rem', color: '#f1f5f9', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {settings.site_title || 'AR/VR Centre of Excellence'}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', cursor: 'pointer' }}>×</span>
                      </div>
                    </div>

                    {/* SEARCH ENGINE SNIPPET MOCKUP */}
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '8px',
                        padding: '14px',
                        color: '#1a0dab',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                        SEARCH ENGINE SNIPPET PREVIEW
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#202124', marginBottom: '2px' }}>
                        https://coe.arvr.edu/
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1a0dab', textDecoration: 'underline', lineHeight: 1.2, marginBottom: '4px' }}>
                        {settings.site_title || 'AR/VR Centre of Excellence'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#4d5156', lineHeight: 1.4 }}>
                        {settings.meta_description || 'Global spatial computing and immersive technologies laboratory...'}
                      </div>
                    </div>

                    {/* PUBLIC BRAND HEADER PREVIEW */}
                    <div
                      style={{
                        background: 'radial-gradient(ellipse at top, rgba(2, 132, 199, 0.15) 0%, rgba(15, 23, 42, 0.6) 100%)',
                        borderRadius: '10px',
                        padding: '16px',
                        border: '1px solid var(--border-glass)',
                      }}
                    >
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                        PUBLIC BRAND IDENTITY
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #0284c7, #7c3aed)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            color: '#fff',
                            fontSize: '0.8rem',
                          }}
                        >
                          XR
                        </div>
                        <div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {settings.coe_name || 'AR/VR Centre of Excellence'}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                            {settings.institution_name || 'Institution / University'}
                          </div>
                        </div>
                      </div>
                      {settings.tagline && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '8px' }}>
                          &ldquo;{settings.tagline}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* PUBLIC MINIMALIST FOOTER SIMULATOR */}
                    <div
                      style={{
                        background: 'var(--surface-ground)',
                        borderRadius: '10px',
                        padding: '16px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.08em', display: 'block', marginBottom: '10px' }}>
                        LIVE MINIMALIST FOOTER PREVIEW
                      </span>
                      
                      <div
                        style={{
                          background: 'var(--surface-card-alt)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', fontSize: '0.78rem' }}>
                          <div style={{ color: 'var(--text-secondary)' }}>
                            © {new Date().getFullYear()} <strong style={{ color: 'var(--text-primary)' }}>{settings.coe_name}</strong>, {settings.institution_name}. {settings.footer_copyright || 'All Rights Reserved.'}
                          </div>
                          {settings.footer_tagline && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-muted)',
                                background: 'var(--surface-card)',
                                border: '1px solid var(--border-subtle)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                              }}
                            >
                              {settings.footer_tagline}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                          <span style={{ color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                            <Mail size={13} /> {settings.contact_email}
                          </span>
                          <span style={{ color: 'var(--border-active)' }}>•</span>
                          <span style={{ color: '#4ade80', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                            <Phone size={13} /> {settings.contact_phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

              </div>

            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
