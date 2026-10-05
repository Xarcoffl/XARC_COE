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
  Eye,
  ExternalLink,
  Sun,
  Moon,
  Mail,
  Phone,
  PanelBottom,
  Building,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminFooterContentPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
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
        if (data?.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Footer contents saved successfully and updated live.', type: 'success' });
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ text: data.message || 'Failed to update footer content.', type: 'error' });
      }
    } catch {
      setMsg({ text: 'A network error occurred while saving footer settings.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      coe_name: 'AR/VR Centre of Excellence',
      institution_name: 'Centre of Excellence',
      footer_copyright: 'All Rights Reserved.',
      contact_email: 'arvr.coe@institute.edu',
      contact_phone: '+91 (0) 80 2345 6789',
      footer_tagline: 'Spatial Computing & Immersive Engineering Digital Ecosystem',
    });
  };

  const currentYear = new Date().getFullYear();
  const cleanPhone = (settings?.contact_phone || '').replace(/[^0-9+]/g, '');

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminHeader
          title="Footer Content & Copyright Studio"
          subtitle="Configure public footer branding, legal copyright statement, official contact channels, and auxiliary notes"
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
                onClick={handleResetDefaults}
                className="admin-btn admin-btn-secondary admin-btn-sm"
                title="Restore default footer copy"
              >
                <RotateCcw size={13} />
                <span>Reset Defaults</span>
              </button>
              <Link
                href="/"
                target="_blank"
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                <ExternalLink size={13} />
                <span>Test Live Footer on Home</span>
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
              Loading footer settings...
            </div>
          ) : settings ? (
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
                    {/* Section 1: Footer Brand Identity */}
                    <div className="admin-card">
                      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 className="admin-card-title">01 // BRANDING & ATTRIBUTION</h3>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                            Names rendered in the primary copyright declaration line.
                          </p>
                        </div>
                        <Building size={16} style={{ color: 'var(--accent-cyan)' }} />
                      </div>
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">Centre of Excellence Name in Footer</label>
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
                    </div>

                    {/* Section 2: Copyright Statement */}
                    <div className="admin-card">
                      <div className="admin-card-header">
                        <h3 className="admin-card-title">02 // COPYRIGHT & LEGAL STATEMENT</h3>
                      </div>
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <label className="admin-field-label" style={{ marginBottom: 0 }}>Copyright Notice Phrase</label>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Appended after institution name</span>
                          </div>
                          <input
                            type="text"
                            className="admin-input"
                            value={settings.footer_copyright || 'All Rights Reserved.'}
                            onChange={(e) => setSettings({ ...settings, footer_copyright: e.target.value })}
                            placeholder="e.g. All Rights Reserved."
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Presets:</span>
                          {['All Rights Reserved.', 'All Rights Reserved. | Confidential', 'Official Spatial Lab Portal'].map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setSettings({ ...settings, footer_copyright: p })}
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                              style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Official Contact Channels */}
                    <div className="admin-card">
                      <div className="admin-card-header">
                        <h3 className="admin-card-title">03 // DIRECT CONTACT CHANNELS</h3>
                      </div>
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">
                            Official Contact Email (<span style={{ fontFamily: 'monospace' }}>mailto:</span> link)
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
                            Official Contact Phone (<span style={{ fontFamily: 'monospace' }}>tel:</span> link)
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
                    </div>

                    {/* Section 4: Auxiliary Spatial Tagline */}
                    <div className="admin-card">
                      <div className="admin-card-header">
                        <h3 className="admin-card-title">04 // AUXILIARY LAB TAGLINE</h3>
                      </div>
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">Secondary Footer Note / Tagline (Optional)</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={settings.footer_tagline || ''}
                            onChange={(e) => setSettings({ ...settings, footer_tagline: e.target.value })}
                            placeholder="e.g. Spatial Computing & Immersive Engineering Digital Ecosystem"
                          />
                          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                            Displays as a subtle technical identifier badge beside the copyright information. Leave blank to hide.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="submit"
                        disabled={saving}
                        className="admin-btn admin-btn-primary"
                        style={{ padding: '10px 28px', fontSize: '0.95rem' }}
                      >
                        <Save size={16} />
                        <span>{saving ? 'Saving Changes...' : 'Save Footer Settings'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* RIGHT COLUMN: LIVE INTERACTIVE FOOTER SIMULATOR */}
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
                        <PanelBottom size={16} style={{ color: 'var(--accent-cyan)' }} />
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE FOOTER PREVIEW</span>
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

                    {/* SIMULATED PAGE CONTAINER */}
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
                      {/* Browser Mockup Header */}
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

                      {/* Mockup Page Body */}
                      <div style={{ padding: '30px 20px', textAlign: 'center', background: previewTheme === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }}>
                        <div style={{ fontSize: '0.85rem', color: previewTheme === 'dark' ? '#64748b' : '#94a3b8', fontStyle: 'italic' }}>
                          [ Main Spatial Computing Webpage Content Area ]
                        </div>
                      </div>

                      {/* LIVE FOOTER COMPONENT MOCKUP */}
                      <div
                        style={{
                          borderTop: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                          background: previewTheme === 'dark' ? '#0b1120' : '#f8fafc',
                          padding: '20px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '14px',
                          fontSize: '0.82rem',
                        }}
                      >
                        {/* Copyright Notice */}
                        <div style={{ color: previewTheme === 'dark' ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span>
                            © {currentYear} <strong style={{ color: previewTheme === 'dark' ? '#f8fafc' : '#0f172a' }}>{settings.coe_name}</strong>, {settings.institution_name}. {settings.footer_copyright || 'All Rights Reserved.'}
                          </span>
                          {settings.footer_tagline && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                color: previewTheme === 'dark' ? '#38bdf8' : '#0284c7',
                                background: previewTheme === 'dark' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(2, 132, 199, 0.08)',
                                border: previewTheme === 'dark' ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid rgba(2, 132, 199, 0.2)',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                              }}
                            >
                              {settings.footer_tagline}
                            </span>
                          )}
                        </div>

                        {/* Contact Info (Mail & Phone) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: '#0284c7',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              fontFamily: 'monospace',
                            }}
                          >
                            <Mail size={14} style={{ color: '#0284c7' }} />
                            <span>{settings.contact_email}</span>
                          </span>

                          <span style={{ color: previewTheme === 'dark' ? '#334155' : '#cbd5e1' }}>•</span>

                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: previewTheme === 'dark' ? '#f8fafc' : '#0f172a',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              fontFamily: 'monospace',
                            }}
                          >
                            <Phone size={14} style={{ color: '#22c55e' }} />
                            <span>{settings.contact_phone}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Notice Box */}
                    <div
                      style={{
                        padding: '12px 14px',
                        background: 'rgba(2, 132, 199, 0.08)',
                        border: '1px solid rgba(2, 132, 199, 0.2)',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4,
                      }}
                    >
                      <strong style={{ color: 'var(--accent-cyan)' }}>Institutional Note:</strong> The public footer is deliberately kept minimalist per design specs: displaying copyright credentials, official mail address, and contact number.
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
