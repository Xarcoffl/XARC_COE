'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Trophy, Award, FileText, Sparkles, RotateCcw, Box, ShieldCheck } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

type TrophyType = 'hackathon' | 'patent' | 'fellowship' | 'industry';

interface TrophySpec {
  id: TrophyType;
  title: string;
  badge: string;
  count: string;
  label: string;
  description: string;
  colorHex: number;
  accentHex: number;
}

const TROPHY_SPECS: TrophySpec[] = [
  {
    id: 'hackathon',
    title: 'National Hackathon Champion Trophy',
    badge: '1ST PODIUM FINISH',
    count: '15+ WINS',
    label: 'NATIONAL HACKATHONS',
    description: 'Gold-plated crystalline pedestal commemorating 1st place finishes in Smart India Hackathon & National XR Design Sprints.',
    colorHex: 0xffd700,
    accentHex: 0xffaa00,
  },
  {
    id: 'patent',
    title: 'Intellectual Property Patent Seal',
    badge: 'GOVT CERTIFIED',
    count: '3 PATENTS',
    label: 'PUBLISHED PATENTS',
    description: 'Dual-ring cryptographic seal and optical crystal matrix representing published spatial computing patents.',
    colorHex: 0x38bdf8,
    accentHex: 0x00f5ff,
  },
  {
    id: 'fellowship',
    title: 'XR Innovation Fellowship Award',
    badge: 'HONORARY CITATION',
    count: '14 INTERNS',
    label: 'INDUSTRY HONORS',
    description: 'Prismatic silver obelisk awarded for breakthrough research in stereoscopic shaders and real-time mesh optimization.',
    colorHex: 0xa855f7,
    accentHex: 0xc084fc,
  },
  {
    id: 'industry',
    title: 'Enterprise Alliances Seal',
    badge: 'STRATEGIC PARTNERS',
    count: '6 ALLIANCES',
    label: 'GLOBAL CONSORTIUM',
    description: 'Interlocking geometric gyro rings signifying active R&D MoUs with leading immersive technology corporations.',
    colorHex: 0x4ade80,
    accentHex: 0x22c55e,
  },
];

export default function AchievementsTrophy3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeTrophy, setActiveTrophy] = useState<TrophyType>('hackathon');
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activeTrophyRef = useRef<TrophyType>('hackathon');
  const wireframeRef = useRef(false);
  const autoRotateRef = useRef(true);

  useEffect(() => {
    activeTrophyRef.current = activeTrophy;
  }, [activeTrophy]);

  useEffect(() => {
    wireframeRef.current = wireframe;
  }, [wireframe]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    if (isMobile || !mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth || 800;
    let height = container.clientHeight || 450;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060814, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 60);
    camera.position.set(0, 2.2, 6.8);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // 2. Lighting Rig
    const ambient = new THREE.AmbientLight(0x0f172a, 3.2);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0xffffff, 5.0, 30);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x00f5ff, 3.5, 25);
    fillLight.position.set(-5, -2, 4);
    scene.add(fillLight);

    const topSpot = new THREE.SpotLight(0xffd700, 4.0, 20, Math.PI / 4, 0.3);
    topSpot.position.set(0, 6, 0);
    scene.add(topSpot);

    // 3. Holographic Stage Base
    const baseGroup = new THREE.Group();
    scene.add(baseGroup);

    const pedestalGeo = new THREE.CylinderGeometry(2.2, 2.6, 0.4, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.9,
      roughness: 0.15,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.5;
    baseGroup.add(pedestal);

    const neonRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.22, 0.035, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0xffd700 })
    );
    neonRing.rotation.x = Math.PI / 2;
    neonRing.position.y = -1.3;
    baseGroup.add(neonRing);

    const grid = new THREE.GridHelper(10, 20, 0x38bdf8, 0x1e293b);
    grid.position.y = -1.72;
    scene.add(grid);

    // 4. Trophy Groups
    const masterTrophyHolder = new THREE.Group();
    scene.add(masterTrophyHolder);

    const trophyMeshes: {
      [key in TrophyType]: {
        group: THREE.Group;
        materials: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[];
        rotSpeed: number;
      };
    } = {
      hackathon: { group: new THREE.Group(), materials: [], rotSpeed: 0.01 },
      patent: { group: new THREE.Group(), materials: [], rotSpeed: 0.008 },
      fellowship: { group: new THREE.Group(), materials: [], rotSpeed: 0.012 },
      industry: { group: new THREE.Group(), materials: [], rotSpeed: 0.009 },
    };

    // A. Hackathon Trophy (Gold Cup & Radiant Star)
    {
      const grp = trophyMeshes.hackathon.group;
      const mats = trophyMeshes.hackathon.materials;

      // Base Stem
      const stemGeo = new THREE.CylinderGeometry(0.2, 0.5, 1.2, 16);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.95,
        roughness: 0.12,
        emissive: 0x332200,
      });
      const stem = new THREE.Mesh(stemGeo, goldMat);
      stem.position.y = -0.5;
      grp.add(stem);
      mats.push(goldMat);

      // Cup Bowl
      const bowlGeo = new THREE.CylinderGeometry(1.1, 0.3, 1.3, 24);
      const bowl = new THREE.Mesh(bowlGeo, goldMat);
      bowl.position.y = 0.55;
      grp.add(bowl);

      // Winged Handles
      for (let s = -1; s <= 1; s += 2) {
        const handleGeo = new THREE.TorusGeometry(0.65, 0.07, 16, 32, Math.PI);
        const handle = new THREE.Mesh(handleGeo, goldMat);
        handle.position.set(s * 1.05, 0.5, 0);
        handle.rotation.z = s * (Math.PI / 2);
        grp.add(handle);
      }

      // Floating Holographic Star Crest
      const starGeo = new THREE.OctahedronGeometry(0.45, 0);
      const starMat = new THREE.MeshPhysicalMaterial({
        color: 0x00f5ff,
        transmission: 0.85,
        roughness: 0.05,
        emissive: 0x002244,
      });
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.y = 1.6;
      grp.add(star);
      mats.push(starMat);

      masterTrophyHolder.add(grp);
    }

    // B. Patent Seal (Dual-Ring Rotating Patent Seal)
    {
      const grp = trophyMeshes.patent.group;
      const mats = trophyMeshes.patent.materials;

      // Outer Gear / Seal Rim
      const sealOuterGeo = new THREE.TorusGeometry(1.4, 0.12, 16, 64);
      const sealMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.9,
        roughness: 0.15,
        emissive: 0x072844,
      });
      const sealOuter = new THREE.Mesh(sealOuterGeo, sealMat);
      grp.add(sealOuter);
      mats.push(sealMat);

      // Inner Floating Prism Core
      const innerPrismGeo = new THREE.IcosahedronGeometry(0.75, 0);
      const innerPrismMat = new THREE.MeshPhysicalMaterial({
        color: 0x00f5ff,
        transmission: 0.85,
        opacity: 0.9,
        roughness: 0.08,
      });
      const innerPrism = new THREE.Mesh(innerPrismGeo, innerPrismMat);
      grp.add(innerPrism);
      mats.push(innerPrismMat);

      // Orbiting Cryptographic Nodes
      for (let n = 0; n < 6; n++) {
        const angle = (n / 6) * Math.PI * 2;
        const node = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        node.position.set(Math.cos(angle) * 1.4, Math.sin(angle) * 1.4, 0);
        grp.add(node);
      }

      grp.position.y = 0.4;
      masterTrophyHolder.add(grp);
    }

    // C. Fellowship Award (Prismatic Violet & Cyan Crystal Obelisk)
    {
      const grp = trophyMeshes.fellowship.group;
      const mats = trophyMeshes.fellowship.materials;

      // Crystal Obelisk
      const obeliskGeo = new THREE.ConeGeometry(0.85, 2.4, 4);
      const obeliskMat = new THREE.MeshPhysicalMaterial({
        color: 0xa855f7,
        transmission: 0.88,
        roughness: 0.1,
        metalness: 0.2,
        opacity: 0.92,
      });
      const obelisk = new THREE.Mesh(obeliskGeo, obeliskMat);
      obelisk.position.y = 0.5;
      grp.add(obelisk);
      mats.push(obeliskMat);

      // Inverted Base Cone
      const invGeo = new THREE.ConeGeometry(0.85, 0.8, 4);
      const invMat = new THREE.MeshStandardMaterial({
        color: 0x1e1b4b,
        metalness: 0.8,
        roughness: 0.2,
      });
      const inv = new THREE.Mesh(invGeo, invMat);
      inv.rotation.x = Math.PI;
      inv.position.y = -0.7;
      grp.add(inv);
      mats.push(invMat);

      // Rotating Halo
      const haloGeo = new THREE.TorusGeometry(1.2, 0.03, 16, 48);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 3;
      halo.position.y = 0.6;
      grp.add(halo);

      grp.position.y = 0.3;
      masterTrophyHolder.add(grp);
    }

    // D. Industry Seal (Interlocking Emerald Gyro Rings)
    {
      const grp = trophyMeshes.industry.group;
      const mats = trophyMeshes.industry.materials;

      // Ring 1
      const r1Geo = new THREE.TorusGeometry(1.2, 0.08, 16, 48);
      const r1Mat = new THREE.MeshStandardMaterial({ color: 0x4ade80, metalness: 0.9, roughness: 0.15 });
      const r1 = new THREE.Mesh(r1Geo, r1Mat);
      grp.add(r1);
      mats.push(r1Mat);

      // Ring 2
      const r2Geo = new THREE.TorusGeometry(0.9, 0.07, 16, 48);
      const r2Mat = new THREE.MeshStandardMaterial({ color: 0x22c55e, metalness: 0.85, roughness: 0.2 });
      const r2 = new THREE.Mesh(r2Geo, r2Mat);
      r2.rotation.x = Math.PI / 2;
      grp.add(r2);
      mats.push(r2Mat);

      // Core Gem
      const gemGeo = new THREE.DodecahedronGeometry(0.5, 0);
      const gemMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, roughness: 0.05 });
      const gem = new THREE.Mesh(gemGeo, gemMat);
      grp.add(gem);
      mats.push(gemMat);

      grp.position.y = 0.4;
      masterTrophyHolder.add(grp);
    }

    // 5. Golden Particle Dust
    const particleCount = 140;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 6;
      pPos[i + 1] = Math.random() * 3.5 - 1.2;
      pPos[i + 2] = (Math.random() - 0.5) * 6;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // 6. Interactive Drag Orbit
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
      masterTrophyHolder.rotation.y += deltaX * 0.008;
      camera.position.y = Math.max(1.0, Math.min(4.5, camera.position.y - deltaY * 0.01));
      camera.lookAt(0, 0.2, 0);
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

    // Touch events for mobile
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
      masterTrophyHolder.rotation.y += deltaX * 0.008;
      camera.position.y = Math.max(1.0, Math.min(4.5, camera.position.y - deltaY * 0.01));
      camera.lookAt(0, 0.2, 0);
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
      height = mountRef.current.clientHeight || 450;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // 7. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Show only active trophy with smooth fade/scale
      const cur = activeTrophyRef.current;
      const activeSpec = TROPHY_SPECS.find((s) => s.id === cur) || TROPHY_SPECS[0];

      (Object.keys(trophyMeshes) as TrophyType[]).forEach((key) => {
        const item = trophyMeshes[key];
        const isActive = key === cur;

        const targetScale = isActive ? 1.0 : 0.001;
        item.group.scale.lerp(new THREE.Vector2(targetScale, targetScale) as any, 0.1);
        item.group.visible = item.group.scale.x > 0.05;

        if (isActive) {
          if (autoRotateRef.current && !isDragging) {
            item.group.rotation.y += item.rotSpeed;
          }
          item.group.position.y = 0.3 + Math.sin(elapsed * 1.8) * 0.08;

          // Wireframe state
          item.materials.forEach((m) => {
            m.wireframe = wireframeRef.current;
          });
        }
      });

      // Update light & ring color to match active spec
      topSpot.color.lerp(new THREE.Color(activeSpec.colorHex), 0.06);
      neonRing.material.color.lerp(new THREE.Color(activeSpec.accentHex), 0.06);
      pMat.color.lerp(new THREE.Color(activeSpec.colorHex), 0.06);

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
  }, []);

  const curSpec = TROPHY_SPECS.find((s) => s.id === activeTrophy) || TROPHY_SPECS[0];

  return (
    <div style={{ marginBottom: '56px' }}>
      {/* Category Tabs Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {TROPHY_SPECS.map((spec) => (
            <button
              key={spec.id}
              onClick={() => {
                setActiveTrophy(spec.id);
                soundFx.playHoloActivate();
              }}
              className={`tab-btn ${activeTrophy === spec.id ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                fontSize: '0.85rem',
                border: activeTrophy === spec.id ? `1px solid ${spec.id === 'hackathon' ? '#ffd700' : 'var(--accent-cyan)'}` : '1px solid rgba(76, 125, 255, 0.2)',
              }}
            >
              {spec.id === 'hackathon' && <Trophy size={16} style={{ color: '#ffd700' }} />}
              {spec.id === 'patent' && <ShieldCheck size={16} style={{ color: '#38bdf8' }} />}
              {spec.id === 'fellowship' && <Award size={16} style={{ color: '#c084fc' }} />}
              {spec.id === 'industry' && <Sparkles size={16} style={{ color: '#4ade80' }} />}
              <span>{spec.label}</span>
            </button>
          ))}
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
          // 3D_PODIUM_INSPECTOR_ACTIVE
        </div>
      </div>

      {/* Mobile Trophy Card or 3D Holographic Display Pod */}
      {isMobile ? (
        <div
          style={{
            width: '100%',
            padding: '24px 20px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              className="badge"
              style={{
                background: 'rgba(255, 215, 0, 0.15)',
                border: '1px solid #ffd700',
                color: '#ffd700',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              {curSpec.count}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#ffd700' }}>
              {curSpec.badge}
            </span>
          </div>

          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {curSpec.title}
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
            {curSpec.description}
          </p>
        </div>
      ) : (
        /* 3D Holographic Display Pod (Desktop/Tablet) */
        <div
          style={{
            width: '100%',
            height: '460px',
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.05) 0%, var(--surface-card) 100%)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            cursor: 'grab',
          }}
        >
          {/* Three.js Canvas Mount */}
          <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

          {/* Top Header Overlay */}
          <div
            style={{
              position: 'absolute',
              top: '18px',
              left: '20px',
              right: '20px',
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
                  fontSize: '0.8rem',
                  color: '#ffd700',
                  letterSpacing: '0.12em',
                  textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
                }}
              >
                HALL OF HONORS // {curSpec.badge}
              </span>
            </div>

            <span
              className="badge"
              style={{
                background: 'rgba(255, 215, 0, 0.15)',
                border: '1px solid #ffd700',
                color: '#ffd700',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              {curSpec.count}
            </span>
          </div>

          {/* Floating Specimen Description Card (Left Bottom) */}
          <div
            style={{
              position: 'absolute',
              bottom: '72px',
              left: '20px',
              maxWidth: '380px',
              background: 'var(--surface-card)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 215, 0, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              pointerEvents: 'none',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {curSpec.title}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {curSpec.description}
            </div>
          </div>

          {/* Interactive Controls Overlay Toolbar (Bottom) */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '20px',
              right: '20px',
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
                  background: autoRotate ? 'rgba(255, 215, 0, 0.18)' : 'var(--surface-card-alt)',
                  border: autoRotate ? '1px solid #ffd700' : '1px solid var(--border-subtle)',
                  color: autoRotate ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                <RotateCcw size={14} style={{ marginRight: '6px' }} />
                <span>{autoRotate ? 'PAUSE ROTATION' : 'ORBIT'}</span>
              </button>

              <button
                onClick={() => setWireframe(!wireframe)}
                className="tab-btn"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  background: wireframe ? 'rgba(255, 215, 0, 0.18)' : 'var(--surface-card-alt)',
                  border: wireframe ? '1px solid #ffd700' : '1px solid var(--border-subtle)',
                  color: wireframe ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                <Box size={14} style={{ marginRight: '6px' }} />
                <span>{wireframe ? 'SOLID' : 'WIREFRAME'}</span>
              </button>
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              DRAG TO INSPECT 360° // PULL TO TILT
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
