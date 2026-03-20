---
name: run-devin
description: Use when the user asks to trigger Devin review on a PR. Triggers on "ask devin", "have devin look at this", or "devin review". Template skill — no model invocation.
disable-model-invocation: true
user-invocable: false
allowed-tools: Bash(gh *)
argument-hint: <pr-number>
---

# Run Devin Review

<instructions>
Trigger Devin review on PR #$ARGUMENTS. NEVER post bare trigger — always include context.

```bash
BODY=$(scripts/build-review-context.sh $0 "@devin-ai-integration please review" devin)
gh pr comment $0 --body "$BODY"
```

Monitor (PR reviews only, NOT issue comments):
```bash
gh api repos/{owner}/{repo}/pulls/$0/reviews --jq '.[] | select(.user.login == "devin-ai-integration[bot]")'
```

Bot: `devin-ai-integration[bot]`. Scope: logic, architecture, security. FSM: always second (DEVIN_1->DEVIN_2), after BugBot. CANNOT review drafts — auto-promotes via `gh pr ready`.

Normalization: `normalizeReviewGate("devin-review", raw)` -> `{severity, title, rationale, evidence[], blocking}`. High/critical=blocking.

Trigger comments MUST follow ACP schema (`.tuc-docs/tools/acp.md`). Devin MUST post ALL findings as inline PR comments.

This skill ONLY triggers via GitHub comment. Review happens asynchronously.
</instructions>

## Gotchas
- Devin CANNOT review draft PRs — auto-promotes via `gh pr ready`
- Always runs SECOND in FSM (after BugBot)
- NEVER post bare trigger — always include context via build-review-context.sh
