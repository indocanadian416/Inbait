// Shared scenario renderers used by practice modules and the Challenge.
import { icon, esc, avatar, $, $$, loadJSON, reducedMotion, announce, TYPE_ROUTE } from '../util.js';
import { bindLinkPopovers } from '../ui/popover.js';
import * as store from '../store.js';

// The ONLY strings the training copy buttons may ever place on the clipboard.
export const SAFE_CLIPBOARD = {
  clickfix: 'Inbait training: a real ClickFix attack would have put a malicious command here. Never paste commands a website gives you.',
  filefix: 'Inbait training: a real FileFix attack would have hidden a malicious command in this "file path". Never paste anything a website tells you into File Explorer.',
};

let techniqueNames = null;
export async function techName(slug) {
  if (!techniqueNames) { try { techniqueNames = Object.fromEntries((await loadJSON('content/learn.json')).map((t) => [t.slug, t.title])); } catch { techniqueNames = {}; } }
  return techniqueNames[slug] || slug;
}
export async function loadTechNames() { await techName(''); return techniqueNames; }

/* ---------- list helpers ---------- */
export function listHead(title, sub = '') {
  return `<div class="list-head"><h1>${esc(title)}</h1>${sub ? `<p class="small muted">${sub}</p>` : ''}
  <div class="m-search"><label class="visually-hidden" for="mSearch">Search</label><input id="mSearch" type="search" placeholder="Search" autocomplete="off"></div></div>`;
}
export function bindMobileSearch(root, onSearch) {
  const m = $('#mSearch', root); const g = $('#search');
  if (!m) return;
  m.value = g.value;
  m.addEventListener('input', () => { g.value = m.value; onSearch(m.value.trim().toLowerCase()); });
}
export function rowInfo(type, it) {
  switch (type) {
    case 'email': return { sender: it.from_name, subject: it.subject, preview: it.preview, time: it.date_label };
    case 'call': return { sender: it.caller_name, subject: it.caller_number, preview: it.intro, time: it.time_label || 'Missed' };
    case 'chat': return { sender: it.contact.name, subject: it.title, preview: it.messages[0]?.text || '', time: it.time_label || '' };
    case 'text': return { sender: it.contact_name, subject: it.contact_number, preview: it.messages[it.messages.length - 1]?.text || '', time: it.messages[it.messages.length - 1]?.time || '' };
    case 'browser': return { sender: it.title, subject: it.url, preview: it.summary || '', time: '' };
    default: return { sender: '', subject: '', preview: '', time: '' };
  }
}
export function rowHTML({ href, sender, subject, preview, time, unread, current, chips = '', done = null }) {
  const doneHTML = done ? (done.firstTryCorrect ? `<span class="done-mark">${icon('check', 'icon-sm')}Dodged</span>` : `<span class="done-mark miss">${icon('x', 'icon-sm')}Hooked</span>`) : '';
  return `<li><a class="msg-row${unread ? ' unread' : ''}" href="${href}"${current ? ' aria-current="true"' : ''} data-search="${esc(`${sender} ${subject} ${preview}`.toLowerCase())}">
    ${unread ? '<span class="unread-dot" aria-hidden="true"></span>' : ''}${avatar(sender)}
    <span class="msg-main"><span class="msg-top"><span class="msg-sender">${esc(sender)}</span><span class="msg-time">${esc(time)}</span></span>
    <span class="msg-subject">${esc(subject)}</span><span class="msg-preview">${esc(preview)}</span>
    ${chips || doneHTML ? `<span class="msg-meta">${chips}${doneHTML}</span>` : ''}</span>
    ${unread ? '<span class="visually-hidden">(unread)</span>' : ''}</a></li>`;
}
export async function practiceList(type, items, currentId) {
  const names = await loadTechNames();
  const done = store.get().completed;
  return `<ul class="msg-list" role="list">${items.map((it) => {
    const r = rowInfo(type, it);
    return rowHTML({ ...r, href: `#/${TYPE_ROUTE[type]}/${it.id}`, unread: !done[it.id], current: it.id === currentId, chips: `<span class="chip">${esc(names[it.technique] || it.technique)}</span>`, done: done[it.id] });
  }).join('')}</ul>`;
}
export function bindListKeys(root) {
  root.addEventListener('keydown', (e) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    const rows = $$('.msg-row', root).filter((r) => r.offsetParent !== null);
    const i = rows.indexOf(document.activeElement); if (i < 0) return;
    e.preventDefault();
    const n = e.key === 'ArrowDown' ? Math.min(rows.length - 1, i + 1) : e.key === 'ArrowUp' ? Math.max(0, i - 1) : e.key === 'Home' ? 0 : rows.length - 1;
    rows[n].focus();
  });
}
export function filterRows(root, term) {
  $$('.msg-row', root).forEach((r) => { r.parentElement.hidden = !!term && !r.dataset.search.includes(term); });
}
export const backBtn = (href) => `<a class="btn btn-ghost reader-back" href="${href}">${icon('back')}<span>Back</span></a>`;

/* ---------- decision helpers ---------- */
function choicesHTML(item, prompt) {
  return `<div class="card card-soft scene-choices"><h3>${esc(prompt || item.prompt || 'What do you do?')}</h3>
  <div class="choice-list">${item.choices.map((c, i) => `<button type="button" class="btn btn-secondary" data-choice="${i}">${esc(c.label)}</button>`).join('')}</div></div>`;
}
function bindChoices(el, item, onDecide) {
  $$('[data-choice]', el).forEach((b) => b.addEventListener('click', () => {
    const c = item.choices[+b.dataset.choice];
    $$('[data-choice]', el).forEach((x) => { x.disabled = true; });
    b.classList.add('chosen'); b.setAttribute('aria-pressed', 'true');
    const result = c.risk || (c.correct ? 'safe' : 'compromised');
    onDecide({ correct: c.correct ?? c.risk === 'safe', result, label: c.label });
  }));
}

/* ---------- Email ---------- */
export function renderEmail(el, it, { challenge = false, onDecide } = {}) {
  const atts = (it.attachments || []).map((a, i) => `<span class="attachment" id="${i === 0 ? 'attachment' : `attachment-${i}`}">${icon('paperclip', 'icon-sm')}${esc(a.name)} <span class="muted">${esc(a.size)}</span></span>`).join('');
  el.innerHTML = `<article class="mail">
    <header class="mail-head"><h2>${esc(it.subject)}</h2>
    <div class="mail-from">${avatar(it.from_name)}<dl>
      <dt>From</dt><dd id="header-from"><strong>${esc(it.from_name)}</strong> &lt;<span class="mono">${esc(it.from_address)}</span>&gt;</dd>
      ${it.reply_to ? `<dt>Reply-to</dt><dd id="header-replyto" class="mono">${esc(it.reply_to)}</dd>` : ''}
      <dt>To</dt><dd>${esc(it.to)}</dd><dt>Date</dt><dd>${esc(it.date_label)}</dd></dl></div></header>
    ${onDecide ? `<div class="actionbar" role="toolbar" aria-label="Message actions">
      <button type="button" class="btn btn-danger" data-act="report">${icon('flag')}Report phishing</button>
      <button type="button" class="btn btn-success" data-act="safe">${icon('check')}Looks safe</button>
      <button type="button" class="btn btn-ghost" disabled title="Practice only">Reply</button>
      <button type="button" class="btn btn-ghost" disabled title="Practice only">Forward</button></div>` : ''}
    ${atts ? `<div class="attachments">${atts}</div>` : ''}
    <div class="mail-body" id="mail-body"></div></article>`;
  const body = $('#mail-body', el);
  body.innerHTML = it.body_html; // authored local content only (validated allowlist)
  $$('button[data-link]', body).forEach((b) => {
    const l = (it.links || []).find((x) => x.id === b.dataset.link);
    b.type = 'button'; b.className = 'linklike'; b.dataset.url = l ? l.real_url : '(unknown)';
  });
  bindLinkPopovers(body);
  $$('[data-act]', el).forEach((b) => b.addEventListener('click', () => {
    const report = b.dataset.act === 'report';
    $$('[data-act]', el).forEach((x) => { x.disabled = true; });
    const correct = report === !!it.is_phish;
    onDecide?.({ correct, result: correct ? 'safe' : 'compromised', label: report ? 'Reported as phishing' : 'Marked as safe', reported: report });
  }));
  void challenge;
}

/* ---------- Chat ---------- */
export function renderChat(el, it, { onDecide } = {}) {
  const c = it.contact;
  el.innerHTML = `${it.role === 'agent' ? `<div class="label-training">${icon('info')}You are the helpdesk agent in this scenario.</div>` : ''}
  <div class="chat-window"><div class="chat-head">${avatar(c.name)}<div><strong>${esc(c.name)}</strong> ${c.external ? '<span class="chip chip-ext" id="external-badge">External</span>' : ''}<div class="small muted mono">${esc(c.handle)}</div></div>
  <span class="chip">${esc(it.channel || 'Direct message')}</span></div>
  <div class="chat-body">${it.messages.map((m, i) => {
    const name = m.from === 'you' ? 'You' : c.name;
    return `<div class="chat-msg" id="msg-${i + 1}">${avatar(name)}<div><div class="who">${esc(name)} ${m.from !== 'you' && c.external ? '<span class="chip chip-ext">External</span>' : ''}<span class="small muted">${esc(m.time || '')}</span></div><div class="txt">${esc(m.text)}</div></div></div>`;
  }).join('')}</div></div>${onDecide ? choicesHTML(it) : ''}`;
  if (onDecide) bindChoices(el, it, onDecide);
}

/* ---------- Text ---------- */
export function renderText(el, it, { onDecide } = {}) {
  el.innerHTML = `<div class="phone"><div class="phone-head">${avatar(it.contact_name)}<div><strong>${esc(it.contact_name)}</strong><div class="num mono" id="sender-number">${esc(it.contact_number)}</div></div></div>
  <div class="thread">${it.messages.map((m, i) => `<div class="bubble ${m.from === 'you' ? 'you' : 'them'}" id="msg-${i + 1}">${esc(m.text)}${m.time ? `<span class="ts">${esc(m.time)}</span>` : ''}</div>`).join('')}</div></div>
  ${onDecide ? choicesHTML(it) : ''}`;
  if (onDecide) bindChoices(el, it, onDecide);
}

/* ---------- Browser ---------- */
async function copyText(text) {
  try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; } } catch { /* fall through */ }
  try {
    const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.className = 'visually-hidden';
    document.body.append(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok;
  } catch { return false; }
}
const training = '<div class="label-training">' + icon('alert', 'icon-sm') + 'Training only – nothing you type is sent anywhere</div>';
function pageHTML(it) {
  const p = it.page || {};
  switch (it.kind) {
    case 'clickfix': return `<div class="fake-page-card"><h3>${esc(p.heading)}</h3><p>${esc(p.text)}</p>
      <div class="captcha" id="captcha"><button type="button" class="captcha-box" data-captcha aria-label="I'm not a robot"></button><span>I'm not a robot</span></div>
      <div class="steps-box" data-steps hidden><p><strong>Verification step 2:</strong></p><ol id="paste-steps">${(p.steps || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      <button type="button" class="btn btn-primary" data-copy="clickfix">Copy verification code</button><p class="small" data-copied hidden></p></div></div>`;
    case 'filefix': return `<div class="fake-page-card"><h3>${esc(p.heading)}</h3><p>${esc(p.text)}</p>
      <p class="attachment" id="shared-file">${icon('paperclip', 'icon-sm')}${esc(p.file_name)}</p>
      <ol id="paste-steps">${(p.steps || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      <button type="button" class="btn btn-primary" data-copy="filefix">Copy file path</button><p class="small" data-copied hidden></p></div>`;
    case 'fake-update': return `<div class="fake-page-card" id="update-banner"><h3>${icon('alert')} ${esc(p.heading)}</h3><p>${esc(p.text)}</p>
      <button type="button" class="btn btn-primary" data-fakedl>${icon('download')}${esc(p.button || 'Download update')}</button><p class="small" data-dlnote hidden>Nothing was downloaded. This is a training page.</p></div>`;
    case 'bitb': return `<div class="fake-page-card"><h3>${esc(p.heading)}</h3><p>${esc(p.text)}</p>
      <button type="button" class="btn btn-primary" data-bitb>${esc(p.button || 'Sign in')}</button></div>
      <div class="bitb-popup" id="fake-popup" hidden><div class="bitb-title" data-drag>${icon('lock', 'icon-sm')}<span class="fb-url" id="popup-url">${esc(p.popup_url)}</span></div>
      <div class="bitb-body">${training}<h3>${esc(p.popup_title || 'Sign in')}</h3><label>Email<input class="fake-input" type="text" autocomplete="off" data-trainfield></label>
      <label>Password<input class="fake-input" type="password" autocomplete="off" data-trainfield></label><p class="small muted">Tip: try dragging this window outside the page.</p></div></div>`;
    case 'oauth': return `<div class="fake-page-card"><h3 id="app-name">${esc(p.app_name)}</h3><p class="small muted" id="publisher">${esc(p.publisher)}</p>
      <p>This app would like to:</p><ul class="perm-list" id="permissions">${(p.permissions || []).map((x) => `<li>${icon('alert', 'icon-sm')}<span>${esc(x)}</span></li>`).join('')}</ul></div>`;
    case 'device-code': return `<div class="fake-page-card"><h3>${esc(p.heading)}</h3><p>${esc(p.text)}</p>
      <p>Go to <span class="mono" id="verify-url">${esc(p.verify_url)}</span> and enter:</p><div class="device-code" id="device-code">${esc(p.code)}</div></div>`;
    case 'login': return `<div class="fake-page-card">${training}<h3>${esc(p.heading)}</h3>${p.text ? `<p>${esc(p.text)}</p>` : ''}
      <label>Email<input class="fake-input" type="text" autocomplete="off" data-trainfield></label><label>Password<input class="fake-input" type="password" autocomplete="off" data-trainfield></label>
      <button type="button" class="btn btn-primary btn-block" data-fakesign>Sign in</button><p class="small" data-signnote hidden>Nothing was sent. This is a training page.</p></div>`;
    case 'notification': return `<div class="notif-prompt" id="notif-prompt"><p class="small"><strong class="mono">${esc(p.prompt_site)}</strong> wants to show notifications</p>
      <div class="btn-row"><button type="button" class="btn btn-secondary" data-notif>Block</button><button type="button" class="btn btn-primary" data-notif>Allow</button></div></div>
      <div class="fake-page-card"><h3>${esc(p.heading)}</h3><p>${esc(p.text)}</p></div>
      ${p.extension ? `<div class="fake-page-card" id="extension-listing"><h3>${esc(p.extension.name)}</h3><p class="small muted">${esc(p.extension.blurb || '')}</p><p>Requested permissions:</p>
      <ul class="perm-list">${p.extension.permissions.map((x) => `<li>${icon('alert', 'icon-sm')}<span>${esc(x)}</span></li>`).join('')}</ul></div>` : ''}`;
    default: return `<div class="fake-page-card"><p>${esc(p.text || '')}</p></div>`;
  }
}
export function renderBrowser(el, it, { onDecide } = {}) {
  el.innerHTML = `<div class="fbrowser" aria-label="Simulated browser window"><div class="fb-tabs"><span class="fb-tab">${esc(it.tab_title || it.title)}</span></div>
    <div class="fb-bar"><span class="fb-url" id="address-bar">${icon('lock')}<span>${esc(it.url)}</span></span></div>
    <div class="fb-page" id="fb-page">${pageHTML(it)}</div></div>
    <p class="small muted">The padlock only means the connection is encrypted. It does not mean the site is trustworthy.</p>
    ${onDecide ? choicesHTML(it) : ''}`;
  const page = $('#fb-page', el);
  $('[data-captcha]', page)?.addEventListener('click', (e) => { e.currentTarget.setAttribute('aria-checked', 'true'); $('[data-steps]', page).hidden = false; $('[data-steps] button', page).focus(); });
  $$('[data-copy]', page).forEach((b) => b.addEventListener('click', async () => {
    const text = SAFE_CLIPBOARD[b.dataset.copy];
    const ok = await copyText(text);
    const note = $('[data-copied]', page); note.hidden = false;
    note.textContent = ok ? `Copied. Here is exactly what went on your clipboard: "${text}"` : `Copy didn't work in this browser. This is the text: "${text}"`;
    announce('Copied training text.');
  }));
  $('[data-fakedl]', page)?.addEventListener('click', () => { $('[data-dlnote]', page).hidden = false; });
  $('[data-fakesign]', page)?.addEventListener('click', () => { $('[data-signnote]', page).hidden = false; $$('[data-trainfield]', page).forEach((i) => { i.value = ''; }); });
  $$('[data-notif]', page).forEach((b) => b.addEventListener('click', () => { $('#notif-prompt', page).hidden = true; }));
  const popup = $('#fake-popup', page);
  if (popup) {
    $('[data-bitb]', page).addEventListener('click', () => { popup.hidden = false; $('input', popup)?.focus(); });
    const bar = $('[data-drag]', popup); let sx, sy, ox, oy, dragging = false;
    bar.addEventListener('pointerdown', (e) => { dragging = true; sx = e.clientX; sy = e.clientY; ox = popup.offsetLeft; oy = popup.offsetTop; bar.setPointerCapture(e.pointerId); });
    bar.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const maxX = page.clientWidth - popup.offsetWidth, maxY = page.clientHeight - popup.offsetHeight;
      popup.style.left = `${Math.max(0, Math.min(maxX, ox + e.clientX - sx))}px`; popup.style.top = `${Math.max(0, Math.min(maxY, oy + e.clientY - sy))}px`;
    });
    bar.addEventListener('pointerup', () => { dragging = false; });
  }
  if (onDecide) bindChoices(el, it, (d) => { $$('[data-trainfield]', el).forEach((i) => { i.value = ''; }); onDecide(d); });
}

/* ---------- Call ---------- */
const canSpeak = () => 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
export function renderCall(el, it, { onDecide, challenge = false } = {}) {
  let voice = false, skip = false;
  const outgoing = !!it.outgoing;
  el.innerHTML = `<div class="phone"><div class="call-screen" id="call-screen">${avatar(it.caller_name)}
    <h2>${esc(it.caller_name)}</h2><p class="mono" id="caller-number">${esc(it.caller_number)}</p><p class="muted">${outgoing ? 'Ready to call' : 'Incoming call…'}</p>
    <div class="call-actions"><div><button type="button" class="call-btn accept" data-accept aria-label="${outgoing ? 'Call' : 'Accept'}">${icon('phone')}</button><div class="call-label">${outgoing ? 'Call' : 'Accept'}</div></div>
    <div><button type="button" class="call-btn decline" data-decline aria-label="${outgoing ? "Don't call" : 'Decline'}">${icon('x')}</button><div class="call-label">${outgoing ? "Don't call" : 'Decline'}</div></div></div></div>
    <div class="call-live" hidden><div class="phone-head">${avatar(it.caller_name)}<div><strong>${esc(it.caller_name)}</strong><div class="num mono">${esc(it.caller_number)}</div></div>
      <div class="btn-row">${canSpeak() ? '<label class="switch small"><input type="checkbox" data-voice> Play voice</label>' : ''}<button type="button" class="btn btn-ghost" data-skip>Skip</button></div></div>
      <div class="thread" id="call-thread" aria-live="polite"></div><div class="choice-list" id="call-choices"></div></div></div>
    ${it.intro ? `<p class="small muted">${esc(it.intro)}</p>` : ''}`;
  const thread = $('#call-thread', el), choicesEl = $('#call-choices', el);
  const finish = (endingId) => {
    const end = it.endings[endingId];
    choicesEl.innerHTML = ''; $('[data-skip]', el).hidden = true;
    if (!challenge) thread.insertAdjacentHTML('beforeend', `<div class="bubble narr">Call ended.</div>`);
    onDecide?.({ result: end.result, correct: end.result === 'safe', endingId, label: end.title });
  };
  const speak = (text) => { if (voice && canSpeak()) { try { speechSynthesis.speak(new SpeechSynthesisUtterance(text)); } catch { /* ignore */ } } };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  async function play(nodeId) {
    if (it.endings[nodeId]) return finish(nodeId);
    const n = it.nodes[nodeId];
    for (const line of n.lines) {
      if (!skip && !reducedMotion()) {
        const t = document.createElement('div'); t.className = 'typing'; t.textContent = '…'; t.setAttribute('aria-hidden', 'true'); thread.append(t);
        await wait(600); t.remove();
      }
      const b = document.createElement('div'); b.className = `bubble ${n.speaker === 'caller' ? 'them' : n.speaker === 'you' ? 'you' : 'narr'}`; b.textContent = line; thread.append(b);
      b.scrollIntoView?.({ block: 'nearest' });
      if (n.speaker === 'caller') speak(line);
    }
    if (n.choices) {
      choicesEl.innerHTML = n.choices.map((c, i) => `<button type="button" class="btn btn-secondary" data-c="${i}">${esc(c.label)}</button>`).join('');
      $$('[data-c]', choicesEl).forEach((b) => b.addEventListener('click', () => {
        const c = n.choices[+b.dataset.c]; choicesEl.innerHTML = '';
        const y = document.createElement('div'); y.className = 'bubble you'; y.textContent = c.label; thread.append(y);
        play(c.next);
      }));
      $('button', choicesEl)?.focus();
    } else if (n.next) play(n.next);
  }
  $('[data-accept]', el).addEventListener('click', () => { $('#call-screen', el).hidden = true; $('.call-live', el).hidden = false; play(it.start); });
  $('[data-decline]', el).addEventListener('click', () => { $('#call-screen', el).hidden = true; $('.call-live', el).hidden = false; finish(it.decline_ending); });
  $('[data-skip]', el).addEventListener('click', () => { skip = true; });
  $('[data-voice]', el)?.addEventListener('change', (e) => { voice = e.target.checked; if (!voice) try { speechSynthesis.cancel(); } catch { /* */ } });
}

/* ---------- Reveal ---------- */
export function placeMarkers(scope, flags) {
  (flags || []).forEach((f) => {
    if (!f.target) return;
    const t = scope.querySelector(`#${CSS.escape(f.target)}`); if (!t) return;
    t.classList.add('rf-target');
    const m = `<span class="rf-marker" aria-label="Red flag ${f.n}">${f.n}</span>`;
    if (['BUTTON', 'INPUT', 'IMG'].includes(t.tagName)) t.insertAdjacentHTML('afterend', m); else t.insertAdjacentHTML('beforeend', m);
  });
}
export function feedbackFor(it, outcome) {
  if (outcome.result === 'risky') return { cls: 'meh', ic: 'alert', title: 'Close call', text: 'You avoided the worst, but gave the attacker more than you needed to.' };
  if (outcome.correct) return it.is_phish === false ? { cls: 'good', ic: 'check', title: 'Correct, this one was safe', text: 'Trusting genuine messages matters too.' } : { cls: 'good', ic: 'shield', title: 'Nice catch!', text: 'You spotted the bait.' };
  if (it.is_phish === false) return { cls: 'meh', ic: 'alert', title: 'False alarm', text: 'This one was genuine. Over-reporting has a cost: real messages get ignored.' };
  return { cls: 'bad', ic: 'x', title: 'Hooked!', text: "That's what the attacker wanted. Here's what gave it away." };
}
export function revealHTML(it, outcome, { nextHref, ending } = {}) {
  const fb = feedbackFor(it, outcome);
  const flags = it.red_flags || [];
  return `<div class="reveal slide-in">
    <div class="feedback ${fb.cls}" role="status">${icon(fb.ic, 'icon-lg')}<div><h3>${fb.title}</h3><p>${fb.text}</p>${ending ? `<p><strong>${esc(ending.title)}.</strong> ${esc(ending.explanation)}</p>` : ''}</div></div>
    ${flags.length ? `<div class="card"><h3>${icon('flag')} Red flags</h3><ol class="rf-list">${flags.map((f) => `<li><span class="rf-marker" aria-hidden="true">${f.n}</span><div><strong>${esc(f.title)}</strong><p class="small">${esc(f.explanation)}</p></div></li>`).join('')}</ol></div>` : ''}
    ${it.safe_reasons?.length ? `<div class="card"><h3>${icon('shield')} Why it was safe</h3><ul class="safe-list">${it.safe_reasons.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>` : ''}
    <div class="todo-box"><h3>${icon('lifering')} What to do instead</h3><ul>${(it.what_to_do || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
    <p><strong>Lesson:</strong> ${esc(ending?.lesson || it.lesson)}</p></div>
    <div class="btn-row"><a class="btn btn-secondary" href="#/learn/${esc(it.technique)}">${icon('book')}Learn more</a>${nextHref ? `<a class="btn btn-primary" href="${nextHref}">Next scenario</a>` : ''}</div></div>`;
}
