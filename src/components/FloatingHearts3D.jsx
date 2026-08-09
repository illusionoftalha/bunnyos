import React, { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

const HeartShape = ({ position, scale, color, rotationSpeed }) => {
  const meshRef = useRef();
  
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    // Standard Heart Curve
    shape.moveTo(x + 2.5, y + 2.5);
    shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
    shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
    shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
    shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 5.5, x + 8, y + 3.5);
    shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
    shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

    const extrudeSettings = {
      depth: 1,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.5,
      bevelThickness: 0.5,
    };
    
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center(); 
    geom.scale(0.12, 0.12, 0.12);
    geom.rotateX(Math.PI); // Make it face upright
    return geom;
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed.y;
      meshRef.current.rotation.x += delta * rotationSpeed.x;
      meshRef.current.rotation.z += delta * rotationSpeed.z;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={meshRef} position={position} geometry={geometry} scale={scale}>
        {/* Beautiful glass/gem material */}
        <meshPhysicalMaterial 
          color={color} 
          roughness={0.15} 
          metalness={0.1}
          transmission={0.6}
          thickness={1.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </Float>
  );
};

const FloatingHearts3D = () => {
  const hearts = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => {
      // Determine if this heart goes on the left or right side
      const isLeftSide = i % 2 === 0;
      
      // X position: visible range is roughly -8 to 8 on a widescreen at z=0.
      // Avoid center (-4 to 4). Left: -8 to -4. Right: 4 to 8.
      const xPos = isLeftSide 
        ? -4 - Math.random() * 4 
        : 4 + Math.random() * 4;

      return {
        position: [
          xPos,
          (Math.random() - 0.5) * 8, // Y spread (top to bottom within visible area)
          (Math.random() - 0.5) * 4 - 2 // Z spread
        ],
      scale: Math.random() * 0.8 + 0.5,
      color: ['#ff9a9e', '#fecfef', '#FF73C3', '#FFACD8', '#ffffff'][Math.floor(Math.random() * 5)],
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.8,
        y: (Math.random() - 0.5) * 0.8,
        z: (Math.random() - 0.5) * 0.8,
      }
    };
  });
}, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 2 }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}
    >
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.8} color="#ff9a9e" />
        
        {hearts.map((heart, i) => (
          <HeartShape key={i} {...heart} />
        ))}
        
        <Environment preset="city" />
      </Canvas>
    </motion.div>
  );
};

export default FloatingHearts3D;
