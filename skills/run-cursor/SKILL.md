---
name: run-cursor
description: Execute a UI/frontend task via Cursor models (Composer 2) natively through cursor-bridge MCP.
disable-model-invocation: true
user-invocable: false
---

# Run Cursor (via cursor-bridge MCP)

Invoke Cursor models for UI/frontend/visual tasks. Template-only — spawned by cursor-teammate agent.
Uses the cursor-bridge MCP server (packages/cursor-bridge/) instead of an external CLI.

## MCP Tools

| Tool | Purpose |
|------|---------|
| cursor_complete | Send chat completion to Cursor API (model, system, message) |
| cursor_models | List available Cursor models from subscription |
| cursor_auth_status | Check if Cursor OAuth tokens are valid |

## Default Model

composer-2 (Cursor Composer 2). Also: claude-4-sonnet, gpt-4o, gemini-2.5-pro, cursor-small.

## Gotchas
- Claude-only skill — not synced to other surfaces
- Always run inside a worktree, never in main repo
- Requires one-time auth: `bun packages/cursor-bridge/src/cli.ts login`
