import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { Compass, Home, ArrowLeft, FolderGit2, Layers, UserPlus } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="public-layout-root" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        <div
          className="glass-card hud-corner"
          style={{
            maxWidth: '620px',
            width: '100%',
            padding: '48px 36px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-glow)',
            position: 'relative',
          }}
        >
          <div className="tech-coord">SYS_ERR: 404 // VECTOR_TARGET_UNRESOLVED</div>

          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '18px',
              background: 'rgba(0, 245, 255, 0.1)',
              border: '1px solid var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto',
              color: 'var(--accent-cyan)',
              boxShadow: '0 0 28px rgba(0, 245, 255, 0.35)',
            }}
          >
            <Compass size={36} className="animate-spin-slow" />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span className="beacon-dot" />
            <span className="badge badge-cyan" style={{ fontSize: '0.8rem', letterSpacing: '0.12em' }}>
              SPATIAL ANOMALY DETECTED
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '14px',
              lineHeight: 1.1,
            }}
          >
            404 <span className="text-gradient">Sector Not Found</span>
          </h1>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1.05rem',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '480px',
              margin: '0 auto 32px auto',
            }}
          >
            The requested holographic waypoint or dossier does not exist within the current AR/VR Centre of Excellence coordinate system.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <Link href="/" className="btn-primary" style={{ justifyContent: 'center', padding: '10px 16px' }}>
              <Home size={16} />
              <span>Cockpit</span>
            </Link>
            <Link href="/projects" className="btn-secondary" style={{ justifyContent: 'center', padding: '10px 16px' }}>
              <FolderGit2 size={16} />
              <span>Projects</span>
            </Link>
            <Link href="/verticals" className="btn-secondary" style={{ justifyContent: 'center', padding: '10px 16px' }}>
              <Layers size={16} />
              <span>Verticals</span>
            </Link>
            <Link href="/request" className="btn-secondary" style={{ justifyContent: 'center', padding: '10px 16px' }}>
              <UserPlus size={16} />
              <span>Join Lab</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
