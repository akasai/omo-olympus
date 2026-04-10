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

### For Humans

Paste this into your LLM agent (Claude Code, opencode, Cursor, etc.):

```
Install and configure omo-olympus by following the instructions here:
https://raw.githubusercontent.com/akasai/omo-olympus/refs/heads/main/docs/installation.md
```

Seriously, let the agent handle it. It merges configs better than you.

### For LLM Agents

Fetch the installation guide and follow it:

```
https://raw.githubusercontent.com/akasai/omo-olympus/refs/heads/main/docs/installation.md
```

### Or Just Do It Yourself

Two config files. Restart. Done.

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

opencode resolves the npm package on startup automatically.

## How It Works

Two plugins. One shared queue. Zero config.

```
task() → server detects agent type → pending queue → TUI picks up on session event → sidebar talks
```

**Server plugin** hooks `tool.execute.before`, intercepts `task()` calls, and infers the agent from `subagent_type`, `category`, or description keywords.

**TUI plugin** renders in `sidebar_content` (top of sidebar, order 50), maps child sessions to personas via file-based IPC, and drives real-time updates with reactive signals.

No websockets. No shared memory. A JSON file in `/tmp` and two plugins that talk through it.

## Features

|   | What | Why it matters |
|:---:|---|---|
| 📂 | **Collapsible** | Click the header to fold. Collapsed shows active agent count |
| 🎨 | **Theme-aware** | Reads your opencode theme. RGBA buffer → hex, automatically |
| ⚡ | **Real-time** | Solid.js reactive signals. Updates as agents work |
| 🔇 | **Auto-sleep** | 3 seconds after done, agents return to 💤 |

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

Edit, restart opencode, see your changes live.

## License

MIT
