/**
 * Text helpers for rendering a WhatsApp template body into preview HTML.
 *
 * The pipeline a preview uses is:
 *   1. {@link substituteVariables} — swap `{{n}}` for sample values.
 *   2. {@link renderWhatsAppText} — HTML-escape, THEN apply WhatsApp's
 *      lightweight markdown. Escaping first keeps the output XSS-safe even
 *      when the (untrusted) sample values contain markup.
 */

/**
 * Replace positional `{{1}}`, `{{2}}`… placeholders with `samples[n-1]`.
 * A placeholder with no (non-empty) sample is left untouched so the preview
 * still shows `{{1}}` rather than a blank.
 */
export function substituteVariables(
  text: string,
  samples: readonly string[] = [],
): string {
  return text.replace(/\{\{\s*(\d+)\s*\}\}/g, (match, digits: string) => {
    const sample = samples[Number(digits) - 1];
    return sample !== undefined && sample !== '' ? sample : match;
  });
}

/** Escape the five HTML-significant characters. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escape `text`, then apply WhatsApp formatting and return an HTML string
 * safe to hand to Lit's `unsafeHTML`:
 *   - `` ```mono``` `` → `<code>`
 *   - `*bold*`         → `<strong>`
 *   - `_italic_`       → `<em>`
 *   - `~strike~`       → `<del>`
 *   - newlines         → `<br>`
 *
 * Monospace is handled first so its contents aren't re-formatted; newlines
 * are converted last so the inline markers only match within a single line.
 */
export function renderWhatsAppText(text: string): string {
  let html = escapeHtml(text);
  html = html.replace(/```([^`]+)```/g, '<code>$1</code>');
  html = html.replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>');
  html = html.replace(/_([^_\n]+)_/g, '<em>$1</em>');
  html = html.replace(/~([^~\n]+)~/g, '<del>$1</del>');
  html = html.replace(/\n/g, '<br>');
  return html;
}
