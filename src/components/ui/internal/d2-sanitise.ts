/**
 * The HTML RichTextEditor accepts, from paste and from defaultValue. Everything outside this
 * list is unwrapped to its text, every attribute is dropped except a safe href, and inline
 * styles, classes and scripts never survive. Runs in the browser only (DOMParser).
 */
const KEEP: Record<string, string> = {
  P: 'p', DIV: 'p', BR: 'br', STRONG: 'strong', B: 'strong', EM: 'em', I: 'em',
  A: 'a', UL: 'ul', OL: 'ol', LI: 'li', H1: 'h2', H2: 'h2', H3: 'h3', H4: 'h3',
}

const SAFE_HREF = /^(https?:|mailto:)/i

export function safeHref(href: string) {
  const h = href.trim()
  if (SAFE_HREF.test(h)) return h
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(h)) return `https://${h}`
  return null
}

function clean(node: Node, doc: Document): Node[] {
  if (node.nodeType === Node.TEXT_NODE) return [doc.createTextNode(node.textContent ?? '')]
  if (node.nodeType !== Node.ELEMENT_NODE) return []
  const el = node as Element
  if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'TEMPLATE', 'META', 'LINK', 'HEAD', 'TITLE'].includes(el.tagName)) return []
  const kids = [...el.childNodes].flatMap((c) => clean(c, doc))
  const tag = KEEP[el.tagName]
  // Office and Google Docs mark bold and italic with styles on spans.
  if (!tag && el.tagName === 'SPAN') {
    const style = (el.getAttribute('style') ?? '').toLowerCase()
    let wrapped: Node[] = kids
    if (/font-weight:\s*(bold|[6-9]00)/.test(style)) {
      const s = doc.createElement('strong')
      wrapped.forEach((k) => s.appendChild(k))
      wrapped = [s]
    }
    if (/font-style:\s*italic/.test(style)) {
      const e = doc.createElement('em')
      wrapped.forEach((k) => e.appendChild(k))
      wrapped = [e]
    }
    return wrapped
  }
  if (!tag) return kids
  const out = doc.createElement(tag)
  if (tag === 'a') {
    const href = safeHref(el.getAttribute('href') ?? '')
    if (!href) return kids
    out.setAttribute('href', href)
    out.setAttribute('rel', 'noopener noreferrer')
  }
  kids.forEach((k) => out.appendChild(k))
  return [out]
}

export function sanitiseHtml(html: string): string {
  if (typeof DOMParser === 'undefined') return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const host = doc.createElement('div')
  ;[...doc.body.childNodes].flatMap((n) => clean(n, doc)).forEach((n) => host.appendChild(n))
  return host.innerHTML.replace(/<p><\/p>/g, '')
}

export const escapeText = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')
