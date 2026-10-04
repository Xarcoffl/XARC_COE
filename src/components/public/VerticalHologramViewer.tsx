'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, RotateCw } from 'lucide-react';

interface VerticalHologramViewerProps {
  verticalNumber: string; // "01", "02", "03", "04", "05"
  title: string;
}

export default function VerticalHologramViewer({ verticalNumber, title }: VerticalHologramViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile || !mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth || 400;
    let height = container.clientHeight || 260;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // 2. Lighting - Brightened for crisp visibility in both light and dark themes
    const ambient = new THREE.AmbientLight(0xffffff, 2.8);
    scene.add(ambient);

    const cyanLight = new THREE.PointLight(0x00ffff, 4.5, 30);
    cyanLight.position.set(4, 4, 6);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0x7b61ff, 4.0, 30);
    violetLight.position.set(-4, -3, 5);
    scene.add(violetLight);

    // 3. Model Creation based on verticalNumber
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const num = verticalNumber.trim();
    let animUpdate: ((elapsed: number) => void) | null = null;

    if (num === '01') {
      // 01: Long-Term Certification Courses
      // Academic Mortarboard Graduation Cap with tassel, Parchment Diploma with gold ribbon seal, and rotating accreditation orbit rings
      const certGroup = new THREE.Group();

      const capMat = new THREE.MeshStandardMaterial({
        color: 0x1e1b4b, // Deep academic navy
        roughness: 0.35,
        metalness: 0.25,
      });

      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.2,
        emissive: 0xd97706,
        emissiveIntensity: 0.3,
      });

      // Diamond Top Board
      const boardGeo = new THREE.BoxGeometry(2.3, 0.08, 2.3);
      const board = new THREE.Mesh(boardGeo, capMat);
      board.rotation.y = Math.PI / 4;
      board.position.y = 0.52;
      certGroup.add(board);

      // Skull cap underneath
      const skullGeo = new THREE.CylinderGeometry(0.72, 0.9, 0.55, 24);
      const skull = new THREE.Mesh(skullGeo, capMat);
      skull.position.y = 0.25;
      certGroup.add(skull);

      // Center gold button
      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), goldMat);
      btn.position.y = 0.58;
      certGroup.add(btn);

      // Tassel cord hanging to side
      const tasselCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.58, 0),
        new THREE.Vector3(0.85, 0.54, 0.85),
        new THREE.Vector3(1.15, 0.25, 1.15),
        new THREE.Vector3(1.18, -0.15, 1.18),
      ]);
      const tasselCord = new THREE.Mesh(new THREE.TubeGeometry(tasselCurve, 16, 0.025, 8, false), goldMat);
      certGroup.add(tasselCord);

      const tasselEnd = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 12), goldMat);
      tasselEnd.position.set(1.18, -0.3, 1.18);
      tasselEnd.rotation.x = Math.PI;
      certGroup.add(tasselEnd);

      // Diploma scroll underneath
      const scrollGroup = new THREE.Group();
      scrollGroup.position.set(0, -0.7, 0);
      scrollGroup.rotation.z = 0.22;
      scrollGroup.rotation.y = -0.3;

      const parchmentMat = new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        roughness: 0.4,
        metalness: 0.1,
      });
      const scrollRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 2.1, 24), parchmentMat);
      scrollRoll.rotation.x = Math.PI / 2;
      scrollGroup.add(scrollRoll);

      // Gold tie ribbon
      const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.35, 24), goldMat);
      ribbon.rotation.x = Math.PI / 2;
      scrollGroup.add(ribbon);

      // Ribbon tails
      const tail1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.5), goldMat);
      tail1.position.set(0.12, -0.28, 0.18);
      tail1.rotation.y = 0.4;
      scrollGroup.add(tail1);

      certGroup.add(scrollGroup);

      // Dual Accreditation Orbit Rings
      const orbit1 = new THREE.Mesh(
        new THREE.TorusGeometry(2.1, 0.025, 16, 64),
        new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.85 })
      );
      orbit1.rotation.x = Math.PI / 3;
      certGroup.add(orbit1);

      const orbit2 = new THREE.Mesh(
        new THREE.TorusGeometry(2.35, 0.02, 16, 64),
        new THREE.MeshBasicMaterial({ color: 0x7b61ff, transparent: true, opacity: 0.65 })
      );
      orbit2.rotation.y = Math.PI / 4;
      orbit2.rotation.x = -Math.PI / 6;
      certGroup.add(orbit2);

      // Floating Stars (Credential Excellence)
      const stars: THREE.Mesh[] = [];
      for (let s = 0; s < 4; s++) {
        const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), goldMat);
        certGroup.add(star);
        stars.push(star);
      }

      modelGroup.add(certGroup);

      animUpdate = (elapsed) => {
        orbit1.rotation.z += 0.01;
        orbit2.rotation.z -= 0.012;
        stars.forEach((star, idx) => {
          const angle = elapsed * 0.8 + (idx / 4) * Math.PI * 2;
          star.position.set(Math.cos(angle) * 1.85, Math.sin(angle * 2) * 0.25 + 0.1, Math.sin(angle) * 1.85);
          star.rotation.y += 0.03;
        });
      };
    } else if (num === '02') {
      // 02: Internships with Industry Support
      // Dual Interlocking Industrial Gears, Articulated Robotic Assembly Gripper, Enterprise Server Chassis
      const indGroup = new THREE.Group();

      const steelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
      const cyanMetalMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.85, roughness: 0.25 });
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.3 });

      const createGear = (radius: number, teethCount: number, depth: number, material: THREE.Material) => {
        const gear = new THREE.Group();
        const core = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, 24), material);
        core.rotation.x = Math.PI / 2;
        gear.add(core);

        const centerRing = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.65, 0.04, 16, 32), brassMat);
        gear.add(centerRing);

        for (let t = 0; t < teethCount; t++) {
          const angle = (t / teethCount) * Math.PI * 2;
          const tooth = new THREE.Mesh(new THREE.BoxGeometry(depth * 0.9, radius * 0.28, depth), material);
          tooth.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
          tooth.rotation.z = angle;
          gear.add(tooth);
        }
        return gear;
      };

      // Primary Gear
      const gear1 = createGear(1.1, 14, 0.22, cyanMetalMat);
      gear1.position.set(-0.7, -0.3, 0);
      indGroup.add(gear1);

      // Driven Gear
      const gear2 = createGear(0.75, 10, 0.22, steelMat);
      gear2.position.set(0.9, 0.45, 0);
      gear2.rotation.z = Math.PI / 10;
      indGroup.add(gear2);

      // Articulated Robotic Arm / Clamp hovering from top
      const armBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.25, 16), steelMat);
      armBase.position.set(0, 1.4, -0.4);
      indGroup.add(armBase);

      const armSegment1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.9, 0.18), steelMat);
      armSegment1.position.set(-0.2, 0.95, -0.2);
      armSegment1.rotation.z = 0.4;
      indGroup.add(armSegment1);

      const armSegment2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.8, 0.14), cyanMetalMat);
      armSegment2.position.set(-0.1, 0.35, 0.1);
      armSegment2.rotation.z = -0.35;
      indGroup.add(armSegment2);

      // Robotic Gripper Claws holding industrial workpiece
      const clawLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.1), brassMat);
      clawLeft.position.set(-0.25, -0.15, 0.15);
      clawLeft.rotation.z = 0.25;
      indGroup.add(clawLeft);

      const clawRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.1), brassMat);
      clawRight.position.set(0.05, -0.15, 0.15);
      clawRight.rotation.z = -0.25;
      indGroup.add(clawRight);

      // Workpiece / Enterprise Neural Chip
      const chip = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.35, 0.08),
        new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x059669,
          emissiveIntensity: 0.5,
          metalness: 0.8,
        })
      );
      chip.position.set(-0.1, -0.25, 0.15);
      indGroup.add(chip);

      // Enterprise Server Blade Chassis on background right
      const rackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
      const rack = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.8, 0.6), rackMat);
      rack.position.set(1.5, -0.2, -0.6);
      indGroup.add(rack);

      for (let r = 0; r < 5; r++) {
        const slot = new THREE.Mesh(
          new THREE.BoxGeometry(0.62, 0.12, 0.05),
          new THREE.MeshBasicMaterial({ color: r % 2 === 0 ? 0x00ffff : 0x10b981 })
        );
        slot.position.set(1.5, -0.8 + r * 0.32, -0.28);
        indGroup.add(slot);
      }

      modelGroup.add(indGroup);

      animUpdate = () => {
        gear1.rotation.z += 0.018;
        gear2.rotation.z -= 0.025;
      };
    } else if (num === '03') {
      // 03: Self-Learning Courses
      // Dual Ultrawide Developer Workstation, Live Code Terminal Planes, and Tiered Milestone Course Cubes
      const learnGroup = new THREE.Group();

      const deskMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
      const screenGlass = new THREE.MeshPhysicalMaterial({
        color: 0x070d1e,
        roughness: 0.1,
        metalness: 0.6,
        transmission: 0.3,
        transparent: true,
        opacity: 0.95,
      });

      // Monitor Stand Base
      const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.08, 24), deskMat);
      standBase.position.set(0, -1.0, 0);
      learnGroup.add(standBase);

      const standPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 16), deskMat);
      standPole.position.set(0, -0.4, -0.2);
      learnGroup.add(standPole);

      // Monitor 1 (Main Left - Coding IDE)
      const m1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.08), deskMat);
      m1.position.set(-0.75, 0.2, 0.1);
      m1.rotation.y = 0.22;
      learnGroup.add(m1);

      const screen1 = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.9), screenGlass);
      screen1.position.set(-0.75, 0.2, 0.15);
      screen1.rotation.y = 0.22;
      learnGroup.add(screen1);

      // Code lines simulated with thin glowing strips
      for (let c = 0; c < 6; c++) {
        const codeLine = new THREE.Mesh(
          new THREE.PlaneGeometry(0.7 + (c % 3) * 0.25, 0.04),
          new THREE.MeshBasicMaterial({ color: c % 2 === 0 ? 0x00ffff : 0x818cf8 })
        );
        codeLine.position.set(-0.85, 0.45 - c * 0.11, 0.16);
        codeLine.rotation.y = 0.22;
        learnGroup.add(codeLine);
      }

      // Monitor 2 (Secondary Right - Spatial 3D Preview)
      const m2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.08), deskMat);
      m2.position.set(0.75, 0.2, 0.1);
      m2.rotation.y = -0.28;
      learnGroup.add(m2);

      const screen2 = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.9), screenGlass);
      screen2.position.set(0.75, 0.2, 0.15);
      screen2.rotation.y = -0.28;
      learnGroup.add(screen2);

      // 3D Viewport preview on screen 2
      const wireNode = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.32, 1),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true })
      );
      wireNode.position.set(0.75, 0.2, 0.25);
      wireNode.rotation.y = -0.28;
      learnGroup.add(wireNode);

      // Tiered Modular Learning Cubes (Beginner, Intermediate, Advanced)
      const tiers = [
        { name: 'Beginner', color: 0x10b981, y: -0.5, z: 0.7, x: -0.8 },
        { name: 'Intermediate', color: 0x00ffff, y: -0.4, z: 0.8, x: 0 },
        { name: 'Advanced', color: 0x8b5cf6, y: -0.3, z: 0.7, x: 0.8 },
      ];

      tiers.forEach((t) => {
        const tCube = new THREE.Mesh(
          new THREE.BoxGeometry(0.42, 0.42, 0.42),
          new THREE.MeshStandardMaterial({
            color: t.color,
            emissive: t.color,
            emissiveIntensity: 0.4,
            metalness: 0.7,
            roughness: 0.2,
          })
        );
        tCube.position.set(t.x, t.y, t.z);
        learnGroup.add(tCube);

        const tRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.32, 0.015, 12, 24),
          new THREE.MeshBasicMaterial({ color: t.color })
        );
        tRing.rotation.x = Math.PI / 2;
        tRing.position.set(t.x, t.y, t.z);
        learnGroup.add(tRing);
      });

      // Connecting Knowledge Data Bus Line between tiers
      const busLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.8, -0.5, 0.7),
        new THREE.Vector3(0, -0.4, 0.8),
        new THREE.Vector3(0.8, -0.3, 0.7),
      ]);
      const busLine = new THREE.Line(busLineGeo, new THREE.LineBasicMaterial({ color: 0x00ffff }));
      learnGroup.add(busLine);

      modelGroup.add(learnGroup);

      animUpdate = () => {
        wireNode.rotation.y += 0.025;
        wireNode.rotation.x += 0.015;
      };
    } else if (num === '04') {
      // 04: Skill Development Activities
      // High-Energy Hackathon Lightning Spark Core, Rapid Prototyping PCB Circuit Workbench, Championship Trophy
      const skillGroup = new THREE.Group();

      const boltShape = new THREE.Shape();
      boltShape.moveTo(0, 1.4);
      boltShape.lineTo(-0.45, 0.2);
      boltShape.lineTo(-0.05, 0.2);
      boltShape.lineTo(-0.55, -1.2);
      boltShape.lineTo(0.45, -0.05);
      boltShape.lineTo(0.05, -0.05);
      boltShape.lineTo(0.55, 1.4);
      boltShape.closePath();

      const extrudeSettings = { depth: 0.18, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
      const boltGeo = new THREE.ExtrudeGeometry(boltShape, extrudeSettings);
      boltGeo.center();

      const boltMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.85,
        metalness: 0.85,
        roughness: 0.15,
      });
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      skillGroup.add(bolt);

      // Prototyping Workbench PCB Base with Microcontroller
      const pcbMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, metalness: 0.6, roughness: 0.3 });
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 1.6), pcbMat);
      pcb.position.set(0, -1.0, 0);
      skillGroup.add(pcb);

      const mcu = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.14, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 })
      );
      mcu.position.set(-0.7, -0.9, 0.2);
      skillGroup.add(mcu);

      const pinMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 });
      for (let p = 0; p < 6; p++) {
        const pin1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.12), pinMat);
        pin1.position.set(-0.95 + p * 0.1, -0.92, -0.22);
        skillGroup.add(pin1);
        const pin2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.12), pinMat);
        pin2.position.set(-0.95 + p * 0.1, -0.92, 0.62);
        skillGroup.add(pin2);
      }

      // Competition Trophy Cup on the side
      const tropBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 0.2, 16), pinMat);
      tropBase.position.set(0.85, -0.88, 0.2);
      skillGroup.add(tropBase);

      const tropStem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.45, 12), pinMat);
      tropStem.position.set(0.85, -0.6, 0.2);
      skillGroup.add(tropStem);

      const tropCup = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.1, 0.45, 16), pinMat);
      tropCup.position.set(0.85, -0.2, 0.2);
      skillGroup.add(tropCup);

      // Orbiting Victory Rings
      const spinRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.025, 16, 48), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
      spinRing1.rotation.x = Math.PI / 4;
      skillGroup.add(spinRing1);

      const spinRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.02, 16, 48), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      spinRing2.rotation.y = Math.PI / 3;
      skillGroup.add(spinRing2);

      modelGroup.add(skillGroup);

      animUpdate = (elapsed) => {
        spinRing1.rotation.z += 0.02;
        spinRing2.rotation.z -= 0.025;
        const p = 1.0 + Math.sin(elapsed * 5.0) * 0.05;
        bolt.scale.set(p, p, p);
      };
    } else {
      // 05: Product Development
      // Next-Gen Spatial XR Headset (Curved OLED Visor, Corner Optical Sensors, Halo Strap) + Dual 6-DOF Controllers + Floating 3D CAD Hologram
      const prodGroup = new THREE.Group();

      const chassisMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.25,
        metalness: 0.85,
      });

      const visorGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0x0284c7,
        roughness: 0.05,
        metalness: 0.95,
        transmission: 0.6,
        transparent: true,
        opacity: 0.9,
        clearcoat: 1.0,
      });

      // Headset Main Enclosure
      const headsetBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.0, 1.1), chassisMat);
      headsetBody.position.set(0, 0.1, 0);
      prodGroup.add(headsetBody);

      // Front Curved OLED Visor
      const visor = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.02, 0.95, 32, 1, false, -Math.PI / 3, (2 * Math.PI) / 3), visorGlassMat);
      visor.rotation.x = Math.PI / 2;
      visor.position.set(0, 0.1, 0.05);
      prodGroup.add(visor);

      // Optical Tracking Sensors (4 Corners)
      const sensorMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.6 });
      const sensorPositions = [
        [-0.85, 0.45, 0.56],
        [0.85, 0.45, 0.56],
        [-0.85, -0.25, 0.56],
        [0.85, -0.25, 0.56],
      ];
      sensorPositions.forEach((pos) => {
        const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), sensorMat);
        sensor.position.set(pos[0], pos[1], pos[2]);
        prodGroup.add(sensor);
      });

      // Halo Comfort Strap & Battery Pod
      const haloStrap = new THREE.Mesh(
        new THREE.TorusGeometry(1.25, 0.09, 16, 48, Math.PI * 1.2),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.5 })
      );
      haloStrap.rotation.x = Math.PI / 2;
      haloStrap.rotation.z = -Math.PI * 0.1;
      haloStrap.position.set(0, 0.1, -0.5);
      prodGroup.add(haloStrap);

      const batteryCounterweight = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.35), chassisMat);
      batteryCounterweight.position.set(0, 0.1, -1.6);
      prodGroup.add(batteryCounterweight);

      // Dual 6-DOF Ergonomic Motion Controllers
      const createController = (x: number) => {
        const cGroup = new THREE.Group();
        cGroup.position.set(x, -0.75, 0.4);

        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.7, 16), chassisMat);
        handle.rotation.x = 0.25;
        cGroup.add(handle);

        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.28, 0.03, 12, 32),
          new THREE.MeshStandardMaterial({ color: 0x00ffff, metalness: 0.8 })
        );
        ring.position.set(0, 0.32, 0.1);
        ring.rotation.x = 0.4;
        cGroup.add(ring);

        const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.1), sensorMat);
        trigger.position.set(0, 0.12, -0.12);
        cGroup.add(trigger);

        return cGroup;
      };

      const leftCtrl = createController(-1.3);
      leftCtrl.rotation.z = 0.2;
      prodGroup.add(leftCtrl);

      const rightCtrl = createController(1.3);
      rightCtrl.rotation.z = -0.2;
      prodGroup.add(rightCtrl);

      // Projected 3D Product CAD Wireframe hovering above
      const cadMesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.55, 1),
        new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.85 })
      );
      cadMesh.position.set(0, 1.25, 0.3);
      prodGroup.add(cadMesh);

      // CAD Projection Cone Beam
      const beamGeo = new THREE.ConeGeometry(0.7, 1.1, 16, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(0, 0.75, 0.2);
      beam.rotation.x = Math.PI;
      prodGroup.add(beam);

      modelGroup.add(prodGroup);

      animUpdate = () => {
        cadMesh.rotation.y += 0.025;
        cadMesh.rotation.x += 0.015;
      };
    }

    // 4. Interactive Drag Rotation
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
      modelGroup.rotation.y += deltaX * 0.012;
      modelGroup.rotation.x += deltaY * 0.012;
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
      modelGroup.rotation.y += deltaX * 0.012;
      modelGroup.rotation.x += deltaY * 0.012;
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
      width = mountRef.current.clientWidth || 400;
      height = mountRef.current.clientHeight || 260;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // 5. Animation Loop
    let animId: number;
    const timer = new THREE.Timer();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      timer.update();
      const elapsed = timer.getElapsed();

      // Continuous gentle auto-spin when not dragging
      if (!isDragging) {
        modelGroup.rotation.y += 0.008;
      }

      if (animUpdate) {
        animUpdate(elapsed);
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
      timer.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [verticalNumber]);

  if (isMobile) {
    return (
      <div
        style={{
          width: '100%',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '8px',
        }}
      >
        <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
          SPECIMEN_{verticalNumber} // SCHEMATIC
        </span>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {title}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Spatial hardware pod blueprint & interactive curriculum
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        height: '260px',
        position: 'relative',
        borderRadius: 'var(--radius-md)',
        background: 'radial-gradient(circle at center, rgba(0, 255, 255, 0.08) 0%, var(--surface-card) 100%)',
        border: '1px solid rgba(0, 255, 255, 0.25)',
        overflow: 'hidden',
        cursor: 'grab',
        marginBottom: '24px',
      }}
    >
      {/* 3D Canvas Mount */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Telemetry Header */}
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
            SPECIMEN_{verticalNumber} // 3D_INTERACTIVE
          </span>
        </div>
        <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
          DRAG TO ORBIT
        </span>
      </div>

      {/* Bottom Telemetry Bar */}
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
        <span>STATUS: LIVE_HOLOGRAPHIC_SIMULATION</span>
        <span style={{ color: 'var(--accent-cyan)' }}>60 FPS // GPU ACCELERATED</span>
      </div>
    </div>
  );
}
