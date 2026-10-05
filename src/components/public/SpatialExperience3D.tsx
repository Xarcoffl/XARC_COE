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
    label: 'Anatomical Cardiac Core',
    tag: 'HEALTHCARE VERTICAL',
    desc: 'Anatomically articulated volumetric human heart with pulsatile ventricular rhythms, aortic arch, coronary vasculature, and live ECG rhythm.',
    target: [7, 0, -18],
    cam: [7, 0.4, -12.5],
  },
  turbine: {
    label: 'Aero Jet Turbine',
    tag: 'AEROSPACE TWIN',
    desc: 'High-RPM jet engine turbine with spinning titanium blades and exploded thermal compression rings.',
    target: [-7, 0, -18],
    cam: [-7, 0.6, -12.5],
  },
  digitaltwin: {
    label: 'Robotic Digital Twin',
    tag: 'CYBER-PHYSICAL TWIN',
    desc: 'Industrial robotic manipulator paired with its real-time holographic digital clone, synchronized telemetry bridge, and live joint load diagnostics.',
    target: [0, 0, -34],
    cam: [0, 2.4, -26],
  },
  simulation: {
    label: 'LiDAR Terrain Mesh',
    tag: 'GEOSPATIAL TERRAIN',
    desc: 'Dynamic undulating terrain with real-time laser elevation sweep bar and topographical contour matrices.',
    target: [7, 0, -48],
    cam: [7, 2.5, -41.5],
  },
  spatialui: {
    label: 'VisionOS Spatial UI Workspace',
    tag: 'SPATIAL COMPUTING',
    desc: 'Floating frosted-glass workspace panel featuring live audio equalizer, telemetry widgets, KPI cards, and interactive controls.',
    target: [-7, 0, -48],
    cam: [-7, 0.6, -42.2],
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
    // OBJECT 2: ANATOMICAL HUMAN HEART CORE (at X = 7, Z = -18)
    // ==========================================
    const healthcareGroup = new THREE.Group();
    healthcareGroup.position.set(7, 0, -18);

    const heartAnatomyGroup = new THREE.Group();

    // Biological Tissue Materials
    const myocardiumMat = new THREE.MeshPhysicalMaterial({
      color: 0x881337, // Rich deep cardiac muscle crimson
      emissive: 0x4c0519, // Deep vascular warmth
      emissiveIntensity: 0.35,
      roughness: 0.25, // Wet living myocardial tissue
      metalness: 0.05,
      clearcoat: 1.0, // Glistening pericardial fluid / surgical wet sheen
      clearcoatRoughness: 0.12,
      reflectivity: 0.9,
    });

    const fatMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a, // Epicardial adipose pale ivory/cream fat
      emissive: 0x854d0e, // Warm organic subsurface glow
      emissiveIntensity: 0.15,
      roughness: 0.65, // Soft matte biological fat
      metalness: 0.02,
    });

    const aortaMat = new THREE.MeshPhysicalMaterial({
      color: 0xbe123c, // Elastic arterial wall
      emissive: 0x881337,
      emissiveIntensity: 0.35,
      roughness: 0.28,
      clearcoat: 0.9,
      clearcoatRoughness: 0.14,
    });

    const venousMat = new THREE.MeshPhysicalMaterial({
      color: 0x1d4ed8, // Deoxygenated venous blue
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.3,
      roughness: 0.3,
      clearcoat: 0.85,
      clearcoatRoughness: 0.15,
    });

    const coronaryArteryMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Oxygenated arterial red
      roughness: 0.25,
      metalness: 0.1,
    });

    const coronaryVeinMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb, // Deoxygenated venous blue
      roughness: 0.25,
      metalness: 0.1,
    });

    // Sub-assemblies for anatomical organization & physiological animation
    const ventriclesGroup = new THREE.Group();
    const atriaGroup = new THREE.Group();
    const sulcusFatGroup = new THREE.Group();
    const vesselsGroup = new THREE.Group();
    const coronaryVasculatureGroup = new THREE.Group();

    // 1. LEFT VENTRICLE (LV) & APEX CORDIS
    // Dominant muscular conical chamber forming the apex tilted infero-laterally (down-left-forward)
    const lvGeo = new THREE.SphereGeometry(1.04, 48, 48);
    const lvPos = lvGeo.attributes.position;
    for (let i = 0; i < lvPos.count; i++) {
      let x = lvPos.getX(i);
      let y = lvPos.getY(i);
      let z = lvPos.getZ(i);

      // Taper down to conical apex cordis at (0.38, -1.35, 0.30)
      if (y < 0.2) {
        const factor = Math.max(0, (y + 1.04) / 1.24);
        const taper = Math.max(0.18, Math.pow(factor, 0.72));
        x *= taper;
        z *= taper;
        // Shift apex to anatomical left (+X) and anterior (+Z)
        x += (1 - factor) * 0.38;
        z += (1 - factor) * 0.30;
      }
      // Lateral thick muscular bulge of left ventricular free wall
      if (x > 0.08) {
        x *= 1.15;
        z += Math.sin((y + 1.0) * 1.2) * 0.12;
      }
      // Septal wall: slightly flattened where LV abuts RV
      if (x < -0.1) {
        x *= 0.86;
      }
      // Spiral vortex cordis striations (subtle muscular fiber grooves)
      const len = Math.hypot(x, z);
      if (len > 0.001) {
        const angle = Math.atan2(z, x);
        const spiral = Math.sin(angle * 6 + y * 4.5) * 0.016;
        x += (x / len) * spiral;
        z += (z / len) * spiral;
      }

      lvPos.setXYZ(i, x, y, z);
    }
    lvGeo.computeVertexNormals();
    const lvMesh = new THREE.Mesh(lvGeo, myocardiumMat);
    lvMesh.position.set(0.18, -0.15, -0.05);
    ventriclesGroup.add(lvMesh);

    // 2. RIGHT VENTRICLE (RV) & CONUS ARTERIOSUS (INFUNDIBULUM)
    // Sits on anterior surface and right of septum, crescentic, tapering up to conus arteriosus
    const rvGeo = new THREE.SphereGeometry(0.9, 48, 48);
    const rvPos = rvGeo.attributes.position;
    for (let i = 0; i < rvPos.count; i++) {
      let x = rvPos.getX(i);
      let y = rvPos.getY(i);
      let z = rvPos.getZ(i);

      // Anterior wall bulge
      if (z > 0.0) {
        z += Math.sin((y + 0.9) * 1.4) * 0.22;
      }
      // Inferior truncation (stops above apex at incisura apicis cordis)
      if (y < -0.1) {
        const factor = Math.max(0, (y + 0.9) / 1.0);
        x *= Math.max(0.25, Math.pow(factor, 0.7));
        z *= Math.max(0.25, Math.pow(factor, 0.7));
        x += (1 - factor) * 0.18;
      }
      // Superior tapering into conus arteriosus (infundibulum)
      if (y > 0.1) {
        const factor = (y - 0.1) / 0.8;
        x = x * (1 - factor * 0.5) + factor * 0.12;
        z = z * (1 - factor * 0.3) + factor * 0.18;
        y += factor * 0.25;
      }
      // Medial flattening against septum
      if (x > 0.15) {
        x = 0.15 + (x - 0.15) * 0.5;
      }

      rvPos.setXYZ(i, x, y, z);
    }
    rvGeo.computeVertexNormals();
    const rvMesh = new THREE.Mesh(rvGeo, myocardiumMat);
    rvMesh.position.set(-0.35, -0.18, 0.22);
    ventriclesGroup.add(rvMesh);

    // 3. RIGHT ATRIUM (RA) & RIGHT AURICLE (AURICULA DEXTRA)
    // Smooth venous chamber on right lateral aspect
    const raGeo = new THREE.SphereGeometry(0.68, 36, 36);
    raGeo.scale(0.85, 1.05, 0.85);
    const raMesh = new THREE.Mesh(raGeo, myocardiumMat);
    raMesh.position.set(-0.78, 0.48, -0.12);
    atriaGroup.add(raMesh);

    // Right Auricle (Auricula Dextra): The iconic ruffled dog-ear flap wrapping forward over the aorta
    const rAuricleGeo = new THREE.ConeGeometry(0.38, 0.65, 16, 8);
    const rAuPos = rAuricleGeo.attributes.position;
    for (let i = 0; i < rAuPos.count; i++) {
      let x = rAuPos.getX(i);
      let y = rAuPos.getY(i);
      let z = rAuPos.getZ(i);
      const progress = Math.max(0, Math.min(1, (y + 0.325) / 0.65));
      z += Math.pow(progress, 1.5) * 0.28;
      x += Math.sin(progress * Math.PI) * 0.1;
      const len = Math.hypot(x, z);
      if (len > 0.001) {
        const angle = Math.atan2(z, x);
        const scallop = Math.sin(angle * 7) * 0.035 * progress;
        x += (x / len) * scallop;
        z += (z / len) * scallop;
      }
      rAuPos.setXYZ(i, x, y, z);
    }
    rAuricleGeo.computeVertexNormals();
    const rAuricleMesh = new THREE.Mesh(rAuricleGeo, myocardiumMat);
    rAuricleMesh.rotation.set(0.6, 0.4, -1.2);
    rAuricleMesh.position.set(-0.48, 0.62, 0.28);
    atriaGroup.add(rAuricleMesh);

    // 4. LEFT ATRIUM (LA) & LEFT AURICLE (AURICULA SINISTRA)
    // Posterior superior muscular chamber
    const laGeo = new THREE.SphereGeometry(0.65, 36, 36);
    laGeo.scale(0.95, 0.9, 0.85);
    const laMesh = new THREE.Mesh(laGeo, myocardiumMat);
    laMesh.position.set(0.35, 0.52, -0.38);
    atriaGroup.add(laMesh);

    // Left Auricle (Auricula Sinistra): Curving forward around the pulmonary trunk
    const lAuricleGeo = new THREE.ConeGeometry(0.28, 0.55, 16, 8);
    const lAuPos = lAuricleGeo.attributes.position;
    for (let i = 0; i < lAuPos.count; i++) {
      let x = lAuPos.getX(i);
      let y = lAuPos.getY(i);
      let z = lAuPos.getZ(i);
      const progress = Math.max(0, Math.min(1, (y + 0.275) / 0.55));
      z += Math.pow(progress, 1.4) * 0.25;
      x -= Math.sin(progress * Math.PI) * 0.08;
      const len = Math.hypot(x, z);
      if (len > 0.001) {
        const angle = Math.atan2(z, x);
        const scallop = Math.sin(angle * 6) * 0.028 * progress;
        x += (x / len) * scallop;
        z += (z / len) * scallop;
      }
      lAuPos.setXYZ(i, x, y, z);
    }
    lAuricleGeo.computeVertexNormals();
    const lAuricleMesh = new THREE.Mesh(lAuricleGeo, myocardiumMat);
    lAuricleMesh.rotation.set(0.5, -0.5, 1.1);
    lAuricleMesh.position.set(0.58, 0.56, 0.16);
    atriaGroup.add(lAuricleMesh);

    // 5. EPICARDIAL ADIPOSE TISSUE (SULCUS FAT PADS)
    // Characteristic pale yellow fat deposits in grooves between chambers - crucial human body signifier
    const antSulcusCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.16, 0.58, 0.44),
      new THREE.Vector3(-0.12, 0.28, 0.54),
      new THREE.Vector3(-0.02, -0.12, 0.56),
      new THREE.Vector3(0.12, -0.55, 0.50),
      new THREE.Vector3(0.26, -0.98, 0.42),
      new THREE.Vector3(0.38, -1.32, 0.34),
    ]);
    const antSulcusFat = new THREE.Mesh(new THREE.TubeGeometry(antSulcusCurve, 32, 0.075, 10, false), fatMat);
    sulcusFatGroup.add(antSulcusFat);

    // Organic fat lobules along anterior sulcus
    const antFatNodes = [
      { x: -0.14, y: 0.42, z: 0.52, r: 0.12 },
      { x: -0.06, y: 0.10, z: 0.58, r: 0.13 },
      { x: 0.05, y: -0.32, z: 0.55, r: 0.12 },
      { x: 0.18, y: -0.75, z: 0.48, r: 0.11 },
      { x: 0.32, y: -1.15, z: 0.39, r: 0.10 },
    ];
    antFatNodes.forEach((node) => {
      const lobule = new THREE.Mesh(new THREE.SphereGeometry(node.r, 12, 12), fatMat);
      lobule.position.set(node.x, node.y, node.z);
      lobule.scale.set(1.1, 0.8, 0.9);
      sulcusFatGroup.add(lobule);
    });

    // Right Atrioventricular (Coronary) Sulcus Fat Band
    const rAvCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.25, 0.45, 0.42),
      new THREE.Vector3(-0.52, 0.38, 0.35),
      new THREE.Vector3(-0.76, 0.26, 0.12),
      new THREE.Vector3(-0.84, 0.15, -0.18),
    ]);
    const rAvFat = new THREE.Mesh(new THREE.TubeGeometry(rAvCurve, 24, 0.07, 10, false), fatMat);
    sulcusFatGroup.add(rAvFat);

    // Left Atrioventricular (Coronary) Sulcus Fat Band
    const lAvCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.24, 0.42, 0.32),
      new THREE.Vector3(0.52, 0.35, 0.22),
      new THREE.Vector3(0.72, 0.22, -0.08),
      new THREE.Vector3(0.68, 0.15, -0.32),
    ]);
    const lAvFat = new THREE.Mesh(new THREE.TubeGeometry(lAvCurve, 24, 0.065, 10, false), fatMat);
    sulcusFatGroup.add(lAvFat);

    // Apical Adipose Cushion (surrounds apex cordis)
    const apicalFat = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14), fatMat);
    apicalFat.position.set(0.38, -1.34, 0.32);
    apicalFat.scale.set(1.2, 0.8, 1.1);
    sulcusFatGroup.add(apicalFat);

    // Aortic Root / Conus Fat Cushion
    const rootFat = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), fatMat);
    rootFat.position.set(-0.02, 0.65, 0.28);
    rootFat.scale.set(1.4, 0.7, 1.0);
    sulcusFatGroup.add(rootFat);

    // 6. THE GREAT VESSELS
    // A. Aortic Root Bulb (Sinuses of Valsalva)
    const bulbSinus1 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), aortaMat);
    bulbSinus1.position.set(0.08, 0.68, 0.02);
    vesselsGroup.add(bulbSinus1);
    const bulbSinus2 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), aortaMat);
    bulbSinus2.position.set(-0.06, 0.66, 0.06);
    vesselsGroup.add(bulbSinus2);
    const bulbSinus3 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), aortaMat);
    bulbSinus3.position.set(0.02, 0.66, -0.10);
    vesselsGroup.add(bulbSinus3);

    // B. Ascending Aorta & Arch (thick elastic artery arching up, back, and to patient's left)
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.72, 0.02),
      new THREE.Vector3(0.04, 1.42, -0.04),
      new THREE.Vector3(0.18, 1.82, -0.20),
      new THREE.Vector3(0.48, 1.62, -0.40),
      new THREE.Vector3(0.58, 0.65, -0.48),
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 36, 0.24, 20, false);
    const aortaMesh = new THREE.Mesh(aortaGeo, aortaMat);
    vesselsGroup.add(aortaMesh);

    // C. Three Great Supra-Aortic Branches
    // 1. Brachiocephalic Trunk (Innominate)
    const brachioGeo = new THREE.CylinderGeometry(0.085, 0.095, 0.52, 14);
    const brachioMesh = new THREE.Mesh(brachioGeo, aortaMat);
    brachioMesh.position.set(0.04, 1.95, -0.10);
    brachioMesh.rotation.set(0.15, 0, 0.28);
    vesselsGroup.add(brachioMesh);

    // 2. Left Common Carotid Artery
    const carotidGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.50, 14);
    const carotidMesh = new THREE.Mesh(carotidGeo, aortaMat);
    carotidMesh.position.set(0.22, 2.02, -0.22);
    carotidMesh.rotation.set(0.05, 0, 0.02);
    vesselsGroup.add(carotidMesh);

    // 3. Left Subclavian Artery
    const subclavianGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.46, 14);
    const subclavianMesh = new THREE.Mesh(subclavianGeo, aortaMat);
    subclavianMesh.position.set(0.38, 1.94, -0.32);
    subclavianMesh.rotation.set(-0.08, 0, -0.22);
    vesselsGroup.add(subclavianMesh);

    // D. Pulmonary Trunk (Truncus Pulmonalis)
    // Originates from RV infundibulum, crosses anterior to ascending aorta, and bifurcates
    const pulmCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.16, 0.60, 0.38),
      new THREE.Vector3(-0.08, 0.98, 0.26),
      new THREE.Vector3(0.06, 1.28, 0.12),
    ]);
    const pulmGeo = new THREE.TubeGeometry(pulmCurve, 24, 0.21, 18, false);
    const pulmMesh = new THREE.Mesh(pulmGeo, venousMat);
    vesselsGroup.add(pulmMesh);

    // Left Pulmonary Artery
    const leftPulmCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.06, 1.28, 0.12),
      new THREE.Vector3(0.28, 1.34, 0.02),
      new THREE.Vector3(0.52, 1.32, -0.12),
    ]);
    const leftPulmMesh = new THREE.Mesh(new THREE.TubeGeometry(leftPulmCurve, 16, 0.14, 12, false), venousMat);
    vesselsGroup.add(leftPulmMesh);

    // Right Pulmonary Artery (passes beneath aortic arch)
    const rightPulmCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.06, 1.28, 0.12),
      new THREE.Vector3(-0.22, 1.25, -0.04),
      new THREE.Vector3(-0.52, 1.18, -0.18),
    ]);
    const rightPulmMesh = new THREE.Mesh(new THREE.TubeGeometry(rightPulmCurve, 16, 0.14, 12, false), venousMat);
    vesselsGroup.add(rightPulmMesh);

    // Ligamentum Arteriosum
    const ligCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.06, 1.28, 0.12),
      new THREE.Vector3(0.12, 1.55, -0.10),
    ]);
    const ligMesh = new THREE.Mesh(new THREE.TubeGeometry(ligCurve, 10, 0.035, 8, false), fatMat);
    vesselsGroup.add(ligMesh);

    // E. Superior Vena Cava (SVC)
    const svcGeo = new THREE.CylinderGeometry(0.18, 0.19, 0.95, 16);
    const svcMesh = new THREE.Mesh(svcGeo, venousMat);
    svcMesh.position.set(-0.78, 1.28, -0.22);
    vesselsGroup.add(svcMesh);

    // F. Inferior Vena Cava (IVC)
    const ivcGeo = new THREE.CylinderGeometry(0.19, 0.18, 0.75, 16);
    const ivcMesh = new THREE.Mesh(ivcGeo, venousMat);
    ivcMesh.position.set(-0.72, -0.72, -0.24);
    vesselsGroup.add(ivcMesh);

    // G. Pulmonary Veins (Four venous trunks entering posterior Left Atrium)
    const pvCoords = [
      { x: 0.58, y: 0.68, z: -0.52, rx: -0.4, rz: 0.3 },
      { x: 0.58, y: 0.40, z: -0.52, rx: -0.2, rz: 0.4 },
      { x: -0.08, y: 0.66, z: -0.52, rx: -0.4, rz: -0.3 },
      { x: -0.08, y: 0.38, z: -0.52, rx: -0.2, rz: -0.4 },
    ];
    pvCoords.forEach((c) => {
      const pvMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.10, 0.45, 12), venousMat);
      pvMesh.position.set(c.x, c.y, c.z);
      pvMesh.rotation.set(c.rx, 0, c.rz);
      vesselsGroup.add(pvMesh);
    });

    // 7. CORONARY VASCULAR NETWORK (LAD, GCV, RCA & Branches)
    // Left Anterior Descending (LAD) Artery nestled in anterior sulcus fat
    const ladCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.14, 0.58, 0.46),
      new THREE.Vector3(-0.10, 0.28, 0.56),
      new THREE.Vector3(-0.01, -0.10, 0.58),
      new THREE.Vector3(0.14, -0.55, 0.52),
      new THREE.Vector3(0.28, -0.98, 0.44),
      new THREE.Vector3(0.38, -1.30, 0.36),
    ]);
    const ladMesh = new THREE.Mesh(new THREE.TubeGeometry(ladCurve, 32, 0.038, 10, false), coronaryArteryMat);
    coronaryVasculatureGroup.add(ladMesh);

    // Diagonal Branch 1 (D1) sweeping across LV anterior wall
    const d1Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.10, 0.28, 0.56),
      new THREE.Vector3(0.12, 0.12, 0.56),
      new THREE.Vector3(0.35, -0.05, 0.46),
      new THREE.Vector3(0.55, -0.25, 0.28),
    ]);
    coronaryVasculatureGroup.add(new THREE.Mesh(new THREE.TubeGeometry(d1Curve, 18, 0.024, 8, false), coronaryArteryMat));

    // Diagonal Branch 2 (D2)
    const d2Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.14, -0.55, 0.52),
      new THREE.Vector3(0.32, -0.68, 0.46),
      new THREE.Vector3(0.50, -0.82, 0.30),
    ]);
    coronaryVasculatureGroup.add(new THREE.Mesh(new THREE.TubeGeometry(d2Curve, 16, 0.020, 8, false), coronaryArteryMat));

    // Great Cardiac Vein (Vena Cordis Magna) running parallel to LAD
    const gcvCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.36, -1.26, 0.38),
      new THREE.Vector3(0.25, -0.95, 0.45),
      new THREE.Vector3(0.11, -0.52, 0.53),
      new THREE.Vector3(-0.04, -0.08, 0.58),
      new THREE.Vector3(-0.14, 0.30, 0.55),
      new THREE.Vector3(-0.20, 0.56, 0.45),
    ]);
    const gcvMesh = new THREE.Mesh(new THREE.TubeGeometry(gcvCurve, 32, 0.032, 10, false), coronaryVeinMat);
    coronaryVasculatureGroup.add(gcvMesh);

    // Right Coronary Artery (RCA) & Acute Marginal Branch
    const rcaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.12, 0.65, 0.24),
      new THREE.Vector3(-0.35, 0.48, 0.42),
      new THREE.Vector3(-0.62, 0.36, 0.34),
      new THREE.Vector3(-0.80, 0.20, 0.12),
    ]);
    coronaryVasculatureGroup.add(new THREE.Mesh(new THREE.TubeGeometry(rcaCurve, 20, 0.034, 8, false), coronaryArteryMat));

    const marginalCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.62, 0.36, 0.34),
      new THREE.Vector3(-0.72, 0.05, 0.36),
      new THREE.Vector3(-0.68, -0.38, 0.30),
    ]);
    coronaryVasculatureGroup.add(new THREE.Mesh(new THREE.TubeGeometry(marginalCurve, 16, 0.022, 8, false), coronaryArteryMat));

    // Microvascular Terminal Arterioles
    const microBranches = [
      [new THREE.Vector3(-0.04, -0.08, 0.58), new THREE.Vector3(-0.25, -0.22, 0.52), new THREE.Vector3(-0.42, -0.35, 0.42)],
      [new THREE.Vector3(0.28, -0.98, 0.44), new THREE.Vector3(0.22, -1.18, 0.40)],
      [new THREE.Vector3(0.35, -0.05, 0.46), new THREE.Vector3(0.42, 0.15, 0.38)],
    ];
    microBranches.forEach((pts) => {
      coronaryVasculatureGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.015, 6, false), coronaryArteryMat));
    });

    // Assemble full heart anatomy
    heartAnatomyGroup.add(ventriclesGroup);
    heartAnatomyGroup.add(atriaGroup);
    heartAnatomyGroup.add(sulcusFatGroup);
    heartAnatomyGroup.add(vesselsGroup);
    heartAnatomyGroup.add(coronaryVasculatureGroup);

    // Save sub-assemblies for authentic biphasic cardiac cycle animation
    heartAnatomyGroup.userData = {
      ventriclesGroup,
      atriaGroup,
      aortaMesh,
      pulmMesh,
    };

    // Dedicated surgical examination illumination for deep muscle & glistening wet specular sheen
    const surgicalLight = new THREE.PointLight(0xfff7ed, 3.2, 16);
    surgicalLight.position.set(0, 2.5, 3.5);
    healthcareGroup.add(surgicalLight);

    const rimLight = new THREE.PointLight(0x0284c7, 1.8, 12);
    rimLight.position.set(0, -1, -3);
    healthcareGroup.add(rimLight);

    healthcareGroup.add(heartAnatomyGroup);

    // 6. Holographic Electrocardiogram (ECG / EKG) Wave Ring
    const ecgSegments = 160;
    const ecgPts: THREE.Vector3[] = [];
    const rEcg = 2.45;
    for (let i = 0; i <= ecgSegments; i++) {
      const theta = (i / ecgSegments) * Math.PI * 2;
      const phase = (i % 80) / 80;
      let yDisp = 0;
      if (phase >= 0.18 && phase < 0.26) {
        yDisp = Math.sin(((phase - 0.18) / 0.08) * Math.PI) * 0.18;
      } else if (phase >= 0.30 && phase < 0.33) {
        yDisp = -0.16;
      } else if (phase >= 0.33 && phase < 0.39) {
        yDisp = Math.sin(((phase - 0.33) / 0.06) * Math.PI) * 0.95;
      } else if (phase >= 0.39 && phase < 0.42) {
        yDisp = -0.25;
      } else if (phase >= 0.50 && phase < 0.64) {
        yDisp = Math.sin(((phase - 0.50) / 0.14) * Math.PI) * 0.28;
      }
      ecgPts.push(new THREE.Vector3(Math.cos(theta) * rEcg, yDisp, Math.sin(theta) * rEcg));
    }
    const ecgGeo = new THREE.BufferGeometry().setFromPoints(ecgPts);
    const ecgLine = new THREE.Line(ecgGeo, new THREE.LineBasicMaterial({ color: 0x00f5ff }));
    ecgLine.rotation.x = Math.PI / 10;
    healthcareGroup.add(ecgLine);

    // 7. Diagnostic MRI Scan Ring Plane
    const scanRingGeo = new THREE.TorusGeometry(2.3, 0.025, 16, 64);
    const scanRingMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.rotation.x = Math.PI / 2.8;
    healthcareGroup.add(scanRing);

    // 8. Micro Particle Cloud
    const medPointsGeo = new THREE.BufferGeometry();
    const medCoords: number[] = [];
    for (let i = 0; i < 110; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.1 + Math.random() * 0.7;
      medCoords.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
    }
    medPointsGeo.setAttribute('position', new THREE.Float32BufferAttribute(medCoords, 3));
    const medPoints = new THREE.Points(medPointsGeo, new THREE.PointsMaterial({ color: 0x00ffff, size: 0.07, transparent: true, opacity: 0.75 }));
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
    // OBJECT 4: INDUSTRIAL ROBOTIC DIGITAL TWIN (at X = 0, Z = -34)
    // ==========================================
    const digitalTwinGroup = new THREE.Group();
    digitalTwinGroup.position.set(0, 0, -34);

    // Base Support Platform with Cybernetic Grid
    const twinPlatform = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 0.15, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x091024, metalness: 0.8, roughness: 0.3 })
    );
    twinPlatform.position.y = -2.05;
    digitalTwinGroup.add(twinPlatform);

    const platformGrid = new THREE.GridHelper(7.2, 18, 0x00ffff, 0x1e293b);
    platformGrid.position.y = -1.96;
    digitalTwinGroup.add(platformGrid);

    // Robot Arm Builder Function (Generates identical kinematics for physical & virtual twins)
    const makeRobotArm = (isHologram: boolean) => {
      const armGroup = new THREE.Group();

      const mainMat = isHologram
        ? new THREE.MeshPhysicalMaterial({
            color: 0x00f5ff,
            emissive: 0x00f5ff,
            emissiveIntensity: 0.45,
            transmission: 0.82,
            transparent: true,
            opacity: 0.88,
            roughness: 0.1,
            metalness: 0.2,
          })
        : new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            metalness: 0.88,
            roughness: 0.22,
          });

      const jointMat = isHologram
        ? new THREE.MeshPhysicalMaterial({
            color: 0x7b61ff,
            emissive: 0x7b61ff,
            emissiveIntensity: 0.55,
            transmission: 0.8,
            transparent: true,
            opacity: 0.88,
          })
        : new THREE.MeshStandardMaterial({
            color: 0x475569,
            metalness: 0.92,
            roughness: 0.18,
          });

      const accentMat = isHologram
        ? new THREE.MeshBasicMaterial({ color: 0x00ffff })
        : new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 }); // Safety yellow/amber

      // 1. Base Mounting Flange
      const baseFlange = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.15, 0.25, 24), mainMat);
      baseFlange.position.y = -1.82;
      armGroup.add(baseFlange);

      // 2. Rotating Turret Column
      const turret = new THREE.Group();
      turret.position.y = -1.7;
      armGroup.add(turret);

      const turretMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.85, 0.55, 24), mainMat);
      turretMesh.position.y = 0.28;
      turret.add(turretMesh);

      // 3. Articulated Shoulder Joint
      const shoulder = new THREE.Group();
      shoulder.position.set(0, 0.6, 0);
      turret.add(shoulder);

      const shoulderPivot = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.72, 16), jointMat);
      shoulderPivot.rotation.z = Math.PI / 2;
      shoulder.add(shoulderPivot);

      // Primary Boom Arm
      const bicepGroup = new THREE.Group();
      shoulder.add(bicepGroup);

      const bicep = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.8, 0.38), mainMat);
      bicep.position.set(0, 0.9, 0);
      bicepGroup.add(bicep);

      // Warning hazard stripe
      const hazardStripe = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.4), accentMat);
      hazardStripe.position.set(0, 0.9, 0);
      bicepGroup.add(hazardStripe);

      // 4. Elbow Joint
      const elbow = new THREE.Group();
      elbow.position.set(0, 1.8, 0);
      bicepGroup.add(elbow);

      const elbowPivot = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.6, 16), jointMat);
      elbowPivot.rotation.z = Math.PI / 2;
      elbow.add(elbowPivot);

      // 5. Forearm Boom
      const forearmGroup = new THREE.Group();
      elbow.add(forearmGroup);

      const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.5, 0.28), mainMat);
      forearm.position.set(0, 0.75, 0);
      forearmGroup.add(forearm);

      // 6. 3-Axis Wrist & Tool End-Effector
      const wrist = new THREE.Group();
      wrist.position.set(0, 1.5, 0);
      forearmGroup.add(wrist);

      const wristSphere = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), jointMat);
      wrist.add(wristSphere);

      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.14, 0.36, 16), accentMat);
      nozzle.position.set(0, 0.22, 0);
      wrist.add(nozzle);

      // Tool Head Emitter (Laser or Optical Scanner Tip)
      const tipColor = isHologram ? 0x00f5ff : 0xef4444;
      const emitterTip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), new THREE.MeshBasicMaterial({ color: tipColor }));
      emitterTip.position.set(0, 0.42, 0);
      wrist.add(emitterTip);

      // Holographic glowing wireframe borders
      if (isHologram) {
        const wireMat = new THREE.LineBasicMaterial({ color: 0x00f5ff });
        [baseFlange, turretMesh, bicep, forearm].forEach((m) => {
          m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), wireMat));
        });
      }

      return {
        root: armGroup,
        turret,
        shoulder,
        bicepGroup,
        elbow,
        forearmGroup,
        wrist,
        emitterTip,
      };
    };

    // Instantiate Physical Twin (Left at X = -2.5)
    const physArm = makeRobotArm(false);
    physArm.root.position.set(-2.5, 0, 0);
    digitalTwinGroup.add(physArm.root);

    // Instantiate Digital Twin Clone (Right at X = +2.5)
    const holoArm = makeRobotArm(true);
    holoArm.root.position.set(2.5, 0, 0);
    digitalTwinGroup.add(holoArm.root);

    // Central Holographic Synchronization Bridge & Telemetry Rays
    const syncLaserMat = new THREE.LineDashedMaterial({ color: 0x00f5ff, dashSize: 0.2, gapSize: 0.15 });
    const makeSyncLaser = (y: number, z: number) => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-2.5, y, z),
        new THREE.Vector3(2.5, y, z),
      ]);
      const line = new THREE.Line(geo, syncLaserMat);
      line.computeLineDistances();
      digitalTwinGroup.add(line);
      return line;
    };
    makeSyncLaser(-1.2, 0); // Base sync
    makeSyncLaser(0.2, 0);  // Shoulder sync
    makeSyncLaser(1.5, 0);  // Elbow sync

    // Moving Data Packet Photons along the Telemetry Bridge
    const dataPackets: Array<{ mesh: THREE.Mesh; y: number; speed: number; offset: number }> = [];
    for (let p = 0; p < 8; p++) {
      const pktGeo = new THREE.SphereGeometry(0.065, 8, 8);
      const pktMat = new THREE.MeshBasicMaterial({ color: p % 2 === 0 ? 0x00ffff : 0x7b61ff });
      const pktMesh = new THREE.Mesh(pktGeo, pktMat);
      const py = -1.2 + (p % 3) * 1.35;
      pktMesh.position.set(-2.5, py, 0);
      digitalTwinGroup.add(pktMesh);
      dataPackets.push({ mesh: pktMesh, y: py, speed: 0.6 + (p % 3) * 0.2, offset: (p / 8) * 5.0 });
    }

    // Floating Twin Telemetry Status Label
    const twinLabelGeo = new THREE.PlaneGeometry(3.2, 0.75);
    const twinCanvas = document.createElement('canvas');
    twinCanvas.width = 512;
    twinCanvas.height = 140;
    const twinCtx = twinCanvas.getContext('2d');
    if (twinCtx) {
      twinCtx.fillStyle = 'rgba(6, 12, 28, 0.88)';
      twinCtx.strokeStyle = 'rgba(0, 245, 255, 0.5)';
      twinCtx.lineWidth = 3;
      twinCtx.beginPath();
      twinCtx.roundRect(8, 8, 496, 124, 16);
      twinCtx.fill();
      twinCtx.stroke();

      twinCtx.fillStyle = '#00f5ff';
      twinCtx.font = 'bold 26px monospace';
      twinCtx.fillText('DIGITAL TWIN // CYBER-PHYSICAL', 24, 48);

      twinCtx.fillStyle = '#4ade80';
      twinCtx.font = 'bold 20px monospace';
      twinCtx.fillText('● 100% PHASE LOCKED • 0.4ms SYNC', 24, 88);

      twinCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      twinCtx.font = '16px monospace';
      twinCtx.fillText('PHYSICAL [LEFT] <=====> VIRTUAL [RIGHT]', 24, 118);
    }
    const twinTexture = new THREE.CanvasTexture(twinCanvas);
    const twinLabel = new THREE.Mesh(twinLabelGeo, new THREE.MeshBasicMaterial({ map: twinTexture, transparent: true }));
    twinLabel.position.set(0, 2.6, 0);
    digitalTwinGroup.add(twinLabel);

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
    // OBJECT 6: VISION_OS SPATIAL UI WORKSPACE (at X = -7, Z = -48)
    // ==========================================
    const spatialUIGroup = new THREE.Group();
    spatialUIGroup.position.set(-7, 0, -48);

    // 1. Dynamic Canvas for Rich UI Panel Elements
    const uiCanvas = document.createElement('canvas');
    uiCanvas.width = 1024;
    uiCanvas.height = 640;
    const uiCtx = uiCanvas.getContext('2d');

    const drawSpatialUIDashboard = (time: number) => {
      if (!uiCtx) return;
      uiCtx.clearRect(0, 0, 1024, 640);

      // Glass Panel Background
      uiCtx.fillStyle = 'rgba(6, 12, 28, 0.88)';
      uiCtx.beginPath();
      uiCtx.roundRect(0, 0, 1024, 640, 24);
      uiCtx.fill();
      uiCtx.strokeStyle = 'rgba(0, 245, 255, 0.4)';
      uiCtx.lineWidth = 3;
      uiCtx.stroke();

      // Top Title Bar
      uiCtx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      uiCtx.fillRect(0, 0, 1024, 56);
      uiCtx.strokeStyle = 'rgba(0, 245, 255, 0.2)';
      uiCtx.lineWidth = 1.5;
      uiCtx.beginPath();
      uiCtx.moveTo(0, 56);
      uiCtx.lineTo(1024, 56);
      uiCtx.stroke();

      // Window Control Dots
      [{ x: 32, col: '#ef4444' }, { x: 56, col: '#f59e0b' }, { x: 80, col: '#10b981' }].forEach((btn) => {
        uiCtx.fillStyle = btn.col;
        uiCtx.beginPath();
        uiCtx.arc(btn.x, 28, 7, 0, Math.PI * 2);
        uiCtx.fill();
      });

      uiCtx.fillStyle = '#f8fafc';
      uiCtx.font = 'bold 18px "Inter", sans-serif';
      uiCtx.fillText('VISION_OS // SPATIAL WORKSPACE v3.1', 115, 35);

      uiCtx.fillStyle = '#00f5ff';
      uiCtx.font = 'bold 13px monospace';
      uiCtx.fillText('● LIVE ENGINE [60 FPS • 120Hz SPATIAL]', 580, 35);

      // Search pill
      uiCtx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      uiCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      uiCtx.beginPath();
      uiCtx.roundRect(865, 14, 140, 28, 14);
      uiCtx.fill();
      uiCtx.stroke();
      uiCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      uiCtx.font = '12px monospace';
      uiCtx.fillText('🔍 Search...', 885, 33);

      // Left Navigation Rail (width 190px)
      uiCtx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      uiCtx.fillRect(0, 56, 190, 584);
      uiCtx.strokeStyle = 'rgba(0, 245, 255, 0.15)';
      uiCtx.beginPath();
      uiCtx.moveTo(190, 56);
      uiCtx.lineTo(190, 640);
      uiCtx.stroke();

      const navItems = [
        { label: '⬡ Dashboard', active: true },
        { label: '◈ Holograms', active: false },
        { label: '🔊 Audio Matrix', active: false },
        { label: '⚡ Neural Rig', active: false },
        { label: '📊 Telemetry', active: false },
        { label: '⚙ Settings', active: false },
      ];
      navItems.forEach((item, idx) => {
        const itemY = 82 + idx * 46;
        if (item.active) {
          uiCtx.fillStyle = 'rgba(0, 245, 255, 0.15)';
          uiCtx.strokeStyle = 'rgba(0, 245, 255, 0.5)';
          uiCtx.lineWidth = 1.5;
          uiCtx.beginPath();
          uiCtx.roundRect(14, itemY, 162, 36, 8);
          uiCtx.fill();
          uiCtx.stroke();
          uiCtx.fillStyle = '#00f5ff';
          uiCtx.font = 'bold 15px "Inter", sans-serif';
        } else {
          uiCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          uiCtx.font = '14px "Inter", sans-serif';
        }
        uiCtx.fillText(item.label, 28, itemY + 23);
      });

      // Main Content Area
      // Top Segmented Tab Controls
      const tabs = ['VIEWPORT', 'SHADERS', 'TELEMETRY', 'DIAGNOSTICS'];
      tabs.forEach((tab, idx) => {
        const tabX = 215 + idx * 140;
        const isSel = idx === 0;
        uiCtx.fillStyle = isSel ? 'rgba(123, 97, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        uiCtx.strokeStyle = isSel ? '#7b61ff' : 'rgba(255, 255, 255, 0.1)';
        uiCtx.beginPath();
        uiCtx.roundRect(tabX, 74, 125, 30, 6);
        uiCtx.fill();
        uiCtx.stroke();
        uiCtx.fillStyle = isSel ? '#c4b5fd' : 'rgba(255, 255, 255, 0.6)';
        uiCtx.font = 'bold 12px monospace';
        uiCtx.fillText(tab, tabX + 18, 94);
      });

      // KPI Cards
      const kpis = [
        { title: 'SPATIAL RESOLUTION', val: '8K DUAL-OLED (45 PPD)', col: '#00f5ff' },
        { title: 'TRACKING LATENCY', val: '0.6ms SUB-MM RIG', col: '#4ade80' },
        { title: 'NEURAL HAND FOVEATION', val: '24-PT SKELETON ACTIVE', col: '#a855f7' },
      ];
      kpis.forEach((kpi, idx) => {
        const cardX = 215 + idx * 265;
        uiCtx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        uiCtx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        uiCtx.lineWidth = 1;
        uiCtx.beginPath();
        uiCtx.roundRect(cardX, 118, 250, 78, 10);
        uiCtx.fill();
        uiCtx.stroke();

        uiCtx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        uiCtx.font = '11px monospace';
        uiCtx.fillText(kpi.title, cardX + 16, 140);

        uiCtx.fillStyle = kpi.col;
        uiCtx.font = 'bold 14px "Inter", sans-serif';
        uiCtx.fillText(kpi.val, cardX + 16, 170);
      });

      // Live Animated Equalizer / Audio Waveform Widget
      uiCtx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      uiCtx.strokeStyle = 'rgba(0, 245, 255, 0.2)';
      uiCtx.beginPath();
      uiCtx.roundRect(215, 212, 490, 216, 12);
      uiCtx.fill();
      uiCtx.stroke();

      uiCtx.fillStyle = '#00f5ff';
      uiCtx.font = 'bold 13px monospace';
      uiCtx.fillText('SPATIAL AUDIO FREQUENCY SPECTRUM (3D BINAURAL)', 235, 238);

      const numBars = 16;
      const barW = 20;
      const barGap = 9;
      for (let b = 0; b < numBars; b++) {
        const bx = 235 + b * (barW + barGap);
        const hNorm = 0.25 + Math.sin(time * 3.5 + b * 0.45) * 0.35 + Math.cos(time * 2.2 + b * 0.7) * 0.25;
        const barH = Math.max(12, Math.min(135, hNorm * 130));
        const by = 405 - barH;

        const barGrad = uiCtx.createLinearGradient(0, 405, 0, by);
        barGrad.addColorStop(0, '#00f5ff');
        barGrad.addColorStop(0.5, '#7b61ff');
        barGrad.addColorStop(1, '#ec4899');

        uiCtx.fillStyle = barGrad;
        uiCtx.beginPath();
        uiCtx.roundRect(bx, by, barW, barH, 4);
        uiCtx.fill();
      }

      // GPU Radial Gauge
      uiCtx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      uiCtx.strokeStyle = 'rgba(123, 97, 255, 0.2)';
      uiCtx.beginPath();
      uiCtx.roundRect(725, 212, 280, 216, 12);
      uiCtx.fill();
      uiCtx.stroke();

      uiCtx.fillStyle = '#c4b5fd';
      uiCtx.font = 'bold 13px monospace';
      uiCtx.fillText('GPU PIPELINE LOAD', 745, 238);

      const cx = 865;
      const cy = 328;
      const rGauge = 58;
      uiCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      uiCtx.lineWidth = 10;
      uiCtx.beginPath();
      uiCtx.arc(cx, cy, rGauge, 0, Math.PI * 2);
      uiCtx.stroke();

      const progress = 0.88 + Math.sin(time * 1.5) * 0.04;
      uiCtx.strokeStyle = '#00f5ff';
      uiCtx.lineWidth = 10;
      uiCtx.lineCap = 'round';
      uiCtx.beginPath();
      uiCtx.arc(cx, cy, rGauge, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      uiCtx.stroke();

      uiCtx.fillStyle = '#f8fafc';
      uiCtx.font = 'bold 24px monospace';
      uiCtx.textAlign = 'center';
      uiCtx.fillText(`${Math.round(progress * 100)}%`, cx, cy + 8);
      uiCtx.textAlign = 'left';

      // Interactive Controls Panel (Toggle, Slider, Action Button)
      uiCtx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      uiCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      uiCtx.beginPath();
      uiCtx.roundRect(215, 444, 790, 172, 12);
      uiCtx.fill();
      uiCtx.stroke();

      // Row 1: Toggle Switch
      uiCtx.fillStyle = '#f8fafc';
      uiCtx.font = '14px "Inter", sans-serif';
      uiCtx.fillText('Depth Layer Parallax:', 240, 482);

      uiCtx.fillStyle = '#10b981';
      uiCtx.beginPath();
      uiCtx.roundRect(415, 465, 52, 26, 13);
      uiCtx.fill();
      uiCtx.fillStyle = '#ffffff';
      uiCtx.beginPath();
      uiCtx.arc(453, 478, 10, 0, Math.PI * 2);
      uiCtx.fill();
      uiCtx.fillStyle = '#10b981';
      uiCtx.font = 'bold 12px monospace';
      uiCtx.fillText('ON (6-DoF)', 480, 482);

      // Row 2: Slider Bar
      uiCtx.fillStyle = '#f8fafc';
      uiCtx.font = '14px "Inter", sans-serif';
      uiCtx.fillText('Glass Frosted Blur (32px):', 240, 535);

      uiCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      uiCtx.beginPath();
      uiCtx.roundRect(435, 529, 220, 8, 4);
      uiCtx.fill();
      uiCtx.fillStyle = '#00f5ff';
      uiCtx.beginPath();
      uiCtx.roundRect(435, 529, 160, 8, 4);
      uiCtx.fill();
      uiCtx.fillStyle = '#ffffff';
      uiCtx.strokeStyle = '#00f5ff';
      uiCtx.lineWidth = 3;
      uiCtx.beginPath();
      uiCtx.arc(595, 533, 9, 0, Math.PI * 2);
      uiCtx.fill();
      uiCtx.stroke();

      // Deploy Action Button
      uiCtx.fillStyle = 'rgba(0, 245, 255, 0.2)';
      uiCtx.strokeStyle = '#00f5ff';
      uiCtx.lineWidth = 2;
      uiCtx.beginPath();
      uiCtx.roundRect(750, 486, 230, 48, 8);
      uiCtx.fill();
      uiCtx.stroke();

      uiCtx.fillStyle = '#00f5ff';
      uiCtx.font = 'bold 14px "Inter", sans-serif';
      uiCtx.fillText('+ DEPLOY SPATIAL ANCHOR', 768, 516);
    };

    drawSpatialUIDashboard(0);
    const uiTexture = new THREE.CanvasTexture(uiCanvas);

    // 2. Main Frosted Glass Panel with Canvas Texture
    const mainPanelGeo = new THREE.PlaneGeometry(3.6, 2.25);
    const mainPanelMat = new THREE.MeshBasicMaterial({
      map: uiTexture,
      transparent: true,
      opacity: 0.96,
      side: THREE.DoubleSide,
    });
    const mainPanel = new THREE.Mesh(mainPanelGeo, mainPanelMat);
    spatialUIGroup.add(mainPanel);

    // Glowing Neon Edge Frame around Main Panel
    const mainEdges = new THREE.EdgesGeometry(mainPanelGeo);
    const mainLine = new THREE.LineSegments(mainEdges, new THREE.LineBasicMaterial({ color: 0x00f5ff }));
    spatialUIGroup.add(mainLine);

    // 3. Floating Layered 3D Depth Elements in Front of Panel
    // Layer A: Floating 3D Media Control Pill at Z = +0.25
    const pillGeo = new THREE.CapsuleGeometry(0.14, 1.2, 8, 16);
    const pillMat = new THREE.MeshPhysicalMaterial({
      color: 0x060c1d,
      roughness: 0.1,
      metalness: 0.8,
      transmission: 0.75,
      transparent: true,
      opacity: 0.9,
      clearcoat: 1.0,
    });
    const playbackPill = new THREE.Mesh(pillGeo, pillMat);
    playbackPill.rotation.z = Math.PI / 2;
    playbackPill.position.set(0, -1.35, 0.25);
    spatialUIGroup.add(playbackPill);

    const pillRing = new THREE.LineSegments(
      new THREE.EdgesGeometry(pillGeo),
      new THREE.LineBasicMaterial({ color: 0x00ffff })
    );
    playbackPill.add(pillRing);

    // Mini 3D playback control dots
    [-0.35, 0, 0.35].forEach((px, i) => {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 12, 12),
        new THREE.MeshBasicMaterial({ color: i === 1 ? 0x00ffff : 0x7b61ff })
      );
      dot.position.set(px, 0, 0.12);
      playbackPill.add(dot);
    });

    // Layer B: Angled Secondary Glass Inspector Card on Right
    const sideCardGeo = new THREE.PlaneGeometry(1.4, 1.6);
    const sideCardMat = new THREE.MeshPhysicalMaterial({
      color: 0x060c1d,
      roughness: 0.1,
      metalness: 0.7,
      transmission: 0.75,
      transparent: true,
      opacity: 0.85,
      clearcoat: 1.0,
    });
    const sideCard = new THREE.Mesh(sideCardGeo, sideCardMat);
    sideCard.position.set(2.2, 0.15, 0.35);
    sideCard.rotation.y = -0.32;
    spatialUIGroup.add(sideCard);
    sideCard.add(new THREE.LineSegments(new THREE.EdgesGeometry(sideCardGeo), new THREE.LineBasicMaterial({ color: 0x7b61ff })));

    // Shader swatch spheres inside sideCard
    const swatchColors = [0x00f5ff, 0x7b61ff, 0xec4899, 0x10b981];
    swatchColors.forEach((col, idx) => {
      const swatch = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshStandardMaterial({ color: col, metalness: 0.8, roughness: 0.2 })
      );
      swatch.position.set(-0.35 + (idx % 2) * 0.7, 0.4 - Math.floor(idx / 2) * 0.7, 0.08);
      sideCard.add(swatch);
    });

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
    const timer = new THREE.Timer();

    const render = () => {
      timer.update();
      const elapsedTime = timer.getElapsed();

      // Animate Objects
      // Headset floating bobbing
      headsetGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.12;
      headsetGroup.rotation.y = THREE.MathUtils.lerp(headsetGroup.rotation.y, mouseX * 0.35, 0.05);
      headsetGroup.rotation.x = THREE.MathUtils.lerp(headsetGroup.rotation.x, -mouseY * 0.25, 0.05);

      // Controllers slight independent floating
      leftCtrl.position.y = -0.6 + Math.sin(elapsedTime * 1.8) * 0.08;
      rightCtrl.position.y = -0.6 + Math.cos(elapsedTime * 1.8) * 0.08;

      // Healthcare Heart authentic biphasic cardiac cycle (atrial systole -> ventricular systole & apical torsion)
      const heartBeatCycle = (elapsedTime * 1.2) % 1.0;
      let vScaleX = 1.0;
      let vScaleY = 1.0;
      let vScaleZ = 1.0;
      let aScale = 1.0;
      let torsion = 0.0;
      let aortaPulse = 1.0;

      if (heartBeatCycle < 0.12) {
        // Atrial Systole (P-wave): Atria contract to pump blood into ventricles
        const aPhase = Math.sin((heartBeatCycle / 0.12) * Math.PI);
        aScale = 1.0 - aPhase * 0.12;
        vScaleX = 1.0 + aPhase * 0.03;
        vScaleZ = 1.0 + aPhase * 0.03;
      } else if (heartBeatCycle >= 0.14 && heartBeatCycle < 0.38) {
        // Ventricular Systole (QRS-T complex): Powerful ventricular contraction with apical torsion
        const vPhase = Math.sin(((heartBeatCycle - 0.14) / 0.24) * Math.PI);
        vScaleX = 1.0 - vPhase * 0.14;
        vScaleZ = 1.0 - vPhase * 0.14;
        vScaleY = 1.0 - vPhase * 0.08;
        torsion = vPhase * 0.14; // Apical torsion along cardiac long-axis
        aortaPulse = 1.0 + vPhase * 0.08; // Systolic pulse wave expanding the aorta
      } else {
        // Diastole: Smooth elastic relaxation and passive filling
        const dPhase = Math.sin(((heartBeatCycle - 0.38) / 0.62) * Math.PI);
        vScaleX = 1.0 + dPhase * 0.02;
        vScaleY = 1.0 + dPhase * 0.01;
        vScaleZ = 1.0 + dPhase * 0.02;
      }

      const hData = heartAnatomyGroup.userData;
      if (hData?.ventriclesGroup) {
        hData.ventriclesGroup.scale.set(vScaleX, vScaleY, vScaleZ);
        hData.ventriclesGroup.rotation.y = torsion;
      }
      if (hData?.atriaGroup) {
        hData.atriaGroup.scale.set(aScale, aScale, aScale);
      }
      if (hData?.aortaMesh) {
        hData.aortaMesh.scale.set(aortaPulse, 1.0, aortaPulse);
      }
      if (hData?.pulmMesh) {
        hData.pulmMesh.scale.set(aortaPulse, 1.0, aortaPulse);
      }

      heartAnatomyGroup.rotation.y = Math.sin(elapsedTime * 0.4) * 0.2;
      ecgLine.rotation.y += 0.012;
      scanRing.position.y = Math.sin(elapsedTime * 1.8) * 1.1;
      medPoints.rotation.y += 0.006;

      // Turbine spinning blades
      bladesGroup.rotation.z -= 0.08;
      casingRing1.position.z = 1.2 + Math.sin(elapsedTime * 2.0) * 0.2;
      casingRing2.position.z = -1.2 - Math.sin(elapsedTime * 2.0) * 0.2;

      // Robotic Digital Twin synchronized articulation
      const armCycle = elapsedTime * 0.85;
      const baseAngle = Math.sin(armCycle) * 0.4;
      const shoulderAngle = Math.sin(armCycle * 1.1) * 0.25;
      const elbowAngle = -0.3 + Math.cos(armCycle * 1.1) * 0.35;
      const wristAngle = Math.sin(armCycle * 1.5) * 0.45;

      // Articulate Physical Arm
      physArm.turret.rotation.y = baseAngle;
      physArm.shoulder.rotation.z = shoulderAngle;
      physArm.elbow.rotation.z = elbowAngle;
      physArm.wrist.rotation.z = wristAngle;

      // Articulate Holographic Digital Twin in 100% synchronized mirror
      holoArm.turret.rotation.y = baseAngle;
      holoArm.shoulder.rotation.z = shoulderAngle;
      holoArm.elbow.rotation.z = elbowAngle;
      holoArm.wrist.rotation.z = wristAngle;

      // Animate flowing data packets along telemetry bridge
      dataPackets.forEach((pkt) => {
        const offset = ((elapsedTime * pkt.speed + pkt.offset) % 5.0) - 2.5;
        pkt.mesh.position.x = offset;
      });
      twinLabel.lookAt(camera.position);

      // LiDAR scanner sweeping across terrain
      lidarBar.position.z = Math.sin(elapsedTime * 1.8) * 3.8;

      // Spatial UI Windows subtle floating & live UI canvas animation
      spatialUIGroup.rotation.y = Math.sin(elapsedTime * 0.5) * 0.04;
      sideCard.rotation.x = Math.sin(elapsedTime * 0.8) * 0.04;
      playbackPill.position.y = -1.35 + Math.sin(elapsedTime * 1.4) * 0.04;

      drawSpatialUIDashboard(elapsedTime);
      uiTexture.needsUpdate = true;

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
      timer.dispose();
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
                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 8px 0' }}>
                  {SPECIMENS_INFO[activeModel].desc}
                </p>

                {/* Spatial UI Elements inside UI Panel */}
                {activeModel === 'spatialui' && (
                  <div
                    style={{
                      borderTop: '1px solid rgba(0, 245, 255, 0.25)',
                      paddingTop: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      <span>VISION_OS WORKSPACE CONTROLS</span>
                      <span style={{ color: '#4ade80' }}>● 60 FPS • 120Hz</span>
                    </div>

                    {/* Equalizer Waveform Bars Micro-widget */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '22px', background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: '4px' }}>
                      {[18, 12, 22, 14, 20, 8, 16, 22, 10, 19, 15, 21].map((h, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: `${h}px`,
                            background: i % 2 === 0 ? 'var(--accent-cyan)' : 'var(--accent-violet)',
                            borderRadius: '1px',
                          }}
                        />
                      ))}
                    </div>

                    {/* Quick Toggle Controls */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                        Audio Matrix: ON
                      </span>
                      <span className="badge badge-violet" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                        Frosted Glass: 32px
                      </span>
                      <span className="badge badge-green" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                        Hand Rig: 24-pt
                      </span>
                    </div>
                  </div>
                )}

                {/* Healthcare Core Metrics inside UI Panel */}
                {activeModel === 'healthcare' && (
                  <div
                    style={{
                      borderTop: '1px solid rgba(225, 29, 72, 0.3)',
                      paddingTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <span style={{ color: '#f43f5e', fontWeight: 700 }}>● PULSE: 72 BPM</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>ECG: NORMAL SINUS</span>
                    <span style={{ color: '#4ade80' }}>120/80 mmHg</span>
                  </div>
                )}

                {/* Digital Twin Sync Metrics inside UI Panel */}
                {activeModel === 'digitaltwin' && (
                  <div
                    style={{
                      borderTop: '1px solid rgba(0, 245, 255, 0.25)',
                      paddingTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <span style={{ color: '#f59e0b' }}>[PHYSICAL]</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>&lt;== 0.4ms SYNC ==&gt;</span>
                    <span style={{ color: '#00f5ff' }}>[HOLO TWIN]</span>
                  </div>
                )}
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
