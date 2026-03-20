# Installing `plan`

Use when the user asks to plan, scope, decompose, architect, or break down a task. Also triggers on 

## Claude Code / Claude Agent SDK

Copy the skill folder into your project:

```bash
cp -r skills/plan .claude/skills/plan
```

Or install as a personal skill (available across all projects):

```bash
cp -r skills/plan ~/.claude/skills/plan
```

Docs: [Claude Code Skills](https://code.claude.com/docs/en/skills)

## Claude.ai (Web)

1. Zip the skill folder: `cd skills && zip -r plan.zip plan/`
2. Go to [claude.ai](https://claude.ai) → Settings → Features
3. Upload the zip file

Docs: [Using Skills in Claude](https://support.claude.com/en/articles/12512180-using-skills-in-claude)

## Cursor

Copy the skill folder:

```bash
cp -r skills/plan .cursor/skills/plan
```

Docs: [Cursor Skills](https://cursor.com/docs/context/skills)

## OpenAI Codex

Copy to the agents skills directory:

```bash
cp -r skills/plan .agents/skills/plan
```

Docs: [Codex Skills](https://developers.openai.com/codex/skills/)

## GitHub Copilot / VS Code

Copy to the instructions directory:

```bash
cp -r skills/plan .github/skills/plan
```

Docs: [Copilot Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)

## Gemini CLI

Copy the skill folder:

```bash
cp -r skills/plan .gemini/skills/plan
```

Docs: [Gemini CLI Skills](https://geminicli.com/docs/cli/skills/)

## Other Agent Skills-compatible tools

This skill uses the [Agent Skills](https://agentskills.io) open standard. Copy the folder to your tool's skills directory. See [agentskills.io](https://agentskills.io) for the full list of compatible tools.
