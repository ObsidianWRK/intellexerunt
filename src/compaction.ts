/**
 * Claude Server-Side Compaction Configuration.
 * Uses Messages API compaction beta to auto-summarize conversation history.
 */

export const COMPACTION_BETA = "compact-2026-01-12" as const;
export const COMPACTION_TYPE = "compact_20260112" as const;
export const COMPACTION_TRIGGER_TOKENS = 80_000;
export const COMPACTION_MIN_TRIGGER = 50_000;

export interface CompactionTrigger { type: "input_tokens"; value: number; }
export interface CompactionEdit { type: typeof COMPACTION_TYPE; trigger?: CompactionTrigger; pause_after_compaction?: boolean; instructions?: string; }
export interface ContextManagementConfig { edits: CompactionEdit[]; }

const DEFAULT_COMPACTION_INSTRUCTIONS = [
  "Summarize the conversation preserving:",
  "- Active task: what is being built/fixed, current branch, files modified",
  "- Search results: key retrieval findings, queries run, sources that matched",
  "- Review pipeline state: current FSM stage, pending findings, blocking issues",
  "- Decisions made: architectural choices, rejected alternatives, user preferences",
  "- Next steps: what remains to be done",
  "Wrap your summary in a <summary></summary> block.",
].join("\n");

export function buildCompactionConfig(options?: {
  triggerTokens?: number;
  pauseAfterCompaction?: boolean;
  instructions?: string;
}): ContextManagementConfig {
  const trigger = options?.triggerTokens ?? COMPACTION_TRIGGER_TOKENS;
  if (trigger < COMPACTION_MIN_TRIGGER) throw new Error(`Compaction trigger must be >= ${COMPACTION_MIN_TRIGGER} tokens`);
  return {
    edits: [{
      type: COMPACTION_TYPE,
      trigger: { type: "input_tokens", value: trigger },
      pause_after_compaction: options?.pauseAfterCompaction ?? false,
      instructions: options?.instructions ?? DEFAULT_COMPACTION_INSTRUCTIONS,
    }],
  };
}

export function buildDefaultCompactionConfig(): ContextManagementConfig {
  return { edits: [{ type: COMPACTION_TYPE, trigger: { type: "input_tokens", value: COMPACTION_TRIGGER_TOKENS } }] };
}
