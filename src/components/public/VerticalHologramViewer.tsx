'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, RotateCw } from 'lucide-react';

interface VerticalHologramViewerProps {
  verticalNumber: string; // "01", "02", "03", "04", "05"
  title: string;
}

export default function VerticalHologramViewer({ verticalNumber, title }: VerticalHologramViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile || !mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth || 400;
    let height = container.clientHeight || 260;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // 2. Lighting - Brightened for crisp visibility in both light and dark themes
    const ambient = new THREE.AmbientLight(0xffffff, 2.8);
    scene.add(ambient);

    const cyanLight = new THREE.PointLight(0x00ffff, 4.5, 30);
    cyanLight.position.set(4, 4, 6);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0x7b61ff, 4.0, 30);
    violetLight.position.set(-4, -3, 5);
    scene.add(violetLight);

    // 3. Model Creation based on verticalNumber
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const num = verticalNumber.trim();

    if (num === '01') {
      // 01: Core Foundations / Headset Visor
      const visorGeo = new THREE.BoxGeometry(2.2, 1.1, 1.2, 4, 4, 4);
      const visorMat = new THREE.MeshStandardMaterial({ color: 0x070b18, roughness: 0.2, metalness: 0.9 });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      modelGroup.add(visor);

      const plateGeo = new THREE.PlaneGeometry(2.15, 1.05);
      const plateMat = new THREE.MeshPhysicalMaterial({
        color: 0x030712,
        roughness: 0.05,
        metalness: 0.95,
        transmission: 0.4,
        transparent: true,
        opacity: 0.9,
      });
      const faceplate = new THREE.Mesh(plateGeo, plateMat);
      faceplate.position.z = 0.61;
      modelGroup.add(faceplate);

      const ringGeo = new THREE.TorusGeometry(0.32, 0.016, 16, 48);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.z = 0.62;
      modelGroup.add(ring);
    } else if (num === '02') {
      // 02: Healthcare & MedTech Pulsing Core
      const heartGeo = new THREE.OctahedronGeometry(1.5, 3);
      const heartMat = new THREE.MeshPhysicalMaterial({
        color: 0xff007f,
        emissive: 0x660033,
        roughness: 0.1,
        metalness: 0.2,
        transmission: 0.85,
        transparent: true,
        opacity: 0.9,
      });
      const heart = new THREE.Mesh(heartGeo, heartMat);
      modelGroup.add(heart);

      const scanRingGeo = new THREE.TorusGeometry(2.2, 0.03, 16, 64);
      const scanRing = new THREE.Mesh(scanRingGeo, new THREE.MeshBasicMaterial({ color: 0x00ffff }));
      scanRing.rotation.x = Math.PI / 3;
      modelGroup.add(scanRing);
    } else if (num === '03') {
      // 03: Industrial Aero Turbine
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 3.2, 24),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 })
      );
      shaft.rotation.x = Math.PI / 2;
      modelGroup.add(shaft);

      const blades = new THREE.Group();
      for (let b = 0; b < 14; b++) {
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 1.3, 0.22),
          new THREE.MeshStandardMaterial({ color: 0x00ffff, metalness: 0.8, roughness: 0.2 })
        );
        blade.position.y = 0.75;
        blade.rotation.y = 0.4;
        const holder = new THREE.Group();
        holder.rotation.z = (b / 14) * Math.PI * 2;
        holder.add(blade);
        blades.add(holder);
      }
      modelGroup.add(blades);

      const casing1 = new THREE.Mesh(
        new THREE.TorusGeometry(1.9, 0.05, 16, 48),
        new THREE.MeshStandardMaterial({ color: 0x7b61ff, metalness: 0.8 })
      );
      casing1.position.z = 0.8;
      modelGroup.add(casing1);
    } else if (num === '04') {
      // 04: Digital Twin City Grid
      const grid = new THREE.GridHelper(8, 12, 0x00ffff, 0x1e293b);
      grid.position.y = -1.2;
      modelGroup.add(grid);

      const towerMat = new THREE.MeshStandardMaterial({
        color: 0x091226,
        emissive: 0x00ffff,
        emissiveIntensity: 0.3,
        wireframe: true,
      });

      const towers = [
        { x: -1.8, z: -1, h: 2.8 },
        { x: 1.8, z: -1, h: 3.4 },
        { x: 0, z: 1.2, h: 2.4 },
        { x: -1, z: 1.2, h: 1.8 },
      ];

      towers.forEach((t) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(1.0, t.h, 1.0), towerMat);
        m.position.set(t.x, -1.2 + t.h / 2, t.z);
        modelGroup.add(m);

        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
        dot.position.set(t.x, -1.2 + t.h + 0.1, t.z);
        modelGroup.add(dot);
      });
      camera.position.set(0, 3, 6);
      camera.lookAt(0, 0, 0);
    } else {
      // 05: Spatial UI Windows
      const winGeo = new THREE.PlaneGeometry(2.4, 1.5);
      const winMat = new THREE.MeshPhysicalMaterial({
        color: 0x060c1d,
        roughness: 0.1,
        metalness: 0.8,
        transmission: 0.7,
        transparent: true,
        opacity: 0.85,
      });
      const p1 = new THREE.Mesh(winGeo, winMat);
      const edge1 = new THREE.LineSegments(new THREE.EdgesGeometry(winGeo), new THREE.LineBasicMaterial({ color: 0x00ffff }));
      p1.add(edge1);
      modelGroup.add(p1);

      const p2 = new THREE.Mesh(winGeo, winMat);
      const edge2 = new THREE.LineSegments(new THREE.EdgesGeometry(winGeo), new THREE.LineBasicMaterial({ color: 0x7b61ff }));
      p2.add(edge2);
      p2.position.set(-0.6, -0.4, -0.8);
      modelGroup.add(p2);
    }

    // 4. Interactive Drag Rotation
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
      modelGroup.rotation.y += deltaX * 0.012;
      modelGroup.rotation.x += deltaY * 0.012;
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
      modelGroup.rotation.y += deltaX * 0.012;
      modelGroup.rotation.x += deltaY * 0.012;
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
      width = mountRef.current.clientWidth || 400;
      height = mountRef.current.clientHeight || 260;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // 5. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Continuous gentle auto-spin when not dragging
      if (!isDragging) {
        modelGroup.rotation.y += 0.008;
      }

      // Vertical specific pulses
      if (num === '02') {
        const pulse = 1.0 + Math.sin(elapsed * 4.0) * 0.06;
        modelGroup.children[0].scale.set(pulse, pulse, pulse);
      } else if (num === '03') {
        // Spin blades inside turbine
        if (modelGroup.children[1]) {
          modelGroup.children[1].rotation.z -= 0.06;
        }
      }

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
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [verticalNumber]);

  if (isMobile) {
    return (
      <div
        style={{
          width: '100%',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '8px',
        }}
      >
        <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
          SPECIMEN_{verticalNumber} // SCHEMATIC
        </span>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {title}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Spatial hardware pod blueprint & interactive curriculum
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        height: '260px',
        position: 'relative',
        borderRadius: 'var(--radius-md)',
        background: 'radial-gradient(circle at center, rgba(0, 255, 255, 0.08) 0%, var(--surface-card) 100%)',
        border: '1px solid rgba(0, 255, 255, 0.25)',
        overflow: 'hidden',
        cursor: 'grab',
        marginBottom: '24px',
      }}
    >
      {/* 3D Canvas Mount */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Telemetry Header */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '14px',
          right: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="beacon-dot" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)', letterSpacing: '0.08em' }}>
            SPECIMEN_{verticalNumber} // 3D_INTERACTIVE
          </span>
        </div>
        <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
          DRAG TO ORBIT
        </span>
      </div>

      {/* Bottom Telemetry Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '14px',
          right: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span>STATUS: LIVE_HOLOGRAPHIC_SIMULATION</span>
        <span style={{ color: 'var(--accent-cyan)' }}>60 FPS // GPU ACCELERATED</span>
      </div>
    </div>
  );
}
