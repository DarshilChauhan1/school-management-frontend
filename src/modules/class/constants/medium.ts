export const MEDIUM_OF_INSTRUCTION = [
  "ENGLISH",
  "HINDI",
  "GUJARATI",
  "MARATHI",
  "TAMIL",
  "TELUGU",
  "KANNADA",
  "MALAYALAM",
  "BENGALI",
  "PUNJABI",
  "ODIA",
  "ASSAMESE",
  "URDU",
  "SANSKRIT",
  "OTHER",
] as const;

export type MediumOfInstruction = (typeof MEDIUM_OF_INSTRUCTION)[number];

const TITLE_OVERRIDES: Partial<Record<MediumOfInstruction, string>> = {
  ENGLISH: "English",
  HINDI: "Hindi",
  GUJARATI: "Gujarati",
  MARATHI: "Marathi",
  TAMIL: "Tamil",
  TELUGU: "Telugu",
  KANNADA: "Kannada",
  MALAYALAM: "Malayalam",
  BENGALI: "Bengali",
  PUNJABI: "Punjabi",
  ODIA: "Odia",
  ASSAMESE: "Assamese",
  URDU: "Urdu",
  SANSKRIT: "Sanskrit",
  OTHER: "Other (specify)",
};

export const mediumLabel = (value: MediumOfInstruction): string =>
  TITLE_OVERRIDES[value] ?? value;

export const MEDIUM_OPTIONS = MEDIUM_OF_INSTRUCTION.map((value) => ({
  label: mediumLabel(value),
  value,
}));
