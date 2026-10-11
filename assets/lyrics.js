/* =========================================================
   Lyric Notes (Desktop 7)
   Click a lyric card → pop-up with the letter for that song.
   ========================================================= */
(function () {
  'use strict';

  /* file  = name of the picture inside /assets (without extension)
     ext   = the extension tried first (others are tried automatically)
     x,y,w,h = position/size in the 1440 x 1024 Figma frame; z = stacking; r = tilt in degrees */
  var SONGS = [
    { id: 'every-summertime',     title: 'Every Summertime',       artist: 'NIKI',          file: 'every summertime',     ext: 'png', x: 302,  y: 255, w: 269, h: 293, z: 1, r: 0 },
    { id: 'plot-twist',           title: 'Plot Twist',             artist: 'NIKI',          file: 'plot twist',           ext: 'png', x: 846,  y: 256, w: 302, h: 304, z: 1, r: 0.4 },
    { id: 'youll-be-in-my-heart', title: 'You\u2019ll Be in My Heart', artist: 'NIKI',      file: 'youll be in my heart', ext: 'png', x: 559,  y: 341, w: 286, h: 267, z: 2, r: 0 },
    { id: 'robbers',              title: 'Robbers',                artist: 'The 1975',      file: 'robbers',              ext: 'png', x: 1097, y: 398, w: 286, h: 271, z: 2, r: 0 },
    { id: 'im-in-love-with-you',  title: 'I\u2019m in Love With You', artist: 'The 1975',   file: 'I\'m in love with you', ext: 'png', x: 804,  y: 480, w: 259, h: 320, z: 3, r: 0 },
    { id: 'all-i-need-to-hear',   title: 'All I Need to Hear',     artist: 'The 1975',      file: 'all I need to hear',   ext: 'png', x: 305,  y: 577, w: 326, h: 335, z: 3, r: 0 },
    { id: 'pretty-when-you-cry',  title: 'Pretty When You Cry',    artist: 'Lana Del Rey',  file: 'pretty when you cry',  ext: 'png', x: 598,  y: 722, w: 269, h: 236, z: 4, r: 0 },
    { id: 'video-games',          title: 'Video Games',            artist: 'Lana Del Rey',  file: 'video games',          ext: 'jpg', x: 1056, y: 600, w: 295, h: 342, z: 4, r: 0 }
  ];

  /* the content area is now x 304 → 1416 (was 302 → 1383): scale the collage to fit */
  var K = 1112 / 1081, X0 = 302, NEW_X0 = 304;
  function px(x) { return Math.round((NEW_X0 + (x - X0) * K) * 10) / 10; }
  function pw(w) { return Math.round(w * K * 10) / 10; }

  var EXTS = ['png', 'jpg', 'jpeg', 'webp', 'PNG', 'JPG', 'JPEG', 'WEBP'];
  function extsFor(song) { return [song.ext].concat(EXTS.filter(function (e) { return e !== song.ext; })); }

  var LETTERS = window.LETTERS || {};
  var wrap = document.getElementById('lyrics');
  var overlay = null, lastFocus = null;

  /* ---------- cards ---------- */
  SONGS.forEach(function (s) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lyric';
    btn.style.cssText = '--x:' + px(s.x) + ';--y:' + s.y + ';--w:' + pw(s.w) + ';--h:' + s.h + ';--z:' + s.z + ';--r:' + s.r;
    btn.setAttribute('aria-label', 'Read the letter for ' + s.title + ' by ' + s.artist);

    var img = document.createElement('img');
    img.alt = 'Lyric card: ' + s.title + ' by ' + s.artist;
    img.draggable = false;
    img.decoding = 'async';
    btn.appendChild(img);
    wrap.appendChild(btn);

    Shell.resolveImage(s.file, extsFor(s)).then(function (url) { img.src = url; }).catch(function () {
      btn.classList.add('is-missing');
    });

    btn.addEventListener('click', function () { openLetter(s); });
  });

  /* ---------- letter pop-up ---------- */
  function openLetter(song) {
    if (overlay) return;
    lastFocus = document.activeElement;

    overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML =
      '<div class="letter" role="dialog" aria-modal="true" aria-labelledby="letterTitle">' +
        '<button class="x" type="button" aria-label="Close letter">' + Shell.X_SVG + '</button>' +
        '<div class="letter-card"><img alt="" draggable="false"></div>' +
        '<div class="letter-scroll">' +
          '<h2 id="letterTitle"></h2>' +
          '<p class="by"></p>' +
          '<div class="letter-body"></div>' +
        '</div>' +
      '</div>';

    var dialog = overlay.querySelector('.letter');
    overlay.querySelector('#letterTitle').textContent = song.title;
    overlay.querySelector('.by').textContent = song.artist;

    var body = overlay.querySelector('.letter-body');
    var paras = LETTERS[song.id] || [];
    if (!paras.length) paras = ['This letter is on its way.'];
    paras.forEach(function (t) {
      var p = document.createElement('p');
      p.textContent = t;
      body.appendChild(p);
    });

    var cardImg = overlay.querySelector('.letter-card img');
    Shell.resolveImage(song.file, extsFor(song)).then(function (url) {
      cardImg.src = url;
      cardImg.alt = 'Lyric card: ' + song.title;
    }).catch(function () {
      overlay.querySelector('.letter-card').hidden = true;
    });

    document.body.appendChild(overlay);
    Shell.lockScroll(true);
    overlay.querySelector('.x').focus();

    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeLetter(); });
    overlay.querySelector('.x').addEventListener('click', closeLetter);
    overlay.addEventListener('keydown', function (e) { Shell.trapTab(dialog, e); });
    document.addEventListener('keydown', onKey);
  }

  function onKey(e) { if (e.key === 'Escape') closeLetter(); }

  function closeLetter() {
    if (!overlay) return;
    document.removeEventListener('keydown', onKey);
    overlay.remove();
    overlay = null;
    Shell.lockScroll(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
})();
