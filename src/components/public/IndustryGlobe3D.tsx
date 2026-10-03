'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Globe, MapPin, Sparkles, RotateCcw, Box, Radio, ExternalLink } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

interface GlobalHub {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  partnerType: string;
  scope: string;
  color: string;
  hex: number;
}

const GLOBAL_HUBS: GlobalHub[] = [
  {
    id: 'chennai',
    name: 'Chennai CoE Node',
    region: 'Tamil Nadu, India',
    lat: 13.0827,
    lng: 80.2707,
    partnerType: 'HEADQUARTERS & R&D LAB',
    scope: 'Centre of Excellence physical spatial computing infrastructure, motion capture stage, and student development bullpen.',
    color: '#00f5ff',
    hex: 0x00f5ff,
  },
  {
    id: 'bangalore',
    name: 'Bangalore XR Corridor',
    region: 'Karnataka, India',
    lat: 12.9716,
    lng: 77.5946,
    partnerType: 'INDUSTRIAL XR PARTNER',
    scope: 'Enterprise simulation development, industrial plant digital twins, and direct engineering mentorship.',
    color: '#38bdf8',
    hex: 0x38bdf8,
  },
  {
    id: 'silicon_valley',
    name: 'Silicon Valley Spatial Hub',
    region: 'California, USA',
    lat: 37.3861,
    lng: -122.0839,
    partnerType: 'ENGINE ARCHITECTURE CONSORTIUM',
    scope: 'Open-source Spatial Computing standards, stereoscopic shader optimization pipelines, and developer ecosystem grants.',
    color: '#a855f7',
    hex: 0xa855f7,
  },
  {
    id: 'tokyo',
    name: 'Tokyo Robotics & Haptics Lab',
    region: 'Kanto, Japan',
    lat: 35.6762,
    lng: 139.6503,
    partnerType: 'ADVANCED HAPTICS ALLIANCE',
    scope: 'Ultra-low latency force feedback telemetry and tele-presence robotics capstone research.',
    color: '#f59e0b',
    hex: 0xf59e0b,
  },
  {
    id: 'stuttgart',
    name: 'Stuttgart Automotive Twin Node',
    region: 'Baden-Württemberg, Germany',
    lat: 48.7758,
    lng: 9.1829,
    partnerType: 'AUTOMOTIVE DIGITAL TWIN',
    scope: 'High-fidelity aerodynamic CAD assembly pipelines and mixed reality assembly line ergonomics.',
    color: '#4ade80',
    hex: 0x4ade80,
  },
  {
    id: 'singapore',
    name: 'Singapore MedTech XR Lab',
    region: 'Southeast Asia',
    lat: 1.3521,
    lng: 103.8198,
    partnerType: 'CLINICAL AR FELLOWSHIP',
    scope: 'Sub-millimeter volumetric surgical planning overlays and clinical immersion trials.',
    color: '#ec4899',
    hex: 0xec4899,
  },
];

// Coordinate mapping helper: Lat/Lng -> Vector3 on sphere of given radius
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export default function IndustryGlobe3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedHub, setSelectedHub] = useState<GlobalHub>(GLOBAL_HUBS[0]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const selectedHubRef = useRef<GlobalHub>(GLOBAL_HUBS[0]);
  const autoRotateRef = useRef(true);
  const wireframeRef = useRef(false);
  const globeGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    selectedHubRef.current = selectedHub;
  }, [selectedHub]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    wireframeRef.current = wireframe;
  }, [wireframe]);

  useEffect(() => {
    if (!mountRef.current || window.innerWidth < 768) return;
    const container = mountRef.current;
    let width = container.clientWidth || 800;
    let height = container.clientHeight || 480;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060814, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 80);
    camera.position.set(0, 1.5, 7.8);
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
    const ambientLight = new THREE.AmbientLight(0x0f172a, 3.0);
    scene.add(ambientLight);

    const keyLight = new THREE.PointLight(0x00f5ff, 4.5, 30);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x8a2be2, 3.5, 25);
    rimLight.position.set(-6, -3, -4);
    scene.add(rimLight);

    // 3. Globe Master Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const globeRadius = 2.4;

    // Inner Glowing Core Sphere
    const coreGeo = new THREE.SphereGeometry(globeRadius * 0.98, 36, 36);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x050c1f,
      roughness: 0.25,
      metalness: 0.9,
      transmission: 0.3,
      transparent: true,
      opacity: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // Outer Wireframe Hologram Sphere
    const wireGeo = new THREE.SphereGeometry(globeRadius, 32, 24);
    const wireMat = new THREE.MeshStandardMaterial({
      color: 0x00f5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // Atmospheric Glow Ring
    const atmoGeo = new THREE.TorusGeometry(globeRadius * 1.05, 0.04, 16, 64);
    const atmoMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.45 });
    const atmoRing = new THREE.Mesh(atmoGeo, atmoMat);
    atmoRing.rotation.x = Math.PI / 2.3;
    globeGroup.add(atmoRing);

    // Latitude / Longitude Accent Rings
    const eqGeo = new THREE.RingGeometry(globeRadius * 1.02, globeRadius * 1.035, 64);
    const eqMat = new THREE.MeshBasicMaterial({ color: 0x8a2be2, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const eqRing = new THREE.Mesh(eqGeo, eqMat);
    eqRing.rotation.x = Math.PI / 2;
    globeGroup.add(eqRing);

    // 4. Dot Cloud Matrix on Sphere Surface
    const dotCount = 450;
    const dotPos = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = globeRadius * 1.005;
      const sinPhi = Math.sin(phi);
      dotPos[i * 3] = r * sinPhi * Math.cos(theta);
      dotPos[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      dotPos[i * 3 + 2] = r * Math.cos(phi);
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
    const dotMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
    });
    const dotsMesh = new THREE.Points(dotGeo, dotMat);
    globeGroup.add(dotsMesh);

    // 5. Hub Pins & Beacons
    const hqPos = latLngToVector3(GLOBAL_HUBS[0].lat, GLOBAL_HUBS[0].lng, globeRadius);

    const hubMeshes: { hub: GlobalHub; mesh: THREE.Mesh; beacon: THREE.Mesh; pos: THREE.Vector3 }[] = [];

    GLOBAL_HUBS.forEach((hub) => {
      const pos = latLngToVector3(hub.lat, hub.lng, globeRadius);

      // Pin Head
      const pinGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: hub.hex });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.copy(pos);
      globeGroup.add(pin);

      // Pulsing Beacon Ring
      const bGeo = new THREE.RingGeometry(0.1, 0.16, 24);
      const bMat = new THREE.MeshBasicMaterial({ color: hub.hex, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
      const beacon = new THREE.Mesh(bGeo, bMat);
      beacon.position.copy(pos.clone().multiplyScalar(1.02));
      beacon.lookAt(pos.clone().multiplyScalar(2));
      globeGroup.add(beacon);

      hubMeshes.push({ hub, mesh: pin, beacon, pos });
    });

    // 6. 3D Bézier Arc Data Lines from HQ (Chennai) to all other hubs
    const arcCurves: { curve: THREE.QuadraticBezierCurve3; line: THREE.Line; pulsePos: number }[] = [];
    const arcGroup = new THREE.Group();
    globeGroup.add(arcGroup);

    for (let i = 1; i < GLOBAL_HUBS.length; i++) {
      const targetPos = latLngToVector3(GLOBAL_HUBS[i].lat, GLOBAL_HUBS[i].lng, globeRadius);

      // Midpoint elevated outward
      const mid = new THREE.Vector3().addVectors(hqPos, targetPos).multiplyScalar(0.5);
      const distance = hqPos.distanceTo(targetPos);
      mid.normalize().multiplyScalar(globeRadius + distance * 0.35);

      const curve = new THREE.QuadraticBezierCurve3(hqPos, mid, targetPos);
      const points = curve.getPoints(36);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const curveMat = new THREE.LineBasicMaterial({
        color: GLOBAL_HUBS[i].hex,
        transparent: true,
        opacity: 0.45,
      });
      const line = new THREE.Line(curveGeo, curveMat);
      arcGroup.add(line);

      arcCurves.push({ curve, line, pulsePos: (i / GLOBAL_HUBS.length) });
    }

    // Glowing Traveling Data Photons along arcs
    const photonGeo = new THREE.SphereGeometry(0.05, 12, 12);
    const photonMeshes: THREE.Mesh[] = [];
    arcCurves.forEach((arc, idx) => {
      const pMat = new THREE.MeshBasicMaterial({ color: GLOBAL_HUBS[idx + 1].hex });
      const p = new THREE.Mesh(photonGeo, pMat);
      globeGroup.add(p);
      photonMeshes.push(p);
    });

    // 7. Interactive Drag to Orbit with Momentum
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let velX = 0;
    let velY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      velX = 0;
      velY = 0;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      globeGroup.rotation.y += deltaX * 0.008;
      globeGroup.rotation.x += deltaY * 0.008;
      velX = deltaX * 0.008;
      velY = deltaY * 0.008;
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

    // Touch Support for mobile
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
      globeGroup.rotation.y += deltaX * 0.008;
      globeGroup.rotation.x += deltaY * 0.008;
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
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Inertia and Auto Rotation
      if (autoRotateRef.current && !isDragging) {
        globeGroup.rotation.y += 0.004;
      } else if (!isDragging) {
        velX *= 0.95;
        velY *= 0.95;
        globeGroup.rotation.y += velX;
        globeGroup.rotation.x += velY;
      }

      // Wireframe state
      wireMat.wireframe = wireframeRef.current;
      coreMesh.visible = !wireframeRef.current;

      // Pulse beacon rings
      const beaconScale = 1.0 + (Math.sin(elapsed * 4) + 1) * 0.35;
      hubMeshes.forEach((h) => {
        h.beacon.scale.set(beaconScale, beaconScale, 1);
      });

      // Animate photons along arcs
      arcCurves.forEach((arc, i) => {
        arc.pulsePos = (arc.pulsePos + 0.006) % 1.0;
        const p = photonMeshes[i];
        if (p) {
          const pt = arc.curve.getPoint(arc.pulsePos);
          p.position.copy(pt);
        }
      });

      // Atmospheric ring slow spin
      atmoRing.rotation.z = elapsed * 0.15;

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

  const handleSelectHub = (hub: GlobalHub) => {
    setSelectedHub(hub);
    soundFx.playHoloActivate();

    if (globeGroupRef.current) {
      // Calculate target Y rotation to face this hub toward the camera
      // lng to radians
      const targetRotY = -((hub.lng + 180) * (Math.PI / 180)) + Math.PI / 2;
      const targetRotX = (hub.lat * (Math.PI / 180)) * 0.4;
      globeGroupRef.current.rotation.y = targetRotY;
      globeGroupRef.current.rotation.x = targetRotX;
    }
  };

  return (
    <div style={{ marginBottom: '56px' }}>
      {/* View Header with Hub Switcher */}
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
          {GLOBAL_HUBS.map((hub) => (
            <button
              key={hub.id}
              onClick={() => handleSelectHub(hub)}
              className={`tab-btn ${selectedHub.id === hub.id ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '0.8rem',
                border: selectedHub.id === hub.id ? `1px solid ${hub.color}` : '1px solid rgba(76, 125, 255, 0.2)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: hub.color,
                  boxShadow: selectedHub.id === hub.id ? `0 0 8px ${hub.color}` : 'none',
                }}
              />
              <span>{hub.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
          // GLOBAL_SPATIAL_NETWORK_ACTIVE
        </div>
      </div>

      {/* 3D Interactive WebGL Globe Display (Desktop/Tablet) or Mobile Fallback */}
      {isMobile ? (
        <div
          style={{
            width: '100%',
            padding: '22px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface-card)',
            border: `1px solid ${selectedHub.color}55`,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} style={{ color: selectedHub.color }} />
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {selectedHub.name}
              </span>
            </div>
            <span
              className="badge"
              style={{
                background: `${selectedHub.color}22`,
                border: `1px solid ${selectedHub.color}`,
                color: selectedHub.color,
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              {selectedHub.partnerType}
            </span>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: selectedHub.color }}>
            {selectedHub.region} • GEO: [{selectedHub.lat.toFixed(2)}° N, {selectedHub.lng.toFixed(2)}° E]
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
            {selectedHub.scope}
          </p>
        </div>
      ) : (
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
                SPATIAL_NETWORK_TOPOLOGY // GLOBAL HUBS
              </span>
            </div>

            <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
              6 ACTIVE ALLIANCE NODES
            </span>
          </div>

          {/* Floating Hub Telemetry Card (VisionOS Frosted Card) */}
          <div
            style={{
              position: 'absolute',
              bottom: '72px',
              left: '20px',
              maxWidth: '420px',
              background: 'var(--surface-card)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${selectedHub.color}55`,
              borderRadius: 'var(--radius-md)',
              padding: '18px 22px',
              pointerEvents: 'none',
              boxShadow: `0 10px 30px rgba(0, 0, 0, 0.3), inset 0 0 12px ${selectedHub.color}15`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <MapPin size={16} style={{ color: selectedHub.color }} />
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedHub.name}
              </span>
            </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: selectedHub.color,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {selectedHub.partnerType}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>•</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {selectedHub.region}
            </span>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
            {selectedHub.scope}
          </p>

          <div
            style={{
              marginTop: '10px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>GEO_COORDS: [{selectedHub.lat.toFixed(2)}° N, {selectedHub.lng.toFixed(2)}° E]</span>
            <span style={{ color: selectedHub.color }}>BÉZIER ARC ACTIVE</span>
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
                background: autoRotate ? 'var(--accent-cyan-glow)' : 'var(--surface-card)',
                border: autoRotate ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                color: autoRotate ? 'var(--accent-cyan)' : 'var(--text-secondary)',
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
                background: wireframe ? 'var(--accent-cyan-glow)' : 'var(--surface-card)',
                border: wireframe ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                color: wireframe ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              }}
            >
              <Box size={14} style={{ marginRight: '6px' }} />
              <span>{wireframe ? 'SURFACE' : 'WIREFRAME'}</span>
            </button>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            DRAG GLOBE TO ROTATE 360° // CLICK HUBS TO FLY
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
