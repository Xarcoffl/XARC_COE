'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface StudentHoloKeycard3DProps {
  fullName: string;
  registerNumber: string;
  department: string;
  experienceLevel: string;
  isSubmitted?: boolean;
}

export default function StudentHoloKeycard3D({
  fullName,
  registerNumber,
  department,
  experienceLevel,
  isSubmitted = false,
}: StudentHoloKeycard3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvas2DRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Redraw 2D Canvas Texture whenever form fields change
  useEffect(() => {
    const canvas = canvas2DRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Background Gradient (Vibrant Deep Spatial Sapphire & Neon Violet)
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#0b1d3a');
    bgGrad.addColorStop(0.4, '#13284c');
    bgGrad.addColorStop(0.8, '#1e1c4a');
    bgGrad.addColorStop(1, '#2b1650');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Glowing Cyber Grid Lines
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.22)';
    ctx.lineWidth = 1.5;
    for (let x = 40; x < w; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 40; y < h; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Outer Border with Neon Bevel
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    // Neon Accent Brackets (Brilliant Glowing Cyan)
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 8;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 12;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(20, 90);
    ctx.lineTo(20, 20);
    ctx.lineTo(90, 20);
    ctx.stroke();
    // Top-Right
    ctx.beginPath();
    ctx.moveTo(w - 90, 20);
    ctx.lineTo(w - 20, 20);
    ctx.lineTo(w - 20, 90);
    ctx.stroke();
    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(20, h - 90);
    ctx.lineTo(20, h - 20);
    ctx.lineTo(90, h - 20);
    ctx.stroke();
    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(w - 90, h - 20);
    ctx.lineTo(w - 20, h - 20);
    ctx.lineTo(w - 20, h - 90);
    ctx.stroke();

    // Top Header
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 26px monospace';
    ctx.fillText('AR/VR CENTRE OF EXCELLENCE', 50, 75);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('SPATIAL COMPUTING RESEARCH LAB // KEYCARD ID', 50, 105);

    // Holographic Microchip Icon
    ctx.fillStyle = 'rgba(123, 97, 255, 0.5)';
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.fillRect(w - 180, 45, 130, 90);
    ctx.strokeRect(w - 180, 45, 130, 90);

    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('6-DoF NFC', w - 165, 98);

    // Student Candidate Name
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('APPLICANT NAME', 50, 195);

    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px sans-serif';
    const displayTitle = fullName.trim() ? fullName.toUpperCase() : 'CANDIDATE NAME';
    ctx.fillText(displayTitle.slice(0, 24), 50, 245);

    // Department & Reg Number
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('DEPARTMENT', 50, 315);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText((department || 'Computer Science and Engineering').slice(0, 32), 50, 350);

    // Reg No & Track Level
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('REGISTRATION ID', 50, 425);

    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(registerNumber.trim() ? registerNumber : 'PENDING_REGISTRATION', 50, 460);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('LEVEL', w - 320, 425);

    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ff77ff';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(experienceLevel.toUpperCase(), w - 320, 460);

    // Bottom Barcode Graphic
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    for (let b = 50; b < w - 50; b += 14) {
      const bw = (b % 28 === 0) ? 6 : 2;
      ctx.fillRect(b, h - 85, bw, 35);
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`SECURITY TOKEN: 0x${Math.abs(fullName.length * 9437 + 1092).toString(16).toUpperCase()} • BIOMETRIC VERIFIED`, 50, h - 35);

    // Inform Three.js that texture updated
    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }
  }, [fullName, registerNumber, department, experienceLevel]);

  // Three.js Mount & Animation
  useEffect(() => {
    if (isMobile || !mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth || 400;
    let height = container.clientHeight || 280;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0, 5.8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 2. Offscreen 2D Canvas Texture (1024x640)
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 1024;
    offscreenCanvas.height = 640;
    canvas2DRef.current = offscreenCanvas;

    const texture = new THREE.CanvasTexture(offscreenCanvas);
    textureRef.current = texture;

    // 3. Card 3D Geometry & Material (Self-illuminating holographic finish)
    const cardGeo = new THREE.BoxGeometry(3.8, 2.38, 0.06);
    const cardMat = new THREE.MeshPhysicalMaterial({
      map: texture,
      emissiveMap: texture,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.65,
      roughness: 0.18,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.95,
    });
    const cardMesh = new THREE.Mesh(cardGeo, cardMat);
    scene.add(cardMesh);
    meshRef.current = cardMesh;

    // Glowing Specular Border Line
    const edges = new THREE.EdgesGeometry(cardGeo);
    const border = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.95 }));
    cardMesh.add(border);

    // 4. Lighting (Enhanced High-Brilliance Rig)
    const ambient = new THREE.AmbientLight(0xffffff, 3.2);
    scene.add(ambient);

    const frontDir = new THREE.DirectionalLight(0xffffff, 4.0);
    frontDir.position.set(0, 2, 6);
    scene.add(frontDir);

    const cyanPoint = new THREE.PointLight(0x00ffff, 5.0, 25);
    cyanPoint.position.set(3, 3, 5);
    scene.add(cyanPoint);

    const violetPoint = new THREE.PointLight(0xa855f7, 4.5, 25);
    violetPoint.position.set(-3, -3, 4);
    scene.add(violetPoint);

    // 5. Interactive Mouse Parallax
    let targetRotX = 0;
    let targetRotY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.45;
      targetRotX = -y * 0.35;
    };
    container.addEventListener('mousemove', onMouseMove);

    const onMouseLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
    };
    container.addEventListener('mouseleave', onMouseLeave);

    // Resize
    const onResize = () => {
      if (!mountRef.current) return;
      width = mountRef.current.clientWidth || 400;
      height = mountRef.current.clientHeight || 260;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // 6. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Idle floating bob
      cardMesh.position.y = Math.sin(elapsed * 2.0) * 0.08;

      // Smooth lerp to mouse rotation
      cardMesh.rotation.y = THREE.MathUtils.lerp(cardMesh.rotation.y, targetRotY, 0.08);
      cardMesh.rotation.x = THREE.MathUtils.lerp(cardMesh.rotation.x, targetRotX, 0.08);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      texture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (isMobile) {
    return (
      <div
        style={{
          width: '100%',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface-card)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          marginBottom: '24px',
          boxShadow: isSubmitted ? '0 0 24px rgba(0, 255, 255, 0.4)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
            HOLO_KEYCARD // ADMISSION PASS
          </span>
          <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
            {isSubmitted ? 'DISPATCHED' : 'LIVE PREVIEW'}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {fullName.trim() || 'CANDIDATE NAME'}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          REG: {registerNumber.trim() || 'PENDING'} • {department || 'DEPT'}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '290px',
        position: 'relative',
        borderRadius: 'var(--radius-md)',
        background: 'radial-gradient(circle at center, rgba(0, 245, 255, 0.12) 0%, var(--surface-card) 100%)',
        border: '1px solid var(--border-glass)',
        overflow: 'hidden',
        marginBottom: '24px',
        boxShadow: isSubmitted ? '0 0 36px var(--accent-cyan-glow)' : 'var(--shadow-card)',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {/* 3D Canvas */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Telemetry Header */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="beacon-dot" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)', letterSpacing: '0.08em' }}>
            HOLO_KEYCARD // LIVE_RENDER
          </span>
        </div>
        <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
          REAL-TIME 3D WAFER
        </span>
      </div>

      {/* Bottom Telemetry Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          fontSize: '0.68rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span>STATUS: SYNCHRONIZED_WITH_INPUTS</span>
        <span style={{ color: 'var(--accent-cyan)' }}>TILT WITH CURSOR</span>
      </div>
    </div>
  );
}
