import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3, MOUSE } from 'three';
import { easing } from 'maath';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// Pixels of trackpad horizontal drag before we treat it as "pan intent"
const TRACKPAD_PAN_THRESHOLD = 3;

interface CameraRigProps {
  selectedPosition: [number, number, number] | null;
  selectedScale: [number, number, number] | null;
  itemsCount: number;
  setDeckMode: (val: boolean) => void;
  setFocusedIndex: (fn: (prev: number) => number) => void;
}

export const CameraRig: React.FC<CameraRigProps> = ({ 
  selectedPosition, selectedScale, itemsCount, setDeckMode, setFocusedIndex 
}) => {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, gl } = useThree();
  const [isTransitioning, setTransitioning] = useState(false);
  const previousSelection = useRef<string | null>(null);
  const scrollAccumulator = useRef(0);
  
  // --- SCROLL DECK LOGIC ---
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // STOP PROPAGATION to prevent OrbitControls from zooming
      e.stopPropagation();

      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      // Trackpad horizontal swipe → pan camera
      if (absX > TRACKPAD_PAN_THRESHOLD && absX > absY * 0.5) {
        const panSpeed = e.deltaMode === 0 ? 0.015 : 0.5; // pixel mode vs line mode
        const right = new Vector3();
        right.setFromMatrixColumn(camera.matrixWorld, 0);
        right.multiplyScalar(e.deltaX * panSpeed);
        camera.position.add(right);
        if (controls.current) {
          controls.current.target.add(right);
          controls.current.update();
        }
        return;
      }

      // Vertical scroll → Deck Mode
      setDeckMode(true);

      scrollAccumulator.current += e.deltaY;
      const threshold = 60;

      if (Math.abs(scrollAccumulator.current) > threshold) {
        if (scrollAccumulator.current > 0) {
          setFocusedIndex((prev) => (prev + 1) % itemsCount);
        } else {
          setFocusedIndex((prev) => (prev - 1 + itemsCount) % itemsCount);
        }
        scrollAccumulator.current = 0;
      }
    };

    // Attach listener to the canvas DOM element in CAPTURE phase to intercept before OrbitControls
    const canvasEl = gl.domElement;
    canvasEl.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    return () => {
      canvasEl.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, [gl, camera, controls, itemsCount, setDeckMode, setFocusedIndex]);

  // --- ORBIT CONTROLS RESET ---
  const handleStart = () => {
    // If user starts panning/rotating, exit deck mode
    setDeckMode(false);
  };
  
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
        
        // Since items are arranged in a sphere facing 0,0,0, the "Normal" is ItemPos normalized.
        const normal = targetVector.clone().normalize();
        // Position camera in front of the item (towards the origin)
        const camPos = targetVector.clone().add(normal.multiplyScalar(4 + maxDim));

        easing.damp3(state.camera.position, camPos, 0.8, delta);
      }
    } 
  });

  return (
    <OrbitControls 
      ref={controls} 
      makeDefault 
      minPolarAngle={0} 
      maxPolarAngle={Math.PI - 0.2}
      enablePan={true}
      panSpeed={1}
      zoomSpeed={1}
      rotateSpeed={0.6}
      enableDamping={false} 
      minDistance={0.1}
      enableZoom={true} // Must be true for Mouse Button Zoom (Dolly) to work
      mouseButtons={{
        LEFT: MOUSE.ROTATE,
        MIDDLE: MOUSE.PAN,
        RIGHT: MOUSE.DOLLY // Map Right Click to Zoom
      }}
      onStart={handleStart} 
    />
  );
};