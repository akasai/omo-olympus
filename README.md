<!-- <CENTERED SECTION FOR GITHUB DISPLAY> -->

<div align="center">

# 🏛️ omo-olympus

**Your agents have names. Now they have faces.**

[![npm](https://img.shields.io/npm/v/omo-olympus?color=369eff&labelColor=black&logo=npm&style=flat-square)](https://www.npmjs.com/package/omo-olympus)
[![License](https://img.shields.io/badge/license-MIT-white?labelColor=black&style=flat-square)](LICENSE)

[English](README.md) | [한국어](README.ko.md)

</div>

<!-- </CENTERED SECTION FOR GITHUB DISPLAY> -->

<div align="center">
<table>
<tr>
<td>

```
▼ Olympus
 🪨 Sisyphus    Pushing uphill...
 🔍 Explorer    Following a lead...
 📚 Librarian   Cross-referencing...
 🧙 Oracle      💤
 🦉 Metis       💤
 🎭 Momus       💤
 🔥 Prometheus  💤
```

</td>
<td>

![omo-olympus in action](docs/screenshot.png)

</td>
</tr>
</table>
</div>

---

You run [oh-my-opencode](https://github.com/code-yeongyu/oh-my-openagent). Agents fire in parallel. Background tasks fly. Sessions spawn and die.

But you never **see** any of it.

omo-olympus changes that. Seven agents. Seven Greek mythology personas. Real-time dialogue in your sidebar. Explorer digs through your codebase — *"I smell a clue"*. Oracle peers beyond the mists — *"The vision forms..."*. Momus tears your plan apart — *"Don't shoot the messenger"*.

Inactive agents sleep: 💤. Active agents talk. You watch the gods work.

## Why "Olympus"?

You stare at a terminal all day. Agents run in the background. You have no idea what's happening until the final output drops.

That's boring.

So each agent got a name from Greek mythology, a personality that matches its role, and dialogue that changes every run. Once you see Sisyphus pushing his boulder while Oracle peers into the mists — a silent sidebar won't cut it anymore.

## The Pantheon

Not status labels. Characters.

| | Agent | Role | They say things like... |
|:---:|---|---|---|
| 🪨 | **Sisyphus** | The one who never stops | *"One more push" · "The boulder rolls again" · "Summit reached ✓"* |
| 🔍 | **Explorer** | Codebase detective | *"On the trail!" · "Checking every corner" · "Case closed"* |
| 📚 | **Librarian** | The one who remembers everything | *"To the stacks!" · "Page 394..." · "The records confirm"* |
| 🧙 | **Oracle** | Sees what others can't | *"You seek guidance?" · "Patience, mortal..." · "The path is clear"* |
| 🦉 | **Metis** | Thinks before anyone acts | *"Hmm, interesting..." · "Weighing options..." · "Scope defined"* |
| 🎭 | **Momus** | Brutally honest critic | *"Alright, roast time" · "Not convinced yet..." · "The truth hurts"* |
| 🔥 | **Prometheus** | Forges the plan | *"Fire in the forge" · "Connecting the dots..." · "Blueprint ready"* |

4 states per agent — **start**, **working**, **done**, **error** — with randomized lines each. Every run feels different.

## Install

Run this in your terminal:

```bash
opencode plugin omo-olympus
```

That's it. OpenCode detects both the server and TUI entrypoints from the package and updates `opencode.json` and `tui.json` automatically. Restart opencode to activate.

### Manual Setup

If you prefer to configure manually, add the plugin to both config files:

**`~/.config/opencode/opencode.json`**
```json
{
  "plugin": ["omo-olympus"]
}
```

**`~/.config/opencode/tui.json`**
```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [["omo-olympus", { "enabled": true }]]
}
```

Restart opencode after updating the config files.

## How It Works

Two plugins. One shared queue. Zero config.

```
task() → server detects agent type → pending queue → TUI picks up on session event → sidebar talks
main session → server reads system prompt → mode file → TUI switches persona on status event
```

**Server plugin** hooks into four interception points:
- `tool.execute.before` — intercepts `task()` calls and infers the agent from `subagent_type` or `category`
- `tool.execute.after` — records task completion signals
- `command.execute.before` — detects mode-switching commands (`/start-work`, `/omc-plan`)
- `experimental.chat.system.transform` — detects main session mode (Prometheus vs Sisyphus) by reading system prompt content

**TUI plugin** renders in `sidebar_content` (top of sidebar, order 50), maps child sessions to personas via file-based IPC, and drives real-time updates with reactive signals.

No websockets. No shared memory. A JSON file in `/tmp` and two plugins that talk through it.

## Features

|   | What | Why it matters |
|:---:|---|---|
| 📂 | **Collapsible** | Click the header to fold. Collapsed shows active agent count |
| 🎨 | **Theme-aware** | Reads your opencode theme. RGBA buffer → hex, automatically |
| ⚡ | **Real-time** | Solid.js reactive signals. Updates as agents work |
| 🔇 | **Auto-sleep** | 3 seconds after done, agents return to 💤 |
| 🔄 | **Concurrent tracking** | Multiple instances of the same agent tracked; sleeps only when all finish |
| ❌ | **Error detection** | Agents show error dialogue on failure (5-second display) |
| 🔥 | **Mode switching** | Detects Prometheus (plan) vs Sisyphus (build) via system prompt |
| 🧹 | **Session cleanup** | Prevents memory leaks with `session.deleted` handler |

## Requirements

- [opencode](https://opencode.ai) with plugin support (`@opencode-ai/plugin` >= 1.4.3)
- Agent orchestration that dispatches `task()` calls — e.g., [oh-my-opencode](https://github.com/code-yeongyu/oh-my-openagent)

## Manual Install

Skip npm. Copy the source files directly:

```bash
mkdir -p ~/.config/opencode/plugins
cp src/tui.tsx ~/.config/opencode/plugins/omo-olympus.tsx
cp src/server.ts ~/.config/opencode/plugins/omo-olympus-server.ts
```

Register local paths instead:
```jsonc
// opencode.json
{ "plugin": ["./plugins/omo-olympus-server.ts"] }

// tui.json
{ "plugin": [["./plugins/omo-olympus.tsx", { "enabled": true }]] }
```

## Contributing

Issues and PRs welcome. If you have an idea for a new persona, a better line of dialogue, or a bug to report — [open an issue](https://github.com/akasai/omo-olympus/issues).

To develop locally:

```bash
git clone https://github.com/akasai/omo-olympus.git
cp src/tui.tsx ~/.config/opencode/plugins/omo-olympus.tsx
cp src/server.ts ~/.config/opencode/plugins/omo-olympus-server.ts
```

**Tip:** use symlinks for live-reload during development:
```bash
ln -sf $(pwd)/src/server.ts ~/.config/opencode/plugins/omo-olympus-server.ts
ln -sf $(pwd)/src/tui.tsx ~/.config/opencode/plugins/omo-olympus.tsx
```

Edit, restart opencode, see your changes live.

Run tests:

```bash
npm test
```

## Known Quirks

- `tool.execute.before` fires twice per tool call — dedup via 200ms window
- Main session mode detection uses `experimental.chat.system.transform` — API may change in future opencode versions
- System prompt keyword matching (`"You are Prometheus"`) is coupled to OMC's internal prompt format
- Server ↔ TUI communication via `/tmp/omo-pending.json` and `/tmp/omo-mode.json` (file-based IPC)

## License

MIT
