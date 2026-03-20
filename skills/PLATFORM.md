# Skills by surface: TUI / IDE vs Claude Web vs ChatGPT

This repo’s skills are [Agent Skills](https://agentskills.io)-shaped markdown. **How well they work depends on what the host can run** (shell, browser, git, MCP, delegation to other tools).

## Quick reference

| Tier | Best surfaces | Typical skills |
|------|----------------|----------------|
| **Full fidelity** — local tools, CLIs, delegation | Claude Code, Cursor, Codex CLI, terminals, any TUI with tool access | `orchestrate`, `run-cursor`, `run-codex`, `run-devin`, `run-bugbot`, `setup-browser-cookies`, `browse-url`, `fetch-tweet`, `autoresearch` |
| **Reasoning & process** — minimal or no local execution | Claude Web (uploaded skills), ChatGPT (exported text) | `plan`, `deeper`, `review`, `ship`, `work`, `standup`, `design-consultation`, `document-release` |
| **Web upload** | Claude Web (zip of skill folder) | Same files as agent-skills; heavy skills are *possible* to upload but often **weak in practice** without the underlying tools |

## ChatGPT (web)

ChatGPT does not load `SKILL.md` natively. Use the package CLI to export adapted instructions:

```bash
npx @intellexerunt/plugin skills --export chatgpt
```

Skills that assume a shell, browser automation, or delegation to other agents are **omitted** from that export on purpose (see `CHATGPT_EXCLUDED_SKILLS` in `src/skills.ts`):  
`orchestrate`, `run-cursor`, `run-codex`, `run-devin`, `run-bugbot`, `setup-browser-cookies`, `browse-url`, `fetch-tweet`.

## Claude Web (claude.ai)

Use native skill folders (zip) or `skills --export claude-web`. Prefer **process-oriented** skills unless you only need high-level guidance for tool-heavy workflows.

## Resolution for loaders

The library resolves skill folders in this order: explicit `repoRoot` → `INTELLEXERUNT_SKILLS_ROOT` → **bundled** `skills/` next to the package → `./skills` and `./.claude/skills` under `process.cwd()`. See the root `README.md`.
