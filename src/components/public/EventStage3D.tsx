'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, Box, Zap, Sparkles, Sun, Radio } from 'lucide-react';

interface EventStage3DProps {
  category: string;
  title: string;
  status?: string;
  startDate?: string;
}

export default function EventStage3D({ category, title, status = 'upcoming', startDate }: EventStage3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [lightPreset, setLightPreset] = useState<'cyan' | 'magenta' | 'amber'>('cyan');
  const [beamsActive, setBeamsActive] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const wireframeRef = useRef(false);
  const lightPresetRef = useRef<'cyan' | 'magenta' | 'amber'>('cyan');
  const beamsActiveRef = useRef(true);
  const autoRotateRef = useRef(true);

  useEffect(() => {
    wireframeRef.current = wireframe;
  }, [wireframe]);

  useEffect(() => {
    lightPresetRef.current = lightPreset;
  }, [lightPreset]);

  useEffect(() => {
    beamsActiveRef.current = beamsActive;
  }, [beamsActive]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    if (isMobile || !mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth || 800;
    let height = container.clientHeight || 460;

    // 1. Scene, Fog, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060814, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 70);
    camera.position.set(0, 3.2, 7.8);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0x0f172a, 3.2);
    scene.add(ambientLight);

    const mainSpot = new THREE.SpotLight(0x00f5ff, 5.0, 30, Math.PI / 4, 0.3, 1);
    mainSpot.position.set(0, 8, 2);
    scene.add(mainSpot);

    const rimLightLeft = new THREE.PointLight(0x8a2be2, 4.0, 25);
    rimLightLeft.position.set(-6, 3, -4);
    scene.add(rimLightLeft);

    const rimLightRight = new THREE.PointLight(0x00ffff, 4.0, 25);
    rimLightRight.position.set(6, 3, -4);
    scene.add(rimLightRight);

    // 3. Stage Master Group
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const materials: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[] = [];

    // Stage Tier 1 (Lowest broad base)
    const baseGeo = new THREE.CylinderGeometry(3.6, 4.0, 0.35, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.85,
      roughness: 0.25,
    });
    const stageBase = new THREE.Mesh(baseGeo, baseMat);
    stageBase.position.y = -1.2;
    stageGroup.add(stageBase);
    materials.push(baseMat);

    // Stage Tier 2 (Inner elevated podium)
    const tier2Geo = new THREE.CylinderGeometry(2.6, 2.8, 0.35, 36);
    const tier2Mat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.15,
    });
    const stageTier2 = new THREE.Mesh(tier2Geo, tier2Mat);
    stageTier2.position.y = -0.85;
    stageGroup.add(stageTier2);
    materials.push(tier2Mat);

    // Stage Tier 3 (Glass Core platform)
    const corePlateGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.15, 32);
    const corePlateMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f5ff,
      transmission: 0.85,
      opacity: 0.8,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
    });
    const corePlate = new THREE.Mesh(corePlateGeo, corePlateMat);
    corePlate.position.y = -0.65;
    stageGroup.add(corePlate);
    materials.push(corePlateMat);

    // Neon Concentric Rims
    const rim1 = new THREE.Mesh(
      new THREE.TorusGeometry(3.65, 0.03, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x00ffff })
    );
    rim1.rotation.x = Math.PI / 2;
    rim1.position.y = -1.02;
    stageGroup.add(rim1);

    const rim2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.65, 0.035, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x8a2be2 })
    );
    rim2.rotation.x = Math.PI / 2;
    rim2.position.y = -0.67;
    stageGroup.add(rim2);

    // Floor Radar Grid
    const grid = new THREE.GridHelper(12, 24, 0x00ffff, 0x1e293b);
    grid.position.y = -1.38;
    scene.add(grid);

    // 4. Volumetric Light Beams around the perimeter
    const beamGroup = new THREE.Group();
    stageGroup.add(beamGroup);

    const beamMeshes: THREE.Mesh[] = [];
    const beamCount = 4;
    for (let b = 0; b < beamCount; b++) {
      const angle = (b / beamCount) * Math.PI * 2;
      const bRadius = 2.9;
      const coneGeo = new THREE.ConeGeometry(0.35, 6, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(Math.cos(angle) * bRadius, 1.8, Math.sin(angle) * bRadius);
      // Slight inward tilt
      cone.lookAt(0, 4, 0);
      beamGroup.add(cone);
      beamMeshes.push(cone);
    }

    // 5. Central Levitating Specimen
    const specimenGroup = new THREE.Group();
    specimenGroup.position.y = 0.55;
    stageGroup.add(specimenGroup);

    const isHackathon = category.toLowerCase().includes('hackathon') || category.toLowerCase().includes('competition');
    const isWorkshop = category.toLowerCase().includes('workshop') || category.toLowerCase().includes('bootcamp');

    let dynamicMesh: THREE.Object3D;

    if (isHackathon) {
      // 3D Grand Hackathon Trophy
      const trophyGroup = new THREE.Group();

      // Golden Trophy Chalice / Gem Core
      const chaliceGeo = new THREE.OctahedronGeometry(0.95, 1);
      const chaliceMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.95,
        roughness: 0.15,
        emissive: 0x332200,
      });
      const chalice = new THREE.Mesh(chaliceGeo, chaliceMat);
      trophyGroup.add(chalice);
      materials.push(chaliceMat);

      // Levitating Wing Crests
      for (let side = -1; side <= 1; side += 2) {
        const wingGeo = new THREE.TorusGeometry(0.85, 0.08, 16, 32, Math.PI * 0.9);
        const wingMat = new THREE.MeshStandardMaterial({ color: 0x00f5ff, metalness: 0.8, roughness: 0.2 });
        const wing = new THREE.Mesh(wingGeo, wingMat);
        wing.position.set(side * 0.8, 0, 0);
        wing.rotation.y = side * 0.25;
        trophyGroup.add(wing);
        materials.push(wingMat);
      }

      // Floating Particle Crown
      const crownGeo = new THREE.RingGeometry(1.2, 1.25, 32);
      const crownMat = new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.rotation.x = Math.PI / 2;
      crown.position.y = 0.9;
      trophyGroup.add(crown);

      dynamicMesh = trophyGroup;
      specimenGroup.add(trophyGroup);
    } else if (isWorkshop) {
      // Spatial Computing Matrix & Visor Prism
      const wsGroup = new THREE.Group();

      const cubeGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
      const cubeMat = new THREE.MeshPhysicalMaterial({
        color: 0x00f5ff,
        transmission: 0.8,
        opacity: 0.85,
        roughness: 0.1,
        metalness: 0.2,
      });
      const cube = new THREE.Mesh(cubeGeo, cubeMat);
      wsGroup.add(cube);
      materials.push(cubeMat);

      const innerOctGeo = new THREE.OctahedronGeometry(0.7, 0);
      const innerOctMat = new THREE.MeshStandardMaterial({ color: 0x8a2be2, metalness: 0.9, roughness: 0.1 });
      const innerOct = new THREE.Mesh(innerOctGeo, innerOctMat);
      wsGroup.add(innerOct);
      materials.push(innerOctMat);

      // Gyroscopic Outer Rings
      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.03, 16, 48), new THREE.MeshBasicMaterial({ color: 0x00f5ff }));
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.03, 16, 48), new THREE.MeshBasicMaterial({ color: 0x8a2be2 }));
      ring1.rotation.x = Math.PI / 3;
      ring2.rotation.y = Math.PI / 4;
      wsGroup.add(ring1);
      wsGroup.add(ring2);

      dynamicMesh = wsGroup;
      specimenGroup.add(wsGroup);
    } else {
      // Futuristic Keynote Monolith & Spatial Beacon
      const monoGroup = new THREE.Group();

      const monoGeo = new THREE.CylinderGeometry(0.7, 0.9, 1.9, 6);
      const monoMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.9,
        roughness: 0.15,
      });
      const mono = new THREE.Mesh(monoGeo, monoMat);
      monoGroup.add(mono);
      materials.push(monoMat);

      // Glowing Core Aperture
      const orbGeo = new THREE.SphereGeometry(0.5, 32, 32);
      const orbMat = new THREE.MeshPhysicalMaterial({
        color: 0x00f5ff,
        transmission: 0.85,
        roughness: 0.05,
        emissive: 0x003366,
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.y = 1.35;
      monoGroup.add(orb);
      materials.push(orbMat);

      // Beacon beam shooting up
      const beaconBeamGeo = new THREE.CylinderGeometry(0.08, 0.4, 8, 16, 1, true);
      const beaconBeamMat = new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      const beaconBeam = new THREE.Mesh(beaconBeamGeo, beaconBeamMat);
      beaconBeam.position.y = 4.5;
      monoGroup.add(beaconBeam);

      dynamicMesh = monoGroup;
      specimenGroup.add(monoGroup);
    }

    // 6. Expanding Audio-reactive Pulse Rings from Stage
    const pulseRingGeo = new THREE.RingGeometry(0.5, 0.6, 48);
    const pulseRingMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat);
    pulseRing.rotation.x = Math.PI / 2;
    pulseRing.position.y = -0.63;
    stageGroup.add(pulseRing);

    // 7. Ambient Twinkling Cosmic Sparkles
    const particleCount = 120;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 8;
      pPos[i + 1] = Math.random() * 4 - 1;
      pPos[i + 2] = (Math.random() - 0.5) * 8;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00f5ff,
      size: 0.055,
      transparent: true,
      opacity: 0.65,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // 8. Drag to Orbit Interactions
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
      stageGroup.rotation.y += deltaX * 0.008;
      camera.position.y = Math.max(1.5, Math.min(5.5, camera.position.y - deltaY * 0.01));
      camera.lookAt(0, 0.4, 0);
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
      stageGroup.rotation.y += deltaX * 0.008;
      camera.position.y = Math.max(1.5, Math.min(5.5, camera.position.y - deltaY * 0.01));
      camera.lookAt(0, 0.4, 0);
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

    // 9. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();
    let pulseScale = 1;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Auto rotation
      if (autoRotateRef.current && !isDragging) {
        stageGroup.rotation.y += 0.006;
      }

      // Specimen floating & inner rotation
      if (dynamicMesh) {
        dynamicMesh.rotation.y += 0.012;
        specimenGroup.position.y = 0.55 + Math.sin(elapsed * 2) * 0.12;
      }

      // Beams rotation & visibility
      beamGroup.visible = beamsActiveRef.current;
      if (beamsActiveRef.current) {
        beamGroup.rotation.y = -elapsed * 0.3;
      }

      // Wireframe state update
      materials.forEach((m) => {
        m.wireframe = wireframeRef.current;
      });

      // Lighting Preset Color Lerp
      const currentLight = lightPresetRef.current;
      let targetHex = 0x00f5ff;
      if (currentLight === 'magenta') targetHex = 0xff007f;
      if (currentLight === 'amber') targetHex = 0xf59e0b;

      mainSpot.color.lerp(new THREE.Color(targetHex), 0.08);
      rim1.material.color.lerp(new THREE.Color(targetHex), 0.08);
      pulseRingMat.color.lerp(new THREE.Color(targetHex), 0.08);

      // Concentric Pulse Ring Animation
      pulseScale += 0.025;
      if (pulseScale > 4.5) pulseScale = 1;
      pulseRing.scale.set(pulseScale, pulseScale, 1);
      pulseRingMat.opacity = Math.max(0, 0.75 - pulseScale / 5);

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
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '10px',
        }}
      >
        <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
          {category.toUpperCase()} STAGE // {status.toUpperCase()}
        </span>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {title}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Interactive 3D stage rendering active on desktop and tablet viewports.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '480px',
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        background: 'radial-gradient(circle at center, rgba(0, 245, 255, 0.07) 0%, var(--surface-card) 100%)',
        border: '1px solid rgba(0, 245, 255, 0.35)',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        cursor: 'grab',
      }}
    >
      {/* 3D Canvas Mount */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Top HUD Overlay */}
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
            ARENA_SIMULATION // {category.toUpperCase()} STAGE
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="badge badge-cyan"
            style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <Radio size={12} className="animate-spin" />
            <span>{status.toUpperCase()}</span>
          </span>
        </div>
      </div>

      {/* Floating Telemetry Box (Center-Right overlay) */}
      <div
        style={{
          position: 'absolute',
          top: '56px',
          right: '18px',
          background: 'var(--surface-card)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 14px',
          pointerEvents: 'none',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          lineHeight: '1.4',
        }}
      >
        <div style={{ color: 'var(--text-muted)' }}>STREAM FREQ: 60 FPS WEBGL</div>
        <div style={{ color: 'var(--accent-cyan)' }}>STAGE COORDINATES: [0, 0.4, 0]</div>
      </div>

      {/* Bottom Interactive Toolbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Pause / Resume Rotation */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="tab-btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.75rem',
              background: autoRotate ? 'rgba(0, 245, 255, 0.18)' : 'var(--surface-card-alt)',
              border: autoRotate ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              color: autoRotate ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <RotateCcw size={14} style={{ marginRight: '6px' }} />
            <span>{autoRotate ? 'PAUSE ROTATION' : 'ORBIT'}</span>
          </button>

          {/* Wireframe Toggle */}
          <button
            onClick={() => setWireframe(!wireframe)}
            className="tab-btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.75rem',
              background: wireframe ? 'rgba(0, 245, 255, 0.18)' : 'var(--surface-card-alt)',
              border: wireframe ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              color: wireframe ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <Box size={14} style={{ marginRight: '6px' }} />
            <span>{wireframe ? 'SURFACE' : 'WIREFRAME'}</span>
          </button>

          {/* Volumetric Beams Toggle */}
          <button
            onClick={() => setBeamsActive(!beamsActive)}
            className="tab-btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.75rem',
              background: beamsActive ? 'rgba(138, 43, 226, 0.2)' : 'var(--surface-card-alt)',
              border: beamsActive ? '1px solid var(--accent-violet)' : '1px solid var(--border-subtle)',
              color: beamsActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <Sparkles size={14} style={{ marginRight: '6px' }} />
            <span>{beamsActive ? 'BEAMS ON' : 'BEAMS OFF'}</span>
          </button>

          {/* Ambience Preset Switcher */}
          <button
            onClick={() => {
              if (lightPreset === 'cyan') setLightPreset('magenta');
              else if (lightPreset === 'magenta') setLightPreset('amber');
              else setLightPreset('cyan');
            }}
            className="tab-btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.75rem',
              background: 'var(--surface-card-alt)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sun size={14} style={{ color: lightPreset === 'cyan' ? '#00f5ff' : lightPreset === 'magenta' ? '#ff007f' : '#f59e0b' }} />
            <span>LIGHT: {lightPreset.toUpperCase()}</span>
          </button>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          DRAG TO ORBIT // PULL TO TILT
        </div>
      </div>
    </div>
  );
}
