/* =========================================================
   Gallery of Her (Desktop 8)
   Pictures are "picture 1", "picture 2" … inside /assets.
   Click a photo → full view with Prev / Next / X.
   ========================================================= */
(function () {
  'use strict';

  var COUNT = 15;                      // change if you add more pictures
  var grid = document.getElementById('grid');
  var tiles = [];

  function baseName(i) { return 'picture ' + (i + 1); }

  /* ---------- thumbnails (loaded when they get close to the screen) ---------- */
  function loadThumb(tile) {
    var i = +tile.getAttribute('data-i');
    var img = tile.querySelector('img');
    Shell.resolveImage(baseName(i)).then(function (url) { img.src = url; })
      .catch(function () { tile.classList.add('is-missing'); });
  }

  var io = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { io.unobserve(en.target); loadThumb(en.target); }
        });
      }, { rootMargin: '300px' })
    : null;

  for (var n = 0; n < COUNT; n++) {
    var tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'tile';
    tile.setAttribute('data-i', n);
    tile.setAttribute('aria-label', 'Open photo ' + (n + 1) + ' of ' + COUNT);
    var img = document.createElement('img');
    img.alt = '';
    img.draggable = false;
    img.decoding = 'async';
    tile.appendChild(img);
    grid.appendChild(tile);
    tiles.push(tile);
    if (io) io.observe(tile); else loadThumb(tile);
  }

  grid.addEventListener('click', function (e) {
    var t = e.target.closest('.tile');
    if (t) openViewer(+t.getAttribute('data-i'));
  });

  /* ---------- full-view viewer ---------- */
  var box = null, imgEl, errEl, countEl, idx = 0, token = 0, lastFocus = null;

  var CHEV_L = '<svg viewBox="0 0 24 34" aria-hidden="true"><path d="M18 3 5 17l13 14" fill="none" stroke="currentColor" stroke-width="3.500" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHEV_R = '<svg viewBox="0 0 24 34" aria-hidden="true"><path d="m6 3 13 14L6 31" fill="none" stroke="currentColor" stroke-width="3.500" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function openViewer(i) {
    if (box) return;
    lastFocus = document.activeElement;

    box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML =
      '<img class="lb-img is-loading" alt="" draggable="false">' +
      '<p class="lb-error" hidden>This photo could not be loaded.</p>' +
      '<button class="lb-btn lb-close" type="button" aria-label="Close">' + Shell.X_SVG + '</button>' +
      '<button class="lb-btn lb-prev" type="button" aria-label="Previous photo">' + CHEV_L + '</button>' +
      '<button class="lb-btn lb-next" type="button" aria-label="Next photo">' + CHEV_R + '</button>' +
      '<div class="lb-count" aria-live="polite"></div>';

    imgEl = box.querySelector('.lb-img');
    errEl = box.querySelector('.lb-error');
    countEl = box.querySelector('.lb-count');

    box.querySelector('.lb-close').addEventListener('click', closeViewer);
    box.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    box.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });

    /* click on the dark area closes; clicking the photo or a button does not */
    box.addEventListener('click', function (e) { if (e.target === box) closeViewer(); });
    box.addEventListener('keydown', function (e) { Shell.trapTab(box, e); });

    /* swipe left / right on touch screens */
    var sx = null, sy = null;
    box.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { sx = null; return; }
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(dx < 0 ? idx + 1 : idx - 1);
    }, { passive: true });

    document.body.appendChild(box);
    Shell.lockScroll(true);
    document.addEventListener('keydown', onKey);
    show(i);
    box.querySelector('.lb-close').focus();
  }

  function show(i) {
    idx = (i + COUNT) % COUNT;           // wraps around: after the last photo comes the first
    var my = ++token;

    countEl.textContent = (idx + 1) + ' / ' + COUNT;
    imgEl.alt = 'Photo ' + (idx + 1) + ' of ' + COUNT;
    imgEl.classList.add('is-loading');
    errEl.hidden = true;

    Shell.resolveImage(baseName(idx)).then(function (url) {
      if (my !== token) return;
      imgEl.onload = function () { if (my === token) imgEl.classList.remove('is-loading'); };
      imgEl.src = url;
      if (imgEl.complete && imgEl.naturalWidth) imgEl.classList.remove('is-loading');

      /* warm the cache for the neighbours so next / prev feels instant */
      Shell.resolveImage(baseName((idx + 1) % COUNT)).then(function (u) { new Image().src = u; }, function () {});
      Shell.resolveImage(baseName((idx - 1 + COUNT) % COUNT)).then(function (u) { new Image().src = u; }, function () {});
    }).catch(function () {
      if (my !== token) return;
      imgEl.removeAttribute('src');
      errEl.hidden = false;
    });
  }

  function onKey(e) {
    if (e.key === 'Escape') closeViewer();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
  }

  function closeViewer() {
    if (!box) return;
    document.removeEventListener('keydown', onKey);
    token++;
    box.remove();
    box = null;
    Shell.lockScroll(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
})();
