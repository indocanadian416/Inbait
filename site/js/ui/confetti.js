import { reducedMotion } from '../util.js';
const COLORS = ['--brand', '--success', '--warning', '--danger', '--av-3', '--av-5'];
export function confetti(host) {
  if (reducedMotion()) return;
  const layer = document.createElement('div'); layer.className = 'confetti-layer'; layer.setAttribute('aria-hidden', 'true');
  const cs = getComputedStyle(document.documentElement);
  for (let i = 0; i < 60; i++) {
    const b = document.createElement('span'); b.className = 'confetti-bit';
    b.style.left = `${Math.random() * 100}%`;
    b.style.background = cs.getPropertyValue(COLORS[i % COLORS.length]).trim();
    b.style.animationDelay = `${Math.random() * 0.4}s`;
    layer.append(b);
  }
  host.append(layer);
  setTimeout(() => layer.remove(), 2400);
}
