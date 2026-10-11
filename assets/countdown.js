/* =========================================================
   Countdown to her birthday  ·  13 Oct 2026, 12:00 AM Philippine Time (UTC+8)
   The gift button stays locked until that exact moment.
   To change the date, edit TARGET below (keep the +08:00 so it is always PH time).
   ========================================================= */
(function () {
  'use strict';

  var TARGET = new Date('2026-10-13T00:00:00+08:00').getTime();
  var GIFT_URL = 'vinyl.html';          // the vinyl "Happy Birthday" page

  var els = {
    d: document.getElementById('cdDays'),
    h: document.getElementById('cdHours'),
    m: document.getElementById('cdMinutes'),
    s: document.getElementById('cdSeconds'),
    btn: document.getElementById('giftBtn'),
    label: document.getElementById('giftLabel'),
    note: document.getElementById('giftNote')
  };

  var unlocked = false;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    els.btn.setAttribute('href', GIFT_URL);
    els.btn.removeAttribute('aria-disabled');
    els.btn.removeAttribute('tabindex');
    els.btn.classList.add('is-open');
    els.label.textContent = 'Open my birthday gift';
    els.note.textContent = 'Happy birthday! Your gift is ready.';
  }

  function tick() {
    var diff = TARGET - Date.now();

    if (diff <= 0) {
      els.d.textContent = els.h.textContent = els.m.textContent = els.s.textContent = '00';
      unlock();
      clearInterval(timer);
      return;
    }

    var total = Math.floor(diff / 1000);
    els.d.textContent = pad(Math.floor(total / 86400));
    els.h.textContent = pad(Math.floor((total % 86400) / 3600));
    els.m.textContent = pad(Math.floor((total % 3600) / 60));
    els.s.textContent = pad(total % 60);
  }

  /* While locked the link has no href, but block any click / Enter / Space anyway */
  els.btn.addEventListener('click', function (e) {
    if (!unlocked || Date.now() < TARGET) e.preventDefault();
  });
  els.btn.addEventListener('keydown', function (e) {
    if (!unlocked && (e.key === 'Enter' || e.key === ' ')) e.preventDefault();
  });

  var timer = setInterval(tick, 250);   // 4x a second so the seconds never skip
  document.addEventListener('visibilitychange', tick);
  tick();
})();
