/**
 * Cursor model access types.
 * The cursor-bridge MCP server exposes cursor_complete and cursor_models.
 * This module provides typed interfaces for callers.
 */

export interface CursorCompleteRequest {
  message: string;
  model?: string;
  system?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface CursorCompleteResponse {
  content: string;
  model: string;
  usage?: { prompt_tokens: number; completion_tokens: number };
}

export interface CursorModel {
  id: string;
  name?: string;
}

/**
 * Available Cursor models (discovered dynamically by cursor-bridge MCP).
 * Default: composer-2. Also: claude-4-sonnet, gpt-4o, gemini-2.5-pro, etc.
 */
export const DEFAULT_CURSOR_MODEL = "composer-2";
