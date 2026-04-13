# omo-olympus

Greek mythology personas for [opencode](https://opencode.ai) agents. Your AI workflow, narrated by the gods.

```
▼ Olympus
 🪨 Sisyphus   Pushing uphill...
 🔍 Explorer   Following a lead...
 📚 Librarian  Cross-referencing...
 🧙 Oracle     💤
 🦉 Metis      💤
 🎭 Momus      💤
 🔥 Prometheus 💤
```

## What is this?

An opencode TUI + server plugin pair that shows agent activity in the sidebar. Each agent has a Greek mythology persona with personality-driven dialogue that changes based on what it's doing.

| Agent | Emoji | Role | Sample |
|-------|-------|------|--------|
| Sisyphus | 🪨 | Main session / task executor | *"The boulder rolls again"* |
| Explorer | 🔍 | Codebase search | *"I smell a clue"* |
| Librarian | 📚 | Documentation lookup | *"Let me check the archives"* |
| Oracle | 🧙 | Architecture consultant | *"The mists part..."* |
| Metis | 🦉 | Pre-planning analysis | *"Analyzing the angles"* |
| Momus | 🎭 | Plan critic / reviewer | *"Don't shoot the messenger"* |
| Prometheus | 🔥 | Plan builder | *"Fire in the forge"* |

## How it works

Two plugins working together:

1. **Server plugin** (`server.ts`) — hooks into opencode's plugin API to detect agent activity:
   - `tool.execute.before` — detects which agent type is being dispatched via `task()` calls
   - `tool.execute.after` — records task completion signals
   - `command.execute.before` — detects mode-switching commands (`/start-work`, `/omc-plan`)
   - `experimental.chat.system.transform` — detects main session mode (Prometheus vs Sisyphus) by reading system prompt content
2. **TUI plugin** (`tui.tsx`) — reads from the pending queue on `session.created` events, maps child sessions to agent personas, and renders them in the `sidebar_content` slot with reactive state updates.

```
~task() call → server detects agent type → /tmp/omo-pending.json → TUI pops on session.created → sidebar renders
main session message → server reads system prompt → /tmp/omo-mode.json → TUI reads on session.status → sidebar switches persona
```

## Installation

### Option A: npm package (recommended)

Add to your opencode config files:

**`~/.config/opencode/opencode.json`** — server plugin:
```json
{
  "plugin": [
    "omo-olympus"
  ]
}
```

**`~/.config/opencode/tui.json`** — TUI plugin:
```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [
    ["omo-olympus", { "enabled": true }]
  ]
}
```

opencode installs npm plugins automatically on startup.

### Option B: manual copy

```bash
mkdir -p ~/.config/opencode/plugins
cp src/tui.tsx ~/.config/opencode/plugins/omo-olympus.tsx
cp src/server.ts ~/.config/opencode/plugins/omo-olympus-server.ts
```

**Development tip:** use symlinks instead of copying for live-reload during development:

```bash
mkdir -p ~/.config/opencode/plugins
ln -sf /path/to/omo-olympus/src/server.ts ~/.config/opencode/plugins/omo-olympus-server.ts
ln -sf /path/to/omo-olympus/src/tui.tsx ~/.config/opencode/plugins/omo-olympus.tsx
```

Changes to source files take effect on opencode restart — no need to re-copy.

Then register local paths in `opencode.json` and `tui.json`:
```json
// opencode.json → "plugin": ["./plugins/omo-olympus-server.ts"]
// tui.json → "plugin": [["./plugins/omo-olympus.tsx", { "enabled": true }]]
```

### Restart opencode

Both plugins load at startup. Restart to pick up changes.

## Features

- **Collapsible sidebar section** — click the "▼ Olympus" header to toggle
- **Theme-aware colors** — reads from opencode theme (RGBA buffer → hex conversion)
- **Active/sleep states** — active agents show dialogue, inactive show 💤
- **Auto-sleep** — agents show "done" dialogue for 3 seconds, then go to sleep
- **File-based dedup** — handles opencode's double-fire on `tool.execute.before`
- **7 agent personas** with 4-5 dialogue lines per state (start, working, done, error)
- **Concurrent agent tracking** — multiple instances of the same agent type are tracked; only sleeps when all finish
- **Error state detection** — agents show error dialogue on `session.error` events (5-second display)
- **Main session mode switching** — detects Prometheus (plan mode) vs Sisyphus (build mode) via system prompt analysis
- **Session cleanup** — `session.deleted` handler prevents memory leaks in session tracking maps
- **Stale timer protection** — sleep timers are tracked and cleared when agents reactivate

## Requirements

- [opencode](https://opencode.ai) with `@opencode-ai/plugin` >= 1.4.3
- Agent orchestration that uses `task()` calls (e.g., [oh-my-opencode](https://github.com/anthropics/oh-my-opencode))

## Known quirks

- `<text bold>` uses `color` prop, regular `<text>` uses `fg` prop in opentui
- Collapse toggle uses `onMouseDown` (not `onClick`)
- `tool.execute.before` fires twice per tool call — dedup via last-entry comparison with 200ms window
- Server and TUI plugins share state via `/tmp/omo-pending.json` (file-based IPC)
- Main session mode detection uses `experimental.chat.system.transform` — this API may change in future opencode versions
- Main session mode is shared via `/tmp/omo-mode.json` (file-based IPC, writes only on mode change)
- System prompt keyword matching (`"You are Prometheus"`) is coupled to OMC's internal prompt format

## License

MIT

---

## 한국어

opencode 사이드바에 그리스 신화 캐릭터 페르소나를 표시하는 플러그인입니다.

각 에이전트(탐정, 사서, 현자 등)가 작업 상태에 맞는 대사를 실시간으로 보여줍니다. 비활성 에이전트는 💤 상태로 표시됩니다.

### 설치

`opencode.json`에 `"omo-olympus"` 추가, `tui.json`에 `["omo-olympus", { "enabled": true }]` 추가 후 재시작. npm 패키지는 opencode가 자동 설치합니다.
