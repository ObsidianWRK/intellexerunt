/**
 * Skill loader — reads SKILL.md files and returns their content.
 * Skills are declarative (SKILL.md + frontmatter), not code.
 * This module makes them accessible to any surface programmatically.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";

export interface SkillDefinition {
  name: string;
  content: string;
  frontmatter: Record<string, unknown>;
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

/** Load a skill by name from the .claude/skills/ directory. */
export async function loadSkill(name: string, repoRoot?: string): Promise<SkillDefinition> {
  const root = repoRoot ?? process.cwd();
  const skillPath = join(root, ".claude", "skills", name, "SKILL.md");
  const raw = await readFile(skillPath, "utf-8");
  const { frontmatter, body } = parseFrontmatter(raw);
  return { name, content: body, frontmatter };
}

/** List all available skill names. */
export async function listSkills(repoRoot?: string): Promise<string[]> {
  const root = repoRoot ?? process.cwd();
  const { readdir } = await import("node:fs/promises");
  const skillsDir = join(root, ".claude", "skills");
  try {
    const entries = await readdir(skillsDir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
  } catch {
    return [];
  }
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
