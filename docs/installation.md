# omo-olympus Installation Guide

This guide is designed for LLM agents to follow step-by-step.

## What is omo-olympus?

An opencode TUI + server plugin pair that displays Greek mythology agent personas in the sidebar. It visualizes which agents are active during oh-my-opencode orchestration.

## Prerequisites

- [opencode](https://opencode.ai) installed and working
- Plugin support enabled (`@opencode-ai/plugin` >= 1.4.3)

## Step 1: Install the npm package

```bash
npm install -g omo-olympus
```

> If opencode manages plugin installation automatically (which it does for plugins listed in config), you can skip this step. opencode will install it on next startup.

## Step 2: Configure the server plugin

Edit `~/.config/opencode/opencode.json` (create if it doesn't exist).

Add `"omo-olympus"` to the `plugin` array:

```json
{
  "plugin": ["omo-olympus"]
}
```

**If the file already exists with other plugins**, append to the existing array:

```json
{
  "plugin": ["existing-plugin", "omo-olympus"]
}
```

**Important**: Do not replace existing plugins. Append only.

## Step 3: Configure the TUI plugin

Edit `~/.config/opencode/tui.json` (create if it doesn't exist).

Add `["omo-olympus", { "enabled": true }]` to the `plugin` array:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [
    ["omo-olympus", { "enabled": true }]
  ]
}
```

**If the file already exists with other plugins**, append to the existing array:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [
    ["existing-plugin", { "enabled": true }],
    ["omo-olympus", { "enabled": true }]
  ]
}
```

**Important**: Do not replace existing plugins. Append only.

## Step 4: Restart opencode

The plugins load at startup. Restart opencode to activate omo-olympus.

## Verification

After restart, you should see a collapsible "▼ Olympus" section at the top of the sidebar with 7 agent personas. Sisyphus should show as active with a dialogue line.

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

- **Plugin not showing**: Ensure both `opencode.json` and `tui.json` are configured. Both are required.
- **Duplicate rendering**: If the plugin appears twice, check that it's registered in only one location (global OR project, not both).
- **No agent activity**: omo-olympus visualizes `task()` calls from agent orchestration tools like oh-my-opencode. Without an orchestrator, only Sisyphus (main session) will be active.

## Uninstall

1. Remove `"omo-olympus"` from `~/.config/opencode/opencode.json` plugin array
2. Remove `["omo-olympus", { "enabled": true }]` from `~/.config/opencode/tui.json` plugin array
3. Optionally: `npm uninstall -g omo-olympus`
4. Restart opencode
