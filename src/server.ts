import type { Plugin } from "@opencode-ai/plugin"

const PENDING_FILE = "/tmp/omo-pending.json"
const MODE_FILE = "/tmp/omo-mode.json"
const fs = require("fs")

interface PendingEntry {
  agent: string
  ts: number
  done?: boolean
}

function readPending(): PendingEntry[] {
  try { return JSON.parse(fs.readFileSync(PENDING_FILE, "utf-8")) } catch { return [] }
}

function writePending(list: PendingEntry[]) {
  fs.writeFileSync(PENDING_FILE, JSON.stringify(list))
}

function inferAgent(tool: string, args: any): string | null {
  if (tool !== "task" && tool !== "delegate_task") return null
  const sub = String(args?.subagent_type ?? "").toLowerCase()
  if (sub === "explore") return "explore"
  if (sub === "oracle") return "oracle"
  if (sub === "librarian") return "librarian"
  if (sub === "metis" || sub.includes("metis")) return "metis"
  if (sub === "momus" || sub.includes("momus")) return "momus"
  if (sub === "prometheus" || sub.includes("prometheus")) return "prometheus"

  const desc = String(args?.description ?? args?.prompt ?? "").toLowerCase()
  if (desc.includes("explore") || desc.includes("find") || desc.includes("search")) return "explore"
  if (desc.includes("oracle") || desc.includes("consult") || desc.includes("architect")) return "oracle"
  if (desc.includes("librarian") || desc.includes("docs") || desc.includes("reference")) return "librarian"
  if (desc.includes("metis") || desc.includes("plan") || desc.includes("analyze")) return "metis"
  if (desc.includes("momus") || desc.includes("review") || desc.includes("critic")) return "momus"
  if (desc.includes("prometheus")) return "prometheus"

  const cat = String(args?.category ?? "").toLowerCase()
  if (cat === "ultrabrain") return "oracle"
  if (cat === "visual-engineering") return "build"
  if (cat === "deep") return "oracle"
  if (cat === "quick") return "build"
  if (cat === "artistry") return "build"
  if (cat === "writing") return "build"
  if (cat.startsWith("unspecified")) return "build"

  return null
}

const DEDUP_MS = 200
let lastMode = ""

const OmoOlympusServer: Plugin = async () => {
  return {
    "tool.execute.before": async (input: any, output: any) => {
      const agent = inferAgent(input.tool, output.args)
      if (!agent) return
      const now = Date.now()
      const pending = readPending()
      const last = pending[pending.length - 1]
      if (last && last.agent === agent && now - last.ts < DEDUP_MS) return
      pending.push({ agent, ts: now })
      writePending(pending)
    },
    "tool.execute.after": async (input: any, _output: any) => {
      if (input.tool !== "task" && input.tool !== "delegate_task") return
      const now = Date.now()
      const pending = readPending()
      pending.push({ agent: "__done__", ts: now, done: true })
      writePending(pending)
    },
    "command.execute.before": async (input: any, _output: any) => {
      const cmd = String(input.command ?? "").toLowerCase()
      const now = Date.now()
      if (cmd.includes("plan") || cmd.includes("omc-plan") || cmd.includes("prometheus")) {
        const pending = readPending()
        const last = pending[pending.length - 1]
        if (last && last.agent === "prometheus" && now - last.ts < DEDUP_MS) return
        pending.push({ agent: "prometheus", ts: now })
        writePending(pending)
      } else if (cmd.includes("start-work")) {
        const pending = readPending()
        pending.push({ agent: "build", ts: now })
        writePending(pending)
      }
    },
    "experimental.chat.system.transform": async (_input: any, output: any) => {
      const system = Array.isArray(output.system) ? output.system.join(" ") : String(output.system ?? "")
      let mode = "build"
      if (system.includes('You are "Prometheus"') || system.includes('You are Prometheus')) mode = "prometheus"
      else if (system.includes('role="Prometheus"') || system.includes('Prometheus (Plan Builder)')) {
        if (!system.includes('You are "Sisyphus"') && !system.includes('You are Sisyphus')) mode = "prometheus"
      }
      if (mode !== lastMode) {
        lastMode = mode
        fs.writeFileSync(MODE_FILE, JSON.stringify({ mode, ts: Date.now() }))
      }
    },
  }
}

export default OmoOlympusServer
