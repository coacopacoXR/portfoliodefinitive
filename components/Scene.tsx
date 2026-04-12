import React, { Suspense } from 'react';
import { PortfolioItem } from '../types';
import { Artifact } from './Artifact';
import { CameraRig } from './CameraRig';
import { Line } from '@react-three/drei';

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
  activeFilter: string | null;
}

// ---- TE / Nothing Phone platform ----------------------------------------

function ring(radius: number, segments = 128): [number, number, number][] {
  return Array.from({ length: segments + 1 }, (_, i) => {
    const a = (i / segments) * Math.PI * 2;
    return [Math.cos(a) * radius, 0, Math.sin(a) * radius];
  });
}

function TEPlatform() {
  return (
    <group position={[0, -3.5, 0]}>
      {/* Outer dashed ring */}
      <Line
        points={ring(1.9)}
        color="#a09d98"
        lineWidth={1.2}
        dashed
        dashSize={0.13}
        gapSize={0.10}
      />
      {/* Inner dashed ring — tighter spacing, quieter */}
      <Line
        points={ring(1.6)}
        color="#c2bfba"
        lineWidth={0.8}
        dashed
        dashSize={0.08}
        gapSize={0.14}
      />
    </group>
  );
}

// --------------------------------------------------------------------------

export const Scene: React.FC<SceneProps> = ({
  items, selectedId, onSelect, onHover, isHackerMode, introComplete,
  deckMode, setDeckMode, focusedIndex, setFocusedIndex, activeFilter
}) => {
  const selectedItem = items.find(i => i.id === selectedId);

  return (
    <>
      <Suspense fallback={null}>
        {/* Background */}
        {isHackerMode ? (
            <color attach="background" args={['#050505']} />
        ) : (
            <color attach="background" args={['#f0f0f0']} />
        )}

        {/* Lighting */}
        <ambientLight intensity={isHackerMode ? 0.3 : 2.2} color={isHackerMode ? "#00ff00" : "#ffffff"} />
        <directionalLight position={[5, 8, 5]} intensity={isHackerMode ? 0.4 : 0.4} color={isHackerMode ? "#00ff00" : "#ffffff"} />
        <directionalLight position={[-5, -4, -5]} intensity={0.2} color="#ffffff" />

        {/* Platform */}
        {!isHackerMode && <TEPlatform />}

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
              activeFilter={activeFilter}
            />
          ))}
        </group>


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