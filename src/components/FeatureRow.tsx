import type { ReactNode } from "react";
import type { Item } from "@/data/projects";
import ReadMore from "@/components/ReadMore";
import ExtIcon from "@/components/ExtIcon";

/** Full-width row: text on one side, diagram on the other, alternating. */
export default function FeatureRow({ item, figure, flip = false }: { item: Item; figure: ReactNode; flip?: boolean }) {
  const paras = item.paras ?? (item.how ? [item.how] : []);
  return (
    <div className={`feature${flip ? " flip" : ""}`} id={item.slug}>
      <div>
        <div className="cat label">
          {item.category}
          {item.status === "in-progress" && <span className="pill label">In progress</span>}
        </div>
        <h3>{item.title}</h3>
        <p className="why">{item.why}</p>
        {paras.map((t, i) => (
          <p key={i} className={i > 0 ? "secondary" : undefined}>
            {t}
          </p>
        ))}
        {paras.length > 1 && <ReadMore />}
        {item.figure && (
          <div className="highlight">
            <b className="figure">{item.figure.value}</b>
            <span>{item.figure.label}</span>
          </div>
        )}
        <div className="tags">
          {item.tags.join(" · ")}
          {item.links?.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="text-link" style={{ marginLeft: 14 }}>
              {l.label}
              <ExtIcon />
            </a>
          ))}
        </div>
      </div>
      <div className="fig-col">{figure}</div>
    </div>
  );
}
