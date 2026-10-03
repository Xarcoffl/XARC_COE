'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Link from 'next/link';
import { Box, Layers, RotateCcw, ArrowRight, Sparkles, Compass, Eye } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

interface HolodeckSpecimen {
  id: string;
  slug: string;
  title: string;
  category: 'VR' | 'MR' | 'SIMULATION' | '3D' | 'XR';
  hardware: string;
  metrics: string;
  description: string;
  color: string;
  hex: number;
}

const SPECIMENS: HolodeckSpecimen[] = [
  {
    id: 'vr_industrial',
    slug: 'industrial-safety-training-vr',
    title: 'Industrial Safety VR Simulation Rig',
    category: 'VR',
    hardware: 'Meta Quest Pro / Quest 3 (6-DoF)',
    metrics: '90 FPS • 1.2M Polygons • Haptic Glove Telemetry',
    description: 'Real-time hazard scenario training engine featuring OSHA-compliant industrial crane operations, high-voltage lockouts, and fire suppression drills.',
    color: '#00f5ff',
    hex: 0x00f5ff,
  },
  {
    id: 'mr_medical',
    slug: 'medical-anatomy-ar-training',
    title: 'Stereoscopic Medical Hologram',
    category: 'MR',
    hardware: 'Apple Vision Pro / HoloLens 2',
    metrics: 'Sub-millimeter Registration • Volumetric DICOM Shaders',
    description: 'Ultra-high fidelity interactive cardiac anatomy model with real-time systolic blood flow visualization and pathology cross-section inspection.',
    color: '#ec4899',
    hex: 0xec4899,
  },
  {
    id: 'aero_turbine',
    slug: 'automotive-digital-twin-inspection',
    title: 'Aerodynamic Jet Turbine Engine',
    category: 'SIMULATION',
    hardware: 'High-Compute Spatial Workstation',
    metrics: '14 Rotor Blades • Real-time CFD Airflow Particles',
    description: 'Digital twin inspection module demonstrating thermal dissipation gradients, RPM stress testing, and interior bore-scope exploded views.',
    color: '#38bdf8',
    hex: 0x38bdf8,
  },
  {
    id: 'digital_twin',
    slug: 'campus-digital-twin-lidar',
    title: 'Smart Campus LiDAR Twin',
    category: '3D',
    hardware: 'Spatial WebGL Engine (Cross-Platform)',
    metrics: '3D Point Cloud Mesh • Live IoT Sensor Beacons',
    description: 'Geospatial 3D twin of institutional research blocks with live energy consumption metrics, lab occupancy tracking, and autonomous drone patrol routes.',
    color: '#a855f7',
    hex: 0xa855f7,
  },
  {
    id: 'spatial_ui',
    slug: 'interactive-chemistry-lab-sim',
    title: 'VisionOS Spatial Interface Matrix',
    category: 'XR',
    hardware: 'Stereoscopic Passthrough Headset',
    metrics: 'Spatial UI Windows • Eye-Tracking Raycast Nodes',
    description: 'Next-generation spatial operating system mockup with floating frosted glass panels, hand-tracking depth gestures, and ambient lighting physics.',
    color: '#4ade80',
    hex: 0x4ade80,
  },
];

export default function ProjectHolodeck3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
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

  const activeIdxRef = useRef(0);
  const wireframeRef = useRef(false);
  const explodedRef = useRef(false);
  const autoRotateRef = useRef(true);

  useEffect(() => {
    activeIdxRef.current = activeIdx;
  }, [activeIdx]);

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
    let height = container.clientHeight || 480;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060814, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 70);
    camera.position.set(0, 2.5, 7.8);
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

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 3.2);
    scene.add(ambientLight);

    const keySpot = new THREE.SpotLight(0x00f5ff, 5.0, 30, Math.PI / 4, 0.3);
    keySpot.position.set(0, 7, 3);
    scene.add(keySpot);

    const rimBlue = new THREE.PointLight(0x38bdf8, 3.5, 25);
    rimBlue.position.set(-6, -2, 4);
    scene.add(rimBlue);

    const rimViolet = new THREE.PointLight(0xa855f7, 3.5, 25);
    rimViolet.position.set(6, -2, 4);
    scene.add(rimViolet);

    // 3. Holodeck Pedestal & Scanner Floor
    const chamberGroup = new THREE.Group();
    scene.add(chamberGroup);

    const baseGeo = new THREE.CylinderGeometry(3.2, 3.6, 0.4, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.9,
      roughness: 0.2,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -1.4;
    chamberGroup.add(baseMesh);

    // Concentric Neon Holodeck Rims
    const rim1 = new THREE.Mesh(
      new THREE.TorusGeometry(3.22, 0.035, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x00f5ff })
    );
    rim1.rotation.x = Math.PI / 2;
    rim1.position.y = -1.2;
    chamberGroup.add(rim1);

    const rim2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.03, 16, 48),
      new THREE.MeshBasicMaterial({ color: 0x8a2be2 })
    );
    rim2.rotation.x = Math.PI / 2;
    rim2.position.y = -1.18;
    chamberGroup.add(rim2);

    // Floor Radar Grid
    const grid = new THREE.GridHelper(12, 24, 0x00f5ff, 0x1e293b);
    grid.position.y = -1.6;
    scene.add(grid);

    // 4. Model Holders for Each Specimen
    const masterModelHolder = new THREE.Group();
    scene.add(masterModelHolder);

    const modelContainers: {
      group: THREE.Group;
      materials: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[];
      explodable: { mesh: THREE.Mesh; defY: number; expY: number }[];
    }[] = [];

    // Specimen 0: Industrial VR Rig
    {
      const grp = new THREE.Group();
      const mats: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[] = [];
      const exp: { mesh: THREE.Mesh; defY: number; expY: number }[] = [];

      const colGeo = new THREE.CylinderGeometry(0.8, 0.9, 1.6, 24);
      const colMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25, metalness: 0.85 });
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.y = -0.2;
      grp.add(col);
      mats.push(colMat);

      const headGeo = new THREE.BoxGeometry(2.2, 1.0, 1.2);
      const headMat = new THREE.MeshPhysicalMaterial({ color: 0x00f5ff, transmission: 0.8, roughness: 0.1, transparent: true, opacity: 0.85 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.0;
      grp.add(head);
      mats.push(headMat);
      exp.push({ mesh: head, defY: 1.0, expY: 1.8 });

      masterModelHolder.add(grp);
      modelContainers.push({ group: grp, materials: mats, explodable: exp });
    }

    // Specimen 1: Medical Anatomy Core
    {
      const grp = new THREE.Group();
      const mats: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[] = [];
      const exp: { mesh: THREE.Mesh; defY: number; expY: number }[] = [];

      const heartGeo = new THREE.DodecahedronGeometry(1.2, 1);
      const heartMat = new THREE.MeshPhysicalMaterial({
        color: 0xec4899,
        transmission: 0.8,
        roughness: 0.1,
        emissive: 0x4a044e,
      });
      const heart = new THREE.Mesh(heartGeo, heartMat);
      heart.position.y = 0.4;
      grp.add(heart);
      mats.push(heartMat);

      for (let s = -1; s <= 1; s += 2) {
        const ringGeo = new THREE.TorusGeometry(1.6, 0.04, 16, 48);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = 0.4;
        ring.rotation.x = (s * Math.PI) / 3;
        grp.add(ring);
      }

      masterModelHolder.add(grp);
      modelContainers.push({ group: grp, materials: mats, explodable: exp });
    }

    // Specimen 2: Aero Engine Turbine
    {
      const grp = new THREE.Group();
      const mats: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[] = [];
      const exp: { mesh: THREE.Mesh; defY: number; expY: number }[] = [];

      const hubGeo = new THREE.ConeGeometry(0.7, 1.4, 24);
      const hubMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.95, roughness: 0.15 });
      const hub = new THREE.Mesh(hubGeo, hubMat);
      hub.rotation.x = Math.PI / 2;
      hub.position.y = 0.4;
      grp.add(hub);
      mats.push(hubMat);

      // Outer Fan Cowling
      const cowlGeo = new THREE.CylinderGeometry(1.8, 1.8, 1.0, 32, 1, true);
      const cowlMat = new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transmission: 0.85, transparent: true, opacity: 0.7 });
      const cowl = new THREE.Mesh(cowlGeo, cowlMat);
      cowl.rotation.x = Math.PI / 2;
      cowl.position.y = 0.4;
      grp.add(cowl);
      mats.push(cowlMat);
      exp.push({ mesh: cowl, defY: 0.4, expY: 1.5 });

      masterModelHolder.add(grp);
      modelContainers.push({ group: grp, materials: mats, explodable: exp });
    }

    // Specimen 3: Smart Campus Digital Twin
    {
      const grp = new THREE.Group();
      const mats: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[] = [];
      const exp: { mesh: THREE.Mesh; defY: number; expY: number }[] = [];

      // Ground Base Plate
      const plateGeo = new THREE.BoxGeometry(2.8, 0.2, 2.8);
      const plateMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.2, metalness: 0.8 });
      const plate = new THREE.Mesh(plateGeo, plateMat);
      plate.position.y = -0.5;
      grp.add(plate);
      mats.push(plateMat);

      // Towers
      const towerCount = 5;
      for (let t = 0; t < towerCount; t++) {
        const height = 0.8 + (t % 3) * 0.5;
        const bGeo = new THREE.BoxGeometry(0.55, height, 0.55);
        const bMat = new THREE.MeshPhysicalMaterial({ color: 0xa855f7, transmission: 0.75, roughness: 0.15, transparent: true, opacity: 0.85 });
        const bMesh = new THREE.Mesh(bGeo, bMat);
        const angle = (t / towerCount) * Math.PI * 2;
        bMesh.position.set(Math.cos(angle) * 0.9, -0.5 + height / 2, Math.sin(angle) * 0.9);
        grp.add(bMesh);
        mats.push(bMat);
        exp.push({ mesh: bMesh, defY: -0.5 + height / 2, expY: height / 2 + 0.6 });
      }

      masterModelHolder.add(grp);
      modelContainers.push({ group: grp, materials: mats, explodable: exp });
    }

    // Specimen 4: VisionOS Spatial UI Interface
    {
      const grp = new THREE.Group();
      const mats: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[] = [];
      const exp: { mesh: THREE.Mesh; defY: number; expY: number }[] = [];

      // 3 Floating Glass Planes
      for (let p = 0; p < 3; p++) {
        const planeGeo = new THREE.BoxGeometry(2.0, 1.2, 0.05);
        const planeMat = new THREE.MeshPhysicalMaterial({
          color: 0x4ade80,
          transmission: 0.88,
          roughness: 0.05,
          metalness: 0.1,
          transparent: true,
          opacity: 0.8,
        });
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.position.set(0, 0.4 + (p - 1) * 0.4, (p - 1) * 0.5);
        plane.rotation.y = (p - 1) * 0.15;
        grp.add(plane);
        mats.push(planeMat);
        exp.push({ mesh: plane, defY: 0.4 + (p - 1) * 0.4, expY: 0.4 + (p - 1) * 0.9 });
      }

      masterModelHolder.add(grp);
      modelContainers.push({ group: grp, materials: mats, explodable: exp });
    }

    // 5. Interactive Drag Orbit
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
      masterModelHolder.rotation.y += deltaX * 0.008;
      chamberGroup.rotation.y += deltaX * 0.004;
      camera.position.y = Math.max(1.2, Math.min(4.8, camera.position.y - deltaY * 0.01));
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
      masterModelHolder.rotation.y += deltaX * 0.008;
      chamberGroup.rotation.y += deltaX * 0.004;
      camera.position.y = Math.max(1.2, Math.min(4.8, camera.position.y - deltaY * 0.01));
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

    // 6. Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Auto rotation
      if (autoRotateRef.current && !isDragging) {
        masterModelHolder.rotation.y += 0.007;
      }

      // Show only active specimen with smooth lerp
      const curIdx = activeIdxRef.current;
      const activeSpec = SPECIMENS[curIdx];

      modelContainers.forEach((item, idx) => {
        const isActive = idx === curIdx;
        const targetScale = isActive ? 1.0 : 0.001;
        item.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        item.group.visible = item.group.scale.x > 0.04;

        if (isActive) {
          item.group.position.y = Math.sin(elapsed * 2.0) * 0.08;

          // Wireframe
          item.materials.forEach((m) => {
            m.wireframe = wireframeRef.current;
          });

          // Exploded state lerp
          item.explodable.forEach((p) => {
            const targetY = explodedRef.current ? p.expY : p.defY;
            p.mesh.position.y = THREE.MathUtils.lerp(p.mesh.position.y, targetY, 0.08);
          });
        }
      });

      // Update light & ring color
      keySpot.color.lerp(new THREE.Color(activeSpec.hex), 0.08);
      rim1.material.color.lerp(new THREE.Color(activeSpec.hex), 0.08);

      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);

    return () => {
      renderer.setAnimationLoop(null);
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

  const currentSpec = SPECIMENS[activeIdx];

  const handleSelect = (idx: number) => {
    setActiveIdx(idx);
    soundFx.playHoloActivate();
  };

  return (
    <div style={{ marginBottom: '56px' }}>
      {/* Specimen Switcher Header */}
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
          {SPECIMENS.map((spec, i) => (
            <button
              key={spec.id}
              onClick={() => handleSelect(i)}
              className={`tab-btn ${activeIdx === i ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '0.8rem',
                border: activeIdx === i ? `1px solid ${spec.color}` : '1px solid rgba(76, 125, 255, 0.2)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: spec.color,
                  boxShadow: activeIdx === i ? `0 0 8px ${spec.color}` : 'none',
                }}
              />
              <span>{spec.title.split(' ')[0]} {spec.category}</span>
            </button>
          ))}
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
          // SPATIAL_HOLODECK_ACTIVE
        </div>
      </div>

      {/* Mobile Specimen Card fallback */}
      {isMobile ? (
        <div
          style={{
            width: '100%',
            padding: '22px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface-card)',
            border: `1px solid ${currentSpec.color}44`,
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
                background: `${currentSpec.color}22`,
                border: `1px solid ${currentSpec.color}`,
                color: currentSpec.color,
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              {currentSpec.hardware}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: currentSpec.color }}>
              {currentSpec.category}
            </span>
          </div>

          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {currentSpec.title}
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: currentSpec.color }}>
            {currentSpec.metrics}
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            {currentSpec.description}
          </p>

          <Link
            href={`/projects/${currentSpec.slug}`}
            className="btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '4px',
            }}
          >
            <span>Explore Full Case Study</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        /* 3D Holodeck Chamber (Desktop & Tablet) */
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
                  color: currentSpec.color,
                  letterSpacing: '0.12em',
                  textShadow: `0 0 12px ${currentSpec.color}88`,
                }}
              >
                HOLODECK_PROTOTYPE // {currentSpec.category}
              </span>
            </div>

            <span
              className="badge"
              style={{
                background: `${currentSpec.color}22`,
                border: `1px solid ${currentSpec.color}`,
                color: currentSpec.color,
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              {currentSpec.hardware}
            </span>
          </div>

          {/* Specimen Floating Detail Card (VisionOS Card - Left Bottom) */}
          <div
            style={{
              position: 'absolute',
              bottom: '72px',
              left: '20px',
              maxWidth: '440px',
              background: 'var(--surface-card)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${currentSpec.color}55`,
              borderRadius: 'var(--radius-md)',
              padding: '18px 22px',
              pointerEvents: 'auto',
              boxShadow: `0 10px 30px rgba(0, 0, 0, 0.3), inset 0 0 12px ${currentSpec.color}15`,
            }}
          >
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {currentSpec.title}
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: currentSpec.color, marginBottom: '8px' }}>
              {currentSpec.metrics}
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '14px' }}>
              {currentSpec.description}
            </p>

            <Link
              href={`/projects/${currentSpec.slug}`}
              className="btn-primary"
              style={{
                padding: '6px 14px',
                fontSize: '0.78rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Explore Full Case Study</span>
              <ArrowRight size={14} />
            </Link>
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

              <button
                onClick={() => {
                  setExploded(!exploded);
                  soundFx.playModeSwitch();
                }}
                className="tab-btn"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  background: exploded ? 'rgba(236, 72, 153, 0.2)' : 'var(--surface-card-alt)',
                  border: exploded ? '1px solid #ec4899' : '1px solid var(--border-subtle)',
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
      )}
    </div>
  );
}
