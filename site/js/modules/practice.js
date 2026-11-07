// Generic practice folder: list + reading pane + instant feedback loop.
import { icon, esc, $, loadJSON, announce, TYPE_ROUTE, PRACTICE_FILES } from '../util.js';
import * as store from '../store.js';
import { listHead, practiceList, bindListKeys, filterRows, bindMobileSearch, backBtn, revealHTML, placeMarkers, renderEmail, renderChat, renderText, renderBrowser, renderCall } from './scenes.js';

export const RENDERERS = { email: renderEmail, chat: renderChat, text: renderText, browser: renderBrowser, call: renderCall };

export async function renderPractice(ctx, { type, title, sub, emptyText, extraRows = '', extraDetail = null }) {
  const items = await loadJSON(PRACTICE_FILES[type]);
  const folder = TYPE_ROUTE[type];
  const id = ctx.route.id;
  ctx.setMode('split'); ctx.setTitle(title);
  const drawList = async () => {
    ctx.list.innerHTML = listHead(title, sub) + `<nav aria-label="${esc(title)} items">${extraRows ? `<ul class="msg-list" role="list">${extraRows}</ul>` : ''}${await practiceList(type, items, id)}</nav>`;
    bindListKeys(ctx.list); bindMobileSearch(ctx.list, (t) => filterRows(ctx.list, t));
    const term = ctx.searchTerm(); if (term) filterRows(ctx.list, term);
  };
  await drawList();
  if (!id) {
    ctx.setDetail(false);
    ctx.reader.innerHTML = `<div class="reader-empty">${icon('hook')}<p>${esc(emptyText || 'Select an item to start.')}</p></div>`;
    ctx.focusHeading(ctx.list);
    return { onSearch: (t) => filterRows(ctx.list, t) };
  }
  ctx.setDetail(true);
  if (extraDetail && await extraDetail(id)) { ctx.focusHeading(ctx.reader); return; }
  const it = items.find((x) => x.id === id);
  if (!it) { ctx.reader.innerHTML = `<div class="reader-inner">${backBtn(`#/${folder}`)}<div class="empty"><p>That scenario doesn't exist.</p></div></div>`; return; }
  const prev = store.get().completed[id];
  ctx.reader.innerHTML = `<div class="reader-inner">${backBtn(`#/${folder}`)}
    ${prev ? `<p class="redo-note small muted">${icon('info', 'icon-sm')} You've done this one already (${prev.firstTryCorrect ? 'dodged' : 'hooked'}). Try again; your Hook Score won't change.</p>` : ''}
    <div id="scene"></div><div id="reveal"></div></div>`;
  const scene = $('#scene', ctx.reader);
  const idx = items.indexOf(it);
  const nextIt = items.slice(idx + 1).find((x) => !store.get().completed[x.id]) || items[(idx + 1) % items.length];
  RENDERERS[type](scene, it, {
    onDecide: async (outcome) => {
      const correct = type === 'call' ? outcome.result === 'safe' : outcome.correct;
      store.recordPractice(it.id, correct);
      const ending = type === 'call' ? it.endings[outcome.endingId] : null;
      const rv = $('#reveal', ctx.reader);
      rv.innerHTML = revealHTML(it, { ...outcome, correct }, { nextHref: nextIt && nextIt.id !== it.id ? `#/${folder}/${nextIt.id}` : null, ending });
      placeMarkers(scene, it.red_flags);
      announce(rv.querySelector('.feedback h3').textContent);
      const h = rv.querySelector('.feedback h3'); h.setAttribute('tabindex', '-1'); h.focus();
      const scroll = ctx.list.scrollTop; await drawList(); ctx.list.scrollTop = scroll;
    },
  });
  ctx.focusHeading(ctx.reader);
  return { onSearch: (t) => filterRows(ctx.list, t) };
}

export function makeModule(cfg) {
  let api = null;
  return {
    async render(ctx) { api = await renderPractice(ctx, typeof cfg === 'function' ? cfg(ctx) : cfg); },
    onSearch(t) { api?.onSearch?.(t); },
  };
}
