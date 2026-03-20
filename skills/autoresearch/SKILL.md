---
name: autoresearch
description: Use when the user asks for autonomous iteration, overnight improvement, security audit, self-improving loops, auto optimization, or prompt evolution. Triggers on "autoresearch", "stride", "threat model", "keep improving until", "auto optimize", "evolve", or "work autonomously". Absorbs auto-optimize.
user-invocable: true
argument-hint: "[goal] or :plan :security :ship :debug :fix :scenario"
context: fork
agent: researcher
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
---

# Autoresearch — Autonomous Goal-directed Iteration

Goal: $ARGUMENTS. Core loop: Constrain -> Measure -> Change ONE thing -> Verify -> Keep/Revert -> Repeat.

## Current State (auto-injected)

Recent commits:
!`git log --oneline -5 2>/dev/null`

Last autoresearch results:
!`cat runs/autoresearch/*.tsv 2>/dev/null | tail -5`

Guard status:
!`bun test 2>&1 | tail -3`

## Subcommands

| Command | Purpose |
|---------|---------|
| `autoresearch [goal]` | Main improvement loop — iterate until goal met |
| `autoresearch:plan` | Wizard: goal -> scope -> metric -> verify -> plan doc |
| `autoresearch:security` | STRIDE + OWASP audit with autonomous test loop |
| `autoresearch:ship` | Delegate to ship for pre-ship validation |
| `autoresearch:debug` | Bisect a regression: binary search git history |
| `autoresearch:fix` | Fix a specific failing test/eval, one change at a time |
| `autoresearch:scenario` | Run what-if scenarios against the eval harness |

## Setup Phase

1. Read all in-scope files for full context
2. Define goal — extract mechanical metric (eval scores, test pass rate, bench timing, token count)
3. Define scope: modifiable files vs read-only files
4. Set guard command (default: `bun test`)
5. Create results log at `runs/autoresearch/YYYY-MM-DD-HHMM.tsv`
6. Establish baseline as iteration #0

## The Loop

Full protocol in `references/autonomous-loop-protocol.md`. Summary:

1. REVIEW: current state + git log + results log + last 3 deltas
2. IDEATE: fix crashes > exploit wins > explore new > combine > simplify > radical
3. MODIFY: ONE focused change to in-scope files only
4. COMMIT: git add + commit (before verify, so rollback is clean)
5. VERIFY: run metric command, extract number
6. GUARD: run guard command
7. DECIDE: improved+pass=keep, improved+fail=revert+rework(max 2), same/worse=revert, crash=fix(max 3)
8. LOG: append TSV row, repeat

## TUC Defaults

- **Verify**: `bun run eval`
- **Guard**: `bun test`
- **Metric**: NDCG*0.4 + Hit@5*0.3 + MRR*0.2 + Skills*0.05 + Memory*0.05
- **Scope**: `packages/{search,core}/src/*.ts`
- **Results**: `runs/autoresearch/`
- **TSV**: `iter  timestamp  change  metric_before  metric_after  delta  guard  decision  notes`

## Surface gate (100% sync targets)

If the iteration touches **skills**, **AGENTS.md / root agent docs**, **`packages/core/src/dispatch-routes.ts`**, **`.claude/rules/skill-isolation.md`**, or any materialized skill under a sync target, run before declaring success:

1. `bun run skill-sync -- --check --all-surfaces` — must exit 0. Covers six dirs: `.cursor/skills`, `.agents/skills`, `.codex/skills`, `.opencode/skills`, `skills/` (OpenClaw), `.hermes/skills`, plus route drift vs dispatch-routes + skill-isolation.
2. After editing `.claude/skills/<skill>/`, run `bun run skill-sync -- <skill> --all-surfaces` so copies match, then re-run the check.

Skill-heavy sessions: also run `bun tests/eval/cross-surface-skills.ts`.

## Modes

| Mode | Protocol |
|------|----------|
| `:plan` | Interactive wizard: goal -> scope -> metric -> guard -> plan doc with baseline |
| `:security` | STRIDE per component -> OWASP Top 10 -> autonomous exploit/fix/verify loop |
| `:ship` | Delegates to ship — tests, eval, lint, changelog, ship/no-ship decision |
| `:debug` | Binary search git history to find regression commit, analyze, suggest fix |
| `:fix` | One change per iteration toward fixing specific test; guard = failing test passes + no regressions |
| `:scenario` | Apply change temporarily -> run eval -> revert -> log scenario results |

<constraints>
- One change per iteration — never batch multiple changes
- Mechanical verification only — no subjective "looks better"
- Auto-rollback on failure — never leave broken state
- Simplicity wins: equal results + less code = KEEP
- Git is memory — every iteration is a commit
- NEVER modify eval/metric code during the loop — metrics are read-only
- NEVER mock functions, disable tests, or fake success to claim improvement
- NEVER create new files when existing files can be modified
- Gate must check 2+ independent axes (score + correctness + no-regression)
- Emit checkpoint summary every 5 iterations (accept rate, score trend, scope drift)
- Track accept rate: low rate = stop and recalibrate gate vs proposer
</constraints>

## Gotchas
- One change per iteration — never batch multiple changes
- Always commit before verify (clean rollback)
- For one-off deep research, use deeper instead
- "auto optimize" and "evolve" now route here (auto-optimize merged)
- Agents optimize for "done" not correctness — verify underlying mechanism on score spikes
- Agents create file bloat — atomic commits, fixed scope, never `git add .`
- See `.claude/rules/autoresearch-integrity.md` for full anti-cheating rules
