/**
 * Decodes HTML entities commonly returned by Open Trivia DB (e.g. &quot;, &#039;, &amp;)
 */
export function decodeHtml(html: string): string {
  if (!html) return '';
  
  // Fast path for strings without '&'
  if (!html.includes('&')) return html;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.documentElement.textContent || html;
  } catch {
    // Fallback for non-browser or edge scenarios
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
  }
}
