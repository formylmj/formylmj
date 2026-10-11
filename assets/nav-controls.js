/* =========================================================
   Top-bar controls:  < prev   > next   X close
   Page order (edit here if you add or reorder pages):
     vinyl → album (Home) → about → lyrics → gallery → wishes → love letter
   - prev / next walk that list
   - X always returns to the vinyl page
   - on the first/last page the arrow that has nowhere to go is dimmed and does nothing
   Load this AFTER shell.js (it needs the nav that shell.js builds).
   ========================================================= */
(function () {
  'use strict';

  var ORDER = [
    'vinyl.html',
    'album.html',
    'about.html',
    'lyrics.html',
    'gallery.html',
    'birthday-wishes.html',
    'love-letter.html'
  ];
  var VINYL = 'vinyl.html';

  var file = decodeURIComponent(location.pathname.split('/').pop() || '');
  var i = ORDER.indexOf(file);
  if (i === -1) return;                       // not one of the pages above → leave the bar alone

  var prevUrl = i > 0 ? ORDER[i - 1] : null;
  var nextUrl = i < ORDER.length - 1 ? ORDER[i + 1] : null;

  var left  = document.querySelector('.nav-left');
  var chevs = left ? left.querySelectorAll('.ic-chev') : [];
  var prev  = chevs[0], next = chevs[1];
  var close = document.querySelector('.nav-right .ic-x');

  if (left) left.removeAttribute('aria-hidden');   // they are real controls now

  function wire(el, url, label) {
    if (!el) return;
    el.setAttribute('role', 'link');
    el.setAttribute('aria-label', label);
    if (!url) {                                    // nowhere to go
      el.setAttribute('aria-disabled', 'true');
      el.style.opacity = '.35';
      el.style.cursor = 'not-allowed';
      return;
    }
    el.setAttribute('tabindex', '0');
    el.style.cursor = 'pointer';
    el.style.pointerEvents = 'auto';
    el.addEventListener('click', function () { location.href = url; });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); location.href = url; }
    });
  }

  wire(prev,  prevUrl, 'Previous page');
  wire(next,  nextUrl, 'Next page');
  wire(close, VINYL,   'Close and go back to the vinyl page');
})();
