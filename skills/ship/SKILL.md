---
name: ship
description: Use when the user asks to ship, deploy, release, or publish. Triggers on "push to prod", "go live", or "new version". NOT for updating docs/changelog (use document-release).
context: fork
agent: shipper
user-invocable: false
allowed-tools: Read, Bash, Grep, Glob
argument-hint: [branch-or-tag]
---

# TUC Ship

Ship: $ARGUMENTS

<instructions>
1. Pre-push verification (automated via hook)
2. `bun test` + `bun run eval` (no regressions)
3. Verify review gate clear, worktree clean, <400 lines changed
4. Tag and push release
</instructions>

<constraints>
- Never force-push main/master, always new commits
</constraints>

## Delegation

Consider delegating deployment sub-tasks to Codex CLI (GPT 5.4) for shell-heavy automation:
`scripts/run-codex.sh "run CI checks and tag release" "$WORKTREE" gpt-5.4-medium`

## Gotchas
- "update docs for release" triggers document-release, not ship
- Never force-push main/master
- Must pass review gate before shipping
