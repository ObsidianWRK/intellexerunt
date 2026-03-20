---
name: review
description: Use when the user asks to review a PR, audit code, inspect changes, or examine a pull request. Triggers on "look over my changes" or "check this PR". NOT for design review (use design-consultation).
context: fork
agent: reviewer
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash(gh *), Bash(git diff *), Bash(git log *)
argument-hint: [pr-number]
---

# TUC Review

Review PR #$ARGUMENTS.

<instructions>
1. `gh pr view $0 --json title,body,files,additions,deletions` — check <400 lines
2. `gh pr diff $0` — read changes
3. `bunx tuc search` — find relevant patterns
4. Check security (OWASP top 10, input validation)
5. Check NASA compliance (functions <60 lines, security rules)
6. Normalize via ReviewGate: `{severity, title, rationale, evidence[], blocking: true if high/critical}`
</instructions>

<constraints>
- For automated pipeline: `bunx tuc review-pipeline <pr>` (bugbot->fix->ready->devin->fix, max 4 rounds)
</constraints>

## Gotchas
- "design review" triggers design-consultation, not review
- Check NASA compliance inline (functions <60 lines, security rules)
- For external reviews, use run-devin or run-bugbot instead
