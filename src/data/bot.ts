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

/** Starter questions shown in the panel before the visitor types. */
export const suggestions: string[] = [
  "What did Alex build at Huntington?",
  "Show me how the agent system verifies its answers",
  "What is B-SOiD and who uses it?",
  "Just show me the banking work",
];

/** Topics the bot must refuse, in its own words: internal figures, product names, customers, colleagues. */
export const refusals = "Confidential: dollar figures, revenue or opportunity values, internal metrics or thresholds, model performance numbers, product names, customer or prospect information, colleague names, internal strategy, and anything about the bank not on this site.";
