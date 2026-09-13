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
  "Target roles: Principal Machine Learning Engineer, Principal Applied Data Scientist, and ML / data science management roles.",
  "Best way to reach Alex: a message on LinkedIn (linked from the site). No email address or phone number is published on the site.",
  "Ph.D., Neuroscience, Carnegie Mellon University (2023) — Presidential Fellowship, $50K Oracle for Research grant. M.S., Boston University School of Medicine (2016). B.S., University of Illinois at Urbana-Champaign (2013).",
  "Publications: Schweihoff J.F., Hsu A.I. (co-first), et al., “A-SOiD, an active-learning platform for expert-guided, data-efficient discovery of behavior,” Nature Methods, 2024. Hsu A.I., Yttri E.A., “B-SOiD, an open-source unsupervised algorithm for identification and fast prediction of behaviors,” Nature Communications, 2021.",
  "The résumé (one page, PDF) is downloadable from the button at the top of the site.",
];

/** Starter questions shown in the panel before the visitor types. */
export const suggestions: string[] = [
  "What did Alex build at Huntington?",
  "How does the agent system verify its answers?",
  "What is B-SOiD and who uses it?",
  "What roles is Alex looking for?",
];

/** Topics the bot must refuse, in its own words: internal figures, product names, customers, colleagues. */
export const refusals = "Confidential: dollar figures, revenue or opportunity values, internal metrics or thresholds, model performance numbers, product names, customer or prospect information, colleague names, internal strategy, and anything about the bank not on this site.";
