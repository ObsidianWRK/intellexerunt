---
name: work
description: Use when the user asks to implement, build, code, develop, create, or write code. Triggers on "fix this bug", "add this feature", or "refactor".
disable-model-invocation: true
user-invocable: false
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
argument-hint: <implementation-task>
---

# TUC Work

Implement: $ARGUMENTS

```bash
bunx tuc search "$ARGUMENTS" --mode multi
```

<instructions>
1. Search for context (above)
2. Read affected files before editing
3. Implement following project conventions
4. `bun test` and verify compliance
</instructions>

<constraints>
- Report: files changed, test results, line count compliance, security concerns
</constraints>

## Gotchas
- Requires worktree: `createWorktreeLease()` + `assertWorktreeContext()`
- All commits via PRs — never commit directly to main
- For code review, use review instead
