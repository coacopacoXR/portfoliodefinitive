import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Mesh, Vector3, Color, Group, Euler, Object3D } from 'three';
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
  introComplete: boolean;
  deckMode: boolean;
  focusedIndex: number;
}

export const Artifact: React.FC<ArtifactProps> = ({ 
  item, isSelected, isAnySelected, onSelect, onHover, isHackerMode, introComplete,
  deckMode, focusedIndex
}) => {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();
  
  // Helper object for calculating rotations dynamically
  const dummy = useMemo(() => new Object3D(), []);

  // --- PILE / START ANIMATION LOGIC ---
  const initialPileState = useMemo(() => {
    return {
      position: new Vector3(
        (Math.random() - 0.5) * 15,
        12 + Math.random() * 10,
        (Math.random() - 0.5) * 10 
      ),
      rotation: new Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
    };
  }, []);

  const vec = new Vector3();

  // --- COLOR CONFIGURATION ---
  // Projects: Light Gray, Publications: White, Music: Black
  const config = useMemo(() => {
      if (item.type === 'music') {
          return {
              base: new Color("#111111"),
              hover: new Color("#222222"),
              selected: new Color("#000000"),
              text: "#ffffff"
          };
      } else if (item.type === 'publication') {
          return {
              base: new Color("#ffffff"),
              hover: new Color("#ffffff"), // Keep white, maybe slight brightness or emission change handled below
              selected: new Color("#ffffff"),
              text: "#000000"
          };
      } else {
          // Projects
          return {
              base: new Color("#e5e5e5"),
              hover: new Color("#f5f5f5"),
              selected: new Color("#ffffff"),
              text: "#000000"
          };
      }
  }, [item.type]);

  const colorGhost = new Color("#f0f0f0");
  const emissiveBase = new Color("#000000");
  const emissiveHover = new Color("#ea580c");

  useFrame((state, delta) => {
    if (groupRef.current) {
      let targetPos = new Vector3(...item.position);
      // We will calculate targetRot dynamically based on camera position
      let targetRot = new Euler();

      if (!introComplete) {
         // PILE STATE
         targetPos = initialPileState.position;
         targetRot = initialPileState.rotation;
      } else if (deckMode) {
          // --- DECK MODE LOGIC ---
          const isFocused = item.index === focusedIndex;
          
          if (isFocused) {
              // Position: In front of camera
              vec.set(0, 0, -4); // 4 units in front of camera
              vec.applyMatrix4(camera.matrixWorld);
              targetPos.copy(vec);

              // Rotation: Match camera rotation exactly
              targetRot.copy(camera.rotation);
          } else {
              const isNext = item.index === (focusedIndex + 1); 
              
              if (isNext) {
                 // Position: Slightly behind and right
                 vec.set(1.5, -0.5, -5); 
                 vec.applyMatrix4(camera.matrixWorld);
                 targetPos.copy(vec);
                 
                 // Rotation: Match camera but tilt slightly
                 targetRot.copy(camera.rotation);
                 targetRot.z += 0.1;
              }
              // Else stay at original world position
              else {
                // For items staying in the cube during deck mode, they should still look at camera?
                // The prompt says "rest stay in their place". 
                // Let's apply the dynamic lookAt logic below to them as well so they don't look dead.
                dummy.position.copy(targetPos);
                dummy.lookAt(state.camera.position);
                targetRot.copy(dummy.rotation);
              }
          }
      } else {
          // --- NORMAL MODE: DYNAMIC LOOK AT ---
          // Calculate rotation to look at the camera from the target position
          dummy.position.copy(targetPos);
          dummy.lookAt(state.camera.position);
          targetRot.copy(dummy.rotation);
      }

      // Apply Damping
      easing.damp3(groupRef.current.position, targetPos, deckMode ? 0.4 : 0.8, delta);
      easing.dampE(groupRef.current.rotation, targetRot, deckMode ? 0.4 : 0.6, delta);
    }

    if (!meshRef.current) return;
    
    const material = meshRef.current.material as any;
    const isGhost = isAnySelected && !isSelected;
    const isMusic = item.type === 'music';

    if (isHackerMode) {
        easing.damp(material, 'roughness', 0, 0.25, delta);
        easing.damp(material, 'transmission', 0, 0.25, delta);
        easing.damp(material, 'opacity', 1, 0.25, delta);
        easing.dampC(material.color, new Color("#000000"), 0.25, delta);
        easing.dampC(material.emissive, new Color("#00ff00"), 0.25, delta);
        material.emissiveIntensity = isSelected ? 2 : hovered ? 1 : 0.2;
        material.wireframe = true;
    } else {
        material.wireframe = false;
        
        // Customize material properties based on type if needed
        const targetRoughness = isMusic 
            ? 0.2 // Shinier black
            : (isSelected ? 0.15 : hovered ? 0.2 : isGhost ? 0.9 : 0.5);
        
        // Publications/Projects look better slightly matte unless hovered
        const targetMetalness = isMusic 
            ? 0.3 
            : (isSelected ? 0.1 : hovered ? 0.1 : 0.0);
        
        const targetOpacity = isGhost ? 0.1 : 1.0;
        
        const targetColor = isSelected ? config.selected : hovered ? config.hover : isGhost ? colorGhost : config.base;
        
        // Music gets a slight emissive glow on hover because it's dark
        const targetEmissive = (isMusic && hovered) ? new Color("#333333") : emissiveBase;

        easing.damp(material, 'roughness', targetRoughness, 0.25, delta);
        easing.damp(material, 'transmission', 0, 0.3, delta); // removed transmission for solid look
        easing.damp(material, 'metalness', targetMetalness, 0.25, delta);
        easing.damp(material, 'opacity', targetOpacity, 0.4, delta);
        easing.dampC(material.color, targetColor, 0.25, delta);
        easing.dampC(material.emissive, targetEmissive, 0.1, delta);
        
        if (isMusic) {
             material.emissiveIntensity = hovered ? 0.5 : 0;
        }
    }

    // Micro-motion logic
    if (!isAnySelected && !deckMode) {
        vec.copy(groupRef.current!.position); 
        vec.project(camera); 
        
        const dx = state.pointer.x - vec.x;
        const dy = state.pointer.y - vec.y;
        const distanceScreen = Math.sqrt(dx * dx + dy * dy);
        
        const magneticRadius = 0.3; 
        
        let targetX = 0; 
        let targetY = 0;
        let targetZ = 0;

        if (distanceScreen < magneticRadius) {
            const nudge = (magneticRadius - distanceScreen) * 1.5;
            targetX += dx * nudge;
            targetY += dy * nudge;
        }

        easing.damp(meshRef.current.position, 'x', targetX, 0.2, delta);
        easing.damp(meshRef.current.position, 'y', targetY, 0.2, delta);
        easing.damp(meshRef.current.position, 'z', targetZ, 0.2, delta);
    } else {
        easing.damp3(meshRef.current.position, [0, 0, 0], 0.5, delta);
    }

    const s = item.scale;
    const targetScale = isSelected ? 1.02 : hovered ? 1.25 : 1.0;
    easing.damp3(meshRef.current.scale, [s[0] * targetScale, s[1] * targetScale, s[2] * targetScale], 0.25, delta);
  });

  // --- TEXT POSITIONING ---
  const isPublication = item.type === 'publication';
  
  // Position text slightly in front of the mesh
  const localTextPosition: [number, number, number] = isPublication 
    ? [
        -item.scale[0] / 2 + 0.1, 
        item.scale[1] / 2 - 0.1, 
        item.scale[2] / 2 + 0.01 
      ]
    : [
        -item.scale[0] / 2 + 0.08, 
        item.scale[1] / 2 - 0.1,  
        item.scale[2] / 2 + 0.01 
      ];

  const isGhost = isAnySelected && !isSelected;

  const getYear = () => {
    if (item.type === 'publication') return (item.data as any).year;
    return null;
  };

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
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
          color="#e5e5e5" 
          roughness={0.5}
          metalness={0.1}
          clearcoat={0.5}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      <Text
        position={localTextPosition}
        maxWidth={item.scale[0] * 0.85}
        fontSize={isPublication ? 0.08 : 0.12}
        lineHeight={1.1}
        letterSpacing={-0.02}
        color={isHackerMode ? "#00ff00" : config.text} 
        fillOpacity={isGhost ? 0.1 : 0.9} 
        anchorX="left"
        anchorY="top"
        font="https://fonts.gstatic.com/s/courierprime/v9/u-450i2Jg9hRTEe8HkyIdTA.woff" 
        outlineWidth={isHackerMode ? 0 : '0%'}
        fontWeight="bold" 
      >
        {item.data.title}
      </Text>

      {/* Elegant Hover Tooltip (Constant Screen Space Size) */}
      {hovered && !isSelected && !deckMode && (
        <Html
          position={[0, 0, 0]} 
          center
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none', width: '300px' }} 
        >
            <div className="relative" style={{ transform: 'translate(40px, -40px)' }}>
                <svg className="absolute overflow-visible" style={{ left: 0, top: 0, width: 0, height: 0 }}>
                    <line 
                        x1="-40" 
                        y1="40" 
                        x2="0" 
                        y2="0" 
                        stroke={isHackerMode ? "#22c55e" : "#f97316"} 
                        strokeWidth="1" 
                        opacity="0.6"
                    />
                    <circle cx="-40" cy="40" r="2" fill={isHackerMode ? "#22c55e" : "#f97316"} />
                </svg>

                <div className={`backdrop-blur-xl p-4 border shadow-2xl rounded-sm text-left font-typewriter transform animate-in fade-in zoom-in duration-200 w-auto min-w-[240px]
                    ${isHackerMode ? 'bg-black/90 border-green-500 text-green-500' : 'bg-white/95 border-orange-500 text-gray-900'}`}>
                    
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
                    <h3 className={`text-xs font-bold leading-tight ${isHackerMode ? 'text-green-400' : 'text-gray-900'}`}>
                        {item.data.title}
                    </h3>
                    
                    <div className={`absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l ${isHackerMode ? 'border-green-400' : 'border-orange-600'}`}></div>
                    <div className={`absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r ${isHackerMode ? 'border-green-400' : 'border-orange-600'}`}></div>
                </div>
            </div>
        </Html>
      )}
    </group>
  );
};