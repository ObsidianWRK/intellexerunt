---
name: design-consultation
description: Use when the user asks for design system work, competitor analysis, UI patterns, or visual design. Triggers on "design mockup", "browse competitors", or "design document". NOT for code review (use review).
user-invocable: true
argument-hint: "[feature or component to design]"
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

# Design Consultation — Design System Builder

Research, analyze, and document design decisions for: $ARGUMENTS.

<instructions>
1. Brief: what are we designing? Audience? Constraints?
2. Research: browse competitor implementations via `agent-browser` or Chrome DevTools MCP
3. Pattern analysis: identify common layout, interaction, information architecture, error state patterns
4. Recommend: which patterns to adopt/avoid, key differentiators
5. Document: write DESIGN.md with brief, research findings, recommended patterns, component hierarchy, key interactions, accessibility
</instructions>

<constraints>
- Always research before recommending
- Show evidence for design decisions
- Consider accessibility from the start
- Prefer existing design system tokens/components
- Document trade-offs, not just decisions
</constraints>

## Delegation

Consider delegating UI implementation sub-tasks to Cursor CLI (Composer 2):
`scripts/run-cursor.sh "implement the component based on design spec" "$WORKTREE" composer-2`

## Gotchas
- "review my code" triggers review, not design-consultation
- Always browse competitors before recommending — never design in a vacuum
- Use agent-browser for live competitor sites, not WebFetch (needs JS rendering)
