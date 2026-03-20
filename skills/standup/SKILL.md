---
name: standup
description: Use when the user asks for a standup, status summary, or progress report. Triggers on "what did we do today", "what happened", or "daily". NOT for session learnings (use episodes/thread-weaver).
context: fork
agent: standup-reporter
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash(git log *), Bash(git diff *), Bash(gh *)
---

# TUC Standup

Generate status summary. Output YAML: `standup` {date, branch, recent_commits[], open_prs[], review_status[], blockers[], next[]}.

<instructions>
1. `git log --oneline -20 --since="24 hours ago"`
2. `git branch --show-current && git status`
3. `gh pr list --state open --limit 10`
4. Read <platform-var name="doc" claude="MEMORY.md" devin="DEVIN.md" codex="AGENTS.md" default="AGENTS.md" />, check active worktrees
</instructions>

## Delegation

Consider delegating data-gathering sub-tasks to Codex CLI for batch shell operations:
`scripts/run-codex.sh "gather git log, PR status, and review findings" "$PWD" gpt-5.4-medium`

## Gotchas
- "what worked" or "session learnings" — use episodes/thread-weaver instead
- Covers last 24 hours by default — use git log for longer ranges
