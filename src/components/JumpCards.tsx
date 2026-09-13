import type { Group } from "@/data/projects";

/**
 * Overview under the hero: one header strip per chapter (like a nav
 * segment), and one white card per project beneath it. Each card jumps
 * to its full row further down.
 */
export default function JumpCards({ groups }: { groups: Group[] }) {
  return (
    <nav className="overview" aria-label="Work overview">
      {groups.map((g) => (
        <div key={g.id} className="ogroup" style={{ flex: g.items.length }}>
          <div className="ogroup-head">
            <span className="label">{g.heading}</span>
            <span className="ogroup-when">{g.kicker.split("·").slice(-1)[0].trim()}</span>
          </div>
          <div className="ogroup-cards" style={{ gridTemplateColumns: `repeat(${g.items.length}, minmax(0, 1fr))` }}>
            {g.items.map((item) => (
              <a key={item.slug} href={`#${item.slug}`} className="ocard">
                <span>{item.short}</span>
                <span className="ocard-arrow" aria-hidden="true">›</span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
