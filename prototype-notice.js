/* ==========================================================
   Prototype notice
   Shows a bar at the top of whatever screen she lands on first,
   and only that once per visit, so it sets expectations up front
   without getting in the way later.
   ========================================================== */

(function () {
    const KEY = 'hbl-prototype-notice-seen';

    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) {}
    if (seen) return;

    // Mark it seen right away, so the next screen never shows it again
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}

    const bar = document.createElement('div');
    bar.className = 'proto-notice';
    bar.setAttribute('role', 'note');
    bar.setAttribute('aria-label', 'Prototype notice');
    bar.innerHTML =
        '<p class="proto-notice-title">This is just a prototype</p>' +
        '<p class="proto-notice-text">It isn’t supposed to look polished. We’re testing the idea, not the visual design. ' +
        'Try booking a hair appointment and tell us what you think of the overall idea. Nothing you book here is real.</p>' +
        '<button type="button" class="proto-notice-btn">Got it</button>';

    bar.querySelector('button').addEventListener('click', () => bar.remove());

    const frame = document.querySelector('.app-frame');
    if (frame) frame.insertBefore(bar, frame.firstChild);
})();
