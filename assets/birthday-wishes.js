/* =========================================================
   Birthday Wishes
   Builds one card per friend (data: assets/wishes-data.js).
   Click a card -> pop-up with the whole message.
   ========================================================= */
(function () {
  'use strict';

  var WISHES = window.WISHES || [];
  var grid = document.getElementById('wishes');
  if (!grid) return;

  var overlay = null, lastFocus = null;

  /* a little vinyl record, drawn in SVG so it needs no image file */
  var VINYL =
    '<svg class="vinyl" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
      '<circle cx="50" cy="50" r="49" fill="#0d0d0d"/>' +
      '<circle cx="50" cy="50" r="40" fill="none" stroke="#2b2b2b" stroke-width="1.2"/>' +
      '<circle cx="50" cy="50" r="33" fill="none" stroke="#242424" stroke-width="1.2"/>' +
      '<circle cx="50" cy="50" r="26" fill="none" stroke="#2b2b2b" stroke-width="1"/>' +
      '<path d="M50 50 L82 18 A45 45 0 0 1 90 40 Z" fill="#fff" opacity=".13"/>' +
      '<path d="M50 50 L18 82 A45 45 0 0 1 10 60 Z" fill="#fff" opacity=".13"/>' +
      '<circle cx="50" cy="50" r="17" fill="#f2779b"/>' +
      '<circle cx="50" cy="50" r="2.6" fill="#fde0e8"/>' +
    '</svg>';

  var CHEV =
    '<svg class="wish-chev" viewBox="0 0 12 12" aria-hidden="true" focusable="false">' +
      '<path d="m4 1.5 4.500 4.500L4 10.500" fill="none" stroke="currentColor" stroke-width="1.500" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  /* card preview = the first words of the message (short openers get the next paragraph too) */
  function previewOf(w) {
    var text = '';
    for (var i = 0; i < w.blocks.length && text.length < 60; i++) {
      if (typeof w.blocks[i] === 'string') text += (text ? ' ' : '') + w.blocks[i];
    }
    return text.replace(/\s+/g, ' ').trim();
  }

  /* ---------- cards ---------- */
  WISHES.forEach(function (w) {
    var card = document.createElement('button');
    card.type = 'button';
    card.className = 'wish-card';
    card.setAttribute('aria-haspopup', 'dialog');
    card.setAttribute('aria-label', 'Read the birthday note from ' + w.name);

    card.innerHTML =
      '<span class="wish-top">' + VINYL +
        '<span class="wish-from"><span>A birthday note from</span><span class="wish-name"></span></span>' +
        CHEV +
      '</span>' +
      '<span class="wish-preview"></span>';
    card.querySelector('.wish-name').textContent = w.name;
    card.querySelector('.wish-preview').textContent = previewOf(w);

    card.addEventListener('click', function () { openWish(w, card); });
    grid.appendChild(card);
  });

  /* ---------- pop-up ---------- */
  function mediaBlock(b) {
    var fig = document.createElement('div');
    if (b.image) {
      fig.className = 'wish-media';
      var img = document.createElement('img');
      img.alt = b.alt || '';
      img.loading = 'eager';
      img.decoding = 'async';
      img.draggable = false;

      /* try the exact path first, then the same name with other extensions (.jpg .jpeg .png .webp, any case) */
      var base = b.image.replace(/\.[A-Za-z0-9]+$/, '');
      var tries = [b.image];
      ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'WEBP'].forEach(function (e) {
        if (tries.indexOf(base + '.' + e) < 0) tries.push(base + '.' + e);
      });
      var n = 0, gaveUp = false;
      img.addEventListener('error', function () {
        if (gaveUp) return;
        n++;
        if (n < tries.length) { img.src = tries[n]; return; }
        gaveUp = true;
        img.remove();                                   /* nothing found: say so instead of vanishing */
        var note = document.createElement('p');
        note.className = 'wish-media-missing';
        note.textContent = 'Picture not found: ' + b.image;
        fig.appendChild(note);
      });
      img.src = tries[0];
      fig.appendChild(img);
    } else if (b.video) {
      fig.className = 'wish-media';
      var box = document.createElement('div');
      box.className = 'wish-video';
      var v = document.createElement('video');
      v.controls = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.preload = 'metadata';
      v.setAttribute('aria-label', 'Video message');
      v.src = b.video;
      v.addEventListener('error', function () {
        v.remove();
        var p = document.createElement('p');
        p.className = 'wish-video-error';
        p.textContent = 'The video could not be loaded.';
        box.appendChild(p);
      });
      box.appendChild(v);
      fig.appendChild(box);
    }
    return fig;
  }

  function openWish(w, trigger) {
    if (overlay) return;
    lastFocus = trigger || document.activeElement;

    overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML =
      '<div class="wishbox" role="dialog" aria-modal="true" aria-labelledby="wishName">' +
        '<button class="x" type="button" aria-label="Close message">' + Shell.X_SVG + '</button>' +
        '<div class="wishbox-head">' + VINYL +
          '<div><p class="wishbox-from">A birthday note from</p><h2 class="wishbox-name" id="wishName"></h2></div>' +
        '</div>' +
        '<div class="wishbox-scroll"></div>' +
      '</div>';

    var dialog = overlay.querySelector('.wishbox');
    overlay.querySelector('#wishName').textContent = w.name;

    var body = overlay.querySelector('.wishbox-scroll');
    w.blocks.forEach(function (b) {
      if (typeof b === 'string') {
        var p = document.createElement('p');
        p.textContent = b;
        body.appendChild(p);
      } else {
        body.appendChild(mediaBlock(b));
      }
    });

    document.body.appendChild(overlay);
    Shell.lockScroll(true);
    overlay.querySelector('.x').focus();

    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeWish(); });
    overlay.querySelector('.x').addEventListener('click', closeWish);
    overlay.addEventListener('keydown', function (e) { Shell.trapTab(dialog, e); });
    document.addEventListener('keydown', onKey);
  }

  function onKey(e) { if (e.key === 'Escape') closeWish(); }

  function closeWish() {
    if (!overlay) return;
    document.removeEventListener('keydown', onKey);
    var vids = overlay.querySelectorAll('video');          /* stop the video if it is playing */
    for (var i = 0; i < vids.length; i++) { vids[i].pause(); }
    overlay.remove();
    overlay = null;
    Shell.lockScroll(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
})();
