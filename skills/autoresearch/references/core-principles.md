# Core Principles

Seven generalizable principles from Karpathy's autoresearch:

1. **Constrain scope** — Narrow the search space. Fewer files = faster convergence.
2. **Mechanize verification** — If you can't measure it with a number, you can't iterate on it.
3. **Atomic changes** — One change per iteration. Attribution requires isolation.
4. **Automatic rollback** — Failed experiments revert instantly. No sunk cost fallacy.
5. **Git is memory** — Commit history = experiment journal. Agent reads history to avoid repeating
   mistakes.
6. **Simplicity bias** — Equal results + less code = KEEP. Complexity is a cost, not a feature.
7. **Compound gains** — Small improvements stack. 1% per iteration = 2.7x over 100 iterations.

## TUC Application

- Scope: search params, RRF weights, hybrid ratios, skill matching
- Metric: composite eval score from `bun run eval`
- Guard: `bun test` must always pass
- Memory: `runs/autoresearch/*.tsv` + git log
