import React from 'react';
import { notFound } from 'next/navigation';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import ProjectCard from '@/components/public/ProjectCard';
import { getPublicProjectBySlug, getPublicProjects } from '@/lib/db';
import { ArrowLeft, CheckCircle2, Users, UserCheck, Layers, Cpu, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import ProjectMediaInspector from '@/components/public/ProjectMediaInspector';

export const revalidate = 0;

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const result = getPublicProjectBySlug(slug);
  if (!result) return { title: 'Project Not Found | AR/VR CoE' };

  return {
    title: `${result.project.title} | AR/VR CoE`,
    description: result.project.short_desc,
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const result = getPublicProjectBySlug(slug);

  if (!result) {
    notFound();
  }

  const { project, related } = result;

  return (
    <div className="public-layout-root" style={{ position: 'relative', overflowX: 'hidden' }}>
      <Navbar />

      {/* 1. Project Hero (Fixed Template) */}
      <section className="hero-wrapper" style={{ minHeight: '60vh', paddingBottom: '32px' }}>
        <div className="container">
          <div style={{ marginBottom: '24px' }}>
            <Link
              href="/projects"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--accent-cyan)',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <ArrowLeft size={16} />
              <span>BACK TO PROJECTS</span>
            </Link>
          </div>

          <div style={{ maxWidth: '880px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span className="badge badge-cyan">{project.category}</span>
              {project.is_featured && <span className="badge badge-amber">FEATURED PROJECT</span>}
            </div>

            <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', lineHeight: '1.15', marginBottom: '20px' }}>
              {project.title}
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '28px' }}>
              {project.short_desc}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {project.technologies.map((t, idx) => (
                <span key={idx} className="badge badge-blue">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="section-spacing" style={{ paddingTop: '0' }}>
        <div className="container">
          {/* Main Interactive 3D / 2D Media Inspector */}
          <ProjectMediaInspector
            coverImage={project.cover_image}
            title={project.title}
            category={project.category}
          />

          {/* 2. Overview */}
          <div className="glass-card" style={{ padding: '36px', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--accent-cyan)' }}>
              Project Overview
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7' }}>
              {project.full_desc}
            </p>
          </div>

          {/* 3. Problem & 4. Solution (Two Column Grid) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '28px',
              marginBottom: '40px',
            }}
          >
            <div className="glass-card" style={{ padding: '32px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#f87171', marginBottom: '10px' }}>
                // THE CHALLENGE
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '14px' }}>Problem Statement</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {project.problem}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '32px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)', marginBottom: '10px' }}>
                // OUR APPROACH
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '14px' }}>Engineered Solution</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {project.solution}
              </p>
            </div>
          </div>

          {/* 5. Technology Stack */}
          <div className="glass-card" style={{ padding: '32px', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '16px' }}>Technologies & Toolchains</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {project.technologies.map((tech, i) => (
                <div
                  key={i}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(76, 125, 255, 0.1)',
                    border: '1px solid rgba(76, 125, 255, 0.3)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                  }}
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>

          {/* 6. Gallery / Video */}
          {project.gallery && project.gallery.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '20px' }}>Project Gallery</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {project.gallery.map((imgUrl, i) => (
                  <div
                    key={i}
                    style={{
                      height: '240px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: '1px solid rgba(76, 125, 255, 0.2)',
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`Gallery item ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Team & Mentor */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '40px',
            }}
          >
            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Users size={18} style={{ color: 'var(--accent-blue)' }} />
                <h4 style={{ fontSize: '1.15rem' }}>Student Development Team</h4>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {project.team.map((member, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
                    <span>{member}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <UserCheck size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h4 style={{ fontSize: '1.15rem' }}>Faculty & Industry Mentor</h4>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>
                {project.mentor}
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                AR/VR Centre of Excellence Advisory
              </div>
            </div>
          </div>

          {/* 8. Result / Outcome */}
          <div
            className="glass-card hud-corner"
            style={{
              padding: '32px',
              marginBottom: '56px',
              border: '1px solid rgba(43, 217, 254, 0.35)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)', marginBottom: '8px' }}>
              // MEASURABLE IMPACT
            </div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '12px' }}>Demonstrated Outcome & Results</h3>
            <p style={{ color: 'var(--text-primary)', fontSize: '1.025rem', lineHeight: '1.6' }}>
              {project.result_outcome}
            </p>
          </div>

          {/* 9. Related Projects */}
          {related.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Related Projects</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {related.map((rel) => (
                  <ProjectCard key={rel.id} project={rel} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
