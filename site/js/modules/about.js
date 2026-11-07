// Placeholder for the first preview. Full section coming in a later version.
import { icon } from '../util.js';
export function render(ctx) {
  ctx.setMode('full'); ctx.setDetail(false); ctx.setTitle('About');
  ctx.reader.innerHTML = `<div class="reader-inner"><h1>About</h1><div class="empty">${icon('info')}<p>This section is coming in the next version of Inbait.</p></div></div>`;
  ctx.focusHeading(ctx.reader);
}
