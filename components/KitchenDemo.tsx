import React, { useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Simulation constants
// ---------------------------------------------------------------------------

const NODES = [
  { id: 'orders',  label: 'Orders',  x: 10,  color: '#f97316' },
  { id: 'prep',    label: 'Prep',    x: 103, color: '#818cf8' },
  { id: 'cooking', label: 'Cook',    x: 196, color: '#4ade80' },
  { id: 'plating', label: 'Plate',   x: 289, color: '#fb923c' },
  { id: 'quality', label: 'QA',      x: 382, color: '#f43f5e' },
  { id: 'served',  label: 'Served',  x: 475, color: '#a78bfa' },
] as const;

type NodeId = (typeof NODES)[number]['id'];

const PIPELINE: NodeId[] = ['orders', 'prep', 'cooking', 'plating', 'quality', 'served'];

const DURATIONS: Record<NodeId, number> = {
  orders:  900,
  prep:    2000,
  cooking: 3200,
  plating: 1300,
  quality: 700,
  served:  400,
};

const REJECT_RATE = 0.15; // 15% of QA checks → back to prep

const NODE_Y   = 68;
const DOT_R    = 4;
const CANVAS_W = 535;
const CANVAS_H = 130;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Dot {
  id: number;
  fromX: number;
  toX: number;
  startTime: number;
  duration: number;
  fromNode: NodeId;
  toNode: NodeId;
  color: string;
  rejected?: boolean;
}

type QueueState = Record<NodeId, number>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let uid = 0;
const nodeX = (id: NodeId) => NODES.find(n => n.id === id)!.x + 24;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function KitchenDemo() {
  const [running, setRunning] = useState(true);
  const [queues, setQueues] = useState<QueueState>({
    orders: 0, prep: 0, cooking: 0, plating: 0, quality: 0, served: 0,
  });
  const [served, setServed]   = useState(0);
  const [rejected, setRejected] = useState(0);
  const [dots, setDots]       = useState<Dot[]>([]);
  const [tick, setTick]       = useState(0); // drives dot SVG re-render

  const runningRef          = useRef(running);
  const dotsRef             = useRef<Dot[]>([]);
  const rafRef              = useRef<number>(0);
  const servedTsRef         = useRef<number[]>([]); // timestamps for throughput
  const servedCountRef      = useRef(0);
  const rejectedCountRef    = useRef(0);

  runningRef.current = running;
  dotsRef.current    = dots;

  // Smooth re-render for dot positions (60 fps target)
  useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 40);
    return () => clearInterval(id);
  }, []);

  // Spawn orders
  useEffect(() => {
    if (!running) return;
    const spawn = () => {
      if (!runningRef.current) return;
      const from: NodeId = 'orders';
      const to: NodeId   = 'prep';
      const dot: Dot = {
        id: uid++, fromX: nodeX(from), toX: nodeX(to),
        startTime: performance.now(), duration: DURATIONS[from],
        fromNode: from, toNode: to,
        color: NODES.find(n => n.id === from)!.color,
      };
      setDots(prev => [...prev, dot]);
      setQueues(prev => ({ ...prev, [from]: prev[from] + 1 }));
    };
    spawn();
    const iv = setInterval(spawn, 1800);
    return () => clearInterval(iv);
  }, [running]);

  // Simulation tick
  useEffect(() => {
    const loop = () => {
      const now    = performance.now();
      const active: Dot[] = [];
      const done:   Dot[] = [];

      for (const d of dotsRef.current) {
        (now - d.startTime >= d.duration ? done : active).push(d);
      }

      if (done.length > 0) {
        const spawned: Dot[] = [];
        const deltas: Partial<Record<NodeId, number>> = {};
        let newServed   = 0;
        let newRejected = 0;

        for (const dot of done) {
          // dot's fromNode queue decreases (item leaving that stage)
          deltas[dot.fromNode] = (deltas[dot.fromNode] ?? 0) - 1;

          if (dot.toNode === 'quality') {
            // Quality gate — chance of rejection
            if (Math.random() < REJECT_RATE) {
              newRejected++;
              // Arc backward to prep
              spawned.push({
                id: uid++, fromX: nodeX('quality'), toX: nodeX('prep'),
                startTime: now, duration: 1400,
                fromNode: 'quality', toNode: 'prep',
                color: '#f43f5e', rejected: true,
              });
              deltas['quality'] = (deltas['quality'] ?? 0) + 1;
            } else {
              // Pass QA → plate → serve path
              spawned.push({
                id: uid++, fromX: nodeX('quality'), toX: nodeX('served'),
                startTime: now, duration: DURATIONS['quality'],
                fromNode: 'quality', toNode: 'served',
                color: NODES.find(n => n.id === 'quality')!.color,
              });
              deltas['quality'] = (deltas['quality'] ?? 0) + 1;
            }
          } else {
            const idx = PIPELINE.indexOf(dot.toNode);
            if (idx < PIPELINE.length - 1) {
              const nFrom = dot.toNode;
              const nTo   = PIPELINE[idx + 1];
              spawned.push({
                id: uid++, fromX: nodeX(nFrom), toX: nodeX(nTo),
                startTime: now, duration: DURATIONS[nFrom],
                fromNode: nFrom, toNode: nTo,
                color: NODES.find(n => n.id === nFrom)!.color,
              });
              deltas[nFrom] = (deltas[nFrom] ?? 0) + 1;
            } else {
              // Reached 'served'
              newServed++;
              servedTsRef.current.push(now);
              servedCountRef.current += 1;
            }
          }
        }

        if (newServed > 0)   setServed(s => s + newServed);
        if (newRejected > 0) { setRejected(r => r + newRejected); rejectedCountRef.current += newRejected; }

        setDots([...active, ...spawned]);
        setQueues(prev => {
          const next = { ...prev };
          for (const [k, v] of Object.entries(deltas)) {
            next[k as NodeId] = Math.max(0, (next[k as NodeId] ?? 0) + (v as number));
          }
          // Keep served node showing total served count
          next.served = servedCountRef.current;
          return next;
        });
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Compute dot SVG positions (runs on tick)
  const dotPositions = dots.map(dot => {
    const elapsed = Math.min(performance.now() - dot.startTime, dot.duration);
    const t = elapsed / dot.duration;
    const cx = dot.fromX + (dot.toX - dot.fromX) * t;
    // Rejected dots arc upward
    const cy = dot.rejected ? NODE_Y - Math.sin(t * Math.PI) * 22 : NODE_Y;
    return { ...dot, cx, cy };
  });

  // Throughput: orders served per minute (30-second rolling window)
  const now30 = performance.now();
  servedTsRef.current = servedTsRef.current.filter(t => now30 - t < 30000);
  const throughput = parseFloat(((servedTsRef.current.length / 30) * 60).toFixed(1));

  // Stats
  const total       = served + rejected;
  const rejectPct   = total > 0 ? Math.round((rejected / total) * 100) : 0;
  const efficiency  = 100 - rejectPct;

  // Bottleneck: non-terminal node with highest queue
  const bottleneck = (Object.entries(queues) as [NodeId, number][])
    .filter(([id]) => id !== 'served' && id !== 'orders')
    .sort(([, a], [, b]) => b - a)[0];

  // Bar chart max
  const maxQ = Math.max(1, ...Object.values(queues));

  return (
    <div className="mt-6 border border-white/10 bg-white/5">

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`} />
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">
            Kitchen DES — Simulated
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-white/40">
            Served: <span className="text-white font-bold">{served}</span>
          </span>
          <button
            onClick={() => setRunning(r => !r)}
            className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors
              ${running ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/70 border border-white/20'}`}
          >
            {running ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Pipeline SVG */}
      <div className="px-3 pt-3 overflow-hidden">
        <svg width="100%" viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} className="overflow-visible">

          {/* Connection lines */}
          {PIPELINE.slice(0, -1).map((id, i) => {
            const x1 = nodeX(id);
            const x2 = nodeX(PIPELINE[i + 1]);
            return (
              <line key={id} x1={x1} y1={NODE_Y} x2={x2} y2={NODE_Y}
                stroke="#2a2a2a" strokeWidth={1.5} strokeDasharray="4 3" />
            );
          })}

          {/* Rejection arc (dashed curve back from QA to Prep) */}
          <path
            d={`M ${nodeX('quality')} ${NODE_Y - 8} C ${nodeX('quality')} ${NODE_Y - 38} ${nodeX('prep')} ${NODE_Y - 38} ${nodeX('prep')} ${NODE_Y - 8}`}
            fill="none" stroke="#f43f5e" strokeWidth={0.8} strokeDasharray="3 3" opacity={0.25}
          />
          <text x={(nodeX('quality') + nodeX('prep')) / 2} y={NODE_Y - 34}
            textAnchor="middle" fontSize={6.5} fill="#f43f5e" opacity={0.45} fontFamily="monospace">
            {REJECT_RATE * 100}% reject
          </text>

          {/* Nodes */}
          {NODES.map(node => {
            const q    = queues[node.id];
            const isBn = bottleneck?.[0] === node.id;
            return (
              <g key={node.id} transform={`translate(${node.x}, ${NODE_Y - 22})`}>
                <rect width={48} height={44} rx={3}
                  fill="#1a1a1a"
                  stroke={isBn ? '#ef4444' : node.color}
                  strokeWidth={isBn ? 2 : 1.5}
                />
                {isBn && (
                  <rect width={48} height={44} rx={3}
                    fill="#ef4444" opacity={0.06}
                  />
                )}
                <text x={24} y={14} textAnchor="middle" fontSize={7.5}
                  fill={node.color} fontWeight="bold" fontFamily="monospace">
                  {node.label.toUpperCase()}
                </text>
                <text x={24} y={30} textAnchor="middle" fontSize={14}
                  fill={q > 0 ? node.color : '#444'} fontWeight="bold" fontFamily="monospace">
                  {q}
                </text>
                <text x={24} y={42} textAnchor="middle" fontSize={6}
                  fill={node.id === 'served' ? '#666' : '#444'} fontFamily="monospace">
                  {node.id === 'served' ? 'total' : 'queue'}
                </text>
              </g>
            );
          })}

          {/* Animated dots */}
          {dotPositions.map(dot => (
            <g key={dot.id}>
              {dot.rejected && (
                <circle cx={dot.cx} cy={dot.cy} r={DOT_R + 2}
                  fill="none" stroke="#f43f5e" strokeWidth={1} opacity={0.4} />
              )}
              <circle cx={dot.cx} cy={dot.cy} r={DOT_R}
                fill={dot.color} opacity={dot.rejected ? 0.95 : 0.85} />
            </g>
          ))}

          <text x={4} y={NODE_Y + 26} fontSize={6.5} fill="#444" fontFamily="monospace">
            flow →
          </text>
        </svg>
      </div>

      {/* Data Dashboard */}
      <div className="px-3 pb-3 mt-2 grid grid-cols-3 gap-2">

        {/* Queue Depths */}
        <div className="col-span-1 border border-white/8 bg-white/3 px-2.5 py-2">
          <p className="text-[7px] font-mono uppercase tracking-widest text-white/30 mb-2">Queue Depth</p>
          <div className="flex flex-col gap-1.5">
            {NODES.filter(n => n.id !== 'orders').map(node => {
              const q = queues[node.id];
              const pct = (q / maxQ) * 100;
              return (
                <div key={node.id} className="flex items-center gap-1.5">
                  <span className="text-[7px] font-mono text-white/30 w-10 flex-shrink-0">{node.label}</span>
                  <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, background: node.color, opacity: q > 0 ? 1 : 0.2 }} />
                  </div>
                  <span className="text-[7px] font-mono w-3 text-right"
                    style={{ color: q > 0 ? node.color : '#444' }}>{q}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Throughput */}
        <div className="col-span-1 border border-white/8 bg-white/3 px-2.5 py-2 flex flex-col justify-between">
          <p className="text-[7px] font-mono uppercase tracking-widest text-white/30 mb-1">Throughput</p>
          <div>
            <p className="text-2xl font-bold font-mono text-white leading-none">{throughput}</p>
            <p className="text-[7px] font-mono text-white/25 mt-0.5">orders / min</p>
          </div>
          <div className="mt-2">
            <p className="text-[7px] font-mono text-white/30 mb-1">Cycle time est.</p>
            <p className="text-[10px] font-mono text-white/60">
              ~{((DURATIONS.prep + DURATIONS.cooking + DURATIONS.plating + DURATIONS.quality) / 1000).toFixed(1)}s
            </p>
          </div>
        </div>

        {/* System health */}
        <div className="col-span-1 border border-white/8 bg-white/3 px-2.5 py-2 flex flex-col gap-2">
          <p className="text-[7px] font-mono uppercase tracking-widest text-white/30">System</p>
          <div>
            <p className="text-[7px] font-mono text-white/30">Bottleneck</p>
            <p className="text-[10px] font-bold font-mono"
              style={{ color: bottleneck ? NODES.find(n => n.id === bottleneck[0])?.color : '#444' }}>
              {bottleneck && bottleneck[1] > 0
                ? NODES.find(n => n.id === bottleneck[0])?.label.toUpperCase()
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-[7px] font-mono text-white/30">Reject rate</p>
            <p className="text-[10px] font-bold font-mono"
              style={{ color: rejectPct > 20 ? '#f43f5e' : rejectPct > 10 ? '#fb923c' : '#4ade80' }}>
              {rejectPct}%
            </p>
          </div>
          <div>
            <p className="text-[7px] font-mono text-white/30">Efficiency</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${efficiency}%`, background: efficiency > 85 ? '#4ade80' : efficiency > 70 ? '#fb923c' : '#f43f5e' }} />
              </div>
              <span className="text-[7px] font-mono text-white/40">{efficiency}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-white/10">
        <p className="text-[8px] font-mono text-white/25 uppercase tracking-widest">
          Concept visualizer — simulated data only · not the actual application
        </p>
      </div>
    </div>
  );
}
