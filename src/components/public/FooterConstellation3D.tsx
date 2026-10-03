'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FooterConstellation3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || window.innerWidth < 768) return;
    const container = mountRef.current;
    let width = container.clientWidth || 1200;
    let height = container.clientHeight || 400;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    container.appendChild(renderer.domElement);

    // 2. Node Points Data
    const nodeCount = 75;
    const positions = new Float32Array(nodeCount * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < nodeCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

      velocities.push({
        x: (Math.random() - 0.5) * 0.015,
        y: (Math.random() - 0.5) * 0.012,
        z: (Math.random() - 0.5) * 0.01,
      });
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0x00f5ff,
      size: 0.22,
      transparent: true,
      opacity: 0.7,
    });
    const pointCloud = new THREE.Points(pGeo, pMat);
    scene.add(pointCloud);

    // 3. Dynamic Connecting Line Filaments
    const maxLines = 160;
    const linePositions = new Float32Array(maxLines * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
    });
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineMesh);

    // 4. Mouse Interactivity / Magnetism
    const mouse = { x: 9999, y: 9999 };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      // Normalized coordinates (-1 to 1)
      const nx = ((e.clientX - rect.left) / width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / height) * 2 - 1);
      // Project to z=0 plane in Three.js coordinates
      mouse.x = nx * (width / 55);
      mouse.y = ny * (height / 55);
    };

    const onMouseLeave = () => {
      mouse.x = 9999;
      mouse.y = 9999;
    };

    window.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    // Resize Handler
    const onResize = () => {
      if (!mountRef.current) return;
      width = mountRef.current.clientWidth || 1200;
      height = mountRef.current.clientHeight || 400;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // 5. Animation Loop
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const posAttr = pGeo.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;

      // Update particle positions with Brownian drift & mouse pull
      for (let i = 0; i < nodeCount; i++) {
        let px = posArr[i * 3];
        let py = posArr[i * 3 + 1];
        let pz = posArr[i * 3 + 2];

        // Drift
        px += velocities[i].x;
        py += velocities[i].y;
        pz += velocities[i].z;

        // Boundary bounce
        if (Math.abs(px) > 19) velocities[i].x *= -1;
        if (Math.abs(py) > 8) velocities[i].y *= -1;
        if (Math.abs(pz) > 7) velocities[i].z *= -1;

        // Mouse attraction
        const dx = mouse.x - px;
        const dy = mouse.y - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 6.5) {
          const force = (1 - dist / 6.5) * 0.035;
          px += dx * force;
          py += dy * force;
        }

        posArr[i * 3] = px;
        posArr[i * 3 + 1] = py;
        posArr[i * 3 + 2] = pz;
      }
      posAttr.needsUpdate = true;

      // Build connection lines between proximate nodes
      let lineIdx = 0;
      const connectDist = 5.8;

      for (let i = 0; i < nodeCount && lineIdx < maxLines; i++) {
        for (let j = i + 1; j < nodeCount && lineIdx < maxLines; j++) {
          const dx = posArr[i * 3] - posArr[j * 3];
          const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
          const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (d < connectDist) {
            linePositions[lineIdx * 6] = posArr[i * 3];
            linePositions[lineIdx * 6 + 1] = posArr[i * 3 + 1];
            linePositions[lineIdx * 6 + 2] = posArr[i * 3 + 2];

            linePositions[lineIdx * 6 + 3] = posArr[j * 3];
            linePositions[lineIdx * 6 + 4] = posArr[j * 3 + 1];
            linePositions[lineIdx * 6 + 5] = posArr[j * 3 + 2];

            lineIdx++;
          }
        }
      }

      // Zero out unused line segments
      for (let k = lineIdx; k < maxLines; k++) {
        linePositions[k * 6] = 0;
        linePositions[k * 6 + 1] = 0;
        linePositions[k * 6 + 2] = 0;
        linePositions[k * 6 + 3] = 0;
        linePositions[k * 6 + 4] = 0;
        linePositions[k * 6 + 5] = 0;
      }

      lineGeo.attributes.position.needsUpdate = true;

      // Slow scene rotation
      scene.rotation.y += 0.001;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.65,
        zIndex: 0,
        overflow: 'hidden',
      }}
    />
  );
}
