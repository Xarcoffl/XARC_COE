'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface JourneyTunnel3DProps {
  activeStep: number; // 0 to 6
  onSelectStep: (step: number) => void;
}

export default function JourneyTunnel3D({ activeStep, onSelectStep }: JourneyTunnel3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef(activeStep);
  const targetCamZRef = useRef(3.8);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    activeStepRef.current = activeStep;
    targetCamZRef.current = -(activeStep * 6) + 3.8;
  }, [activeStep]);

  useEffect(() => {
    if (isMobile || !mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth || 600;
    let height = container.clientHeight || 280;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 70);
    camera.position.set(0, 0.4, 3.8);

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
    const ambient = new THREE.AmbientLight(0x0e172a, 3.0);
    scene.add(ambient);

    const cyanPoint = new THREE.PointLight(0x00ffff, 4.5, 30);
    scene.add(cyanPoint);

    const violetPoint = new THREE.PointLight(0x7b61ff, 3.5, 30);
    scene.add(violetPoint);

    // 3. Cyber Conduit Tunnel (7 Gateway Rings + Conduit Beams)
    const conduitGroup = new THREE.Group();
    scene.add(conduitGroup);

    // Connecting Longitudinal Beams
    const beamGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.8, 1.8, 5),
      new THREE.Vector3(-2.8, 1.8, -42),
    ]);
    const beamMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.35 });
    conduitGroup.add(new THREE.Line(beamGeo, beamMat));

    const beamGeo2 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(2.8, 1.8, 5),
      new THREE.Vector3(2.8, 1.8, -42),
    ]);
    conduitGroup.add(new THREE.Line(beamGeo2, beamMat));

    const beamGeo3 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -1.8, 5),
      new THREE.Vector3(0, -1.8, -42),
    ]);
    conduitGroup.add(new THREE.Line(beamGeo3, beamMat));

    // 4. Seven Gateways & Milestone Artifacts
    const stageRings: THREE.Mesh[] = [];
    const artifacts: THREE.Group[] = [];

    const stageColors = [0x00ffff, 0x38bdf8, 0x818cf8, 0xa855f7, 0xf59e0b, 0x10b981, 0x00ffff];

    for (let i = 0; i < 7; i++) {
      const stageZ = -(i * 6);

      // Gateway Torus Ring
      const ringGeo = new THREE.TorusGeometry(2.4, 0.06, 16, 48);
      const ringMat = new THREE.MeshStandardMaterial({
        color: stageColors[i],
        emissive: stageColors[i],
        emissiveIntensity: 0.4,
        roughness: 0.2,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, 0, stageZ);
      conduitGroup.add(ring);
      stageRings.push(ring);

      // Milestone Artifact Group
      const artGroup = new THREE.Group();
      artGroup.position.set(0, 0, stageZ);

      if (i === 0) {
        // Stage 01 (Explore): 3D Gyroscope Compass
        const g1 = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.03, 16, 36), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
        const g2 = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.03, 16, 36), new THREE.MeshBasicMaterial({ color: 0x7b61ff }));
        g2.rotation.x = Math.PI / 2;
        const gCore = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
        artGroup.add(g1);
        artGroup.add(g2);
        artGroup.add(gCore);
      } else if (i === 1) {
        // Stage 02 (Learn): Holographic Data Tome / Matrix Crystal
        const crystalGeo = new THREE.OctahedronGeometry(0.95, 1);
        const crystalMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          wireframe: true,
          emissive: 0x0284c7,
          emissiveIntensity: 0.6,
        });
        const crystal = new THREE.Mesh(crystalGeo, crystalMat);
        artGroup.add(crystal);
      } else if (i === 2) {
        // Stage 03 (Practice): Shader Prism with Refracting Beams
        const prismGeo = new THREE.ConeGeometry(0.85, 1.4, 4);
        const prismMat = new THREE.MeshPhysicalMaterial({
          color: 0x818cf8,
          roughness: 0.1,
          transmission: 0.8,
          transparent: true,
          opacity: 0.85,
        });
        const prism = new THREE.Mesh(prismGeo, prismMat);
        artGroup.add(prism);
      } else if (i === 3) {
        // Stage 04 (Build): Voxel Prototype Core with Interlocking Cubes
        const voxelGroup = new THREE.Group();
        const vMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, metalness: 0.8, roughness: 0.2 });
        [-0.4, 0.4].forEach((vx) => {
          [-0.4, 0.4].forEach((vy) => {
            const cube = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), vMat);
            cube.position.set(vx, vy, 0);
            voxelGroup.add(cube);
          });
        });
        artGroup.add(voxelGroup);
      } else if (i === 4) {
        // Stage 05 (Compete): Gold Cyber Trophy
        const tBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 0.3, 16), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 }));
        tBase.position.y = -0.5;
        const tCup = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.9, 16), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 }));
        tCup.rotation.x = Math.PI;
        tCup.position.y = 0.2;
        const tHandles = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.04, 16, 32), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
        tHandles.position.y = 0.2;
        artGroup.add(tBase);
        artGroup.add(tCup);
        artGroup.add(tHandles);
      } else if (i === 6) {
        // Stage 07 (Industry): Spatial Spire Tower
        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.6, 2.0, 16), new THREE.MeshStandardMaterial({ color: 0x00ffff, metalness: 0.9 }));
        const laserPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 8, 12), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
        laserPillar.position.y = 4.0;
        artGroup.add(spire);
        artGroup.add(laserPillar);
      } else {
        // Stage 06 (Intern): Precision Drive Gear
        const gear = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.15, 16, 32), new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.85 }));
        const teeth = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.05, 8, 16), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
        artGroup.add(gear);
        artGroup.add(teeth);
      }

      conduitGroup.add(artGroup);
      artifacts.push(artGroup);
    }

    // 5. Interactive Drag Scrubbing
    let isDragging = false;
    let prevMouseX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      prevMouseX = e.clientX;
      if (Math.abs(deltaX) > 15) {
        if (deltaX < 0 && activeStepRef.current < 6) {
          onSelectStep(activeStepRef.current + 1);
        } else if (deltaX > 0 && activeStepRef.current > 0) {
          onSelectStep(activeStepRef.current - 1);
        }
      }
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
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      prevMouseX = e.touches[0].clientX;
      if (Math.abs(deltaX) > 20) {
        if (deltaX < 0 && activeStepRef.current < 6) {
          onSelectStep(activeStepRef.current + 1);
        } else if (deltaX > 0 && activeStepRef.current > 0) {
          onSelectStep(activeStepRef.current - 1);
        }
      }
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    domEl.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Resize
    const onResize = () => {
      if (!mountRef.current) return;
      width = mountRef.current.clientWidth || 600;
      height = mountRef.current.clientHeight || 280;
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

      // Smooth camera glide along Z axis to target
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZRef.current, 0.08);

      const lookTargetZ = -(activeStepRef.current * 6);
      camera.lookAt(0, 0, lookTargetZ);

      // Light positions follow camera
      cyanPoint.position.set(2, 2, camera.position.z);
      violetPoint.position.set(-2, -1, camera.position.z);

      // Animate Artifacts
      artifacts.forEach((art, idx) => {
        const isCurrent = idx === activeStepRef.current;
        art.rotation.y += isCurrent ? 0.025 : 0.008;

        if (isCurrent) {
          const s = 1.0 + Math.sin(elapsed * 3.5) * 0.06;
          art.scale.set(s, s, s);
        } else {
          art.scale.set(0.75, 0.75, 0.75);
        }
      });

      // Gateway Rings glow modulation
      stageRings.forEach((r, idx) => {
        const isCurrent = idx === activeStepRef.current;
        const mat = r.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = isCurrent ? 0.9 : 0.2;
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
  }, []);

  if (isMobile) {
    return (
      <div
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="beacon-dot" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
              STAGE 0{activeStep + 1} OF 07
            </span>
          </div>
          <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
            MOBILE PIPELINE
          </span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'var(--surface-card-alt)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${((activeStep + 1) / 7) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-violet))',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span>DISCOVERY</span>
          <span style={{ color: 'var(--accent-cyan)' }}>DEPLOYMENT</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '260px',
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        background: 'radial-gradient(circle at center, rgba(0, 255, 255, 0.08) 0%, var(--surface-card) 100%)',
        border: '1px solid rgba(0, 255, 255, 0.25)',
        overflow: 'hidden',
        cursor: 'ew-resize',
        marginBottom: '24px',
      }}
    >
      {/* 3D Canvas */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Header Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '14px',
          right: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="beacon-dot" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)', letterSpacing: '0.08em' }}>
            SPATIAL_PROGRESSION_CONDUIT // GATEWAY 0{activeStep + 1} OF 07
          </span>
        </div>
        <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
          SWIPE / CLICK STEP TO TRAVEL
        </span>
      </div>

      {/* Bottom Footer Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '14px',
          right: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          fontSize: '0.68rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span>CONDUIT VELOCITY: HYPERDRIVE_LERP</span>
        <span style={{ color: 'var(--accent-cyan)' }}>REAL-TIME 3D HOLOGRAPHIC PIPELINE</span>
      </div>
    </div>
  );
}
