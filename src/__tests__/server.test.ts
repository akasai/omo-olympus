import { afterEach, beforeEach, describe, expect, it } from "vitest"
import OmoOlympusServer from "../server"

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
