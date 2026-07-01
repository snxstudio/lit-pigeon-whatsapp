/**
 * Helpers for WhatsApp positional variables of the form `{{1}}`, `{{2}}`, …
 */

/** All variable indices in `text`, in the order they appear (with repeats). */
export function extractVariables(text: string): number[] {
  const re = /\{\{\s*(\d+)\s*\}\}/g;
  const out: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    out.push(Number(m[1]));
  }
  return out;
}

/** Distinct variable indices, ascending. */
export function distinctVariables(text: string): number[] {
  return [...new Set(extractVariables(text))].sort((a, b) => a - b);
}

/** True when the (trimmed) text begins with a variable — Meta rejects these. */
export function startsWithVariable(text: string): boolean {
  return /^\s*\{\{\s*\d+\s*\}\}/.test(text);
}

/** True when the (trimmed) text ends with a variable — Meta rejects these. */
export function endsWithVariable(text: string): boolean {
  return /\{\{\s*\d+\s*\}\}\s*$/.test(text);
}

/** True when two variables are separated only by whitespace (not allowed). */
export function hasAdjacentVariables(text: string): boolean {
  return /\}\}\s*\{\{/.test(text);
}
