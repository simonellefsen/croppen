export const LOCALES = ["da", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** English is the fallback locale — every key must exist here. */
export const en = {
  appName: "Croppen",
  tagline: "An amazing tour of human anatomy",

  // Onboarding
  introTitle: "Explore the human body",
  introBody:
    "Peel away the layers — skin, muscle, organs, bone — and tap anything you see to learn its name and what it does.",
  introStart: "Start exploring",
  introSkip: "Skip",
  introPickBody: "Choose a body",
  introPickAppearance: "Choose an appearance",
  introNote:
    "Skin tone comes from melanin in the outermost layer. Everything beneath it — every muscle, bone and organ — is the same in all of us.",

  // Chrome
  install: "Install app",
  installed: "Installed",
  language: "Language",
  close: "Close",
  back: "Back",
  reset: "Reset view",
  offlineReady: "Ready to use offline",

  // Body selectors
  body: "Body",
  bodyFemale: "Female",
  bodyMale: "Male",
  appearance: "Appearance",
  fitzpatrick: "Fitzpatrick type",

  // Depth
  depth: "Dissection depth",
  depthHint: "Drag to dissect",
  layerSkin: "Skin",
  layerMuscles: "Muscles",
  layerOrgans: "Organs",
  layerSkeleton: "Skeleton",
  layerSkinSub: "The body's largest organ",
  layerMusclesSub: "640 muscles that move you",
  layerOrgansSub: "The organs inside the trunk",
  layerSkeletonSub: "206 bones holding you up",

  // Systems
  systems: "Body systems",
  systemsHint: "Overlay a network on top of the current layer",
  sysCirculatory: "Circulatory",
  sysNervous: "Nervous",
  sysLymphatic: "Lymphatic",
  sysEndocrine: "Endocrine",
  sysCirculatorySub: "Heart, arteries and veins",
  sysNervousSub: "Brain, spinal cord and nerves",
  sysLymphaticSub: "Defence and drainage",
  sysEndocrineSub: "Hormone glands",

  // Tools
  tools: "Tools",
  scalpel: "Scalpel",
  scalpelOn: "Scalpel on",
  scalpelHint: "Move a window over the body to see one layer deeper",
  labels: "Labels",
  pulse: "Heartbeat",
  pulseHint: "Animate blood flow and breathing",

  // Info panel
  tapPrompt: "Tap a structure",
  tapPromptSub: "Anything on the body will tell you about itself.",
  latin: "Latin",
  partOf: "Part of",
  didYouKnow: "Did you know?",
  relatedLayer: "Layer",

  // Quiz
  quiz: "Quiz",
  quizTitle: "Find it",
  quizIntro:
    "We name a structure — you find it on the body. Ten rounds, no time limit.",
  quizStart: "Start quiz",
  quizFind: "Find:",
  quizCorrect: "Correct!",
  quizWrong: "Not quite — that's",
  quizNext: "Next",
  quizScore: "Score",
  quizRound: "Round",
  quizDone: "Quiz complete",
  quizAgain: "Play again",
  quizExit: "Back to explorer",
  quizResultPerfect: "Flawless. You could teach this.",
  quizResultGood: "Strong work — most of that stuck.",
  quizResultOk: "A decent start. Go explore and try again.",
  quizHintLayer: "It's in this layer:",

  // Explore modes
  modeExplore: "Explore",
  modeQuiz: "Quiz",

  // Misc
  a11yBody: "Interactive anatomical figure",
  sourceNote:
    "Inspired by the layered anatomical plates in Richard Walker's Kroppen. All artwork here is original.",
} as const;

export type StringKey = keyof typeof en;

export const da: Record<StringKey, string> = {
  appName: "Croppen",
  tagline: "En fantastisk rejse gennem dit indre",

  introTitle: "Udforsk menneskekroppen",
  introBody:
    "Skræl lagene af — hud, muskler, organer, knogler — og tryk på hvad som helst for at høre, hvad det hedder, og hvad det gør.",
  introStart: "Begynd rejsen",
  introSkip: "Spring over",
  introPickBody: "Vælg en krop",
  introPickAppearance: "Vælg et udseende",
  introNote:
    "Hudfarve skyldes melanin i det yderste lag. Alt indenunder — hver muskel, knogle og organ — er ens hos os alle.",

  install: "Installér app",
  installed: "Installeret",
  language: "Sprog",
  close: "Luk",
  back: "Tilbage",
  reset: "Nulstil visning",
  offlineReady: "Klar til brug offline",

  body: "Krop",
  bodyFemale: "Kvinde",
  bodyMale: "Mand",
  appearance: "Udseende",
  fitzpatrick: "Fitzpatrick-type",

  depth: "Dissektionsdybde",
  depthHint: "Træk for at dissekere",
  layerSkin: "Hud",
  layerMuscles: "Muskler",
  layerOrgans: "Organer",
  layerSkeleton: "Skelet",
  layerSkinSub: "Kroppens største organ",
  layerMusclesSub: "640 muskler, der bevæger dig",
  layerOrgansSub: "Organerne inde i kroppen",
  layerSkeletonSub: "206 knogler, der bærer dig",

  systems: "Kropssystemer",
  systemsHint: "Læg et netværk oven på det aktuelle lag",
  sysCirculatory: "Hjerte-kar",
  sysNervous: "Nervesystem",
  sysLymphatic: "Lymfesystem",
  sysEndocrine: "Endokrine system",
  sysCirculatorySub: "Hjerte, arterier og vener",
  sysNervousSub: "Hjerne, rygmarv og nerver",
  sysLymphaticSub: "Forsvar og dræning",
  sysEndocrineSub: "Hormonkirtler",

  tools: "Værktøj",
  scalpel: "Skalpel",
  scalpelOn: "Skalpel til",
  scalpelHint: "Før et vindue hen over kroppen og se ét lag dybere",
  labels: "Etiketter",
  pulse: "Hjerteslag",
  pulseHint: "Animér blodets strøm og vejrtrækningen",

  tapPrompt: "Tryk på en struktur",
  tapPromptSub: "Alt på kroppen fortæller om sig selv.",
  latin: "Latin",
  partOf: "Del af",
  didYouKnow: "Vidste du?",
  relatedLayer: "Lag",

  quiz: "Quiz",
  quizTitle: "Find den",
  quizIntro:
    "Vi nævner en struktur — du finder den på kroppen. Ti runder, ingen tidsgrænse.",
  quizStart: "Start quiz",
  quizFind: "Find:",
  quizCorrect: "Rigtigt!",
  quizWrong: "Ikke helt — det er",
  quizNext: "Næste",
  quizScore: "Point",
  quizRound: "Runde",
  quizDone: "Quiz gennemført",
  quizAgain: "Spil igen",
  quizExit: "Tilbage til udforskning",
  quizResultPerfect: "Fejlfrit. Du kunne undervise i det her.",
  quizResultGood: "Flot — det meste sad fast.",
  quizResultOk: "En fin begyndelse. Udforsk lidt mere, og prøv igen.",
  quizHintLayer: "Den er i dette lag:",

  modeExplore: "Udforsk",
  modeQuiz: "Quiz",

  a11yBody: "Interaktiv anatomisk figur",
  sourceNote:
    "Inspireret af de lagdelte anatomiske plancher i Richard Walkers Kroppen. Al grafik her er original.",
};

export const dictionaries: Record<Locale, Record<StringKey, string>> = {
  en,
  da,
};

export const localeNames: Record<Locale, string> = {
  en: "English",
  da: "Dansk",
};
