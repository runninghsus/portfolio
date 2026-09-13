export type KeyFact = { value: string; unit?: string; label: string };

export default function KeyFacts({ facts, className = "" }: { facts: readonly KeyFact[]; className?: string }) {
  const cols = facts.length === 3 ? "three" : "";
  return (
    <div className={`keyfacts ${cols} ${className}`.trim()}>
      {facts.map((f) => (
        <div className="kf" key={f.label}>
          <b className="figure">
            {f.value}
            {f.unit && <small>{f.unit}</small>}
          </b>
          <span>{f.label}</span>
        </div>
      ))}
    </div>
  );
}
