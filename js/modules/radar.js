// Hook Radar: a curated feed of current scam trends that funnels into practice.
import { icon, esc, $, $$, loadJSON, relTime, announce, TYPE_ROUTE, TYPE_LABEL } from '../util.js';
import * as store from '../store.js';

let lastVisit = null;
let searchFn = () => {};
export function onSearch(t) { searchFn(t); }

function cardHTML(item, isNew) {
  const sev = ['high', 'medium', 'low'].includes(item.severity) ? item.severity : 'low';
  const practice = item.practice && TYPE_ROUTE[item.practice.type]
    ? `<a class="btn btn-secondary btn-sm" href="#/${TYPE_ROUTE[item.practice.type]}/${esc(item.practice.id)}">${icon('shield', 'icon-sm')}Practice it</a>` : '';
  const learn = item.technique ? `<a class="btn btn-ghost btn-sm" href="#/learn/${esc(item.technique)}">${icon('book', 'icon-sm')}Learn</a>` : '';
  const search = `${item.title} ${item.summary} ${item.category}`.toLowerCase();
  return `<li class="radar-card" data-cat="${esc(item.category)}" data-search="${esc(search)}">
    <div class="radar-top"><span class="sev sev-${sev}" title="${sev} relevance">${sev}</span>
      <span class="chip">${esc(item.category)}</span>
      ${isNew ? '<span class="chip chip-new">New</span>' : ''}
      <span class="small muted radar-time">${relTime(item.date)}</span></div>
    <h3 class="radar-title">${esc(item.title)}</h3>
    <p class="radar-sum">${esc(item.summary)}</p>
    <div class="radar-links">${practice}${learn}</div></li>`;
}

export async function render(ctx) {
  ctx.setMode('full'); ctx.setDetail(false); ctx.setTitle('Hook Radar');
  let feed = [], meta = { last_updated: null, sources: [] };
  try { feed = await loadJSON('data/feed.json'); } catch { feed = []; }
  try { meta = await loadJSON('data/feed-meta.json'); } catch { /* keep default */ }
  feed = feed.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
  lastVisit = store.get().radarLastVisit;
  const isNew = (it) => lastVisit && String(it.date) > String(lastVisit).slice(0, 10);
  const newCount = feed.filter(isNew).length;
  const cats = [...new Set(feed.map((i) => i.category))];

  if (!feed.length) {
    searchFn = () => {};
    ctx.reader.innerHTML = `<div class="reader-inner"><h1>Hook Radar</h1><div class="empty">${icon('radar')}<p>No trends are loaded yet. Check back soon.</p></div></div>`;
    ctx.focusHeading(ctx.reader); return;
  }

  ctx.reader.innerHTML = `<div class="reader-inner radar">
    <h1>Hook Radar</h1>
    <p class="small muted">What's circulating right now, and how to practise spotting it. ${meta.last_updated ? `Updated ${relTime(meta.last_updated)}.` : ''}
      ${newCount ? `<strong>${newCount} new since your last visit.</strong>` : ''}</p>
    <div class="radar-filters" role="group" aria-label="Filter by category">
      <button type="button" class="chip chip-btn is-on" data-cat="all">All</button>
      ${cats.map((c) => `<button type="button" class="chip chip-btn" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>
    <ul class="radar-list" role="list">${feed.map((it) => cardHTML(it, isNew(it))).join('')}</ul>
    ${meta.sources?.length ? `<p class="small muted radar-credit">${icon('info', 'icon-sm')} Source: ${meta.sources.map((s) => esc(s.name)).join(', ')}. ${esc(meta.sources[0].note || '')}</p>` : ''}
  </div>`;

  $$('.chip-btn', ctx.reader).forEach((b) => b.addEventListener('click', () => {
    $$('.chip-btn', ctx.reader).forEach((x) => x.classList.toggle('is-on', x === b));
    const cat = b.dataset.cat;
    $$('.radar-card', ctx.reader).forEach((card) => { card.hidden = cat !== 'all' && card.dataset.cat !== cat; });
    announce(`Showing ${cat === 'all' ? 'all' : cat} trends.`);
  }));

  searchFn = (t) => $$('.radar-card', ctx.reader).forEach((c) => { c.hidden = !!t && !c.dataset.search.includes(t); });
  store.update((s) => { s.radarLastVisit = new Date().toISOString(); });
  ctx.focusHeading(ctx.reader);
}
