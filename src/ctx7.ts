/**
 * Context7 library doc search via CLI.
 */

import type { RankedResult } from "./types.ts";

const LIBRARY_MAP: Record<string, string> = {
  bun: "/oven-sh/bun",
  react: "/facebook/react",
  vue: "/vuejs/core",
  next: "/vercel/next.js",
  nuxt: "/nuxt/nuxt",
  typescript: "/microsoft/TypeScript",
  node: "/nodejs/node",
  sqlite: "/nicolo-ribaudo/tc39-better-sqlite3",
  tailwind: "/tailwindlabs/tailwindcss",
  anthropic: "/anthropics/anthropic-sdk-python",
  openai: "/openai/openai-node",
  vitest: "/vitest-dev/vitest",
  zod: "/colinhacks/zod",
  hono: "/honojs/hono",
  drizzle: "/drizzle-team/drizzle-orm",
  linear: "/linearapp/linear",
  sagemaker: "/aws/amazon-sagemaker-examples",
};

function detectLibrary(query: string): { id: string; name: string } | null {
  const tokens = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  for (const token of tokens) {
    const id = LIBRARY_MAP[token];
    if (id) return { id, name: token };
  }
  return null;
}

interface Ctx7Response {
  codeSnippets: Array<{
    codeTitle: string; codeId: string; pageTitle: string;
    codeList: Array<{ language: string; code: string }>;
  }>;
  infoSnippets: Array<{ pageId: string; breadcrumb: string; content: string }>;
}

export async function searchCtx7(query: string, top = 10): Promise<RankedResult[]> {
  const lib = detectLibrary(query);
  if (!lib) return [];
  try {
    const proc = Bun.spawn(["ctx7", "docs", lib.id, query, "--json"], {
      stdout: "pipe", stderr: "pipe", timeout: 10_000,
    });
    const stdout = await new Response(proc.stdout).text();
    await proc.exited;
    if (proc.exitCode !== 0) return [];
    const resp = JSON.parse(stdout) as Ctx7Response;
    const results: RankedResult[] = [];
    for (let i = 0; i < resp.codeSnippets.length && results.length < top; i++) {
      const s = resp.codeSnippets[i];
      const code = s.codeList[0]?.code ?? "";
      results.push({
        path: s.codeId || `ctx7://${lib.name}/${s.pageTitle}`,
        score: Math.max(0.01, 1.0 - i * 0.1),
        source: "ctx7",
        snippet: `${s.codeTitle}: ${code.slice(0, 200)}`,
      });
    }
    for (let i = 0; i < resp.infoSnippets.length && results.length < top; i++) {
      const s = resp.infoSnippets[i];
      results.push({
        path: s.pageId || `ctx7://${lib.name}/${s.breadcrumb}`,
        score: Math.max(0.01, 0.5 - i * 0.05),
        source: "ctx7",
        snippet: s.content.slice(0, 300),
      });
    }
    return results.slice(0, top);
  } catch {
    return [];
  }
}
