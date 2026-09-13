/**
 * Step captions for every schematic, shared by the tutorials (client) and the
 * site assistant's prompt (server), so the bot can send a visitor to a specific step.
 */
export type Step = { title: string; note?: string };

export const tutorialSteps: Record<string, { label: string; steps: Step[] }> = {
  "b-soid": {
    label: "How B-SOiD works",
    steps: [
      { title: "Track the animal: a pose estimate on every video frame", note: "8 keypoints, (x, y) per frame" },
      { title: "Turn keypoints into numbers over time", note: "distances, angles, speeds" },
      { title: "Compress and cluster — each cluster is a behavior", note: "found in the data, not defined by a person" },
      { title: "Label new video frame by frame, in milliseconds", note: "" },
      { title: "No human labels. Used by 100+ labs", note: "Nature Communications 2021 · 216★ on GitHub" },
    ],
  },
  "a-soid": {
    label: "How A-SOiD works",
    steps: [
      { title: "Start with a handful of labeled frames", note: "out of thousands" },
      { title: "The model labels every frame — with a confidence", note: "" },
      { title: "Confident ones: keep the model's label", note: "no human time spent" },
      { title: "Unsure ones: ask the expert — only those", note: "" },
      { title: "Their labels go back in. Retrain, repeat", note: "" },
      { title: "Same accuracy, 12% of the labels", note: "vs. labeling everything by hand · Nature Methods 2024" },
    ],
  },
  "neural-decoding": {
    label: "Decoding behavior from brain chatter",
    steps: [
      { title: "Record: 4 cameras around the clock, a 384-site probe in the brain", note: "video and brain signals synced to under 33 ms" },
      { title: "Brain chatter: spikes streaming from every layer", note: "cortex to striatum" },
      { title: "Decode: predict what the animal is doing from the chatter alone", note: "a decoder trained per animal" },
      { title: "Check it against what the cameras saw", note: "B-SOiD labels from the video" },
      { title: "160 TB · 150+ hours · 3 animals", note: "100,000s of behaviors decoded" },
    ],
  },
  "vowel": {
    label: "How Vowel works",
    steps: [
      { title: "The host enters the details once", note: "schedule, venue, dress code, menu" },
      { title: "Guests ask in the app; the assistant answers from those details", note: "" },
      { title: "When it doesn't know, it hands the question to the host", note: "no made-up answers" },
      { title: "Guests also find their photos, see who's nearby, get announcements", note: "" },
      { title: "Vowel for Weddings — on the App Store", note: "Swift · SwiftUI · Supabase" },
    ],
  },
  "production-ml": {
    label: "The production ML lifecycle",
    steps: [
      { title: "Data — recurring features and historical outcomes", note: "refreshed on a schedule; selection bias in past offers handled explicitly" },
      { title: "Model — train and evaluate predictive models", note: "one likelihood model per product area, on a shared framework" },
      { title: "Decision — combine model outputs into one prioritization", note: "predictive likelihood + economic and customer-context signals → a ranked list of actions" },
      { title: "Deploy — deliver recommendations into the workflow", note: "in the tool bankers already use, with the reason attached" },
      { title: "Monitor — validate data, model performance and output usefulness", note: "refresh vs refresh · AUC over time · lift against downstream outcomes" },
    ],
  },
  "agentic-ai": {
    label: "The four-layer agent architecture",
    steps: [
      { title: "Specialists — summarize · find · question", note: "each agent takes one slice of the problem; no single model is handed everything" },
      { title: "Discussion — agents ↔ agents ↔ human", note: "evidence is exchanged, disagreements surface, and a person adds context or challenges a conclusion" },
      { title: "Orchestrator — consolidate · summarize · reconcile", note: "overlapping, duplicated or inconsistent findings become one coherent result" },
      { title: "Verification — check conclusions against evidence", note: "directly against source data where possible; structured evaluation where it isn't" },
    ],
  },
  "data-apps": {
    label: "From messy data to a decision",
    steps: [
      { title: "Resolve — messy enterprise data", note: "entity resolution and fuzzy matching turn inconsistent records into one structured signal" },
      { title: "Calculate — signals · segmentation · business logic", note: "context-specific calculations, not a static table" },
      { title: "Interact — dynamic user inputs", note: "change an assumption and the recommendation changes with it" },
      { title: "Act — prospecting · outreach · planning", note: "the decision happens in the tool, not in a deck" },
    ],
  },
};
