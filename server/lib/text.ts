/**
 * Postgres rejects NUL in text; JSON round-trips can also fail on lone UTF-16 surrogates.
 * PDFs and pasted content may contain both.
 */
export function sanitizeForPostgresText(s: string): string {
  // eslint-disable-next-line no-control-regex -- intentionally stripping NUL bytes
  let t = s.replace(/\u0000/g, '')
  t = typeof t.toWellFormed === 'function' ? t.toWellFormed() : toWellFormedFallback(t)
  return t
}

function toWellFormedFallback(s: string): string {
  let out = ''
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    if (c >= 0xd800 && c <= 0xdbff) {
      const next = s.charCodeAt(i + 1)
      if (next >= 0xdc00 && next <= 0xdfff) {
        out += s.slice(i, i + 2)
        i++
        continue
      }
      out += '\uFFFD'
      continue
    }
    if (c >= 0xdc00 && c <= 0xdfff) {
      out += '\uFFFD'
      continue
    }
    out += s[i]
  }
  return out
}
