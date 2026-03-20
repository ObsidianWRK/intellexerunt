/**
 * Codex CLI wrapper — executes tasks via GPT 5.4 in isolated worktrees.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface CodexResult { exitCode: number; stdout: string; stderr: string; durationMs: number; }

export async function codexExec(
  task: string,
  dir = ".",
  model = "gpt-5.4-medium",
  timeoutMs = 600_000,
): Promise<CodexResult> {
  const start = Date.now();
  try {
    const { stdout, stderr } = await execFileAsync(
      "codex", ["exec", task, "--full-auto", "--ephemeral", "-m", model, "-C", dir],
      { timeout: timeoutMs },
    );
    return { exitCode: 0, stdout, stderr, durationMs: Date.now() - start };
  } catch (err: unknown) {
    const e = err as { code?: number; stdout?: string; stderr?: string };
    return { exitCode: e.code ?? 1, stdout: e.stdout ?? "", stderr: e.stderr ?? "", durationMs: Date.now() - start };
  }
}
