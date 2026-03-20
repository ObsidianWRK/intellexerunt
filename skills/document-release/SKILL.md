---
name: document-release
description: Use when the user asks to update docs for a release, write a changelog, or update README/CONTRIBUTING. Triggers on "update docs", "release docs", "write changelog". NOT for deploying (use ship).
user-invocable: true
argument-hint: "[version or scope of release]"
context: fork
agent: planner
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
---

# Document Release — Tech Writer

Update all documentation to match current code reality for: $ARGUMENTS.

<instructions>
1. Audit: `git diff` since last release, check README/ARCHITECTURE/CONTRIBUTING accuracy
2. Update README: install instructions, quick start, feature list, config reference
3. Update ARCHITECTURE.md: module dependency graph, data flow, key abstractions
4. Update CONTRIBUTING.md: dev setup, test commands, PR guidelines, code style
5. Update CHANGELOG: group by Added/Changed/Deprecated/Removed/Fixed/Security, reference PR/commit
</instructions>

<constraints>
- Every claim must be verified against actual code
- Install instructions must be tested (run them)
- Prefer concrete examples over abstract descriptions
- Keep docs concise — link to code for details
</constraints>

## Delegation

Consider delegating bulk doc generation to Codex CLI (GPT 5.4's 1M context handles large changelogs):
`scripts/run-codex.sh "generate changelog from git log since last tag" "$PWD" gpt-5.4-medium`

## Gotchas
- "ship this" triggers ship, not document-release — this skill is for DOCS only
- Always verify install instructions by running them
- Use git log since last tag to find all changes, not just recent commits
