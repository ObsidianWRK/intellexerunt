/**
 * Task routing — maps tasks to harnesses and skills.
 */

import type { Harness, ReviewProvider, RouteDecision, TaskBrief, TaskKind } from "./types.ts";

export const ROUTE_TO_SKILL: Record<string, string> = {
  plan: "plan", work: "work", review: "review", ship: "ship",
  deeper: "deeper", standup: "standup", devin: "run-devin", bugbot: "run-bugbot",
  browse: "browse-url", tweet: "fetch-tweet", autoresearch: "autoresearch",
  design: "design-consultation", "doc-release": "document-release",
  cookies: "setup-browser-cookies", orchestrate: "orchestrate",
  cursor: "run-cursor", codex: "run-codex", "review-pipeline": "review-orchestrator",
};

export const VALID_ROUTES = new Set(Object.keys(ROUTE_TO_SKILL));
const WORKTREE_ROUTES = new Set(["work", "cursor", "codex"]);

export function resolveSkill(task: string): string | undefined { return ROUTE_TO_SKILL[task]; }
export function requiresWorktree(task: string): boolean { return WORKTREE_ROUTES.has(task); }

function inferTaskKind(task: TaskBrief): TaskKind {
  if (task.kind) return task.kind;
  const corpus = `${task.title} ${task.description}`.toLowerCase();
  if (/\b(review|bug|pr|audit)\b/.test(corpus)) return "review";
  if (/\b(ui|frontend|cursor|layout|design)\b/.test(corpus)) return "ui";
  if (/\b(plan|architecture|spec|prompt|rules?)\b/.test(corpus)) return "plan";
  if (/\b(search|index|retrieve|crawl|docs)\b/.test(corpus)) return "search";
  if (/\b(doc|readme|write-up|guide)\b/.test(corpus)) return "docs";
  if (/\b(shell|automation|refactor|patch|implement|code)\b/.test(corpus)) return "implementation";
  return "ops";
}

function chooseReviewProvider(task: TaskBrief): ReviewProvider {
  const corpus = `${task.title} ${task.description} ${(task.files ?? []).join(" ")}`.toLowerCase();
  return /\b(frontend|ui|cursor|bugbot|css|tsx|jsx)\b/.test(corpus) ? "bugbot" : "devin-review";
}

function choosePrimaryHarness(task: TaskBrief, kind: TaskKind): Harness {
  if (task.preferredHarness) return task.preferredHarness;
  switch (kind) {
    case "plan": case "docs": case "search": return "claude-code";
    case "ui": return "cursor";
    case "review": return chooseReviewProvider(task);
    case "implementation": return "codex";
    default: return "claude-code";
  }
}

export function routeTask(task: TaskBrief): RouteDecision {
  const kind = inferTaskKind(task);
  const harness = choosePrimaryHarness(task, kind);
  let mode: RouteDecision["mode"];
  if (harness === "bugbot" || harness === "devin-review") mode = "review-agent";
  else if (task.persistentTeammate) mode = "teammate";
  else if (task.parallelizable) mode = "parallel-agent";
  else if (task.activeHarness && task.activeHarness !== harness) mode = "child-agent";
  else mode = "native-subagent";
  const rationale =
    harness === "claude-code" ? "Claude Code owns planning, synthesis, and prompt/rule authoring."
    : harness === "cursor" ? "Cursor owns IDE/background-agent workflows and UI-heavy work."
    : harness === "bugbot" ? "BugBot reviews Cursor-leaning and frontend PRs."
    : harness === "devin-review" ? "Devin reviews generalized PRs and risk analysis."
    : "Codex owns shell-heavy automation and deterministic patch workflows.";
  return { harness, mode, rationale, reviewHarnesses: ["bugbot", "devin-review"] };
}
