'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { themeManager, Theme } from '@/lib/theme';

interface LabIsometricTwin3DProps {
  activeNodeId: string;
  onSelectNode: (nodeId: string) => void;
}

/**
 * Builds distinct 3D architectural models tailored to each lab node sector:
 * - self-learning: Dual-monitor async study workstation & ergonomic pod chair
 * - project-work: Hexagonal collaborative agile desk with floating project sphere & laptops
 * - 3d-dev: GPU render tower with cooling vents, curved panoramic screen & 3D wireframe mesh
 * - hackathons: 36-hour sprint warfare arena bench with monitor rack & victory beacon
 * - xr-dev: 6-DoF roomscale tracking perimeter with 4 corner lighthouses & floating XR headset
 * - testing: Motion capture calibration gantry arch with mechanical probe & QA screen
 * - industry: Executive enterprise presentation plinth with industrial robotic arm
 */
function buildNode3DModel(id: string, color: number): THREE.Group {
  const group = new THREE.Group();

  if (id === 'self-learning') {
    // 1. ASYNC POD: Curved Workstation Desk, Dual Glowing Monitors & Pod Seat
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.7 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const screenBackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });

    // Desk surface
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 0.9), deskMat);
    desk.position.set(0, 0.65, 0);
    group.add(desk);

    // Desk legs
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.65);
    [[-0.9, -0.35], [0.9, -0.35], [-0.9, 0.35], [0.9, 0.35]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, deskMat);
      leg.position.set(lx, 0.325, lz);
      group.add(leg);
    });

    // Dual monitors
    [-0.45, 0.45].forEach((mx, idx) => {
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.3), deskMat);
      stand.position.set(mx, 0.8, -0.15);
      group.add(stand);
      const mBack = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.45, 0.04), screenBackMat);
      mBack.position.set(mx, 1.05, -0.15);
      mBack.rotation.y = idx === 0 ? 0.15 : -0.15;
      group.add(mBack);
      const mScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.41), screenMat);
      mScreen.position.set(mx, 1.05, -0.128);
      mScreen.rotation.y = idx === 0 ? 0.15 : -0.15;
      group.add(mScreen);
    });

    // Pod seat
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 16), deskMat);
    seat.position.set(0, 0.4, 0.45);
    group.add(seat);
    const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.5, 0.06), deskMat);
    seatBack.position.set(0, 0.68, 0.58);
    group.add(seatBack);
  } else if (id === 'project-work') {
    // 2. PROJECT WORK: Hexagonal Collaboration Table, Central Holographic Sphere, 4 Laptops
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.2, metalness: 0.8 });
    const holoMat = new THREE.MeshBasicMaterial({ color: 0x7b61ff, wireframe: true });
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });

    // Hexagonal table
    const table = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.25, 0.15, 6), tableMat);
    table.position.set(0, 0.65, 0);
    group.add(table);

    // Pedestal
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.65, 12), tableMat);
    ped.position.set(0, 0.325, 0);
    group.add(ped);

    // Center holographic project sphere & ring
    const holoSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 1), holoMat);
    holoSphere.position.set(0, 1.15, 0);
    group.add(holoSphere);
    const holoRing = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.02, 8, 24), coreMat);
    holoRing.position.set(0, 1.15, 0);
    holoRing.rotation.x = Math.PI / 3;
    group.add(holoRing);

    // 4 laptops on table
    for (let i = 0; i < 4; i++) {
      const theta = (i / 4) * Math.PI * 2;
      const lx = Math.cos(theta) * 0.75;
      const lz = Math.sin(theta) * 0.75;
      const lap = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.03, 0.24), tableMat);
      lap.position.set(lx, 0.74, lz);
      lap.rotation.y = -theta + Math.PI / 2;
      group.add(lap);
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.2), coreMat);
      scr.position.set(lx * 0.9, 0.86, lz * 0.9);
      scr.rotation.y = -theta + Math.PI / 2;
      group.add(scr);
    }
  } else if (id === '3d-dev') {
    // 3. 3D DEVELOPMENT: High-VRAM GPU Render Tower with Cooling Fans & Curved Panoramic Screen
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x090d1a, metalness: 0.9, roughness: 0.2 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const fanMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });

    // Desk
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.08, 1.0), towerMat);
    desk.position.set(0, 0.65, 0);
    group.add(desk);

    // Tower CPU
    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.95, 0.85), towerMat);
    tower.position.set(0.75, 0.5, 0.05);
    group.add(tower);

    // Glowing cooling vents
    const vent = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.7), fanMat);
    vent.position.set(0.52, 0.5, 0.05);
    vent.rotation.y = -Math.PI / 2;
    group.add(vent);

    // Curved panoramic display
    const curveGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.55, 24, 1, true, -Math.PI / 3.8, Math.PI / 1.9);
    const curvedScreen = new THREE.Mesh(curveGeo, screenMat);
    curvedScreen.position.set(0, 1.15, -0.6);
    curvedScreen.rotation.y = Math.PI;
    group.add(curvedScreen);

    // Floating 3D wireframe mesh above workspace
    const meshObj = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.24, 0.06, 36, 8),
      new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true })
    );
    meshObj.position.set(-0.25, 1.45, 0.1);
    group.add(meshObj);
  } else if (id === 'hackathons') {
    // 4. HACKATHONS: Sprint Arena Table, Multi-Monitor Array & Neon Countdown Beacon
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x1f132b, metalness: 0.85, roughness: 0.25 });
    const neonMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 });

    // Long bench
    const bench = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.08, 0.9), benchMat);
    bench.position.set(0, 0.65, 0);
    group.add(bench);

    // Multi-angle monitor rack
    const rack = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.05), benchMat);
    rack.position.set(0, 1.1, -0.25);
    group.add(rack);
    const rackScr = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.42), neonMat);
    rackScr.position.set(0, 1.1, -0.22);
    group.add(rackScr);

    // Center mini trophy / energy beacon
    const trophyCup = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.35, 12), goldMat);
    trophyCup.position.set(0, 0.9, 0.12);
    trophyCup.rotation.x = Math.PI;
    group.add(trophyCup);
    const tBase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.1, 12), goldMat);
    tBase.position.set(0, 0.72, 0.12);
    group.add(tBase);
  } else if (id === 'xr-dev') {
    // 5. XR DEV: 6-DoF Roomscale Tracking Zone with 4 Lighthouse Sensor Stands & Floating Headset
    const matColor = 0x0284c7;
    const trackingFloor = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 1.25, 32),
      new THREE.MeshBasicMaterial({ color: matColor, side: THREE.DoubleSide })
    );
    trackingFloor.rotation.x = -Math.PI / 2;
    trackingFloor.position.set(0, 0.27, 0);
    group.add(trackingFloor);

    // 4 Corner Lighthouse Sensors
    const standMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    const sensorMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]].forEach(([sx, sz]) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.7), standMat);
      pole.position.set(sx, 0.85, sz);
      group.add(pole);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), sensorMat);
      head.position.set(sx, 1.7, sz);
      head.lookAt(0, 1.0, 0);
      group.add(head);
    });

    // Floating XR Headset
    const hsGroup = new THREE.Group();
    hsGroup.position.set(0, 1.05, 0);
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.32, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x030712, roughness: 0.1, metalness: 0.9 })
    );
    const lensRing = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 12, 24), sensorMat);
    lensRing.position.z = 0.18;
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.02, 8, 32), standMat);
    strap.rotation.x = Math.PI / 2;
    hsGroup.add(visor);
    hsGroup.add(lensRing);
    hsGroup.add(strap);
    group.add(hsGroup);
  } else if (id === 'testing') {
    // 6. TESTING & QA: Calibration Gantry Frame, Motion Sensors & Precision Display
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 });

    // Gantry Arch
    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 0.12), frameMat);
    leftPillar.position.set(-0.85, 0.9, 0);
    group.add(leftPillar);
    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 0.12), frameMat);
    rightPillar.position.set(0.85, 0.9, 0);
    group.add(rightPillar);
    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.12, 0.12), frameMat);
    topBeam.position.set(0, 1.8, 0);
    group.add(topBeam);

    // Mechanical probe arm
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6), frameMat);
    arm.position.set(0, 1.45, 0);
    group.add(arm);
    const probeTip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), screenMat);
    probeTip.position.set(0, 1.15, 0);
    group.add(probeTip);

    // Vertical QA metrics display screen
    const qaScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.9), screenMat);
    qaScreen.position.set(-0.55, 1.1, -0.4);
    group.add(qaScreen);
  } else {
    // 7. INDUSTRY PROJECTS: Executive Client Presentation Plinth & Robotic Arm Model
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0a101f, metalness: 0.9, roughness: 0.2 });
    const armMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.85, roughness: 0.25 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });

    // Sleek display plinth
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.6, 24), baseMat);
    plinth.position.set(0, 0.3, 0);
    group.add(plinth);

    // Plinth neon halo
    const halo = new THREE.Mesh(new THREE.RingGeometry(0.92, 0.98, 32), glowMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.set(0, 0.61, 0);
    group.add(halo);

    // Articulated robotic arm
    const armBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.2, 16), armMat);
    armBase.position.set(0, 0.7, 0);
    group.add(armBase);
    const lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6), armMat);
    lowerArm.position.set(0.12, 1.05, 0);
    lowerArm.rotation.z = -0.35;
    group.add(lowerArm);
    const joint = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), glowMat);
    joint.position.set(0.24, 1.35, 0);
    group.add(joint);
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.55), armMat);
    upperArm.position.set(0.05, 1.6, 0);
    upperArm.rotation.z = 0.5;
    group.add(upperArm);
    const gripper = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.2), glowMat);
    gripper.position.set(-0.1, 1.85, 0);
    group.add(gripper);
  }

  return group;
}

export default function LabIsometricTwin3D({ activeNodeId, onSelectNode }: LabIsometricTwin3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef(activeNodeId);
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');

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

  useEffect(() => {
    activeIdRef.current = activeNodeId;
  }, [activeNodeId]);

  useEffect(() => {
    if (isMobile || !mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth || 600;
    let height = container.clientHeight || 340;

    const isLightInitial = themeManager.getTheme() === 'light';

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isLightInitial ? 0xf1f5f9 : 0x050510, 0.02);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
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
    const ambient = new THREE.AmbientLight(isLightInitial ? 0xffffff : 0x0e172a, isLightInitial ? 2.5 : 3.0);
    scene.add(ambient);

    const cyanLight = new THREE.PointLight(0x00ffff, 4.0, 35);
    cyanLight.position.set(0, 8, 0);
    scene.add(cyanLight);

    const blueLight = new THREE.DirectionalLight(0x4c7dff, 1.5);
    blueLight.position.set(10, 15, 10);
    scene.add(blueLight);

    // 3. Isometric Floor & Grid
    const floorGrid = new THREE.GridHelper(18, 18, 0x00ffff, isLightInitial ? 0x94a3b8 : 0x1e293b);
    floorGrid.position.y = -0.01;
    scene.add(floorGrid);

    // Outer boundary walls (holographic perimeter)
    const wallGeo = new THREE.BoxGeometry(18, 0.6, 18);
    const wallEdges = new THREE.EdgesGeometry(wallGeo);
    const wallLine = new THREE.LineSegments(
      wallEdges,
      new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: isLightInitial ? 0.5 : 0.35 })
    );
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
        color: isLightInitial ? 0xe2e8f0 : 0x0b1329,
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

      // Add Distinct 3D Model Tailored to this Node
      const nodeModel = buildNode3DModel(p.id, p.color);
      pGroup.add(nodeModel);

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
        prevMouseY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      scene.rotation.y += deltaX * 0.008;
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
      width = mountRef.current.clientWidth || 600;
      height = mountRef.current.clientHeight || 340;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // Theme listener for Three.js scene
    const unsubTheme = themeManager.subscribe((newTheme) => {
      if (newTheme === 'light') {
        scene.fog = new THREE.FogExp2(0xf1f5f9, 0.02);
      } else {
        scene.fog = new THREE.FogExp2(0x050510, 0.02);
      }
    });

    // 6. Animation Loop
    let animId: number;
    const timer = new THREE.Timer();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      timer.update();
      const elapsed = timer.getElapsed();

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
      unsubTheme();
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

  const isLight = theme === 'light';

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
        background: isLight
          ? 'radial-gradient(circle at center, rgba(0, 180, 216, 0.12) 0%, rgba(241, 245, 249, 0.95) 100%)'
          : 'radial-gradient(circle at center, rgba(0, 255, 255, 0.06) 0%, var(--surface-card) 100%)',
        border: isLight ? '1px solid rgba(0, 180, 216, 0.3)' : '1px solid rgba(0, 255, 255, 0.25)',
        boxShadow: isLight ? '0 16px 40px rgba(0, 0, 0, 0.06)' : '0 16px 40px rgba(0, 0, 0, 0.3)',
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
        <span>PHYSICAL FLOORPLAN: 7 TAILORED 3D HARDWARE PODS</span>
        <span style={{ color: 'var(--accent-cyan)' }}>VOLUMETRIC LIGHT BEAMS ACTIVE</span>
      </div>
    </div>
  );
}
