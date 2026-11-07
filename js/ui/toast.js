export function toast(msg, { action, onAction, timeout = 4000 } = {}) {
  const wrap = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = 'toast';
  const span = document.createElement('span'); span.textContent = msg; t.append(span);
  if (action) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = action;
    b.addEventListener('click', () => { onAction?.(); t.remove(); }); t.append(b);
  }
  wrap.append(t);
  if (timeout) setTimeout(() => t.remove(), timeout);
  return t;
}
