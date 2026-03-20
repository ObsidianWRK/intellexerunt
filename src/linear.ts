/**
 * Linear-CLI wrapper — bind/unbind issues, track state, update status.
 */

import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { promisify } from "node:util";

import type { LinearTrackingState } from "./types.ts";

const execFileAsync = promisify(execFile);
const TRACKING_FILE = "linear-tracking.json";
function trackingPath(repoRoot: string) { return path.join(repoRoot, ".tuc", TRACKING_FILE); }

export function validateIssueId(issueId: string): void {
  if (!/^[A-Z]+-\d+$/.test(issueId)) throw new Error(`Invalid Linear issue ID: ${issueId}. Expected: PREFIX-123`);
}

export async function loadTrackingState(repoRoot: string): Promise<LinearTrackingState | null> {
  try { return JSON.parse(await readFile(trackingPath(repoRoot), "utf8")) as LinearTrackingState; }
  catch { return null; }
}

export async function saveTrackingState(repoRoot: string, state: LinearTrackingState): Promise<void> {
  const target = trackingPath(repoRoot);
  await mkdir(path.dirname(target), { recursive: true });
  state.updatedAt = new Date().toISOString();
  await writeFile(target, JSON.stringify(state, null, 2));
}

export async function updateLinearStatus(issueId: string, status: LinearTrackingState["status"]): Promise<void> {
  validateIssueId(issueId);
  const map: Record<LinearTrackingState["status"], string> = {
    planned: "Todo", in_progress: "In Progress", in_review: "In Review", compounding: "In Review", done: "Done",
  };
  await execFileAsync("linear-cli", ["issues", "update", issueId, "--status", map[status]]);
}

export async function bindLinearIssue(repoRoot: string, issueId: string): Promise<LinearTrackingState> {
  validateIssueId(issueId);
  await execFileAsync("linear-cli", ["issues", "get", issueId]);
  const state: LinearTrackingState = {
    issueId, status: "in_progress", teammates: [], prs: [],
    startedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  await saveTrackingState(repoRoot, state);
  await updateLinearStatus(issueId, "in_progress");
  return state;
}

export async function unbindLinearIssue(repoRoot: string): Promise<LinearTrackingState | null> {
  const state = await loadTrackingState(repoRoot);
  if (!state) return null;
  await updateLinearStatus(state.issueId, "done");
  await rm(trackingPath(repoRoot), { force: true });
  return state;
}
