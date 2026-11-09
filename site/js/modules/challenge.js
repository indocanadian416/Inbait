// Inbait Challenge: a mixed, no-hints test drawn from every practice folder.
import { icon, esc, $, $$, shuffle, loadAllPractice, relTime, announce, TYPE_ROUTE, TYPE_ICON, TYPE_LABEL } from '../util.js';
import * as store from '../store.js';
import { RENDERERS } from './practice.js';
import { loadTechNames } from './scenes.js';
import { ring } from '../ui/ring.js';
import { confetti } from '../ui/confetti.js';

const DRAW = 8; // scenarios per challenge

let session = null; // { pool, idx, answers }

function labelFor(type, it) {
  switch (type) {
    case 'email': return it.subject;
    case 'call': return it.caller_name;
    case 'chat': return it.title || it.contact?.name || 'Chat message';
    case 'text': return `Text from ${it.contact_name}`;
    case 'browser': return it.title;
    default: return it.id;
  }
}
function verdictFor(score) {
  if (score >= 90) return 'Hard to hook';
  if (score >= 70) return 'Getting sharp';
  if (score >= 50) return 'Still biting';
  return 'Easily hooked';
}

export async function render(ctx) {
  ctx.setMode('full'); ctx.setDetail(false); ctx.setTitle('Challenge');
  if (ctx.route.id === 'results') return renderResults(ctx);
  if (ctx.route.id === 'play' && session) return renderQuestion(ctx);
  return renderIntro(ctx);
}
export function onSearch() { /* no search in challenge */ }

async function renderIntro(ctx) {
  const all = await loadAllPractice();
  const available = Object.values(all).reduce((n, a) => n + a.length, 0);
  const hist = store.get().challengeHistory;
  const best = hist.reduce((m, r) => Math.max(m, r.score), 0);
  const n = Math.min(DRAW, available);
  ctx.reader.innerHTML = `<div class="reader-inner">
    <h1>Inbait Challenge</h1>
    <div class="card">
      <p>A mixed test drawn at random from every folder: email, chat, browser pages and texts. You get <strong>no hints and no feedback until the end</strong>. Decide, move on, and see how sharp you are.</p>
      <ul class="safe-list">
        <li>${icon('star', 'icon-sm')} ${n} scenarios, reshuffled each time</li>
        <li>${icon('shield', 'icon-sm')} Report the bait, trust the genuine, make the safe choice</li>
        <li>${icon('info', 'icon-sm')} Your score is saved only in this browser</li>
      </ul>
      ${available === 0 ? `<p class="small muted">No scenarios are loaded yet.</p>`
        : `<p class="btn-row"><button type="button" class="btn btn-primary" id="startBtn">${icon('star')}Start the challenge</button></p>`}
      ${best ? `<p class="small muted">Your best so far: <strong>${best}%</strong>.</p>` : ''}
    </div>
    ${historyHTML(hist)}
  </div>`;
  $('#startBtn', ctx.reader)?.addEventListener('click', () => startSession(ctx));
  ctx.focusHeading(ctx.reader);
}

async function startSession(ctx) {
  const all = await loadAllPractice();
  const pool = [];
  for (const [type, items] of Object.entries(all)) for (const it of items) pool.push({ type, it });
  session = { pool: shuffle(pool).slice(0, Math.min(DRAW, pool.length)), idx: 0, answers: [] };
  if (location.hash !== '#/challenge/play') { history.replaceState(null, '', '#/challenge/play'); }
  renderQuestion(ctx);
}

function renderQuestion(ctx) {
  const { pool, idx } = session;
  const q = pool[idx];
  const n = pool.length;
  ctx.reader.innerHTML = `<div class="reader-inner challenge-play">
    <div class="ch-progress"><div class="ch-progress-top"><span class="chip">${icon(TYPE_ICON[q.type], 'icon-sm')}${TYPE_LABEL[q.type]}</span>
      <strong>Question ${idx + 1} of ${n}</strong></div>
      <div class="ch-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${idx + 1}"><span></span></div></div>
    <div id="scene"></div>
    <div id="ch-after" class="ch-after" hidden>
      <div class="card card-soft"><p>${icon('check', 'icon-sm')} Answer recorded. No peeking yet — keep going.</p>
      <p class="btn-row"><button type="button" class="btn btn-primary" id="nextBtn">${idx + 1 < n ? 'Next scenario' : 'See my score'}</button></p></div>
    </div></div>`;
  const bar = $('.ch-bar > span', ctx.reader); if (bar) bar.style.width = `${((idx + 1) / n) * 100}%`;
  const scene = $('#scene', ctx.reader);
  RENDERERS[q.type](scene, q.it, {
    challenge: true,
    onDecide: (outcome) => {
      session.answers.push({ type: q.type, id: q.it.id, technique: q.it.technique, label: labelFor(q.type, q.it), correct: !!outcome.correct });
      const after = $('#ch-after', ctx.reader); after.hidden = false;
      after.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
      const nb = $('#nextBtn', ctx.reader); nb.focus();
      nb.addEventListener('click', () => {
        if (idx + 1 < n) { session.idx++; renderQuestion(ctx); }
        else finishSession(ctx);
      });
      announce(`Answer recorded. ${idx + 1} of ${n}.`);
    },
  });
  ctx.focusHeading(ctx.reader);
}

async function finishSession(ctx) {
  const names = await loadTechNames();
  const answers = session.answers;
  const correct = answers.filter((a) => a.correct).length;
  const total = answers.length;
  const score = total ? Math.round((correct / total) * 100) : 0;
  const missed = [...new Set(answers.filter((a) => !a.correct).map((a) => names[a.technique] || a.technique))];
  const result = { date: new Date().toISOString(), score, verdict: verdictFor(score), total, correct, missed, items: answers };
  store.update((s) => {
    s.challengeHistory.push(result);
    for (const a of answers) if (!s.seenChallengeIds.includes(a.id)) s.seenChallengeIds.push(a.id);
  });
  session = null;
  history.replaceState(null, '', '#/challenge/results');
  renderResults(ctx, true);
}

async function renderResults(ctx, justFinished = false) {
  const names = await loadTechNames();
  const hist = store.get().challengeHistory;
  const r = hist[hist.length - 1];
  if (!r) { return renderIntro(ctx); }
  const pass = r.score >= 80;
  ctx.reader.innerHTML = `<div class="reader-inner">
    <h1>Your result</h1>
    <div class="card ch-result ${pass ? 'is-pass' : ''}">
      <div class="ch-result-top">${ring(r.score, { label: `Score ${r.score} out of 100` })}
        <div><h2 class="ch-verdict">${esc(r.verdict)}</h2>
        <p>You answered <strong>${r.correct} of ${r.total}</strong> correctly on the first try.</p>
        <p class="small muted">${pass ? 'Strong work. Keep it up and keep it sceptical.' : 'Worth another run once you have reviewed what caught you.'}</p></div></div>
      ${r.missed.length ? `<p class="small">Techniques that caught you: ${r.missed.map((m) => `<span class="chip">${esc(m)}</span>`).join(' ')}</p>` : `<p class="small">${icon('shield', 'icon-sm')} Nothing caught you. Spotless run.</p>`}
      <p class="btn-row"><button type="button" class="btn btn-primary" id="againBtn">${icon('star')}Try again</button>
        <button type="button" class="btn btn-secondary" id="shareBtn">${icon('check')}Copy my score</button>
        <a class="btn btn-ghost" href="#/inbox">Back to Inbox</a></p>
      <p class="small muted" id="shareNote" hidden></p>
    </div>
    <div class="card"><h3>${icon('flag')} Review every scenario</h3>
      <ul class="ch-review">${(r.items || []).map((a) => `<li class="${a.correct ? 'ok' : 'miss'}">
        <span class="ch-mark">${icon(a.correct ? 'check' : 'x', 'icon-sm')}</span>
        <span class="ch-rev-main"><span class="small muted">${icon(TYPE_ICON[a.type], 'icon-sm')}${TYPE_LABEL[a.type]} · ${esc(names[a.technique] || a.technique)}</span>
        <span class="ch-rev-label">${esc(a.label)}</span></span>
        <span class="ch-rev-links"><a class="btn btn-ghost btn-sm" href="#/${TYPE_ROUTE[a.type]}/${esc(a.id)}">Practice</a>
        <a class="btn btn-ghost btn-sm" href="#/learn/${esc(a.technique)}">Learn</a></span></li>`).join('')}</ul></div>
    ${historyHTML(hist.slice(0, -1))}
  </div>`;
  const shareText = `I scored ${r.score}% on the Inbait phishing challenge (${r.correct}/${r.total}) — verdict: "${r.verdict}". Train your eye at Inbait.`;
  $('#againBtn', ctx.reader).addEventListener('click', () => startSession(ctx));
  $('#shareBtn', ctx.reader).addEventListener('click', async () => {
    const note = $('#shareNote', ctx.reader); note.hidden = false;
    try { await navigator.clipboard.writeText(shareText); note.textContent = `Copied: "${shareText}"`; }
    catch { note.textContent = shareText; }
    announce('Score copied.');
  });
  ctx.focusHeading(ctx.reader);
  if (justFinished && pass) confetti(ctx.reader);
}

function historyHTML(hist) {
  if (!hist || !hist.length) return '';
  const rows = hist.slice().reverse().slice(0, 8).map((r) => `<li><span class="ch-hist-score">${r.score}%</span>
    <span class="ch-hist-mid"><strong>${esc(r.verdict)}</strong><span class="small muted">${r.correct}/${r.total} · ${relTime(r.date)}</span></span></li>`).join('');
  return `<div class="card"><h3>${icon('star')} Past attempts</h3><ul class="ch-history">${rows}</ul></div>`;
}
