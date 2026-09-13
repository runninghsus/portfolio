/**
 * Work, grouped the way oracle.com groups its homepage (Infrastructure /
 * Applications): one group per chapter, each item a full-width row with
 * why it matters, how it was built, one real number, and a diagram.
 *
 * 2025 figures — refresh for 2026. TODO items still need confirmation.
 */

export type Item = {
  slug: string; // also the figure key in src/app/page.tsx
  short: string; // tile title under the hero
  blurb: string; // one line for the tile
  category: string;
  title: string;
  why: string; // one bold line: the problem, or what changed
  how?: string; // one paragraph: approach, and your role in it
  paras?: string[]; // or 2–3 short paragraphs (the 2nd+ collapse on phones)
  figure?: { value: string; label: string }; // real numbers only
  tags: string[];
  status?: "in-progress";
  links?: { label: string; href: string }[];
};

export type Group = {
  id: string;
  kicker: string; // small label above the heading
  heading: string;
  intro: string;
  card: { summary: string; stats: { value: string; label: string }[] }; // jump-card under the hero
  items: Item[];
};


export const groups: Group[] = [
  {
    id: "huntington",
    kicker: "Commercial banking · 2023 – present", // TODO: confirm start year
    heading: "Huntington National Bank",
    card: {
      summary: "Production ML systems, agentic AI systems, and intelligent data applications for commercial banking.",
      stats: [
        { value: "3", label: "validation checks in production" },
        { value: "4", label: "layers in the agent architecture" },
      ],
    },
    intro:
      "Senior Data Scientist: production ML systems → agentic AI systems → intelligent data applications. Predict, reason, act.",
    // Public site: no customer counts, volumes, dollar values, performance numbers, or internal thresholds.
    items: [
      {
        slug: "production-ml",
        short: "Production ML",
        blurb: "A five-stage lifecycle, monitored at three failure points.",
        category: "Production ML · Recommendation & ranking",
        title: "From multiple product models to one production decision system",
        why: "Predict what a client may need next, prioritize what matters, deploy the models, and continuously test whether the system remains trustworthy.",
        paras: [
          "Built and productionized likelihood models across 30+ commercial-banking products, accounting for selection bias in historical offer data and automating recurring evaluation. Led the ranking layer that converts independent model outputs into prioritized recommendations by combining predictive likelihood with economic and customer-context signals — from algorithm design and stakeholder alignment through Model Risk Management and production release. The system now refreshes thousands of recommendations a month, with multiple-fold lift over baseline targeting, and replaced workflows that took one to two days of manual work per cycle.",
          "Designed monitoring around three distinct failure points: data validity between refreshes with Anomalo, model validity through recurring AUC evaluation, and output usefulness through lift against downstream outcomes. Data quality, model quality and decision usefulness are three different questions, so they get three different checks. In 2026, led the signal discovery — customer patterns, peer behavior, emerging needs — that extends the framework into new product areas.",
        ],
        tags: ["Python", "LightGBM", "scikit-learn", "Polars", "Snowflake", "AWS SageMaker", "Evidently AI", "Anomalo"],
      },
      {
        slug: "agentic-ai",
        short: "Agentic AI",
        blurb: "Specialize → discuss → orchestrate → verify, with a person in the loop.",
        category: "Applied AI · Multi-agent systems · 2026",
        title: "Enterprise AI agents designed to reason, collaborate, and verify",
        why: "Specialist agents analyze the data, humans participate in the discussion, an orchestrator reconciles the findings, and a final layer checks conclusions against evidence.",
        paras: [
          "Led development of a four-layer multi-agent architecture for working with enterprise information. Specialist agents independently summarize data, surface key findings, and raise questions. Their outputs enter a discussion layer where agents exchange evidence and incorporate human-in-the-loop feedback.",
          "An orchestrator then consolidates and reconciles competing or overlapping findings into a coherent result. A separate verification layer checks conclusions back against source data where possible and applies structured evaluation where direct verification is harder.",
          "The architecture powers customer and colleague synthesis, recommended actions, grounded content generation, and self-service prospecting — letting sales colleagues work iteratively with enterprise information without SQL or programming expertise. It is being scaled across the commercial bank to hundreds of bankers, cutting customer research from hours to minutes, and is one of eight concurrent AI, ML and analytics workstreams I lead with a team of four senior data scientists. Built as a React front end on a FastAPI service, deployed through Shakudo, with models served from Amazon Bedrock.",
        ],
        tags: ["Python", "FastAPI", "React", "Amazon Bedrock", "Shakudo", "Snowflake"],
      },
      {
        slug: "data-apps",
        short: "Applications",
        blurb: "Resolve → calculate → interact → act.",
        category: "ML applications · Decision systems",
        title: "From messy enterprise data to decisions people can act on",
        why: "Resolve imperfect data, apply analytical logic, and put the result into interactive tools instead of static analysis.",
        paras: [
          "Built applications that turn inconsistent enterprise data into structured decision support using entity resolution, fuzzy matching, analytical calculations, and dynamic user inputs. The same pattern has been applied to prospecting, customer segmentation, and sales prioritization: resolve the underlying data first, then calculate context-specific signals and expose them through an interface where users can explore and act on them.",
          "Developed forward-looking segmentation that combines current relationships, potential opportunity, and strategic priorities; took analytical products from prototype through scheduled production delivery and monitoring in Power BI and Tableau; and built planning applications that connect company strategy with colleague outreach to support executive customer engagement. Together they support decisions across thousands of commercial relationships and prospects. The current direction is to retire static dashboards in favor of these dynamic, agent-backed decision systems.",
        ],
        tags: ["Python", "FastAPI", "React", "Snowflake", "Power BI", "Tableau", "Shakudo", "Fuzzy matching"],
      },
    ],
  },
  {
    id: "phd",
    kicker: "Ph.D. · Computational neuroscience · 2018 – 2023", // TODO: confirm graduation year
    heading: "Carnegie Mellon University",
    card: {
      summary: "Open-source ML for behavior analysis, two first-author Nature-family papers, 160 TB of neural data.",
      stats: [
        { value: "100+", label: "labs run tools I authored" },
        { value: "12%", label: "of labels to beat 49 challenge entries" },
      ],
    },
    intro:
      "Open-source machine-learning tools for behavior analysis, adopted by labs worldwide, and the large-scale pipelines that linked behavior to neural activity.",
    items: [
      {
        slug: "b-soid",
        short: "Open-source ML",
        blurb: "Unsupervised behavior discovery; 100+ labs.",
        category: "Open-source ML · Nature Communications 2021",
        title: "B-SOiD — behavior discovery without a single human label",
        why: "Labs with no programmers can classify animal behavior from pose data in minutes.",
        how: "Pose time-series are embedded with UMAP, clustered with HDBSCAN, and a random-forest classifier is trained on the discovered groups so new video is labeled in milliseconds per frame. Shipped as a desktop app that reads DeepLabCut, SLEAP, and OpenPose files.",
        figure: { value: "100+ labs · 250+ users", label: "216★ on GitHub; the basis for A-SOiD and LUPE" },
        tags: ["Python", "UMAP", "HDBSCAN", "scikit-learn", "Streamlit"],
        links: [{ label: "GitHub", href: "https://github.com/YttriLab/B-SOID" }],
      },
      {
        slug: "a-soid",
        short: "Active learning",
        blurb: "Active learning; 12% of labels beats 49 entries.",
        category: "Active learning · Nature Methods 2024",
        title: "A-SOiD — let the model ask the expert only when it's unsure",
        why: "Supervised behavior classifiers are data-hungry — thousands of hand-labeled frames per behavior. This is a way for the human and the model to do the labeling together.",
        how: "Starts from a handful of labels, trains, and asks the expert only about the frames it isn't confident in; each answer goes back in and the model retrains. An unsupervised “discover” step then splits over-broad classes into behaviors nobody labeled. Co-first author; delivered as a no-code GUI with refinement, prediction, and ethogram tabs.",
        figure: { value: "12%", label: "of the training data needed to beat all 49 AIcrowd challenge entries" },
        tags: ["Python", "Active learning", "scikit-learn", "Streamlit"],
        links: [{ label: "GitHub", href: "https://github.com/YttriLab/A-SOID" }],
      },
      {
        slug: "neural-decoding",
        short: "Neural decoding",
        blurb: "160 TB → behavior read from brain signals alone.",
        category: "Large-scale data · Brain signals",
        title: "Reading behavior from brain chatter alone",
        why: "160 TB of synchronized video and brain recordings turned into predictions of what the animal is doing — from the neural signal, with no camera.",
        how: "Built the recording arena (24/7, four cameras, synthetic daylight), the Arduino-triggered sync between video and Neuropixels with under 33 ms of jitter, and the cloud pipeline that processed the data; then trained decoders that predicted 100,000s of behaviors across three animals and 150+ hours.",
        figure: { value: "160 TB", label: "processed · 100,000s of behaviors decoded" },
        tags: ["PyTorch", "Cloud compute", "Neuropixels", "Arduino"],
      },
    ],
  },
  {
    id: "personal",
    kicker: "Personal · 2026",
    heading: "Personal",
    intro: "A shipped iOS app, designed, built and run end to end — client, backend, AI, release.",
    card: { summary: "Vowel for Weddings — an iOS app for hosts and guests, on the App Store.", stats: [] },
    items: [
      {
        slug: "vowel",
        short: "iOS App",
        blurb: "Answers your wedding guests' questions so you don't have to.",
        category: "Full-stack iOS app · On the App Store",
        title: "Vowel for Weddings — answers your guests' questions so you don't have to",
        why: "Hosts stop fielding the same fifty questions; guests get answers, photos of themselves, and a reason to talk to each other.",
        how: "A native Swift app on a Supabase backend. A wedding assistant answers guests from what the host entered (schedule, venue, dress code, menu) and hands off to the host when it doesn't know; face matching lets guests find themselves in the gallery from a few selfies; nearby-guest discovery, icebreaker profiles, and pinned host announcements round it out. Designed, built, and shipped solo — and first used at my own wedding, by 30+ guests.",
        tags: ["Swift", "Supabase", "Fly.io"],
        links: [{ label: "App Store", href: "https://apps.apple.com/us/app/vowel-for-weddings/id6767973719" }],
      },
    ],
  },
];
