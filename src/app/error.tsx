'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: '#070b14',
        color: '#f8fafc',
        fontFamily: 'var(--font-body, system-ui, sans-serif)',
      }}
    >
      <div
        style={{
          maxWidth: '540px',
          width: '100%',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '12px',
          padding: '36px 30px',
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(239, 68, 68, 0.15)',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '14px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            color: '#ef4444',
          }}
        >
          <AlertTriangle size={32} />
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            color: '#ef4444',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}
        >
          SYS_CRITICAL // RUNTIME_INTERRUPTION
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '12px' }}>
          Subsystem Failure Detected
        </h2>

        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '28px' }}>
          An unhandled computational exception occurred while rendering this interface. Telemetry has been logged for institutional engineering review.
        </p>

        {error.digest && (
          <div
            style={{
              padding: '8px 12px',
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.75rem',
              color: '#64748b',
              marginBottom: '24px',
            }}
          >
            FAULT DIGEST: {error.digest}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => reset()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#00f5ff',
              color: '#070b14',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={16} />
            <span>Reboot Component</span>
          </button>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            <Home size={16} />
            <span>Return to Cockpit</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
