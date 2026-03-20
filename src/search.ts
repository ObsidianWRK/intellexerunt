/**
 * BM25 search — FTS5 chunks + symbol index.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

import type { RankedResult } from "./types.ts";

/** Tokenize query and build FTS5 MATCH expression. */
export function toFtsQuery(query: string): { tokens: string[]; ftsExpr: string } {
  const tokens = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const ftsExpr = tokens.length === 0 ? "" : tokens.map((t) => `${t}*`).join(" OR ");
  return { tokens, ftsExpr };
}

/** Path-kind multiplier for scoring. */
export function kindMultiplier(filePath: string): number {
  const n = filePath;
  if (n.startsWith("packages/") && /\.(ts|tsx|js|jsx)$/.test(n)) return 1.0;
  if (n === "app.config.toml" || n === "CLAUDE.md") return 1.15;
  if (/^[A-Z]+\.(md|json|toml)$/.test(n)) return 1.0;
  if (n.startsWith("scripts/") && !n.startsWith("scripts/test-")) return 1.0;
  if (n.startsWith("scripts/test-")) return 0.75;
  if (n.startsWith(".claude/rules/")) return 1.0;
  if (n.startsWith(".claude/skills/")) return 0.7;
  if (n.startsWith(".claude/")) return 0.95;
  if (n.startsWith("docs/")) return 0.9;
  if (n.startsWith(".cursor/")) return 0.5;
  if (n.startsWith(".codex/") || n.startsWith(".agents/")) return 0.45;
  return 0.7;
}

/** Extract smart snippet at statement boundary. */
export function smartSnippet(body: string, targetLen = 300): string {
  if (body.length <= targetLen) return body;
  const searchStart = Math.max(0, targetLen - 100);
  const searchEnd = Math.min(body.length, targetLen + 100);
  const region = body.slice(searchStart, searchEnd);
  for (const re of [/\}\n/g, /;\n/g, /\n\n/g, /\n/g]) {
    re.lastIndex = 0;
    const m = re.exec(region);
    if (m) return body.slice(0, searchStart + m.index + m[0].length).trimEnd();
  }
  return body.slice(0, targetLen);
}

function fileStem(p: string): string {
  const base = p.split("/").pop() ?? p;
  const dot = base.lastIndexOf(".");
  return dot > 0 ? base.slice(0, dot) : base;
}

function pathBoost(filePath: string, queryTokens: string[]): number {
  const pathLower = filePath.toLowerCase();
  const parts = pathLower.split(/[/\\._-]+/).filter(Boolean);
  const stem = fileStem(pathLower);
  let matches = 0;
  for (const qt of queryTokens) {
    if (pathLower.includes(qt)) matches += 1;
    if (stem === qt) {
      matches += 1;
    } else {
      for (const part of parts) {
        if (part === qt || part.startsWith(qt) || qt.startsWith(part)) {
          matches += 0.5;
          break;
        }
      }
    }
  }
  return matches / Math.max(queryTokens.length, 1);
}

function deduplicateByPath<T extends { path: string }>(
  items: T[],
  isBetter: (a: T, b: T) => boolean,
): Map<string, T> {
  const byPath = new Map<string, T>();
  for (const item of items) {
    const existing = byPath.get(item.path);
    if (!existing || isBetter(item, existing)) byPath.set(item.path, item);
  }
  return byPath;
}

function deduplicateAndScore(
  rows: Array<{ path: string; title: string; body: string; rank: number }>,
  tokens: string[],
  top: number,
): RankedResult[] {
  const byPath = deduplicateByPath(
    rows.map((r) => ({ path: r.path, rank: r.rank, snippet: smartSnippet(r.body) })),
    (a, b) => a.rank < b.rank,
  );
  const entries = [...byPath.values()];
  if (entries.length === 0) return [];
  const ranks = entries.map((v) => v.rank);
  const minRank = Math.min(...ranks);
  const maxRank = Math.max(...ranks);
  const range = Math.abs(maxRank - minRank) || 1;
  return entries
    .map(({ path: p, rank, snippet }) => {
      const bm25Norm = Math.abs(rank - maxRank) / range;
      const score = (bm25Norm * 0.55 + pathBoost(p, tokens) * 0.45) * kindMultiplier(p);
      return { path: p, score, source: "bm25" as const, snippet };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, top);
}

/** Search symbol FTS5 table for function/class/type matches. */
async function searchSymbols(query: string, top: number, repoRoot: string): Promise<RankedResult[]> {
  const dbPath = join(repoRoot, ".tuc", "index.sqlite");
  if (!existsSync(dbPath)) return [];
  const { tokens, ftsExpr } = toFtsQuery(query);
  if (!ftsExpr) return [];
  try {
    const { Database } = await import("bun:sqlite");
    const db = new Database(dbPath, { readonly: true });
    try {
      const rows = db
        .query(`
        SELECT s.path, s.name, s.kind, s.line, s.signature, s.doc, bm25(symbols_fts) as rank
        FROM symbols_fts JOIN symbols s ON s.id = symbols_fts.symbol_id
        WHERE symbols_fts MATCH ? ORDER BY rank LIMIT ?
      `)
        .all(ftsExpr, top * 2) as Array<{
        path: string; name: string; kind: string; line: number;
        signature: string; doc: string | null; rank: number;
      }>;
      if (rows.length === 0) return [];
      const ranks = rows.map((r) => r.rank);
      const minRank = Math.min(...ranks);
      const maxRank = Math.max(...ranks);
      const range = Math.abs(maxRank - minRank) || 1;
      return rows
        .map((r) => {
          const bm25Norm = Math.abs(r.rank - maxRank) / range;
          const pathB = tokens.some((t) => r.name.toLowerCase().includes(t)) ? 0.3 : 0;
          const score = (bm25Norm * 0.6 + pathB * 0.4) * 0.8;
          const snippet = `${r.kind} ${r.signature}${r.doc ? ` — ${r.doc}` : ""}`;
          return { path: `${r.path}:${r.line}`, score, source: "bm25" as const, snippet };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, top);
    } finally {
      db.close();
    }
  } catch {
    return [];
  }
}

/** FTS5 chunk search (pure TS, no FFI). */
async function searchChunks(query: string, top: number, repoRoot: string): Promise<RankedResult[]> {
  const dbPath = join(repoRoot, ".tuc", "index.sqlite");
  if (!existsSync(dbPath)) return [];
  const { tokens, ftsExpr } = toFtsQuery(query);
  if (!ftsExpr) return [];
  try {
    const { Database } = await import("bun:sqlite");
    const db = new Database(dbPath, { readonly: true });
    try {
      const rows = db
        .query(`
        SELECT c.path, c.title, c.body, bm25(chunks_fts) as rank
        FROM chunks_fts JOIN chunks c ON c.id = chunks_fts.chunk_id
        WHERE chunks_fts MATCH ? ORDER BY rank LIMIT ?
      `)
        .all(ftsExpr, 5000) as Array<{ path: string; title: string; body: string; rank: number }>;
      return deduplicateAndScore(rows, tokens, top);
    } finally {
      db.close();
    }
  } catch {
    return [];
  }
}

/** BM25 search: chunks + symbols, merged and deduplicated. */
export async function searchBM25(
  query: string,
  top = 10,
  repoRoot?: string,
): Promise<RankedResult[]> {
  const root = repoRoot ?? process.cwd();
  const [chunks, symbols] = await Promise.all([
    searchChunks(query, top, root),
    searchSymbols(query, Math.min(top, 5), root),
  ]);
  const merged = [...chunks];
  for (const sym of symbols) {
    const basePath = sym.path.split(":")[0];
    if (!merged.some((r) => r.path === basePath || r.path === sym.path)) merged.push(sym);
  }
  return merged.sort((a, b) => b.score - a.score).slice(0, top);
}
