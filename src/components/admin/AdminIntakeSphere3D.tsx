'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { StudentRequest } from '@/lib/types';
import { RotateCcw, Box, Radio, Filter, Users, Layers, Sparkles } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

interface AdminIntakeSphere3DProps {
  requests: StudentRequest[];
  selectedDepartment: string;
  onSelectDepartment: (dept: string) => void;
}

const DEPARTMENTS = [
  { name: 'Computer Science and Engineering', short: 'CSE', color: '#00f5ff', hex: 0x00f5ff },
  { name: 'Information Technology', short: 'IT', color: '#38bdf8', hex: 0x38bdf8 },
  { name: 'Artificial Intelligence and Data Science', short: 'AI&DS', color: '#8a2be2', hex: 0x8a2be2 },
  { name: 'Electronics and Communication Engineering', short: 'ECE', color: '#f59e0b', hex: 0xf59e0b },
  { name: 'Mechanical Engineering', short: 'MECH', color: '#4ade80', hex: 0x4ade80 },
  { name: 'Cyber Security', short: 'CYBER', color: '#ec4899', hex: 0xec4899 },
];

export default function AdminIntakeSphere3D({
  requests,
  selectedDepartment,
  onSelectDepartment,
}: AdminIntakeSphere3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const wireframeRef = useRef(false);
  const autoRotateRef = useRef(true);
  const sphereGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    wireframeRef.current = wireframe;
  }, [wireframe]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Calculate counts per department
  const deptCounts: { [key: string]: number } = {};
  requests.forEach((r) => {
    deptCounts[r.department] = (deptCounts[r.department] || 0) + 1;
  });

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth || 800;
    let height = container.clientHeight || 320;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060814, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 60);
    camera.position.set(0, 1.6, 6.4);
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

    // 2. Lighting Rig
    const ambient = new THREE.AmbientLight(0x0f172a, 3.2);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0x00f5ff, 4.5, 25);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x8a2be2, 3.5, 25);
    rimLight.position.set(-5, -2, 4);
    scene.add(rimLight);

    // 3. Sphere Master Group
    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);
    sphereGroupRef.current = sphereGroup;

    const materials: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[] = [];

    // Inner Luminous Core
    const coreGeo = new THREE.SphereGeometry(1.2, 24, 24);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x0369a1,
      transmission: 0.8,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    sphereGroup.add(core);
    materials.push(coreMat);

    // Outer Wireframe Radar Shell
    const shellGeo = new THREE.SphereGeometry(1.85, 24, 18);
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0x00f5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    sphereGroup.add(shell);
    materials.push(shellMat);

    // Concentric Equator Scanning Rings
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.03, 16, 64), new THREE.MeshBasicMaterial({ color: 0x00f5ff }));
    ring1.rotation.x = Math.PI / 2;
    sphereGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.025, 16, 64), new THREE.MeshBasicMaterial({ color: 0x8a2be2 }));
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 6;
    sphereGroup.add(ring2);

    // 4. Department Beacons situated around the outer ring
    const beaconGroup = new THREE.Group();
    ring1.add(beaconGroup);

    DEPARTMENTS.forEach((dept, idx) => {
      const angle = (idx / DEPARTMENTS.length) * Math.PI * 2;
      const bGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const bMat = new THREE.MeshBasicMaterial({ color: dept.hex });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(Math.cos(angle) * 2.2, Math.sin(angle) * 2.2, 0);
      beaconGroup.add(bMesh);

      // Vertical pulse pin
      const pinGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8);
      const pinMat = new THREE.MeshBasicMaterial({ color: dept.hex, transparent: true, opacity: 0.7 });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(Math.cos(angle) * 2.2, Math.sin(angle) * 2.2, 0.3);
      beaconGroup.add(pin);
    });

    // Floor Radar Grid
    const grid = new THREE.GridHelper(10, 20, 0x00f5ff, 0x1e293b);
    grid.position.y = -1.5;
    scene.add(grid);

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
      sphereGroup.rotation.y += deltaX * 0.008;
      sphereGroup.rotation.x += deltaY * 0.008;
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
      sphereGroup.rotation.y += deltaX * 0.008;
      sphereGroup.rotation.x += deltaY * 0.008;
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
      height = mountRef.current.clientHeight || 320;
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

      // Auto rotation
      if (autoRotateRef.current && !isDragging) {
        sphereGroup.rotation.y += 0.005;
      }

      ring2.rotation.z = -elapsed * 0.3;

      // Core pulse
      const pulse = 1.0 + Math.sin(elapsed * 2.0) * 0.05;
      core.scale.set(pulse, pulse, pulse);

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
  }, []);

  const handleDeptClick = (deptName: string) => {
    onSelectDepartment(deptName);
    soundFx.playHoloActivate();
  };

  return (
    <div
      style={{
        width: '100%',
        height: '320px',
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        background: 'radial-gradient(circle at center, rgba(0, 245, 255, 0.07) 0%, var(--surface-card) 100%)',
        border: '1px solid rgba(0, 245, 255, 0.3)',
        overflow: 'hidden',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        cursor: 'grab',
        marginBottom: '20px',
      }}
    >
      {/* Three.js Mount */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Header Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '18px',
          right: '18px',
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
              fontSize: '0.78rem',
              color: 'var(--accent-cyan)',
              letterSpacing: '0.12em',
              textShadow: '0 0 12px rgba(0, 245, 255, 0.5)',
            }}
          >
            ADMISSIONS_RADAR_SPHERE // INTAKE DENSITY MATRIX
          </span>
        </div>

        <span
          className="badge badge-cyan"
          style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          <Radio size={12} className="animate-spin" />
          <span>{requests.length} CANDIDATES RECORDED</span>
        </span>
      </div>

      {/* Department Quick Filter Tags (Bottom Left) */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          maxWidth: '560px',
        }}
      >
        <button
          onClick={() => handleDeptClick('ALL')}
          className="tab-btn"
          style={{
            padding: '4px 10px',
            fontSize: '0.72rem',
            background: selectedDepartment === 'ALL' ? 'var(--accent-cyan)' : 'var(--surface-card-alt)',
            color: selectedDepartment === 'ALL' ? '#060814' : 'var(--text-secondary)',
            border: selectedDepartment === 'ALL' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
            fontWeight: 700,
          }}
        >
          ALL ({requests.length})
        </button>

        {DEPARTMENTS.map((d) => {
          const count = deptCounts[d.name] || 0;
          const isSelected = selectedDepartment === d.name;
          return (
            <button
              key={d.short}
              onClick={() => handleDeptClick(d.name)}
              className="tab-btn"
              style={{
                padding: '4px 10px',
                fontSize: '0.72rem',
                background: isSelected ? `${d.color}25` : 'var(--surface-card-alt)',
                color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: isSelected ? `1px solid ${d.color}` : '1px solid var(--border-subtle)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: d.color }} />
              <span>{d.short}: {count}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Controls Overlay Toolbar (Bottom Right) */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <button
          onClick={() => {
            setAutoRotate(!autoRotate);
            soundFx.playSpatialClick();
          }}
          className="tab-btn"
          style={{
            padding: '5px 12px',
            fontSize: '0.72rem',
            background: autoRotate ? 'rgba(0, 245, 255, 0.18)' : 'var(--surface-card-alt)',
            border: autoRotate ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
            color: autoRotate ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
        >
          <RotateCcw size={12} style={{ marginRight: '4px' }} />
          <span>{autoRotate ? 'PAUSE ROTATION' : 'ORBIT'}</span>
        </button>

        <button
          onClick={() => {
            setWireframe(!wireframe);
            soundFx.playModeSwitch();
          }}
          className="tab-btn"
          style={{
            padding: '5px 12px',
            fontSize: '0.72rem',
            background: wireframe ? 'rgba(0, 245, 255, 0.18)' : 'var(--surface-card-alt)',
            border: wireframe ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
            color: wireframe ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
        >
          <Box size={12} style={{ marginRight: '4px' }} />
          <span>{wireframe ? 'SURFACE' : 'WIREFRAME'}</span>
        </button>
      </div>
    </div>
  );
}
