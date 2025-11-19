import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { easing } from 'maath';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface CameraRigProps {
  selectedPosition: [number, number, number] | null;
  selectedScale: [number, number, number] | null;
}

export const CameraRig: React.FC<CameraRigProps> = ({ selectedPosition, selectedScale }) => {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const [isTransitioning, setTransitioning] = useState(false);
  const previousSelection = useRef<string | null>(null);
  
  // Default camera state
  const defaultTarget = new Vector3(0, 0, 0);

  useEffect(() => {
    const currentSelString = selectedPosition ? selectedPosition.toString() : 'null';
    if (currentSelString !== previousSelection.current) {
      setTransitioning(true);
      previousSelection.current = currentSelString;
      
      // Stop transitioning after a fixed time to allow user control
      const timer = setTimeout(() => {
        setTransitioning(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [selectedPosition]);

  useFrame((state, delta) => {
    // SAFETY CHECK: Do not run logic if controls aren't ready
    if (!controls.current) return;

    if (selectedPosition && selectedScale) {
      const targetVector = new Vector3(...selectedPosition);
      
      // Always smooth damp the look-at target so we stay focused on the object
      easing.damp3(controls.current.target, targetVector, 0.8, delta);

      // Only force camera position during the initial snap transition
      if (isTransitioning) {
        // Calculate optimal viewing position
        const maxDim = Math.max(selectedScale[0], selectedScale[1], selectedScale[2]);
        // Determine offset based on object type/shape logic or just generic
        const offset = new Vector3(3 + maxDim, 2 + maxDim, 4 + maxDim); 
        const camTargetPos = targetVector.clone().add(offset);
        
        easing.damp3(state.camera.position, camTargetPos, 0.8, delta);
      }
    } else {
      // When nothing is selected, drift target back to center
      easing.damp3(controls.current.target, defaultTarget, 1.5, delta);
    }
  });

  return (
    <OrbitControls 
      ref={controls} 
      makeDefault 
      minPolarAngle={0} 
      maxPolarAngle={Math.PI / 2 - 0.05} // Don't go below ground
      enablePan={true}
      zoomSpeed={0.5}
      rotateSpeed={0.5}
      dampingFactor={0.05}
    />
  );
};