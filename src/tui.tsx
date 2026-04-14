/** @jsxImportSource @opentui/solid */
import { createSignal } from "solid-js"
import type {
  TuiPlugin,
  TuiPluginModule,
  TuiSlotContext,
} from "@opencode-ai/plugin/tui"

// ── personas (inlined — opencode loads single-file plugins only) ──
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

function padName(name: string): string {
  return name.padEnd(NAME_WIDTH)
}

function randomLine(persona: Persona, state: string): string {
  const lines = persona.speech[state]
  if (!lines || lines.length === 0) return ""
  return lines[Math.floor(Math.random() * lines.length)]
}

const PENDING_FILE = "/tmp/omo-pending.json"
const MODE_FILE = "/tmp/omo-mode.json"
const _fs = require("fs")

function readMode(): "prometheus" | "build" {
  try {
    const data = JSON.parse(_fs.readFileSync(MODE_FILE, "utf-8"))
    return data.mode === "prometheus" ? "prometheus" : "build"
  } catch { return "build" }
}

interface PendingEntry { agent: string; ts: number }

function readPending(): PendingEntry[] {
  try { return JSON.parse(_fs.readFileSync(PENDING_FILE, "utf-8")) } catch { return [] }
}
function writePending(list: PendingEntry[]) {
  try { _fs.writeFileSync(PENDING_FILE, JSON.stringify(list)) } catch {}
}
function popPending(): string | null {
  const list = readPending()
  while (list.length > 0) {
    const entry = list.shift()!
    if (entry.agent === "__done__") continue
    writePending(list)
    return entry.agent
  }
  writePending(list)
  return null
}

interface AgentState {
  active: boolean
  speech: string
}

const sessionAgentMap = new Map<string, AgentKey>()
const activeSessions = new Map<AgentKey, Set<string>>()
const sleepTimers = new Map<AgentKey, ReturnType<typeof setTimeout>>()

const tui: TuiPlugin = async (api, _options, _meta) => {
  const signals: Record<AgentKey, [() => AgentState, (s: AgentState) => void]> = {} as any
  for (const key of AGENT_KEYS) {
    signals[key] = createSignal<AgentState>({ active: false, speech: "" })
  }

  function getAgent(key: AgentKey): AgentState { return signals[key][0]() }
  function setAgent(key: AgentKey, state: AgentState) { signals[key][1](state) }

  function activateAgent(key: AgentKey, state: string) {
    const existing = sleepTimers.get(key)
    if (existing) {
      clearTimeout(existing)
      sleepTimers.delete(key)
    }
    setAgent(key, { active: true, speech: randomLine(personas[key], state) })
  }

  function sleepAgent(key: AgentKey) {
    setAgent(key, { active: false, speech: "" })
  }

  function finishAgent(key: AgentKey) {
    setAgent(key, { active: true, speech: randomLine(personas[key], "done") })
    const timer = setTimeout(() => {
      sleepTimers.delete(key)
      sleepAgent(key)
    }, 3000)
    sleepTimers.set(key, timer)
  }

  const initialMode = readMode()
  activateAgent(initialMode, "start")

  api.event.on("session.created", (event: any) => {
    const info = event.properties?.info
    if (info?.parentID) {
      const agentName = popPending()
      const key: AgentKey = (agentName && agentName in personas)
        ? agentName as AgentKey
        : "build"
      sessionAgentMap.set(info.id, key)
      if (!activeSessions.has(key)) activeSessions.set(key, new Set())
      activeSessions.get(key)!.add(info.id)
      activateAgent(key, "start")
    }
  })

  api.event.on("session.status" as any, (event: any) => {
    const sessionId = event.properties?.sessionID
    const status = event.properties?.status?.type
    const key = sessionAgentMap.get(sessionId ?? "")

    if (key && key !== "build") {
      if (status === "busy") activateAgent(key, "working")
      if (status === "idle") {
        const sessions = activeSessions.get(key)
        if (sessions) {
          sessions.delete(sessionId)
          if (sessions.size === 0) {
            activeSessions.delete(key)
            finishAgent(key)
          }
        } else {
          finishAgent(key)
        }
      }
    } else if (!key) {
      const mainAgent = readMode()
      if (status === "busy") {
        activateAgent(mainAgent, "working")
        if (mainAgent === "prometheus") sleepAgent("build")
        if (mainAgent === "build") sleepAgent("prometheus")
      } else if (status === "idle") {
        setAgent(mainAgent, { active: true, speech: randomLine(personas[mainAgent], "done") })
      }
    }
  })

  api.event.on("session.error" as any, (event: any) => {
    const sessionId = event.properties?.sessionID
    const key = sessionAgentMap.get(sessionId ?? "")
    if (key) {
      sessionAgentMap.delete(sessionId ?? "")
      const sessions = activeSessions.get(key)
      if (sessions) {
        sessions.delete(sessionId)
        if (sessions.size === 0) activeSessions.delete(key)
      }
      const existing = sleepTimers.get(key)
      if (existing) { clearTimeout(existing); sleepTimers.delete(key) }
      setAgent(key, { active: true, speech: randomLine(personas[key], "error") })
      const timer = setTimeout(() => {
        sleepTimers.delete(key)
        sleepAgent(key)
      }, 5000)
      sleepTimers.set(key, timer)
    }
  })

  api.event.on("session.deleted" as any, (event: any) => {
    const sessionId = event.properties?.sessionID ?? event.properties?.id
    if (sessionId) {
      const key = sessionAgentMap.get(sessionId)
      sessionAgentMap.delete(sessionId)
      if (key) {
        const sessions = activeSessions.get(key)
        if (sessions) {
          sessions.delete(sessionId)
          if (sessions.size === 0) activeSessions.delete(key)
        }
        if (!activeSessions.get(key)?.size && !sleepTimers.has(key)) {
          sleepAgent(key)
        }
      }
    }
  })

  const [open, setOpen] = createSignal(true)

  api.slots.register({
    order: 50,
    slots: {
      sidebar_content(ctx: TuiSlotContext, _props: any) {
        const t = ctx.theme.current
        const fgColor = t.text ?? "#EEFFFF"
        const dim = t.textMuted ?? "#546E7A"
        const isOpen = open()
        const activeCount = AGENT_KEYS.filter((k) => getAgent(k).active).length

        return (
          <box flexDirection="column" marginBottom={1}>
            <box height={1} flexDirection="row" onMouseDown={() => setOpen(!open())}>
              <text bold fg={fgColor}>
                {isOpen ? "▼" : "▶"}{" Olympus"}
              </text>
              {!isOpen ? <text fg={dim}>{` (${activeCount} agents)`}</text> : null}
            </box>
            {isOpen ? AGENT_KEYS.map((key) => {
              const persona: Persona = personas[key]
              const state = getAgent(key)
              const label = padName(persona.name).slice(0, NAME_WIDTH)

              return (
                <box height={1} flexDirection="row">
                  <text fg={state.active ? fgColor : dim}>
                    {` ${persona.emoji} ${label} `}
                  </text>
                  <text fg={dim}>
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
