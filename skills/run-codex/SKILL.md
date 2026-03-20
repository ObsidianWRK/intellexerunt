---
name: run-codex
description: Execute a task via Codex CLI (GPT 5.4) in an isolated worktree.
disable-model-invocation: true
user-invocable: false
---

# Run Codex CLI

Invoke Codex CLI for shell/automation/batch tasks. Template-only — spawned by codex-teammate agent.

```bash
scripts/run-codex.sh "$TASK" "$WORKTREE" gpt-5.4-medium
```

## Flags

| Flag | Default | Purpose |
|------|---------|---------|
| model | gpt-5.4-medium | Codex model (gpt-5-codex, gpt-5.4-medium) |
| --full-auto | always | Workspace-write sandbox |
| --ephemeral | always | No session persistence |
| --ask-for-approval | never | Fully non-interactive |

## Gotchas
- Claude-only skill — not synced to other surfaces
- Always run inside a worktree, never in main repo
- Timeout: 600s — GPT 5.4's 1M context allows large file passes
