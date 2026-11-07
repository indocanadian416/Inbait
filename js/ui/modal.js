import { icon } from '../util.js';
// Modal on desktop, bottom sheet on mobile. Focus-trapped, Esc closes, restores focus.
export function openModal({ title, html, onOpen, onClose }) {
  const trigger = document.activeElement;
  const scrim = document.createElement('div');
  scrim.className = 'modal-scrim';
  const id = `m${Date.now()}`;
  scrim.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="${id}">
    <div class="modal-head"><h2 id="${id}" tabindex="-1">${title}</h2>
    <button type="button" class="btn btn-ghost btn-icon" data-close aria-label="Close">${icon('x')}</button></div>
    <div class="modal-body">${html}</div></div>`;
  document.body.append(scrim);
  const modal = scrim.firstElementChild;
  let closed = false;
  const close = () => {
    if (closed) return; closed = true;
    scrim.remove(); document.removeEventListener('keydown', onKey, true);
    onClose?.(); trigger?.focus?.();
  };
  const focusables = () => Array.from(modal.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'));
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Tab') {
      const f = focusables(); if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  }
  document.addEventListener('keydown', onKey, true);
  scrim.addEventListener('click', (e) => { if (e.target === scrim || e.target.closest('[data-close]')) close(); });
  modal.querySelector('h2').focus();
  onOpen?.(modal, close);
  return close;
}
export function confirmModal(title, text, okLabel = 'Confirm', danger = true) {
  return new Promise((resolve) => {
    let ok = false;
    openModal({
      title,
      html: `<p>${text}</p><div class="btn-row"><button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-ok>${okLabel}</button><button type="button" class="btn btn-secondary" data-close>Cancel</button></div>`,
      onOpen: (m, c) => m.querySelector('[data-ok]').addEventListener('click', () => { ok = true; c(); }),
      onClose: () => resolve(ok),
    });
  });
}
