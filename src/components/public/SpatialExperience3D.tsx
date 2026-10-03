'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Eye, RotateCcw, X, Compass, Maximize2, Sparkles, Layers } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

export const SPECIMENS_INFO: Record<
  'headset' | 'healthcare' | 'turbine' | 'digitaltwin' | 'simulation' | 'spatialui',
  { label: string; tag: string; desc: string; target: [number, number, number]; cam: [number, number, number] }
> = {
  headset: {
    label: '6-DoF Spatial Headset',
    tag: 'HARDWARE SPECIMEN',
    desc: 'Stereoscopic dual-lens optical visor with LED tracking ring, headstraps, and dual handheld motion controllers.',
    target: [2.4, 0, 0],
    cam: [2.4, 0.4, 6.2],
  },
  healthcare: {
    label: 'Biomedical Hologram',
    tag: 'HEALTHCARE VERTICAL',
    desc: 'Volumetric pulsating cardiac hologram with real-time systolic rhythms, diagnostic sweepers, and particle clouds.',
    target: [7, 0, -18],
    cam: [7, 0.6, -12.5],
  },
  turbine: {
    label: 'Aero Jet Turbine',
    tag: 'AEROSPACE TWIN',
    desc: 'High-RPM jet engine turbine with spinning titanium blades and exploded thermal compression rings.',
    target: [-7, 0, -18],
    cam: [-7, 0.6, -12.5],
  },
  digitaltwin: {
    label: 'Digital Twin City',
    tag: 'URBAN SIMULATION',
    desc: 'Multi-block campus twin mesh with glowing beacon towers, telemetry rings, and autonomous drone scan sweeps.',
    target: [0, 0, -34],
    cam: [0, 4.5, -26.5],
  },
  simulation: {
    label: 'LiDAR Terrain Mesh',
    tag: 'GEOSPATIAL TERRAIN',
    desc: 'Dynamic undulating terrain with real-time laser elevation sweep bar and topographical contour matrices.',
    target: [7, 0, -48],
    cam: [7, 2.5, -41.5],
  },
  spatialui: {
    label: 'VisionOS Spatial UI',
    tag: 'SPATIAL COMPUTING',
    desc: 'Next-generation floating frosted-glass interfaces with interactive depth layers and biometric nodes.',
    target: [-7, 0, -48],
    cam: [-7, 0.8, -42],
  },
};

export default function SpatialExperience3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isFreeRoam, setIsFreeRoam] = useState(false);
  const [activeModel, setActiveModel] = useState<'headset' | 'healthcare' | 'turbine' | 'digitaltwin' | 'simulation' | 'spatialui'>('headset');
  const [showControlsHint, setShowControlsHint] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // References to communicate between React state and Three.js animation loop
  const freeRoamRef = useRef(false);
  const activeModelRef = useRef<'headset' | 'healthcare' | 'turbine' | 'digitaltwin' | 'simulation' | 'spatialui'>('headset');
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(2.4, 0.4, 6.2));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(2.4, 0, 0));
  const isTransitioningRef = useRef(false);

  const handleSelectSpecimen = (id: 'headset' | 'healthcare' | 'turbine' | 'digitaltwin' | 'simulation' | 'spatialui') => {
    setActiveModel(id);
    activeModelRef.current = id;
    soundFx.playHoloActivate();

    const isDesktop = typeof window !== 'undefined' && window.innerWidth > 992;
    const spec = SPECIMENS_INFO[id];
    if (spec) {
      const targetX = id === 'headset' ? (isDesktop ? 2.4 : 0) : spec.target[0];
      const camX = id === 'headset' ? (isDesktop ? 2.4 : 0) : spec.cam[0];
      targetCamPosRef.current.set(camX, spec.cam[1], spec.cam[2]);
      targetLookAtRef.current.set(targetX, spec.target[1], spec.target[2]);
      isTransitioningRef.current = true;
    }
  };

  useEffect(() => {
    freeRoamRef.current = isFreeRoam;
    if (controlsRef.current) {
      controlsRef.current.enabled = isFreeRoam;
      if (isFreeRoam) {
        controlsRef.current.update();
      }
    }
  }, [isFreeRoam]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Mobile limit: restrict 3D WebGL computation to tablet & desktop (>= 768px)
    if (width < 768) {
      return;
    }

    // --- 1. Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.015);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);
    camera.position.set(0, 0, 8.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // OrbitControls for Free-Roam Mode
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enabled = false;
    controls.maxDistance = 80;
    controls.minDistance = 2;
    controlsRef.current = controls;

    // --- 2. Lighting ---
    const ambientLight = new THREE.AmbientLight(0x0e172a, 2.0);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00ffff, 4.5, 45);
    cyanLight.position.set(5, 5, 8);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0x7b61ff, 4.0, 45);
    violetLight.position.set(-6, -4, 6);
    scene.add(violetLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(0, 15, 10);
    scene.add(dirLight);

    // --- 3. Master Groups ---
    const masterWorld = new THREE.Group();
    scene.add(masterWorld);

    // ==========================================
    // OBJECT 1: SPATIAL VR HEADSET & 6-DoF CONTROLLERS (at Z = 0)
    // ==========================================
    const isDesktop = width > 992;
    const headsetGroup = new THREE.Group();
    headsetGroup.position.set(isDesktop ? 2.4 : 0, 0, 0);

    // Visor Body
    const visorGeo = new THREE.BoxGeometry(2.5, 1.25, 1.4, 4, 4, 4);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x070b18,
      roughness: 0.2,
      metalness: 0.9,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    headsetGroup.add(visor);

    // Curved Specular Faceplate
    const plateGeo = new THREE.PlaneGeometry(2.45, 1.2);
    const plateMat = new THREE.MeshPhysicalMaterial({
      color: 0x030712,
      roughness: 0.05,
      metalness: 0.95,
      transmission: 0.4,
      transparent: true,
      opacity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const faceplate = new THREE.Mesh(plateGeo, plateMat);
    faceplate.position.z = 0.71;
    headsetGroup.add(faceplate);

    // Glowing LED Ring
    const ledGeo = new THREE.TorusGeometry(0.38, 0.016, 16, 48);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const ledRing = new THREE.Mesh(ledGeo, ledMat);
    ledRing.position.z = 0.72;
    headsetGroup.add(ledRing);

    // Laser Tracking Crosshair line
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.0, 0, 0.72),
      new THREE.Vector3(1.0, 0, 0.72),
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x7b61ff, transparent: true, opacity: 0.8 });
    const hudLine = new THREE.Line(lineGeo, lineMat);
    headsetGroup.add(hudLine);

    // Headstraps
    const strapGeo = new THREE.TorusGeometry(1.6, 0.08, 16, 64, Math.PI);
    const strapMat = new THREE.MeshStandardMaterial({ color: 0x141b2e, roughness: 0.7 });
    const strap = new THREE.Mesh(strapGeo, strapMat);
    strap.rotation.x = Math.PI / 2;
    strap.position.z = -0.6;
    headsetGroup.add(strap);

    // Controllers (Left & Right)
    const createController = (isLeft: boolean) => {
      const cGroup = new THREE.Group();
      const gripGeo = new THREE.CylinderGeometry(0.12, 0.14, 1.2, 16);
      const gripMat = new THREE.MeshStandardMaterial({ color: 0x0b1020, roughness: 0.4, metalness: 0.8 });
      const grip = new THREE.Mesh(gripGeo, gripMat);
      cGroup.add(grip);

      // Tracking Ring
      const ringGeo = new THREE.TorusGeometry(0.45, 0.03, 16, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x162238,
        emissive: 0x00ffff,
        emissiveIntensity: 0.6,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, 0.55, 0.2);
      ring.rotation.x = Math.PI / 4;
      cGroup.add(ring);

      // Forward Laser Pointer Ray
      const rayGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.6, 0.3),
        new THREE.Vector3(0, 0.6, 4.5),
      ]);
      const rayMat = new THREE.LineBasicMaterial({
        color: isLeft ? 0x00ffff : 0x7b61ff,
        transparent: true,
        opacity: 0.4,
      });
      const laserRay = new THREE.Line(rayGeo, rayMat);
      cGroup.add(laserRay);

      cGroup.position.set(isLeft ? -2.2 : 2.2, -0.6, 0.6);
      cGroup.rotation.set(-0.2, isLeft ? 0.35 : -0.35, 0);
      return cGroup;
    };

    const leftCtrl = createController(true);
    const rightCtrl = createController(false);
    headsetGroup.add(leftCtrl);
    headsetGroup.add(rightCtrl);
    headsetGroup.userData = { specimenId: 'headset' };
    masterWorld.add(headsetGroup);

    // ==========================================
    // OBJECT 2: HEALTHCARE HOLOGRAPHIC CORE (at X = 7, Z = -18)
    // ==========================================
    const healthcareGroup = new THREE.Group();
    healthcareGroup.position.set(7, 0, -18);

    // Anatomical pulsing crystalline core
    const heartGeo = new THREE.OctahedronGeometry(1.6, 3);
    const heartMat = new THREE.MeshPhysicalMaterial({
      color: 0xff007f,
      emissive: 0x660033,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.85,
      transparent: true,
      opacity: 0.9,
      wireframe: false,
    });
    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    healthcareGroup.add(heartMesh);

    // Orbiting Medical Slicing Ring (MRI Scan Plane)
    const scanRingGeo = new THREE.TorusGeometry(2.4, 0.03, 16, 64);
    const scanRingMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.rotation.x = Math.PI / 3;
    healthcareGroup.add(scanRing);

    // Orbiting particle points
    const medPointsGeo = new THREE.BufferGeometry();
    const medCoords: number[] = [];
    for (let i = 0; i < 90; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.2 + Math.random() * 0.6;
      medCoords.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
    }
    medPointsGeo.setAttribute('position', new THREE.Float32BufferAttribute(medCoords, 3));
    const medPointsMat = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.08, transparent: true, opacity: 0.8 });
    const medPoints = new THREE.Points(medPointsGeo, medPointsMat);
    healthcareGroup.add(medPoints);
    healthcareGroup.userData = { specimenId: 'healthcare' };
    masterWorld.add(healthcareGroup);

    // ==========================================
    // OBJECT 3: INDUSTRIAL EXPLODED TURBINE (at X = -7, Z = -18)
    // ==========================================
    const turbineGroup = new THREE.Group();
    turbineGroup.position.set(-7, 0, -18);

    // Central Drive Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.35, 0.35, 3.8, 24);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.x = Math.PI / 2;
    turbineGroup.add(shaft);

    // Rotating Turbine Fan Blades Rotor
    const bladesGroup = new THREE.Group();
    for (let b = 0; b < 16; b++) {
      const bladeGeo = new THREE.BoxGeometry(0.08, 1.4, 0.25);
      const bladeMat = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        metalness: 0.8,
        roughness: 0.2,
      });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.y = 0.85;
      blade.rotation.y = 0.4;
      const holder = new THREE.Group();
      holder.rotation.z = (b / 16) * Math.PI * 2;
      holder.add(blade);
      bladesGroup.add(holder);
    }
    turbineGroup.add(bladesGroup);

    // Exploded Casing Stator Rings
    const casingRing1 = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.06, 16, 48),
      new THREE.MeshStandardMaterial({ color: 0x7b61ff, metalness: 0.8, roughness: 0.3 })
    );
    casingRing1.position.z = 1.2;
    turbineGroup.add(casingRing1);

    const casingRing2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.4, 0.06, 16, 48),
      new THREE.MeshStandardMaterial({ color: 0x00ffff, metalness: 0.8, roughness: 0.3 })
    );
    casingRing2.position.z = -1.2;
    turbineGroup.add(casingRing2);
    turbineGroup.userData = { specimenId: 'turbine' };
    masterWorld.add(turbineGroup);

    // ==========================================
    // OBJECT 4: DIGITAL TWIN TELEMETRY GRID (at X = 0, Z = -34)
    // ==========================================
    const digitalTwinGroup = new THREE.Group();
    digitalTwinGroup.position.set(0, 0, -34);

    // Base Grid Matrix
    const gridHelper = new THREE.GridHelper(16, 24, 0x00ffff, 0x1e293b);
    gridHelper.position.y = -2;
    digitalTwinGroup.add(gridHelper);

    // Holographic Building Towers
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x091226,
      emissive: 0x00ffff,
      emissiveIntensity: 0.25,
      wireframe: true,
    });

    const towerOffsets = [
      { x: -3, z: -2, h: 4.2 },
      { x: 3, z: -2, h: 5.5 },
      { x: -1.5, z: 2, h: 3.0 },
      { x: 2, z: 1.5, h: 4.8 },
      { x: 0, z: -4, h: 6.2 },
    ];

    towerOffsets.forEach((t) => {
      const geo = new THREE.BoxGeometry(1.6, t.h, 1.6);
      const m = new THREE.Mesh(geo, towerMat);
      m.position.set(t.x, -2 + t.h / 2, t.z);
      digitalTwinGroup.add(m);

      // Beacon on top of tower
      const bDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x00ffff })
      );
      bDot.position.set(t.x, -2 + t.h + 0.15, t.z);
      digitalTwinGroup.add(bDot);
    });
    digitalTwinGroup.userData = { specimenId: 'digitaltwin' };
    masterWorld.add(digitalTwinGroup);

    // ==========================================
    // OBJECT 5: SIMULATION TACTICAL LIDAR TERRAIN (at X = 7, Z = -48)
    // ==========================================
    const terrainGroup = new THREE.Group();
    terrainGroup.position.set(7, 0, -48);

    const terrainGeo = new THREE.PlaneGeometry(9, 9, 32, 32);
    const posAttr = terrainGeo.attributes.position;
    for (let p = 0; p < posAttr.count; p++) {
      const vx = posAttr.getX(p);
      const vy = posAttr.getY(p);
      const vz = Math.sin(vx * 0.8) * Math.cos(vy * 0.8) * 0.9 + Math.sin(vx * 1.5) * 0.4;
      posAttr.setZ(p, vz);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x0b1329,
      emissive: 0x00ffff,
      emissiveIntensity: 0.18,
      wireframe: true,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.rotation.x = -Math.PI / 2.5;
    terrainGroup.add(terrainMesh);

    // Sweeping LiDAR laser bar
    const lidarGeo = new THREE.CylinderGeometry(0.04, 0.04, 9, 16);
    const lidarMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const lidarBar = new THREE.Mesh(lidarGeo, lidarMat);
    lidarBar.rotation.z = Math.PI / 2;
    lidarBar.position.y = 0.5;
    terrainGroup.add(lidarBar);
    terrainGroup.userData = { specimenId: 'simulation' };
    masterWorld.add(terrainGroup);

    // ==========================================
    // OBJECT 6: SPATIAL UI GLASS WINDOWS (at X = -7, Z = -48)
    // ==========================================
    const spatialUIGroup = new THREE.Group();
    spatialUIGroup.position.set(-7, 0, -48);

    const makeSpatialWindow = (x: number, y: number, z: number, color: number) => {
      const winG = new THREE.Group();
      const pGeo = new THREE.PlaneGeometry(3.2, 2.0);
      const pMat = new THREE.MeshPhysicalMaterial({
        color: 0x060c1d,
        roughness: 0.1,
        metalness: 0.8,
        transmission: 0.7,
        transparent: true,
        opacity: 0.85,
        clearcoat: 1.0,
      });
      const panel = new THREE.Mesh(pGeo, pMat);
      winG.add(panel);

      // Glowing Border Frame
      const edges = new THREE.EdgesGeometry(pGeo);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color }));
      winG.add(line);

      winG.position.set(x, y, z);
      return winG;
    };

    const win1 = makeSpatialWindow(0, 0, 0, 0x00ffff);
    const win2 = makeSpatialWindow(-0.8, -0.6, -1.2, 0x7b61ff);
    const win3 = makeSpatialWindow(0.8, 0.6, 1.2, 0xff00ff);
    spatialUIGroup.add(win1);
    spatialUIGroup.add(win2);
    spatialUIGroup.add(win3);
    spatialUIGroup.userData = { specimenId: 'spatialui' };
    masterWorld.add(spatialUIGroup);

    // ==========================================
    // 3D SPECIMEN HOLOGRAPHIC TARGETING RETICLE
    // ==========================================
    const reticleGroup = new THREE.Group();
    reticleGroup.visible = false;

    // Concentric Inner Glowing Hologram Ring
    const rRing1Geo = new THREE.RingGeometry(2.3, 2.36, 64);
    const rRing1Mat = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    const rRing1 = new THREE.Mesh(rRing1Geo, rRing1Mat);
    rRing1.rotation.x = Math.PI / 2;
    reticleGroup.add(rRing1);

    // Outer Violet Hologram Ring
    const rRing2Geo = new THREE.RingGeometry(2.8, 2.84, 64);
    const rRing2Mat = new THREE.MeshBasicMaterial({ color: 0x7b61ff, side: THREE.DoubleSide, transparent: true, opacity: 0.65 });
    const rRing2 = new THREE.Mesh(rRing2Geo, rRing2Mat);
    rRing2.rotation.x = Math.PI / 2;
    reticleGroup.add(rRing2);

    // 4 Corner HUD Crosshair Brackets
    const tickMat = new THREE.LineBasicMaterial({ color: 0x00f5ff });
    for (let t = 0; t < 4; t++) {
      const angle = (t * Math.PI) / 2;
      const tickPts = [
        new THREE.Vector3(Math.cos(angle) * 3.0, 0, Math.sin(angle) * 3.0),
        new THREE.Vector3(Math.cos(angle) * 3.45, 0, Math.sin(angle) * 3.45),
      ];
      const tickGeo = new THREE.BufferGeometry().setFromPoints(tickPts);
      reticleGroup.add(new THREE.Line(tickGeo, tickMat));
    }


    // Floating Target Beacon Diamond
    const markerGeo = new THREE.OctahedronGeometry(0.28, 0);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, wireframe: true });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.y = 2.4;
    reticleGroup.add(marker);

    scene.add(reticleGroup);

    // ==========================================
    // OBJECT 7: GLOBAL PARTICLE COSMOS (350+ Points)
    // ==========================================
    const cosmosCount = 400;
    const cosmosGeo = new THREE.BufferGeometry();
    const cosmosPos: number[] = [];
    for (let c = 0; c < cosmosCount; c++) {
      cosmosPos.push(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40,
        -Math.random() * 65 + 10
      );
    }
    cosmosGeo.setAttribute('position', new THREE.Float32BufferAttribute(cosmosPos, 3));
    const cosmosMat = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.12,
      transparent: true,
      opacity: 0.6,
    });
    const cosmosParticles = new THREE.Points(cosmosGeo, cosmosMat);
    scene.add(cosmosParticles);

    // --- 4. Interactive Mouse Coordinates & Click Raycasting ---
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Direct 3D Raycasting: Clicking any 3D model selects it
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();

    const onPointerDown = (e: MouseEvent) => {
      if (!freeRoamRef.current || !cameraRef.current) return;
      if ((e.target as HTMLElement)?.closest?.('.hud-corner')) return;

      mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouseVec, cameraRef.current);
      const intersects = raycaster.intersectObjects(masterWorld.children, true);

      if (intersects.length > 0) {
        for (const hit of intersects) {
          let cur: THREE.Object3D | null = hit.object;
          while (cur && cur !== masterWorld) {
            if (cur.userData && cur.userData.specimenId) {
              handleSelectSpecimen(cur.userData.specimenId);
              return;
            }
            cur = cur.parent;
          }
        }
      }
    };
    window.addEventListener('pointerdown', onPointerDown);

    // --- 5. Window Resize Handler ---
    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // --- 6. Master Animation & Scrollytelling Loop ---
    let clock = new THREE.Clock();

    const render = () => {
      const elapsedTime = clock.getElapsedTime();

      // Animate Objects
      // Headset floating bobbing
      headsetGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.12;
      headsetGroup.rotation.y = THREE.MathUtils.lerp(headsetGroup.rotation.y, mouseX * 0.35, 0.05);
      headsetGroup.rotation.x = THREE.MathUtils.lerp(headsetGroup.rotation.x, -mouseY * 0.25, 0.05);

      // Controllers slight independent floating
      leftCtrl.position.y = -0.6 + Math.sin(elapsedTime * 1.8) * 0.08;
      rightCtrl.position.y = -0.6 + Math.cos(elapsedTime * 1.8) * 0.08;

      // Healthcare Heart pulsing heartbeat
      const heartPulse = 1.0 + Math.sin(elapsedTime * 4.0) * 0.08 + (Math.sin(elapsedTime * 8.0) > 0.7 ? 0.06 : 0);
      heartMesh.scale.set(heartPulse, heartPulse, heartPulse);
      scanRing.rotation.z += 0.015;
      medPoints.rotation.y += 0.008;

      // Turbine spinning blades
      bladesGroup.rotation.z -= 0.08;
      casingRing1.position.z = 1.2 + Math.sin(elapsedTime * 2.0) * 0.2;
      casingRing2.position.z = -1.2 - Math.sin(elapsedTime * 2.0) * 0.2;

      // LiDAR scanner sweeping across terrain
      lidarBar.position.z = Math.sin(elapsedTime * 1.8) * 3.8;

      // Spatial UI Windows subtle floating
      win1.rotation.y = Math.sin(elapsedTime * 0.8) * 0.08;
      win2.rotation.x = Math.cos(elapsedTime * 0.9) * 0.08;
      win3.position.y = 0.6 + Math.sin(elapsedTime * 1.2) * 0.12;

      // Twinkling cosmos
      cosmosParticles.rotation.y = elapsedTime * 0.015;

      // Scroll Progress Camera Control vs Free Roam
      if (!freeRoamRef.current) {
        const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const scrollProgress = Math.min(1, Math.max(0, window.scrollY / scrollMax));

        // Smooth Camera Flight along Catmull-Rom or dynamic stages:
        let targetX = 0;
        let targetY = 0;
        let targetZ = 8.5;
        let lookAtX = 0;
        let lookAtY = 0;
        let lookAtZ = 0;

        if (scrollProgress < 0.15) {
          // Act I: Inspect Spatial Headset
          const p = scrollProgress / 0.15;
          const initialX = isDesktop ? 2.4 : 0;
          targetX = THREE.MathUtils.lerp(initialX, 0, p) + mouseX * 0.8;
          targetY = mouseY * 0.5;
          targetZ = 8.5 - p * 3.5;
          lookAtX = THREE.MathUtils.lerp(initialX, 0, p);
          lookAtY = 0;
          lookAtZ = 0;
        } else if (scrollProgress < 0.40) {
          // Act II: Transition through Lenses into Healthcare & Industrial specimens
          const p = (scrollProgress - 0.15) / 0.25;
          targetX = THREE.MathUtils.lerp(0, 3.5, p) + mouseX * 0.6;
          targetY = THREE.MathUtils.lerp(0, 1.2, p) + mouseY * 0.4;
          targetZ = THREE.MathUtils.lerp(5.0, -11.0, p);
          lookAtX = THREE.MathUtils.lerp(0, 0, p);
          lookAtY = 0;
          lookAtZ = THREE.MathUtils.lerp(0, -18.0, p);
        } else if (scrollProgress < 0.70) {
          // Act III: Framing Digital Twin & Simulation Terrain
          const p = (scrollProgress - 0.40) / 0.30;
          targetX = THREE.MathUtils.lerp(3.5, 0, p) + mouseX * 0.8;
          targetY = THREE.MathUtils.lerp(1.2, 3.8, p) + mouseY * 0.5;
          targetZ = THREE.MathUtils.lerp(-11.0, -25.0, p);
          lookAtX = 0;
          lookAtY = 0;
          lookAtZ = THREE.MathUtils.lerp(-18.0, -34.0, p);
        } else {
          // Act IV: Final Induction & Spatial UI matrix
          const p = (scrollProgress - 0.70) / 0.30;
          targetX = THREE.MathUtils.lerp(0, -2.5, p) + mouseX * 0.6;
          targetY = THREE.MathUtils.lerp(3.8, 1.0, p) + mouseY * 0.4;
          targetZ = THREE.MathUtils.lerp(-25.0, -40.0, p);
          lookAtX = THREE.MathUtils.lerp(0, -4.0, p);
          lookAtY = 0;
          lookAtZ = -48.0;
        }

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);

        const currentLookAt = new THREE.Vector3(lookAtX, lookAtY, lookAtZ);
        camera.lookAt(currentLookAt);
      } else {
        // Free Roam Active: update 3D Holographic Reticle around active specimen
        reticleGroup.visible = true;
        const currentSpecId = activeModelRef.current;
        const isDesktopCur = window.innerWidth > 992;
        const currentTargetX = currentSpecId === 'headset' ? (isDesktopCur ? 2.4 : 0) : SPECIMENS_INFO[currentSpecId].target[0];
        const currentTargetY = SPECIMENS_INFO[currentSpecId].target[1];
        const currentTargetZ = SPECIMENS_INFO[currentSpecId].target[2];

        reticleGroup.position.lerp(new THREE.Vector3(currentTargetX, currentTargetY, currentTargetZ), 0.1);
        rRing1.rotation.z += 0.025;
        rRing2.rotation.z -= 0.018;
        marker.rotation.y += 0.04;
        const pulse = 1.0 + Math.sin(elapsedTime * 3.5) * 0.05;
        reticleGroup.scale.set(pulse, pulse, pulse);

        // Smooth camera target lerp to selected specimen
        if (isTransitioningRef.current && controlsRef.current && cameraRef.current) {
          cameraRef.current.position.lerp(targetCamPosRef.current, 0.08);
          controlsRef.current.target.lerp(targetLookAtRef.current, 0.08);

          if (
            cameraRef.current.position.distanceTo(targetCamPosRef.current) < 0.15 &&
            controlsRef.current.target.distanceTo(targetLookAtRef.current) < 0.15
          ) {
            cameraRef.current.position.copy(targetCamPosRef.current);
            controlsRef.current.target.copy(targetLookAtRef.current);
            isTransitioningRef.current = false;
          }
        }
        controls.update();
      }

      if (!freeRoamRef.current) {
        reticleGroup.visible = false;
      }

      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(render);

    // --- 7. Cleanup ---
    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>

      {/* Persistent Fullscreen Spatial Background (3D WebGL on Desktop/Tablet, Lightweight CSS on Mobile) */}
      {isMobile ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'radial-gradient(circle at 50% 20%, var(--accent-cyan-glow) 0%, transparent 60%)',
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.6,
          }}
        />
      ) : (
        <div
          ref={mountRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: isFreeRoam ? 'auto' : 'none',
            zIndex: isFreeRoam ? 40 : 0,
            opacity: 0.95,
            transition: 'z-index 0.3s ease',
          }}
        />
      )}

      {/* Dim overlay over the page content when Free Roam is active */}
      {!isMobile && isFreeRoam && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--surface-section-base)',
            backdropFilter: 'blur(8px)',
            zIndex: 35,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Floating HUD Trigger Buttons (Visible only on Tablet & Desktop >= 768px) */}
      {!isMobile && (
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '12px',
        }}
      >
        {!isFreeRoam ? (
          <button
            onClick={() => {
              setIsFreeRoam(true);
              setShowControlsHint(true);
              soundFx.playHoloActivate();
              handleSelectSpecimen(activeModel);
            }}
            className="btn-primary"
            style={{
              padding: '12px 24px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 0 24px rgba(0, 255, 255, 0.45)',
              borderRadius: '999px',
            }}
          >
            <span className="beacon-dot" />
            <Compass size={17} />
            <span>ENTER 3D UNIVERSE</span>
          </button>
        ) : (
          /* Free-Roam Active HUD Controls Panel */
          <div
            className="glass-card hud-corner"
            style={{
              padding: '18px 24px',
              minWidth: '320px',
              maxWidth: '480px',
              boxShadow: 'var(--shadow-glow)',
              border: '1px solid var(--accent-cyan)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="beacon-dot" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-cyan)', letterSpacing: '0.1em' }}>
                  SPATIAL FREE-ROAM ACTIVE
                </span>
              </div>
              <button
                onClick={() => {
                  setIsFreeRoam(false);
                  soundFx.playModeSwitch();
                }}
                style={{
                  background: 'rgba(255, 0, 127, 0.2)',
                  border: '1px solid rgba(255, 0, 127, 0.5)',
                  color: 'var(--text-primary)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <X size={14} />
                <span>EXIT</span>
              </button>
            </div>

            {/* Model Teleport Buttons */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  SELECT 3D SPECIMEN:
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  Click 3D Model or Button
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  { id: 'headset', label: '6-DoF Headset' },
                  { id: 'healthcare', label: 'Healthcare Core' },
                  { id: 'turbine', label: 'Aero Turbine' },
                  { id: 'digitaltwin', label: 'Digital Twin' },
                  { id: 'simulation', label: 'LiDAR Terrain' },
                  { id: 'spatialui', label: 'Spatial UI' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSpecimen(item.id as any)}
                    style={{
                      background: activeModel === item.id ? 'var(--accent-cyan-glow)' : 'var(--surface-card)',
                      border: activeModel === item.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      color: activeModel === item.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Specimen Detail Card */}
            {SPECIMENS_INFO[activeModel] && (
              <div
                style={{
                  background: 'rgba(0, 245, 255, 0.08)',
                  border: '1px solid rgba(0, 245, 255, 0.3)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {SPECIMENS_INFO[activeModel].label}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent-cyan)', background: 'rgba(0, 245, 255, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                    {SPECIMENS_INFO[activeModel].tag}
                  </span>
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                  {SPECIMENS_INFO[activeModel].desc}
                </p>
              </div>
            )}

            {/* Orbit Instructions */}
            {showControlsHint && (
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Left Click: Orbit • Right Click: Pan • Scroll: Zoom</span>
              </div>
            )}
          </div>
        )}
      </div>
      )}
    </>
  );
}
