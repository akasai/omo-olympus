/** @jsxImportSource @opentui/solid */
/// <reference path="./shims.d.ts" />
import { createSignal } from "solid-js"
import type {
  TuiPlugin,
  TuiPluginModule,
  TuiSlotContext,
} from "@opencode-ai/plugin/tui"
import { AGENT_KEYS, personas, NAME_WIDTH, padName, randomLine } from "./personas"
import type { AgentKey, Persona } from "./personas"

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

const tui: TuiPlugin = async (...[api, _options, _meta]) => {
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
              const persona: Persona = personas[key]
              const state = getAgent(key)
              const label = padName(persona.name).slice(0, NAME_WIDTH)

              return (
                <box height={1} flexDirection="row">
                  <text color={state.active ? accent : dim}>
                    {` ${persona.emoji} ${label} `}
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
