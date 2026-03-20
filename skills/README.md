# Intellexerunt Skills

17 skills following the [Agent Skills](https://agentskills.io) open standard. Works with Claude Code, Claude.ai, Cursor, Codex, GitHub Copilot, Gemini CLI, and 30+ other tools.

## Skills

| Skill | What it does |
|-------|-------------|
| [autoresearch](autoresearch/) | Autonomous goal-directed iteration loop |
| [browse-url](browse-url/) | Browse URL, take screenshot, scrape |
| [deeper](deeper/) | Deep research and codebase exploration |
| [design-consultation](design-consultation/) | Design system work and competitor analysis |
| [document-release](document-release/) | Update docs, changelog, README |
| [fetch-tweet](fetch-tweet/) | Fetch tweet content from X/Twitter |
| [orchestrate](orchestrate/) | Full Plan→Work→Review→Episode loop |
| [plan](plan/) | Strategic planning and task decomposition |
| [review](review/) | PR review and code audit |
| [run-bugbot](run-bugbot/) | Trigger BugBot PR review |
| [run-codex](run-codex/) | Delegate batch/shell tasks to Codex |
| [run-cursor](run-cursor/) | Delegate UI/frontend tasks to Cursor |
| [run-devin](run-devin/) | Trigger Devin PR review |
| [setup-browser-cookies](setup-browser-cookies/) | Import browser cookies for headless auth |
| [ship](ship/) | Deploy, release, and publish |
| [standup](standup/) | Status summary and progress report |
| [work](work/) | Implement, build, code, fix |

## Quick install

Each skill folder has an `INSTALL.md` with per-surface instructions.

### All skills at once

```bash
# Claude Code (project)
cp -r skills/*/ .claude/skills/

# Claude Code (personal, all projects)
cp -r skills/*/ ~/.claude/skills/

# Cursor
cp -r skills/*/ .cursor/skills/

# OpenAI Codex
cp -r skills/*/ .agents/skills/

# GitHub Copilot
cp -r skills/*/ .github/skills/

# Gemini CLI
cp -r skills/*/ .gemini/skills/
```

### Claude.ai (web)

```bash
# Package all skills as zips for upload
for d in skills/*/; do (cd skills && zip -r "$(basename $d).zip" "$(basename $d)/"); done

# Then upload each zip at claude.ai → Settings → Features
```

Or use the CLI:

```bash
npx @intellexerunt/plugin skills --package ./zips
```

## Docs

- [Agent Skills standard](https://agentskills.io)
- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Claude.ai Skills](https://support.claude.com/en/articles/12512180-using-skills-in-claude)
- [Claude API Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Cursor Skills](https://cursor.com/docs/context/skills)
- [Codex Skills](https://developers.openai.com/codex/skills/)
- [Copilot Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [Gemini CLI Skills](https://geminicli.com/docs/cli/skills/)
