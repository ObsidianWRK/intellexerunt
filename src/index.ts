/**
 * @intellexerunt/plugin — search, orchestration, and agent skills.
 *
 * BM25 search, thread weaving, compaction, dispatch, teammates, skills.
 * One package. No dead code.
 */

// Search
export { searchBM25, toFtsQuery, kindMultiplier, smartSnippet } from "./search.ts";
export { searchCtx7 } from "./ctx7.ts";
export { injectDynamicContext } from "./dynamic-context.ts";

// Orchestration
export {
  ThreadWeaver,
  createEpisode, episodeToYaml, episodesToContext, compressEpisode,
  createEpisodeStore, addEpisode, recentEpisodes, getInputEpisodes,
  saveStore, loadStore, taskBriefToThreadSpec,
} from "./thread-weaver.ts";
export type {
  Episode, EpisodeStore, ThreadSpec, ThreadPlan, ThreadState,
  ThreadStatus, DispatchPayload, CliTarget,
} from "./thread-weaver.ts";

// Compaction
export {
  buildCompactionConfig, buildDefaultCompactionConfig,
  COMPACTION_BETA, COMPACTION_TYPE, COMPACTION_TRIGGER_TOKENS,
} from "./compaction.ts";

// Dispatch
export { routeTask, resolveSkill, requiresWorktree, ROUTE_TO_SKILL, VALID_ROUTES } from "./dispatch.ts";

// Teammates
export { codexExec } from "./codex.ts";
export { DEFAULT_CURSOR_MODEL } from "./cursor.ts";
export type { CursorCompleteRequest, CursorCompleteResponse, CursorModel } from "./cursor.ts";

// Linear
export {
  bindLinearIssue, unbindLinearIssue, updateLinearStatus,
  loadTrackingState, saveTrackingState, validateIssueId,
} from "./linear.ts";

// Skills
export { loadSkill, listSkills, SKILL_REGISTRY, exportSkill, exportAllSkills } from "./skills.ts";
export type { SkillPlatform, PlatformSkill } from "./skills.ts";

// Types
export type {
  TaskBrief, RouteDecision, Harness, ReviewProvider, AgentMode,
  TaskKind, RankedResult, LinearTrackingState,
} from "./types.ts";
