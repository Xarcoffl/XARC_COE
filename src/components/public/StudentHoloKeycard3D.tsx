'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';

export interface StudentHoloKeycard3DProps {
  fullName: string;
  registerNumber: string;
  department?: string;
  year?: string;
  section?: string;
  email?: string;
  interests?: string[];
  experienceLevel?: string;
  isSubmitted?: boolean;
}

/**
 * Pure 2D canvas drawing function for the holographic card texture wafer (1024 x 640).
 * Carefully balanced color palette and typography:
 * Deep obsidian sapphire background with zero white-out blowout,
 * high-contrast crisp text, authentic metallic smartcard chip,
 * and verified submission badge when isSubmitted is true.
 */
function drawKeycardOnCanvas(canvas: HTMLCanvasElement, props: StudentHoloKeycard3DProps) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const {
    fullName = '',
    registerNumber = '',
    department = 'Computer Science and Engineering',
    year = '2nd Year',
    section = 'A',
    email = '',
    interests = [],
    experienceLevel = 'New to XR',
    isSubmitted = false,
  } = props;

  // 1. Base Gradient - Deep obsidian sapphire / midnight cyber slate
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#060c18');
  bgGrad.addColorStop(0.35, '#0a1426');
  bgGrad.addColorStop(0.75, '#0e1736');
  bgGrad.addColorStop(1, '#090e1f');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Soft Ambient Radial Vignette (keeps corners deep and center subtle)
  const radGrad = ctx.createRadialGradient(240, 160, 20, 240, 160, 560);
  radGrad.addColorStop(0, isSubmitted ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0, 245, 255, 0.07)');
  radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, w, h);

  // 3. Precision Micro-Grid (fine 48px pitch)
  ctx.strokeStyle = 'rgba(0, 245, 255, 0.035)';
  ctx.lineWidth = 1;
  for (let x = 36; x < w; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 24);
    ctx.lineTo(x, h - 24);
    ctx.stroke();
  }
  for (let y = 36; y < h; y += 48) {
    ctx.beginPath();
    ctx.moveTo(24, y);
    ctx.lineTo(w - 24, y);
    ctx.stroke();
  }

  // 4. Subtle Circuit Trace Aesthetics from Chip
  ctx.strokeStyle = 'rgba(0, 245, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w - 180, 85);
  ctx.lineTo(w - 240, 85);
  ctx.lineTo(w - 280, 125);
  ctx.lineTo(w - 380, 125);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(w - 180, 110);
  ctx.lineTo(w - 220, 110);
  ctx.lineTo(w - 250, 140);
  ctx.lineTo(w - 320, 140);
  ctx.stroke();

  // 5. Outer Chamfered Border & Neon Corner Brackets
  ctx.strokeStyle = isSubmitted ? 'rgba(16, 185, 129, 0.55)' : 'rgba(0, 245, 255, 0.38)';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(24, 24, w - 48, h - 48);

  ctx.strokeStyle = isSubmitted ? '#10b981' : '#00f5ff';
  ctx.lineWidth = 4;
  ctx.shadowColor = isSubmitted ? '#10b981' : '#00f5ff';
  ctx.shadowBlur = 6;

  // Top-Left Bracket
  ctx.beginPath();
  ctx.moveTo(24, 80);
  ctx.lineTo(24, 24);
  ctx.lineTo(80, 24);
  ctx.stroke();

  // Top-Right Bracket
  ctx.beginPath();
  ctx.moveTo(w - 80, 24);
  ctx.lineTo(w - 24, 24);
  ctx.lineTo(w - 24, 80);
  ctx.stroke();

  // Bottom-Left Bracket
  ctx.beginPath();
  ctx.moveTo(24, h - 80);
  ctx.lineTo(24, h - 24);
  ctx.lineTo(80, h - 24);
  ctx.stroke();

  // Bottom-Right Bracket
  ctx.beginPath();
  ctx.moveTo(w - 80, h - 24);
  ctx.lineTo(w - 24, h - 24);
  ctx.lineTo(w - 24, h - 80);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 6. Header Section
  // Pill Badge
  ctx.fillStyle = isSubmitted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 245, 255, 0.12)';
  ctx.strokeStyle = isSubmitted ? 'rgba(16, 185, 129, 0.45)' : 'rgba(0, 245, 255, 0.35)';
  ctx.lineWidth = 1;
  ctx.fillRect(52, 48, 230, 22);
  ctx.strokeRect(52, 48, 230, 22);

  ctx.fillStyle = isSubmitted ? '#34d399' : '#38bdf8';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(isSubmitted ? 'VERIFIED ADMISSION WAFER' : 'RESEARCH DIVISION WAFER', 62, 63);

  // Main Institution
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('AR/VR CENTRE OF EXCELLENCE', 52, 98);

  // Subtitle
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('SPATIAL COMPUTING & IMMERSIVE SYSTEMS LAB // 2025–2026', 52, 118);

  // 7. Realistic Metallic Security Chip (Top-Right)
  const chipX = w - 170;
  const chipY = 46;
  const chipW = 104;
  const chipH = 74;

  const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
  chipGrad.addColorStop(0, '#d97706');
  chipGrad.addColorStop(0.5, '#f59e0b');
  chipGrad.addColorStop(1, '#b45309');
  ctx.fillStyle = chipGrad;
  ctx.fillRect(chipX, chipY, chipW, chipH);
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(chipX, chipY, chipW, chipH);

  // Chip contact pads
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(chipX + 34, chipY);
  ctx.lineTo(chipX + 34, chipY + chipH);
  ctx.moveTo(chipX + 70, chipY);
  ctx.lineTo(chipX + 70, chipY + chipH);
  ctx.moveTo(chipX, chipY + 37);
  ctx.lineTo(chipX + chipW, chipY + 37);
  ctx.stroke();

  // Central contact cutout
  ctx.fillStyle = '#b45309';
  ctx.fillRect(chipX + 34, chipY + 22, 36, 30);
  ctx.strokeRect(chipX + 34, chipY + 22, 36, 30);

  // NFC / Wireless Indicator
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('6-DoF NFC', chipX + 22, chipY + chipH + 16);

  // 8. Applicant Name
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('APPLICANT / CADET NAME', 52, 168);

  const displayName = fullName.trim() ? fullName.toUpperCase() : 'CANDIDATE NAME';
  ctx.fillStyle = '#ffffff';
  // Adjust font size dynamically so long names never clip
  const nameFontSize = displayName.length > 22 ? 24 : displayName.length > 16 ? 28 : 32;
  ctx.font = `bold ${nameFontSize}px sans-serif`;
  ctx.fillText(displayName.slice(0, 32), 52, 204);

  // 9. Department & Cohort (Year / Section / Email)
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('ACADEMIC DEPARTMENT & COHORT', 52, 248);

  const deptDisplay = (department || 'Computer Science and Engineering').trim();
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(deptDisplay.slice(0, 38), 52, 274);

  // Cohort details line
  const cohortInfo = `${year || '2nd Year'} • Sec ${section || 'A'}${email ? ' • ' + email : ''}`;
  ctx.fillStyle = '#a5b4fc';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(cohortInfo.slice(0, 48), 52, 296);

  // 10. Registration ID (Left) & Experience Track (Right)
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('REGISTRATION ID', 52, 342);

  const regDisplay = registerNumber.trim() ? registerNumber.toUpperCase() : 'PENDING_REGISTRATION';
  ctx.fillStyle = '#00f5ff';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(regDisplay, 52, 370);

  // Experience level badge (Right)
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('EXPERIENCE LEVEL', w - 300, 342);

  const levelText = `TRACK: ${(experienceLevel || 'NEW TO XR').toUpperCase()}`;
  ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
  ctx.lineWidth = 1;
  ctx.fillRect(w - 300, 350, 234, 28);
  ctx.strokeRect(w - 300, 350, 234, 28);

  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(levelText, w - 288, 369);

  // 11. Domain Interests Badges
  const selectedInterests = interests.length > 0 ? interests.slice(0, 4) : ['AR/VR RESEARCH', 'SPATIAL COMPUTING'];
  let pillX = 52;
  const pillY = 405;

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('DOMAIN FOCUS:', 52, 398);

  selectedInterests.forEach((interest) => {
    const text = interest.toUpperCase();
    ctx.font = 'bold 11px monospace';
    const textW = ctx.measureText(text).width;
    const boxW = textW + 16;

    if (pillX + boxW < w - 60) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1;
      ctx.fillRect(pillX, pillY, boxW, 22);
      ctx.strokeRect(pillX, pillY, boxW, 22);

      ctx.fillStyle = '#38bdf8';
      ctx.fillText(text, pillX + 8, pillY + 15);
      pillX += boxW + 8;
    }
  });

  // 12. Submission Status Banner (Verified state vs Live Preview)
  const bannerY = 448;
  const bannerH = 50;

  if (isSubmitted) {
    // Emerald / Cyan Verified Dossier Strip
    const bannerGrad = ctx.createLinearGradient(48, bannerY, w - 48, bannerY);
    bannerGrad.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
    bannerGrad.addColorStop(1, 'rgba(6, 182, 212, 0.22)');
    ctx.fillStyle = bannerGrad;
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.fillRect(48, bannerY, w - 96, bannerH);
    ctx.strokeRect(48, bannerY, w - 96, bannerH);

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('✓ APPLICATION LODGED // SECURE DOSSIER RECEIVED', 66, bannerY + 22);

    const refNum = registerNumber.trim() ? registerNumber.toUpperCase().slice(-6) : '842911';
    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`DOSSIER REF: #COE-2026-${refNum} • FACULTY ADMISSIONS COMMITTEE QUEUED`, 66, bannerY + 40);
  } else {
    // Live Synchronized Preview Strip
    ctx.fillStyle = 'rgba(0, 245, 255, 0.06)';
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.28)';
    ctx.lineWidth = 1;
    ctx.fillRect(48, bannerY, w - 96, bannerH);
    ctx.strokeRect(48, bannerY, w - 96, bannerH);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('● LIVE PREVIEW WAFER // REAL-TIME FORM SYNCHRONIZATION ACTIVE', 66, bannerY + 22);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('STATUS: PENDING CANDIDATE SUBMISSION • COMPLETE ALL REQUIRED FIELDS', 66, bannerY + 40);
  }

  // 13. Security Barcode & Digital Hash Footer
  ctx.fillStyle = '#ffffff';
  for (let b = 52; b < w - 52; b += 12) {
    const bw = b % 24 === 0 ? 5 : 2;
    ctx.fillRect(b, h - 86, bw, 32);
  }

  // Security hash digest
  const hashSeed = (fullName.length * 3137 + registerNumber.length * 941 + 10492) % 0xffffff;
  const hashStr = `0x${hashSeed.toString(16).toUpperCase().padStart(6, '0')}`;
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(
    `TOKEN: SHA256-${hashStr} // BIOMETRIC VERIFIED // TAMPER-RESISTANT WAFER // ARVR-COE-IDENTITY-SYSTEM`,
    52,
    h - 36
  );
}

export default function StudentHoloKeycard3D({
  fullName,
  registerNumber,
  department = 'Computer Science and Engineering',
  year = '2nd Year',
  section = 'A',
  email = '',
  interests = [],
  experienceLevel = 'New to XR',
  isSubmitted = false,
}: StudentHoloKeycard3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvas2DRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const zoomRef = useRef<(action: 'in' | 'out' | 'reset') => void>(() => {});
  const [isMobile, setIsMobile] = useState(false);

  // Keep a ref to the latest props so the mount effect always draws with current data
  const propsRef = useRef<StudentHoloKeycard3DProps>({
    fullName,
    registerNumber,
    department,
    year,
    section,
    email,
    interests,
    experienceLevel,
    isSubmitted,
  });

  propsRef.current = {
    fullName,
    registerNumber,
    department,
    year,
    section,
    email,
    interests,
    experienceLevel,
    isSubmitted,
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Redraw 2D Canvas Texture whenever ANY form field or submitted status changes
  useEffect(() => {
    const canvas = canvas2DRef.current;
    if (!canvas) return;

    drawKeycardOnCanvas(canvas, {
      fullName,
      registerNumber,
      department,
      year,
      section,
      email,
      interests,
      experienceLevel,
      isSubmitted,
    });

    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }
  }, [fullName, registerNumber, department, year, section, email, interests, experienceLevel, isSubmitted]);

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
    renderer.toneMappingExposure = 1.0; // Natural standard exposure (prevents white-out glare)
    container.appendChild(renderer.domElement);

    // 2. Offscreen 2D Canvas Texture (1024x640)
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 1024;
    offscreenCanvas.height = 640;
    canvas2DRef.current = offscreenCanvas;

    // CRITICAL: Draw the student's data immediately upon canvas creation!
    // This ensures that when the card mounts (including on the post-submission screen),
    // it is never blank or empty for even a single frame.
    drawKeycardOnCanvas(offscreenCanvas, propsRef.current);

    const texture = new THREE.CanvasTexture(offscreenCanvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    textureRef.current = texture;

    // 3. Card 3D Geometry & Material (Natural Semi-Gloss Polycarbonate Wafer)
    const cardGeo = new THREE.BoxGeometry(3.8, 2.38, 0.05);
    const cardMat = new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.32,
      metalness: 0.1,
      clearcoat: 0.35,
      clearcoatRoughness: 0.18,
      reflectivity: 0.55,
      // Subtle ambient emissive (deep obsidian navy) to preserve contrast without glare
      emissive: new THREE.Color(0x020814),
      emissiveIntensity: 0.2,
    });
    const cardMesh = new THREE.Mesh(cardGeo, cardMat);
    scene.add(cardMesh);

    // Clean Cyber Border
    const edges = new THREE.EdgesGeometry(cardGeo);
    const borderMat = new THREE.LineBasicMaterial({
      color: isSubmitted ? 0x10b981 : 0x00f5ff,
      transparent: true,
      opacity: 0.6,
    });
    const border = new THREE.LineSegments(edges, borderMat);
    cardMesh.add(border);

    // 4. Natural Studio Lighting Rig (Balanced Luminance, Zero Specular Washout)
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);

    const frontDir = new THREE.DirectionalLight(0xffffff, 1.1);
    frontDir.position.set(2, 3, 5);
    scene.add(frontDir);

    const cyanPoint = new THREE.PointLight(0x00f5ff, 0.8, 14);
    cyanPoint.position.set(-3, 2, 4);
    scene.add(cyanPoint);

    const violetPoint = new THREE.PointLight(0x8b5cf6, 0.5, 14);
    violetPoint.position.set(3, -2, 3);
    scene.add(violetPoint);

    // 5. Interactive Mouse Parallax & Zoom Controls
    let targetRotX = 0;
    let targetRotY = 0;
    let targetCamZ = 5.8;
    const minCamZ = 3.2; // Zoomed in
    const maxCamZ = 8.5; // Zoomed out

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.35;
      targetRotX = -y * 0.25;
    };
    container.addEventListener('mousemove', onMouseMove);

    const onMouseLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
    };
    container.addEventListener('mouseleave', onMouseLeave);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetCamZ = THREE.MathUtils.clamp(targetCamZ + e.deltaY * 0.005, minCamZ, maxCamZ);
    };
    container.addEventListener('wheel', onWheel, { passive: false });

    zoomRef.current = (action: 'in' | 'out' | 'reset') => {
      if (action === 'in') {
        targetCamZ = Math.max(minCamZ, targetCamZ - 0.75);
      } else if (action === 'out') {
        targetCamZ = Math.min(maxCamZ, targetCamZ + 0.75);
      } else if (action === 'reset') {
        targetCamZ = 5.8;
      }
    };

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

    // 6. Animation Loop (Smooth floating bob + lerp to mouse & zoom)
    let animId: number;
    const timer = new THREE.Timer();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      timer.update();
      const elapsed = timer.getElapsed();

      // Gentle floating bob
      cardMesh.position.y = Math.sin(elapsed * 1.6) * 0.05;

      // Smooth lerp to mouse rotation
      cardMesh.rotation.y = THREE.MathUtils.lerp(cardMesh.rotation.y, targetRotY, 0.08);
      cardMesh.rotation.x = THREE.MathUtils.lerp(cardMesh.rotation.x, targetRotX, 0.08);

      // Smooth camera zoom lerp
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.1);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      timer.dispose();
      renderer.dispose();
      texture.dispose();
      cardGeo.dispose();
      cardMat.dispose();
      edges.dispose();
      borderMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isMobile, isSubmitted]);

  // Mobile Clean Fallback Display
  if (isMobile) {
    return (
      <div
        style={{
          width: '100%',
          padding: '24px 20px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, rgba(6, 12, 24, 0.95), rgba(14, 23, 54, 0.95))',
          border: isSubmitted ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(0, 245, 255, 0.35)',
          marginBottom: '24px',
          boxShadow: isSubmitted ? '0 0 28px rgba(16, 185, 129, 0.3)' : '0 0 24px rgba(0, 245, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: isSubmitted ? 'var(--accent-emerald, #10b981)' : 'var(--accent-cyan)' }}>
            HOLO_KEYCARD // {isSubmitted ? 'ADMISSION DOSSIER LOGGED' : 'LIVE PREVIEW'}
          </span>
          <span className={`badge ${isSubmitted ? 'badge-emerald' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
            {isSubmitted ? '✓ DISPATCHED' : 'SYNCHRONIZED'}
          </span>
        </div>

        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            APPLICANT NAME
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {fullName.trim() || 'CANDIDATE NAME'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>REGISTRATION ID</div>
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{registerNumber.trim() || 'PENDING'}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>LEVEL</div>
            <div style={{ color: 'var(--accent-violet)', fontWeight: 700 }}>{experienceLevel.toUpperCase()}</div>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          <div>{department || 'Computer Science and Engineering'}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
            {year || '2nd Year'} • Sec {section || 'A'}
          </div>
        </div>

        {interests.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
            {interests.slice(0, 4).map((item) => (
              <span key={item} className="badge badge-cyan" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
                {item}
              </span>
            ))}
          </div>
        )}
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
        background: 'radial-gradient(circle at center, rgba(0, 245, 255, 0.08) 0%, var(--surface-card) 100%)',
        border: isSubmitted ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-glass)',
        overflow: 'hidden',
        marginBottom: '24px',
        boxShadow: isSubmitted ? '0 0 32px rgba(16, 185, 129, 0.25)' : 'var(--shadow-card)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
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
          <span
            className="beacon-dot"
            style={{
              backgroundColor: isSubmitted ? '#10b981' : undefined,
              boxShadow: isSubmitted ? '0 0 8px #10b981' : undefined,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: isSubmitted ? '#10b981' : 'var(--accent-cyan)',
              letterSpacing: '0.08em',
            }}
          >
            HOLO_KEYCARD // {isSubmitted ? 'VERIFIED_DOSSIER' : 'LIVE_RENDER'}
          </span>
        </div>
        <span
          className={`badge ${isSubmitted ? 'badge-emerald' : 'badge-cyan'}`}
          style={{
            fontSize: '0.65rem',
            padding: '2px 8px',
            background: isSubmitted ? 'rgba(16, 185, 129, 0.15)' : undefined,
            color: isSubmitted ? '#10b981' : undefined,
            borderColor: isSubmitted ? 'rgba(16, 185, 129, 0.4)' : undefined,
          }}
        >
          {isSubmitted ? '✓ ADMISSION LODGED' : 'NATURAL PBR WAFER'}
        </span>
      </div>

      {/* Bottom Telemetry & Zoom Controls Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.68rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          zIndex: 10,
        }}
      >
        <span style={{ pointerEvents: 'none' }}>
          STATUS: {isSubmitted ? 'SUBMISSION_VERIFIED_IN_DATABASE' : 'SYNCHRONIZED_WITH_INPUTS'}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: isSubmitted ? '#10b981' : 'var(--accent-cyan)', pointerEvents: 'none' }}>
            SCROLL TO ZOOM
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              onClick={() => zoomRef.current('in')}
              title="Zoom In"
              style={{
                background: 'rgba(0, 245, 255, 0.12)',
                border: '1px solid rgba(0, 245, 255, 0.35)',
                color: 'var(--accent-cyan)',
                borderRadius: '4px',
                width: '22px',
                height: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              +
            </button>
            <button
              type="button"
              onClick={() => zoomRef.current('out')}
              title="Zoom Out"
              style={{
                background: 'rgba(0, 245, 255, 0.12)',
                border: '1px solid rgba(0, 245, 255, 0.35)',
                color: 'var(--accent-cyan)',
                borderRadius: '4px',
                width: '22px',
                height: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              -
            </button>
            <button
              type="button"
              onClick={() => zoomRef.current('reset')}
              title="Reset Zoom"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'var(--text-secondary)',
                borderRadius: '4px',
                padding: '2px 6px',
                height: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.62rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
              }}
            >
              RESET
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
