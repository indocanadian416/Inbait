// Small shared helpers.
export const ICONS = 'assets/icons.svg';
export const icon = (name, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="${ICONS}#i-${name}"/></svg>`;
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
export function hash(str) { let h = 0; for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); }
export const avatarClass = (name) => `av-${hash(name) % 8}`;
export function initials(name) {
  const parts = String(name).replace(/[^\p{L}\p{N} ]/gu, ' ').trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || '?') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
export const avatar = (name) => `<span class="avatar ${avatarClass(name)}" aria-hidden="true">${esc(initials(name))}</span>`;
const cache = new Map();
export function loadJSON(path) {
  if (!cache.has(path)) {
    cache.set(path, fetch(path, { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error(`${path}: ${r.status}`); return r.json(); })
      .catch((e) => { cache.delete(path); throw e; }));
  }
  return cache.get(path);
}
export function relTime(iso) {
  const d = new Date(iso); const diff = (Date.now() - d.getTime()) / 1000;
  if (Number.isNaN(diff)) return '';
  if (diff < 3600) return `${Math.max(1, Math.round(diff / 60))}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.round(diff / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export function announce(msg) { const el = document.getElementById('live'); if (!el) return; el.textContent = ''; setTimeout(() => { el.textContent = msg; }, 30); }
export function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
export const PRACTICE_FILES = { email: 'content/emails.json', call: 'content/calls.json', chat: 'content/chats.json', browser: 'content/browser.json', text: 'content/texts.json' };
export const TYPE_ROUTE = { email: 'inbox', call: 'calls', chat: 'chat', browser: 'browser', text: 'texts' };
export const TYPE_ICON = { email: 'inbox', call: 'phone', chat: 'chat', browser: 'globe', text: 'message' };
export const TYPE_LABEL = { email: 'Email', call: 'Call', chat: 'Chat', browser: 'Browser', text: 'Text' };
export async function loadAllPractice() {
  const out = {};
  await Promise.all(Object.entries(PRACTICE_FILES).map(async ([t, p]) => { try { out[t] = await loadJSON(p); } catch { out[t] = []; } }));
  return out;
}
