'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Radio, RotateCcw, Box, Sparkles, Send, Signal } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

interface ContactRadar3DProps {
  officeLocation?: string;
  campusAddress?: string;
}

export default function ContactRadar3D({
  officeLocation = 'AR/VR Centre of Excellence Lab, Tech Corridor',
  campusAddress = 'Main Campus, Chennai, Tamil Nadu, India',
}: ContactRadar3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingCount, setPingCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const autoRotateRef = useRef(true);
  const wireframeRef = useRef(false);
  const triggerPingRef = useRef(false);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    wireframeRef.current = wireframe;
  }, [wireframe]);

  useEffect(() => {
    if (isMobile || !mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth || 800;
    let height = container.clientHeight || 420;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060814, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 60);
    camera.position.set(0, 3.2, 7.5);
    camera.lookAt(0, 0.6, 0);

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

    const keyLight = new THREE.PointLight(0x00f5ff, 4.5, 25);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x8a2be2, 3.5, 25);
    fillLight.position.set(-4, -2, 4);
    scene.add(fillLight);

    // 3. Radar Base & Pedestal
    const baseGroup = new THREE.Group();
    scene.add(baseGroup);

    const materials: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[] = [];

    // Hexagonal Base
    const hexGeo = new THREE.CylinderGeometry(2.6, 2.9, 0.35, 6);
    const hexMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.85,
      roughness: 0.2,
    });
    const hexMesh = new THREE.Mesh(hexGeo, hexMat);
    hexMesh.position.y = -1.2;
    baseGroup.add(hexMesh);
    materials.push(hexMat);

    // Cyan Neon Hex Rim
    const hexRingGeo = new THREE.RingGeometry(2.65, 2.72, 6);
    const hexRingMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, side: THREE.DoubleSide });
    const hexRing = new THREE.Mesh(hexRingGeo, hexRingMat);
    hexRing.rotation.x = Math.PI / 2;
    hexRing.position.y = -1.02;
    baseGroup.add(hexRing);

    // Floor Radar Grid
    const grid = new THREE.GridHelper(10, 20, 0x00f5ff, 0x1e293b);
    grid.position.y = -1.38;
    scene.add(grid);

    // 4. Parabolic Antenna & Transmitter Mast
    const mastGroup = new THREE.Group();
    baseGroup.add(mastGroup);

    // Vertical Mast
    const mastGeo = new THREE.CylinderGeometry(0.18, 0.3, 1.8, 16);
    const mastMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.9,
      roughness: 0.15,
    });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.y = -0.15;
    mastGroup.add(mast);
    materials.push(mastMat);

    // Gimbal Hub
    const gimbalGeo = new THREE.SphereGeometry(0.42, 24, 24);
    const gimbalMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.1 });
    const gimbal = new THREE.Mesh(gimbalGeo, gimbalMat);
    gimbal.position.y = 0.85;
    mastGroup.add(gimbal);
    materials.push(gimbalMat);

    // Articulated Dish Assembly (Pans back and forth)
    const dishAssembly = new THREE.Group();
    dishAssembly.position.y = 0.85;
    mastGroup.add(dishAssembly);

    // Parabolic Dish (Half sphere / inverted cone)
    const dishGeo = new THREE.ConeGeometry(1.6, 0.6, 32, 1, true);
    const dishMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f5ff,
      transmission: 0.8,
      roughness: 0.1,
      metalness: 0.3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.rotation.x = -Math.PI / 2.3;
    dishAssembly.add(dish);
    materials.push(dishMat);

    // Dish Outer Rim
    const dishRim = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.04, 16, 48), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
    dishRim.rotation.x = -Math.PI / 2.3;
    dishAssembly.add(dishRim);

    // Central Feed Horn / Emitter
    const hornGeo = new THREE.CylinderGeometry(0.06, 0.12, 0.9, 16);
    const hornMat = new THREE.MeshStandardMaterial({ color: 0x8a2be2, metalness: 0.9, roughness: 0.1 });
    const horn = new THREE.Mesh(hornGeo, hornMat);
    horn.rotation.x = -Math.PI / 2.3;
    horn.position.z = 0.45;
    dishAssembly.add(horn);
    materials.push(hornMat);

    // Glowing Emitter Bulb
    const bulbGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(0, 0.35, 0.85);
    dishAssembly.add(bulb);

    // 5. Radiating Signal Pulse Wave Rings
    const waveCount = 3;
    const waveMeshes: THREE.Mesh[] = [];
    const waveProgress = [0, 0.33, 0.66];

    for (let w = 0; w < waveCount; w++) {
      const ringGeo = new THREE.TorusGeometry(0.3, 0.025, 16, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        transparent: true,
        opacity: 0.6,
      });
      const wave = new THREE.Mesh(ringGeo, ringMat);
      wave.rotation.x = -Math.PI / 2.3;
      dishAssembly.add(wave);
      waveMeshes.push(wave);
    }

    // Skyward Geo-Beacon Beam
    const beaconGeo = new THREE.CylinderGeometry(0.04, 0.25, 9, 16, 1, true);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.position.y = 5.2;
    baseGroup.add(beaconMesh);

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
      baseGroup.rotation.y += deltaX * 0.008;
      camera.position.y = Math.max(1.2, Math.min(5.0, camera.position.y - deltaY * 0.01));
      camera.lookAt(0, 0.6, 0);
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
      baseGroup.rotation.y += deltaX * 0.008;
      camera.position.y = Math.max(1.2, Math.min(5.0, camera.position.y - deltaY * 0.01));
      camera.lookAt(0, 0.6, 0);
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
      height = mountRef.current.clientHeight || 420;
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

      // Auto rotation of base
      if (autoRotateRef.current && !isDragging) {
        baseGroup.rotation.y += 0.005;
      }

      // Parabolic Dish sweeping oscillation
      dishAssembly.rotation.y = Math.sin(elapsed * 1.2) * 0.55;

      // Wireframe state
      materials.forEach((m) => {
        m.wireframe = wireframeRef.current;
      });

      // Animate signal wave rings expanding outwards
      for (let w = 0; w < waveCount; w++) {
        waveProgress[w] = (waveProgress[w] + 0.015) % 1.0;
        const scale = 1.0 + waveProgress[w] * 3.5;
        waveMeshes[w].scale.set(scale, scale, scale);
        (waveMeshes[w].material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.75 - waveProgress[w]);
      }

      // Check ping trigger
      if (triggerPingRef.current) {
        keyLight.intensity = 10.0;
        bulbMat.color.setHex(0xffffff);
        triggerPingRef.current = false;
      } else {
        keyLight.intensity = THREE.MathUtils.lerp(keyLight.intensity, 4.5, 0.05);
        bulbMat.color.lerp(new THREE.Color(0x00f5ff), 0.05);
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
  }, []);

  const handlePing = () => {
    triggerPingRef.current = true;
    setIsPinging(true);
    setPingCount((c) => c + 1);
    soundFx.playHoloActivate();
    setTimeout(() => {
      setIsPinging(false);
    }, 1200);
  };

  return (
    <div style={{ marginBottom: '48px' }}>
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
            <span className="badge badge-cyan" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={12} className="animate-pulse" />
              <span>5.84 GHz LIVE TRANSMISSION</span>
            </span>
            <button
              onClick={handlePing}
              className="btn-primary"
              style={{
                padding: '6px 14px',
                fontSize: '0.78rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Signal size={14} className={isPinging ? 'animate-bounce' : ''} />
              <span>{isPinging ? 'PINGING...' : 'PING'}</span>
            </button>
          </div>

          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {officeLocation}
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {campusAddress} • LATENCY: &lt; 1.8ms
          </div>

          {pingCount > 0 && (
            <div style={{ color: '#4ade80', fontSize: '0.78rem', fontWeight: 600 }}>
              ✓ RADAR PINGS ACKNOWLEDGED: {pingCount}
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            height: '420px',
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            background: 'radial-gradient(circle at center, rgba(0, 245, 255, 0.08) 0%, var(--surface-card) 100%)',
            border: '1px solid rgba(0, 245, 255, 0.3)',
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
                  color: 'var(--accent-cyan)',
                  letterSpacing: '0.12em',
                  textShadow: '0 0 12px rgba(0, 245, 255, 0.5)',
                }}
              >
                CAMPUS_TELEMETRY // SPATIAL RADAR BEACON
              </span>
            </div>

            <span
              className="badge badge-cyan"
              style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Radio size={12} className="animate-pulse" />
              <span>5.84 GHz LIVE TRANSMISSION</span>
            </span>
          </div>

          {/* Floating Telemetry Coordinates Card (Top-Right) */}
          <div
            style={{
              position: 'absolute',
              top: '56px',
              right: '20px',
              background: 'var(--surface-card)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 18px',
              pointerEvents: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              lineHeight: '1.5',
              maxWidth: '300px',
            }}
          >
            <div style={{ color: 'var(--text-muted)' }}>NODE: CHENNAI_COE_STATION</div>
            <div style={{ color: 'var(--accent-cyan)' }}>AIRLINK LATENCY: &lt; 1.8ms</div>
            <div style={{ color: 'var(--text-secondary)' }}>GEO: 13.0827° N, 80.2707° E</div>
            {pingCount > 0 && (
              <div style={{ color: '#4ade80', marginTop: '4px', fontWeight: 600 }}>
                ✓ RADAR PINGS ACKNOWLEDGED: {pingCount}
              </div>
            )}
          </div>

          {/* Bottom Interactive Toolbar */}
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
              {/* Ping Button */}
              <button
                onClick={handlePing}
                className="btn-primary"
                style={{
                  padding: '7px 16px',
                  fontSize: '0.78rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isPinging ? '0 0 20px rgba(0, 245, 255, 0.8)' : 'none',
                }}
              >
                <Signal size={14} className={isPinging ? 'animate-bounce' : ''} />
                <span>{isPinging ? 'TRANSMITTING...' : 'PING BEACON'}</span>
              </button>

              {/* Orbit / Rotation Toggle */}
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

              {/* Wireframe Toggle */}
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
              DRAG TO ORBIT 360° // CLICK PING TO SEND SIGNAL
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
