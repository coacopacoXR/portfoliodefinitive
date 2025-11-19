import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Mesh, Vector3, Color } from 'three';
import { Text, Html } from '@react-three/drei';
import { PortfolioItem } from '../types';
import { easing } from 'maath';

interface ArtifactProps {
  item: PortfolioItem;
  isSelected: boolean;
  isAnySelected: boolean;
  onSelect: () => void;
  onHover: (state: boolean) => void;
  isHackerMode: boolean;
}

export const Artifact: React.FC<ArtifactProps> = ({ item, isSelected, isAnySelected, onSelect, onHover, isHackerMode }) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  // Vectors for calculation
  const vec = new Vector3();
  
  // Determine colors based on type
  const isMusic = item.type === 'music';

  // Base colors
  const colorBase = isMusic ? new Color("#222222") : new Color("#e8e8e8");
  const colorHover = isMusic ? new Color("#333333") : new Color("#ffffff");
  const colorSelected = isMusic ? new Color("#1a1a1a") : new Color("#ffffff");
  const colorGhost = new Color("#f0f0f0"); // Faded color

  // Emissive properties for Music "Hardware" feel
  const emissiveBase = new Color("#000000");
  const emissiveHover = new Color("#ea580c"); // Orange glow

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // 1. MATERIAL MORPHING LOGIC
    const material = meshRef.current.material as any;
    
    // Determine if this item is "ghosted" (faded out because another is selected)
    const isGhost = isAnySelected && !isSelected;

    if (isHackerMode) {
        // HACKER MODE STYLE
        easing.damp(material, 'roughness', 0, 0.25, delta);
        easing.damp(material, 'transmission', 0, 0.25, delta);
        easing.damp(material, 'opacity', 1, 0.25, delta);
        easing.dampC(material.color, new Color("#000000"), 0.25, delta);
        easing.dampC(material.emissive, new Color("#00ff00"), 0.25, delta);
        material.emissiveIntensity = isSelected ? 2 : hovered ? 1 : 0.2;
        material.wireframe = true;
    } else {
        // NORMAL MODE STYLE
        material.wireframe = false;
        
        const targetRoughness = isMusic 
            ? 0.8 
            : (isSelected ? 0.15 : hovered ? 0.2 : isGhost ? 0.9 : 0.65);
        
        const targetTransmission = isMusic 
            ? 0.0 
            : (isSelected ? 0.2 : hovered ? 0.75 : isGhost ? 0.0 : 0.0);
        
        const targetMetalness = isMusic 
            ? 0.5 
            : (isSelected ? 0.1 : hovered ? 0.1 : 0.0);
        
        const targetOpacity = isGhost ? 0.1 : 1.0;
        
        const targetColor = isSelected ? colorSelected : hovered ? colorHover : isGhost ? colorGhost : colorBase;
        
        // Music Emissive Pulse
        const targetEmissive = (isMusic && hovered) ? emissiveHover : emissiveBase;

        easing.damp(material, 'roughness', targetRoughness, 0.25, delta);
        easing.damp(material, 'transmission', targetTransmission, 0.3, delta);
        easing.damp(material, 'metalness', targetMetalness, 0.25, delta);
        easing.damp(material, 'opacity', targetOpacity, 0.4, delta);
        easing.dampC(material.color, targetColor, 0.25, delta);
        
        if (isMusic) {
            easing.dampC(material.emissive, targetEmissive, 0.1, delta);
            material.emissiveIntensity = hovered ? 0.5 : 0;
        }
    }

    // 2. MAGNETIC CURSOR MICRO-MOTION
    if (!isAnySelected) {
      vec.set(item.position[0], item.position[1], item.position[2]);
      vec.project(camera); 
      
      const dx = state.pointer.x - vec.x;
      const dy = state.pointer.y - vec.y;
      const distanceScreen = Math.sqrt(dx * dx + dy * dy);
      
      const magneticRadius = 0.3; 
      
      let targetX = item.position[0];
      let targetY = item.position[1];
      let targetZ = item.position[2];

      if (distanceScreen < magneticRadius) {
        const nudge = (magneticRadius - distanceScreen) * 1.5;
        targetX += dx * nudge;
        targetY += dy * nudge;
      }

      easing.damp(meshRef.current.position, 'x', targetX, 0.2, delta);
      easing.damp(meshRef.current.position, 'y', targetY, 0.2, delta);
      easing.damp(meshRef.current.position, 'z', targetZ, 0.2, delta);
    } else {
      easing.damp3(meshRef.current.position, item.position, 0.5, delta);
    }

    const s = item.scale;
    const targetScale = isSelected ? 1.02 : hovered ? 1.05 : 1.0;
    easing.damp3(meshRef.current.scale, [s[0] * targetScale, s[1] * targetScale, s[2] * targetScale], 0.25, delta);
  });

  // Determine Text Position & Rotation based on Item Type
  const isPublication = item.type === 'publication';
  
  const textPosition: [number, number, number] = isPublication 
    ? [
        item.position[0] - (item.scale[0] / 2) + 0.1, // Left padding
        item.position[1] + (item.scale[1] / 2) + 0.005, // Slightly above top surface to prevent z-fighting
        item.position[2] - (item.scale[2] / 2) + 0.15  // Top margin
      ]
    : [
        item.position[0] - (item.scale[0] / 2) + 0.08, // Left padding
        item.position[1] + (item.scale[1] / 2) - 0.1,  // Top margin
        item.position[2] + (item.scale[2] / 2) + 0.005  // Front face + buffer
      ];

  const textRotation: [number, number, number] = isPublication
    ? [-Math.PI / 2, 0, 0] // Flat on top, facing up
    : [0, 0, 0]; // Standard vertical

  const isGhost = isAnySelected && !isSelected;

  // Helper to get year for publications
  const getYear = () => {
    if (item.type === 'publication') return (item.data as any).year;
    return null;
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        position={item.position}
        scale={item.scale}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          setHovered(false);
          onHover(false);
          document.body.style.cursor = 'auto';
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color="#e8e8e8"
          roughness={0.65}
          metalness={0.0}
          transmission={0}
          thickness={2.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
          ior={1.5}
          transparent={true} 
        />
      </mesh>
      
      {/* Title Text (3D Label) */}
      <Text
        position={textPosition}
        rotation={textRotation}
        maxWidth={item.scale[0] * 0.85}
        fontSize={isPublication ? 0.09 : 0.12}
        lineHeight={1.1}
        color={isHackerMode ? "#00ff00" : (isMusic ? "#ffffff" : "#1a1a1a")} 
        fillOpacity={isGhost ? 0.1 : 1.0} 
        anchorX="left"
        anchorY="top"
        font="https://fonts.gstatic.com/s/courierprime/v9/u-450i2Jg9hRTEe8HkyIdTA.woff" 
      >
        {item.data.title}
      </Text>

      {/* Hover Tooltip (HTML Overlay) */}
      {hovered && !isSelected && (
        <Html
          position={[item.position[0], item.position[1] + item.scale[1]/2 + 0.5, item.position[2]]}
          center
          distanceFactor={10}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className={`w-56 backdrop-blur p-4 border shadow-2xl rounded-sm text-left font-typewriter transform translate-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200
            ${isHackerMode ? 'bg-black/90 border-green-500 text-green-500' : 'bg-white/95 border-gray-300 text-gray-900'}`}>
            <div className={`flex justify-between items-start border-b pb-2 mb-2 ${isHackerMode ? 'border-green-800' : 'border-gray-200'}`}>
              <span className={`text-[9px] font-bold uppercase tracking-widest ${isHackerMode ? 'text-green-500' : 'text-orange-600'}`}>
                {item.type}
              </span>
              {getYear() && (
                <span className={`text-[9px] font-bold ${isHackerMode ? 'text-green-700' : 'text-gray-400'}`}>
                  {getYear()}
                </span>
              )}
            </div>
            <h3 className={`text-xs font-bold leading-tight mb-2 ${isHackerMode ? 'text-green-400' : 'text-gray-900'}`}>
              {item.data.title}
            </h3>
            <div className={`text-[8px] uppercase tracking-wider flex items-center gap-1 ${isHackerMode ? 'text-green-700' : 'text-gray-400'}`}>
              <span>Click to interact</span>
              <span>→</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};