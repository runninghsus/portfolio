/**
 * Illustrative scenes for the Huntington rows — architecture, not outcomes.
 * Same language as scenes.tsx: white cards on the figure ground, one red
 * accent, few words. Nothing here is real data: no products, names, numbers.
 * These three are drawn on a taller 400×340 canvas so the figure matches the
 * height of the longer text beside it.
 */
import { Card, ArrowRight, Defs, R, INK, T, type Reveal } from "./scenes";

export const BANK_H = 340; // viewBox height for the three Huntington scenes
const show: Reveal = () => ({});
const DARK = "#161513";
const S = { fontSize: 9, fontWeight: 600 } as const; // caption inside cards
const XS = { fontSize: 8, fontWeight: 600 } as const; // smaller caption
const TITLE = { fontSize: 11, fontWeight: 700 } as const; // card heading

/* --- small shared glyphs ------------------------------------------------ */
function Spark({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4 Z" fill={R} />;
}
function Agent({ x, y, r = 10, p }: { x: number; y: number; r?: number; p: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#fff" stroke={INK} strokeOpacity=".35" filter={`url(#${p}-soft)`} />
      <Spark x={x} y={y} s={r / 15} />
    </g>
  );
}
function Person({ x, y, s = 1, tone = INK }: { x: number; y: number; s?: number; tone?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="0" cy="-5" r="4" fill={tone} fillOpacity=".75" />
      <path d="M-8 8 a8 8 0 0 1 16 0 z" fill={tone} fillOpacity=".75" />
    </g>
  );
}
function DataStack({ x, y, tone = INK, s = 1 }: { x: number; y: number; tone?: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect width="14" height="4.5" rx="1.5" fill={tone} fillOpacity=".5" />
      <rect y="6.5" width="14" height="4.5" rx="1.5" fill={tone} fillOpacity=".35" />
      <rect y="13" width="14" height="4.5" rx="1.5" fill={tone} fillOpacity=".22" />
    </g>
  );
}
function Chevron({ x, y, dir = "right" }: { x: number; y: number; dir?: "right" | "down" }) {
  const d = dir === "right" ? `M${x - 3} ${y - 4} L${x + 1} ${y} L${x - 3} ${y + 4}` : `M${x - 4} ${y - 3} L${x} ${y + 1} L${x + 4} ${y - 3}`;
  return <path d={d} fill="none" stroke={INK} strokeOpacity=".6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />;
}
function Dashed({ d }: { d: string }) {
  return <path d={d} fill="none" stroke={INK} strokeOpacity=".5" strokeWidth="1.3" strokeDasharray="3 4" />;
}
function Lines({ x, y, widths, gap = 6, tone = INK, op = 0.25, h = 3 }: { x: number; y: number; widths: number[]; gap?: number; tone?: string; op?: number; h?: number }) {
  return (
    <g>
      {widths.map((w, i) => (
        <rect key={i} x={x} y={y + i * gap} width={w} height={h} rx={h / 2} fill={tone} fillOpacity={op} />
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Production ML · the lifecycle: data → model → decision → workflow,   */
/* with monitoring at three failure points underneath                  */
/* ------------------------------------------------------------------ */
export function PipelineBody({ reveal = show }: { reveal?: Reveal }) {
  const p = "pl";
  const X = [10, 104, 198, 292]; // stage cards
  const W = 82, Y = 16, H = 122;
  const MY = 164, MH = 124; // monitor band
  const auc = [0.5, 0.56, 0.52, 0.6, 0.58, 0.64, 0.62, 0.66, 0.7, 0.68];
  const base = [0.3, 0.34, 0.33, 0.36, 0.38, 0.37, 0.4, 0.41, 0.4, 0.43];
  const lift = [0.55, 0.6, 0.58, 0.66, 0.64, 0.7, 0.68, 0.74, 0.72, 0.76];
  const line = (v: number[], x0: number, dx: number, y0: number, k: number) => v.map((a, i) => `${i ? "L" : "M"}${(x0 + i * dx).toFixed(1)} ${(y0 - a * k).toFixed(1)}`).join(" ");
  const Stage = ({ i, title, children }: { i: number; title: string; children: React.ReactNode }) => (
    <Card x={X[i]} y={Y} w={W} h={H} p={p}>
      <text x="8" y="16" fill={DARK} {...TITLE}>{`${i + 1} · ${title}`}</text>
      {children}
    </Card>
  );
  return (
    <>
      <Defs p={p} />
      {/* 1 · data */}
      <g style={reveal(0)}>
        <Stage i={0} title="data">
          {[0, 1, 2, 3].map((r) => (
            <g key={r}>
              {[0, 1, 2].map((c) => (
                <rect key={c} x={8 + c * 23} y={28 + r * 12} width="20" height="9" rx="1.5" fill={INK} fillOpacity={r === 0 ? 0.35 : 0.12} />
              ))}
            </g>
          ))}
          <text x="8" y="98" fill={INK} {...S}>recurring features</text>
          <text x="8" y="111" fill={INK} {...S}>+ past outcomes</text>
        </Stage>
      </g>

      {/* 2 · models */}
      <g style={reveal(1)}>
        <ArrowRight x1={X[0] + W + 2} x2={X[1] - 3} y={Y + 60} />
        <Stage i={1} title="models">
          {Array.from({ length: 6 }).map((_, k) => {
            const x = 8 + (k % 3) * 24;
            const y = 28 + Math.floor(k / 3) * 34;
            const pr = [0.7, 0.45, 0.55, 0.35, 0.8, 0.5][k];
            return (
              <g key={k} transform={`translate(${x} ${y})`}>
                <rect width="20" height="28" rx="2.5" fill="#f5f4f2" stroke={INK} strokeOpacity=".3" />
                <path d="M3 18 q3.5 -10 7 -4 t7 -7" fill="none" stroke={INK} strokeOpacity=".5" strokeWidth="1.1" />
                <rect x="3" y="21" width="14" height="3" rx="1.5" fill={INK} fillOpacity=".15" />
                <rect x="3" y="21" width={14 * pr} height="3" rx="1.5" fill={R} />
              </g>
            );
          })}
          <text x="8" y="111" fill={INK} {...S}>per product area</text>
        </Stage>
      </g>

      {/* 3 · decision: independent outputs → one ranking layer */}
      <g style={reveal(2)}>
        <ArrowRight x1={X[1] + W + 2} x2={X[2] - 3} y={Y + 60} />
        <Stage i={2} title="decision">
          <g fill="none" stroke={INK} strokeOpacity=".5" strokeWidth="1.3">
            <path d="M10 33 H24 Q34 33 36 48" />
            <path d="M10 48 H36" />
            <path d="M10 63 H24 Q34 63 36 48" />
          </g>
          <rect x="4" y="30" width="6" height="6" rx="1.2" fill={R} />
          <rect x="4" y="45" width="6" height="6" rx="1.2" fill={R} fillOpacity=".7" />
          <rect x="4" y="60" width="6" height="6" rx="1.2" fill={R} fillOpacity=".45" />
          <rect x="37" y="32" width="8" height="32" rx="2.5" fill={INK} fillOpacity=".25" />
          <text x="41" y="51.5" textAnchor="middle" fill={DARK} fontSize="8" fontWeight="700">+</text>
          <g transform="translate(50 31)">
            {[26, 20, 14, 10].map((w, i) => (
              <rect key={i} y={i * 9} width={w} height="6.5" rx="2" fill={R} fillOpacity={0.95 - i * 0.22} />
            ))}
          </g>
          <text x="8" y="85" fill={INK} {...S}>model + context</text>
          <text x="8" y="98" fill={INK} {...S}>→ ranking layer</text>
          <text x="8" y="111" fill={INK} {...S}>→ ranked actions</text>
        </Stage>
      </g>

      {/* 4 · workflow */}
      <g style={reveal(3)}>
        <ArrowRight x1={X[2] + W + 2} x2={X[3] - 3} y={Y + 60} />
        <Stage i={3} title="workflow">
          <rect x="8" y="27" width="66" height="54" rx="3" fill={INK} fillOpacity=".06" stroke={INK} strokeOpacity=".25" />
          <rect x="8" y="27" width="66" height="9" rx="3" fill={INK} fillOpacity=".12" />
          <rect x="12" y="41" width="58" height="11" rx="2" fill={R} fillOpacity=".14" />
          <circle cx="18" cy="46.5" r="2.6" fill={R} />
          <rect x="24" y="44.5" width="26" height="4" rx="2" fill={DARK} fillOpacity=".7" />
          <rect x="56" y="42.5" width="12" height="8" rx="4" fill="#fff" stroke={R} strokeWidth=".9" />
          <Lines x={24} y={57} widths={[22, 30]} gap={9} h={3.5} />
          <rect x="12" y="56" width="5" height="5" rx="2.5" fill={INK} fillOpacity=".3" />
          <rect x="12" y="65" width="5" height="5" rx="2.5" fill={INK} fillOpacity=".3" />
          <Person x={19} y={102} s={1} />
          <text x="32" y="98" fill={INK} {...S}>banker</text>
          <text x="32" y="111" fill={INK} {...S}>+ the why</text>
        </Stage>
      </g>

      {/* 5 · monitor: three checks, three failure points */}
      <g style={reveal(4)}>
        <Dashed d={`M74 ${MY + 26} L${X[0] + W / 2 + 14} ${Y + H + 2}`} />
        <Dashed d={`M192 ${MY + 26} L${X[1] + W / 2} ${Y + H + 2}`} />
        <Dashed d={`M311 ${MY + 26} L${X[3] + W / 2 - 6} ${Y + H + 2}`} />
        <Card x={12} y={MY} w={372} h={MH} p={p}>
          <text x="8" y="16" fill={DARK} {...TITLE}>5 · monitor — three failure points, three checks</text>
          {/* check 1: data quality, refresh vs refresh */}
          <g transform="translate(8 26)">
            <rect width="108" height="90" rx="4" fill="#f5f4f2" />
            <text x="7" y="14" fill={DARK} {...S}>data quality</text>
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <rect x={9 + i * 12} y={60 - [30, 36, 33, 34][i]} width="8" height={[30, 36, 33, 34][i]} fill={INK} fillOpacity=".3" />
                <rect x={61 + i * 12} y={60 - [30, 36, 10, 34][i]} width="8" height={[30, 36, 10, 34][i]} fill={i === 2 ? R : INK} fillOpacity={i === 2 ? 1 : 0.3} />
              </g>
            ))}
            <text x="89" y="42" textAnchor="middle" fill={R} fontSize="10" fontWeight="700">!</text>
            <text x="7" y="78" fill={INK} {...XS}>last refresh</text>
            <text x="59" y="78" fill={INK} {...XS}>this refresh</text>
          </g>
          {/* check 2: model quality, AUC over time */}
          <g transform="translate(126 26)">
            <rect width="108" height="90" rx="4" fill="#f5f4f2" />
            <text x="7" y="14" fill={DARK} {...S}>model quality</text>
            <path d="M9 60 H101" stroke={INK} strokeOpacity=".3" />
            <path d="M9 34 H101" stroke={INK} strokeOpacity=".35" strokeDasharray="2 3" />
            <path d={line(auc, 11, 10, 66, 44)} fill="none" stroke={R} strokeWidth="1.8" strokeLinejoin="round" />
            <text x="7" y="78" fill={INK} {...XS}>AUC over time · drift</text>
          </g>
          {/* check 3: decision usefulness, lift vs baseline */}
          <g transform="translate(244 26)">
            <rect width="108" height="90" rx="4" fill="#f5f4f2" />
            <text x="7" y="14" fill={DARK} {...S}>decision usefulness</text>
            <path d="M9 60 H101" stroke={INK} strokeOpacity=".3" />
            <path d={line(base, 11, 10, 66, 44)} fill="none" stroke={INK} strokeOpacity=".5" strokeWidth="1.5" strokeLinejoin="round" />
            <path d={line(lift, 11, 10, 66, 44)} fill="none" stroke={R} strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M93 32 V47" stroke={R} strokeWidth="1.1" strokeDasharray="1.5 1.5" />
            <text x="7" y="78" fill={INK} {...XS}>lift vs baseline, on outcomes</text>
          </g>
        </Card>
        <text x="200" y="318" textAnchor="middle" fill={INK} {...T}>data quality ≠ model quality ≠ decision usefulness</text>
      </g>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Agentic AI · four layers, top to bottom                              */
/* ------------------------------------------------------------------ */
export function AgentsBody({ reveal = show }: { reveal?: Reveal }) {
  const p = "ag";
  const Ys = [16, 92, 168, 244];
  const BH = 60;
  const L = 126; // where each band's illustration starts (label column to the left)
  const Band = ({ i, title, sub, children }: { i: number; title: string; sub: string; children: React.ReactNode }) => (
    <g>
      {i > 0 && <Chevron x={60} y={Ys[i] - 9} dir="down" />}
      <Card x={12} y={Ys[i]} w={376} h={BH} p={p}>
        <text x="10" y="24" fill={DARK} {...TITLE}>{`${i + 1} · ${title}`}</text>
        <text x="10" y="40" fill={INK} {...XS}>{sub}</text>
        {children}
      </Card>
    </g>
  );
  const specialists = ["summarize", "key findings", "questions", "observations"];
  return (
    <>
      <Defs p={p} />
      {/* 1 · specialists */}
      <g style={reveal(0)}>
        <Band i={0} title="specialists" sub="summarize · find · question">
          <DataStack x={L} y={19} s={1.15} />
          <path d={`M${L + 20} 30 H${176 + (specialists.length - 1) * 60 - 13}`} stroke={INK} strokeOpacity=".3" strokeWidth="1" />
          {specialists.map((s, k) => {
            const cx = 176 + k * 60;
            return (
              <g key={s}>
                <Agent x={cx} y={28} r={11} p={p} />
                <text x={cx} y={53} textAnchor="middle" fill={INK} {...XS}>{s}</text>
              </g>
            );
          })}
        </Band>
      </g>

      {/* 2 · discussion */}
      <g style={reveal(1)}>
        <Band i={1} title="discussion" sub="agents ↔ agents ↔ human">
          {[154, 200, 246].map((cx) => (
            <Agent key={cx} x={cx} y={32} r={10} p={p} />
          ))}
          <g stroke={INK} strokeOpacity=".55" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M166 32 H188 M170 28.5 l-4 3.5 4 3.5 M184 28.5 l4 3.5 -4 3.5" />
            <path d="M212 32 H234 M216 28.5 l-4 3.5 4 3.5 M230 28.5 l4 3.5 -4 3.5" />
            <path d="M258 32 H282 M262 28.5 l-4 3.5 4 3.5 M278 28.5 l4 3.5 -4 3.5" />
          </g>
          <Person x={298} y={34} s={1.3} tone={R} />
          <text x="314" y="29" fill={DARK} {...S}>human</text>
          <text x="314" y="41" fill={INK} fontSize="7.5">context · challenge</text>
          <g fill="#fff" stroke={R} strokeWidth="1">
            <rect x="171" y="7" width="12" height="10" rx="2.5" />
            <rect x="217" y="7" width="12" height="10" rx="2.5" />
          </g>
          <text x="177" y="15" textAnchor="middle" fill={R} fontSize="8" fontWeight="700">?</text>
          <text x="223" y="15" textAnchor="middle" fill={R} fontSize="8" fontWeight="700">!</text>
        </Band>
      </g>

      {/* 3 · orchestrator */}
      <g style={reveal(2)}>
        <Band i={2} title="orchestrator" sub="consolidate · reconcile">
          {[0, 1, 2].map((k) => (
            <g key={k} transform={`translate(${L + k * 8} ${9 + k * 6})`}>
              <rect width="38" height="26" rx="2.5" fill="#fff" stroke={INK} strokeOpacity=".4" />
              <Lines x={5} y={6} widths={[24, 18, 22]} gap={6} />
            </g>
          ))}
          <path d={`M${L + 56} 32 H${L + 74}`} stroke={INK} strokeOpacity=".5" strokeWidth="1.3" />
          <Agent x={L + 88} y={32} r={13} p={p} />
          <ArrowRight x1={L + 104} x2={L + 126} y={32} />
          <g transform={`translate(${L + 130} 8)`}>
            <rect width="60" height="30" rx="2.5" fill="#fff" stroke={INK} strokeOpacity=".4" />
            <rect x="5" y="6" width="24" height="3" rx="1.5" fill={R} />
            <Lines x={5} y={13} widths={[50, 40, 46]} gap={5.5} />
          </g>
          <text x={L + 160} y="52" textAnchor="middle" fill={INK} {...XS}>one coherent view</text>
        </Band>
      </g>

      {/* 4 · verification */}
      <g style={reveal(3)}>
        <Band i={3} title="verification" sub="check against evidence">
          {[
            [true, "direct check"],
            [true, "evaluated"],
            [false, "unsupported"],
          ].map(([ok, how], k) => (
            <g key={k} transform={`translate(${L} ${12 + k * 13})`}>
              <rect width="7" height="7" rx="1.5" fill="none" stroke={ok ? DARK : R} strokeWidth="1.1" />
              {ok ? (
                <path d="M1.5 3.5 L3 5 L5.5 2" fill="none" stroke={DARK} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M1.8 1.8 L5.2 5.2 M5.2 1.8 L1.8 5.2" stroke={R} strokeWidth="1.1" strokeLinecap="round" />
              )}
              <rect x="11" y="1.8" width="30" height="3.5" rx="1.75" fill={INK} fillOpacity={ok ? 0.3 : 0.15} />
              <text x="47" y="6.5" fill={ok ? INK : R} {...XS}>{String(how)}</text>
            </g>
          ))}
          <Dashed d={`M${L + 100} 20 H${L + 144} M${L + 100} 34 H${L + 144}`} />
          <DataStack x={L + 148} y={18} s={1.15} />
          <text x={L + 170} y="27" fill={DARK} {...S}>source data</text>
          <text x={L + 170} y="39" fill={INK} fontSize="7.5">direct or structured</text>
        </Band>
        <text x="200" y="326" textAnchor="middle" fill={INK} {...T}>the model may reason · the system verifies before it trusts</text>
      </g>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Intelligent data applications · resolve → calculate → interact → act */
/* ------------------------------------------------------------------ */
export function AppsBody({ reveal = show }: { reveal?: Reveal }) {
  const p = "ap";
  const X = [12, 108, 204, 300];
  const W = 80, Y = 16, H = 248;
  // the same (redacted) company, four spellings: name block + suffix as it appears in each source
  const messy: [number, string][] = [
    [22, "CORP INC"],
    [18, "Corp."],
    [22, "*CO 4471"],
    [20, "co."],
  ];
  const grid = [
    [0.2, 0.4, 0.8],
    [0.15, 0.55, 0.5],
    [0.3, 0.25, 0.4],
    [0.1, 0.45, 0.65],
  ];
  const CAP = 204; // caption block y inside each card
  const Stage = ({ i, title, children }: { i: number; title: string; children: React.ReactNode }) => (
    <Card x={X[i]} y={Y} w={W} h={H} p={p}>
      <text x="8" y="16" fill={DARK} {...TITLE}>{title}</text>
      {children}
    </Card>
  );
  const Caption = ({ head, l1, l2 }: { head: string; l1: string; l2: string }) => (
    <g>
      <text x="8" y={CAP} fill={INK} {...S}>{head}</text>
      <text x="8" y={CAP + 13} fill={INK} fontSize="7.5">{l1}</text>
      <text x="8" y={CAP + 24} fill={INK} fontSize="7.5">{l2}</text>
    </g>
  );
  return (
    <>
      <Defs p={p} />
      {/* resolve */}
      <g style={reveal(0)}>
        <Stage i={0} title="resolve">
          {messy.map(([w, suffix], k) => (
            <g key={k} transform={`translate(8 ${30 + k * 17})`}>
              <rect width="64" height="13" rx="2" fill={INK} fillOpacity=".07" />
              <rect x="4" y="4" width={w} height="5" rx="1" fill={INK} fillOpacity=".45" />
              <text x={w + 7} y="9.5" fill={DARK} fontFamily="ui-monospace, Menlo, monospace" fontSize="7">{suffix}</text>
            </g>
          ))}
          <Chevron x={40} y={108} dir="down" />
          <rect x="8" y="120" width="64" height="30" rx="2.5" fill="#fff" stroke={R} strokeWidth="1" />
          <rect x="14" y="127" width="30" height="6" rx="1" fill={DARK} fillOpacity=".8" />
          <text x="48" y="133" fill={INK} fontSize="7.5">Inc.</text>
          <text x="14" y="145" fill={R} fontSize="7.5" fontWeight="700">one entity ✓</text>
          <Caption head="messy data" l1="entity resolution ·" l2="fuzzy matching" />
        </Stage>
      </g>

      {/* calculate */}
      <g style={reveal(1)}>
        <ArrowRight x1={X[0] + W + 2} x2={X[1] - 3} y={Y + 100} />
        <Stage i={1} title="calculate">
          {[
            ["strategy", 44],
            ["value", 32],
            ["opportunity", 52],
          ].map(([l, w], k) => (
            <g key={String(l)} transform={`translate(8 ${30 + k * 15})`}>
              <text x="0" y="7" fill={INK} fontSize="7.5" fontWeight="600">{l}</text>
              <rect x="38" y="1" width={Number(w) * 0.55} height="6.5" rx="2" fill={R} fillOpacity={0.9 - k * 0.25} />
            </g>
          ))}
          <Chevron x={40} y={82} dir="down" />
          {grid.map((row, i) => (
            <g key={i}>
              {row.map((v, j) => (
                <rect key={j} x={8 + j * 22} y={92 + i * 18} width="20" height="15" rx="2" fill={R} fillOpacity={0.08 + v * 0.85} stroke={i === 0 && j === 2 ? DARK : "none"} strokeWidth="1" />
              ))}
            </g>
          ))}
          <Caption head="signals · logic" l1="segmentation and" l2="context-specific rules" />
        </Stage>
      </g>

      {/* interact */}
      <g style={reveal(2)}>
        <ArrowRight x1={X[1] + W + 2} x2={X[2] - 3} y={Y + 100} />
        <Stage i={2} title="interact">
          <text x="8" y="34" fill={INK} fontSize="7.5" fontWeight="600">assumption</text>
          <path d="M8 46 H72" stroke={INK} strokeOpacity=".3" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M8 46 H46" stroke={R} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="46" cy="46" r="5.5" fill="#fff" stroke={R} strokeWidth="1.6" />
          <text x="8" y="66" fill={INK} fontSize="7.5" fontWeight="600">segment</text>
          <rect x="8" y="71" width="30" height="12" rx="6" fill={R} fillOpacity=".15" />
          <rect x="42" y="71" width="30" height="12" rx="6" fill={INK} fillOpacity=".08" />
          <text x="23" y="79.5" textAnchor="middle" fill={R} fontSize="7.5" fontWeight="700">A</text>
          <text x="57" y="79.5" textAnchor="middle" fill={INK} fontSize="7.5" fontWeight="700">B</text>
          <text x="8" y="102" fill={INK} fontSize="7.5" fontWeight="600">result</text>
          {/* before (faded) → after (solid): the answer moves with the inputs */}
          {[
            [18, 26, 12],
            [30, 20, 10],
          ].map((ws, col) => (
            <g key={col} transform={`translate(${8 + col * 40} 108)`}>
              {ws.map((w, k) => (
                <g key={k} transform={`translate(0 ${k * 10})`}>
                  <rect width="30" height="6" rx="2" fill={INK} fillOpacity=".08" />
                  <rect width={w} height="6" rx="2" fill={R} fillOpacity={col === 0 ? 0.3 : 0.95 - k * 0.22} />
                </g>
              ))}
              <text x="0" y="40" fill={INK} fontSize="7">{col === 0 ? "before" : "after"}</text>
            </g>
          ))}
          <ArrowRight x1={40} x2={46} y={118} />
          <Caption head="dynamic inputs" l1="change an input and" l2="the answer changes" />
        </Stage>
      </g>

      {/* act */}
      <g style={reveal(3)}>
        <ArrowRight x1={X[2] + W + 2} x2={X[3] - 3} y={Y + 100} />
        <Stage i={3} title="act">
          <rect x="8" y="28" width="64" height="58" rx="3" fill={INK} fillOpacity=".07" />
          <path d="M8 56 C 24 50, 40 64, 72 54 M32 28 C 36 48, 26 68, 30 86" fill="none" stroke={INK} strokeOpacity=".18" strokeWidth="1" />
          <path d="M22 46 L40 62 L58 44" fill="none" stroke={R} strokeOpacity=".8" strokeWidth="1.2" strokeDasharray="2.5 2.5" />
          {[
            [22, 46],
            [40, 62],
            [58, 44],
          ].map(([x, y], k) => (
            <g key={k} transform={`translate(${x} ${y})`}>
              <path d="M0 0 C -4.5 -5.5, -4.5 -11, 0 -11 C 4.5 -11, 4.5 -5.5, 0 0 z" fill={R} />
              <circle cx="0" cy="-7" r="1.7" fill="#fff" />
            </g>
          ))}
          {[
            ["prospect list", true],
            ["outreach plan", true],
            ["visit schedule", false],
          ].map(([l, done], k) => (
            <g key={String(l)} transform={`translate(8 ${100 + k * 15})`}>
              <rect width="7" height="7" rx="1.5" fill="none" stroke={done ? R : INK} strokeOpacity={done ? 1 : 0.5} strokeWidth="1.1" />
              {done && <path d="M1.5 3.5 L3 5 L5.5 2" fill="none" stroke={R} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />}
              <text x="11" y="6.5" fill={DARK} fontSize="7.5" fontWeight="600">{l}</text>
            </g>
          ))}
          <Person x={18} y={166} s={1} />
          <text x="30" y="168" fill={INK} fontSize="7.5">in the tool</text>
          <Caption head="prospect · plan" l1="outreach, visits —" l2="decided in the tool" />
        </Stage>
        <text x="200" y="298" textAnchor="middle" fill={INK} {...T}>resolve → calculate → interact → act</text>
      </g>
    </>
  );
}
