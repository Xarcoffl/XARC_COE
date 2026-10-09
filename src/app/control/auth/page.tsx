'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import VrDeviceLoader from '@/components/VrDeviceLoader';

export default function AdminAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Authentication failed. Please verify your administrative credentials.');
        setLoading(false);
        return;
      }

      router.push('/control/dashboard');
    } catch {
      setErrorMsg('An unexpected connection error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#070b14',
        padding: '20px',
        fontFamily: 'var(--font-body)',
      }}
    >
      {loading && (
        <VrDeviceLoader
          mode="fullscreen"
          title="AUTHENTICATING SPATIAL CREDENTIALS..."
          subtext="Verifying administrative token and establishing secure control session..."
          badge="SECURITY CORE"
        />
      )}

      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#111827',
          border: '1px solid #1f2937',
          borderRadius: '10px',
          padding: '40px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Header (Spec #50) */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              background: '#1e3a8a',
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: '1px solid #2563eb',
            }}
          >
            <Shield size={24} />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#f9fafb', letterSpacing: '0.04em' }}>
            AR/VR COE
          </div>
          <div style={{ fontSize: '0.78rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>
            Administrative Access
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '6px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#fca5a5',
              fontSize: '0.85rem',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label className="admin-field-label">Institutional Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="admin-input"
                placeholder="admin@coe.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <Mail
                size={16}
                style={{ position: 'absolute', left: '12px', top: '12px', color: '#6b7280' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label className="admin-field-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="admin-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <Lock
                size={16}
                style={{ position: 'absolute', left: '12px', top: '12px', color: '#6b7280' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px',
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {loading ? (
              <>
                <VrDeviceLoader mode="mini" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.78rem', color: '#6b7280' }}>
          AR/VR Centre of Excellence • Administrator Portal
        </div>
      </div>
    </div>
  );
}
