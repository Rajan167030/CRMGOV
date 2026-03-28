export const AUTO_LANGUAGE = "auto";
export const DEFAULT_LANGUAGE = "en-IN";

export const LANGUAGE_OPTIONS = [
  { value: AUTO_LANGUAGE, label: "Auto detect" },
  { value: "en-IN", label: "English" },
  { value: "hi-IN", label: "Hindi" },
  { value: "bn-IN", label: "Bengali" },
  { value: "ta-IN", label: "Tamil" },
  { value: "te-IN", label: "Telugu" },
  { value: "mr-IN", label: "Marathi" },
  { value: "gu-IN", label: "Gujarati" },
  { value: "kn-IN", label: "Kannada" },
  { value: "ml-IN", label: "Malayalam" },
  { value: "pa-IN", label: "Punjabi" },
];

const COMMON_COPY = {
  micNotSupported:
    "Speech recognition is not supported in this browser. Try Chrome or Edge.",
  voiceNotSupported:
    "Voice playback is not supported in this browser.",
  speechServiceBlocked:
    "Your microphone is available, but the browser speech recognition service is blocked or unavailable. Try Chrome or Edge on localhost or HTTPS.",
  insecureContext:
    "Voice input needs a secure page. Open the app on localhost or HTTPS and try again.",
  noMicrophone:
    "No microphone was detected. Connect a mic and try again.",
};

const LANGUAGE_COPY = {
  "en-IN": {
    assistantMessage:
      "Hello! You can type or speak your complaint. I will collect the missing details and help file it.",
    description:
      "Talk to the grievance model with text or voice. The assistant listens in your language and can read replies aloud.",
    placeholder: "Describe the issue and exact location",
    submitting: "Assistant is reviewing your complaint...",
    listening: "Listening...",
    send: "Send",
    stop: "Stop",
    startVoice: "Start voice",
    stopVoice: "Stop voice",
    voiceOn: "Voice replies on",
    voiceOff: "Voice replies off",
    askLocation: () =>
      "Please share the exact location or a nearby landmark.",
    askDetails: () =>
      "Please describe the issue a little more clearly so I can register it.",
    genericFollowUp: () =>
      "I received your message. Please share more details or confirm the complaint.",
    ticketSummary: ({ ticketId, department, location }) =>
      `Your complaint has been registered${department ? ` with ${department}` : ""}${location ? ` for ${location}` : ""}. Ticket ID: ${ticketId}.`,
    prompts: [
      "There is a water leakage near Sector 12 market.",
      "A pothole on MG Road is causing traffic issues.",
      "Garbage is not being collected in Ward 8.",
    ],
  },
  "hi-IN": {
    assistantMessage:
      "Namaste! Aap apni complaint type ya bolkar bhej sakte hain. Main zaroori details lekar complaint file karne mein madad karunga.",
    description:
      "Grievance model se text ya voice mein baat kijiye. Assistant aapki language pakad kar sunega aur jawab bolkar suna sakta hai.",
    placeholder: "Issue aur exact location batayein",
    submitting: "Assistant aapki complaint dekh raha hai...",
    listening: "Sun raha hoon...",
    send: "Bhejein",
    stop: "Rokein",
    startVoice: "Voice shuru",
    stopVoice: "Voice rokein",
    voiceOn: "Voice jawab on",
    voiceOff: "Voice jawab off",
    askLocation: () =>
      "Kripya exact location ya koi paas ka landmark batayein.",
    askDetails: () =>
      "Kripya issue ko thoda aur clearly batayein taki complaint register ho sake.",
    genericFollowUp: () =>
      "Maine aapka message le liya hai. Kripya aur details dein ya complaint confirm karein.",
    ticketSummary: ({ ticketId, department, location }) =>
      `Aapki complaint${department ? ` ${department} department ke liye` : ""}${location ? ` ${location} ke liye` : ""} register ho gayi hai. Ticket ID: ${ticketId}.`,
    prompts: [
      "Sector 12 market ke paas paani leak ho raha hai.",
      "MG Road par bada pothole hai aur traffic jam ho raha hai.",
      "Ward 8 mein garbage collect nahi ho raha hai.",
    ],
  },
};

const SCRIPT_RULES = [
  { regex: /[\u0B80-\u0BFF]/, language: "ta-IN" },
  { regex: /[\u0C00-\u0C7F]/, language: "te-IN" },
  { regex: /[\u0980-\u09FF]/, language: "bn-IN" },
  { regex: /[\u0A80-\u0AFF]/, language: "gu-IN" },
  { regex: /[\u0C80-\u0CFF]/, language: "kn-IN" },
  { regex: /[\u0D00-\u0D7F]/, language: "ml-IN" },
  { regex: /[\u0A00-\u0A7F]/, language: "pa-IN" },
  { regex: /[\u0900-\u097F]/, language: "hi-IN" },
];

const KEYWORD_RULES = [
  {
    language: "hi-IN",
    keywords: [
      "mera",
      "meri",
      "mujhe",
      "paani",
      "sadak",
      "kachra",
      "shikayat",
      "bijli",
      "kripya",
    ],
  },
  {
    language: "mr-IN",
    keywords: ["majha", "majhi", "panyacha", "takrar", "krupaya"],
  },
  {
    language: "ta-IN",
    keywords: ["ennai", "thanni", "pugaar", "veedu", "inga"],
  },
  {
    language: "te-IN",
    keywords: ["naaku", "neellu", "firyaadu", "ikkada", "samasya"],
  },
];

const FALLBACK_MODEL_REPLY = "I processed your complaint update.";
const PREMIUM_VOICE_MARKERS = [
  "neural",
  "natural",
  "wavenet",
  "premium",
  "enhanced",
  "online",
  "google",
  "microsoft",
];
const LANGUAGE_VOICE_MARKERS = {
  "hi-IN": ["hindi", "india", "bharat"],
  "en-IN": ["india", "indian"],
  "bn-IN": ["bengali", "bangla"],
  "ta-IN": ["tamil"],
  "te-IN": ["telugu"],
  "mr-IN": ["marathi"],
  "gu-IN": ["gujarati"],
  "kn-IN": ["kannada"],
  "ml-IN": ["malayalam"],
  "pa-IN": ["punjabi"],
};
const VOICE_TUNING = {
  "en-IN": { rate: 0.98, pitch: 1, volume: 1 },
  "hi-IN": { rate: 0.9, pitch: 1, volume: 1 },
  "bn-IN": { rate: 0.94, pitch: 1, volume: 1 },
  "ta-IN": { rate: 0.93, pitch: 1, volume: 1 },
  "te-IN": { rate: 0.93, pitch: 1, volume: 1 },
};

export const getSpeechRecognitionConstructor = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

export const hasSpeechSynthesisSupport = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

export const detectLanguage = (text) => {
  if (typeof text !== "string" || !text.trim()) {
    return DEFAULT_LANGUAGE;
  }

  for (const rule of SCRIPT_RULES) {
    if (rule.regex.test(text)) {
      return rule.language;
    }
  }

  const normalized = text.toLowerCase();
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.language;
    }
  }

  return DEFAULT_LANGUAGE;
};

export const resolveLanguage = (preferredLanguage, sampleText = "") => {
  if (
    typeof preferredLanguage === "string" &&
    preferredLanguage &&
    preferredLanguage !== AUTO_LANGUAGE
  ) {
    return preferredLanguage;
  }

  return detectLanguage(sampleText);
};

export const getVoiceUiCopy = (language) =>
  LANGUAGE_COPY[language] || LANGUAGE_COPY[DEFAULT_LANGUAGE];

export const extractModelReply = (response) =>
  response?.reply ||
  response?.final_message ||
  response?.question ||
  FALLBACK_MODEL_REPLY;

export const extractModelTicketId = (response) =>
  response?.ticket_id ||
  response?.ticketId ||
  response?.complaint_id ||
  response?.complaintId ||
  "";

export const extractModelLocation = (response) => {
  const locationFromSlots = response?.slots?.LOCATION?.trim();
  if (locationFromSlots) {
    return locationFromSlots;
  }

  const struct = response?.location_struct;
  if (!struct || typeof struct !== "object") {
    return "";
  }

  const parts = [struct.area, struct.landmark, struct.city, struct.pincode]
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim());

  return [...new Set(parts)].join(", ");
};

export const buildLocalizedAssistantReply = (response, language) => {
  const copy = getVoiceUiCopy(language);
  const reply = extractModelReply(response);
  const ticketId = extractModelTicketId(response);

  if (ticketId) {
    return copy.ticketSummary({
      ticketId,
      department: response?.department || "",
      location: extractModelLocation(response),
    });
  }

  if (/exact location|nearby landmark|share the exact location/i.test(reply)) {
    return copy.askLocation();
  }

  if (
    /provide more details|describe the issue|more detail|clearly/i.test(reply)
  ) {
    return copy.askDetails();
  }

  if (/message received|processed your complaint update/i.test(reply)) {
    return copy.genericFollowUp();
  }

  return reply;
};

export const getVoiceTuning = (language) =>
  VOICE_TUNING[language] || { rate: 0.96, pitch: 1, volume: 1 };

export const pickBestSpeechVoice = (voices, language) => {
  if (!Array.isArray(voices) || voices.length === 0) {
    return null;
  }

  const normalizedLanguage = (language || DEFAULT_LANGUAGE).toLowerCase();
  const languagePrefix = normalizedLanguage.split("-")[0];
  const languageMarkers = LANGUAGE_VOICE_MARKERS[language] || [];

  const scoredVoices = voices.map((voice) => {
    const voiceLanguage = voice.lang?.toLowerCase() || "";
    const voiceName = voice.name?.toLowerCase() || "";
    let score = 0;

    if (voiceLanguage === normalizedLanguage) {
      score += 120;
    } else if (voiceLanguage.startsWith(`${languagePrefix}-`)) {
      score += 100;
    } else if (voiceLanguage.startsWith(languagePrefix)) {
      score += 85;
    } else if (voiceLanguage.startsWith("en-")) {
      score += 20;
    }

    if (voice.localService) {
      score += 8;
    }

    if (PREMIUM_VOICE_MARKERS.some((marker) => voiceName.includes(marker))) {
      score += 20;
    }

    if (languageMarkers.some((marker) => voiceName.includes(marker))) {
      score += 12;
    }

    return {
      voice,
      score,
    };
  });

  scoredVoices.sort((left, right) => right.score - left.score);
  return scoredVoices[0]?.score > 0 ? scoredVoices[0].voice : null;
};

export const getVoiceSupport = () => ({
  recognition: Boolean(getSpeechRecognitionConstructor()),
  synthesis: hasSpeechSynthesisSupport(),
  secureContext:
    typeof window !== "undefined"
      ? window.isSecureContext ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      : false,
  mediaDevices:
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia),
});

export const getCommonVoiceCopy = () => COMMON_COPY;
