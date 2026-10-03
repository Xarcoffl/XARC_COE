import React from 'react';
import Link from 'next/link';
import { Project } from '@/lib/types';
import { ArrowRight, Layers, Sparkles } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const getBadgeClass = (cat: string) => {
    switch (cat) {
      case 'VR': return 'badge-cyan';
      case 'AR': return 'badge-blue';
      case 'MR': return 'badge-violet';
      case 'XR': return 'badge-cyan';
      case '3D': return 'badge-green';
      default: return 'badge-blue';
    }
  };

  return (
    <div
      className="glass-card hud-corner"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '0',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* Cover Image Container */}
      <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden', background: 'var(--surface-card-alt)' }}>
        <img
          src={project.cover_image}
          alt={project.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="project-cover-img"
        />
        
        {/* Subtle Gradient Vignette */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '50%',
            background: 'linear-gradient(to top, rgba(7, 9, 26, 0.95), transparent)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Badges */}
        <div
          style={{
            position: 'absolute',
            top: '14px',
            left: '14px',
            zIndex: 2,
            display: 'flex',
            gap: '8px',
          }}
        >
          <span className={`badge ${getBadgeClass(project.category)}`}>
            <span className="beacon-dot" style={{ width: '5px', height: '5px' }} />
            {project.category}
          </span>
        </div>

        {project.is_featured && (
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              zIndex: 2,
            }}
          >
            <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={11} />
              FEATURED
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--accent-cyan)', letterSpacing: '0.06em' }}>
            [XR-SYSTEM // {project.category}]
          </span>
          <span className="tech-coord">[BUILD // VERIFIED]</span>
        </div>

        <h3
          style={{
            fontSize: '1.25rem',
            lineHeight: '1.3',
            marginBottom: '12px',
            color: 'var(--text-primary)',
            fontWeight: 700,
          }}
        >
          {project.title}
        </h3>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.88rem',
            lineHeight: '1.6',
            marginBottom: '20px',
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {project.short_desc}
        </p>

        {/* Tech Stack Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '22px' }}>
          {project.technologies.slice(0, 3).map((tech, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 3 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', alignSelf: 'center' }}>
              +{project.technologies.length - 3}
            </span>
          )}
        </div>

        {/* View Project Action */}
        <Link
          href={`/projects/${project.slug}`}
          className="btn-outline"
          style={{ width: '100%', justifyContent: 'space-between', padding: '10px 18px' }}
        >
          <span>Explore Prototype</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
