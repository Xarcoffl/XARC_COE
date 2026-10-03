'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { X, RotateCcw, Box, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

interface HardwareRigViewer3DProps {
  nodeId: string;
  nodeTitle: string;
  coord: string;
  onClose: () => void;
}

interface RigDetail {
  name: string;
  category: string;
  specs: string[];
  description: string;
  color: string;
  hex: number;
}

const RIG_DATA: { [key: string]: RigDetail } = {
  'self-learning': {
    name: 'Curved Developer Workstation & Code Sandbox',
    category: 'ASYNC WORKSTATION',
    specs: ['Dual 4K HDR Displays', 'Isolated Noise-Cancelling Audio', 'Integrated XR SDKs'],
    description: 'Precision ergonomic development pod configured with pre-indexed Spatial 3D templates, glTF asset compressors, and interactive shader tutorials.',
    color: '#38bdf8',
    hex: 0x38bdf8,
  },
  'project-work': {
    name: 'Agile Team Synchronization Hub',
    category: 'COLLABORATIVE MATRIX',
    specs: ['Multi-Seat Network Gigabit Switch', 'Central Shared GPU Repository', 'Wireless Git Push'],
    description: 'Dedicated team cluster enabling simultaneous pairing between Unity/Unreal programmers, technical artists, and UX designers.',
    color: '#00f5ff',
    hex: 0x00f5ff,
  },
  '3d-dev': {
    name: 'High-Compute GPU Rig with Liquid Cooling',
    category: 'GPU RENDERING RIG',
    specs: ['24GB VRAM GPU', 'Liquid-Cooled Radiator Assembly', 'Photogrammetry Acceleration'],
    description: 'Extreme-compute workstation purpose-built for real-time Nanite geometry rigging, raytraced volumetric lighting, and 8K texture baking.',
    color: '#8a2be2',
    hex: 0x8a2be2,
  },
  'hackathons': {
    name: 'Rapid Sprint Sandbox & Peripherals Terminal',
    category: 'RAPID PROTOTYPING',
    specs: ['Modular Peripherals Loaner Bank', 'Hot-Swappable Batteries', '36-Hour Continuous UPS'],
    description: 'Fast-deploy sprint workstation equipped with haptic vests, foot trackers, and rapid gesture mapping rigs for national hackathons.',
    color: '#f59e0b',
    hex: 0xf59e0b,
  },
  'xr-dev': {
    name: '6-DoF Roomscale Optical Tracking Lighthouse',
    category: 'SPATIAL TRACKING ZONE',
    specs: ['Sub-Millimeter Optical Laser', 'Ceiling-Mounted 360° Sweep', 'Zero-Drift IMU Sync'],
    description: 'Synchronized laser tracking mast establishing a calibrated 5m x 5m physical bounding volume for roomscale headset testing.',
    color: '#4ade80',
    hex: 0x4ade80,
  },
  'testing': {
    name: 'Optical Motion-to-Photon Latency Analyzer',
    category: 'QA & ERGONOMICS RIG',
    specs: ['1000 FPS High-Speed Optical Sensor', 'Thermal Dissipation Probe', 'Simulator Sickness Audit'],
    description: 'Hardware testbench measuring display latency down to 2ms and verifying vestibular alignment to eliminate visual discomfort.',
    color: '#ec4899',
    hex: 0xec4899,
  },
  'industry': {
    name: 'Enterprise Mixed Reality Headset & LiDAR Rig',
    category: 'ENTERPRISE DEPLOYMENT',
    specs: ['High-Density LiDAR Sensor', 'Stereoscopic 4K Passthrough', 'Foveated Eye-Tracking'],
    description: 'Commercial-grade spatial headset module utilized exclusively for partner MoUs, defense simulations, and capstone surgical tools.',
    color: '#c084fc',
    hex: 0xc084fc,
  },
};

export default function HardwareRigViewer3D({
  nodeId,
  nodeTitle,
  coord,
  onClose,
}: HardwareRigViewer3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const wireframeRef = useRef(false);
  const autoRotateRef = useRef(true);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const detail = RIG_DATA[nodeId] || RIG_DATA['self-learning'];

  useEffect(() => {
    wireframeRef.current = wireframe;
  }, [wireframe]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    if (!mountRef.current || window.innerWidth < 768) return;
    const container = mountRef.current;
    let width = container.clientWidth || 640;
    let height = container.clientHeight || 360;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060814, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 1.8, 5.8);
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
    const ambientLight = new THREE.AmbientLight(0x0f172a, 3.2);
    scene.add(ambientLight);

    const mainSpot = new THREE.SpotLight(detail.hex, 5.0, 25, Math.PI / 4, 0.3);
    mainSpot.position.set(3, 5, 4);
    scene.add(mainSpot);

    const rimLight = new THREE.PointLight(0x00f5ff, 3.5, 20);
    rimLight.position.set(-4, -2, 4);
    scene.add(rimLight);

    // 3. Rig Master Group
    const rigGroup = new THREE.Group();
    scene.add(rigGroup);

    const materials: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[] = [];

    // Pedestal
    const baseGeo = new THREE.CylinderGeometry(2.0, 2.3, 0.3, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.9, roughness: 0.2 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -1.2;
    rigGroup.add(baseMesh);
    materials.push(baseMat);

    const neonRim = new THREE.Mesh(new THREE.TorusGeometry(2.02, 0.03, 16, 48), new THREE.MeshBasicMaterial({ color: detail.hex }));
    neonRim.rotation.x = Math.PI / 2;
    neonRim.position.y = -1.04;
    rigGroup.add(neonRim);

    const grid = new THREE.GridHelper(8, 16, detail.hex, 0x1e293b);
    grid.position.y = -1.36;
    scene.add(grid);

    // Procedural Hardware Geometry based on nodeId
    if (nodeId === '3d-dev') {
      // GPU Chassis Rig with Dual Cooling Fans
      const chassisGeo = new THREE.BoxGeometry(2.2, 1.4, 0.9);
      const chassisMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.15 });
      const chassis = new THREE.Mesh(chassisGeo, chassisMat);
      chassis.position.y = 0.2;
      rigGroup.add(chassis);
      materials.push(chassisMat);

      // Dual Fans
      for (let f = -1; f <= 1; f += 2) {
        const fanGeo = new THREE.TorusGeometry(0.42, 0.05, 16, 32);
        const fanMat = new THREE.MeshBasicMaterial({ color: detail.hex });
        const fan = new THREE.Mesh(fanGeo, fanMat);
        fan.position.set(f * 0.6, 0.2, 0.46);
        chassis.add(fan);
      }
    } else if (nodeId === 'xr-dev') {
      // Tracking Lighthouse Tower
      const mastGeo = new THREE.CylinderGeometry(0.12, 0.22, 1.8, 16);
      const mastMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.85, roughness: 0.2 });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.y = -0.1;
      rigGroup.add(mast);
      materials.push(mastMat);

      const beaconHeadGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
      const beaconHeadMat = new THREE.MeshPhysicalMaterial({ color: 0x4ade80, transmission: 0.8, roughness: 0.1 });
      const beaconHead = new THREE.Mesh(beaconHeadGeo, beaconHeadMat);
      beaconHead.position.y = 0.9;
      rigGroup.add(beaconHead);
      materials.push(beaconHeadMat);

      const sweepRing = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.025, 16, 48), new THREE.MeshBasicMaterial({ color: 0x4ade80 }));
      sweepRing.rotation.x = Math.PI / 3;
      beaconHead.add(sweepRing);
    } else if (nodeId === 'industry' || nodeId === 'testing') {
      // Enterprise Spatial Visor Rig
      const visorGeo = new THREE.BoxGeometry(1.6, 0.8, 0.9);
      const visorMat = new THREE.MeshPhysicalMaterial({ color: detail.hex, transmission: 0.85, roughness: 0.08, transparent: true, opacity: 0.85 });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.position.y = 0.3;
      rigGroup.add(visor);
      materials.push(visorMat);

      const halo = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.03, 16, 48), new THREE.MeshBasicMaterial({ color: 0x00f5ff }));
      halo.rotation.x = Math.PI / 4;
      visor.add(halo);
    } else {
      // Workstation Display Pod
      const monGeo = new THREE.BoxGeometry(1.8, 1.1, 0.08);
      const monMat = new THREE.MeshPhysicalMaterial({ color: detail.hex, transmission: 0.85, roughness: 0.1 });
      const mon = new THREE.Mesh(monGeo, monMat);
      mon.position.y = 0.3;
      rigGroup.add(mon);
      materials.push(monMat);

      const standGeo = new THREE.CylinderGeometry(0.08, 0.14, 0.8, 16);
      const standMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.9, roughness: 0.2 });
      const stand = new THREE.Mesh(standGeo, standMat);
      stand.position.y = -0.4;
      rigGroup.add(stand);
      materials.push(standMat);
    }

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
      rigGroup.rotation.y += deltaX * 0.008;
      camera.position.y = Math.max(0.8, Math.min(4.0, camera.position.y - deltaY * 0.01));
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
      rigGroup.rotation.y += deltaX * 0.008;
      camera.position.y = Math.max(0.8, Math.min(4.0, camera.position.y - deltaY * 0.01));
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
      width = mountRef.current.clientWidth || 640;
      height = mountRef.current.clientHeight || 360;
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

      // Auto rotate
      if (autoRotateRef.current && !isDragging) {
        rigGroup.rotation.y += 0.008;
      }

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
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [nodeId]);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '740px',
          background: 'var(--surface-card)',
          border: `1px solid ${detail.color}66`,
          boxShadow: `0 25px 60px rgba(0, 0, 0, 0.4), 0 0 25px ${detail.color}22`,
          padding: '0',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--surface-card)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="beacon-dot" />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.76rem',
                  color: detail.color,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                HARDWARE_RIG_INSPECTOR // {coord}
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginTop: '4px', margin: 0 }}>
              {detail.name}
            </h3>
          </div>

          <button
            onClick={() => {
              onClose();
              soundFx.playSpatialClick();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#9ca3af',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 3D WebGL Rig Display (Desktop/Tablet) or 2D Schematic (Mobile) */}
        {isMobile ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', background: 'var(--surface-card-alt)' }}>
            <div style={{ width: '64px', height: '64px', margin: '0 auto 16px auto', borderRadius: '16px', background: `${detail.color}22`, border: `1px solid ${detail.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: detail.color }}>
              <Box size={32} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: detail.color, letterSpacing: '0.08em', marginBottom: '6px' }}>
              3D CAD SPECIFICATION // MOBILE VIEW
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Interactive 360° WebGL available on Tablet & Desktop devices
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', height: '360px', background: 'var(--surface-card-alt)' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

            {/* Controls Bar inside canvas */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '16px',
                right: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setAutoRotate(!autoRotate);
                    soundFx.playSpatialClick();
                  }}
                  className="tab-btn"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    background: autoRotate ? `${detail.color}22` : 'var(--surface-card)',
                    border: autoRotate ? `1px solid ${detail.color}` : '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <RotateCcw size={12} style={{ marginRight: '4px' }} />
                  <span>{autoRotate ? 'PAUSE' : 'ORBIT'}</span>
                </button>

                <button
                  onClick={() => {
                    setWireframe(!wireframe);
                    soundFx.playModeSwitch();
                  }}
                  className="tab-btn"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    background: wireframe ? `${detail.color}22` : 'var(--surface-card)',
                    border: wireframe ? `1px solid ${detail.color}` : '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <Box size={12} style={{ marginRight: '4px' }} />
                  <span>{wireframe ? 'SURFACE' : 'WIREFRAME'}</span>
                </button>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                DRAG TO INSPECT 360°
              </div>
            </div>
          </div>
        )}

        {/* Technical Specs Footer */}
        <div style={{ padding: '20px 24px', background: 'var(--surface-card)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '14px' }}>
            {detail.description}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {detail.specs.map((sp, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                }}
              >
                <CheckCircle2 size={13} style={{ color: detail.color }} />
                <span>{sp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
