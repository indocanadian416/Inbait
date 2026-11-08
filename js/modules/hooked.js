// Got Hooked? Calm, tickable recovery steps. Ticks are saved locally.
import { icon, esc, $$ } from '../util.js';
import * as store from '../store.js';

const SITUATIONS = [
  { id: 'clicked', label: 'I clicked a link', steps: [
    "Don't enter anything on the page that opened. Close it.",
    'If something downloaded, do not open it. Delete it.',
    'Note the time, and keep the message that contained the link.',
    'Tell your IT or security team, even if nothing seemed to happen.',
    'Watch for unusual sign-in alerts or messages over the next few days.' ] },
  { id: 'password', label: 'I entered my password', steps: [
    'From a device you trust, change that password straight away.',
    'Change it anywhere else you used the same or a similar password.',
    'Sign out of all other sessions or devices in the account settings.',
    'Check recovery email, phone number and forwarding rules for changes you did not make.',
    'Turn on multi-factor authentication if it is not already on.',
    'Tell your IT or security team, or the service provider.' ] },
  { id: 'mfa', label: 'I gave an MFA code', steps: [
    'Treat the account as taken over. Change the password from a trusted device now.',
    'Sign out of all other sessions or devices.',
    'Review and remove any sign-in methods or devices you do not recognise.',
    'Contact your IT or security team, or the service provider, right away.',
    'Never share a one-time code with anyone. Genuine staff will not ask for it.' ] },
  { id: 'ran', label: 'I ran a command or installed something', steps: [
    'Disconnect the device from the internet (unplug the cable or turn off Wi-Fi).',
    'Do not keep using it for work, banking or email.',
    'Contact your IT or security team immediately and say exactly what you did.',
    'From a different, trusted device, change important passwords.',
    'Do not try to "clean it up" yourself unless your IT team tells you to.' ] },
  { id: 'money', label: 'I sent money or gift cards', steps: [
    'Contact your bank or payment provider immediately. Speed matters.',
    'For gift cards, contact the card issuer with the card numbers and receipts.',
    'Keep every message, receipt and phone number involved.',
    'Tell your manager or finance team if it was a work payment.',
    'Report it through your local official fraud reporting channel.' ] },
  { id: 'remote', label: 'I gave someone remote access', steps: [
    'End the session and disconnect the device from the internet.',
    'Uninstall the remote access tool only if you know how. Otherwise leave it for IT.',
    'Contact your IT or security team immediately.',
    'From a different, trusted device, change important passwords.',
    'Call your bank if you used online banking during or after the session.' ] },
];

export function render(ctx) {
  ctx.setMode('full'); ctx.setDetail(false); ctx.setTitle('Got Hooked?');
  const sel = SITUATIONS.find((s) => s.id === ctx.route.id) || SITUATIONS[0];
  const ticks = store.get().hookedChecklist || {};
  ctx.reader.innerHTML = `<div class="reader-inner">
    <h1>Got hooked? Take a breath.</h1>
    <p>Pick what happened and work through the steps. Your ticks are saved in this browser only.</p>
    <div class="no-shame">${icon('lifering')} <strong>No shame.</strong> Reporting fast is the single most helpful thing you can do.</div>
    <nav class="situations no-print" aria-label="Situations">${SITUATIONS.map((s) => `<a class="btn ${s.id === sel.id ? 'btn-primary' : 'btn-secondary'}" href="#/hooked/${s.id}"${s.id === sel.id ? ' aria-current="page"' : ''}>${esc(s.label)}</a>`).join('')}</nav>
    <section class="card"><h2>${esc(sel.label)}</h2>
      <div class="checklist">${sel.steps.map((st, i) => {
        const k = `${sel.id}-${i}`;
        return `<label class="check-item"><input type="checkbox" data-k="${k}"${ticks[k] ? ' checked' : ''}><span>${esc(st)}</span></label>`;
      }).join('')}</div>
      <p class="no-print"><button type="button" class="btn btn-ghost" id="clearTicks">Clear ticks</button></p></section>
    <section class="card card-soft"><h2>${icon('info')} Good to know</h2><ul>
      <li>Change passwords from a device you trust, not the one that may be affected.</li>
      <li>Keep the evidence: messages, numbers, links and screenshots help whoever investigates.</li>
      <li>Reach organisations through contact details you already know, not ones in the suspicious message.</li></ul></section>
  </div>`;
  $$('input[data-k]', ctx.reader).forEach((cb) => cb.addEventListener('change', () => {
    store.update((s) => { s.hookedChecklist = s.hookedChecklist || {}; if (cb.checked) s.hookedChecklist[cb.dataset.k] = true; else delete s.hookedChecklist[cb.dataset.k]; });
  }));
  ctx.reader.querySelector('#clearTicks').addEventListener('click', () => {
    store.update((s) => { Object.keys(s.hookedChecklist || {}).filter((k) => k.startsWith(`${sel.id}-`)).forEach((k) => delete s.hookedChecklist[k]); });
    $$('input[data-k]', ctx.reader).forEach((cb) => { cb.checked = false; });
  });
  ctx.focusHeading(ctx.reader);
}
