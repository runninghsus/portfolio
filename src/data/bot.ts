/**
 * What the site assistant is allowed to know beyond the page itself.
 * Everything here is public by choice — the bot answers ONLY from the page
 * data plus these facts, and says "I don't know" for anything else.
 */

/** Extra facts a recruiter might ask that the page doesn't state. Leave a line out and the bot will say it doesn't know. */
export const facts: string[] = [
  // "Based in Columbus, Ohio; open to remote and to relocating for the right role.", // TODO: confirm and enable
  // "Authorized to work in the United States without sponsorship.",                // TODO: confirm and enable
  // "Notice period: standard two weeks.",                                           // TODO: confirm and enable
  "Leadership scope at Huntington: leads four senior data scientists across eight concurrent AI, ML and analytics workstreams (commercial growth, customer engagement, data enrichment, decision support); translates business challenges into scoped technical initiatives and delivery plans with business, product, sales, analytics and leadership stakeholders.",
  "Target roles: Principal Machine Learning Engineer, Principal Applied Data Scientist, and ML / data science management roles.",
  "Best way to reach Alex: a message on LinkedIn (linked from the site). No email address or phone number is published on the site.",
  "Ph.D., Neuroscience, Carnegie Mellon University (2023) — Presidential Fellowship, $50K Oracle for Research grant. M.S., Boston University School of Medicine (2016). B.S., University of Illinois at Urbana-Champaign (2013).",
  "Publications: Schweihoff J.F., Hsu A.I. (co-first), et al., “A-SOiD, an active-learning platform for expert-guided, data-efficient discovery of behavior,” Nature Methods, 2024. Hsu A.I., Yttri E.A., “B-SOiD, an open-source unsupervised algorithm for identification and fast prediction of behaviors,” Nature Communications, 2021.",
  "The résumé (one page, PDF) is downloadable from the button at the top of the site.",
  "Skills inventory (from the résumé) — Machine learning: classical ML (scikit-learn), gradient boosting (LightGBM, XGBoost), deep learning (PyTorch, TensorFlow / Keras), learning-to-rank and recommender systems, propensity modeling, active learning, dimensionality reduction (UMAP), clustering (HDBSCAN), evaluation (AUC, lift). Applied AI: Amazon Bedrock, multi-agent orchestration, RAG / grounding, human-in-the-loop systems, verification and structured evaluation. Production ML: AWS SageMaker, Snowflake, scheduled AWS pipelines, Shakudo, Evidently AI, Anomalo, model monitoring, model governance and validation (MRM). Languages: Python, SQL, Swift, TypeScript / JavaScript. Tools: FastAPI, React, Streamlit, Power BI, Tableau, Supabase, Fly.io, Polars / Pandas, Git, Linux.",
];

/** Preset questions, shown three at a time in this order ("More ideas" rotates to the next three). */
export const suggestions: string[] = [
  "Show me the banking work",
  "What value did Alex bring to the bank?",
  "What innovative projects did Alex work on during his PhD?",
  "What does Alex lead today?",
  "How does the agent system verify its answers?",
  "What did Alex build for his own wedding?",
  "Which languages and tools does Alex use?",
  "What makes Alex a fit for a principal ML role?",
  "How do I get Alex's résumé?",
];

/** Topics the bot must refuse, in its own words: internal figures, product names, customers, colleagues. */
export const refusals = "Confidential: dollar figures, revenue or opportunity values, internal metrics or thresholds, model performance numbers, product names, customer or prospect information, colleague names, internal strategy, and anything about the bank not on this site.";

/** One gentle suggested question per row, offered when a visitor lingers on it (at most three per visit). */
export const hints: Record<string, string> = {
  "production-ml": "Why three separate checks instead of one accuracy metric?",
  "agentic-ai": "How does the agent system verify its answers?",
  "data-apps": "What makes these applications different from dashboards?",
  "b-soid": "How does B-SOiD find behaviors without labels?",
  "a-soid": "When does A-SOiD ask the expert, and when doesn't it?",
  "neural-decoding": "How was 160 TB of video and brain data processed?",
  vowel: "What does the wedding app's assistant do when it doesn't know?",
};
