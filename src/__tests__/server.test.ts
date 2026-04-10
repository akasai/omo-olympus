import { describe, it, expect } from "vitest"
import { inferAgent } from "../server"

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

  describe("description keyword fallback", () => {
    it("infers from description keywords", () => {
      expect(inferAgent("task", { description: "Find auth patterns" })).toBe("explore")
      expect(inferAgent("task", { description: "Search codebase" })).toBe("explore")
      expect(inferAgent("task", { description: "Consult on architecture" })).toBe("oracle")
      expect(inferAgent("task", { description: "Check the docs" })).toBe("librarian")
      expect(inferAgent("task", { description: "Review the code" })).toBe("momus")
      expect(inferAgent("task", { description: "Analyze requirements" })).toBe("metis")
    })

    it("falls back to prompt when description is absent", () => {
      expect(inferAgent("task", { prompt: "Find all test files" })).toBe("explore")
      expect(inferAgent("task", { prompt: "Reference the API docs" })).toBe("librarian")
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

    it("description takes priority over category", () => {
      expect(inferAgent("task", {
        description: "Search the codebase",
        category: "ultrabrain",
      })).toBe("explore")
    })
  })

  it("returns null when no signal matches", () => {
    expect(inferAgent("task", {})).toBeNull()
    expect(inferAgent("task", { description: "hello world" })).toBeNull()
  })
})
