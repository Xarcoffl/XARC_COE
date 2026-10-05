'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, Box, Activity, Zap, ShieldCheck, Database, Radio } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

interface AdminTelemetryCore3DProps {
  stats: {
    counts: {
      new_requests: number;
      waiting_requests: number;
      joined_requests: number;
      total_events: number;
      total_projects: number;
      total_achievements: number;
    };
  };
}

export default function AdminTelemetryCore3D({ stats }: AdminTelemetryCore3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const wireframeRef = useRef(false);
  const autoRotateRef = useRef(true);

  useEffect(() => {
    wireframeRef.current = wireframe;
  }, [wireframe]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  const {
    new_requests = 0,
    waiting_requests = 0,
    joined_requests = 0,
    total_projects = 0,
    total_achievements = 0,
    total_events = 0,
  } = stats?.counts || {};

  const totalAdmissions = new_requests + waiting_requests + joined_requests;

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth || 800;
    let height = container.clientHeight || 340;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060814, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 60);
    camera.position.set(0, 1.8, 6.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 3.2);
    scene.add(ambientLight);

    const cyanPoint = new THREE.PointLight(0x00f5ff, 4.5, 25);
    cyanPoint.position.set(4, 4, 4);
    scene.add(cyanPoint);

    const violetPoint = new THREE.PointLight(0x8a2be2, 3.5, 25);
    violetPoint.position.set(-4, -2, 4);
    scene.add(violetPoint);

    // 3. Telemetry Master Group
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const materials: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[] = [];

    // Central Floating Crystalline Orb (Database Health Core)
    const orbGeo = new THREE.IcosahedronGeometry(1.0, 1);
    const orbMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f5ff,
      transmission: 0.85,
      roughness: 0.1,
      metalness: 0.2,
      emissive: 0x003366,
      transparent: true,
      opacity: 0.9,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    coreGroup.add(orb);
    materials.push(orbMat);

    // Inner Glowing Core Nucleus
    const nucleusGeo = new THREE.OctahedronGeometry(0.55, 0);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0x8a2be2,
      emissive: 0x3b0764,
      metalness: 0.9,
      roughness: 0.1,
    });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    coreGroup.add(nucleus);
    materials.push(nucleusMat);

    // Ring 1 (Pipeline Intake Gyro Ring)
    const r1Geo = new THREE.TorusGeometry(1.65, 0.04, 16, 64);
    const r1Mat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
    const ring1 = new THREE.Mesh(r1Geo, r1Mat);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    // Ring 2 (Project Portfolio Gyro Ring)
    const r2Geo = new THREE.TorusGeometry(2.1, 0.035, 16, 64);
    const r2Mat = new THREE.MeshBasicMaterial({ color: 0x8a2be2 });
    const ring2 = new THREE.Mesh(r2Geo, r2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = Math.PI / 6;
    coreGroup.add(ring2);

    // Ring 3 (Equator Milestones Ring with Telemetry Node Dots)
    const r3Geo = new THREE.TorusGeometry(2.5, 0.03, 16, 64);
    const r3Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ring3 = new THREE.Mesh(r3Geo, r3Mat);
    ring3.rotation.x = Math.PI / 2;
    coreGroup.add(ring3);

    // Satellites orbiting representing pipeline elements
    const satGroup = new THREE.Group();
    ring3.add(satGroup);

    const satCount = 6;
    for (let s = 0; s < satCount; s++) {
      const angle = (s / satCount) * Math.PI * 2;
      const satGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
      const satMat = new THREE.MeshBasicMaterial({
        color: s % 3 === 0 ? 0x4ade80 : s % 3 === 1 ? 0xfbbf24 : 0x38bdf8,
      });
      const sat = new THREE.Mesh(satGeo, satMat);
      sat.position.set(Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, 0);
      satGroup.add(sat);
    }

    // Floor Radar Grid
    const grid = new THREE.GridHelper(10, 20, 0x00f5ff, 0x1e293b);
    grid.position.y = -1.6;
    scene.add(grid);

    // Cosmic sparkling data particles
    const pCount = 100;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 6;
      pPos[i + 1] = (Math.random() - 0.5) * 3.5;
      pPos[i + 2] = (Math.random() - 0.5) * 6;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00f5ff,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // 4. Interactive Drag Orbit
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      coreGroup.rotation.y += deltaX * 0.008;
      coreGroup.rotation.x += deltaY * 0.008;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch Support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      coreGroup.rotation.y += deltaX * 0.008;
      coreGroup.rotation.x += deltaY * 0.008;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    domEl.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Resize Handler
    const onResize = () => {
      if (!mountRef.current) return;
      width = mountRef.current.clientWidth || 800;
      height = mountRef.current.clientHeight || 340;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // 5. Animation Loop
    let animId: number;
    const timer = new THREE.Timer();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      timer.update();
      const elapsed = timer.getElapsed();

      // Auto rotation
      if (autoRotateRef.current && !isDragging) {
        coreGroup.rotation.y += 0.006;
      }

      // Gyro rings counter-rotation
      ring1.rotation.z = elapsed * 0.4;
      ring2.rotation.z = -elapsed * 0.3;
      ring3.rotation.z = elapsed * 0.2;
      nucleus.rotation.y = -elapsed * 0.8;

      // Core pulse
      const pulse = 1.0 + Math.sin(elapsed * 2.5) * 0.06;
      orb.scale.set(pulse, pulse, pulse);

      // Wireframe state
      materials.forEach((m) => {
        m.wireframe = wireframeRef.current;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
      timer.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '340px',
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        background: 'radial-gradient(circle at center, rgba(0, 245, 255, 0.07) 0%, var(--surface-card) 100%)',
        border: '1px solid rgba(0, 245, 255, 0.3)',
        overflow: 'hidden',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        cursor: 'grab',
        marginBottom: '28px',
      }}
    >
      {/* Three.js Canvas Mount */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Header Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '18px',
          right: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="beacon-dot" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--accent-cyan)',
              letterSpacing: '0.12em',
              textShadow: '0 0 12px rgba(0, 245, 255, 0.5)',
            }}
          >
            SPATIAL_TELEMETRY_CORE // COMMAND CENTER ONLINE
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="badge badge-green"
            style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <Radio size={12} className="animate-spin" />
            <span>CORE INTEGRITY: 100%</span>
          </span>
        </div>
      </div>

      {/* Floating Telemetry Stats Widget (Left Bottom) */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '18px',
          background: 'var(--surface-card)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 18px',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.74rem',
        }}
      >
        <div>
          <div style={{ color: 'var(--text-muted)' }}>PIPELINE TOTAL</div>
          <div style={{ color: 'var(--accent-cyan)', fontSize: '1rem', fontWeight: 700 }}>
            {totalAdmissions} STUDENTS
          </div>
        </div>
        <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }} />
        <div>
          <div style={{ color: 'var(--text-muted)' }}>XR PORTFOLIO</div>
          <div style={{ color: '#818cf8', fontSize: '1rem', fontWeight: 700 }}>
            {total_projects} PROJECTS
          </div>
        </div>
        <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }} />
        <div>
          <div style={{ color: 'var(--text-muted)' }}>PODIUMS & PATENTS</div>
          <div style={{ color: '#c084fc', fontSize: '1rem', fontWeight: 700 }}>
            {total_achievements} AWARDS
          </div>
        </div>
      </div>

      {/* Interactive Controls Overlay Toolbar (Bottom Right) */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <button
          onClick={() => {
            setAutoRotate(!autoRotate);
            soundFx.playSpatialClick();
          }}
          className="tab-btn"
          style={{
            padding: '5px 12px',
            fontSize: '0.72rem',
            background: autoRotate ? 'rgba(0, 245, 255, 0.18)' : 'var(--surface-card-alt)',
            border: autoRotate ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
            color: autoRotate ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
        >
          <RotateCcw size={12} style={{ marginRight: '4px' }} />
          <span>{autoRotate ? 'PAUSE ROTATION' : 'ORBIT'}</span>
        </button>

        <button
          onClick={() => {
            setWireframe(!wireframe);
            soundFx.playModeSwitch();
          }}
          className="tab-btn"
          style={{
            padding: '5px 12px',
            fontSize: '0.72rem',
            background: wireframe ? 'rgba(0, 245, 255, 0.18)' : 'var(--surface-card-alt)',
            border: wireframe ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
            color: wireframe ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
        >
          <Box size={12} style={{ marginRight: '4px' }} />
          <span>{wireframe ? 'SURFACE' : 'WIREFRAME'}</span>
        </button>
      </div>
    </div>
  );
}
