import React, { Suspense } from 'react';
import { Environment, ContactShadows } from '@react-three/drei';
import { PortfolioItem } from '../types';
import { Artifact } from './Artifact';
import { CameraRig } from './CameraRig';

interface SceneProps {
  items: PortfolioItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  isHackerMode: boolean;
  introComplete: boolean;
  deckMode: boolean;
  setDeckMode: (val: boolean) => void;
  focusedIndex: number;
  setFocusedIndex: (val: any) => void;
}

export const Scene: React.FC<SceneProps> = ({ 
  items, selectedId, onSelect, onHover, isHackerMode, introComplete,
  deckMode, setDeckMode, focusedIndex, setFocusedIndex
}) => {
  const selectedItem = items.find(i => i.id === selectedId);

  return (
    <>
      <Suspense fallback={null}>
        {/* Dynamic Background for Hacker Mode */}
        {isHackerMode ? (
            <color attach="background" args={['#050505']} />
        ) : (
            // Studio Lighting for Normal Mode
            <Environment preset="studio" blur={0.8} />
        )}
        
        {/* Additional directional light for crisp shadows - Reduced Intensity */}
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={isHackerMode ? 0.5 : 1.0} 
          color={isHackerMode ? "#00ff00" : "#ffffff"}
          castShadow 
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0001}
        />
        {/* Increased Ambient to soften shadows */}
        <ambientLight intensity={isHackerMode ? 0.2 : 0.6} />

        {/* Artifacts (Projects & Publications) */}
        <group>
          {items.map((item) => (
            <Artifact
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              isAnySelected={selectedId !== null}
              onSelect={() => onSelect(selectedId === item.id ? null : item.id)}
              onHover={(hover) => onHover(hover ? item.id : null)}
              isHackerMode={isHackerMode}
              introComplete={introComplete}
              deckMode={deckMode}
              focusedIndex={focusedIndex}
            />
          ))}
        </group>

        {/* Soft contact shadows for grounding */}
        {!isHackerMode && (
            <ContactShadows 
            resolution={1024} 
            scale={50} 
            blur={2.5} 
            opacity={0.2} 
            far={10} 
            color="#a3a3a3" 
            />
        )}

        {/* Camera Logic */}
        <CameraRig 
          selectedPosition={selectedItem ? selectedItem.position : null}
          selectedScale={selectedItem ? selectedItem.scale : null}
          itemsCount={items.length}
          setDeckMode={setDeckMode}
          setFocusedIndex={setFocusedIndex}
        />
      </Suspense>
    </>
  );
};