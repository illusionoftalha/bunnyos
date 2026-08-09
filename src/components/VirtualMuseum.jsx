import React, { useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, useTexture, Text, Image, Sparkles, Environment } from '@react-three/drei';
import * as THREE from 'three';
import './VirtualMuseum.css';

const images = [
  { url: '/bhondu_and_bhondu_maharani.jpg', title: 'Bhondu and Bhondu Maharani' },
  { url: '/girly_poppies.jpg', title: 'Girly Poppies' },
  { url: '/the_bhondu_group.jpg', title: 'The Bhondu Group' },
  { url: '/the_og_group.jpg', title: 'The OG Group' },
  { url: '/three_intellectuals.jpg', title: 'Three Intellectuals' },
  { url: '/us.jpg', title: 'Us' }
];

const Player = () => {
  const { camera } = useThree();
  const [movement, setMovement] = useState({ forward: false, backward: false, left: false, right: false });
  const speed = 5.0;

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': setMovement(m => ({ ...m, forward: true })); break;
        case 'KeyS': case 'ArrowDown': setMovement(m => ({ ...m, backward: true })); break;
        case 'KeyA': case 'ArrowLeft': setMovement(m => ({ ...m, left: true })); break;
        case 'KeyD': case 'ArrowRight': setMovement(m => ({ ...m, right: true })); break;
        default: break;
      }
    };
    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': setMovement(m => ({ ...m, forward: false })); break;
        case 'KeyS': case 'ArrowDown': setMovement(m => ({ ...m, backward: false })); break;
        case 'KeyA': case 'ArrowLeft': setMovement(m => ({ ...m, left: false })); break;
        case 'KeyD': case 'ArrowRight': setMovement(m => ({ ...m, right: false })); break;
        default: break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();

    // Get current camera direction
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    // Calculate right vector
    const right = new THREE.Vector3();
    right.crossVectors(camera.up, direction).normalize();

    if (movement.forward) velocity.add(direction);
    if (movement.backward) velocity.sub(direction);
    if (movement.right) velocity.sub(right); // Inverted because cross product direction
    if (movement.left) velocity.add(right);

    velocity.normalize().multiplyScalar(speed * delta);
    camera.position.add(velocity);

    // Bounds check to keep within room
    if (camera.position.x > 9.5) camera.position.x = 9.5;
    if (camera.position.x < -9.5) camera.position.x = -9.5;
    if (camera.position.z > 9.5) camera.position.z = 9.5;
    if (camera.position.z < -9.5) camera.position.z = -9.5;

    // Centerpiece collision
    const distFromCenter = Math.hypot(camera.position.x, camera.position.z);
    if (distFromCenter < 1.2) {
      const angle = Math.atan2(camera.position.z, camera.position.x);
      camera.position.x = Math.cos(angle) * 1.2;
      camera.position.z = Math.sin(angle) * 1.2;
    }

    // Gramophone collision
    const distFromGram = Math.hypot(camera.position.x - 8, camera.position.z - 8);
    if (distFromGram < 1.2) {
      const angle = Math.atan2(camera.position.z - 8, camera.position.x - 8);
      camera.position.x = 8 + Math.cos(angle) * 1.2;
      camera.position.z = 8 + Math.sin(angle) * 1.2;
    }

    // AABB collision helper
    const checkAABB = (minX, maxX, minZ, maxZ) => {
      if (camera.position.x > minX && camera.position.x < maxX && camera.position.z > minZ && camera.position.z < maxZ) {
        const dLeft = Math.abs(camera.position.x - minX);
        const dRight = Math.abs(camera.position.x - maxX);
        const dTop = Math.abs(camera.position.z - minZ);
        const dBottom = Math.abs(camera.position.z - maxZ);
        const minD = Math.min(dLeft, dRight, dTop, dBottom);
        if (minD === dLeft) camera.position.x = minX;
        else if (minD === dRight) camera.position.x = maxX;
        else if (minD === dTop) camera.position.z = minZ;
        else if (minD === dBottom) camera.position.z = maxZ;
      }
    };

    // Benches collision
    checkAABB(-4.5, -3.5, -1.5, 1.5); // left bench
    checkAABB(3.5, 4.5, -1.5, 1.5);   // right bench
    checkAABB(-1.5, 1.5, 3.5, 4.5);   // back bench

    camera.position.y = 1.6; // Keep at eye level
  });

  return null;
};

const ExhibitFrame = ({ url, title, position, rotation }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* The elegant white glossy frame */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[3.4, 3.4, 0.1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.3} />
      </mesh>
      {/* The picture itself using drei's Image component to maintain aspect ratio (object-fit: cover equivalent) */}
      <Image url={url} position={[0, 0, 0.01]} scale={[3, 3]} toneMapped={false} />

      {/* Freestanding Title Plaque (Sign Board) */}
      {title && (
        <group position={[0, -2, 1.0]}>
          {/* Pedestal Pole */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.8]} />
            <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Base of Pedestal */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 0.04]} />
            <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Angled Plaque Board */}
          <group position={[0, 0.8, 0]} rotation={[-Math.PI / 6, 0, 0]}>
            {/* Plaque Background */}
            <mesh>
              <boxGeometry args={[1.5, 0.5, 0.05]} />
              <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
            </mesh>
            {/* Golden Frame around Plaque */}
            <mesh position={[0, 0, -0.01]}>
              <boxGeometry args={[1.55, 0.55, 0.05]} />
              <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* The Text */}
            <Text
              position={[0, 0, 0.026]}
              fontSize={0.12}
              color="#111111"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.3}
              textAlign="center"
              fontWeight="bold"
            >
              {title}
            </Text>
          </group>
        </group>
      )}
      {/* Soft spotlight for the picture */}
      <pointLight position={[0, 0, 3]} intensity={3} distance={6} color="#ffe4e1" />
    </group>
  );
};

const VelvetRope = ({ start, end }) => {
  const curve = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.y -= 0.3; // sag
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [start, end]);

  return (
    <mesh>
      <tubeGeometry args={[curve, 20, 0.03, 8, false]} />
      <meshStandardMaterial color="#ff1493" roughness={0.8} />
    </mesh>
  );
};

const ExhibitBarrier = ({ position, rotation }) => {
  const start = useMemo(() => new THREE.Vector3(-1.6, 0.6, 1.5), []);
  const end = useMemo(() => new THREE.Vector3(1.6, 0.6, 1.5), []);

  return (
    <group position={position} rotation={rotation}>
      {/* Left Pole */}
      <mesh position={[-1.6, 0.3, 1.5]}>
        <cylinderGeometry args={[0.04, 0.06, 0.6]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-1.6, 0.02, 1.5]}>
        <cylinderGeometry args={[0.15, 0.15, 0.04]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-1.6, 0.6, 1.5]}>
        <sphereGeometry args={[0.06]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Right Pole */}
      <mesh position={[1.6, 0.3, 1.5]}>
        <cylinderGeometry args={[0.04, 0.06, 0.6]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[1.6, 0.02, 1.5]}>
        <cylinderGeometry args={[0.15, 0.15, 0.04]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[1.6, 0.6, 1.5]}>
        <sphereGeometry args={[0.06]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>

      <VelvetRope start={start} end={end} />
    </group>
  );
};

const Fanoos = () => {
  return (
    <group position={[0, 6, 0]}>
      {/* Chain */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 2]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Lantern scaled up */}
      <group scale={2.5} position={[0, -0.2, 0]}>
        {/* Lantern Cap */}
        <mesh position={[0, 0.4, 0]}>
          <coneGeometry args={[0.4, 0.5, 6]} />
          <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Lantern Glass Body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.2, 0.6, 6]} />
          <meshPhysicalMaterial color="#ffb6c1" transmission={0.9} opacity={1} transparent roughness={0.1} />
        </mesh>
        {/* Lantern Base */}
        <mesh position={[0, -0.4, 0]}>
          <coneGeometry args={[0.2, 0.3, 6]} rotation={[Math.PI, 0, 0]} />
          <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* The Light inside */}
        <pointLight intensity={10} distance={20} color="#ffb6c1" />
      </group>
    </group>
  );
};

const CornerLamp = ({ position }) => {
  const [isOn, setIsOn] = useState(true);

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.2, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 2.1, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 4, 8]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Interactive Switch (Ring around pole) */}
      <mesh
        position={[0, 2.2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          setIsOn(!isOn);
        }}
      >
        <cylinderGeometry args={[0.06, 0.06, 0.2, 16]} />
        <meshStandardMaterial color={isOn ? "#ffb6c1" : "#555"} metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Lampshade */}
      <mesh position={[0, 4.3, 0]}>
        <cylinderGeometry args={[0.3, 0.6, 0.8, 16, 1, true]} />
        <meshStandardMaterial color={isOn ? "#fff0f5" : "#444"} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Light Source */}
      {isOn && <pointLight position={[0, 4.1, 0]} intensity={5} distance={15} color="#ffeaeb" />}
    </group>
  );
};

const FancyDoor = ({ position, rotation, onExit }) => {
  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        if (onExit) onExit();
      }}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      {/* Outer Golden Arch Frame */}
      <mesh position={[0, 4.5, 0]}>
        <torusGeometry args={[2.1, 0.15, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Outer Golden Side Frames */}
      <mesh position={[-2.1, 2.25, 0]}>
        <boxGeometry args={[0.3, 4.5, 0.3]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[2.1, 2.25, 0]}>
        <boxGeometry args={[0.3, 4.5, 0.3]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* The Double Doors (Pink) */}
      <mesh position={[-1.05, 2.25, 0.05]}>
        <boxGeometry args={[2.1, 4.5, 0.15]} />
        <meshStandardMaterial color="#ffb6c1" roughness={0.5} />
      </mesh>
      <mesh position={[1.05, 2.25, 0.05]}>
        <boxGeometry args={[2.1, 4.5, 0.15]} />
        <meshStandardMaterial color="#ffb6c1" roughness={0.5} />
      </mesh>

      {/* Arched Door Top (filling the arch gap) */}
      <mesh position={[0, 4.5, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.1, 2.1, 0.15, 32, 1, false, Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#ffb6c1" roughness={0.5} />
      </mesh>

      {/* Golden Details / Crossbars */}
      <mesh position={[-1.05, 3, 0.13]}>
        <boxGeometry args={[1.5, 0.1, 0.05]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[1.05, 3, 0.13]}>
        <boxGeometry args={[1.5, 0.1, 0.05]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-1.05, 1.5, 0.13]}>
        <boxGeometry args={[1.5, 0.1, 0.05]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[1.05, 1.5, 0.13]}>
        <boxGeometry args={[1.5, 0.1, 0.05]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Grand Handles */}
      <mesh position={[-0.2, 2.25, 0.18]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.2, 2.25, 0.18]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* King Crown on Top of Arch */}
      <group position={[0, 6.8, 0]}>
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[0.4, 0.8, 4]} />
          <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[-0.5, -0.2, 0]} rotation={[0, 0, 0.4]}>
          <coneGeometry args={[0.3, 0.6, 4]} />
          <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0.5, -0.2, 0]} rotation={[0, 0, -0.4]}>
          <coneGeometry args={[0.3, 0.6, 4]} />
          <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

const Gramophone = ({ position, rotation, scale = 1 }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const { camera } = useThree();

  const audio = React.useMemo(() => {
    // URL encode the space in the filename
    const a = new Audio('/barse%20naina.mp3');
    a.loop = true;
    a.volume = 0;
    return a;
  }, []);

  const recordRef = React.useRef();
  const armGroupRef = React.useRef();
  const crankRef = React.useRef();
  const gramophonePos = React.useMemo(() => new THREE.Vector3(...(position || [0, 0, 0])), [position]);

  React.useEffect(() => {
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

  useFrame((state, delta) => {
    if (isPlaying) {
      if (recordRef.current) recordRef.current.rotation.y -= delta * 2;
      if (crankRef.current) crankRef.current.rotation.x += delta * 4;
      // Arm swings inwards when playing
      if (armGroupRef.current) {
        armGroupRef.current.rotation.y = THREE.MathUtils.lerp(armGroupRef.current.rotation.y, 0.4, 0.05);
      }

      // Calculate distance to camera for spatial audio effect
      const dist = camera.position.distanceTo(gramophonePos);

      // Calculate dropoff (gets softer up to 25 units away)
      let dropoff = 1.0 - (dist / 25);
      if (dropoff < 0) dropoff = 0;
      if (dropoff > 1) dropoff = 1;

      // Square the dropoff for a natural curve, but ensure it NEVER drops below 0.3 (dim, not quiet)
      const minVolume = 0.3;
      const calculatedVol = minVolume + (dropoff * dropoff) * (1.0 - minVolume);

      audio.volume = calculatedVol * 0.7; // 0.7 is max volume so it's not overwhelmingly loud
    } else {
      // Arm swings back out when paused
      if (armGroupRef.current) {
        armGroupRef.current.rotation.y = THREE.MathUtils.lerp(armGroupRef.current.rotation.y, 0, 0.05);
      }
    }
  });

  const togglePlay = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerDown={togglePlay}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >  {/* Local Light to Illuminate the Gramophone */}
      <pointLight position={[0, 2, 0]} intensity={3} distance={5} color="#fff" />

      {/* Deep Mahogany Wooden Box Base */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.9, 0.3, 0.9]} />
        <meshStandardMaterial color="#3d1c04" roughness={0.8} />
      </mesh>
      {/* Ornate Stepped Base layer */}
      <mesh position={[0, 0.325, 0]}>
        <boxGeometry args={[0.8, 0.05, 0.8]} />
        <meshStandardMaterial color="#4a250a" roughness={0.8} />
      </mesh>

      {/* Gold Plaque on front */}
      <mesh position={[0, 0.15, 0.455]}>
        <boxGeometry args={[0.3, 0.1, 0.01]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Side Crank Handle */}
      <group position={[0.45, 0.15, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.1]} />
          <meshStandardMaterial color="#888" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Rotating part of the crank */}
        <group ref={crankRef} position={[0.05, 0, 0]}>
          <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.1]} />
            <meshStandardMaterial color="#888" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.08]} />
            <meshStandardMaterial color="#111" roughness={0.6} />
          </mesh>
        </group>
      </group>

      {/* Record Platter */}
      <mesh position={[-0.1, 0.36, 0.1]}>
        <cylinderGeometry args={[0.32, 0.32, 0.02, 32]} />
        <meshStandardMaterial color="#bbbbbb" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Black Vinyl Record */}
      <mesh ref={recordRef} position={[-0.1, 0.38, 0.1]}>
        <cylinderGeometry args={[0.3, 0.3, 0.02, 32]} />
        <meshStandardMaterial color="#111111" roughness={0.5} />
        {/* Record Label */}
        <mesh position={[0, 0.015, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.01, 32]} />
          <meshStandardMaterial color="#8b0000" roughness={0.8} />
        </mesh>
      </mesh>

      {/* Animated Tone Arm */}
      <group position={[0.25, 0.38, 0.3]} ref={armGroupRef}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.06, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Arm Rod stretching out */}
        <mesh position={[-0.17, 0.04, -0.1]} rotation={[0, -0.5, 1.57]}>
          <cylinderGeometry args={[0.015, 0.015, 0.4, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Needle Head */}
        <mesh position={[-0.32, 0.02, -0.18]}>
          <boxGeometry args={[0.04, 0.04, 0.06]} />
          <meshStandardMaterial color="#222" roughness={0.5} />
        </mesh>
      </group>

      {/* The Grand Golden Horn (Octagonal for vintage look) */}
      <group position={[0.25, 0.35, -0.25]} rotation={[-Math.PI / 1.5, -Math.PI / 6, 0]}>
        {/* Narrow neck */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.02, 0.08, 0.4, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Wide Flared Bell */}
        <mesh position={[0, -0.8, 0]}>
          <coneGeometry args={[0.6, 0.8, 12, 1, true]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Floating Music Notes / Sparkles when playing */}
      {isPlaying && (
        <Sparkles count={20} scale={[1.5, 2, 1.5]} position={[0, 1.0, 0.8]} size={4} speed={0.8} color="#ffd700" />
      )}
    </group>
  );
};

const AirConditioner = ({ position, rotation }) => {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[2.5, 0.6, 0.4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      {/* Vent slit */}
      <mesh position={[0, -0.15, 0.21]}>
        <boxGeometry args={[2, 0.05, 0.01]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Details */}
      <mesh position={[1, 0.1, 0.21]}>
        <boxGeometry args={[0.15, 0.05, 0.01]} />
        <meshStandardMaterial color="#888" />
      </mesh>
    </group>
  );
};

const RedCarpet = () => {
  return (
    <group position={[0, 0.01, 0]}>
      {/* Carpet from Door to Back Wall (Z-axis) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 19.4]} />
        <meshStandardMaterial color="#8b0000" roughness={0.9} />
      </mesh>
      {/* Carpet from Left Wall to Right Wall (X-axis) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[19.4, 3]} />
        <meshStandardMaterial color="#8b0000" roughness={0.9} />
      </mesh>
    </group>
  );
};

const MaharaniCrown = ({ position }) => {
  const crownRef = React.useRef();
  const haloRef1 = React.useRef();
  const haloRef2 = React.useRef();
  const haloRef3 = React.useRef();
  const innerCageRef = React.useRef();

  useFrame((state, delta) => {
    if (crownRef.current) {
      crownRef.current.rotation.y += delta * 0.15;
      crownRef.current.position.y = 1.7 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
    }
    if (haloRef1.current) {
      haloRef1.current.rotation.x += delta * 0.4;
      haloRef1.current.rotation.y += delta * 0.3;
    }
    if (haloRef2.current) {
      haloRef2.current.rotation.x -= delta * 0.5;
      haloRef2.current.rotation.z += delta * 0.4;
    }
    if (haloRef3.current) {
      haloRef3.current.rotation.y += delta * 0.8;
      haloRef3.current.rotation.z -= delta * 0.2;
    }
    if (innerCageRef.current) {
      innerCageRef.current.rotation.x += delta * 0.5;
      innerCageRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group position={position || [0, 0, 0]}>
      {/* Grand Multi-Tiered Pedestal */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.8, 1, 0.2, 64]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.7, 0.8, 0.1, 64]} />
        <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.5, 0.65, 0.6, 64]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.55, 0.5, 0.15, 64]} />
        <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.05, 64]} />
        <meshStandardMaterial color="#ffb6c1" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Floating Extravagant Crown */}
      <group ref={crownRef} position={[0, 1.7, 0]}>

        {/* Intricate Base Circlet System */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.1, 64]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.4, 0.02, 16, 64]} />
          <meshStandardMaterial color="#ffb6c1" metalness={1} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.4, 0.02, 16, 64]} />
          <meshStandardMaterial color="#ffb6c1" metalness={1} roughness={0.1} />
        </mesh>

        {/* Outer Crown Layer (12 Peaks) */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const x = Math.cos(angle) * 0.4;
          const z = Math.sin(angle) * 0.4;

          return (
            <group key={`outer-peak-${i}`} position={[x, 0.05, z]} rotation={[0, -angle, 0]}>
              <mesh position={[0, 0.1, 0]}>
                <coneGeometry args={[0.03, 0.2, 16]} />
                <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
              </mesh>
              <mesh position={[0, 0.2, 0]}>
                <octahedronGeometry args={[0.03, 0]} />
                <meshPhysicalMaterial color="#ffb6c1" transmission={0.2} opacity={1} transparent roughness={0.1} metalness={0.8} />
              </mesh>
            </group>
          );
        })}

        {/* Inner Crown Layer (6 Taller Peaks) */}
        {[...Array(6)].map((_, i) => {
          const angle = (i / 6) * Math.PI * 2 + (Math.PI / 12); // Offset
          const x = Math.cos(angle) * 0.35;
          const z = Math.sin(angle) * 0.35;

          return (
            <group key={`inner-peak-${i}`} position={[x, 0.05, z]} rotation={[0, -angle, 0]}>
              <mesh position={[0, 0.2, 0]}>
                <coneGeometry args={[0.04, 0.4, 16]} />
                <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
              </mesh>
              <mesh position={[0, 0.45, 0]}>
                <octahedronGeometry args={[0.06, 0]} />
                <meshPhysicalMaterial color="#ff1493" transmission={0.5} opacity={1} transparent roughness={0.1} metalness={0.5} emissive="#ff1493" emissiveIntensity={0.8} />
              </mesh>
            </group>
          );
        })}

        {/* Draping Jewels (Small diamonds hanging below base) */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2 + (Math.PI / 12);
          const x = Math.cos(angle) * 0.4;
          const z = Math.sin(angle) * 0.4;
          return (
            <group key={`drape-${i}`} position={[x, -0.05, z]}>
              <mesh position={[0, -0.08, 0]}>
                <cylinderGeometry args={[0.005, 0.005, 0.16]} />
                <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} />
              </mesh>
              <mesh position={[0, -0.16, 0]}>
                <octahedronGeometry args={[0.03, 0]} />
                <meshPhysicalMaterial color="#ff69b4" transmission={0.9} />
              </mesh>
            </group>
          )
        })}

        {/* Center Complex Setting (Torus Knot Cage) */}
        <group ref={innerCageRef} position={[0, 0.35, 0]}>
          <mesh>
            <torusKnotGeometry args={[0.2, 0.015, 128, 16]} />
            <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} />
          </mesh>
        </group>

        {/* Massive Center Ruby */}
        <mesh position={[0, 0.35, 0]}>
          <octahedronGeometry args={[0.18, 1]} />
          <meshPhysicalMaterial
            color="#ff1493"
            transmission={0.4}
            opacity={1}
            transparent={true}
            roughness={0.1}
            metalness={0.6}
            emissive="#ff1493"
            emissiveIntensity={1}
          />
        </mesh>

        {/* Extravagant Orbital Halos */}
        <group ref={haloRef1} position={[0, 0.35, 0]}>
          <mesh>
            <torusGeometry args={[0.55, 0.01, 16, 64]} />
            <meshBasicMaterial color="#ffd700" />
          </mesh>
          <mesh position={[0.55, 0, 0]}>
            <octahedronGeometry args={[0.05, 0]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
        <group ref={haloRef2} position={[0, 0.35, 0]}>
          <mesh>
            <torusGeometry args={[0.65, 0.008, 16, 64]} />
            <meshBasicMaterial color="#ff69b4" />
          </mesh>
          <mesh position={[-0.65, 0, 0]}>
            <octahedronGeometry args={[0.05, 0]} />
            <meshBasicMaterial color="#ffd700" />
          </mesh>
        </group>
        <group ref={haloRef3} position={[0, 0.35, 0]}>
          <mesh>
            <torusGeometry args={[0.75, 0.005, 16, 64]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        <pointLight position={[0, 0.35, 0]} intensity={5} distance={8} color="#ff1493" />
      </group>

      <Sparkles count={150} scale={[3, 4, 3]} position={[0, 1.7, 0]} size={1.5} speed={0.6} color="#ff69b4" />

      {/* Freestanding Museum Plaque */}
      <group position={[0, 0, 1.4]}>
        {/* Pole */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.02, 0.03, 0.5]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Base */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 0.04]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Plaque Plate angled up */}
        <group position={[0, 0.5, 0]} rotation={[-Math.PI / 4, 0, 0]}>
          <mesh position={[0, 0, -0.01]}>
            <boxGeometry args={[1.8, 0.4, 0.02]} />
            <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.76, 0.36, 0.02]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>

          <Text
            position={[0, 0.08, 0.015]}
            fontSize={0.07}
            color="#ffd700"
            anchorX="center"
            anchorY="middle"
            textAlign="center"
            fontWeight="bold"
          >
            The Crown of our Bhondu Maharani
          </Text>
          <Text
            position={[0, -0.06, 0.015]}
            fontSize={0.045}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            textAlign="center"
            fontStyle="italic"
          >
            Bhondu Royalty
          </Text>
        </group>
      </group>

      {/* Velvet Rope Barrier */}
      <ExhibitBarrier position={[0, 0, 2.4]} rotation={[0, 0, 0]} />
    </group>
  );
};

const PottedPlant = ({ position }) => {
  return (
    <group position={position}>
      {/* Pot */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.3, 0.2, 0.6, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.02, 16]} />
        <meshStandardMaterial color="#3b2f2f" roughness={1} />
      </mesh>
      {/* Plant Leaves */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#2e8b57" roughness={0.8} />
      </mesh>
      <mesh position={[0.2, 1.0, 0.2]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#3cb371" roughness={0.8} />
      </mesh>
      <mesh position={[-0.2, 1.1, -0.2]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#2e8b57" roughness={0.8} />
      </mesh>
    </group>
  );
};

const TrophySculpture = ({ position, rotation, scale = 1 }) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Wide Marble Pedestal */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2.2, 1, 2.2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.1} />
      </mesh>

      {/* Golden accent on pedestal */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[2.3, 0.1, 2.3]} />
        <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Unique Trophy */}
      <group position={[0, 1.1, 0]}>
        {/* Trophy Base */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.35, 0.5, 0.4, 32]} />
          <meshStandardMaterial color="#2a1f1a" roughness={0.9} metalness={0.1} />
        </mesh>

        {/* Trophy Stem */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.08, 0.15, 0.4, 32]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Trophy Cup */}
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.5, 0.08, 0.5, 32, 1, true]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 32]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Trophy Handles */}
        <mesh position={[-0.45, 1.05, 0]} rotation={[0, 0, Math.PI / 6]}>
          <torusGeometry args={[0.25, 0.05, 16, 32]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.45, 1.05, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <torusGeometry args={[0.25, 0.05, 16, 32]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Glowing Gem Inside */}
        <mesh position={[0, 1.15, 0]}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color="#ff1493" emissive="#ff1493" emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
        <pointLight position={[0, 1.15, 0]} intensity={3} distance={5} color="#ff1493" />

        {/* Protective Glass Box (Aligns with table corners) */}
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[2.3, 1.8, 2.3]} />
          <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={1} transparent roughness={0} metalness={0.1} />
        </mesh>
      </group>

      {/* Information Stand in front of the pedestal */}
      <group position={[0, 0, 1.6]}>
        {/* Stand Pole */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.8]} />
          <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Stand Base */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.04]} />
          <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Angled Info Board */}
        <group position={[0, 0.85, 0]} rotation={[-Math.PI / 5, 0, 0]}>
          {/* Black Board Background */}
          <mesh>
            <boxGeometry args={[2.0, 1.0, 0.05]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
          {/* Golden Frame around Board */}
          <mesh position={[0, 0, -0.01]}>
            <boxGeometry args={[2.05, 1.05, 0.05]} />
            <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Spanish Title */}
          <Text
            position={[0, 0.28, 0.026]}
            fontSize={0.14}
            color="#ffd700"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.9}
            textAlign="center"
            fontWeight="bold"
          >
            El Trofeo de nuestro vínculo
          </Text>

          {/* English Translation */}
          <Text
            position={[0, 0.03, 0.026]}
            fontSize={0.09}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.9}
            textAlign="center"
            fontStyle="italic"
          >
            (The Trophy of our bond)
          </Text>

          {/* Meaning */}
          <Text
            position={[0, -0.22, 0.026]}
            fontSize={0.07}
            color="#cccccc"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.8}
            textAlign="center"
            lineHeight={1.4}
          >
            A symbol of our unbreakable friendship and the countless beautiful memories we've created together.
          </Text>
        </group>
      </group>
    </group>
  );
};

const MuseumBench = ({ position, rotation }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Wood Base/Legs */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[2, 0.4, 0.6]} />
        <meshStandardMaterial color="#3b2f2f" roughness={0.8} />
      </mesh>
      {/* Velvet Cushion */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.9, 0.1, 0.5]} />
        <meshStandardMaterial color="#8b0000" roughness={0.9} />
      </mesh>
      {/* Golden Accents on Bench */}
      <mesh position={[1, 0.2, 0.31]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-1, 0.2, 0.31]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[1, 0.2, -0.31]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-1, 0.2, -0.31]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

const MarbleColumn = ({ position }) => {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.7, 0.4, 0.7]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.1} />
      </mesh>
      {/* Pillar */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 7.6, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.1} />
      </mesh>
      {/* Top Cap */}
      <mesh position={[0, 7.8, 0]}>
        <boxGeometry args={[0.7, 0.4, 0.7]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.1} />
      </mesh>
      {/* Golden Accents */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
        <meshStandardMaterial color="#ffd700" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 7.55, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
        <meshStandardMaterial color="#ffd700" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
};

const RoyalWallLamp = ({ position, rotation }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Ornate Golden Backplate */}
      <mesh position={[0, 0, -0.05]}>
        <cylinderGeometry args={[0.25, 0.2, 0.8, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.4, -0.05]}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.4, -0.05]}>
        <coneGeometry args={[0.15, 0.3, 16]} rotation={[Math.PI, 0, 0]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Sweeping Golden Arm */}
      <mesh position={[0, -0.1, 0.2]} rotation={[Math.PI / 6, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.02, 0.5]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Lamp Base / Holder */}
      <mesh position={[0, 0.1, 0.35]}>
        <cylinderGeometry args={[0.08, 0.04, 0.15]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Frosted Royal Lampshade */}
      <mesh position={[0, 0.35, 0.35]}>
        <cylinderGeometry args={[0.15, 0.08, 0.4, 16, 1, true]} />
        <meshStandardMaterial color="#fff0f5" roughness={0.8} side={THREE.DoubleSide} transmission={0.5} opacity={1} transparent />
      </mesh>
      <mesh position={[0, 0.55, 0.35]}>
        <torusGeometry args={[0.15, 0.02, 16, 32]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Light Source inside the shade */}
      <pointLight position={[0, 0.35, 0.35]} intensity={2.5} distance={6} color="#ffebcd" />
      {/* The glowing bulb hidden inside the frosted shade */}
      <mesh position={[0, 0.3, 0.35]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="#ffebcd" emissive="#ffebcd" emissiveIntensity={2} />
      </mesh>
    </group>
  );
};

const RoomTrim = () => {
  return (
    <group>
      {/* Bottom Trim (Baseboard) */}
      <mesh position={[0, 0.2, -9.95]}>
        <boxGeometry args={[20, 0.4, 0.1]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.2, 9.95]}>
        <boxGeometry args={[20, 0.4, 0.1]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-9.95, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[20, 0.4, 0.1]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[9.95, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[20, 0.4, 0.1]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Top Trim (Crown Molding) */}
      <mesh position={[0, 7.8, -9.95]}>
        <boxGeometry args={[20, 0.4, 0.1]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 7.8, 9.95]}>
        <boxGeometry args={[20, 0.4, 0.1]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-9.95, 7.8, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[20, 0.4, 0.1]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[9.95, 7.8, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[20, 0.4, 0.1]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
};

const FallingPetals = ({ count = 100 }) => {
  const meshRef = React.useRef();
  const dummy = React.useMemo(() => new THREE.Object3D(), []);

  const particles = React.useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = Math.random() * 10;
      const z = (Math.random() - 0.5) * 20;

      const rx = Math.random() * Math.PI;
      const ry = Math.random() * Math.PI;
      const rz = Math.random() * Math.PI;

      const speed = 0.5 + Math.random() * 0.5;
      const wobbleSpeed = 1 + Math.random() * 2;

      temp.push({ x, y, z, rx, ry, rz, speed, wobbleSpeed });
    }
    return temp;
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    particles.forEach((particle, i) => {
      particle.y -= particle.speed * delta;

      if (particle.y < 0) {
        particle.y = 8 + Math.random() * 2;
        particle.x = (Math.random() - 0.5) * 20;
        particle.z = (Math.random() - 0.5) * 20;
      }

      particle.rx += delta;
      particle.ry += delta * particle.wobbleSpeed;

      particle.x += Math.sin(state.clock.elapsedTime * particle.wobbleSpeed + i) * delta * 0.5;

      dummy.position.set(particle.x, particle.y, particle.z);
      dummy.rotation.set(particle.rx, particle.ry, particle.rz);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <circleGeometry args={[0.06, 6]} />
      <meshStandardMaterial color="#ff1493" side={THREE.DoubleSide} roughness={0.7} />
    </instancedMesh>
  );
};

const Room = ({ onExit }) => {
  return (
    <group>
      {/* Central Chandelier Light */}
      <pointLight position={[0, 7, 0]} intensity={10} distance={20} color="#ffb6c1" />
      <pointLight position={[0, 7, 0]} intensity={5} distance={25} color="#ffffff" />

      {/* Magical Particles & Falling Petals */}
      <Sparkles count={400} scale={[20, 8, 20]} position={[0, 4, 0]} size={2} speed={0.2} opacity={0.3} color="#ffe4e1" />
      <FallingPetals count={150} />

      {/* Floor - Polished Rose Quartz / Marble feel */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#ffd1dc" roughness={0.15} metalness={0.3} />
      </mesh>
      {/* Ceiling - White */}
      <mesh position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      {/* Walls - Soft Creamy White */}
      {/* Back Wall */}
      <mesh position={[0, 4, -10]}>
        <boxGeometry args={[20, 8, 0.5]} />
        <meshStandardMaterial color="#fff0f5" roughness={0.8} />
      </mesh>
      {/* Front Wall */}
      <mesh position={[0, 4, 10]}>
        <boxGeometry args={[20, 8, 0.5]} />
        <meshStandardMaterial color="#fff0f5" roughness={0.8} />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-10, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[20, 8, 0.5]} />
        <meshStandardMaterial color="#fff0f5" roughness={0.8} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[10, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[20, 8, 0.5]} />
        <meshStandardMaterial color="#fff0f5" roughness={0.8} />
      </mesh>

      {/* Back Wall */}
      <ExhibitFrame url={images[0].url} title={images[0].title} position={[-4, 2, -9.7]} rotation={[0, 0, 0]} />
      <ExhibitBarrier position={[-4, 0, -9.7]} rotation={[0, 0, 0]} />

      <TrophySculpture position={[0, 0, 0]} rotation={[0, 0, 0]} scale={0.6} />

      <ExhibitFrame url={images[1].url} title={images[1].title} position={[4, 2, -9.7]} rotation={[0, 0, 0]} />
      <ExhibitBarrier position={[4, 0, -9.7]} rotation={[0, 0, 0]} />

      {/* Left Wall */}
      <ExhibitFrame url={images[2].url} title={images[2].title} position={[-9.7, 2, 3]} rotation={[0, Math.PI / 2, 0]} />
      <ExhibitBarrier position={[-9.7, 0, 3]} rotation={[0, Math.PI / 2, 0]} />

      <ExhibitFrame url={images[3].url} title={images[3].title} position={[-9.7, 2, -5]} rotation={[0, Math.PI / 2, 0]} />
      <ExhibitBarrier position={[-9.7, 0, -5]} rotation={[0, Math.PI / 2, 0]} />

      {/* Right Wall */}
      <ExhibitFrame url={images[4].url} title={images[4].title} position={[9.7, 2, 3]} rotation={[0, -Math.PI / 2, 0]} />
      <ExhibitBarrier position={[9.7, 0, 3]} rotation={[0, -Math.PI / 2, 0]} />

      <ExhibitFrame url={images[5].url} title={images[5].title} position={[9.7, 2, -5]} rotation={[0, -Math.PI / 2, 0]} />
      <ExhibitBarrier position={[9.7, 0, -5]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Decorative Additions */}
      <Fanoos />
      <AirConditioner position={[-9.7, 6, -2.5]} rotation={[0, Math.PI / 2, 0]} />
      <AirConditioner position={[9.7, 6, -2.5]} rotation={[0, -Math.PI / 2, 0]} />
      <AirConditioner position={[0, 6.5, -9.7]} rotation={[0, 0, 0]} />

      {/* Gramophone Setup */}
      <mesh position={[8, 0.4, 8]}>
        <cylinderGeometry args={[0.7, 0.7, 0.8, 32]} />
        <meshStandardMaterial color="#fff0f5" roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh position={[8, 0.85, 8]}>
        <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
      </mesh>
      <Gramophone position={[8, 0.9, 8]} rotation={[0, -Math.PI / 2, 0]} scale={1.2} />

      {/* Medieval Sword in the Stone Exhibit */}
      <SwordInStone position={[-8, 0, 8]} rotation={[0, 3 * Math.PI / 4, 0]} />

      {/* New Museum Decorations */}
      <RoomTrim />
      <RedCarpet />
      <MaharaniCrown position={[0, 0, -9.5]} />

      {/* Visitor Benches */}
      <MuseumBench position={[-4, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <MuseumBench position={[4, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <MuseumBench position={[0, 0, 4]} rotation={[0, 0, 0]} />

      {/* Marble Columns in the 4 corners */}
      <MarbleColumn position={[-9.4, 0, -9.4]} />
      <MarbleColumn position={[9.4, 0, -9.4]} />
      <MarbleColumn position={[-9.4, 0, 9.4]} />
      <MarbleColumn position={[9.4, 0, 9.4]} />

      {/* Royal Wall Lamps */}
      <RoyalWallLamp position={[-6, 3, -9.9]} rotation={[0, 0, 0]} />
      <RoyalWallLamp position={[-2, 3, -9.9]} rotation={[0, 0, 0]} />
      <RoyalWallLamp position={[2, 3, -9.9]} rotation={[0, 0, 0]} />
      <RoyalWallLamp position={[6, 3, -9.9]} rotation={[0, 0, 0]} />
      <RoyalWallLamp position={[-9.9, 3, -1]} rotation={[0, Math.PI / 2, 0]} />
      <RoyalWallLamp position={[9.9, 3, -1]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Front Wall Lamps by the Door */}
      <RoyalWallLamp position={[-3, 3.5, 9.9]} rotation={[0, Math.PI, 0]} />
      <RoyalWallLamp position={[3, 3.5, 9.9]} rotation={[0, Math.PI, 0]} />

      <PottedPlant position={[-2.5, 0, 8.5]} />
      <PottedPlant position={[2.5, 0, 8.5]} />
      <PottedPlant position={[-8.5, 0, -8.5]} />
      <PottedPlant position={[8.5, 0, -8.5]} />

      {/* The Grand Entrance Door */}
      <FancyDoor position={[0, 0, 9.7]} rotation={[0, Math.PI, 0]} onExit={onExit} />
      
      {/* Royal Guards (Suits of Armor) */}
      <SuitOfArmor position={[-1.5, 0, 9.5]} rotation={[0, Math.PI, 0]} />
      <SuitOfArmor position={[1.5, 0, 9.5]} rotation={[0, Math.PI, 0]} />
    </group>
  );
};

const SwordInStone = ({ position, rotation }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Small Museum Pedestal for the Stone */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[1, 1.1, 0.2, 32]} />
        <meshStandardMaterial color="#333333" roughness={0.9} />
      </mesh>

      {/* The Enchanted Stone (Rose Quartz) */}
      <mesh position={[0, 0.6, 0]} rotation={[0.2, 0.5, -0.1]}>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#ffe4e1" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Glowing Magic inside Stone (Warm Pink) */}
      <pointLight position={[0, 0.8, 0]} intensity={1.5} color="#ff1493" distance={4} />

      {/* The Sword */}
      <group position={[0, 1.1, 0]} rotation={[0.1, 0.5, 0.1]}>
        {/* Sword Blade (Rose Gold) */}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[0.12, 1.0, 0.02]} />
          <meshStandardMaterial color="#b76e79" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Crossguard (Warm Gold) */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.6, 0.05, 0.05]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-0.3, 0.45, 0]}>
          <coneGeometry args={[0.03, 0.1, 4]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.3, 0.45, 0]}>
          <coneGeometry args={[0.03, 0.1, 4]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Grip (Deep Red Velvet/Leather) */}
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.45]} />
          <meshStandardMaterial color="#8b0000" roughness={0.9} />
        </mesh>

        {/* Pommel (Ruby Jewel) */}
        <mesh position={[0, 0.9, 0]}>
          <octahedronGeometry args={[0.08, 0]} />
          <meshStandardMaterial color="#ff1493" metalness={0.5} roughness={0.1} emissive="#ff1493" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Magical Aura (Pink Sparkles) */}
      <Sparkles count={50} scale={[1.5, 2, 1.5]} position={[0, 1.2, 0]} size={2} speed={0.5} color="#ffb6c1" />

      {/* Medieval Plaque */}
      <group position={[0, 0, 1.6]}>
        {/* Pole */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.02, 0.03, 0.5]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Base */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 0.04]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Plaque Plate */}
        <group position={[0, 0.5, 0]} rotation={[-Math.PI / 4, 0, 0]}>
          <mesh position={[0, 0, -0.01]}>
            <boxGeometry args={[1.1, 0.3, 0.02]} />
            <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.06, 0.26, 0.02]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>

          <Text
            position={[0, 0.05, 0.015]}
            fontSize={0.06}
            color="#ffd700"
            anchorX="center"
            anchorY="middle"
            textAlign="center"
            fontWeight="bold"
          >
            The Blade of Devotion
          </Text>
          <Text
            position={[0, -0.05, 0.015]}
            fontSize={0.04}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            textAlign="center"
            fontStyle="italic"
          >
            From A Knight of Bhondu Royalty
          </Text>
        </group>
      </group>
    </group>
  );
};

const SuitOfArmor = ({ position, rotation }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Base/Pedestal */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.4, 0.45, 0.1, 16]} />
        <meshStandardMaterial color="#333333" roughness={0.9} />
      </mesh>
      
      {/* Armor Material (Shiny Silver) */}
      <group position={[0, 0, 0]}>
        {/* Legs */}
        <mesh position={[-0.15, 0.5, 0]}>
          <cylinderGeometry args={[0.08, 0.06, 0.8]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.15, 0.5, 0]}>
          <cylinderGeometry args={[0.08, 0.06, 0.8]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.2} />
        </mesh>
        
        {/* Torso */}
        <mesh position={[0, 1.25, 0]}>
          <cylinderGeometry args={[0.25, 0.2, 0.7]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Golden Chest Plate detail */}
        <mesh position={[0, 1.3, 0.24]}>
          <boxGeometry args={[0.2, 0.3, 0.05]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Shoulders (Pauldrons) */}
        <mesh position={[-0.32, 1.5, 0]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.32, 1.5, 0]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Arms */}
        <mesh position={[-0.35, 1.1, 0]} rotation={[0, 0, -0.1]}>
          <cylinderGeometry args={[0.06, 0.05, 0.7]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.35, 1.1, 0.1]} rotation={[-0.3, 0, 0.1]}>
          <cylinderGeometry args={[0.06, 0.05, 0.7]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Helmet */}
        <group position={[0, 1.75, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.25]} />
            <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.12]} />
            <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Visor Slit */}
          <mesh position={[0, 0.02, 0.11]}>
            <boxGeometry args={[0.15, 0.03, 0.05]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.05, 0.11]}>
            <boxGeometry args={[0.1, 0.02, 0.05]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
          {/* Feather Plume on helmet */}
          <mesh position={[0, 0.3, -0.05]} rotation={[0.5, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.05, 0.3]} />
            <meshStandardMaterial color="#ff1493" roughness={0.9} />
          </mesh>
        </group>

        {/* Halberd (Polearm) held in right hand */}
        <group position={[0.4, 1.0, 0.3]} rotation={[0.2, 0, 0]}>
          {/* Pole */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 2.2]} />
            <meshStandardMaterial color="#4a3018" roughness={0.9} />
          </mesh>
          {/* Spear Tip */}
          <mesh position={[0, 1.2, 0]}>
            <coneGeometry args={[0.05, 0.3, 4]} />
            <meshStandardMaterial color="#eeeeee" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Axe Blade */}
          <mesh position={[0.1, 1.0, 0]}>
            <boxGeometry args={[0.2, 0.3, 0.02]} />
            <meshStandardMaterial color="#eeeeee" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

const VirtualMuseum = ({ onExit }) => {
  const [locked, setLocked] = useState(false);

  return (
    <div className="virtual-museum-container">
      {/* Center crosshair for exploring */}
      <div className={`crosshair ${!locked ? 'hidden' : ''}`} />

      <Canvas camera={{ position: [0, 1.6, 5], fov: 60 }}>
        {/* Return to original ambient lighting */}
        <ambientLight intensity={0.6} color="#fff0f5" />

        <React.Suspense fallback={null}>
          <Room onExit={onExit} />
        </React.Suspense>
        <Player />
        <PointerLockControls
          onLock={() => setLocked(true)}
          onUnlock={() => setLocked(false)}
        />
      </Canvas>
    </div>
  );
};

export default VirtualMuseum;
