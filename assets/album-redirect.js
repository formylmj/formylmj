/* =========================================================
   album.html  →  big pink play button goes to about.html (Desktop 6)

   Add ONE line to album.html, right after the app.js line:
       <script src="assets/album-redirect.js"></script>

   Nothing else in album.html / app.js / pages.css needs to change.
   It listens in the capture phase, so it runs before app.js
   and the song does not start for a split second before the redirect.
   ========================================================= */
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('#playBtn');
    if (!btn) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    window.location.href = 'about.html';
  }, true);
})();
