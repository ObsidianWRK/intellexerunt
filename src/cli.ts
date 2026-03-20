#!/usr/bin/env bun
/**
 * Intellexerunt CLI — minimal entry point for npx usage.
 * Usage: npx @intellexerunt/plugin <command>
 */

const [, , cmd, ...args] = process.argv;

async function main() {
  switch (cmd) {
    case "search": {
      const { searchBM25 } = await import("./search.ts");
      const query = args.join(" ");
      if (!query) { console.error("Usage: intellexerunt search <query>"); process.exit(1); }
      const results = await searchBM25(query, 10);
      for (const r of results) console.log(`${r.score.toFixed(3)}  ${r.path}  ${r.snippet?.slice(0, 80) ?? ""}`);
      break;
    }
    case "ctx7": {
      const { searchCtx7 } = await import("./ctx7.ts");
      const query = args.join(" ");
      if (!query) { console.error("Usage: intellexerunt ctx7 <query>"); process.exit(1); }
      const results = await searchCtx7(query, 10);
      for (const r of results) console.log(`${r.score.toFixed(3)}  ${r.path}  ${r.snippet?.slice(0, 80) ?? ""}`);
      break;
    }
    case "skills": {
      const { listSkills, SKILL_REGISTRY, exportAllSkills, packageForClaudeWeb } = await import("./skills.ts");
      if (args[0] === "--registry") {
        console.log(JSON.stringify(SKILL_REGISTRY, null, 2));
      } else if (args[0] === "--export") {
        const platform = args[1] as "agent-skills" | "chatgpt";
        if (!platform || !["agent-skills", "chatgpt"].includes(platform)) {
          console.error("Usage: intellexerunt skills --export <agent-skills|chatgpt>");
          process.exit(1);
        }
        const skills = await exportAllSkills(platform);
        console.log(JSON.stringify(skills, null, 2));
      } else if (args[0] === "--package") {
        const outDir = args[1] || "./skill-zips";
        const zips = await packageForClaudeWeb(outDir);
        console.log(`Packaged ${zips.length} skills to ${outDir}/`);
        for (const z of zips) console.log(`  ${z}`);
      } else {
        const skills = await listSkills();
        for (const s of skills) console.log(s);
      }
      break;
    }
    case "context": {
      const { injectDynamicContext } = await import("./dynamic-context.ts");
      const prompt = args.join(" ");
      if (!prompt) { console.error("Usage: intellexerunt context <prompt>"); process.exit(1); }
      const ctx = await injectDynamicContext(prompt);
      if (ctx) console.log(ctx);
      break;
    }
    case "route": {
      const { routeTask } = await import("./dispatch.ts");
      const title = args.join(" ");
      if (!title) { console.error("Usage: intellexerunt route <task description>"); process.exit(1); }
      const route = routeTask({ id: "cli", title, description: title });
      console.log(JSON.stringify(route, null, 2));
      break;
    }
    default:
      console.log(`intellexerunt — search, orchestration, and agent skills

Commands:
  search <query>     BM25 FTS5 search (chunks + symbols)
  ctx7 <query>       Context7 library doc search
  context <prompt>   Dynamic context injection (symbol lookup)
  route <task>       Route a task to a harness
  skills             List available skills
  skills --registry  Print NPX skill registry (JSON)
  skills --export <platform>  Export for agent-skills|chatgpt
  skills --package [dir]      Zip skills for Claude.ai upload`);
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
