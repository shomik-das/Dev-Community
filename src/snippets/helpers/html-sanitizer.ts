const ALLOWED_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'a', 'b', 'i', 'strong', 'em',
  'pre', 'code', 'ul', 'ol', 'li', 'br',
  'div', 'span'
]);

const ALLOWED_ATTRS = new Set(['href', 'class']);

export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // 1. Remove script, style, and iframe tags entirely with their contents
  let sanitized = html
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
    .replace(/<iframe[^>]*>([\s\S]*?)<\/iframe>/gi, '');

  // 2. Process all other HTML tags
  sanitized = sanitized.replace(/<(\/?[a-zA-Z0-9]+)([^>]*)>/g, (match, tagName: string, attrsStr: string) => {
    const isClosing = tagName.startsWith('/');
    const cleanTagName = (isClosing ? tagName.substring(1) : tagName).toLowerCase();

    if (!ALLOWED_TAGS.has(cleanTagName)) {
      // Strip the tag entirely if it is not allowed
      return '';
    }

    if (isClosing) {
      return `</${cleanTagName}>`;
    }

    // Filter attributes
    const attrs: string[] = [];
    // Regex to extract key="value" or key='value' or key=value attributes
    const attrRegex = /([a-zA-Z0-9_-]+)\s*=\s*(?:'([^']*)'|"([^"]*)"|([^\s>]+))/g;
    let attrMatch;

    while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] || attrMatch[3] || attrMatch[4] || '';

      if (ALLOWED_ATTRS.has(attrName)) {
        // Prevent javascript: protocol in href
        if (attrName === 'href' && /^\s*javascript:/i.test(attrValue)) {
          continue;
        }
        attrs.push(`${attrName}="${attrValue.replace(/"/g, '&quot;')}"`);
      }
    }

    const attrsSerialized = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
    return `<${cleanTagName}${attrsSerialized}>`;
  });

  return sanitized;
}

export function stripHtml(html: string): string {
  if (!html) return '';
  // First sanitize to get rid of scripts/styles/iframes
  const cleanHtml = sanitizeHtml(html);
  // Then strip all remaining tags
  return cleanHtml.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
