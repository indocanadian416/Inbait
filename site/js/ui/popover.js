// "This link really goes to" popover for training links (buttons, never <a>).
let pop;
function hide() { pop?.remove(); pop = null; }
function show(btn) {
  hide();
  pop = document.createElement('div');
  pop.className = 'popover'; pop.setAttribute('role', 'tooltip'); pop.id = 'link-pop';
  const s = document.createElement('strong'); s.textContent = 'This link really goes to:';
  const u = document.createElement('span'); u.className = 'mono'; u.textContent = btn.dataset.url;
  pop.append(s, u);
  document.body.append(pop);
  btn.setAttribute('aria-describedby', 'link-pop');
  const r = btn.getBoundingClientRect();
  const pw = pop.offsetWidth, ph = pop.offsetHeight;
  let left = Math.min(Math.max(12, r.left), window.innerWidth - pw - 12);
  let top = r.bottom + 8; if (top + ph > window.innerHeight - 12) top = r.top - ph - 8;
  pop.style.left = `${left}px`; pop.style.top = `${Math.max(8, top)}px`;
}
export function bindLinkPopovers(root) {
  root.querySelectorAll('button[data-url]').forEach((b) => {
    b.addEventListener('mouseenter', () => show(b));
    b.addEventListener('mouseleave', hide);
    b.addEventListener('focus', () => show(b));
    b.addEventListener('blur', hide);
    b.addEventListener('click', (e) => { e.preventDefault(); if (pop) hide(); else show(b); });
  });
}
document.addEventListener('scroll', hide, true);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
