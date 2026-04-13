export interface Persona {
  name: string
  emoji: string
  speech: Record<string, string[]>
}

export const AGENT_KEYS = [
  "build",
  "explore",
  "librarian",
  "oracle",
  "metis",
  "momus",
  "prometheus",
] as const

export type AgentKey = (typeof AGENT_KEYS)[number]
export const NAME_WIDTH = 11

export const personas: Record<AgentKey, Persona> = {
  build: {
    name: "Sisyphus", emoji: "🪨",
    speech: {
      start: ["The boulder rolls again", "One more push", "Back at it", "Let's go", "Another day, another rock"],
      working: ["Pushing uphill...", "Almost there...", "Won't stop now", "Grinding away...", "Step by step..."],
      done: ["Summit reached ✓", "Done. Again.", "The rock holds", "Delivered", "One more behind me"],
      error: ["It rolled back...", "Not this time", "The hill wins today"],
    },
  },
  explore: {
    name: "Explorer", emoji: "🔍",
    speech: {
      start: ["On the trail!", "Scouting ahead", "I smell a clue", "Off I go!", "Let me dig around"],
      working: ["Following a lead...", "Checking every corner", "Almost got it...", "Digging deeper...", "Traces everywhere..."],
      done: ["Found it!", "Case closed", "Right here!", "Mystery solved", "Spotted!"],
      error: ["Trail went cold", "Dead end", "Lost the scent", "Nothing here..."],
    },
  },
  librarian: {
    name: "Librarian", emoji: "📚",
    speech: {
      start: ["Let me check the archives", "I recall something...", "To the stacks!", "One moment please"],
      working: ["Cross-referencing...", "Page 394...", "Checking the index...", "I've seen this before...", "Flipping through..."],
      done: ["Here, this passage", "Documented right here", "The records confirm", "Found the reference"],
      error: ["No entry found", "The archives are silent", "Uncharted territory", "Not in any catalog"],
    },
  },
  oracle: {
    name: "Oracle", emoji: "🧙",
    speech: {
      start: ["You seek guidance?", "The mists part...", "I have foreseen this", "Speak, and I shall see"],
      working: ["Peering beyond...", "The vision forms...", "Consulting the deep...", "Patience, mortal...", "The threads converge..."],
      done: ["The path is clear", "So it shall be", "Wisdom granted", "Heed this well"],
      error: ["The mists are thick", "Even I cannot see", "Fate is unclear", "Beyond my sight"],
    },
  },
  metis: {
    name: "Metis", emoji: "🦉",
    speech: {
      start: ["Analyzing the angles", "Let me think on this", "Hmm, interesting...", "Breaking it down"],
      working: ["Weighing options...", "Mapping the scope...", "Considering tradeoffs...", "Structuring...", "Untangling this..."],
      done: ["Here's the breakdown", "Scope defined", "Clear picture now", "All accounted for"],
      error: ["Too many unknowns", "Ambiguity remains", "Needs more clarity", "Can't scope this yet"],
    },
  },
  momus: {
    name: "Momus", emoji: "🎭",
    speech: {
      start: ["Oh, let me see this", "Time for honesty", "Don't shoot the messenger", "Alright, roast time"],
      working: ["Poking holes...", "Is this really right?", "Hmm, suspicious...", "Not convinced yet...", "Checking the seams..."],
      done: ["Here's what's wrong", "Fixed. You're welcome", "Brutal but fair", "The truth hurts"],
      error: ["Even I'm stumped", "Too broken to critique", "Where do I even start"],
    },
  },
  prometheus: {
    name: "Prometheus", emoji: "🔥",
    speech: {
      start: ["Forging the plan", "Fire in the forge", "Laying the blueprint", "Charting the course"],
      working: ["Shaping the steps...", "Ordering the phases...", "Building the roadmap...", "Connecting the dots...", "Sequencing..."],
      done: ["The plan is set", "Follow this path", "Blueprint ready", "All phases mapped"],
      error: ["Plan needs rework", "Back to the forge", "Sequence broken", "Must restructure"],
    },
  },
}

export function padName(name: string): string {
  return name.padEnd(NAME_WIDTH)
}

export function randomLine(persona: Persona, state: string): string {
  const lines = persona.speech[state]
  if (!lines || lines.length === 0) return ""
  return lines[Math.floor(Math.random() * lines.length)]
}
