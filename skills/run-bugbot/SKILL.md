---
name: run-bugbot
description: Use when the user asks to trigger BugBot review on a PR. Triggers on "run bugbot", "bug finder", or "bugbot review". Template skill — no model invocation.
disable-model-invocation: true
user-invocable: false
allowed-tools: Bash(gh *)
argument-hint: <pr-number>
---

# Run BugBot Review

<instructions>
Trigger BugBot review on PR #$ARGUMENTS. NEVER post bare trigger — always include context.

```bash
BODY=$(scripts/build-review-context.sh $0 "bugbot run" bugbot)
gh pr comment $0 --body "$BODY"
```

Monitor (PR reviews AND issue comments):
```bash
gh api repos/{owner}/{repo}/pulls/$0/reviews --jq '.[] | select(.user.login == "cursor[bot]")'
gh api repos/{owner}/{repo}/issues/$0/comments --jq '.[] | select(.user.login == "cursor[bot]")'
```

Bot: `cursor[bot]`. Scope: frontend/UI, bug detection. FSM: always first (STAGE_0->BUGBOT_1->BUGBOT_2).
Normalization: `normalizeReviewGate("bugbot", raw)` -> `{severity, title, rationale, evidence[], blocking}`.
</instructions>

## Gotchas
- BugBot always runs FIRST in FSM (before Devin)
- Responds as both PR reviews AND issue comments
- NEVER post bare trigger — always include context via build-review-context.sh
