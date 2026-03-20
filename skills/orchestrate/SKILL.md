---
name: orchestrate
description: Use when the user asks to execute the full Plan->Work->Review->Episode loop or run a Linear issue end-to-end. Triggers on "orchestrate", "full loop", or "execute this issue".
context: fork
agent: planner
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
  - Agent
  - TeamCreate
  - SendMessage
  - TaskCreate
  - TaskUpdate
  - TaskList
argument-hint: <TUC-XXX>
user-invocable: true
---

# Orchestrate — Full Loop Execution

Execute a Linear issue through Plan->Work->Review->Episode with max parallelism.

## Issue Context (auto-injected)

!`linear-cli issues view $ARGUMENTS --yaml 2>/dev/null | head -30`

<instructions>
1. Bind Linear issue: `tuc linear bind $ARGUMENTS`
2. Plan: fork to planner with <platform-ref skill="plan" />, decompose into TaskBriefs with `parallelizable` flags
3. Work: spawn `min(parallelizable_tasks, 6)` teammates via TeamCreate — route-aware:
   - UI/frontend tasks → cursor-teammate (Composer 2)
   - Shell/batch/docs tasks → codex-teammate (GPT 5.4)
   - Complex/planning tasks → implementer (Claude Opus/Sonnet)
   Each gets one TaskBrief + one worktree, produces one commit + one draft PR
4. Review: for each PR, spawn review-orchestrator (BugBot->Devin FSM, sequential per PR, up to 6 PRs in parallel)
5. Fix findings surfaced by reviewers
6. Episode: record thread episodes via thread-weaver for session memory
7. Unbind: `tuc linear unbind` (status auto-set to `done`)
</instructions>

## Linear Status Transitions

`planned` (after step 2) -> `in_progress` (step 3) -> `in_review` (step 4) -> `done` (step 7)

<constraints>
- MUST spawn `min(parallelizable_tasks, 6)` teammates — never run parallel tasks sequentially
- Max 6 teammates (hard limit)
- Sequential tasks run after blockers complete
- Each PR's review is internally sequential (BugBot then Devin per FSM)
- Traceability: Linear Issue -> TaskBriefs -> WorktreeLeases -> Commits -> PRs -> ReviewGates -> Episode
</constraints>

## Gotchas
- "plan this" triggers plan, not orchestrate — orchestrate runs the FULL loop
- Max 6 parallel teammates — never exceed this even if more tasks are parallelizable
- Each PR review is sequential (BugBot then Devin) even when PRs run in parallel
