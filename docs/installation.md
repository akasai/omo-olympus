# omo-olympus Installation Guide

> This guide is designed for LLM agents to follow step-by-step. Each step includes expected outcomes for verification.

## What is omo-olympus?

An opencode TUI + server plugin pair that displays Greek mythology agent personas in the sidebar. Visualizes which agents are active during oh-my-opencode orchestration.

## Prerequisites

- [opencode](https://opencode.ai) installed and working
- Plugin support (`@opencode-ai/plugin` >= 1.4.3)

## Step 1: Configure the server plugin

Edit `~/.config/opencode/opencode.json`. Create the file if it doesn't exist.

Add `"omo-olympus@latest"` to the `plugin` array:

```json
{
  "plugin": ["omo-olympus@latest"]
}
```

**If the file already exists with other plugins**, append to the existing array. Do not replace existing entries:

```json
{
  "plugin": ["existing-plugin", "omo-olympus@latest"]
}
```

## Step 2: Configure the TUI plugin

Edit `~/.config/opencode/tui.json`. Create the file if it doesn't exist.

Add `["omo-olympus@latest", { "enabled": true }]` to the `plugin` array:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [
    ["omo-olympus@latest", { "enabled": true }]
  ]
}
```

**If the file already exists with other plugins**, append to the existing array. Do not replace existing entries:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [
    ["existing-plugin", { "enabled": true }],
    ["omo-olympus@latest", { "enabled": true }]
  ]
}
```

## Step 3: Restart opencode

Both plugins load at startup. Restart opencode to activate omo-olympus.

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

- **Plugin not showing**: Both `opencode.json` and `tui.json` must be configured. One alone is not enough.
- **Duplicate rendering**: The plugin should be registered in one location only (global OR project, not both).
- **No agent activity**: omo-olympus visualizes `task()` calls from orchestration tools like oh-my-opencode. Without an orchestrator, only Sisyphus (main session) will be active.

## Uninstall

1. Remove `"omo-olympus@latest"` from `~/.config/opencode/opencode.json` plugin array
2. Remove `["omo-olympus@latest", { "enabled": true }]` from `~/.config/opencode/tui.json` plugin array
3. Restart opencode
