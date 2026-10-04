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
        // Stage 01 (Explore): Spatial XR Headset & Discovery Compass Beacon
        const hBody = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 0.8, 0.9),
          new THREE.MeshStandardMaterial({ color: 0x070b18, metalness: 0.9, roughness: 0.25 })
        );
        artGroup.add(hBody);

        const visor = new THREE.Mesh(
          new THREE.PlaneGeometry(1.5, 0.7),
          new THREE.MeshPhysicalMaterial({
            color: 0x00ffff,
            roughness: 0.05,
            metalness: 0.95,
            transmission: 0.5,
            transparent: true,
            opacity: 0.9,
          })
        );
        visor.position.z = 0.46;
        artGroup.add(visor);

        [-0.35, 0.35].forEach((lx) => {
          const lensRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.18, 0.02, 16, 32),
            new THREE.MeshBasicMaterial({ color: 0x00ffff })
          );
          lensRing.position.set(lx, 0, 0.47);
          artGroup.add(lensRing);
        });

        const strap = new THREE.Mesh(
          new THREE.TorusGeometry(0.95, 0.07, 16, 36, Math.PI * 1.2),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 })
        );
        strap.rotation.x = Math.PI / 2;
        strap.rotation.z = -Math.PI * 0.1;
        strap.position.set(0, 0, -0.3);
        artGroup.add(strap);

        const compassRing1 = new THREE.Mesh(
          new THREE.TorusGeometry(1.5, 0.02, 16, 48),
          new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.7 })
        );
        compassRing1.rotation.x = Math.PI / 3;
        artGroup.add(compassRing1);

        const compassRing2 = new THREE.Mesh(
          new THREE.TorusGeometry(1.65, 0.015, 16, 48),
          new THREE.MeshBasicMaterial({ color: 0x7b61ff, transparent: true, opacity: 0.6 })
        );
        compassRing2.rotation.y = Math.PI / 4;
        artGroup.add(compassRing2);

        artGroup.userData.onAnimate = () => {
          compassRing1.rotation.z += 0.015;
          compassRing2.rotation.z -= 0.012;
        };
      } else if (i === 1) {
        // Stage 02 (Learn): Holographic Knowledge Codex & 3D Math Matrix Tome
        const leftPage = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 1.2, 0.05),
          new THREE.MeshStandardMaterial({ color: 0x0369a1, metalness: 0.8, roughness: 0.2 })
        );
        leftPage.position.set(-0.48, 0, 0);
        leftPage.rotation.y = 0.35;
        artGroup.add(leftPage);

        const rightPage = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 1.2, 0.05),
          new THREE.MeshStandardMaterial({ color: 0x0369a1, metalness: 0.8, roughness: 0.2 })
        );
        rightPage.position.set(0.48, 0, 0);
        rightPage.rotation.y = -0.35;
        artGroup.add(rightPage);

        for (let l = 0; l < 4; l++) {
          const l1 = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.035), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
          l1.position.set(-0.48, 0.35 - l * 0.18, 0.035);
          l1.rotation.y = 0.35;
          artGroup.add(l1);

          const l2 = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.035), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
          l2.position.set(0.48, 0.35 - l * 0.18, 0.035);
          l2.rotation.y = -0.35;
          artGroup.add(l2);
        }

        const mathCore = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.45, 1),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true })
        );
        mathCore.position.set(0, 0.15, 0.45);
        artGroup.add(mathCore);

        const axisX = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.7, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
        axisX.rotation.z = Math.PI / 2;
        axisX.position.set(0, 0.15, 0.45);
        artGroup.add(axisX);

        const axisY = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.7, 8), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
        axisY.position.set(0, 0.15, 0.45);
        artGroup.add(axisY);

        const axisZ = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.7, 8), new THREE.MeshBasicMaterial({ color: 0x3b82f6 }));
        axisZ.rotation.x = Math.PI / 2;
        axisZ.position.set(0, 0.15, 0.45);
        artGroup.add(axisZ);

        artGroup.userData.onAnimate = () => {
          mathCore.rotation.y += 0.02;
          mathCore.rotation.x += 0.015;
        };
      } else if (i === 2) {
        // Stage 03 (Practice): Precision Laser Shader Prism & Spectrum Refractor Rig
        const prismGeo = new THREE.ConeGeometry(0.9, 1.4, 3);
        const prismMat = new THREE.MeshPhysicalMaterial({
          color: 0x818cf8,
          roughness: 0.05,
          metalness: 0.9,
          transmission: 0.85,
          transparent: true,
          opacity: 0.85,
        });
        const prism = new THREE.Mesh(prismGeo, prismMat);
        prism.rotation.y = Math.PI / 6;
        artGroup.add(prism);

        const prismBase = new THREE.Mesh(
          new THREE.CylinderGeometry(0.8, 0.9, 0.15, 3),
          new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.8, roughness: 0.2 })
        );
        prismBase.position.y = -0.75;
        prismBase.rotation.y = Math.PI / 6;
        artGroup.add(prismBase);

        const inLaser = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 1.8, 8),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        inLaser.position.set(-1.1, 0, 0);
        inLaser.rotation.z = Math.PI / 2;
        artGroup.add(inLaser);

        const spectralColors = [0x00ffff, 0x10b981, 0xf59e0b, 0xec4899];
        const beamAngles = [-0.35, -0.12, 0.12, 0.35];
        spectralColors.forEach((col, sIdx) => {
          const outBeam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 1.6, 8),
            new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85 })
          );
          outBeam.position.set(0.9, beamAngles[sIdx] * 0.9, 0);
          outBeam.rotation.z = Math.PI / 2 + beamAngles[sIdx];
          artGroup.add(outBeam);
        });

        const apRing = new THREE.Mesh(
          new THREE.TorusGeometry(1.6, 0.02, 16, 48),
          new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.7 })
        );
        artGroup.add(apRing);
      } else if (i === 3) {
        // Stage 04 (Build): Articulated Robotic Prototyping Arm & Voxel Construct
        const robotBase = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.65, 0.25, 16),
          new THREE.MeshStandardMaterial({ color: 0x3b0764, metalness: 0.9, roughness: 0.2 })
        );
        robotBase.position.y = -0.85;
        artGroup.add(robotBase);

        const arm1 = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 0.9, 0.18),
          new THREE.MeshStandardMaterial({ color: 0xa855f7, metalness: 0.8, roughness: 0.25 })
        );
        arm1.position.set(-0.25, -0.4, 0);
        arm1.rotation.z = 0.45;
        artGroup.add(arm1);

        const arm2 = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.85, 0.14),
          new THREE.MeshStandardMaterial({ color: 0xd8b4fe, metalness: 0.7, roughness: 0.2 })
        );
        arm2.position.set(-0.05, 0.25, 0);
        arm2.rotation.z = -0.4;
        artGroup.add(arm2);

        const clawMat = new THREE.MeshStandardMaterial({ color: 0xf3e8ff, metalness: 0.9 });
        [-0.12, 0.12].forEach((cx) => {
          const claw = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.25, 0.08), clawMat);
          claw.position.set(0.15 + cx, 0.62, 0);
          artGroup.add(claw);
        });

        const voxelGroup = new THREE.Group();
        voxelGroup.position.set(0.15, 0.42, 0);
        const vMat = new THREE.MeshStandardMaterial({
          color: 0xa855f7,
          emissive: 0x9333ea,
          emissiveIntensity: 0.5,
          metalness: 0.85,
          roughness: 0.15,
        });

        [-0.18, 0.18].forEach((vx) => {
          [-0.18, 0.18].forEach((vy) => {
            const cube = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), vMat);
            cube.position.set(vx, vy, 0);
            voxelGroup.add(cube);
          });
        });
        artGroup.add(voxelGroup);

        artGroup.userData.onAnimate = () => {
          voxelGroup.rotation.y += 0.03;
          voxelGroup.rotation.x += 0.02;
        };
      } else if (i === 4) {
        // Stage 05 (Compete): Grand Hackathon Cyber Champion Trophy
        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.95,
          roughness: 0.18,
          emissive: 0xd97706,
          emissiveIntensity: 0.4,
        });

        const tBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.72, 0.35, 6), goldMat);
        tBase.position.y = -0.7;
        artGroup.add(tBase);

        const tStem = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.5, 12), goldMat);
        tStem.position.y = -0.32;
        artGroup.add(tStem);

        const tCup = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.18, 0.85, 24), goldMat);
        tCup.position.y = 0.25;
        artGroup.add(tCup);

        const tHandles = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.05, 16, 32), goldMat);
        tHandles.position.y = 0.25;
        artGroup.add(tHandles);

        const star = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.3, 0),
          new THREE.MeshStandardMaterial({
            color: 0xfffbeb,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.9,
            metalness: 0.9,
          })
        );
        star.position.y = 0.85;
        artGroup.add(star);

        const laurelRing = new THREE.Mesh(
          new THREE.TorusGeometry(1.3, 0.02, 16, 48),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.75 })
        );
        laurelRing.rotation.x = Math.PI / 4;
        artGroup.add(laurelRing);

        artGroup.userData.onAnimate = (elapsed: number) => {
          star.rotation.y += 0.04;
          star.position.y = 0.85 + Math.sin(elapsed * 4.0) * 0.08;
          laurelRing.rotation.z += 0.02;
        };
      } else if (i === 5) {
        // Stage 06 (Intern): Industrial Neural Microprocessor Core & Meshing Gears
        const chipMat = new THREE.MeshStandardMaterial({
          color: 0x064e3b,
          metalness: 0.85,
          roughness: 0.2,
          emissive: 0x059669,
          emissiveIntensity: 0.35,
        });

        const die = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.15), chipMat);
        artGroup.add(die);

        const wireMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 });
        for (let w = 0; w < 4; w++) {
          const sideWire = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.03, 0.05), wireMat);
          if (w === 0) sideWire.position.set(0, 0.65, 0.08);
          if (w === 1) sideWire.position.set(0, -0.65, 0.08);
          if (w === 2) {
            sideWire.rotation.z = Math.PI / 2;
            sideWire.position.set(0.65, 0, 0.08);
          }
          if (w === 3) {
            sideWire.rotation.z = Math.PI / 2;
            sideWire.position.set(-0.65, 0, 0.08);
          }
          artGroup.add(sideWire);
        }

        const gear1 = new THREE.Mesh(
          new THREE.TorusGeometry(0.55, 0.1, 16, 24),
          new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.9 })
        );
        gear1.position.set(-0.55, -0.55, 0.2);
        artGroup.add(gear1);

        const gear2 = new THREE.Mesh(
          new THREE.TorusGeometry(0.4, 0.08, 16, 20),
          new THREE.MeshStandardMaterial({ color: 0x34d399, metalness: 0.85 })
        );
        gear2.position.set(0.5, 0.5, 0.2);
        artGroup.add(gear2);

        artGroup.userData.onAnimate = () => {
          gear1.rotation.z += 0.025;
          gear2.rotation.z -= 0.035;
        };
      } else {
        // Stage 07 (Industry): Metropolitan Spatial Spire & Global Transceiver Hub
        const spireGroup = new THREE.Group();

        const b1 = new THREE.Mesh(
          new THREE.CylinderGeometry(0.6, 0.8, 1.0, 8),
          new THREE.MeshStandardMaterial({ color: 0x0e7490, metalness: 0.9, roughness: 0.2 })
        );
        b1.position.y = -0.7;
        spireGroup.add(b1);

        const b2 = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.55, 1.0, 8),
          new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.85, roughness: 0.2 })
        );
        b2.position.y = 0.2;
        spireGroup.add(b2);

        const needle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.2, 1.2, 8),
          new THREE.MeshStandardMaterial({ color: 0x22d3ee, metalness: 0.95 })
        );
        needle.position.y = 1.2;
        spireGroup.add(needle);

        const dish = new THREE.Mesh(
          new THREE.SphereGeometry(0.35, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
          new THREE.MeshStandardMaterial({ color: 0x00ffff, metalness: 0.8, side: THREE.DoubleSide })
        );
        dish.position.set(0.45, 0.5, 0.2);
        dish.rotation.x = Math.PI / 3;
        dish.rotation.z = Math.PI / 4;
        spireGroup.add(dish);

        const beam = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 7, 12),
          new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.75 })
        );
        beam.position.y = 4.5;
        spireGroup.add(beam);

        artGroup.add(spireGroup);
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
    const timer = new THREE.Timer();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      timer.update();
      const elapsed = timer.getElapsed();

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

        if (art.userData.onAnimate) {
          art.userData.onAnimate(elapsed, isCurrent);
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
      timer.dispose();
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
