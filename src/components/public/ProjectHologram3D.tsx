'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Layers, RotateCcw, Box, Eye, Maximize2, Shield } from 'lucide-react';

interface ProjectHologram3DProps {
  category: 'AR' | 'VR' | 'MR' | 'XR' | '3D' | 'SIMULATION';
  title: string;
}

export default function ProjectHologram3D({ category, title }: ProjectHologram3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const wireframeRef = useRef(false);
  const explodedRef = useRef(false);
  const autoRotateRef = useRef(true);

  useEffect(() => {
    wireframeRef.current = wireframe;
  }, [wireframe]);

  useEffect(() => {
    explodedRef.current = exploded;
  }, [exploded]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    if (isMobile || !mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth || 800;
    let height = container.clientHeight || 460;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 60);
    camera.position.set(0, 2.5, 7.5);
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
    const ambient = new THREE.AmbientLight(0x0e172a, 3.0);
    scene.add(ambient);

    const cyanLight = new THREE.PointLight(0x00ffff, 4.5, 30);
    cyanLight.position.set(5, 5, 6);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0x7b61ff, 3.5, 30);
    violetLight.position.set(-5, -4, 5);
    scene.add(violetLight);

    // 3. Grid Pedestal
    const grid = new THREE.GridHelper(10, 16, 0x00ffff, 0x1e293b);
    grid.position.y = -1.8;
    scene.add(grid);

    // 4. Model Creation based on Category
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    const materials: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[] = [];
    const explodableParts: { mesh: THREE.Mesh; defaultY: number; explodeY: number; defaultZ: number; explodeZ: number }[] = [];

    if (category === 'VR' || category === 'SIMULATION') {
      // VR / Industrial Simulation Rig
      // Base Core
      const baseGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.5, 32);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = -1.2;
      masterGroup.add(base);
      materials.push(baseMat);

      // Central Column (Explodable)
      const colGeo = new THREE.CylinderGeometry(0.7, 0.7, 2.0, 24);
      const colMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.9 });
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.y = 0;
      masterGroup.add(col);
      materials.push(colMat);
      explodableParts.push({ mesh: col, defaultY: 0, explodeY: 0.8, defaultZ: 0, explodeZ: 0 });

      // Holographic Sensor Head
      const headGeo = new THREE.BoxGeometry(2.2, 1.0, 1.2);
      const headMat = new THREE.MeshPhysicalMaterial({ color: 0x00ffff, roughness: 0.1, transmission: 0.8, transparent: true, opacity: 0.85 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.3;
      masterGroup.add(head);
      materials.push(headMat);
      explodableParts.push({ mesh: head, defaultY: 1.3, explodeY: 2.2, defaultZ: 0, explodeZ: 0 });

      // Outer Guard Rails
      const railGeo = new THREE.TorusGeometry(2.2, 0.05, 16, 48);
      const railMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.rotation.x = Math.PI / 2;
      rail.position.y = -0.5;
      masterGroup.add(rail);
    } else if (category === 'MR' || category === 'AR') {
      // MR / AR Hologram Overlay
      // Floating Multi-layered Cube
      const outerGeo = new THREE.BoxGeometry(2.4, 2.4, 2.4);
      const outerMat = new THREE.MeshPhysicalMaterial({
        color: 0x00ffff,
        wireframe: true,
        roughness: 0.1,
        transparent: true,
        opacity: 0.6,
      });
      const outer = new THREE.Mesh(outerGeo, outerMat);
      masterGroup.add(outer);
      materials.push(outerMat);

      // Inner Core
      const innerGeo = new THREE.OctahedronGeometry(1.2, 2);
      const innerMat = new THREE.MeshPhysicalMaterial({
        color: 0x7b61ff,
        emissive: 0x38006b,
        roughness: 0.2,
        metalness: 0.5,
        transmission: 0.6,
        transparent: true,
        opacity: 0.9,
      });
      const inner = new THREE.Mesh(innerGeo, innerMat);
      masterGroup.add(inner);
      materials.push(innerMat);
      explodableParts.push({ mesh: inner, defaultY: 0, explodeY: 1.2, defaultZ: 0, explodeZ: 0 });

      // Scanning Orbit Ring
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.03, 16, 64), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
      ring.rotation.x = Math.PI / 3;
      masterGroup.add(ring);
    } else {
      // 3D / XR Digital Twin Asset
      const geo = new THREE.IcosahedronGeometry(1.8, 1);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        metalness: 0.85,
        roughness: 0.15,
        wireframe: false,
      });
      const m = new THREE.Mesh(geo, mat);
      masterGroup.add(m);
      materials.push(mat);

      // Orbiting Satellites
      for (let s = 0; s < 4; s++) {
        const sat = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshBasicMaterial({ color: 0x7b61ff }));
        const angle = (s / 4) * Math.PI * 2;
        sat.position.set(Math.cos(angle) * 2.6, 0, Math.sin(angle) * 2.6);
        masterGroup.add(sat);
        explodableParts.push({
          mesh: sat,
          defaultY: 0,
          explodeY: 0,
          defaultZ: sat.position.z,
          explodeZ: sat.position.z * 1.6,
        });
      }
    }

    // 5. Interactive Drag to Orbit
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
      masterGroup.rotation.y += deltaX * 0.01;
      masterGroup.rotation.x += deltaY * 0.01;
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
      masterGroup.rotation.y += deltaX * 0.01;
      masterGroup.rotation.x += deltaY * 0.01;
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
      height = mountRef.current.clientHeight || 460;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // 6. Animation Loop
    let animId: number;
    const timer = new THREE.Timer();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      timer.update();
      const elapsed = timer.getElapsed();

      // Auto rotation
      if (autoRotateRef.current && !isDragging) {
        masterGroup.rotation.y += 0.008;
      }

      // Wireframe state update
      materials.forEach((m) => {
        m.wireframe = wireframeRef.current;
      });

      // Exploded state lerp
      explodableParts.forEach((part) => {
        const targetY = explodedRef.current ? part.explodeY : part.defaultY;
        const targetZ = explodedRef.current ? part.explodeZ : part.defaultZ;
        part.mesh.position.y = THREE.MathUtils.lerp(part.mesh.position.y, targetY, 0.08);
        part.mesh.position.z = THREE.MathUtils.lerp(part.mesh.position.z, targetZ, 0.08);
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
  }, [category]);

  if (isMobile) {
    return (
      <div
        style={{
          width: '100%',
          padding: '24px 20px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="beacon-dot" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-cyan)', letterSpacing: '0.1em' }}>
            HOLOGRAPHIC_PROTOTYPE // {category}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {title}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Interactive 3D spatial model available on desktop & tablet displays.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '460px',
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        background: 'radial-gradient(circle at center, rgba(0, 255, 255, 0.08) 0%, var(--surface-card) 100%)',
        border: '1px solid rgba(0, 255, 255, 0.35)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        cursor: 'grab',
        marginBottom: '56px',
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
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-cyan)', letterSpacing: '0.1em' }}>
            HOLOGRAPHIC_PROTOTYPE // {category} SPECIMEN
          </span>
        </div>
        <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
          3D SPATIAL INSPECTOR
        </span>
      </div>

      {/* Interactive Controls Overlay Toolbar */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '18px',
          right: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="tab-btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.75rem',
              background: autoRotate ? 'rgba(0, 255, 255, 0.2)' : 'var(--surface-card-alt)',
              border: autoRotate ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              color: autoRotate ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <RotateCcw size={14} style={{ marginRight: '6px' }} />
            <span>{autoRotate ? 'PAUSE ROTATION' : 'RESUME ROTATION'}</span>
          </button>

          <button
            onClick={() => setWireframe(!wireframe)}
            className="tab-btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.75rem',
              background: wireframe ? 'rgba(0, 255, 255, 0.2)' : 'var(--surface-card-alt)',
              border: wireframe ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              color: wireframe ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <Box size={14} style={{ marginRight: '6px' }} />
            <span>{wireframe ? 'SURFACE MESH' : 'WIREFRAME'}</span>
          </button>

          <button
            onClick={() => setExploded(!exploded)}
            className="tab-btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.75rem',
              background: exploded ? 'rgba(255, 0, 127, 0.2)' : 'var(--surface-card-alt)',
              border: exploded ? '1px solid rgba(255, 0, 127, 0.6)' : '1px solid var(--border-subtle)',
              color: exploded ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <Layers size={14} style={{ marginRight: '6px' }} />
            <span>{exploded ? 'ASSEMBLE' : 'EXPLODE LAYERS'}</span>
          </button>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          DRAG TO ORBIT 360° // SCROLL TO ZOOM
        </div>
      </div>
    </div>
  );
}
