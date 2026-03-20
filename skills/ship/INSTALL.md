# Installing `ship`

Use when the user asks to ship, deploy, release, or publish. Triggers on "push to prod", "go live", 

## Claude Code / Claude Agent SDK

Copy the skill folder into your project:

```bash
cp -r skills/ship .claude/skills/ship
```

Or install as a personal skill (available across all projects):

```bash
cp -r skills/ship ~/.claude/skills/ship
```

Docs: [Claude Code Skills](https://code.claude.com/docs/en/skills)

## Claude.ai (Web)

1. Zip the skill folder: `cd skills && zip -r ship.zip ship/`
2. Go to [claude.ai](https://claude.ai) → Settings → Features
3. Upload the zip file

Docs: [Using Skills in Claude](https://support.claude.com/en/articles/12512180-using-skills-in-claude)

## Cursor

Copy the skill folder:

```bash
cp -r skills/ship .cursor/skills/ship
```

Docs: [Cursor Skills](https://cursor.com/docs/context/skills)

## OpenAI Codex

Copy to the agents skills directory:

```bash
cp -r skills/ship .agents/skills/ship
```

Docs: [Codex Skills](https://developers.openai.com/codex/skills/)

## GitHub Copilot / VS Code

Copy to the instructions directory:

```bash
cp -r skills/ship .github/skills/ship
```

Docs: [Copilot Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)

## Gemini CLI

Copy the skill folder:

```bash
cp -r skills/ship .gemini/skills/ship
```

Docs: [Gemini CLI Skills](https://geminicli.com/docs/cli/skills/)

## Other Agent Skills-compatible tools

This skill uses the [Agent Skills](https://agentskills.io) open standard. Copy the folder to your tool's skills directory. See [agentskills.io](https://agentskills.io) for the full list of compatible tools.
