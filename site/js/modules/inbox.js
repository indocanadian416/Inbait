// Inbox: welcome email, challenge result emails, and the 12 practice emails.
import { icon, esc, avatar, $ } from '../util.js';
import * as store from '../store.js';
import { renderPractice } from './practice.js';
import { rowHTML, backBtn } from './scenes.js';

const WELCOME = {
  id: 'welcome', from_name: 'Inbait Team', from_address: 'team@inbait.example', subject: 'Welcome to Inbait: your inbox, their bait',
  preview: 'Here is how this place works, and how to spot a hook before it spots you.', date_label: 'Today',
};
function systemMail(m, bodyHTML, folderHref) {
  return `<div class="reader-inner">${backBtn(folderHref)}<article class="mail"><header class="mail-head"><h2>${esc(m.subject)}</h2>
    <div class="mail-from">${avatar(m.from_name)}<dl><dt>From</dt><dd><strong>${esc(m.from_name)}</strong> &lt;<span class="mono">${esc(m.from_address)}</span>&gt;</dd>
    <dt>To</dt><dd>you@brightlinecorp.example</dd><dt>Date</dt><dd>${esc(m.date_label)}</dd></dl></div></header>
    <div class="mail-body">${bodyHTML}</div></article></div>`;
}
const welcomeBody = `<p>Hi there,</p>
<p>Inbait looks like a normal mail app, but every message, call, chat, pop-up and text in here is practice. Some are bait. Some are genuine. Your job is to tell them apart.</p>
<p>The folders on the left are your training grounds: <strong>Inbox</strong> for email, <strong>Calls</strong> for phone scams, <strong>Chat</strong> for fake helpdesks, <strong>Browser</strong> for tricky pop-ups and <strong>Texts</strong> for phone messages. You get instant feedback on each one.</p>
<p>One habit to build right now: before you click a link, hover over it (or tap it here) to see where it <em>really</em> goes. Try it: <button type="button" class="linklike" data-url="https://indocanadian416.github.io/Inbait/#/learn/lookalike-domains">see where this goes</button>.</p>
<p>Ready to test yourself? The Challenge gives no hints until the end.</p>
<p class="btn-row"><a class="btn btn-primary" href="#/challenge">Take the Inbait Challenge</a> <a class="btn btn-secondary" href="#/inbox/e-invoice-change">Start practising</a></p>
<p>Have fun, and stay curious.<br>The Inbait Team</p>`;

function resultMails() {
  return store.get().challengeHistory.slice(-3).reverse().map((r, i) => ({
    id: `result-${r.date}`, idx: i, r, from_name: 'Inbait Results', from_address: 'results@inbait.example',
    subject: `Your Inbait Challenge result: ${r.score} – ${r.verdict}`, preview: r.score >= 80 ? 'You passed. See your lessons learned.' : 'See what caught you and what to practise.',
    date_label: new Date(r.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
  }));
}

export async function render(ctx) {
  const read = store.get().read;
  const sys = [...resultMails(), WELCOME];
  const extraRows = sys.map((m) => rowHTML({ href: `#/inbox/${m.id}`, sender: m.from_name, subject: m.subject, preview: m.preview, time: m.date_label, unread: !read[m.id], current: ctx.route.id === m.id })).join('');
  api = await renderPractice(ctx, {
    type: 'email', title: 'Inbox', sub: 'Report the phish. Trust the genuine. Hover or tap links first.', emptyText: 'Select a message to read it.', extraRows,
    extraDetail: async (id) => {
      const m = sys.find((x) => x.id === id); if (!m) return false;
      if (!read[id]) { store.update((s) => { s.read[id] = true; }); const row = ctx.list.querySelector(`a[href="#/inbox/${CSS.escape(id)}"]`); row?.classList.remove('unread'); row?.querySelector('.unread-dot')?.remove(); }
      if (id === 'welcome') {
        ctx.reader.innerHTML = systemMail(m, welcomeBody, '#/inbox');
        const { bindLinkPopovers } = await import('../ui/popover.js'); bindLinkPopovers(ctx.reader);
      } else {
        const r = m.r;
        ctx.reader.innerHTML = systemMail(m, `<p>You scored <strong>${r.score}/100</strong>: <strong>${esc(r.verdict)}</strong> (${r.score >= 80 ? 'PASS' : 'FAIL'}).</p>
          ${r.missed?.length ? `<p>Techniques that caught you: ${r.missed.map(esc).join(', ')}.</p>` : '<p>Nothing caught you this time.</p>'}
          <p><a class="btn btn-primary" href="#/challenge/results">${icon('star')}Open your results</a></p>`, '#/inbox');
      }
      return true;
    },
  });
}
let api = null;
export function onSearch(t) { api?.onSearch?.(t); }
void $;
