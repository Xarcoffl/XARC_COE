'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Link from 'next/link';
import { EventItem } from '@/lib/types';
import { Calendar, Clock, MapPin, ExternalLink, ArrowRight, RotateCcw, Box, Radio, Sparkles } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

interface EventArenaHolodeck3DProps {
  events: EventItem[];
}

export default function EventArenaHolodeck3D({ events }: EventArenaHolodeck3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const featuredEvents = events.filter((e) => e.is_featured).length > 0
    ? events.filter((e) => e.is_featured)
    : events.slice(0, 4);

  const [activeIdx, setActiveIdx] = useState(0);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activeIdxRef = useRef(0);
  const wireframeRef = useRef(false);
  const autoRotateRef = useRef(true);

  useEffect(() => {
    activeIdxRef.current = activeIdx;
  }, [activeIdx]);

  useEffect(() => {
    wireframeRef.current = wireframe;
  }, [wireframe]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  const currentEvent = featuredEvents[activeIdx] || events[0];

  // Calculate days remaining
  const calculateDaysLeft = (dateStr: string) => {
    try {
      const now = new Date().getTime();
      const target = new Date(dateStr).getTime();
      const diff = target - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 0 ? `${days} DAYS LEFT` : 'HAPPENING NOW';
    } catch {
      return 'UPCOMING';
    }
  };

  useEffect(() => {
    if (isMobile || !mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth || 800;
    let height = container.clientHeight || 480;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060814, 0.022);

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

    // 2. Lighting Rig
    const ambient = new THREE.AmbientLight(0x0f172a, 3.2);
    scene.add(ambient);

    const mainSpot = new THREE.SpotLight(0x00f5ff, 5.0, 30, Math.PI / 4, 0.35);
    mainSpot.position.set(0, 8, 2);
    scene.add(mainSpot);

    const rimViolet = new THREE.PointLight(0x8a2be2, 4.0, 25);
    rimViolet.position.set(-6, 3, -4);
    scene.add(rimViolet);

    const rimCyan = new THREE.PointLight(0x00ffff, 4.0, 25);
    rimCyan.position.set(6, 3, -4);
    scene.add(rimCyan);

    // 3. Stadium Base & Podiums
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const materials: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[] = [];

    // Base Tier 1
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

    // Tier 2
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

    // Concentric Neon Rims
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

    // 4. Volumetric Light Cones
    const beamGroup = new THREE.Group();
    stageGroup.add(beamGroup);

    for (let b = 0; b < 4; b++) {
      const angle = (b / 4) * Math.PI * 2;
      const coneGeo = new THREE.ConeGeometry(0.35, 6, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(Math.cos(angle) * 2.9, 1.8, Math.sin(angle) * 2.9);
      cone.lookAt(0, 4, 0);
      beamGroup.add(cone);
    }

    // 5. Specimen Models for the Events
    const specimenHolder = new THREE.Group();
    specimenHolder.position.y = 0.55;
    stageGroup.add(specimenHolder);

    const eventMeshes: {
      group: THREE.Group;
      materials: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[];
    }[] = [];

    featuredEvents.forEach((ev) => {
      const grp = new THREE.Group();
      const mats: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[] = [];
      const cat = ev.category.toLowerCase();

      if (cat.includes('hackathon') || cat.includes('competition')) {
        // Gold Hackathon Trophy
        const chaliceGeo = new THREE.OctahedronGeometry(0.95, 1);
        const chaliceMat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          metalness: 0.95,
          roughness: 0.15,
          emissive: 0x332200,
        });
        const chalice = new THREE.Mesh(chaliceGeo, chaliceMat);
        grp.add(chalice);
        mats.push(chaliceMat);

        for (let side = -1; side <= 1; side += 2) {
          const wingGeo = new THREE.TorusGeometry(0.85, 0.08, 16, 32, Math.PI * 0.9);
          const wingMat = new THREE.MeshStandardMaterial({ color: 0x00f5ff, metalness: 0.8, roughness: 0.2 });
          const wing = new THREE.Mesh(wingGeo, wingMat);
          wing.position.set(side * 0.8, 0, 0);
          wing.rotation.y = side * 0.25;
          grp.add(wing);
          mats.push(wingMat);
        }

        const crown = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.25, 32), new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide }));
        crown.rotation.x = Math.PI / 2;
        crown.position.y = 0.9;
        grp.add(crown);
      } else if (cat.includes('workshop') || cat.includes('bootcamp')) {
        // Workshop Gyroscopic Cube Matrix
        const cubeGeo = new THREE.BoxGeometry(1.3, 1.3, 1.3);
        const cubeMat = new THREE.MeshPhysicalMaterial({ color: 0x00f5ff, transmission: 0.8, opacity: 0.85, roughness: 0.1 });
        const cube = new THREE.Mesh(cubeGeo, cubeMat);
        grp.add(cube);
        mats.push(cubeMat);

        const innerOctMat = new THREE.MeshStandardMaterial({ color: 0x8a2be2, metalness: 0.9, roughness: 0.1 });
        const innerOct = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), innerOctMat);
        grp.add(innerOct);
        mats.push(innerOctMat);

        const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.03, 16, 48), new THREE.MeshBasicMaterial({ color: 0x00f5ff }));
        const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.03, 16, 48), new THREE.MeshBasicMaterial({ color: 0x8a2be2 }));
        ring1.rotation.x = Math.PI / 3;
        ring2.rotation.y = Math.PI / 4;
        grp.add(ring1);
        grp.add(ring2);
      } else {
        // Futuristic Keynote Monolith & Beacon
        const monoGeo = new THREE.CylinderGeometry(0.7, 0.9, 1.8, 6);
        const monoMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.15 });
        const mono = new THREE.Mesh(monoGeo, monoMat);
        grp.add(mono);
        mats.push(monoMat);

        const orbMat = new THREE.MeshPhysicalMaterial({ color: 0x00f5ff, transmission: 0.85, roughness: 0.05, emissive: 0x003366 });
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), orbMat);
        orb.position.y = 1.3;
        grp.add(orb);
        mats.push(orbMat);

        const beaconBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.4, 8, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
        beaconBeam.position.y = 4.5;
        grp.add(beaconBeam);
      }

      specimenHolder.add(grp);
      eventMeshes.push({ group: grp, materials: mats });
    });

    // 6. Expanding Audio Pulse Ring
    const pulseRing = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.6, 48),
      new THREE.MeshBasicMaterial({ color: 0x00f5ff, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
    );
    pulseRing.rotation.x = Math.PI / 2;
    pulseRing.position.y = -0.63;
    stageGroup.add(pulseRing);

    // 7. Interactive Drag Orbit
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
      camera.position.y = Math.max(1.5, Math.min(5.2, camera.position.y - deltaY * 0.01));
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
      stageGroup.rotation.y += deltaX * 0.008;
      camera.position.y = Math.max(1.5, Math.min(5.2, camera.position.y - deltaY * 0.01));
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
      height = mountRef.current.clientHeight || 480;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // 8. Animation Loop
    let animId: number;
    const timer = new THREE.Timer();
    let pulseScale = 1;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      timer.update();
      const elapsed = timer.getElapsed();

      // Auto rotation
      if (autoRotateRef.current && !isDragging) {
        stageGroup.rotation.y += 0.006;
      }

      beamGroup.rotation.y = -elapsed * 0.25;

      // Active specimen lerp
      const cIdx = activeIdxRef.current;
      eventMeshes.forEach((item, idx) => {
        const isActive = idx === cIdx;
        const targetScale = isActive ? 1.0 : 0.001;
        item.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        item.group.visible = item.group.scale.x > 0.04;

        if (isActive) {
          item.group.rotation.y += 0.012;
          item.group.position.y = Math.sin(elapsed * 2.0) * 0.1;

          item.materials.forEach((m) => {
            m.wireframe = wireframeRef.current;
          });
        }
      });

      // Pulse ring expansion
      pulseScale += 0.025;
      if (pulseScale > 4.5) pulseScale = 1;
      pulseRing.scale.set(pulseScale, pulseScale, 1);
      (pulseRing.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.7 - pulseScale / 5);

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

  const handleSelectEvent = (idx: number) => {
    setActiveIdx(idx);
    soundFx.playHoloActivate();
  };

  if (!currentEvent) return null;

  return (
    <div style={{ marginBottom: '56px' }}>
      {/* Featured Event Switcher Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {featuredEvents.map((ev, i) => (
            <button
              key={ev.id}
              onClick={() => handleSelectEvent(i)}
              className={`tab-btn ${activeIdx === i ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '0.8rem',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: activeIdx === i ? 'var(--accent-cyan)' : 'var(--text-muted)',
                }}
              />
              <span>{ev.title.slice(0, 24)}...</span>
            </button>
          ))}
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
          // SPATIAL_EVENT_ARENA_ACTIVE
        </div>
      </div>

      {/* Mobile Event Dossier Fallback or 3D Holodeck Chamber */}
      {isMobile ? (
        <div
          style={{
            width: '100%',
            padding: '22px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span className="badge badge-violet" style={{ fontSize: '0.7rem' }}>
              {currentEvent.category}
            </span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {currentEvent.start_date}
            </span>
          </div>

          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {currentEvent.title}
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
            {currentEvent.short_desc}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
            <Link
              href={`/events/${currentEvent.slug}`}
              className="btn-primary"
              style={{
                padding: '8px 16px',
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Explore Stage & Schedule</span>
              <ArrowRight size={14} />
            </Link>

            {currentEvent.registration_url && (
              <a
                href={currentEvent.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>Register Direct</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      ) : (
        /* 3D Event Arena Container (Desktop & Tablet) */
        <div
          style={{
            width: '100%',
            height: '480px',
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            background: 'radial-gradient(circle at center, rgba(0, 245, 255, 0.08) 0%, var(--surface-card) 100%)',
            border: '1px solid rgba(0, 245, 255, 0.3)',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            cursor: 'grab',
          }}
        >
          {/* Three.js Mount */}
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
                  color: 'var(--accent-cyan)',
                  letterSpacing: '0.12em',
                  textShadow: '0 0 12px rgba(0, 245, 255, 0.5)',
                }}
              >
                SPATIAL_ARENA // {currentEvent.category.toUpperCase()} STAGE
              </span>
            </div>

            <span
              className="badge badge-cyan"
              style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Radio size={12} className="animate-spin" />
              <span suppressHydrationWarning>{calculateDaysLeft(currentEvent.start_date)}</span>
            </span>
          </div>

          {/* Floating Event Dossier Card (Left Bottom) */}
          <div
            style={{
              position: 'absolute',
              bottom: '72px',
              left: '20px',
              maxWidth: '440px',
              background: 'var(--surface-card)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 245, 255, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 22px',
              pointerEvents: 'auto',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 0 12px rgba(0, 245, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-violet" style={{ fontSize: '0.7rem' }}>
                {currentEvent.category}
              </span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {currentEvent.start_date}
              </span>
            </div>

            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {currentEvent.title}
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '14px' }}>
              {currentEvent.short_desc}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <Link
                href={`/events/${currentEvent.slug}`}
                className="btn-primary"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>Explore Stage & Schedule</span>
                <ArrowRight size={14} />
              </Link>

              {currentEvent.registration_url && (
                <a
                  href={currentEvent.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.78rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Register Direct</span>
                  <ExternalLink size={14} />
                </a>
              )}
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
                onClick={() => {
                  setAutoRotate(!autoRotate);
                  soundFx.playSpatialClick();
                }}
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

              <button
                onClick={() => {
                  setWireframe(!wireframe);
                  soundFx.playModeSwitch();
                }}
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
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              DRAG TO ORBIT 360° // PULL TO TILT
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
