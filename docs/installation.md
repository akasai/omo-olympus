# omo-olympus Installation Guide

> This guide is designed for LLM agents to follow step-by-step. Each step includes expected outcomes for verification.

## What is omo-olympus?

An opencode TUI + server plugin pair that displays Greek mythology agent personas in the sidebar. Visualizes which agents are active during oh-my-opencode orchestration.

## Prerequisites

- [opencode](https://opencode.ai) installed and working
- Plugin support (`@opencode-ai/plugin` >= 1.4.3)

## Step 1: Install the plugin

Run the following command in the terminal:

```bash
opencode plugin omo-olympus
```

This automatically:
- Installs the `omo-olympus` npm package
- Detects both the server (`./server`) and TUI (`./tui`) entrypoints
- Adds the server plugin to `opencode.json`
- Adds the TUI plugin to `tui.json`

## Step 2: Restart opencode

Both plugins load at startup. Restart opencode to activate omo-olympus.

## Manual Setup (alternative)

If `opencode plugin` is not available, configure both files manually.

### Configure the server plugin

Edit `~/.config/opencode/opencode.json`. Create the file if it doesn't exist.

Add `"omo-olympus"` to the `plugin` array:

```json
{
  "plugin": ["omo-olympus"]
}
```

**If the file already exists with other plugins**, append to the existing array. Do not replace existing entries:

```json
{
  "plugin": ["existing-plugin", "omo-olympus"]
}
```

### Configure the TUI plugin

Edit `~/.config/opencode/tui.json`. Create the file if it doesn't exist.

Add `["omo-olympus", { "enabled": true }]` to the `plugin` array:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [
    ["omo-olympus", { "enabled": true }]
  ]
}
```

**If the file already exists with other plugins**, append to the existing array. Do not replace existing entries:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [
    ["existing-plugin", { "enabled": true }],
    ["omo-olympus", { "enabled": true }]
  ]
}
```

Restart opencode after updating the config files.

## Verification

After restart, the sidebar should show a collapsible "▼ Olympus" section at the top with 7 agent personas. Sisyphus appears active by default:

```
▼ Olympus
 🪨 Sisyphus    The boulder rolls again
 🔍 Explorer    💤
 📚 Librarian   💤
 🧙 Oracle      💤
 🦉 Metis       💤
 🎭 Momus       💤
 🔥 Prometheus  💤
```

## Troubleshooting

- **Plugin not showing**: Both `opencode.json` and `tui.json` must be configured. The `opencode plugin` command handles both automatically. If you configured manually, make sure both files are updated.
- **Duplicate rendering**: The plugin should be registered in one location only (global OR project, not both).
- **No agent activity**: omo-olympus visualizes `task()` calls from orchestration tools like oh-my-opencode. Without an orchestrator, only Sisyphus (main session) will be active.

## Uninstall

1. Remove `"omo-olympus"` from `~/.config/opencode/opencode.json` plugin array
2. Remove `["omo-olympus", { "enabled": true }]` from `~/.config/opencode/tui.json` plugin array
3. Restart opencode
