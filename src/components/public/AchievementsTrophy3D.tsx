'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Trophy, RotateCcw, Box, Sparkles, RefreshCw } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';
import { themeManager, Theme } from '@/lib/theme';

interface VoxelDef {
  target: THREE.Vector3;
  start: THREE.Vector3;
  delay: number; // 0.0 to 0.75
  color: THREE.Color;
  isStar?: boolean;
}

/**
 * Builds the geometric definition of a grand champion trophy composed of ~480 voxels.
 * Returns an array of voxel data with target positions, scattered start positions,
 * and height-based assembly delays for the pixel-by-pixel build animation.
 */
function generateTrophyVoxels(): VoxelDef[] {
  const voxels: VoxelDef[] = [];
  const goldBase = new THREE.Color(0xffd700);
  const goldDark = new THREE.Color(0xd97706);
  const goldLight = new THREE.Color(0xfef08a);
  const obsidian = new THREE.Color(0x0f172a);
  const cyanGlow = new THREE.Color(0x00f5ff);
  const pitch = 0.11; // spacing between voxel centers

  const addVoxel = (x: number, y: number, z: number, color: THREE.Color, isStar = false) => {
    // Height determines base-to-top assembly order, with a subtle radial spiral offset
    const normalizedY = (y + 1.8) / 3.4; // 0 (bottom) to 1 (top)
    const angle = Math.atan2(z, x);
    const spiralDelay = ((angle + Math.PI) / (Math.PI * 2)) * 0.12;
    const delay = THREE.MathUtils.clamp(normalizedY * 0.65 + spiralDelay, 0, 0.78);

    // Dispersed start coordinate in floating particle cloud
    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * 8.0,
      (Math.random() - 0.5) * 6.0 + 1.0,
      (Math.random() - 0.5) * 8.0
    ).normalize();
    const dist = 3.5 + Math.random() * 4.5;
    const start = dir.multiplyScalar(dist);

    voxels.push({
      target: new THREE.Vector3(x, y, z),
      start,
      delay,
      color,
      isStar,
    });
  };

  // 1. Plinth / Stepped Base (Obsidian with Gold Trim)
  // Tier 1 (Bottom 8x8)
  for (let ix = -3.5; ix <= 3.5; ix++) {
    for (let iz = -3.5; iz <= 3.5; iz++) {
      const isEdge = Math.abs(ix) >= 3 || Math.abs(iz) >= 3;
      addVoxel(ix * pitch, -1.65, iz * pitch, isEdge ? goldDark : obsidian);
    }
  }

  // Tier 2 (Middle 6x6)
  for (let ix = -2.5; ix <= 2.5; ix++) {
    for (let iz = -2.5; iz <= 2.5; iz++) {
      const isEdge = Math.abs(ix) >= 2 || Math.abs(iz) >= 2;
      addVoxel(ix * pitch, -1.52, iz * pitch, isEdge ? goldBase : obsidian);
    }
  }

  // Tier 3 (Upper 4x4)
  for (let ix = -1.5; ix <= 1.5; ix++) {
    for (let iz = -1.5; iz <= 1.5; iz++) {
      addVoxel(ix * pitch, -1.39, iz * pitch, goldBase);
    }
  }

  // 2. Pedestal Stem / Column
  const stemLayers = 8;
  for (let l = 0; l < stemLayers; l++) {
    const y = -1.25 + l * pitch;
    const ringRadius = 0.22 + Math.sin((l / stemLayers) * Math.PI) * 0.04;
    const segs = 10;
    for (let s = 0; s < segs; s++) {
      const theta = (s / segs) * Math.PI * 2;
      const x = Math.cos(theta) * ringRadius;
      const z = Math.sin(theta) * ringRadius;
      addVoxel(x, y, z, l % 2 === 0 ? goldBase : goldLight);
    }
  }

  // Pedestal Trim Ring
  for (let s = 0; s < 14; s++) {
    const theta = (s / 14) * Math.PI * 2;
    addVoxel(Math.cos(theta) * 0.38, -0.38, Math.sin(theta) * 0.38, goldDark);
  }

  // 3. Chalice Bowl / Cup (Expanding hollow bowl)
  const bowlLevels = [
    { y: -0.26, r: 0.44, count: 14 },
    { y: -0.14, r: 0.58, count: 16 },
    { y: -0.01, r: 0.72, count: 18 },
    { y: 0.12, r: 0.84, count: 20 },
    { y: 0.26, r: 0.92, count: 22 },
    { y: 0.40, r: 0.98, count: 22 },
    { y: 0.54, r: 1.02, count: 24 },
    { y: 0.68, r: 1.05, count: 24 },
    { y: 0.82, r: 1.08, count: 26 }, // Lip / Rim
  ];

  bowlLevels.forEach((lvl, lvlIdx) => {
    const isRim = lvlIdx === bowlLevels.length - 1;
    for (let i = 0; i < lvl.count; i++) {
      const theta = (i / lvl.count) * Math.PI * 2;
      const x = Math.cos(theta) * lvl.r;
      const z = Math.sin(theta) * lvl.r;
      const color = isRim ? goldLight : (lvlIdx % 2 === 0 ? goldBase : goldDark);
      addVoxel(x, lvl.y, z, color);
    }
  });

  // 4. Dual Curved Champion Handles (Left & Right)
  const handleSteps = 16;
  for (let i = 0; i < handleSteps; i++) {
    const t = i / (handleSteps - 1);
    // Parametric bezier-like curve for the handle
    const angle = t * Math.PI * 1.15;
    const hx = 1.05 + Math.sin(angle) * 0.52;
    const hy = 0.8 - t * 0.95 + Math.sin(t * Math.PI) * 0.18;
    const hz = 0;

    // Right Handle (+X)
    addVoxel(hx, hy, hz, goldBase);
    // Left Handle (-X)
    addVoxel(-hx, hy, hz, goldBase);
  }

  // 5. Crown Gem Star / Floating Core Crest (Cyan & Gold Diamond)
  const starCenterY = 0.55;
  const starRadius = 0.32;
  const starPts = [
    [0, 0, 0],
    [starRadius, 0, 0],
    [-starRadius, 0, 0],
    [0, starRadius * 1.3, 0],
    [0, -starRadius * 0.8, 0],
    [0, 0, starRadius],
    [0, 0, -starRadius],
    [starRadius * 0.6, starRadius * 0.6, 0],
    [-starRadius * 0.6, starRadius * 0.6, 0],
    [starRadius * 0.6, -starRadius * 0.4, 0],
    [-starRadius * 0.6, -starRadius * 0.4, 0],
    [0, starRadius * 0.6, starRadius * 0.6],
    [0, starRadius * 0.6, -starRadius * 0.6],
  ];

  starPts.forEach(([sx, sy, sz]) => {
    addVoxel(sx, starCenterY + sy, sz, cyanGlow, true);
  });

  return voxels;
}

export default function AchievementsTrophy3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [buildPercent, setBuildPercent] = useState(0);
  const [theme, setTheme] = useState<Theme>('dark');
  const isLight = theme === 'light';
  const rebuildTriggerRef = useRef(0);

  useEffect(() => {
    setTheme(themeManager.getTheme());
    const unsub = themeManager.subscribe((t) => setTheme(t));
    return unsub;
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const wireframeRef = useRef(false);
  const autoRotateRef = useRef(true);

  useEffect(() => {
    wireframeRef.current = wireframe;
  }, [wireframe]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  const handleRebuild = () => {
    soundFx.playHoloActivate();
    rebuildTriggerRef.current = Date.now();
  };

  useEffect(() => {
    if (isMobile || !mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth || 800;
    let height = container.clientHeight || 460;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const initialTheme = themeManager.getTheme();
    scene.fog = new THREE.FogExp2(initialTheme === 'light' ? 0xf1f5f9 : 0x050510, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 1.2, 5.8);
    camera.lookAt(0, -0.1, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting Rig
    const ambient = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff3c4, 1.8);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7dd3fc, 0.9);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    const rimCyan = new THREE.PointLight(0x00f5ff, 1.6, 16);
    rimCyan.position.set(0, 2.5, 2.5);
    scene.add(rimCyan);

    // 3. Trophy Group & Voxel InstancedMesh
    const trophyGroup = new THREE.Group();
    scene.add(trophyGroup);

    const voxelData = generateTrophyVoxels();
    const voxelCount = voxelData.length;

    // Cube Geometry for each voxel (beveled edge box)
    const boxSize = 0.088;
    const voxelGeo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);

    // PBR Gold Metallic Material
    const voxelMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.28,
      metalness: 0.85,
      clearcoat: 0.45,
      clearcoatRoughness: 0.15,
      reflectivity: 0.75,
    });

    const instancedMesh = new THREE.InstancedMesh(voxelGeo, voxelMat, voxelCount);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // Set individual voxel colors
    for (let i = 0; i < voxelCount; i++) {
      instancedMesh.setColorAt(i, voxelData[i].color);
    }
    if (instancedMesh.instanceColor) {
      instancedMesh.instanceColor.needsUpdate = true;
    }
    trophyGroup.add(instancedMesh);

    // Wireframe Overlay for toggle
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const wireframeMesh = new THREE.InstancedMesh(voxelGeo, wireframeMat, voxelCount);
    wireframeMesh.visible = false;
    trophyGroup.add(wireframeMesh);

    // Ambient Orbiting Sparkles
    const sparkleCount = 60;
    const sparkleGeo = new THREE.BufferGeometry();
    const sparklePos = new Float32Array(sparkleCount * 3);
    for (let s = 0; s < sparkleCount; s++) {
      const theta = Math.random() * Math.PI * 2;
      const sr = 1.4 + Math.random() * 1.8;
      const sy = (Math.random() - 0.5) * 3.2;
      sparklePos[s * 3] = Math.cos(theta) * sr;
      sparklePos[s * 3 + 1] = sy;
      sparklePos[s * 3 + 2] = Math.sin(theta) * sr;
    }
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
    const sparkleMat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
    trophyGroup.add(sparkles);

    // Circular Hologram Pedestal Base Platform
    const pedGeo = new THREE.CylinderGeometry(1.5, 1.6, 0.06, 36);
    const pedMat = new THREE.MeshStandardMaterial({
      color: initialTheme === 'light' ? 0xcfd8dc : 0x060b17,
      metalness: 0.8,
      roughness: 0.3,
    });
    const pedMesh = new THREE.Mesh(pedGeo, pedMat);
    pedMesh.position.y = -1.72;
    trophyGroup.add(pedMesh);

    const ringGeo = new THREE.RingGeometry(1.4, 1.46, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = -1.68;
    trophyGroup.add(ringMesh);

    // 4. Interactive Drag Orbit & Scroll Zoom
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetCamDist = 5.8;
    let userRotY = 0;
    let userRotX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      userRotY += deltaX * 0.008;
      userRotX = THREE.MathUtils.clamp(userRotX + deltaY * 0.006, -0.6, 0.8);
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetCamDist = THREE.MathUtils.clamp(targetCamDist + e.deltaY * 0.005, 3.6, 8.5);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Resize
    const onResize = () => {
      if (!mountRef.current) return;
      width = mountRef.current.clientWidth || 800;
      height = mountRef.current.clientHeight || 460;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // 5. Animation Loop with Pixel-by-Pixel Assembly Engine
    let animId: number;
    const timer = new THREE.Timer();
    const dummy = new THREE.Object3D();
    const tempPos = new THREE.Vector3();
    const buildDuration = 2.4; // 2.4 seconds to assemble from pixels
    let buildStartTime = 0;

    rebuildTriggerRef.current = Date.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      timer.update();
      const elapsed = timer.getElapsed();

      // Check if rebuild triggered
      if (rebuildTriggerRef.current > 0) {
        buildStartTime = elapsed;
        rebuildTriggerRef.current = 0;
      }

      // Calculate global build progress (0.0 to 1.0)
      const buildProgress = THREE.MathUtils.clamp((elapsed - buildStartTime) / buildDuration, 0, 1);
      const currentPct = Math.round(buildProgress * 100);
      setBuildPercent(currentPct);

      // Wireframe visibility toggle
      wireframeMesh.visible = wireframeRef.current;
      voxelMat.wireframe = wireframeRef.current;

      // Update every voxel's position based on its assembly order
      for (let i = 0; i < voxelCount; i++) {
        const v = voxelData[i];

        if (buildProgress < v.delay) {
          // Voxel has not started flying in yet; stay at start or scale 0
          dummy.position.copy(v.start);
          dummy.scale.setScalar(0.001);
        } else {
          // Voxel is flying into target position
          const localT = THREE.MathUtils.clamp((buildProgress - v.delay) / (1.0 - v.delay), 0, 1);
          // Ease-out cubic with slight snap
          const easeT = 1 - Math.pow(1 - localT, 3);

          tempPos.lerpVectors(v.start, v.target, easeT);
          dummy.position.copy(tempPos);

          // Pop-in scale bounce
          const scaleVal = localT < 0.2 ? localT * 5 : 1.0;
          dummy.scale.setScalar(scaleVal);

          // Micro rotation spin while in flight
          const rotOffset = (1 - easeT) * Math.PI * 2;
          dummy.rotation.set(rotOffset * 0.5, rotOffset, 0);

          if (v.isStar) {
            // Radiant core gem pulsates gently when assembled
            dummy.scale.setScalar(1.0 + Math.sin(elapsed * 4 + i) * 0.15);
          }
        }

        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
        if (wireframeRef.current) {
          wireframeMesh.setMatrixAt(i, dummy.matrix);
        }
      }
      instancedMesh.instanceMatrix.needsUpdate = true;
      if (wireframeRef.current) {
        wireframeMesh.instanceMatrix.needsUpdate = true;
      }

      // Sparkles floating rotation
      sparkles.rotation.y = elapsed * 0.3;

      // Trophy rotation (Auto-rotate or User drag)
      if (autoRotateRef.current && !isDragging) {
        userRotY += 0.006;
      }
      trophyGroup.rotation.y = THREE.MathUtils.lerp(trophyGroup.rotation.y, userRotY, 0.08);
      trophyGroup.rotation.x = THREE.MathUtils.lerp(trophyGroup.rotation.x, userRotX, 0.08);

      // Smooth camera zoom
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamDist, 0.08);

      renderer.render(scene, camera);
    };

    const unsubTheme = themeManager.subscribe((newTheme) => {
      if (newTheme === 'light') {
        scene.fog = new THREE.FogExp2(0xf1f5f9, 0.025);
        pedMat.color.set(0xcfd8dc);
      } else {
        scene.fog = new THREE.FogExp2(0x050510, 0.03);
        pedMat.color.set(0x060b17);
      }
    });

    animate();

    return () => {
      unsubTheme();
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      timer.dispose();
      renderer.dispose();
      voxelGeo.dispose();
      voxelMat.dispose();
      wireframeMat.dispose();
      pedGeo.dispose();
      pedMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      sparkleGeo.dispose();
      sparkleMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isMobile]);

  if (isMobile) {
    return (
      <div
        style={{
          width: '100%',
          padding: '24px 20px',
          borderRadius: 'var(--radius-lg)',
          background: isLight
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(241, 245, 249, 0.95))'
            : 'linear-gradient(135deg, rgba(6, 12, 24, 0.95), rgba(18, 24, 52, 0.95))',
          border: isLight ? '1px solid rgba(217, 119, 6, 0.35)' : '1px solid rgba(255, 215, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '40px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={18} style={{ color: isLight ? '#d97706' : '#ffd700' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: isLight ? '#b45309' : '#ffd700' }}>
              HALL OF HONORS // GRAND TROPHY
            </span>
          </div>
          <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
            SYNTHESIZED
          </span>
        </div>

        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          AR/VR CoE Grand Champion Trophy
        </div>

        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
          Materialized pixel-by-pixel from student hackathon victories, intellectual property patents, and research fellowships.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '56px' }}>
      {/* 3D Holographic Display Pod */}
      <div
        style={{
          width: '100%',
          height: '480px',
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          background: isLight
            ? 'radial-gradient(circle at center, rgba(255, 215, 0, 0.18) 0%, rgba(241, 245, 249, 0.95) 100%)'
            : 'radial-gradient(circle at center, rgba(255, 215, 0, 0.06) 0%, rgba(6, 11, 23, 0.95) 100%)',
          border: isLight ? '1px solid rgba(217, 119, 6, 0.35)' : '1px solid rgba(255, 215, 0, 0.28)',
          overflow: 'hidden',
          boxShadow: isLight
            ? '0 20px 50px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 215, 0, 0.4)'
            : '0 24px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 215, 0, 0.2)',
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
            <span
              className="beacon-dot"
              style={{ background: isLight ? '#d97706' : '#ffd700', boxShadow: isLight ? '0 0 8px #d97706' : '0 0 10px #ffd700' }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: isLight ? '#b45309' : '#ffd700',
                letterSpacing: '0.12em',
                textShadow: isLight ? 'none' : '0 0 10px rgba(255, 215, 0, 0.5)',
                fontWeight: 700,
              }}
            >
              SPATIAL HALL OF EXCELLENCE // VOXEL SYNTHESIS ENGINE
            </span>
          </div>

          <span
            className="badge"
            style={{
              background: isLight ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 215, 0, 0.15)',
              border: isLight ? '1px solid #d97706' : '1px solid #ffd700',
              color: isLight ? '#b45309' : '#ffd700',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            480 VOXEL MATRIX
          </span>
        </div>

        {/* Floating Specimen Description Card (Left Bottom) */}
        <div
          style={{
            position: 'absolute',
            bottom: '76px',
            left: '20px',
            maxWidth: '400px',
            background: isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(6, 12, 24, 0.88)',
            backdropFilter: 'blur(16px)',
            border: isLight ? '1px solid rgba(217, 119, 6, 0.35)' : '1px solid rgba(255, 215, 0, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            pointerEvents: 'none',
            boxShadow: isLight ? '0 10px 30px rgba(0, 0, 0, 0.08)' : '0 10px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Trophy size={18} style={{ color: isLight ? '#d97706' : '#ffd700' }} />
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              AR/VR CoE Grand Champion Trophy
            </div>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '8px' }}>
            Materialized pixel-by-pixel from student hackathon victories, intellectual property patents, and spatial research honors.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: isLight ? '#0284c7' : '#38bdf8' }}>
            <span>ASSEMBLY: {buildPercent}%</span>
            <div style={{ flex: 1, height: '4px', background: isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${buildPercent}%`,
                  background: 'linear-gradient(90deg, #ffd700, #00f5ff)',
                  transition: 'width 0.1s linear',
                }}
              />
            </div>
            <span>{buildPercent === 100 ? 'LOCKED' : 'SYNTHESIZING'}</span>
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
              onClick={handleRebuild}
              className="tab-btn"
              style={{
                padding: '7px 16px',
                fontSize: '0.78rem',
                background: isLight
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(2, 132, 199, 0.12))'
                  : 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(0, 245, 255, 0.15))',
                border: isLight ? '1px solid #d97706' : '1px solid #ffd700',
                color: isLight ? '#b45309' : '#ffd700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
              }}
            >
              <RefreshCw size={14} className={buildPercent < 100 ? 'animate-spin' : ''} />
              <span>REBUILD VOXEL TROPHY</span>
            </button>

            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className="tab-btn"
              style={{
                padding: '7px 14px',
                fontSize: '0.78rem',
                background: autoRotate ? 'rgba(255, 215, 0, 0.18)' : 'var(--surface-card-alt)',
                border: autoRotate ? '1px solid #ffd700' : '1px solid var(--border-subtle)',
                color: autoRotate ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              <RotateCcw size={14} style={{ marginRight: '6px' }} />
              <span>{autoRotate ? 'PAUSE ROTATION' : 'ORBIT 360°'}</span>
            </button>

            <button
              onClick={() => setWireframe(!wireframe)}
              className="tab-btn"
              style={{
                padding: '7px 14px',
                fontSize: '0.78rem',
                background: wireframe ? 'rgba(0, 245, 255, 0.2)' : 'var(--surface-card-alt)',
                border: wireframe ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                color: wireframe ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              <Box size={14} style={{ marginRight: '6px' }} />
              <span>{wireframe ? 'SOLID VOXELS' : 'WIREFRAME'}</span>
            </button>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            DRAG TO ROTATE 360° // SCROLL TO ZOOM
          </div>
        </div>
      </div>
    </div>
  );
}
