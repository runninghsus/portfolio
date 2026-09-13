/**
 * Illustrative scenes (oracle.com-style product imagery) for the research
 * and app rows. Hand-authored SVG, 400×320, one red accent, depth from
 * isometric planes, soft gradients and drop shadows. Almost no text: the
 * row's copy carries the words; the scene carries the mechanism.
 */

export const R = "#C74634";
export const INK = "#6b6460"; // neutral that reads on both light and dark grounds
export const T = { fontSize: 11, fontWeight: 600 } as const;

/** Per-step reveal: returns a style for an element that belongs to step `at`. */
export type Reveal = (at: number) => React.CSSProperties;
const show: Reveal = () => ({});

/* Shared defs, prefixed per scene so ids never collide on one page. */
export function Defs({ p }: { p: string }) {
  return (
    <defs>
      <filter id={`${p}-sh`} x="-30%" y="-30%" width="160%" height="180%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity=".16" />
      </filter>
      <filter id={`${p}-soft`} x="-30%" y="-30%" width="160%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000" floodOpacity=".12" />
      </filter>
      <radialGradient id={`${p}-red`}>
        <stop offset="0" stopColor={R} stopOpacity=".9" />
        <stop offset="1" stopColor={R} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${p}-rose`}>
        <stop offset="0" stopColor={R} stopOpacity=".45" />
        <stop offset="1" stopColor={R} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${p}-ink`}>
        <stop offset="0" stopColor={INK} stopOpacity=".75" />
        <stop offset="1" stopColor={INK} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${p}-mist`}>
        <stop offset="0" stopColor={INK} stopOpacity=".35" />
        <stop offset="1" stopColor={INK} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${p}-plane`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity=".9" />
        <stop offset="1" stopColor="#fff" stopOpacity=".55" />
      </linearGradient>
      <linearGradient id={`${p}-glass`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity=".7" />
        <stop offset="1" stopColor="#fff" stopOpacity=".2" />
      </linearGradient>
      <linearGradient id={`${p}-redbar`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={R} />
        <stop offset="1" stopColor="#e0705e" />
      </linearGradient>
    </defs>
  );
}

/* Isometric plane (a floating slab with a thin side face). */
export function Slab({ x, y, w, d, h = 6, fill, stroke = INK, op = 1, filter }: { x: number; y: number; w: number; d: number; h?: number; fill: string; stroke?: string; op?: number; filter?: string }) {
  // top face: parallelogram from (x,y) with width w and depth d along the iso axis
  const kx = d * 0.5; // horizontal shift per depth
  const ky = d * 0.29; // vertical shift per depth
  const top = `M${x} ${y} l${w} 0 l${kx} ${-ky} l${-w} 0 z`;
  const front = `M${x} ${y} l${w} 0 l0 ${h} l${-w} 0 z`;
  const side = `M${x + w} ${y} l${kx} ${-ky} l0 ${h} l${-kx} ${ky} z`;
  return (
    <g opacity={op} filter={filter}>
      <path d={front} fill={INK} fillOpacity=".22" />
      <path d={side} fill={INK} fillOpacity=".32" />
      <path d={top} fill={fill} stroke={stroke} strokeOpacity=".25" />
    </g>
  );
}

/* Deterministic pseudo-random for scatter, so server and client agree. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* B-SOiD: video → pose keypoints → feature traces → behavior clusters  */
/* → new video labeled frame by frame                                   */
/* ------------------------------------------------------------------ */
const BEHAVIORS = [
  { name: "groom", color: R, op: 0.95 },
  { name: "rear", color: "#161513", op: 0.8 },
  { name: "walk", color: INK, op: 0.45 },
  { name: "sniff", color: R, op: 0.45 },
];

export function Card({ x, y, w, h, p, children }: { x: number; y: number; w: number; h: number; p: string; children?: React.ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx="6" fill="#fff" filter={`url(#${p}-soft)`} />
      {children}
    </g>
  );
}

export function ArrowRight({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return (
    <g stroke={INK} strokeOpacity=".6" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${x1} ${y} H${x2}`} />
      <path d={`M${x2 - 5} ${y - 4} L${x2} ${y} L${x2 - 5} ${y + 4}`} />
    </g>
  );
}

export function BsoidBody({ reveal = show }: { reveal?: Reveal }) {
  const p = "bs";
  const rnd = rng(11);
  // 3-D embedding: isometric projection inside the third card
  const proj = (x: number, y: number, z: number) => ({ px: 26 + x + 0.5 * z, py: 84 - y - 0.29 * z });
  const clusters3: { x: number; y: number; z: number; b: number; label: [number, number, "start" | "middle" | "end"] }[] = [
    { x: 14, y: 46, z: 10, b: 0, label: [45, 17, "middle"] },
    { x: 46, y: 56, z: 34, b: 1, label: [104, 42, "end"] },
    { x: 18, y: 14, z: 30, b: 2, label: [46, 94, "middle"] },
    { x: 50, y: 20, z: 6, b: 3, label: [108, 82, "end"] },
  ];
  const seg: [number, number, number][] = [
    [0, 40, 0], [40, 26, 1], [66, 54, 2], [120, 22, 3], [142, 44, 0], [186, 30, 1], [216, 30, 3], [246, 62, 2], [308, 26, 0], [334, 38, 1],
  ];
  const spark = (seed: number, amp: number, base: number) => {
    const r = rng(seed);
    let d = "";
    for (let i = 0; i <= 22; i++) {
      const x = 52 + i * 2.5;
      const y = base + (r() - 0.5) * amp + Math.sin(i / 2.2) * amp * 0.35;
      d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1) + " ";
    }
    return d;
  };
  const CW = 112, CH = 100;
  return (
    <>
      <Defs p={p} />
      {/* 1 · video frame with the pose estimate drawn on it */}
      <g style={reveal(0)}>
      <Card x={12} y={26} w={CW} h={CH} p={p}>
        <rect x="0" y="0" width={CW} height={CH} rx="6" fill="#2b2825" />
        <g fontFamily="ui-monospace, Menlo, monospace" fontSize="7" fill="#fff" fillOpacity=".7">
          <text x="8" y="13">frame 01432</text>
          <text x={CW - 8} y="13" textAnchor="end">8 kpts</text>
        </g>
        <circle cx="8" cy="20" r="0" />
        <g transform="translate(9 32) scale(0.68)">
          {/* what the camera sees: a low-detail silhouette */}
          <path d="M16 36 C 2 38, -8 52, 2 70" fill="none" stroke="#fff" strokeOpacity=".14" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="92" cy="14" r="8.5" fill="#fff" fillOpacity=".14" />
          <circle cx="92" cy="58" r="8.5" fill="#fff" fillOpacity=".14" />
          <path
            d="M16 36 C 16 22, 28 12, 46 12 C 60 12, 70 16, 80 22 C 84 18, 96 17, 108 22 C 116 26, 124 32, 128 36 C 124 40, 116 46, 108 50 C 96 55, 84 54, 80 50 C 70 56, 60 60, 46 60 C 28 60, 16 50, 16 36 Z"
            fill="#fff"
            fillOpacity=".16"
          />
          {/* detection box corners */}
          <g fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.4">
            <path d="M-4 -2 h12 M-4 -2 v12 M140 -2 h-12 M140 -2 v12 M-4 76 h12 M-4 76 v-12 M140 76 h-12 M140 76 v-12" />
          </g>
          {/* what the model outputs: keypoints + skeleton */}
          <g fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeOpacity=".75">
            <path d="M127 36 L92 14 M127 36 L92 58 M92 14 L58 36 M92 58 L58 36 M58 36 L46 20 M58 36 L46 52 M46 20 L16 36 M46 52 L16 36" />
          </g>
          {[
            [127, 36, R, 1], [92, 14, "#e88a78", 1], [92, 58, "#e88a78", 1], [58, 36, "#fff", 1], [46, 20, "#fff", 0.85], [46, 52, "#fff", 0.85], [16, 36, "#c9c3bd", 0.9],
          ].map(([x, y, c, o], i) => (
            <g key={i}>
              <circle cx={x as number} cy={y as number} r="6" fill={c as string} fillOpacity={(o as number) * 0.18} />
              <circle cx={x as number} cy={y as number} r="3.2" fill={c as string} fillOpacity={o as number} />
            </g>
          ))}
          <g fontFamily="ui-monospace, Menlo, monospace" fontSize="8.5" fill="#fff" fillOpacity=".85">
            <text x="127" y="52" textAnchor="middle">nose</text>
            <text x="92" y="1" textAnchor="middle">ear</text>
            <text x="92" y="76" textAnchor="middle">ear</text>
            <text x="58" y="52" textAnchor="middle">spine</text>
            <text x="16" y="25" textAnchor="middle">tail</text>
          </g>
        </g>
      </Card>
      <text x="68" y="142" textAnchor="middle" fill={INK} {...T}>pose estimate, per frame</text>
      </g>

      {/* 2 · features over time */}
      <g style={reveal(1)}>
      <ArrowRight x1={128} x2={142} y={76} />
      <Card x={144} y={26} w={CW} h={CH} p={p}>
        <g fontSize="9" fontWeight="600" fill={INK}>
          <text x="8" y="24">distance</text>
          <text x="8" y="56">angle</text>
          <text x="8" y="88">speed</text>
        </g>
        <path d="M50 12 V 92" stroke={INK} strokeOpacity=".25" />
        <path d={spark(3, 16, 20)} fill="none" stroke={R} strokeWidth="1.4" strokeLinejoin="round" />
        <path d={spark(5, 14, 52)} fill="none" stroke="#161513" strokeOpacity=".8" strokeWidth="1.4" strokeLinejoin="round" />
        <path d={spark(9, 12, 84)} fill="none" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
      </Card>
      <text x="200" y="142" textAnchor="middle" fill={INK} {...T}>features over time</text>
      </g>

      {/* 3 · high-dimensional features → 3-D embedding → clusters = behaviors */}
      <g style={reveal(2)}>
      <ArrowRight x1={260} x2={274} y={76} />
      <Card x={276} y={26} w={CW} h={CH} p={p}>
        {/* isometric axis box */}
        <g fill="none" stroke={INK} strokeOpacity=".35" strokeWidth="1">
          <path d="M26 84 H 90 M26 84 V 26 M26 84 l 20 -11.6" />
          <path d="M90 84 l 20 -11.6 M26 26 l 20 -11.6 M46 72.4 V 14.4 M46 72.4 H 110 M110 72.4 V 14.4 M46 14.4 H 110 M90 84 V 26 M90 26 H 26 M110 14.4 L 90 26" strokeOpacity=".18" />
        </g>
        <text x="6" y="12" fontSize="7.5" fontWeight="600" fill={INK} fillOpacity=".8">features → 3 dims</text>
        {clusters3.map((c, i) => {
          const b = BEHAVIORS[c.b];
          return (
            <g key={i}>
              {Array.from({ length: 18 }).map((_, k) => {
                const a = rnd() * Math.PI * 2, e = rnd() * Math.PI;
                const d = Math.cbrt(rnd()) * 12;
                const x = c.x + Math.cos(a) * Math.sin(e) * d, y = c.y + Math.sin(a) * Math.sin(e) * d, z = c.z + Math.cos(e) * d;
                const { px, py } = proj(x, y, z);
                const depth = z / 44; // 0 near → 1 far
                const r2 = (v: number) => Math.round(v * 100) / 100;
                return <circle key={k} cx={r2(px)} cy={r2(py)} r={r2(2 - depth * 0.9)} fill={b.color} fillOpacity={r2(b.op * (1 - depth * 0.45))} />;
              })}
              <text x={c.label[0]} y={c.label[1]} textAnchor={c.label[2]} fontSize="9" fontWeight="700" fill={b.color} fillOpacity={Math.max(b.op, 0.75)}>{b.name}</text>
            </g>
          );
        })}
      </Card>
      <text x="332" y="142" textAnchor="middle" fill={INK} {...T}>clusters = behaviors</text>
      </g>

      {/* 4 · classify a new video, frame by frame */}
      <g style={reveal(3)}>
      <path d="M332 150 V 166 H 200 V 184" fill="none" stroke={INK} strokeOpacity=".5" strokeWidth="1.6" />
      <path d="M195 179 L200 185 L205 179" fill="none" stroke={INK} strokeOpacity=".6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <text x="206" y="162" fill={INK} textAnchor="middle" {...T}>new video, labeled frame by frame</text>
      <g transform="translate(12,190)" filter={`url(#${p}-soft)`}>
        <rect width="376" height="26" rx="4" fill="#fff" />
        {seg.map(([x, w, bi], i) => (
          <rect key={i} x={x} y="0" width={w} height="26" fill={BEHAVIORS[bi].color} fillOpacity={BEHAVIORS[bi].op} />
        ))}
        <rect width="376" height="26" rx="4" fill="none" stroke={INK} strokeOpacity=".3" />
      </g>
      <text x="12" y="232" fill={INK} fontSize="10">0 s</text>
      <text x="388" y="232" fill={INK} fontSize="10" textAnchor="end">60 s</text>
      {/* legend */}
      <g transform="translate(12,254)">
        {BEHAVIORS.map((b, i) => (
          <g key={b.name} transform={`translate(${i * 70} 0)`}>
            <rect width="12" height="12" rx="2" fill={b.color} fillOpacity={b.op} />
            <text x="18" y="10" fill={INK} {...T}>{b.name}</text>
          </g>
        ))}
      </g>
      </g>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* A-SOiD: a few labels → classifier → keep the confident, ask about    */
/* the unsure → expert labels only those → retrain                      */
/* ------------------------------------------------------------------ */
export function Tile({ x, y, kind }: { x: number; y: number; kind: "blank" | "seed" | "model" | "ask" }) {
  const s = 13;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={s} height={s} rx="2" fill={kind === "model" ? INK : "#fff"} fillOpacity={kind === "model" ? 0.18 : 1} stroke={kind === "ask" ? R : INK} strokeOpacity={kind === "ask" ? 1 : 0.35} strokeWidth={kind === "ask" ? 1.5 : 1} />
      {kind === "seed" && <rect x="1.5" y="1.5" width="6" height="3" rx="1" fill={R} />}
      {kind === "model" && <rect x="1.5" y="1.5" width="6" height="3" rx="1" fill="#161513" fillOpacity=".55" />}
      {kind === "ask" && (
        <text x={s / 2} y="10" textAnchor="middle" fill={R} fontSize="9" fontWeight="700">?</text>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Neural decoding: a probe through layered tissue; spikes become        */
/* behavior, matched against the video timeline                          */
/* ------------------------------------------------------------------ */
export function BrainBody({ reveal = show }: { reveal?: Reveal }) {
  const p = "nd";
  const rnd = rng(23);
  const bands = [
    { y: 84, label: ["cortex", "L2/3"], op: 0.9, density: 0.5 },
    { y: 112, label: ["cortex", "L5/6"], op: 0.75, density: 0.7 },
    { y: 140, label: ["dorsal", "striatum"], op: 0.6, density: 0.85 },
    { y: 168, label: ["ventral", "striatum"], op: 0.45, density: 0.55 },
  ];
  const X0 = 214, X1 = 372;
  const rasters = bands.map((b) => {
    let d = "";
    for (let row = 0; row < 4; row++) {
      for (let x = X0 + 4; x < X1 - 2; x += 3) {
        if (rnd() < b.density * 0.28) d += `M${x} ${b.y + 2 + row * 5} v3 `;
      }
    }
    return d;
  });
  const W = X1 - X0;
  const seg: [number, number, string, number][] = [
    [0, 26, R, 0.95], [26, 22, INK, 0.55], [48, 34, INK, 0.85], [82, 20, R, 0.5], [102, 28, R, 0.95], [130, 28, INK, 0.55],
  ];
  const seg2: [number, number, string, number][] = [
    [0, 24, R, 0.95], [24, 26, INK, 0.55], [50, 30, INK, 0.85], [80, 24, R, 0.5], [104, 26, R, 0.95], [130, 28, INK, 0.55],
  ];
  return (
    <>
      <Defs p={p} />
      {/* step 0 · the recording setup */}
      <g style={reveal(0)}>
      {/* layered tissue: four stacked slabs, deeper = lower */}
      {bands.map((b, i) => (
        <Slab key={i} x={66} y={b.y + 18} w={104} d={60} h={8} fill={`url(#${p}-plane)`} op={0.95 - i * 0.08} filter={i === 3 ? `url(#${p}-sh)` : undefined} />
      ))}
      {bands.map((b, i) => (
        <text key={i} x="58" y={b.y + 6} fill={INK} textAnchor="end" fontSize="10" fontWeight="600">
          <tspan x="58" dy="0">{b.label[0]}</tspan>
          <tspan x="58" dy="11">{b.label[1]}</tspan>
        </text>
      ))}
      {/* the probe */}
      <g filter={`url(#${p}-soft)`}>
        <rect x="118" y="22" width="7" height="172" rx="3.5" fill="#312d2a" />
        <path d="M118 194 l3.5 12 l3.5 -12 z" fill="#312d2a" />
      </g>
      {Array.from({ length: 22 }).map((_, i) => {
        const y = 36 + i * 7.2;
        const active = [3, 4, 8, 11, 12, 16, 19].includes(i);
        return <circle key={i} cx="121.5" cy={y} r={active ? 2.2 : 1.3} fill={active ? R : "#fff"} fillOpacity={active ? 1 : 0.6} />;
      })}
      <text x="130" y="20" fill={INK} {...T}>384-site probe</text>
      <g transform="translate(24,238)">
        <rect x="0" y="0" width="18" height="12" rx="2" fill={INK} fillOpacity=".6" />
        <path d="M18 3 l8 -3 v12 l-8 -3 z" fill={INK} fillOpacity=".6" />
        <text x="34" y="10" fill={INK} fontSize="10" fontWeight="600">4 cameras · 24/7 · &lt;33 ms sync</text>
      </g>
      </g>
      {/* step 1 · brain chatter */}
      <g style={reveal(1)}>
      {/* spike trains leaving each layer */}
      {bands.map((b, i) => (
        <g key={i}>
          <path d={`M176 ${b.y + 10} C 190 ${b.y + 10}, 198 ${b.y + 8}, ${X0} ${b.y + 8}`} fill="none" stroke={INK} strokeOpacity=".3" strokeWidth="1.2" />
          <path d={rasters[i]} stroke={i < 2 ? "#161513" : INK} strokeOpacity={b.op} strokeWidth="1.1" />
        </g>
      ))}
      <rect x={X0} y="80" width={W} height="108" rx="3" fill="none" stroke={INK} strokeOpacity=".2" />
      <text x={X1} y="72" fill={INK} textAnchor="end" {...T}>brain chatter</text>
      </g>
      {/* step 2 · decode */}
      <g style={reveal(2)}>
      <path d={`M${X0 + W / 2} 190 v 14`} stroke={R} strokeWidth="2" />
      <path d={`M${X0 + W / 2 - 4} 200 l4 6 l4 -6`} fill="none" stroke={R} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <g transform={`translate(${X0},214)`} filter={`url(#${p}-soft)`}>
        <rect width={W} height="20" rx="3" fill="#fff" fillOpacity=".9" />
        {seg.map(([x, w, c, op], i) => (
          <rect key={i} x={x} y="0" width={w} height="20" fill={c} fillOpacity={op} />
        ))}
        <rect width={W} height="20" rx="3" fill="none" stroke={INK} strokeOpacity=".3" />
      </g>
      <text x={X0 - 8} y="228" fill={INK} textAnchor="end" {...T}>decoded from chatter</text>
      </g>
      {/* step 3 · check against video */}
      <g style={reveal(3)}>
      <g transform={`translate(${X0},244)`} filter={`url(#${p}-soft)`}>
        <rect width={W} height="20" rx="3" fill="#fff" fillOpacity=".9" />
        {seg2.map(([x, w, c, op], i) => (
          <rect key={i} x={x} y="0" width={w} height="20" fill={c} fillOpacity={op} />
        ))}
        <rect width={W} height="20" rx="3" fill="none" stroke={INK} strokeOpacity=".3" />
      </g>
      <text x={X0 - 8} y="258" fill={INK} textAnchor="end" {...T}>seen on video</text>
      </g>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Vowel: host details feed an assistant on the guest's phone; photos,   */
/* nearby guests and announcements float around it                       */
/* ------------------------------------------------------------------ */
export function VowelBody({ reveal = show }: { reveal?: Reveal }) {
  return (
    <g transform="translate(32 -2) scale(0.84)">
      <VowelBodyInner reveal={reveal} />
    </g>
  );
}

function VowelBodyInner({ reveal = show }: { reveal?: Reveal }) {
  const p = "vw";
  const Lines = ({ x, y, w, n, gap = 7 }: { x: number; y: number; w: number; n: number; gap?: number }) => (
    <g>
      {Array.from({ length: n }).map((_, i) => (
        <rect key={i} x={x} y={y + i * gap} width={i === n - 1 ? w * 0.6 : w} height="3" rx="1.5" fill={INK} fillOpacity=".35" />
      ))}
    </g>
  );
  return (
    <>
      <Defs p={p} />
      {/* step 0 · host enters the details once */}
      <g style={reveal(0)}>
      {/* host-side cards, feeding the phone */}
      <g filter={`url(#${p}-soft)`}>
        <rect x="18" y="40" width="98" height="58" rx="6" fill="#fff" />
        <rect x="18" y="112" width="98" height="46" rx="6" fill="#fff" />
        <rect x="18" y="172" width="98" height="46" rx="6" fill="#fff" />
      </g>
      <text x="28" y="56" fill="#161513" {...T}>Schedule</text>
      <rect x="28" y="64" width="34" height="10" rx="5" fill={R} />
      <rect x="66" y="64" width="40" height="10" rx="5" fill={INK} fillOpacity=".15" />
      <Lines x={28} y={82} w={78} n={2} />
      <text x="28" y="128" fill="#161513" {...T}>Venue & arrival</text>
      <Lines x={28} y={136} w={78} n={2} />
      <text x="28" y="188" fill="#161513" {...T}>Dress code · Menu</text>
      <Lines x={28} y={196} w={78} n={2} />
      <text x="67" y="30" fill={INK} textAnchor="middle" fontSize="10">host enters once</text>
      </g>
      {/* step 1 · guests ask, the assistant answers from those details */}
      <g style={reveal(1)}>
      {/* connectors into the phone */}
      <g fill="none" stroke={R} strokeOpacity=".45" strokeWidth="1.4" strokeDasharray="2 5" strokeLinecap="round">
        <path d="M116 70 C 140 70, 140 130, 156 130" />
        <path d="M116 135 C 136 135, 140 132, 156 132" />
        <path d="M116 195 C 140 195, 140 136, 156 134" />
      </g>
      </g>
      {/* step 2 · when it doesn't know, it asks the host */}
      <g style={reveal(2)}>
      {/* host fallback */}
      <g transform="translate(18,242)" filter={`url(#${p}-soft)`}>
        <rect width="98" height="30" rx="15" fill="#fff" />
        <circle cx="16" cy="15" r="8" fill={INK} fillOpacity=".25" />
        <circle cx="16" cy="12" r="3" fill={INK} fillOpacity=".6" />
        <path d="M10 20 a6 6 0 0 1 12 0" fill={INK} fillOpacity=".6" />
        <text x="32" y="19" fill="#161513" {...T}>Ask the host</text>
      </g>
      <path d="M156 214 C 140 214, 134 240, 118 254" fill="none" stroke={INK} strokeOpacity=".4" strokeWidth="1.4" strokeDasharray="2 5" />
      <text x="18" y="290" fill={INK} fontSize="10">only when it doesn&apos;t know</text>
      </g>
      {/* the phone belongs to step 1 */}
      <g style={reveal(1)}>
      <g transform="rotate(-4 212 160)">
        <g filter={`url(#${p}-sh)`}>
          <rect x="156" y="26" width="112" height="268" rx="18" fill="#2b2825" />
        </g>
        <rect x="162" y="32" width="100" height="256" rx="14" fill="#fbf9f8" />
        <rect x="196" y="38" width="32" height="5" rx="2.5" fill="#2b2825" />
        <text x="212" y="62" textAnchor="middle" fill="#161513" fontSize="10" fontWeight="700">Vowel</text>
        <path d="M170 68 h84" stroke={INK} strokeOpacity=".2" />
        {/* guest bubble */}
        <rect x="186" y="78" width="70" height="24" rx="10" fill={INK} fillOpacity=".14" />
        <Lines x={194} y={86} w={54} n={2} gap={7} />
        {/* assistant bubble */}
        <rect x="168" y="110" width="76" height="40" rx="10" fill={R} />
        <g>
          {[0, 1, 2].map((i) => (
            <rect key={i} x="176" y={119 + i * 8} width={i === 2 ? 36 : 60} height="3" rx="1.5" fill="#fff" fillOpacity=".85" />
          ))}
        </g>
        {/* second exchange */}
        <rect x="192" y="158" width="64" height="20" rx="10" fill={INK} fillOpacity=".14" />
        <Lines x={200} y={166} w={48} n={1} />
        <rect x="168" y="186" width="76" height="30" rx="10" fill={R} fillOpacity=".55" />
        <rect x="176" y="195" width="58" height="3" rx="1.5" fill="#fff" fillOpacity=".9" />
        <rect x="176" y="203" width="40" height="3" rx="1.5" fill="#fff" fillOpacity=".9" />
        {/* input bar */}
        <rect x="168" y="258" width="88" height="20" rx="10" fill="#fff" stroke={INK} strokeOpacity=".3" />
        <circle cx="246" cy="268" r="7" fill={R} />
        <path d="M243 268 h6 M246 265 l3 3 l-3 3" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      </g>
      {/* step 3 · what else guests get */}
      <g style={reveal(3)}>
      <g filter={`url(#${p}-soft)`}>
        <rect x="286" y="40" width="98" height="78" rx="6" fill="#fff" />
        <rect x="286" y="132" width="98" height="60" rx="6" fill="#fff" />
        <rect x="286" y="206" width="98" height="48" rx="6" fill="#fff" />
      </g>
      {/* find my photos: selfie + tiles, one matched */}
      <text x="296" y="56" fill="#161513" {...T}>Find my photos</text>
      <circle cx="306" cy="80" r="10" fill={INK} fillOpacity=".25" />
      <circle cx="306" cy="77" r="3.5" fill={INK} fillOpacity=".6" />
      <path d="M299 87 a7 7 0 0 1 14 0" fill={INK} fillOpacity=".6" />
      {[0, 1, 2, 3].map((i) => {
        const x = 326 + (i % 2) * 26, y = 64 + Math.floor(i / 2) * 26;
        const hit = i === 1 || i === 2;
        return <rect key={i} x={x} y={y} width="22" height="22" rx="3" fill={INK} fillOpacity=".18" stroke={hit ? R : "none"} strokeWidth="2" />;
      })}
      {/* nearby guests */}
      <text x="296" y="148" fill="#161513" {...T}>Nearby guests</text>
      <g fill="none" stroke={R} strokeOpacity=".35">
        <circle cx="335" cy="172" r="7" />
        <circle cx="335" cy="172" r="14" strokeOpacity=".2" />
      </g>
      <circle cx="335" cy="172" r="3" fill={R} />
      <circle cx="356" cy="164" r="3" fill={INK} fillOpacity=".5" />
      <circle cx="318" cy="180" r="3" fill={INK} fillOpacity=".5" />
      {/* pinned announcement */}
      <text x="296" y="222" fill="#161513" {...T}>Announcement</text>
      <Lines x={296} y={232} w={70} n={2} />
      <g transform="translate(378,208) rotate(35)">
        <rect x="-3" y="-8" width="6" height="12" rx="2" fill={R} />
        <path d="M0 4 v8" stroke={R} strokeWidth="2" strokeLinecap="round" />
      </g>
      <text x="335" y="272" fill={INK} textAnchor="middle" fontSize="10">for guests</text>
      </g>
    </>
  );
}
