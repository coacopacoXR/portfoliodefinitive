import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, Html, Billboard } from '@react-three/drei';
import { motion } from 'framer-motion';
import { publicationsData } from '../data';
import { Publication } from '../types';
import * as THREE from 'three';
import { MOUSE } from 'three';

// ---------------------------------------------------------------------------
// Data setup
// ---------------------------------------------------------------------------

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];
const Y_FOR_YEAR: Record<number, number> = {
  2020: -3.0,
  2021: -1.8,
  2022: -0.6,
  2023:  0.6,
  2024:  1.8,
  2025:  3.0,
};

interface PubNode {
  pub: Publication;
  pos: [number, number, number];
  color: string;
  r: number;
  ringR: number;
  angle: number;
  year: number;
}

function buildNodes(): PubNode[] {
  const byYear: Record<number, Publication[]> = {};
  for (const pub of publicationsData) {
    if (!byYear[pub.year]) byYear[pub.year] = [];
    byYear[pub.year].push(pub);
  }

  const nodes: PubNode[] = [];
  for (const [ys, pubs] of Object.entries(byYear)) {
    const year = parseInt(ys);
    const y = Y_FOR_YEAR[year] ?? 0;
    const isArticle = (pub: Publication) =>
      pub.type === 'Article' || pub.type.toLowerCase().includes('article');

    pubs.forEach((pub, i) => {
      const angle = (i / pubs.length) * Math.PI * 2;
      const ringR = isArticle(pub) ? 3.0 : 2.5;
      nodes.push({
        pub,
        pos: [Math.cos(angle) * ringR, y, Math.sin(angle) * ringR],
        color: isArticle(pub) ? '#f97316' : '#818cf8',
        r: isArticle(pub) ? 0.16 : 0.11,
        ringR,
        angle,
        year,
      });
    });
  }
  return nodes;
}

// ---------------------------------------------------------------------------
// Font
// ---------------------------------------------------------------------------

const FONT = 'https://fonts.gstatic.com/s/courierprime/v9/u-450i2Jg9hRTEe8HkyIdTA.woff';

// ---------------------------------------------------------------------------
// Paper annotation — leader line + label, both fade with camera distance
// ---------------------------------------------------------------------------

function PaperAnnotation({ node }: { node: PubNode }) {
  const textRef    = useRef<any>(null);
  const lineMat    = useRef<THREE.LineBasicMaterial>(null);

  const title = node.pub.title.length > 40
    ? node.pub.title.slice(0, 40) + '…'
    : node.pub.title;

  const lx = Math.cos(node.angle) * (node.ringR + 0.42);
  const lz = Math.sin(node.angle) * (node.ringR + 0.42);
  const ly = node.pos[1];

  const lineGeo = useMemo(() => {
    const sx = Math.cos(node.angle) * (node.ringR + node.r + 0.06);
    const sz = Math.sin(node.angle) * (node.ringR + node.r + 0.06);
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(sx, ly, sz),
      new THREE.Vector3(lx, ly, lz),
    ]);
  }, []);

  useFrame(({ camera }) => {
    const dist = new THREE.Vector3(lx, ly, lz).distanceTo(camera.position);
    const op = THREE.MathUtils.clamp(1.15 - dist / 10, 0.05, 0.92);
    if (textRef.current) textRef.current.fillOpacity = op;
    if (lineMat.current) lineMat.current.opacity = op * 0.5;
  });

  return (
    <>
      <line geometry={lineGeo}>
        <lineBasicMaterial ref={lineMat} color={node.color} transparent opacity={0.35} />
      </line>
      <Billboard position={[lx, ly, lz]}>
        <Text
          ref={textRef}
          fontSize={0.105}
          color="#ffffff"
          fillOpacity={0.9}
          outlineWidth={0.009}
          outlineColor="#05060e"
          outlineOpacity={0.6}
          maxWidth={1.7}
          anchorX="left"
          anchorY="middle"
          font={FONT}
          position={[0.06, 0, 0]}
        >
          {title}
        </Text>
      </Billboard>
    </>
  );
}

// ---------------------------------------------------------------------------
// Paper sphere
// ---------------------------------------------------------------------------

function PaperSphere({ node, isFocused }: { node: PubNode; isFocused: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    meshRef.current.position.y =
      node.pos[1] + Math.sin(t * 0.5 + node.angle) * 0.07;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const baseIntensity = isFocused ? 4.0 : hovered ? 3.0 : 0.9 + Math.sin(t * 1.5 + node.angle * 3) * 0.35;
    mat.emissiveIntensity = baseIntensity;
  });

  const scale = isFocused ? 2.4 : hovered ? 1.7 : 1;

  return (
    <mesh
      ref={meshRef}
      position={node.pos}
      scale={scale}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <sphereGeometry args={[node.r, 20, 20]} />
      <meshStandardMaterial
        color={node.color}
        emissive={node.color}
        emissiveIntensity={isFocused ? 4.0 : 0.9}
        roughness={0.1}
        metalness={0.2}
      />
      {(hovered || isFocused) && !isFocused && (
        <Html
          center
          distanceFactor={9}
          zIndexRange={[200, 0]}
          style={{ pointerEvents: 'none', width: '280px' }}
        >
          <div style={{
            background: 'rgba(5,6,14,0.97)',
            border: `1px solid ${node.color}`,
            borderRadius: '2px',
            padding: '10px 14px',
            color: '#e8e8ea',
            fontFamily: 'monospace',
            fontSize: '11px',
            lineHeight: 1.55,
            transform: 'translate(36px, -50%)',
            boxShadow: `0 0 24px ${node.color}55`,
          }}>
            <div style={{ color: node.color, fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
              {node.year} · {node.pub.type}
            </div>
            <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '11.5px' }}>
              {node.pub.title}
            </div>
            <div style={{ color: '#888', fontSize: '10px' }}>
              {node.pub.journal}
            </div>
            {node.pub.open_access && (
              <div style={{ color: '#4ade80', fontSize: '9px', marginTop: '5px', fontWeight: 'bold', letterSpacing: '0.08em' }}>
                ◆ OPEN ACCESS
              </div>
            )}
          </div>
        </Html>
      )}
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Year ring
// ---------------------------------------------------------------------------

function YearRing({ year }: { year: number }) {
  const y = Y_FOR_YEAR[year];
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.09 + Math.sin(clock.elapsedTime * 0.25 + y) * 0.03;
  });

  const count = publicationsData.filter(p => p.year === year).length;

  return (
    <group position={[0, y, 0]}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.15, 0.007, 8, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.09} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.35, 0.005, 8, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} />
      </mesh>
      <Text
        position={[3.55, 0, 0]}
        fontSize={0.19}
        color="#555"
        anchorX="left"
        anchorY="middle"
        font={FONT}
      >
        {`${year}  ·  ${count}`}
      </Text>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Time axis
// ---------------------------------------------------------------------------

function TimeAxis() {
  return (
    <group position={[-4.6, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.010, 0.010, 7.4, 8]} />
        <meshBasicMaterial color="#3a3a4a" />
      </mesh>
      <mesh position={[0, 3.85, 0]}>
        <coneGeometry args={[0.055, 0.22, 8]} />
        <meshBasicMaterial color="#555566" />
      </mesh>
      {YEARS.map(year => (
        <group key={year} position={[0, Y_FOR_YEAR[year], 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.28, 8]} />
            <meshBasicMaterial color="#4a4a5a" />
          </mesh>
        </group>
      ))}
      <Text position={[0, 4.35, 0]} fontSize={0.15} color="#44445a" anchorX="center" anchorY="bottom" font={FONT}>TIME</Text>
      <Text position={[0, -3.95, 0]} fontSize={0.12} color="#33334a" anchorX="center" anchorY="top" font={FONT}>2020</Text>
      <Text position={[0, 3.55, 0]} fontSize={0.12} color="#33334a" anchorX="center" anchorY="bottom" font={FONT}>2025</Text>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Central spine
// ---------------------------------------------------------------------------

function Spine() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    (ref.current.material as THREE.MeshBasicMaterial).opacity =
      0.12 + Math.sin(clock.elapsedTime * 0.4) * 0.04;
  });
  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[0.005, 0.005, 7.5, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Background stars
// ---------------------------------------------------------------------------

function Stars() {
  const count = 280;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 24;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 24;
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.045} transparent opacity={0.25} sizeAttenuation />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

interface ScholarSceneProps {
  nodes: PubNode[];
  focusedIdx: number;
}

function ScholarScene({ nodes, focusedIdx }: ScholarSceneProps) {
  return (
    <>
      <color attach="background" args={['#05060e']} />
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 0, 0]} intensity={1.2} color="#5560cc" distance={12} />
      <pointLight position={[0, 4, 0]} intensity={0.4} color="#f97316" distance={10} />

      <Stars />
      <Spine />
      <TimeAxis />

      {YEARS.map(y => <YearRing key={y} year={y} />)}
      {nodes.map((n, i) => (
        <React.Fragment key={i}>
          <PaperSphere node={n} isFocused={i === focusedIdx} />
          <PaperAnnotation node={n} />
        </React.Fragment>
      ))}

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.4}
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={18}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI * 4 / 5}
        mouseButtons={{
          LEFT: MOUSE.ROTATE,
          MIDDLE: MOUSE.PAN,
          RIGHT: MOUSE.DOLLY,
        }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Overlay shell
// ---------------------------------------------------------------------------

interface Props {
  onClose: () => void;
}

export const ScholarVisualizer: React.FC<Props> = ({ onClose }) => {
  const nodes = useMemo(buildNodes, []);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const scrollAccRef = useRef(0);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const total    = publicationsData.length;
  const articles = publicationsData.filter(p =>
    p.type === 'Article' || p.type.toLowerCase().includes('article')).length;
  const conf     = total - articles;
  const oa       = publicationsData.filter(p => p.open_access).length;

  const focusedNode = nodes[focusedIdx];

  // Scroll-to-browse handler — intercept before OrbitControls
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      scrollAccRef.current += e.deltaY;
      if (Math.abs(scrollAccRef.current) > 60) {
        setFocusedIdx(prev =>
          scrollAccRef.current > 0
            ? (prev + 1) % nodes.length
            : (prev - 1 + nodes.length) % nodes.length
        );
        scrollAccRef.current = 0;
      }
    };
    el.addEventListener('wheel', handler, { passive: false, capture: true });
    return () => el.removeEventListener('wheel', handler, { capture: true } as EventListenerOptions);
  }, [nodes.length]);

  // ESC to close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[80] bg-[#05060e] flex flex-col font-typewriter"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-white/10 shrink-0">
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-gray-500 mb-1">
            Research Output · 2020 – 2025
          </p>
          <h2 className="text-white font-bold text-lg tracking-tight">
            Publication Constellation
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-[10px] text-gray-600 font-mono hidden md:block">
            Drag to rotate · right-drag to zoom · scroll to browse
          </p>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-white/20 text-white/50 hover:text-white hover:border-white/60 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={canvasContainerRef} className="flex-1 relative min-h-0">
        <Canvas camera={{ position: [0, 1, 7], fov: 52 }}>
          <ScholarScene nodes={nodes} focusedIdx={focusedIdx} />
        </Canvas>

        {/* How to read */}
        <div className="absolute bottom-6 left-6 pointer-events-none select-none border border-white/10 bg-black/60 px-6 py-5 flex flex-col gap-3.5 backdrop-blur-sm">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-gray-400">How to read</p>
          <div className="flex items-start gap-3 text-sm font-mono text-gray-300">
            <span className="text-gray-500 mt-px leading-none">↕</span>
            <span>Y-axis = time (2020 → 2025)</span>
          </div>
          <div className="flex items-start gap-3 text-sm font-mono text-gray-300">
            <span className="text-gray-500 mt-px leading-none">◎</span>
            <span>Orbit radius = paper type</span>
          </div>
          <div className="w-full h-px bg-white/5 my-0.5" />
          <div className="flex items-center gap-3 text-sm font-mono">
            <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: '#f97316', boxShadow: '0 0 10px #f97316' }} />
            <span className="text-gray-300">Journal article <span className="text-gray-500">(outer ring)</span></span>
          </div>
          <div className="flex items-center gap-3 text-sm font-mono">
            <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: '#818cf8', boxShadow: '0 0 10px #818cf8' }} />
            <span className="text-gray-300">Conference paper <span className="text-gray-500">(inner ring)</span></span>
          </div>
        </div>

        {/* Focused paper detail panel */}
        {focusedNode && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none select-none w-64 border border-white/10 bg-black/80 backdrop-blur-md px-5 py-4 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
              <span style={{ color: focusedNode.color }} className="text-[9px] font-mono font-bold uppercase tracking-widest">
                {focusedNode.year} · {focusedNode.pub.type}
              </span>
              <span className="text-[9px] font-mono text-gray-600">{focusedIdx + 1}/{nodes.length}</span>
            </div>
            <p className="text-white text-xs font-bold leading-snug">{focusedNode.pub.title}</p>
            <p className="text-gray-500 text-[10px] font-mono leading-snug">{focusedNode.pub.journal}</p>
            {focusedNode.pub.open_access && (
              <span className="text-[9px] font-mono text-green-500 font-bold tracking-widest">◆ OPEN ACCESS</span>
            )}
            <div className="mt-2 text-[9px] font-mono text-gray-700 text-center">↑ ↓ scroll to browse</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-8 py-5 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex gap-6 md:gap-10">
          {[
            { value: total,    label: 'Publications' },
            { value: articles, label: 'Journal Articles' },
            { value: conf,     label: 'Conf. Papers' },
            { value: oa,       label: 'Open Access' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-white leading-none mb-1">{value}</p>
              <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
        <a
          href="https://scholar.google.se/citations?hl=en&user=h2on66wAAAAJ&view_op=list_works&sortby=pubdate"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-6 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-orange-500 hover:text-white transition-colors whitespace-nowrap"
        >
          View on Google Scholar
          <span className="text-sm">↗</span>
        </a>
      </div>
    </motion.div>
  );
};
