<!-- <CENTERED SECTION FOR GITHUB DISPLAY> -->

<div align="center">

# 🏛️ omo-olympus

**Your agents have names. Now they have faces.**

[![npm](https://img.shields.io/npm/v/omo-olympus?color=369eff&labelColor=black&logo=npm&style=flat-square)](https://www.npmjs.com/package/omo-olympus)
[![License](https://img.shields.io/badge/license-MIT-white?labelColor=black&style=flat-square)](LICENSE)

[English](README.md) | [한국어](README.ko.md)

</div>

<!-- </CENTERED SECTION FOR GITHUB DISPLAY> -->

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

---

You run [oh-my-opencode](https://github.com/code-yeongyu/oh-my-openagent). Agents fire in parallel. Background tasks fly. Sessions spawn and die.

But you never **see** any of it.

omo-olympus fixes that. Seven agents. Seven Greek mythology personas. Real-time dialogue in your sidebar. When Explorer is digging through your codebase — *"I smell a clue"*. When Oracle is deep in thought — *"The vision forms..."*. When Momus is tearing your plan apart — *"Don't shoot the messenger"*.

Inactive agents sleep: 💤. Active agents talk. You watch the gods work.

## Install

Paste this into your LLM agent (Claude Code, opencode, Cursor, etc.):

```
Install and configure omo-olympus by following the instructions here:
https://raw.githubusercontent.com/akasai/omo-olympus/refs/heads/main/docs/installation.md
```

Or do it yourself. Two lines. Restart. Done.

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

opencode installs the npm package on startup. You touch nothing else.

## The Pantheon

These aren't status labels. They're characters.

| | Agent | Role | They say things like... |
|:---:|---|---|---|
| 🪨 | **Sisyphus** | The one who never stops | *"One more push" · "The boulder rolls again" · "Summit reached ✓"* |
| 🔍 | **Explorer** | Codebase detective | *"On the trail!" · "Checking every corner" · "Case closed"* |
| 📚 | **Librarian** | The one who remembers everything | *"To the stacks!" · "Page 394..." · "The records confirm"* |
| 🧙 | **Oracle** | Sees what others can't | *"You seek guidance?" · "Patience, mortal..." · "The path is clear"* |
| 🦉 | **Metis** | Thinks before anyone acts | *"Hmm, interesting..." · "Weighing options..." · "Scope defined"* |
| 🎭 | **Momus** | Brutally honest critic | *"Alright, roast time" · "Not convinced yet..." · "The truth hurts"* |
| 🔥 | **Prometheus** | Forges the plan | *"Fire in the forge" · "Connecting the dots..." · "Blueprint ready"* |

4 states per agent — **start**, **working**, **done**, **error** — with randomized dialogue lines each. Every run feels different.

## How It Works

Two plugins. One file. Zero config.

```
task() → server detects agent type → pending queue → TUI pops on session event → sidebar talks
```

**Server plugin** hooks `tool.execute.before`. Intercepts `task()` calls. Infers agent from `subagent_type`, `category`, or description keywords.

**TUI plugin** renders in `sidebar_content` (top of sidebar, order 50). Maps child sessions to personas via file-based IPC. Reactive signals drive real-time updates.

That's it. No websockets. No shared memory. Just a JSON file in `/tmp` and two plugins that know how to talk through it.

## Features

|   | What | Why it matters |
|:---:|---|---|
| 📂 | **Collapsible** | Click the header to fold. Collapsed view shows active agent count |
| 🎨 | **Theme-aware** | Reads your opencode theme. RGBA buffer → hex, automatically |
| ⚡ | **Real-time** | Solid.js reactive signals. Sidebar updates as agents work |
| 🔇 | **Auto-sleep** | 3 seconds after completion, agents go back to 💤 |


## Manual Install

Don't want npm? Copy directly:

```bash
mkdir -p ~/.config/opencode/plugins
cp src/tui.tsx ~/.config/opencode/plugins/omo-olympus.tsx
cp src/server.ts ~/.config/opencode/plugins/omo-olympus-server.ts
```

Then register local paths:
```jsonc
// opencode.json
{ "plugin": ["./plugins/omo-olympus-server.ts"] }

// tui.json
{ "plugin": [["./plugins/omo-olympus.tsx", { "enabled": true }]] }
```

## Requirements

- [opencode](https://opencode.ai) with plugin support (`@opencode-ai/plugin` >= 1.4.3)
- Agent orchestration that dispatches `task()` calls — e.g., [oh-my-opencode](https://github.com/code-yeongyu/oh-my-openagent)

## Why "Olympus"?

You stare at a terminal all day. Agents run in the background. You have no idea what's happening until the final output drops.

We thought that was boring.

So we gave them names from Greek mythology, personalities that match their roles, and dialogue that changes every time. It's a small thing. But once you see Sisyphus pushing his boulder while Oracle peers into the mists — you won't go back to a silent sidebar.

## License

MIT
