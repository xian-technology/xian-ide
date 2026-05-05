/**
 * Xian contract linter integration.
 * Calls the xian-linter HTTP server at /lint.
 *
 * Start the linter server with:
 *   uv add "xian-tech-linter[server]"
 *   uvicorn xian_linter.server:create_app --factory --port 8000
 */

let linterUrl = "http://127.0.0.1:8000";

export function setLinterUrl(url: string) {
  linterUrl = url.replace(/\/+$/, "");
}

export function getLinterUrl(): string {
  return linterUrl;
}

export interface LintError {
  code: string;
  message: string;
  line?: number;
  col?: number;
}

export interface LintResult {
  success: boolean;
  errors: LintError[];
}

export async function lintCode(code: string): Promise<LintResult> {
  try {
    const resp = await fetch(`${linterUrl}/lint`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: code,
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) {
      return { success: false, errors: [{ code: "E000", message: `Linter HTTP ${resp.status}` }] };
    }
    return await resp.json();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("timeout") || msg.includes("abort")) {
      return { success: false, errors: [{ code: "E000", message: "Linter server not reachable (timeout)" }] };
    }
    return { success: false, errors: [{ code: "E000", message: `Linter: ${msg}` }] };
  }
}

export async function checkLinterAvailable(): Promise<boolean> {
  try {
    const resp = await fetch(`${linterUrl}/docs`, { signal: AbortSignal.timeout(3000) });
    return resp.ok;
  } catch {
    return false;
  }
}
