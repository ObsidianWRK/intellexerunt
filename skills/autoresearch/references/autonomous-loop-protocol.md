# Autonomous Loop Protocol

## Loop Modes

- **Unbounded (default):** Loop forever until interrupted
- **Bounded:** Loop N times when chained with `/loop N`

## Phase 1: Review

Read current state of in-scope files, last 10-20 results log entries, `git log --oneline -20`.
Identify what worked, failed, untried.

## Phase 2: Ideate

Priority: fix crashes > exploit successes > explore new > combine near-misses > simplify > radical
experiments. Anti-patterns: don't repeat discarded changes, don't batch unrelated changes, don't add
complexity for marginal gains.

## Phase 3: Modify

ONE focused change. Write description BEFORE making the change.

## Phase 4: Commit

`git add <files> && git commit -m "experiment: <description>"` — commit BEFORE verify so rollback is
clean.

## Phase 5: Verify

Run verify command, extract metric number. Timeout: 2x normal = kill + crash. If the iteration
touched skills, agent surface files, or dispatch/skill-isolation routes, include
`bun run skill-sync -- --check --all-surfaces` in verify (must pass).

## Phase 5.5: Guard

If guard defined, run after verify. Pass/fail only. If fails: revert, rework (max 2 attempts), else
discard. NEVER modify guard/test files.

## Phase 6: Decide

- IMPROVED + guard pass → keep
- IMPROVED + guard fail → revert + rework (max 2) → keep or discard
- SAME/WORSE → revert, log "discard"
- CRASHED → fix (max 3) → log "crash" if still failing

## Phase 7: Log

Append TSV row: iter, timestamp, change, metric_before, metric_after, delta, guard, decision, notes.
