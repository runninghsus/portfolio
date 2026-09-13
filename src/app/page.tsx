import Image from "next/image";
import type { ReactNode } from "react";
import FeatureRow from "@/components/FeatureRow";
import JumpCards from "@/components/JumpCards";
import KeyFacts from "@/components/KeyFacts";
import ExtIcon from "@/components/ExtIcon";
import ResumeButton from "@/components/ResumeButton";
import {
  PipelineTutorial,
  AgentsTutorial,
  AppsTutorial,
  BsoidTutorial,
  AsoidTutorial,
  BrainTutorial,
  VowelTutorial,
} from "@/components/tutorials";
import { groups } from "@/data/projects";
import { keyFacts, site } from "@/data/site";

// Diagram for each item, by slug.
const figures: Record<string, ReactNode> = {
  "production-ml": <PipelineTutorial />,
  "agentic-ai": <AgentsTutorial />,
  "data-apps": <AppsTutorial />,
  "b-soid": <BsoidTutorial />,
  "a-soid": <AsoidTutorial />,
  "neural-decoding": <BrainTutorial />,
  vowel: <VowelTutorial />,
};

export default function Home() {
  return (
    <>
      {/* Lead panel */}
      <section className="panel hero">
        <div className="wrap hero-grid">
          <div className="inner">
            <div className="kicker label">{site.name} · Ph.D.</div>
            <h1>{site.headline}</h1>
            <div className="actions">
              <ResumeButton />
              <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer" className="btn ghost">
                LinkedIn
                <ExtIcon />
              </a>
            </div>
          </div>
          <Image src="/images/alex.jpg" alt={`Portrait of ${site.name}`} width={900} height={1125} priority className="portrait" />
        </div>
        <div className="wrap">
          <KeyFacts facts={keyFacts} className="in-panel" />
        </div>
      </section>

      {/* Chapter tiles: summarize and jump */}
      <div className="wrap jump-wrap">
        <JumpCards groups={groups} />
      </div>

      {/* Work: one continuous run of full-width rows, alternating sides */}
      <section className="block">
        <div className="wrap">
          {(() => {
            let i = 0;
            return groups.map((g) => (
              <div key={g.id} className="chapter" data-chapter={g.id}>
                {g.items.map((item) => (
                  <FeatureRow key={item.slug} item={item} figure={figures[item.slug]} flip={i++ % 2 === 1} />
                ))}
              </div>
            ));
          })()}
        </div>
      </section>
    </>
  );
}
