/**
 * Dynamic context injection — searches symbol index and injects
 * relevant code references into agent prompts.
 * Port of .claude/hooks/dynamic-context.sh to TS.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

const STOP_WORDS = new Set([
  "the", "a", "an", "to", "for", "in", "on", "of", "is", "it", "this", "that",
  "with", "and", "or", "but", "not", "from", "be", "as", "at", "by", "we",
  "do", "if", "my", "up", "so", "no", "go",
]);

/** Extract meaningful terms from a prompt. */
function extractTerms(prompt: string, maxTerms = 5): string[] {
  return prompt
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
    .slice(0, maxTerms);
}

export interface SymbolHit {
  path: string;
  line: number;
  kind: string;
  name: string;
  signature?: string;
}

/**
 * Search symbol index for relevant code given a prompt.
 * Returns formatted markdown suitable for injection into agent context.
 */
export async function injectDynamicContext(
  prompt: string,
  repoRoot?: string,
): Promise<string> {
  const root = repoRoot ?? process.cwd();
  const dbPath = join(root, ".tuc", "index.sqlite");
  if (!existsSync(dbPath)) return "";

  const terms = extractTerms(prompt);
  if (terms.length === 0) return "";

  const ftsExpr = terms.join(" OR ");

  try {
    const { Database } = await import("bun:sqlite");
    const db = new Database(dbPath, { readonly: true });

    // Check if symbols_fts exists
    const exists = db.query("SELECT 1 FROM sqlite_master WHERE name='symbols_fts'").get();
    if (!exists) { db.close(); return ""; }

    const rows = db.query(`
      SELECT s.path, s.line, s.name, s.kind, s.signature
      FROM symbols_fts JOIN symbols s ON s.id = symbols_fts.symbol_id
      WHERE symbols_fts MATCH ? ORDER BY bm25(symbols_fts) LIMIT 8
    `).all(ftsExpr) as SymbolHit[];

    db.close();
    if (rows.length === 0) return "";

    const lines = rows.map((r) => `  - ${r.path}:${r.line} — ${r.kind} ${r.name}`);
    return `## Relevant Symbols (auto-injected)\n${lines.join("\n")}`;
  } catch {
    return "";
  }
}
