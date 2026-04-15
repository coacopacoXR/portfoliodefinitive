import React, { useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const AGENTS = [
  { id: 'A1', label: 'Presenter', color: '#f97316', role: 'PRESENTER' },
  { id: 'A2', label: 'Reviewer',  color: '#818cf8', role: 'REVIEWER'  },
  { id: 'A3', label: 'Observer',  color: '#4ade80', role: 'OBSERVER'  },
  { id: 'A4', label: 'Observer',  color: '#fb923c', role: 'OBSERVER'  },
] as const;

type AgentId = (typeof AGENTS)[number]['id'];

const STATES = ['IDLE', 'MOVING', 'INSPECTING', 'DISCUSSING', 'FOLLOWING'] as const;
type AgentState = (typeof STATES)[number];

const INSIGHTS: { type: 'RISK' | 'RATIONALE' | 'ACTION'; text: string }[] = [
  { type: 'RISK',      text: 'Stress concentration at joint — review load path' },
  { type: 'RATIONALE', text: 'Chosen material balances weight and rigidity' },
  { type: 'ACTION',    text: 'Update FEM mesh density at bracket region' },
  { type: 'RISK',      text: 'Tolerance stack-up may cause interference' },
  { type: 'RATIONALE', text: 'Assembly sequence preserves surface finish' },
  { type: 'ACTION',    text: 'Schedule ergonomic review of grip geometry' },
  { type: 'RISK',      text: 'Thermal expansion not accounted in housing' },
  { type: 'ACTION',    text: 'Add datum reference for CMM inspection' },
  { type: 'RATIONALE', text: 'Symmetry reduces tooling complexity by 40%' },
];

const TYPE_COLOR: Record<string, string> = {
  RISK:      '#f97316',
  RATIONALE: '#818cf8',
  ACTION:    '#4ade80',
};

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

const CX = 130, CY = 80, R_ORBIT = 58;
const agentAngle = (idx: number, offset: number) => offset + (idx / AGENTS.length) * Math.PI * 2;
const agentPos = (idx: number, offset: number) => ({
  x: CX + Math.cos(agentAngle(idx, offset)) * R_ORBIT,
  y: CY + Math.sin(agentAngle(idx, offset)) * R_ORBIT,
});

// Attention heat points on the "model" (central hexagon vertices)
const HEAT_POINTS = Array.from({ length: 12 }, (_, i) => ({
  x: CX + Math.cos((i / 12) * Math.PI * 2) * 20,
  y: CY + Math.sin((i / 12) * Math.PI * 2) * 20,
}));

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ViewpointDemo() {
  const [offset, setOffset] = useState(0);
  const [agentStates, setAgentStates] = useState<Record<AgentId, AgentState>>({
    A1: 'INSPECTING', A2: 'REVIEWING' as any, A3: 'IDLE', A4: 'MOVING',
  });
  const [heatIdx, setHeatIdx] = useState(0);
  const [insights, setInsights] = useState<typeof INSIGHTS[number][]>([]);
  const [insightPtr, setInsightPtr] = useState(0);
  const [focusAgent, setFocusAgent] = useState<AgentId | null>(null);

  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const offsetRef = useRef(0);

  // Orbit animation
  useEffect(() => {
    const tick = (now: number) => {
      const dt = now - (lastRef.current || now);
      lastRef.current = now;
      offsetRef.current += dt * 0.0003;
      setOffset(offsetRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Rotate heat focus
  useEffect(() => {
    const t = setInterval(() => setHeatIdx(h => (h + 1) % HEAT_POINTS.length), 600);
    return () => clearInterval(t);
  }, []);

  // Update agent states randomly
  useEffect(() => {
    const t = setInterval(() => {
      const id = AGENTS[Math.floor(Math.random() * AGENTS.length)].id as AgentId;
      const state = STATES[Math.floor(Math.random() * STATES.length)];
      setAgentStates(prev => ({ ...prev, [id]: state }));
    }, 1400);
    return () => clearInterval(t);
  }, []);

  // Emit insights
  useEffect(() => {
    const t = setInterval(() => {
      setInsights(prev => {
        const next = [INSIGHTS[insightPtr % INSIGHTS.length], ...prev].slice(0, 4);
        return next;
      });
      setInsightPtr(p => p + 1);
    }, 2200);
    return () => clearInterval(t);
  }, [insightPtr]);

  return (
    <div className="mt-6 border border-white/10 bg-white/5">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">
            Concept Demo — Simulated Session
          </span>
        </div>
        <span className="text-[9px] font-mono text-white/40">
          {AGENTS.length} agents · attention tracking
        </span>
      </div>

      <div className="flex divide-x divide-white/10">
        {/* Left: scene view */}
        <div className="p-3 flex-shrink-0">
          <svg width={260} height={160} className="overflow-visible">
            {/* Orbit ring */}
            <circle cx={CX} cy={CY} r={R_ORBIT} fill="none" stroke="#333"
              strokeWidth={0.8} strokeDasharray="3 3" />

            {/* Attention heat */}
            {HEAT_POINTS.map((p, i) => {
              const dist = Math.abs(i - heatIdx);
              const intensity = Math.max(0, 1 - dist / 3);
              if (intensity < 0.05) return null;
              return (
                <circle key={i} cx={p.x} cy={p.y} r={5 + intensity * 6}
                  fill="#f97316" opacity={intensity * 0.25} />
              );
            })}

            {/* Central model — hexagon */}
            {Array.from({ length: 6 }, (_, i) => {
              const a0 = (i / 6) * Math.PI * 2 - Math.PI / 6;
              const a1 = ((i + 1) / 6) * Math.PI * 2 - Math.PI / 6;
              const x1 = CX + Math.cos(a0) * 22, y1 = CY + Math.sin(a0) * 22;
              const x2 = CX + Math.cos(a1) * 22, y2 = CY + Math.sin(a1) * 22;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#555" strokeWidth={1.5} />;
            })}
            <text x={CX} y={CY + 4} textAnchor="middle" fontSize={7}
              fill="#555" fontFamily="monospace" fontWeight="bold">MODEL</text>

            {/* Gaze lines */}
            {AGENTS.map((agent, i) => {
              const pos = agentPos(i, offset);
              const focused = focusAgent === null || focusAgent === agent.id;
              return (
                <line key={agent.id}
                  x1={pos.x} y1={pos.y} x2={CX} y2={CY}
                  stroke={agent.color}
                  strokeWidth={focused ? 1 : 0.4}
                  opacity={focused ? 0.35 : 0.08}
                  strokeDasharray={agentStates[agent.id] === 'IDLE' ? '3 4' : 'none'}
                />
              );
            })}

            {/* Agent dots */}
            {AGENTS.map((agent, i) => {
              const pos = agentPos(i, offset);
              const focused = focusAgent === null || focusAgent === agent.id;
              const state = agentStates[agent.id];
              return (
                <g key={agent.id}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setFocusAgent(agent.id)}
                  onMouseLeave={() => setFocusAgent(null)}
                >
                  {/* Pulse ring when inspecting */}
                  {state === 'INSPECTING' && (
                    <circle cx={pos.x} cy={pos.y} r={10}
                      fill="none" stroke={agent.color} strokeWidth={0.8} opacity={0.4} />
                  )}
                  <circle cx={pos.x} cy={pos.y} r={6}
                    fill={agent.color} opacity={focused ? 1 : 0.35} />
                  <text x={pos.x} y={pos.y - 9} textAnchor="middle" fontSize={6.5}
                    fill={focused ? agent.color : '#555'} fontFamily="monospace"
                    fontWeight="bold">
                    {agent.label.toUpperCase()}
                  </text>
                  <text x={pos.x} y={pos.y + 16} textAnchor="middle" fontSize={5.5}
                    fill="#555" fontFamily="monospace">
                    {state}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right: insights stream */}
        <div className="flex-1 p-3 flex flex-col gap-1 min-w-0 justify-start">
          <span className="text-[8px] font-mono uppercase tracking-widest text-white/40 mb-1">
            AI Insights
          </span>
          {insights.length === 0 && (
            <span className="text-[9px] font-mono text-white/25 italic">Waiting for session…</span>
          )}
          {insights.map((ins, i) => (
            <div key={i}
              className="flex items-start gap-1.5 transition-opacity"
              style={{ opacity: 1 - i * 0.18 }}
            >
              <span
                className="text-[7px] font-bold font-mono px-1 py-0.5 flex-shrink-0 mt-0.5"
                style={{ background: TYPE_COLOR[ins.type] + '22', color: TYPE_COLOR[ins.type] }}
              >
                {ins.type}
              </span>
              <span className="text-[9px] text-white/60 font-mono leading-tight">{ins.text}</span>
            </div>
          ))}

          {/* Agent state legend */}
          <div className="mt-auto pt-2 border-t border-white/10 flex flex-col gap-1">
            {AGENTS.map(agent => (
              <div key={agent.id}
                className="flex items-center gap-1.5"
                onMouseEnter={() => setFocusAgent(agent.id)}
                onMouseLeave={() => setFocusAgent(null)}
                style={{ cursor: 'default', opacity: focusAgent && focusAgent !== agent.id ? 0.35 : 1 }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: agent.color }} />
                <span className="text-[8px] font-mono text-white/50 w-14">{agent.role}</span>
                <span className="text-[8px] font-mono" style={{ color: agent.color }}>
                  {agentStates[agent.id]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-3 py-2 border-t border-white/10">
        <p className="text-[8px] font-mono text-white/25 uppercase tracking-widest">
          Concept visualizer — simulated data only · not the actual application
        </p>
      </div>
    </div>
  );
}
