// Inbait boot: shell, navigation, router dispatch, theme, score, service worker.
import { parse, onChange } from './router.js';
import * as store from './store.js';
import { icon, esc, $, $$, loadAllPractice, announce } from './util.js';
import { toast } from './ui/toast.js';
import { openModal } from './ui/modal.js';

export const FOLDERS = [
  { id: 'inbox', label: 'Inbox', icon: 'inbox' },
  { id: 'calls', label: 'Calls', icon: 'phone' },
  { id: 'chat', label: 'Chat', icon: 'chat' },
  { id: 'browser', label: 'Browser', icon: 'globe' },
  { id: 'texts', label: 'Texts', icon: 'message' },
  { sep: true },
  { id: 'challenge', label: 'Challenge', icon: 'star' },
  { id: 'radar', label: 'Hook Radar', icon: 'radar' },
  { id: 'learn', label: 'Learn', icon: 'book' },
  { id: 'hooked', label: 'Got Hooked?', icon: 'lifering' },
  { id: 'about', label: 'About', icon: 'info' },
];
const MODULES = {
  inbox: () => import('./modules/inbox.js'), calls: () => import('./modules/calls.js'), chat: () => import('./modules/chat.js'),
  browser: () => import('./modules/browser.js'), texts: () => import('./modules/texts.js'), challenge: () => import('./modules/challenge.js'),
  radar: () => import('./modules/radar.js'), learn: () => import('./modules/learn.js'), hooked: () => import('./modules/hooked.js'), about: () => import('./modules/about.js'),
};
const app = $('#app'), list = $('#list'), reader = $('#reader');
let current = null; // current module
let renderSeq = 0;

function navHTML() {
  const f = FOLDERS.map((x) => x.sep ? '<li class="folder-sep" role="separator"></li>'
    : `<li><a class="folder-link" href="#/${x.id}" data-folder="${x.id}">${icon(x.icon)}<span>${x.label}</span></a></li>`).join('');
  $('#folders').innerHTML = `<div class="folders-head"><strong>Folders</strong><button type="button" class="btn btn-ghost btn-icon" id="drawerClose" aria-label="Close folders">${icon('x')}</button></div><ul class="folder-list">${f}</ul>`;
  $('#rail').innerHTML = FOLDERS.filter((x) => !x.sep).map((x) => `<a href="#/${x.id}" data-folder="${x.id}" aria-label="${x.label}">${icon(x.icon)}<span class="tip" aria-hidden="true">${x.label}</span></a>`).join('');
  const bn = [['inbox', 'Inbox', 'inbox'], ['challenge', 'Challenge', 'star'], ['radar', 'Radar', 'radar'], ['learn', 'Learn', 'book']];
  $('#bottomnav').innerHTML = bn.map(([id, l, i]) => `<a href="#/${id}" data-folder="${id}">${icon(i)}<span>${l}</span></a>`).join('')
    + `<button type="button" id="moreBtn" aria-haspopup="dialog">${icon('more')}<span>More</span></button>`;
}
function setCurrentNav(folder) {
  $$('[data-folder]').forEach((a) => { if (a.dataset.folder === folder) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  const more = $('#moreBtn');
  if (more) { if (['calls', 'chat', 'browser', 'texts', 'hooked', 'about'].includes(folder)) more.setAttribute('aria-current', 'page'); else more.removeAttribute('aria-current'); }
}
function openDrawer(open) {
  app.classList.toggle('drawer-open', open);
  $('#menuBtn').setAttribute('aria-expanded', String(open));
  let scrim = $('.drawer-scrim');
  if (open) {
    if (!scrim) { scrim = document.createElement('div'); scrim.className = 'drawer-scrim'; scrim.addEventListener('click', () => openDrawer(false)); document.body.append(scrim); }
    $('#folders .folder-link')?.focus();
  } else { scrim?.remove(); }
}
function openMore() {
  const items = FOLDERS.filter((f) => ['calls', 'chat', 'browser', 'texts', 'hooked', 'about'].includes(f.id));
  openModal({
    title: 'More',
    html: `<ul class="sheet-links">${items.map((x) => `<li><a href="#/${x.id}" data-close>${icon(x.icon)}<span>${x.label}</span></a></li>`).join('')}</ul>
      <p class="small muted">Theme</p>${themeSeg()}`,
    onOpen: (m) => bindThemeSeg(m),
  });
}
export function themeSeg() {
  return `<div class="seg theme-seg-inline" role="group" aria-label="Theme">${['system', 'light', 'dark'].map((t) => `<button type="button" data-theme-set="${t}" aria-label="${t[0].toUpperCase() + t.slice(1)} theme" title="${t}">${icon({ system: 'monitor', light: 'sun', dark: 'moon' }[t])}</button>`).join('')}</div>`;
}
export function bindThemeSeg(root) {
  $$('[data-theme-set]', root).forEach((b) => b.addEventListener('click', () => setTheme(b.dataset.themeSet)));
  syncTheme();
}
function setTheme(t) {
  store.update((s) => { s.theme = t; });
  if (t === 'system') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
  syncTheme(); announce(`Theme: ${t}`);
}
function syncTheme() { const t = store.get().theme || 'system'; $$('[data-theme-set]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeSet === t))); }

let practiceTotal = 0;
export function hookScore() {
  const c = Object.values(store.get().completed);
  const dodged = c.filter((x) => x.firstTryCorrect).length;
  return { pct: practiceTotal ? Math.round((dodged / practiceTotal) * 100) : 0, dodged, done: c.length, total: practiceTotal };
}
function renderScore() {
  const s = hookScore();
  $('#scoreText').textContent = `${s.pct}%`;
  $('#scoreBadge').setAttribute('aria-label', `Hook Score ${s.pct} percent, ${s.dodged} hooks dodged. Open details.`);
}
function showScore() {
  const s = hookScore();
  openModal({ title: 'Your Hook Score', html: `<p><strong>${s.pct}%</strong> of practice scenarios answered correctly on the first try.</p>
    <p>Hooks dodged: <strong>${s.dodged}</strong> · Scenarios tried: <strong>${s.done}</strong> of ${s.total}</p>
    <p class="small muted">Stored only in this browser. Reset it any time in About.</p>` });
}

export const ctx = {
  list, reader,
  setMode(mode) { app.classList.toggle('mode-full', mode === 'full'); app.classList.toggle('split', mode !== 'full'); },
  setDetail(on) { app.classList.toggle('has-detail', !!on); },
  setTitle(t) { document.title = `${t} · Inbait`; $('#topbarTitle').textContent = t; },
  focusHeading(root) { const h = (root || document).querySelector('h1, h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: false }); } },
  searchTerm() { return $('#search').value.trim().toLowerCase(); },
};

async function route(r) {
  const seq = ++renderSeq;
  const folder = MODULES[r.folder] ? r.folder : 'inbox';
  if (!MODULES[r.folder] && location.hash && location.hash !== '#/' ) { history.replaceState(null, '', '#/inbox'); }
  setCurrentNav(folder); openDrawer(false);
  try {
    const mod = await MODULES[folder]();
    if (seq !== renderSeq) return;
    if (current !== mod) { $('#search').value = ''; }
    current = mod;
    await mod.render({ ...ctx, route: { ...r, folder } });
  } catch (e) {
    console.error(e);
    reader.innerHTML = `<div class="empty">${icon('alert')}<p>Something went wrong loading this view. Try refreshing.</p></div>`;
    ctx.setMode('full');
  }
}

function boot() {
  navHTML();
  $('#menuBtn').addEventListener('click', () => openDrawer(!app.classList.contains('drawer-open')));
  document.addEventListener('click', (e) => {
    if (e.target.closest('#drawerClose')) openDrawer(false);
    if (e.target.closest('#moreBtn')) openMore();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && app.classList.contains('drawer-open')) { openDrawer(false); $('#menuBtn').focus(); } });
  $('#skipLink').addEventListener('click', (e) => { e.preventDefault(); const h = $('#main h1') || $('#main h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); } else $('#main').focus(); });
  $('#scoreBadge').addEventListener('click', showScore);
  bindThemeSeg(document);
  $('#search').addEventListener('input', () => current?.onSearch?.(ctx.searchTerm()));
  store.subscribe(renderScore);
  if (!store.storageOk) toast("Progress won't be saved in this browser mode.");
  onChange(route);
  route(parse());
  loadAllPractice().then((all) => { practiceTotal = Object.values(all).reduce((n, a) => n + a.length, 0); renderScore(); });
  registerSW();
}

function registerSW() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  navigator.serviceWorker.register('sw.js').then((reg) => {
    const prompt = (w) => toast('New version available – refresh', { action: 'Refresh', timeout: 0, onAction: () => w.postMessage('skipWaiting') });
    if (reg.waiting && navigator.serviceWorker.controller) prompt(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) prompt(w); });
    });
  }).catch(() => {});
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded) { reloaded = true; location.reload(); } });
}

export { esc };
boot();
