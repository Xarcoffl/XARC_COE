'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface LabIsometricTwin3DProps {
  activeNodeId: string;
  onSelectNode: (nodeId: string) => void;
}

export default function LabIsometricTwin3D({ activeNodeId, onSelectNode }: LabIsometricTwin3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef(activeNodeId);
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    activeIdRef.current = activeNodeId;
  }, [activeNodeId]);

  useEffect(() => {
    if (isMobile || !mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth || 600;
    let height = container.clientHeight || 340;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.02);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    // Isometric angle
    camera.position.set(12, 10, 14);
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
    const ambient = new THREE.AmbientLight(0x0e172a, 3.0);
    scene.add(ambient);

    const cyanLight = new THREE.PointLight(0x00ffff, 4.0, 35);
    cyanLight.position.set(0, 8, 0);
    scene.add(cyanLight);

    const blueLight = new THREE.DirectionalLight(0x4c7dff, 1.5);
    blueLight.position.set(10, 15, 10);
    scene.add(blueLight);

    // 3. Isometric Floor & Grid
    const floorGrid = new THREE.GridHelper(18, 18, 0x00ffff, 0x1e293b);
    floorGrid.position.y = -0.01;
    scene.add(floorGrid);

    // Outer boundary walls (holographic perimeter)
    const wallGeo = new THREE.BoxGeometry(18, 0.6, 18);
    const wallEdges = new THREE.EdgesGeometry(wallGeo);
    const wallLine = new THREE.LineSegments(wallEdges, new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.35 }));
    wallLine.position.y = 0.3;
    scene.add(wallLine);

    // 4. Lab Pod Nodes Definitions (Positions in 3D Space)
    const podDefs = [
      { id: 'self-learning', x: -5, z: -5, title: 'Async Pods', color: 0x00ffff },
      { id: 'project-work', x: 0, z: -5, title: 'Agile Teams', color: 0x7b61ff },
      { id: '3d-dev', x: 5, z: -5, title: 'GPU Workstations', color: 0x00ffff },
      { id: 'hackathons', x: -5, z: 2, title: 'Sprint Warfare', color: 0xff00ff },
      { id: 'xr-dev', x: 0, z: 1, title: '6-DoF Roomscale', color: 0x00ffff },
      { id: 'testing', x: 5, z: 2, title: 'QA & Motion Rig', color: 0x7b61ff },
      { id: 'industry', x: 0, z: 6, title: 'Client Bay', color: 0x00ffff },
    ];

    const podsGroup = new THREE.Group();
    scene.add(podsGroup);

    const podMeshes: { id: string; mesh: THREE.Group; lightPillar: THREE.Mesh; x: number; z: number }[] = [];

    podDefs.forEach((p) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(p.x, 0, p.z);

      // Pod Base Plinth
      const plinthGeo = new THREE.BoxGeometry(3.2, 0.25, 3.2);
      const plinthMat = new THREE.MeshStandardMaterial({
        color: 0x0b1329,
        roughness: 0.3,
        metalness: 0.8,
      });
      const plinth = new THREE.Mesh(plinthGeo, plinthMat);
      plinth.position.y = 0.125;
      pGroup.add(plinth);

      // Border outline
      const edges = new THREE.EdgesGeometry(plinthGeo);
      const border = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: p.color }));
      border.position.y = 0.125;
      pGroup.add(border);

      // Central Terminal Structure
      const termGeo = new THREE.BoxGeometry(1.2, 0.9, 1.2);
      const termMat = new THREE.MeshStandardMaterial({
        color: 0x070c18,
        emissive: p.color,
        emissiveIntensity: 0.2,
      });
      const term = new THREE.Mesh(termGeo, termMat);
      term.position.y = 0.7;
      pGroup.add(term);

      // Vertical Beacon Pillar (lights up when active)
      const pillarGeo = new THREE.CylinderGeometry(0.3, 0.3, 4.5, 16);
      const pillarMat = new THREE.MeshBasicMaterial({
        color: p.color,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.y = 2.4;
      pGroup.add(pillar);

      // Top floating marker dot
      const dotGeo = new THREE.SphereGeometry(0.14, 12, 12);
      const dotMat = new THREE.MeshBasicMaterial({ color: p.color });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.y = 4.7;
      pGroup.add(dot);

      podsGroup.add(pGroup);
      podMeshes.push({ id: p.id, mesh: pGroup, lightPillar: pillar, x: p.x, z: p.z });
    });

    // 5. Interactive Drag & Mouse Orbit
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
      scene.rotation.y += deltaX * 0.008;
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
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      scene.rotation.y += deltaX * 0.008;
      prevMouseX = e.touches[0].clientX;
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
      height = mountRef.current.clientHeight || 340;
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

      // Find active pod
      const currId = activeIdRef.current;
      const activeObj = podMeshes.find((p) => p.id === currId);

      podMeshes.forEach((p) => {
        const isCurrent = p.id === currId;
        const mat = p.lightPillar.material as THREE.MeshBasicMaterial;
        if (isCurrent) {
          mat.opacity = 0.55 + Math.sin(elapsed * 4.0) * 0.2;
          p.mesh.position.y = Math.sin(elapsed * 2.0) * 0.08;
        } else {
          mat.opacity = 0.12;
          p.mesh.position.y = 0;
        }
      });

      // Smooth camera look target towards active pod
      if (activeObj) {
        cameraTargetRef.current.x = THREE.MathUtils.lerp(cameraTargetRef.current.x, activeObj.x * 0.4, 0.04);
        cameraTargetRef.current.z = THREE.MathUtils.lerp(cameraTargetRef.current.z, activeObj.z * 0.4, 0.04);
        camera.lookAt(cameraTargetRef.current);
      }

      // Gentle auto-rotation when user is idle
      if (!isDragging) {
        scene.rotation.y += 0.002;
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

  if (isMobile) {
    return (
      <div
        style={{
          width: '100%',
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '8px',
        }}
      >
        <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>
          PHYSICAL LAB TWIN // FLOORPLAN
        </span>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          7 Active Research Pods
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Interactive 3D isometric twin available on desktop and tablet devices.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '320px',
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        background: 'radial-gradient(circle at center, rgba(0, 255, 255, 0.06) 0%, var(--surface-card) 100%)',
        border: '1px solid rgba(0, 255, 255, 0.25)',
        overflow: 'hidden',
        cursor: 'grab',
        marginBottom: '24px',
      }}
    >
      {/* 3D Canvas Mount */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Header Overlay */}
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
            HOLOGRAPHIC_LAB_TWIN // ISOMETRIC_PROJECTION
          </span>
        </div>
        <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
          DRAG TO ORBIT 360°
        </span>
      </div>

      {/* Footer Overlay */}
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
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span>PHYSICAL FLOORPLAN: 7 ACTIVE HARDWARE PODS</span>
        <span style={{ color: 'var(--accent-cyan)' }}>VOLUMETRIC LIGHT BEAMS ACTIVE</span>
      </div>
    </div>
  );
}
