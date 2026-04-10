import { describe, it, expect } from "vitest"
import { AGENT_KEYS, personas, padName, randomLine } from "../personas"

describe("AGENT_KEYS", () => {
  it("contains exactly 7 agents", () => {
    expect(AGENT_KEYS).toHaveLength(7)
  })

  it("includes all expected keys", () => {
    expect(AGENT_KEYS).toContain("build")
    expect(AGENT_KEYS).toContain("explore")
    expect(AGENT_KEYS).toContain("librarian")
    expect(AGENT_KEYS).toContain("oracle")
    expect(AGENT_KEYS).toContain("metis")
    expect(AGENT_KEYS).toContain("momus")
    expect(AGENT_KEYS).toContain("prometheus")
  })
})

describe("personas", () => {
  it("has a persona for every agent key", () => {
    for (const key of AGENT_KEYS) {
      expect(personas[key]).toBeDefined()
      expect(personas[key].name).toBeTruthy()
      expect(personas[key].emoji).toBeTruthy()
    }
  })

  it("every persona has all 4 speech states", () => {
    const states = ["start", "working", "done", "error"]
    for (const key of AGENT_KEYS) {
      for (const state of states) {
        const lines = personas[key].speech[state]
        expect(lines, `${key}.${state} should have lines`).toBeDefined()
        expect(lines.length, `${key}.${state} should have at least 1 line`).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it("no speech lines are empty strings", () => {
    for (const key of AGENT_KEYS) {
      for (const [state, lines] of Object.entries(personas[key].speech)) {
        for (const line of lines) {
          expect(line.trim(), `${key}.${state} has empty line`).not.toBe("")
        }
      }
    }
  })

  it("maps correct names to keys", () => {
    expect(personas.build.name).toBe("Sisyphus")
    expect(personas.explore.name).toBe("Explorer")
    expect(personas.librarian.name).toBe("Librarian")
    expect(personas.oracle.name).toBe("Oracle")
    expect(personas.metis.name).toBe("Metis")
    expect(personas.momus.name).toBe("Momus")
    expect(personas.prometheus.name).toBe("Prometheus")
  })
})

describe("padName", () => {
  it("pads short names to NAME_WIDTH (11)", () => {
    expect(padName("Oracle")).toHaveLength(11)
    expect(padName("Metis")).toHaveLength(11)
  })

  it("preserves names already at width", () => {
    const name = "12345678901"
    expect(padName(name)).toBe(name)
  })

  it("pads with spaces on the right", () => {
    expect(padName("Hi")).toBe("Hi         ")
  })
})

describe("randomLine", () => {
  it("returns a line from the correct state", () => {
    const persona = personas.build
    const line = randomLine(persona, "start")
    expect(persona.speech.start).toContain(line)
  })

  it("returns empty string for unknown state", () => {
    expect(randomLine(personas.build, "nonexistent")).toBe("")
  })

  it("returns empty string for empty speech array", () => {
    const empty = { name: "Test", emoji: "🧪", speech: { start: [] } }
    expect(randomLine(empty, "start")).toBe("")
  })

  it("always returns a string from the pool", () => {
    for (let i = 0; i < 50; i++) {
      const line = randomLine(personas.oracle, "working")
      expect(personas.oracle.speech.working).toContain(line)
    }
  })
})
