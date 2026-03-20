---
name: plan
description: Use when the user asks to plan, scope, decompose, architect, or break down a task. Also triggers on "design the approach", "roadmap", "planner", "first principles", or "CEO review". Absorbs plan-ceo.
context: fork
agent: planner
user-invocable: false
allowed-tools: Read, Grep, Glob, Bash(bunx tuc search *)
argument-hint: <task-description>
---

# TUC Plan

Structured YAML decomposition with multi-source search. For quick planning, use /plan.

<instructions>
1. `bunx tuc search "$ARGUMENTS" --mode multi` for context
2. Read <platform-var name="doc" claude="MEMORY.md" devin="DEVIN.md" codex="AGENTS.md" default="AGENTS.md" /> for project history
3. Scope: affected packages, files, dependencies
4. Decompose into parallelizable tasks (max 30 units, max 400 lines/PR)
5. Identify risks: security, breaking changes, review triggers
</instructions>

<constraints>
- Output YAML: `plan` {title, tasks[] (id+description+files+skill+blocked_by), review_budget, risks[]}
- For product-level planning, use CEO mode: include "first principles" or "CEO review" in query
</constraints>

## Gotchas
- "design system" triggers design-consultation, not plan
- Always search first: `bunx tuc search "topic"` before planning
- "CEO review" or "first principles" now handled by plan in CEO mode (plan-ceo merged)
