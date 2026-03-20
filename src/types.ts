export type Harness = "codex" | "claude-code" | "cursor" | "bugbot" | "devin-review";
export type ReviewProvider = "bugbot" | "devin-review";
export type AgentMode =
  | "native-subagent"
  | "child-agent"
  | "parallel-agent"
  | "teammate"
  | "review-agent";
export type TaskKind = "plan" | "implementation" | "ui" | "review" | "search" | "docs" | "ops";

export interface TaskBrief {
  id: string;
  title: string;
  description: string;
  kind?: TaskKind;
  preferredHarness?: Harness;
  activeHarness?: Harness;
  files?: string[];
  parallelizable?: boolean;
  persistentTeammate?: boolean;
  linearIssueId?: string;
}

export interface RouteDecision {
  harness: Harness;
  mode: AgentMode;
  rationale: string;
  reviewHarnesses: ReviewProvider[];
}

export interface RankedResult {
  path: string;
  score: number;
  source: string;
  snippet?: string;
}

export interface LinearTrackingState {
  issueId: string;
  status: "planned" | "in_progress" | "in_review" | "compounding" | "done";
  teammates: string[];
  prs: number[];
  startedAt: string;
  updatedAt: string;
}
