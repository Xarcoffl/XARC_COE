'use client';

import React, { useState } from 'react';
import { Layers, Monitor, Cpu, Sparkles, Terminal, ShieldCheck, Briefcase } from 'lucide-react';
import LabIsometricTwin3D from './LabIsometricTwin3D';
import { soundFx } from '@/lib/soundFx';

interface NodeInfo {
  id: string;
  title: string;
  icon: any;
  coord: string;
  focus: string;
  description: string;
}

export default function CoWorkingDiagram() {
  const nodes: NodeInfo[] = [
    {
      id: 'self-learning',
      title: 'SELF LEARNING',
      icon: Terminal,
      coord: 'NODE-01 // ASYNC',
      focus: 'Modular Tutorials & Code Sandbox',
      description: 'Dedicated quiet pods with dual-monitor workstations for asynchronous WebGL and shader tutorials.',
    },
    {
      id: 'project-work',
      title: 'PROJECT WORK',
      icon: Layers,
      coord: 'NODE-02 // TEAMS',
      focus: 'Multidisciplinary Collaboration',
      description: 'Agile table clusters where software programmers, 3D artists, and domain engineers synchronize builds.',
    },
    {
      id: '3d-dev',
      title: '3D DEVELOPMENT',
      icon: Monitor,
      coord: 'NODE-03 // ASSETS',
      focus: 'Blender & Unreal Engine 5 Rigging',
      description: 'High-VRAM GPU workstations optimized for real-time nanite meshes, photogrammetry cleanup, and texturing.',
    },
    {
      id: 'hackathons',
      title: 'HACKATHONS',
      icon: Sparkles,
      coord: 'NODE-04 // SPRINT',
      focus: 'Rapid Prototyping & Game Jams',
      description: 'Whiteboard warfare spaces with loaner peripherals for 36-hour sprint challenges and national competitions.',
    },
    {
      id: 'xr-dev',
      title: 'XR DEVELOPMENT',
      icon: Cpu,
      coord: 'NODE-05 // SPATIAL',
      focus: 'Headset Tracking & Passthrough',
      description: 'Open tracking zones with ceiling-mounted sensors for 6-DoF roomscale validation and hand gesture tests.',
    },
    {
      id: 'testing',
      title: 'TESTING & QA',
      icon: ShieldCheck,
      coord: 'NODE-06 // METRICS',
      focus: 'Motion Latency & Ergonomics',
      description: 'Precision motion-to-photon latency analyzers, thermal profiling stations, and simulator sickness audits.',
    },
    {
      id: 'industry',
      title: 'INDUSTRY PROJECTS',
      icon: Briefcase,
      coord: 'NODE-07 // CLIENT',
      focus: 'Live Enterprise Solutions',
      description: 'Confidential project bays delivering enterprise CAD-to-AR tools and medical simulation capstones.',
    },
  ];

  const [activeNode, setActiveNode] = useState<NodeInfo>(nodes[1]);

  return (
    <div className="glass-card hud-corner" style={{ padding: '36px', position: 'relative', overflow: 'hidden' }}>
      <div className="tech-coord">SYS_MAP: COE_WORKSPACE_V2.4 • NODES: 7 ACTIVE</div>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span className="beacon-dot" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            SPATIAL LAB BLUEPRINT
          </span>
        </div>
        <h3 style={{ fontSize: '2rem', marginBottom: '8px' }}>Your Space to Learn and Build</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto 24px auto' }}>
          More than a classroom. Explore how our physical laboratory is partitioned to support every stage of immersive innovation.
        </p>
      </div>

      {/* Interactive 3D Isometric Physical Lab Floorplan */}
      <LabIsometricTwin3D
        activeNodeId={activeNode.id}
        onSelectNode={(id) => {
          const target = nodes.find((n) => n.id === id);
          if (target) setActiveNode(target);
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'center',
        }}
      >
        {/* Node Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          {nodes.map((n) => {
            const Icon = n.icon;
            const isSelected = activeNode.id === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setActiveNode(n)}
                style={{
                  background: isSelected ? 'var(--accent-cyan-glow)' : 'var(--surface-card)',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)',
                  boxShadow: isSelected ? '0 0 20px var(--accent-cyan-glow)' : 'none',
                }}
              >
                <Icon size={20} style={{ color: isSelected ? 'var(--accent-cyan)' : 'inherit', filter: isSelected ? 'drop-shadow(0 0 6px var(--accent-cyan))' : 'none' }} />
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                  {n.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Node Detail Card */}
        <div
          className="hud-corner glass-card"
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-active)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            position: 'relative',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
              {activeNode.coord}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="beacon-dot" />
              <span className="badge badge-cyan">ACTIVE SECTOR</span>
            </div>
          </div>

          <h4 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {activeNode.title}
          </h4>

          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--accent-cyan)',
              fontFamily: 'var(--font-mono)',
              marginBottom: '16px',
            }}
          >
            FOCUS: {activeNode.focus}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '20px' }}>
            {activeNode.description}
          </p>

          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              SECTOR RIGS: GPU Workstations • VR Headsets • Rapid Prototyping Rigs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
