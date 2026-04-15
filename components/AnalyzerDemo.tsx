import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// Synthetic data matching the real app's structure
// ---------------------------------------------------------------------------

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const UNITS: Record<string, { data: number[]; color: string }> = {
  'ICU':        { data: [88,90,87,91,89,92,90,88,91,93,90,92], color: '#f97316' },
  'Emergency':  { data: [74,76,72,75,78,73,76,79,75,77,80,78], color: '#818cf8' },
  'Surgery':    { data: [93,94,91,93,95,92,94,96,93,95,94,96], color: '#4ade80' },
  'Pediatrics': { data: [85,83,86,84,87,85,88,86,84,87,85,88], color: '#fb923c' },
};

const ZONES = [
  { label: 'Patient Rooms',   score: 91, color: '#f97316' },
  { label: 'Corridors',       score: 83, color: '#818cf8' },
  { label: 'Bathrooms',       score: 76, color: '#4ade80' },
  { label: 'Operating Areas', score: 95, color: '#fb923c' },
  { label: 'Common Areas',    score: 88, color: '#a78bfa' },
];

// ---------------------------------------------------------------------------
// SVG line chart helpers
// ---------------------------------------------------------------------------

const W = 354, H = 130;
const PAD = { t: 8, r: 8, b: 22, l: 26 };
const CW = W - PAD.l - PAD.r;
const CH = H - PAD.t - PAD.b;
const MIN_Y = 65, MAX_Y = 100;

const sx = (i: number) => PAD.l + (i / (MONTHS.length - 1)) * CW;
const sy = (v: number) => PAD.t + CH - ((v - MIN_Y) / (MAX_Y - MIN_Y)) * CH;

function pathD(vals: number[]) {
  const pts = vals.map((v, i) => [sx(i), sy(v)] as [number, number]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const cx = (pts[i - 1][0] + pts[i][0]) / 2;
    d += ` C ${cx} ${pts[i - 1][1]} ${cx} ${pts[i][1]} ${pts[i][0]} ${pts[i][1]}`;
  }
  return d;
}

// ---------------------------------------------------------------------------
// Line chart
// ---------------------------------------------------------------------------

function LineChart({ activeUnit }: { activeUnit: string | null }) {
  const [hover, setHover] = useState<{ month: number; unit: string; value: number; x: number; y: number } | null>(null);

  const yTicks = [70, 80, 90, 100];

  return (
    <div className="relative select-none">
      <svg width={W} height={H} onMouseLeave={() => setHover(null)}>
        {/* Y grid lines + labels */}
        {yTicks.map(t => (
          <g key={t}>
            <line
              x1={PAD.l} y1={sy(t)} x2={PAD.l + CW} y2={sy(t)}
              stroke="#333" strokeWidth={0.5} strokeDasharray="3 3"
            />
            <text x={PAD.l - 4} y={sy(t) + 3.5} textAnchor="end" fontSize={7} fill="#666">{t}</text>
          </g>
        ))}

        {/* X labels */}
        {MONTHS.map((m, i) => (
          <text key={i} x={sx(i)} y={H - 4} textAnchor="middle" fontSize={7} fill="#666">{m}</text>
        ))}

        {/* Lines */}
        {Object.entries(UNITS).map(([unit, { data, color }]) => {
          const dimmed = activeUnit !== null && activeUnit !== unit;
          return (
            <path
              key={unit}
              d={pathD(data)}
              fill="none"
              stroke={color}
              strokeWidth={dimmed ? 0.8 : 1.8}
              opacity={dimmed ? 0.18 : 1}
              strokeLinecap="round"
            />
          );
        })}

        {/* Hit-area dots */}
        {Object.entries(UNITS).map(([unit, { data, color }]) => {
          const dimmed = activeUnit !== null && activeUnit !== unit;
          if (dimmed) return null;
          return data.map((v, i) => (
            <circle
              key={`${unit}-${i}`}
              cx={sx(i)} cy={sy(v)} r={8}
              fill="transparent"
              onMouseEnter={() => setHover({ month: i, unit, value: v, x: sx(i), y: sy(v) })}
            />
          ));
        })}

        {/* Highlighted dot */}
        {hover && (
          <circle cx={hover.x} cy={hover.y} r={3.5}
            fill={UNITS[hover.unit]?.color ?? '#888'} stroke="#0f0f0f" strokeWidth={1.2} />
        )}
      </svg>

      {/* Tooltip */}
      {hover && (
        <div
          className="absolute pointer-events-none bg-[#1a1a1a] border border-white/20 shadow-md px-2.5 py-1.5 text-[10px] font-mono"
          style={{ left: hover.x + 8, top: hover.y - 28, transform: hover.x > W * 0.7 ? 'translateX(-110%)' : undefined }}
        >
          <span className="font-bold text-white">{hover.unit}</span>
          <span className="text-white/30 mx-1.5">·</span>
          <span className="text-white/60">{MONTHS[hover.month]}</span>
          <span className="text-white/30 mx-1.5">·</span>
          <span style={{ color: UNITS[hover.unit]?.color }} className="font-bold">{hover.value}%</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Horizontal bar chart
// ---------------------------------------------------------------------------

function BarChart() {
  const [hovered, setHovered] = useState<string | null>(null);
  const max = Math.max(...ZONES.map(z => z.score));

  return (
    <div className="flex flex-col gap-2.5 py-1">
      {ZONES.map(({ label, score, color }) => (
        <div
          key={label}
          className="flex items-center gap-3 cursor-default"
          onMouseEnter={() => setHovered(label)}
          onMouseLeave={() => setHovered(null)}
        >
          <span className="text-[9px] font-mono text-white/50 w-28 flex-shrink-0 truncate">{label}</span>
          <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(score / max) * 100}%`,
                background: color,
                opacity: hovered && hovered !== label ? 0.3 : 1,
              }}
            />
          </div>
          <span className="text-[10px] font-bold font-mono w-8 text-right"
            style={{ color: hovered === label ? color : 'rgba(255,255,255,0.3)' }}>
            {score}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main demo
// ---------------------------------------------------------------------------

export function AnalyzerDemo() {
  const [tab, setTab] = useState<'trend' | 'zones'>('trend');
  const [activeUnit, setActiveUnit] = useState<string | null>(null);

  return (
    <div className="mt-6 border border-white/10 bg-white/5">
      {/* Demo header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">
            Live Preview — Simulated Data
          </span>
        </div>
        <div className="flex gap-px">
          {(['trend', 'zones'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors
                ${tab === t ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              {t === 'trend' ? 'Over Time' : 'By Zone'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3">
        {tab === 'trend' && (
          <>
            <LineChart activeUnit={activeUnit} />
            {/* Unit legend / toggles */}
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2">
              {Object.entries(UNITS).map(([unit, { color }]) => (
                <button
                  key={unit}
                  onClick={() => setActiveUnit(prev => prev === unit ? null : unit)}
                  className="flex items-center gap-1.5 text-[9px] font-mono transition-opacity"
                  style={{ opacity: activeUnit && activeUnit !== unit ? 0.35 : 1 }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="text-white/60">{unit}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {tab === 'zones' && <BarChart />}
      </div>
      <div className="px-3 py-2 border-t border-white/10">
        <p className="text-[8px] font-mono text-white/25 uppercase tracking-widest">
          Concept visualizer — simulated data only · not the actual application
        </p>
      </div>
    </div>
  );
}
