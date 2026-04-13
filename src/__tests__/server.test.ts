import { afterEach, beforeEach, describe, expect, it } from "vitest"
import OmoOlympusServer, { inferAgent } from "../server"

const fs = require("fs")

const PENDING_FILE = "/tmp/omo-pending.json"

function readPending() {
  return JSON.parse(fs.readFileSync(PENDING_FILE, "utf-8"))
}

beforeEach(() => {
  try { fs.unlinkSync(PENDING_FILE) } catch {}
})

afterEach(() => {
  try { fs.unlinkSync(PENDING_FILE) } catch {}
})

describe("inferAgent", () => {
  it("returns null for non-task tools", () => {
    expect(inferAgent("grep", {})).toBeNull()
    expect(inferAgent("read_file", {})).toBeNull()
    expect(inferAgent("bash", {})).toBeNull()
  })

  it("accepts both task and delegate_task", () => {
    expect(inferAgent("task", { subagent_type: "explore" })).toBe("explore")
    expect(inferAgent("delegate_task", { subagent_type: "explore" })).toBe("explore")
  })

  describe("subagent_type matching", () => {
    it("maps direct subagent types", () => {
      expect(inferAgent("task", { subagent_type: "explore" })).toBe("explore")
      expect(inferAgent("task", { subagent_type: "oracle" })).toBe("oracle")
      expect(inferAgent("task", { subagent_type: "librarian" })).toBe("librarian")
      expect(inferAgent("task", { subagent_type: "metis" })).toBe("metis")
      expect(inferAgent("task", { subagent_type: "momus" })).toBe("momus")
      expect(inferAgent("task", { subagent_type: "prometheus" })).toBe("prometheus")
    })

    it("is case-insensitive", () => {
      expect(inferAgent("task", { subagent_type: "Explore" })).toBe("explore")
      expect(inferAgent("task", { subagent_type: "ORACLE" })).toBe("oracle")
      expect(inferAgent("task", { subagent_type: "Metis" })).toBe("metis")
    })

    it("matches partial includes for metis/momus/prometheus", () => {
      expect(inferAgent("task", { subagent_type: "Metis (Plan Consultant)" })).toBe("metis")
      expect(inferAgent("task", { subagent_type: "Momus (Plan Critic)" })).toBe("momus")
      expect(inferAgent("task", { subagent_type: "Prometheus (Plan Builder)" })).toBe("prometheus")
    })
  })

  describe("category fallback", () => {
    it("maps categories to agents", () => {
      expect(inferAgent("task", { category: "ultrabrain" })).toBe("oracle")
      expect(inferAgent("task", { category: "deep" })).toBe("oracle")
      expect(inferAgent("task", { category: "visual-engineering" })).toBe("build")
      expect(inferAgent("task", { category: "quick" })).toBe("build")
      expect(inferAgent("task", { category: "artistry" })).toBe("build")
      expect(inferAgent("task", { category: "writing" })).toBe("build")
      expect(inferAgent("task", { category: "unspecified-low" })).toBe("build")
      expect(inferAgent("task", { category: "unspecified-high" })).toBe("build")
    })
  })

  describe("priority order", () => {
    it("subagent_type takes priority over description", () => {
      expect(inferAgent("task", {
        subagent_type: "oracle",
        description: "Find something",
      })).toBe("oracle")
    })

    it("subagent_type takes priority over category", () => {
      expect(inferAgent("task", {
        subagent_type: "librarian",
        category: "ultrabrain",
      })).toBe("librarian")
    })

  })

  it("returns null when no signal matches", () => {
    expect(inferAgent("task", {})).toBeNull()
    expect(inferAgent("task", { description: "hello world" })).toBeNull()
  })
})

describe("server hooks", () => {
  it("tool.execute.after appends a __done__ pending entry for task tools", async () => {
    const plugin = await OmoOlympusServer()

    await plugin["tool.execute.after"]({ tool: "task" }, {})

    expect(readPending()).toEqual([
      expect.objectContaining({ agent: "__done__", done: true, ts: expect.any(Number) }),
    ])
  })

  it("tool.execute.after ignores non-task tools", async () => {
    const plugin = await OmoOlympusServer()

    await plugin["tool.execute.after"]({ tool: "read" }, {})

    expect(fs.existsSync(PENDING_FILE)).toBe(false)
  })

  it("preserves agent entries when adding a __done__ marker", async () => {
    fs.writeFileSync(PENDING_FILE, JSON.stringify([{ agent: "explore", ts: 123 }]))
    const plugin = await OmoOlympusServer()

    await plugin["tool.execute.after"]({ tool: "delegate_task" }, {})

    expect(readPending()).toEqual([
      { agent: "explore", ts: 123 },
      expect.objectContaining({ agent: "__done__", done: true, ts: expect.any(Number) }),
    ])
  })
})
