// Hash router: #/folder/id?query
export function parse(h = location.hash) {
  const raw = h.replace(/^#\/?/, '');
  const [path, qs = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  return { folder: parts[0] || 'inbox', id: parts[1] || null, rest: parts.slice(1), query: new URLSearchParams(qs) };
}
export const go = (path) => { location.hash = path.startsWith('#') ? path : `#/${path}`; };
export function onChange(fn) { window.addEventListener('hashchange', () => fn(parse())); }
