---
name: deeper
description: Use when the user wants to investigate, research, explore, dig into, or understand something deeply. Triggers on "figure out", "why is this failing", or "deep dive".
context: fork
agent: researcher
user-invocable: true
allowed-tools: Read, Grep, Glob, WebFetch, Bash(bunx tuc search *)
argument-hint: <research-query>
---

# TUC Deeper

Research deeply: $ARGUMENTS

<instructions>
1. `bunx tuc search "$ARGUMENTS" --mode multi` (fallback: BM25-only)
2. Check project memory for prior research
3. Explore codebase via Glob/Grep/Read; WebFetch for external docs
4. Synthesize with citations
</instructions>

<constraints>
- Output YAML: `research` {query, sources[], findings[], recommendations[], confidence}
- ONLY answer from retrieved context, cite file:line, flag low-confidence
</constraints>

## Gotchas
- "explore the design" triggers design-consultation if "design system" is mentioned
- Output must cite file:line — never synthesize without retrieved context
- For autonomous iteration, use autoresearch instead
