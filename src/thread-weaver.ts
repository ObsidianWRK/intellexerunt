/**
 * Thread Weaver — episode-based multi-agent orchestration.
 *
 * Dispatches bounded worker threads, collects Episodes,
 * weaves completed episodes into subsequent thread context.
 */

// ── Episode Primitive ─────────────────────────────────────────────────

export interface Episode {
  threadId: string;
  goal: string;
  outcome: "success" | "partial" | "blocked";
  findings: string[];
  artifacts: string[];
  summary: string;
  nextSuggested?: string;
  pr?: string;
  timestamp: string;
  tokenCost?: number;
  inputEpisodes?: string[];
}

export interface EpisodeStore {
  episodes: Episode[];
  sessionId: string;
  startedAt: string;
}

export function createEpisode(
  threadId: string, goal: string, outcome: Episode["outcome"],
  findings: string[], artifacts: string[], summary: string,
  opts?: Partial<Pick<Episode, "nextSuggested" | "pr" | "tokenCost" | "inputEpisodes">>,
): Episode {
  return { threadId, goal, outcome, findings, artifacts, summary, timestamp: new Date().toISOString(), ...opts };
}

export function episodeToYaml(ep: Episode): string {
  const lines = [
    `episode:`, `  thread: "${ep.threadId}"`, `  goal: "${ep.goal}"`,
    `  outcome: ${ep.outcome}`, `  findings:`, ...ep.findings.map((f) => `    - "${f}"`),
    `  artifacts:`, ...ep.artifacts.map((a) => `    - "${a}"`), `  summary: "${ep.summary}"`,
  ];
  if (ep.nextSuggested) lines.push(`  next_suggested: "${ep.nextSuggested}"`);
  if (ep.pr) lines.push(`  pr: "${ep.pr}"`);
  return lines.join("\n");
}

export function episodesToContext(episodes: Episode[]): string {
  if (episodes.length === 0) return "";
  return `## Prior Thread Episodes (${episodes.length})\n` +
    episodes.map((ep) => episodeToYaml(ep)).join("\n---\n");
}

export function compressEpisode(ep: Episode, maxChars: number): Episode {
  if (ep.summary.length <= maxChars) return ep;
  return { ...ep, summary: ep.summary.slice(0, maxChars - 3) + "...", findings: ep.findings.slice(0, 3), artifacts: ep.artifacts.slice(0, 5) };
}

export function createEpisodeStore(sessionId?: string): EpisodeStore {
  return { episodes: [], sessionId: sessionId ?? crypto.randomUUID(), startedAt: new Date().toISOString() };
}

export function addEpisode(store: EpisodeStore, episode: Episode): void { store.episodes.push(episode); }
export function recentEpisodes(store: EpisodeStore, n: number): Episode[] { return store.episodes.slice(-n); }

export function getInputEpisodes(store: EpisodeStore, relevantThreadIds?: string[]): Episode[] {
  if (relevantThreadIds?.length) return store.episodes.filter((ep) => relevantThreadIds.includes(ep.threadId));
  return recentEpisodes(store, 3);
}

export async function saveStore(store: EpisodeStore, dirPath: string): Promise<string> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  await fs.mkdir(dirPath, { recursive: true });
  const filePath = path.join(dirPath, `${store.sessionId}.json`);
  await fs.writeFile(filePath, JSON.stringify(store, null, 2));
  return filePath;
}

export async function loadStore(filePath: string): Promise<EpisodeStore> {
  const raw = await (await import("node:fs/promises")).readFile(filePath, "utf-8");
  return JSON.parse(raw) as EpisodeStore;
}

// ── Thread Weaver ─────────────────────────────────────────────────────

import type { TaskBrief, TaskKind, Harness } from "./types.ts";
import { routeTask } from "./dispatch.ts";

export type CliTarget = "claude" | "cursor" | "codex";

export interface ThreadSpec {
  id: string;
  goal: string;
  agentType: string;
  dependsOn?: string[];
  contextBudget?: number;
  cli?: CliTarget;
}

export interface ThreadPlan {
  threads: ThreadSpec[];
  maxParallel?: number;
  sessionId?: string;
}

export type ThreadStatus = "pending" | "running" | "complete" | "blocked";
export interface ThreadState { spec: ThreadSpec; status: ThreadStatus; episode?: Episode; }
export interface DispatchPayload { threadId: string; prompt: string; agentType: string; contextBudget: number; cli: CliTarget; }

const KIND_TO_AGENT: Record<TaskKind, string> = {
  plan: "planner", implementation: "implementer", ui: "implementer",
  review: "reviewer", search: "researcher", docs: "implementer", ops: "implementer",
};

export function taskBriefToThreadSpec(
  brief: TaskBrief,
  opts?: { dependsOn?: string[]; contextBudget?: number },
): ThreadSpec {
  if (!brief.id) throw new Error("TaskBrief must have an id");
  if (!brief.title) throw new Error("TaskBrief must have a title");
  return {
    id: brief.id,
    goal: brief.description ? `${brief.title}: ${brief.description}` : brief.title,
    agentType: KIND_TO_AGENT[brief.kind ?? "implementation"],
    dependsOn: opts?.dependsOn,
    contextBudget: opts?.contextBudget,
  };
}

export class ThreadWeaver {
  private store: EpisodeStore;
  private states: Map<string, ThreadState> = new Map();

  constructor(sessionId?: string) { this.store = createEpisodeStore(sessionId); }

  planWaves(plan: ThreadPlan): ThreadSpec[][] {
    const maxPar = plan.maxParallel ?? 3;
    const completed = new Set<string>();
    const remaining = new Map(plan.threads.map((t) => [t.id, t]));
    const waves: ThreadSpec[][] = [];
    while (remaining.size > 0) {
      const ready: ThreadSpec[] = [];
      for (const [, spec] of remaining) {
        if ((spec.dependsOn ?? []).every((d) => completed.has(d))) ready.push(spec);
      }
      if (ready.length === 0 && remaining.size > 0) {
        for (const [id] of remaining) this.states.set(id, { spec: remaining.get(id)!, status: "blocked" });
        break;
      }
      const wave = ready.slice(0, maxPar);
      waves.push(wave);
      for (const spec of wave) { remaining.delete(spec.id); this.states.set(spec.id, { spec, status: "pending" }); completed.add(spec.id); }
    }
    return waves;
  }

  weaveContext(spec: ThreadSpec): string {
    const budget = spec.contextBudget ?? 4000;
    const episodes = getInputEpisodes(this.store, spec.dependsOn);
    const compressed = episodes.map((ep) => compressEpisode(ep, Math.floor(budget / Math.max(episodes.length, 1))));
    return episodesToContext(compressed).slice(0, budget);
  }

  buildThreadPrompt(spec: ThreadSpec, agentTypeOverride?: string): string {
    const context = this.weaveContext(spec);
    const parts: string[] = [];
    if (context) { parts.push(context); parts.push("---"); }
    parts.push(`## Current Thread: ${spec.id}`);
    parts.push(`Goal: ${spec.goal}`);
    parts.push(`Agent: ${agentTypeOverride ?? spec.agentType}`);
    return parts.join("\n");
  }

  recordEpisode(episode: Episode): void {
    addEpisode(this.store, episode);
    const state = this.states.get(episode.threadId);
    if (state) { state.status = "complete"; state.episode = episode; }
  }

  markRunning(threadId: string): void { const s = this.states.get(threadId); if (s) s.status = "running"; }
  getStatus(): Map<string, ThreadState> { return new Map(this.states); }
  getEpisodes(): Episode[] { return this.store.episodes; }
  getStore(): EpisodeStore { return this.store; }
  isWaveComplete(wave: ThreadSpec[]): boolean { return wave.every((s) => this.states.get(s.id)?.status === "complete"); }
  getBlocked(): ThreadState[] { return [...this.states.values()].filter((s) => s.status === "blocked"); }

  resolveAgent(spec: ThreadSpec): { agentType: string; cli: CliTarget } {
    if (spec.cli) return { agentType: spec.agentType, cli: spec.cli };
    const brief: TaskBrief = { id: spec.id, title: spec.goal, description: spec.goal };
    const route = routeTask(brief);
    if (route.harness === "cursor") return { agentType: "cursor-teammate", cli: "claude" };
    if (route.harness === "codex") return { agentType: "codex-teammate", cli: "codex" };
    return { agentType: spec.agentType, cli: "claude" };
  }

  dispatch(spec: ThreadSpec): DispatchPayload {
    this.markRunning(spec.id);
    const resolved = this.resolveAgent(spec);
    return { threadId: spec.id, prompt: this.buildThreadPrompt(spec, resolved.agentType), agentType: resolved.agentType, contextBudget: spec.contextBudget ?? 4000, cli: resolved.cli };
  }

  dispatchWave(wave: ThreadSpec[]): DispatchPayload[] { return wave.map((s) => this.dispatch(s)); }

  summarize(): string {
    const eps = this.store.episodes;
    if (eps.length === 0) return "No threads completed.";
    const success = eps.filter((e) => e.outcome === "success").length;
    const partial = eps.filter((e) => e.outcome === "partial").length;
    const blocked = eps.filter((e) => e.outcome === "blocked").length;
    const lines = [`## Thread Weaving Summary`, `Threads: ${eps.length} (${success} success, ${partial} partial, ${blocked} blocked)`, ``];
    for (const ep of eps) { lines.push(`- **${ep.threadId}** [${ep.outcome}]: ${ep.summary}`); if (ep.pr) lines.push(`  PR: ${ep.pr}`); }
    return lines.join("\n");
  }
}
