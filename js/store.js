// localStorage wrapper with in-memory fallback. Nothing ever leaves the device.
const KEY = 'inbait:v1';
const defaults = () => ({ theme: 'system', completed: {}, challengeHistory: [], seenChallengeIds: [], hookedChecklist: {}, read: {}, radarLastVisit: null });
let state = defaults();
export let storageOk = true;
try {
  const raw = localStorage.getItem(KEY);
  if (raw) state = Object.assign(defaults(), JSON.parse(raw));
  localStorage.setItem(KEY, JSON.stringify(state));
} catch { storageOk = false; }
const listeners = new Set();
export const get = () => state;
export function update(fn) {
  fn(state);
  if (storageOk) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { storageOk = false; } }
  listeners.forEach((l) => l(state));
}
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export function reset() { const theme = state.theme; update((s) => { Object.assign(s, defaults(), { theme }); }); }
export function recordPractice(id, correct) {
  if (state.completed[id]) return false;
  update((s) => { s.completed[id] = { firstTryCorrect: !!correct, completedAt: new Date().toISOString() }; });
  return true;
}
