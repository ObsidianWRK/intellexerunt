# Results Logging

## Log Location

`runs/autoresearch/<YYYY-MM-DD>-<HHMM>-<goal-slug>.tsv`

## TSV Format

```
iter	timestamp	change	metric_before	metric_after	delta	guard	decision	notes
```

## Decision Values

- `keep` — metric improved, guard passed (or no guard)
- `discard` — metric same/worse, or guard failed after rework attempts
- `crash` — verify/guard command failed to run (not a metric failure)
- `discard (guard failed)` — metric improved but guard failed after 2 rework attempts

## Session Summary

After loop ends (interrupted or bounded), print:

```
=== Autoresearch Summary ===
Goal: <goal description>
Iterations: <N>
Baseline: <initial metric>
Current Best: <best metric>
Improvement: <delta> (<percent>%)
Kept: <N> | Discarded: <N> | Crashed: <N>
```

## Reading Past Results

Before each iteration, read the last 10-20 TSV entries to inform ideation. Use
`git log --oneline -20` for additional context on what changed.
