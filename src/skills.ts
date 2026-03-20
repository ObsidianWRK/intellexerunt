/**
 * Skill loader — reads SKILL.md files and returns their content.
 * Skills are declarative (SKILL.md + frontmatter), not code.
 * This module makes them accessible to any surface programmatically.
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Bundled skills directory (next to `src/` in the published package). */
const PACKAGE_SKILLS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..", "skills");

export interface SkillDefinition {
  name: string;
  content: string;
  frontmatter: Record<string, unknown>;
}

/** Ordered bases: each is a directory whose children are skill folders containing SKILL.md. */
function skillParentDirs(repoRoot?: string): string[] {
  const ordered: string[] = [];
  const pushPair = (root: string | undefined) => {
    if (!root) return;
    ordered.push(join(root, "skills"));
    ordered.push(join(root, ".claude", "skills"));
  };
  pushPair(repoRoot);
  pushPair(process.env.INTELLEXERUNT_SKILLS_ROOT);
  ordered.push(PACKAGE_SKILLS_DIR);
  pushPair(process.cwd());
  const seen = new Set<string>();
  return ordered.filter((p) => {
    const k = resolve(p);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Absolute path to SKILL.md for `name`, or null if not found. */
export function resolveSkillMarkdownPath(name: string, repoRoot?: string): string | null {
  for (const base of skillParentDirs(repoRoot)) {
    const md = join(base, name, "SKILL.md");
    if (existsSync(md)) return md;
  }
  return null;
}

/** Parse YAML-ish frontmatter from a SKILL.md file. */
function parseFrontmatter(raw: string): { frontmatter: Record<string, unknown>; body: string } {
  if (!raw.startsWith("---")) return { frontmatter: {}, body: raw };
  const end = raw.indexOf("---", 3);
  if (end === -1) return { frontmatter: {}, body: raw };
  const fm: Record<string, unknown> = {};
  const fmBlock = raw.slice(3, end).trim();
  for (const line of fmBlock.split("\n")) {
    const colon = line.indexOf(":");
    if (colon > 0) {
      const key = line.slice(0, colon).trim();
      const val = line.slice(colon + 1).trim();
      fm[key] = val;
    }
  }
  return { frontmatter: fm, body: raw.slice(end + 3).trim() };
}

/**
 * Load a skill by name.
 * Resolution order: `repoRoot` ({skills,.claude/skills}) → `INTELLEXERUNT_SKILLS_ROOT` →
 * bundled package `skills/` → `process.cwd()` ({skills,.claude/skills}).
 */
export async function loadSkill(name: string, repoRoot?: string): Promise<SkillDefinition> {
  const skillPath = resolveSkillMarkdownPath(name, repoRoot);
  if (!skillPath) {
    throw new Error(
      `Skill "${name}" not found. Set INTELLEXERUNT_SKILLS_ROOT or copy skills into .claude/skills/.`,
    );
  }
  const raw = await readFile(skillPath, "utf-8");
  const { frontmatter, body } = parseFrontmatter(raw);
  return { name, content: body, frontmatter };
}

/** List skill names found across all configured skill parent directories. */
export async function listSkills(repoRoot?: string): Promise<string[]> {
  const { readdir } = await import("node:fs/promises");
  const names = new Set<string>();
  for (const base of skillParentDirs(repoRoot)) {
    if (!existsSync(base)) continue;
    try {
      const entries = await readdir(base, { withFileTypes: true });
      for (const e of entries) {
        if (!e.isDirectory()) continue;
        if (existsSync(join(base, e.name, "SKILL.md"))) names.add(e.name);
      }
    } catch {
      /* ignore */
    }
  }
  return [...names].sort();
}

// ── Multi-Platform Export ──────────────────────────────────────────────

/**
 * Platform targets:
 * - "agent-skills": Native SKILL.md (Claude Code, Claude.ai, Cursor, Codex, 30+ tools via agentskills.io)
 * - "chatgpt": Custom instructions + conversation starters (no SKILL.md support)
 */
export type SkillPlatform = "agent-skills" | "chatgpt" | "claude-web";

export interface PlatformSkill {
  name: string;
  description: string;
  /** The skill content (SKILL.md raw for agent-skills, converted for chatgpt). */
  instructions: string;
  /** ChatGPT conversation starters (up to 4). */
  starters?: string[];
}

/** Skills that require shell/agent infra unavailable on ChatGPT. */
export const CHATGPT_EXCLUDED_SKILLS = new Set([
  "orchestrate", "run-cursor", "run-codex", "run-devin", "run-bugbot",
  "setup-browser-cookies", "browse-url", "fetch-tweet",
]);

/** Strip Claude Code-specific syntax for ChatGPT export. */
function stripForChatGPT(body: string): string {
  return body
    .replace(/^!`[^`]+`$/gm, "")
    .replace(/<platform-ref[^/]*\/>/g, "")
    .replace(/\$ARGUMENTS/g, "[user's request]")
    .replace(/context:\s*fork\n?/g, "")
    .replace(/agent:\s*\w+\n?/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Convert a skill to a specific platform format. */
export async function exportSkill(
  name: string,
  platform: SkillPlatform,
  repoRoot?: string,
): Promise<PlatformSkill | null> {
  if (platform === "chatgpt" && CHATGPT_EXCLUDED_SKILLS.has(name)) return null;

  const skill = await loadSkill(name, repoRoot);
  const desc = typeof skill.frontmatter.description === "string"
    ? skill.frontmatter.description : name;

  if (platform === "agent-skills" || platform === "claude-web") {
    const mdPath = resolveSkillMarkdownPath(name, repoRoot);
    if (!mdPath) return null;
    const raw = await readFile(mdPath, "utf-8");
    return { name, description: desc, instructions: raw };
  }

  const body = stripForChatGPT(skill.content);
  const entry = SKILL_REGISTRY.find((s) => s.name === name);
  const triggers = entry?.triggers ?? [];
  return {
    name,
    description: desc,
    instructions: [
      `# ${name}`,
      "", `You are a specialized assistant for: ${desc}`, "",
      body,
      "", "Note: You do not have access to CLI tools, file editing, or agent delegation.",
      "Focus on analysis, reasoning, and actionable recommendations.",
    ].join("\n"),
    starters: triggers.slice(0, 4).map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
  };
}

/** Export all skills for a platform. */
export async function exportAllSkills(
  platform: SkillPlatform,
  repoRoot?: string,
): Promise<PlatformSkill[]> {
  const names = await listSkills(repoRoot);
  const results: PlatformSkill[] = [];
  for (const name of names) {
    const skill = await exportSkill(name, platform, repoRoot);
    if (skill) results.push(skill);
  }
  return results;
}

/**
 * Package skills as zip files for Claude.ai upload.
 * Claude.ai Settings > Features accepts zip files containing SKILL.md + supporting files.
 * Writes one zip per skill to outDir (folder structure preserved).
 */
export async function packageForClaudeWeb(
  outDir: string,
  repoRoot?: string,
): Promise<string[]> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const execFileAsync = promisify(execFile);

  const root = repoRoot ?? process.cwd();
  const outDirAbs = path.resolve(outDir);
  await fs.mkdir(outDirAbs, { recursive: true });
  const names = await listSkills(root);
  const zips: string[] = [];

  for (const name of names) {
    const mdPath = resolveSkillMarkdownPath(name, root);
    if (!mdPath) continue;
    const skillDir = dirname(mdPath);
    const parent = dirname(skillDir);
    const folderName = basename(skillDir);
    const zipPath = path.join(outDirAbs, `${name}.zip`);
    await execFileAsync("zip", ["-r", zipPath, folderName], { cwd: parent });
    zips.push(zipPath);
  }
  return zips;
}

/** Registered skills for NPX skills directory (agentskills.io). */
export const SKILL_REGISTRY = [
  { name: "autoresearch", description: "Autonomous goal-directed iteration loop", triggers: ["autoresearch", "auto optimize", "evolve", "keep improving"] },
  { name: "deeper", description: "Deep research and codebase exploration", triggers: ["deeper", "investigate", "figure out", "deep dive"] },
  { name: "orchestrate", description: "Full Plan->Work->Review->Episode loop", triggers: ["orchestrate", "full loop", "execute this issue"] },
  { name: "plan", description: "Strategic planning and task decomposition", triggers: ["plan", "scope", "decompose", "design the approach"] },
  { name: "review", description: "PR review and code audit", triggers: ["review", "audit", "check this PR"] },
  { name: "ship", description: "Deploy, release, and publish", triggers: ["ship", "deploy", "release", "go live"] },
  { name: "work", description: "Implement, build, code, fix", triggers: ["implement", "build", "code", "fix"] },
  { name: "standup", description: "Status summary and progress report", triggers: ["standup", "status", "what happened"] },
  { name: "browse-url", description: "Browse URL, take screenshot, scrape", triggers: ["browse", "open url", "scrape page"] },
  { name: "fetch-tweet", description: "Fetch tweet content from X/Twitter", triggers: ["fetch tweet", "x.com", "twitter"] },
  { name: "design-consultation", description: "Design system work and competitor analysis", triggers: ["design system", "competitor analysis", "design mockup"] },
  { name: "document-release", description: "Update docs, changelog, README", triggers: ["update docs", "release docs", "write changelog"] },
  { name: "run-cursor", description: "Delegate UI/frontend tasks to Cursor", triggers: ["cursor", "delegate to cursor", "via cursor"] },
  { name: "run-codex", description: "Delegate batch/shell tasks to Codex", triggers: ["codex", "delegate to codex", "via codex"] },
  { name: "run-devin", description: "Trigger Devin PR review", triggers: ["devin review", "trigger devin"] },
  { name: "run-bugbot", description: "Trigger BugBot PR review", triggers: ["bugbot", "cursor review"] },
  { name: "setup-browser-cookies", description: "Import browser cookies for headless auth", triggers: ["import cookies", "setup browser cookies"] },
] as const;
