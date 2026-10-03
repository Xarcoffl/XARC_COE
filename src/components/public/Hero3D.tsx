'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Hero3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile or small viewport
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile || !mountRef.current) return;

    const currentMount = mountRef.current;
    const width = currentMount.clientWidth || 500;
    const height = currentMount.clientHeight || 480;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    currentMount.appendChild(renderer.domElement);

    // Master Group
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // --- 1. VR Headset Model (Procedural High-Tech Spatial Mesh) ---
    const headsetGroup = new THREE.Group();

    // Visor Body
    const visorGeo = new THREE.BoxGeometry(2.4, 1.2, 1.4, 4, 4, 4);
    // Smooth front rounding
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x090e1e,
      roughness: 0.25,
      metalness: 0.85,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    headsetGroup.add(visor);

    // Front Glass Faceplate (Glossy Spatial Reflective Shield)
    const plateGeo = new THREE.PlaneGeometry(2.35, 1.15);
    const plateMat = new THREE.MeshPhysicalMaterial({
      color: 0x050814,
      roughness: 0.05,
      metalness: 0.9,
      transmission: 0.3,
      transparent: true,
      opacity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const faceplate = new THREE.Mesh(plateGeo, plateMat);
    faceplate.position.z = 0.71;
    headsetGroup.add(faceplate);

    // Front Glowing LED Sensor Ring & Core Line
    const ledGeo = new THREE.TorusGeometry(0.35, 0.015, 16, 48);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x2bd9fe });
    const ledRing = new THREE.Mesh(ledGeo, ledMat);
    ledRing.position.z = 0.72;
    headsetGroup.add(ledRing);

    // Front Line
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.9, 0, 0.72),
      new THREE.Vector3(0.9, 0, 0.72),
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x4c7dff, transparent: true, opacity: 0.6 });
    const hudLine = new THREE.Line(lineGeo, lineMat);
    headsetGroup.add(hudLine);

    // Headband Straps
    const strapGeo = new THREE.TorusGeometry(1.5, 0.08, 16, 64, Math.PI);
    const strapMat = new THREE.MeshStandardMaterial({ color: 0x1a233a, roughness: 0.7 });
    const strap = new THREE.Mesh(strapGeo, strapMat);
    strap.rotation.x = Math.PI / 2;
    strap.position.z = -0.5;
    headsetGroup.add(strap);

    masterGroup.add(headsetGroup);

    // --- 2. Dual Spatial 6-DoF Controllers ---
    const createController = (isLeft: boolean) => {
      const cGroup = new THREE.Group();

      // Grip handle
      const gripGeo = new THREE.CylinderGeometry(0.12, 0.15, 1.1, 16);
      const gripMat = new THREE.MeshStandardMaterial({ color: 0x0c1326, roughness: 0.4, metalness: 0.6 });
      const grip = new THREE.Mesh(gripGeo, gripMat);
      cGroup.add(grip);

      // Tracking Ring on top
      const ringGeo = new THREE.TorusGeometry(0.38, 0.03, 16, 32);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x1f2b48, roughness: 0.3, metalness: 0.8 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 4;
      ring.position.set(0, 0.55, 0.15);
      cGroup.add(ring);

      // Trigger / LED accent on ring
      const ringLedGeo = new THREE.TorusGeometry(0.38, 0.008, 8, 32, Math.PI);
      const ringLedMat = new THREE.MeshBasicMaterial({ color: isLeft ? 0x2bd9fe : 0x8a63ff });
      const ringLed = new THREE.Mesh(ringLedGeo, ringLedMat);
      ringLed.rotation.x = Math.PI / 4;
      ringLed.rotation.z = Math.PI;
      ringLed.position.set(0, 0.55, 0.16);
      cGroup.add(ringLed);

      cGroup.position.set(isLeft ? -2.2 : 2.2, -0.6, 0.5);
      cGroup.rotation.set(0.2, isLeft ? 0.4 : -0.4, isLeft ? -0.15 : 0.15);
      return cGroup;
    };

    const leftController = createController(true);
    const rightController = createController(false);
    masterGroup.add(leftController);
    masterGroup.add(rightController);

    // --- 3. Holographic Coordinate Rings & Spatial Wireframe ---
    const holoRingGeo1 = new THREE.RingGeometry(3.1, 3.12, 64);
    const holoRingMat1 = new THREE.MeshBasicMaterial({
      color: 0x4c7dff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const holoRing1 = new THREE.Mesh(holoRingGeo1, holoRingMat1);
    holoRing1.rotation.x = Math.PI / 2.3;
    masterGroup.add(holoRing1);

    const holoRingGeo2 = new THREE.RingGeometry(3.6, 3.615, 64);
    const holoRingMat2 = new THREE.MeshBasicMaterial({
      color: 0x2bd9fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const holoRing2 = new THREE.Mesh(holoRingGeo2, holoRingMat2);
    holoRing2.rotation.x = Math.PI / 2.8;
    holoRing2.rotation.y = 0.3;
    masterGroup.add(holoRing2);

    // Subtle 3D Wireframe Icosahedron Sphere in background
    const icoGeo = new THREE.IcosahedronGeometry(4.2, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x4c7dff,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    masterGroup.add(icoMesh);

    // Floating Coordinate Particle Points
    const particleCount = 120;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 10;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x2bd9fe,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(particlePoints);

    // --- 4. Lighting System ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x4c7dff, 3.5, 15);
    blueLight.position.set(-4, 3, 4);
    scene.add(blueLight);

    const cyanLight = new THREE.PointLight(0x2bd9fe, 4.0, 15);
    cyanLight.position.set(4, -2, 3);
    scene.add(cyanLight);

    const violetLight = new THREE.DirectionalLight(0x8a63ff, 1.2);
    violetLight.position.set(0, 5, -2);
    scene.add(violetLight);

    // --- 5. Mouse Parallax (Clamped strictly to ±5° = ~0.087 rad) ---
    let targetRotX = 0;
    let targetRotY = 0;
    const maxRot = THREE.MathUtils.degToRad(5); // ±5° maximum allowed by spec #16

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = -(e.clientY / innerHeight) * 2 + 1;
      targetRotY = x * maxRot;
      targetRotX = -y * maxRot;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // --- 6. Animation Loop ---
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle autonomous spatial breathing
      headsetGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.08;
      leftController.position.y = -0.6 + Math.cos(elapsedTime * 1.4) * 0.07;
      rightController.position.y = -0.6 + Math.sin(elapsedTime * 1.3) * 0.07;

      // Slow orbital rotation of rings
      holoRing1.rotation.z = elapsedTime * 0.12;
      holoRing2.rotation.z = -elapsedTime * 0.08;
      icoMesh.rotation.y = elapsedTime * 0.04;

      // Damped parallax toward target (clamped to ±5°)
      masterGroup.rotation.y += (targetRotY - masterGroup.rotation.y) * 0.05;
      masterGroup.rotation.x += (targetRotX - masterGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!currentMount) return;
      const newW = currentMount.clientWidth;
      const newH = currentMount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isMobile]);

  // Mobile Fallback: lightweight, battery-saving spatial visual
  if (isMobile) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            border: '1px dashed rgba(43, 217, 254, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: 'radial-gradient(circle, rgba(76, 125, 255, 0.15) 0%, transparent 70%)',
          }}
        >
          <div
            style={{
              width: '210px',
              height: '210px',
              borderRadius: '50%',
              border: '1px solid rgba(138, 99, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              textAlign: 'center',
              padding: '16px',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
              [ SPATIAL COMPUTING ]
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              XR • 6-DoF • 3D
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              AR/VR Centre of Excellence
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="hero-3d-container"
      style={{
        cursor: 'grab',
      }}
    >
      <div className="tech-coord">POS: [0, 0, 8.5] • ROT_CLAMP: ±5° • FOV: 45°</div>
    </div>
  );
}
