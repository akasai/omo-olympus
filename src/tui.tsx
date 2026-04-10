/** @jsxImportSource @opentui/solid */
import { createSignal } from "solid-js"
import type {
  TuiPlugin,
  TuiPluginModule,
  TuiSlotContext,
} from "@opencode-ai/plugin/tui"

interface Persona {
  name: string
  emoji: string
  speech: Record<string, string[]>
}

const AGENT_KEYS = [
  "build",
  "explore",
  "librarian",
  "oracle",
  "metis",
  "momus",
  "prometheus",
] as const

type AgentKey = (typeof AGENT_KEYS)[number]

const NAME_WIDTH = 11

const personas: Record<AgentKey, Persona> = {
  build: {
    name: "Sisyphus", emoji: "🪨",
    speech: {
      start:   ["The boulder rolls again", "One more push", "Back at it", "Let's go", "Another day, another rock"],
      working: ["Pushing uphill...", "Almost there...", "Won't stop now", "Grinding away...", "Step by step..."],
      done:    ["Summit reached ✓", "Done. Again.", "The rock holds", "Delivered", "One more behind me"],
      error:   ["It rolled back...", "Not this time", "The hill wins today"],
    },
  },
  explore: {
    name: "Explorer", emoji: "🔍",
    speech: {
      start:   ["On the trail!", "Scouting ahead", "I smell a clue", "Off I go!", "Let me dig around"],
      working: ["Following a lead...", "Checking every corner", "Almost got it...", "Digging deeper...", "Traces everywhere..."],
      done:    ["Found it!", "Case closed", "Right here!", "Mystery solved", "Spotted!"],
      error:   ["Trail went cold", "Dead end", "Lost the scent", "Nothing here..."],
    },
  },
  librarian: {
    name: "Librarian", emoji: "📚",
    speech: {
      start:   ["Let me check the archives", "I recall something...", "To the stacks!", "One moment please"],
      working: ["Cross-referencing...", "Page 394...", "Checking the index...", "I've seen this before...", "Flipping through..."],
      done:    ["Here, this passage", "Documented right here", "The records confirm", "Found the reference"],
      error:   ["No entry found", "The archives are silent", "Uncharted territory", "Not in any catalog"],
    },
  },
  oracle: {
    name: "Oracle", emoji: "🧙",
    speech: {
      start:   ["You seek guidance?", "The mists part...", "I have foreseen this", "Speak, and I shall see"],
      working: ["Peering beyond...", "The vision forms...", "Consulting the deep...", "Patience, mortal...", "The threads converge..."],
      done:    ["The path is clear", "So it shall be", "Wisdom granted", "Heed this well"],
      error:   ["The mists are thick", "Even I cannot see", "Fate is unclear", "Beyond my sight"],
    },
  },
  metis: {
    name: "Metis", emoji: "🦉",
    speech: {
      start:   ["Analyzing the angles", "Let me think on this", "Hmm, interesting...", "Breaking it down"],
      working: ["Weighing options...", "Mapping the scope...", "Considering tradeoffs...", "Structuring...", "Untangling this..."],
      done:    ["Here's the breakdown", "Scope defined", "Clear picture now", "All accounted for"],
      error:   ["Too many unknowns", "Ambiguity remains", "Needs more clarity", "Can't scope this yet"],
    },
  },
  momus: {
    name: "Momus", emoji: "🎭",
    speech: {
      start:   ["Oh, let me see this", "Time for honesty", "Don't shoot the messenger", "Alright, roast time"],
      working: ["Poking holes...", "Is this really right?", "Hmm, suspicious...", "Not convinced yet...", "Checking the seams..."],
      done:    ["Here's what's wrong", "Fixed. You're welcome", "Brutal but fair", "The truth hurts"],
      error:   ["Even I'm stumped", "Too broken to critique", "Where do I even start"],
    },
  },
  prometheus: {
    name: "Prometheus", emoji: "🔥",
    speech: {
      start:   ["Forging the plan", "Fire in the forge", "Laying the blueprint", "Charting the course"],
      working: ["Shaping the steps...", "Ordering the phases...", "Building the roadmap...", "Connecting the dots...", "Sequencing..."],
      done:    ["The plan is set", "Follow this path", "Blueprint ready", "All phases mapped"],
      error:   ["Plan needs rework", "Back to the forge", "Sequence broken", "Must restructure"],
    },
  },
}

function padName(name: string): string {
  return name.padEnd(NAME_WIDTH)
}

function randomLine(persona: Persona, state: string): string {
  const lines = persona.speech[state]
  if (!lines || lines.length === 0) return ""
  return lines[Math.floor(Math.random() * lines.length)]
}

const PENDING_FILE = "/tmp/omo-pending.json"
const _fs = require("fs")

interface PendingEntry { agent: string; ts: number }

function readPending(): PendingEntry[] {
  try { return JSON.parse(_fs.readFileSync(PENDING_FILE, "utf-8")) } catch { return [] }
}
function writePending(list: PendingEntry[]) {
  try { _fs.writeFileSync(PENDING_FILE, JSON.stringify(list)) } catch {}
}
function popPending(): string | null {
  const list = readPending()
  if (list.length === 0) return null
  const entry = list.shift()!
  writePending(list)
  return entry.agent
}

interface AgentState {
  active: boolean
  speech: string
}

const sessionAgentMap = new Map<string, AgentKey>()

const tui: TuiPlugin = async (api, _options, _meta) => {
  const signals: Record<AgentKey, [() => AgentState, (s: AgentState) => void]> = {} as any
  for (const key of AGENT_KEYS) {
    signals[key] = createSignal<AgentState>({ active: false, speech: "" })
  }

  function getAgent(key: AgentKey): AgentState { return signals[key][0]() }
  function setAgent(key: AgentKey, state: AgentState) { signals[key][1](state) }

  function activateAgent(key: AgentKey, state: string) {
    setAgent(key, { active: true, speech: randomLine(personas[key], state) })
  }

  function sleepAgent(key: AgentKey) {
    setAgent(key, { active: false, speech: "" })
  }

  function finishAgent(key: AgentKey) {
    setAgent(key, { active: true, speech: randomLine(personas[key], "done") })
    setTimeout(() => sleepAgent(key), 3000)
  }

  activateAgent("build", "start")

  api.event.on("session.created", (event: any) => {
    const info = event.properties?.info
    if (info?.parentID) {
      const agentName = popPending()
      const key: AgentKey = (agentName && agentName in personas)
        ? agentName as AgentKey
        : "build"
      sessionAgentMap.set(info.id, key)
      activateAgent(key, "start")
    }
  })

  api.event.on("session.status" as any, (event: any) => {
    const sessionId = event.properties?.sessionID
    const status = event.properties?.status?.type
    const key = sessionAgentMap.get(sessionId ?? "")

    if (key && key !== "build") {
      if (status === "busy") activateAgent(key, "working")
      if (status === "idle") finishAgent(key)
    } else if (!key) {
      if (status === "busy") {
        activateAgent("build", "working")
      } else if (status === "idle") {
        setAgent("build", { active: true, speech: randomLine(personas.build, "done") })
      }
    }
  })

  const [open, setOpen] = createSignal(true)

  api.slots.register({
    order: 50,
    slots: {
      sidebar_content(ctx: TuiSlotContext, _props: any) {
        const t = ctx.theme.current
        const toHex = (c: any): string | undefined => {
          if (!c?.buffer) return undefined
          const b = c.buffer
          const r = Math.round(b[0] * 255)
          const g = Math.round(b[1] * 255)
          const bl = Math.round(b[2] * 255)
          return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${bl.toString(16).padStart(2,"0")}`
        }
        const accent = toHex(t.primary) ?? "#82AAFF"
        const speech_color = toHex(t.textMuted) ?? "#546E7A"
        const dim = toHex(t.textMuted) ?? "#546E7A"
        const fg = toHex(t.text) ?? "#EEFFFF"
        const isOpen = open()
        const activeCount = AGENT_KEYS.filter((k) => getAgent(k).active).length

        return (
          <box flexDirection="column" marginBottom={1}>
            <box height={1} flexDirection="row" onMouseDown={() => setOpen(!open())}>
              <text bold color={accent}>
                {isOpen ? "▼" : "▶"}{" Olympus"}
              </text>
              {!isOpen ? <text fg={dim}>{` (${activeCount} agents)`}</text> : null}
            </box>
            {isOpen ? AGENT_KEYS.map((key) => {
              const persona = personas[key]
              const state = getAgent(key)

              return (
                <box height={1} flexDirection="row">
                  <text color={state.active ? accent : dim}>
                    {` ${persona.emoji} ${padName(persona.name)} `}
                  </text>
                  <text color={state.active ? speech_color : dim} fg={state.active ? speech_color : dim}>
                    {state.active ? state.speech : "💤"}
                  </text>
                </box>
              )
            }) : null}
          </box>
        ) as any
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = {
  id: "omo-olympus",
  tui,
}

export default plugin
