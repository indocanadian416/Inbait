// About: what Inbait is, privacy, disclaimer, settings, license.
import { icon } from '../util.js';
import * as store from '../store.js';
import { confirmModal } from '../ui/modal.js';
import { toast } from '../ui/toast.js';
import { themeSeg, bindThemeSeg } from '../app.js';

export function render(ctx) {
  ctx.setMode('full'); ctx.setDetail(false); ctx.setTitle('About');
  ctx.reader.innerHTML = `<div class="reader-inner">
    <h1>About Inbait</h1>
    <p class="lead"><strong>Your inbox. Their bait. Your call.</strong></p>
    <p>Inbait is a free practice space for spotting scams. It looks like a mail app, and everything inside it is a safe simulation. You learn by playing the target: read, decide, and see what gave it away.</p>

    <section class="card"><h2>${icon('shield')} Privacy</h2>
      <ul>
        <li>No tracking, no analytics and no cookies.</li>
        <li>No third-party scripts, fonts or requests. Everything loads from this site.</li>
        <li>Your progress is saved only in this browser, on this device. It never leaves it.</li>
        <li>Training sign-in boxes never send anything, and what you type is cleared.</li>
      </ul></section>

    <section class="card"><h2>${icon('info')} Disclaimer</h2>
      <p>All companies, people and domains in Inbait are fictional. Any resemblance is coincidental.</p>
      <p class="small muted">Fictional domains end in <span class="mono">.example</span> or <span class="mono">.test</span>, which are reserved and never point to a real website.</p></section>

    <section class="card"><h2>${icon('monitor')} Settings</h2>
      <p>Theme</p>${themeSeg()}
      <p class="learn-section">Reset clears your Hook Score, completed scenarios, Challenge history and checklist ticks in this browser.</p>
      <button type="button" class="btn btn-danger" id="resetBtn">${icon('refresh')}Reset all progress</button>
      ${store.storageOk ? '' : '<p class="small muted">Storage is unavailable in this browser mode, so progress is not being saved.</p>'}</section>

    <section class="card"><h2>${icon('radar')} Hook Radar sources</h2>
      <p class="small muted">Credits for the news sources will appear here once Hook Radar is switched on.</p></section>

    <section class="card"><h2>${icon('book')} License</h2>
      <p>Inbait is open source under the MIT License. Copyright (c) 2026 indocanadian416.</p>
      <p class="small">Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to including the copyright notice and this permission notice in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.</p>
      <p><a href="https://github.com/indocanadian416/Inbait" target="_blank" rel="noopener noreferrer">${icon('external', 'icon-sm')} Source code on GitHub</a></p></section>
  </div>`;
  bindThemeSeg(ctx.reader);
  ctx.reader.querySelector('#resetBtn').addEventListener('click', async () => {
    if (await confirmModal('Reset all progress?', 'This clears everything Inbait has saved in this browser. It cannot be undone.', 'Reset')) {
      store.reset(); toast('Progress reset.');
    }
  });
  ctx.focusHeading(ctx.reader);
}
