import { describe, expect, it } from "vitest"
import * as path from "path"

const fs = require("fs")

const ROOT = path.resolve(__dirname, "../..")
const PLUGIN_FILES = ["src/tui.tsx", "src/server.ts"]

const RELATIVE_IMPORT_RE = /(from\s+['"][./]|import\s+['"][./]|require\s*\(\s*['"][./])/

describe("Plugin single-file constraint", () => {
  for (const file of PLUGIN_FILES) {
    it(`${file} must not contain relative imports`, () => {
      const content = fs.readFileSync(path.join(ROOT, file), "utf-8") as string
      const violations = content
        .split("\n")
        .filter((line: string) => RELATIVE_IMPORT_RE.test(line) && !line.trimStart().startsWith("///"))

      expect(
        violations,
        `Relative imports found in ${file}:\n${violations.join("\n")}`,
      ).toHaveLength(0)
    })
  }
})
