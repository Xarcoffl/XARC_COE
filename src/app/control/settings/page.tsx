'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { SiteSettings } from '@/lib/types';
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
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [activeTab, setActiveTab] = useState<'branding' | 'contact' | 'social' | 'security'>('branding');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();

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
        }
      })
      .finally(() => setLoading(false));
  }, []);

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

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
              Loading system settings & profile...
            </div>
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
                    { id: 'branding', label: '01 Branding & SEO', icon: Globe },
                    { id: 'contact', label: '02 Contact & Campus', icon: Building },
                    { id: 'social', label: '03 Social Channels', icon: Share2 },
                    { id: 'security', label: '04 Profile & Security', icon: Key },
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

                {/* TAB 3: SOCIAL CHANNELS */}
                {activeTab === 'social' && (
                  <div className="admin-card" style={{ marginBottom: '20px' }}>
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">03 // SOCIAL & REPOSITORY CHANNELS</h3>
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

                {/* TAB 4: PROFILE & SECURITY */}
                {activeTab === 'security' && (
                  <div className="admin-card" style={{ marginBottom: '20px' }}>
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">04 // ADMINISTRATOR PROFILE & SECURITY</h3>
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
                          <label className="admin-field-label">Admin Email (Immutable)</label>
                          <input
                            type="email"
                            disabled
                            className="admin-input"
                            value={profile.email}
                            style={{ opacity: 0.6, cursor: 'not-allowed' }}
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
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderRadius: '10px',
                    padding: '16px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.08em', display: 'block', marginBottom: '10px' }}>
                    LIVE MINIMALIST FOOTER (PER USER SPEC)
                  </span>
                  
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#10b981' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                      <span>CoE Spatial Core Online & Operational</span>
                    </div>

                    <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                      &copy; {new Date().getFullYear()} {settings.coe_name || 'AR/VR Centre of Excellence'} &bull; {settings.institution_name || 'Institution'}. All Rights Reserved.
                    </p>
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
