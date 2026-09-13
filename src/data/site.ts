export const site = {
  name: "Alexander Hsu",
  shortName: "Alex Hsu",
  // Hero kicker — leadership first, domain second.
  kicker: "Technical leadership · Stakeholder communication · Business requirements → production ML",
  headline: "I lead the work that turns business questions into production ML — and into decisions people act on.",
  tagline:
    "Nearly a decade of scoping problems with stakeholders, building the systems, and shipping tools people actually use — from open-source research software adopted by 100+ labs to recommendation engines running inside a commercial bank.",
  // Short one-liner for metadata and the résumé header.
  title: "Machine Learning · Technical Leadership · Business Communication",
  location: "United States", // TODO: e.g. "Chicago, IL"
  // Email intentionally not published; LinkedIn is the contact channel.
  // Set this to your deployed URL once live (used for metadata / Open Graph).
  url: "https://runninghsus.github.io",
  links: {
    github: "https://github.com/runninghsus",
    linkedin: "https://www.linkedin.com/in/alexander-hsu23/",
  },
  resumePdf: "/resume.pdf",
} as const;


/**
 * Key numbers for the homepage strip — engineering credentials, readable by a
 * recruiter and meaningful to a technical reviewer. No internal business figures.
 * `value` is the big text, `unit` the small suffix, `label` one line of context.
 */
export const keyFacts: readonly { value: string; unit?: string; label: string }[] = [
  { value: "3", unit: "-stage validation", label: "data · model · decision quality — what keeps production ML trustworthy" },
  { value: "4", unit: "-step AI system", label: "analyze · discuss · reconcile · verify — agents with a person in the loop" },
  { value: "160", unit: "TB", label: "of video and neural data, pipeline built and processed end to end" },
  { value: "100", unit: "+ labs", label: "use open-source ML tools I authored" },
];
