# @intellexerunt/plugin

Search, orchestration, and agent skills for Claude Code, Cursor, Codex, and Devin.

## What's in the box

| Module | What it does |
|--------|-------------|
| `search` | BM25 FTS5 search over chunks + symbol index |
| `ctx7` | Library documentation search via Context7 CLI |
| `dynamic-context` | Symbol injection for agent prompts (Cursor-parity) |
| `thread-weaver` | Episode-based multi-agent orchestration |
| `compaction` | Claude Messages API compaction config builder |
| `dispatch` | Task → harness routing (18 routes across 5 surfaces) |
| `linear` | Linear-CLI wrapper (bind/unbind issues, status tracking) |
| `codex` | Codex CLI exec wrapper (GPT 5.4) |
| `cursor` | Cursor model types (MCP bridge) |
| `skills` | Skill loader + NPX registry (17 skills with triggers) |

Skill resolution for `loadSkill` / `listSkills`: optional `repoRoot` argument → `INTELLEXERUNT_SKILLS_ROOT` → bundled `skills/` in the package → `./skills` and `./.claude/skills` under the current working directory. See [skills/PLATFORM.md](skills/PLATFORM.md) for **TUI/IDE vs Claude Web vs ChatGPT**.

## Install

```bash
bun add @intellexerunt/plugin
```

## Usage

### Search

```typescript
import { searchBM25 } from "@intellexerunt/plugin/search";

const results = await searchBM25("thread weaver dispatch", 10);
// [{ path, score, source, snippet }, ...]
```

### Thread Weaving

```typescript
import { ThreadWeaver, createEpisode } from "@intellexerunt/plugin/thread-weaver";

const weaver = new ThreadWeaver();
const waves = weaver.planWaves({
  threads: [
    { id: "research", goal: "Find auth patterns", agentType: "researcher" },
    { id: "implement", goal: "Build login", agentType: "implementer", dependsOn: ["research"] },
  ],
});

// Dispatch wave 1 (research), record episode, then wave 2 gets episode context
for (const wave of waves) {
  const payloads = weaver.dispatchWave(wave);
  // payloads → Agent tool calls with woven episode context
}
```

### Task Routing

```typescript
import { routeTask } from "@intellexerunt/plugin/dispatch";

routeTask({ id: "1", title: "Build login form UI", description: "React login" });
// → { harness: "cursor", mode: "native-subagent", rationale: "..." }
```

### Compaction

```typescript
import { buildCompactionConfig } from "@intellexerunt/plugin/compaction";

const config = buildCompactionConfig({ triggerTokens: 80_000 });
// Pass to Claude Messages API as context_management
```

### Skills

```typescript
import { loadSkill, listSkills, SKILL_REGISTRY } from "@intellexerunt/plugin/skills";

const skills = await listSkills();          // union of all discovered skill dirs
const skill = await loadSkill("autoresearch"); // { name, content, frontmatter }
console.log(SKILL_REGISTRY);               // NPX directory format
```

Set `INTELLEXERUNT_SKILLS_ROOT` to your repo root when skills live only under `./skills` or `./.claude/skills` and the package runs with another cwd.

### Dynamic Context Injection

```typescript
import { injectDynamicContext } from "@intellexerunt/plugin/dynamic-context";

const context = await injectDynamicContext("thread weaver dispatch");
// "## Relevant Symbols (auto-injected)\n  - packages/core/src/thread-weaver.ts:78 — function taskBriefToThreadSpec\n..."
```

## CLI

```bash
npx @intellexerunt/plugin search "thread weaver"
npx @intellexerunt/plugin ctx7 "bun sqlite"
npx @intellexerunt/plugin context "dispatch routing"
npx @intellexerunt/plugin route "build a login form"
npx @intellexerunt/plugin skills
npx @intellexerunt/plugin skills --registry
npx @intellexerunt/plugin skills --export claude-web
npx @intellexerunt/plugin skills --export chatgpt
```

## Skill Registry

17 skills registered for the NPX skills directory:

| Skill | Triggers |
|-------|----------|
| autoresearch | autoresearch, auto optimize, evolve, keep improving |
| deeper | deeper, investigate, figure out, deep dive |
| orchestrate | orchestrate, full loop, execute this issue |
| plan | plan, scope, decompose, design the approach |
| review | review, audit, check this PR |
| ship | ship, deploy, release, go live |
| work | implement, build, code, fix |
| standup | standup, status, what happened |
| browse-url | browse, open url, scrape page |
| fetch-tweet | fetch tweet, x.com, twitter |
| design-consultation | design system, competitor analysis, design mockup |
| document-release | update docs, release docs, write changelog |
| run-cursor | cursor, delegate to cursor, via cursor |
| run-codex | codex, delegate to codex, via codex |
| run-devin | devin review, trigger devin |
| run-bugbot | bugbot, cursor review |
| setup-browser-cookies | import cookies, setup browser cookies |

## Architecture

```
@intellexerunt/plugin
├── search.ts          BM25 FTS5 (chunks + symbols)
├── ctx7.ts            Library doc search
├── dynamic-context.ts Symbol injection hook
├── thread-weaver.ts   Episodes + thread orchestration
├── compaction.ts      Claude compaction config
├── dispatch.ts        Task → harness routing
├── linear.ts          Linear-CLI wrapper
├── codex.ts           Codex exec wrapper
├── cursor.ts          Cursor MCP types
├── skills.ts          Skill loader + registry
├── types.ts           Shared types
├── cli.ts             CLI entry point
└── index.ts           Barrel export
```

## License

See [LICENSE](LICENSE).
