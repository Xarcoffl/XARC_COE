'use client';

import React, { useState, useMemo } from 'react';
import { Project, ProjectCategory } from '@/lib/types';
import ProjectCard from './ProjectCard';
import { Search, X, Filter } from 'lucide-react';

interface ProjectsFilterViewProps {
  initialProjects: Project[];
}

export default function ProjectsFilterView({ initialProjects }: ProjectsFilterViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: ProjectCategory[] = ['ALL', 'AR', 'VR', 'MR', 'XR', '3D', 'SIMULATION'];

  const filtered = useMemo(() => {
    return initialProjects.filter((p) => {
      const matchCat =
        selectedCategory === 'ALL' || p.category.toUpperCase() === selectedCategory;
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.short_desc.toLowerCase().includes(q) ||
        p.technologies.some((t: string) => t.toLowerCase().includes(q))
      );
    });
  }, [initialProjects, selectedCategory, searchQuery]);

  return (
    <div>
      {/* Control Bar: Search + Category Filter Bar */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '420px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--accent-cyan)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{
                paddingLeft: '42px',
                paddingRight: searchQuery ? '36px' : '14px',
                paddingTop: '10px',
                paddingBottom: '10px',
                fontSize: '0.9rem',
              }}
              placeholder="Search by title, stack (Unity, Three.js, Unreal)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Telemetry Counter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span className="beacon-dot" />
            <span>
              SHOWING <strong style={{ color: 'var(--accent-cyan)' }}>{filtered.length}</strong> OF{' '}
              {initialProjects.length} SPECIMENS
            </span>
          </div>
        </div>

        {/* Categories Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              marginRight: '6px',
            }}
          >
            <Filter size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>VERTICAL:</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`}
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="glass-card hud-corner" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div className="tech-coord">SYS_SEARCH: 0 RESULTS MATCHED</div>
          <h4 style={{ fontSize: '1.3rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
            No engineering projects match your current filters.
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '20px' }}>
            Try searching for another keyword or reset the category filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSearchQuery('');
            }}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', padding: '8px 20px' }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
          }}
        >
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
