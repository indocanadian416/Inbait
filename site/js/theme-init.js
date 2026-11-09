// Runs in <head> before first paint to avoid a theme flash.
(function () {
  try {
    var s = JSON.parse(localStorage.getItem('inbait:v1') || '{}');
    if (s.theme === 'light' || s.theme === 'dark') document.documentElement.setAttribute('data-theme', s.theme);
  } catch (e) { /* storage blocked: follow system */ }
})();
