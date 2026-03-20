# Plan Wizard Workflow

## Trigger

`autoresearch:plan [goal]` or "help me set up autoresearch", "plan an autoresearch run"

## Steps

### 1. Capture Goal

Ask what the user wants to improve, or accept inline text.

### 2. Analyze Context

Scan codebase for test runners, build scripts, benchmarks, eval suites. For TUC: detect `bun test`,
`bun run eval`, `bun run bench`, experiment.ts.

### 3. Define Scope

Suggest file globs based on goal. Validate they resolve to real files. **Gate:** Must resolve to >=
1 file.

### 4. Define Metric

Suggest mechanical metrics. Reject subjective measures. **Gate:** Must output a parseable number.

### 5. Define Direction

Higher or lower is better.

### 6. Define Verify Command

Construct the shell command. **Dry-run it.** Confirm it exits cleanly and produces a metric.
**Gate:** Must pass dry run.

### 7. Define Guard (Optional)

Command that must always pass (regression protection).

### 8. Confirm & Launch

Present complete config. Offer to launch immediately or save for later.

## Output

Ready-to-execute autoresearch config:

```yaml
goal: <description>
scope: <file globs>
metric: <what to measure>
direction: higher|lower
verify: <command>
guard: <command or null>
```
