/* =========================================================
   Shared by about.html · lyrics.html · gallery.html
   - builds the top bar + sidebar (one place to edit the menu)
   - avatar pop-up with Log Out
   - Shell.resolveImage(): finds "picture 3" whether it is .jpg / .png / .webp …
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Sidebar: edit here when you add more pages ----------
     href: null  → item is shown but not clickable yet (Birthday Wishes / Love Letter).
     When you build those pages, just put their file name in href.            */
  var NAV = [
    { key: 'home',    label: 'Home',            href: 'album.html',   icon: 'home' },
    { key: 'about',   label: 'Who\u2019s Listening', href: 'about.html',   icon: 'person' },
    { key: 'lyrics',  label: 'Lyric Notes',     href: 'lyrics.html',  icon: 'music' },
    { key: 'gallery', label: 'Gallery of Her',  href: 'gallery.html', icon: 'image' },
    { key: 'wishes',  label: 'Birthday Wishes', href: 'birthday-wishes.html', icon: 'bookmark' },
    { key: 'letter',  label: 'Love Letter',     href: 'love-letter.html', icon: 'heart' }
  ];

  var ICONS = {
    home:     '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 11.5 12 3l9 8.5V21h-6v-6H9v6H3z"/></svg>',
    person:   '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.5" r="4.2" fill="currentColor"/><path fill="currentColor" d="M3.5 21c0-4.700 3.800-7.500 8.500-7.500s8.500 2.800 8.500 7.500z"/></svg>',
    music:    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 17.500V5l11-2.200v12.500" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="6.500" cy="17.500" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.500" cy="15.300" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    image:    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="9" r="1.800" fill="currentColor"/><path d="m4 19 5.500-5.500 3.500 3.500 2.500-2.500L20 19.500" fill="currentColor"/></svg>',
    bookmark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.800L5 21V4a1 1 0 0 1 1-1z"/><path fill="#a4627d" d="M12 12.800s-2.800-1.800-2.800-3.700a1.500 1.500 0 0 1 2.800-.7 1.500 1.500 0 0 1 2.800.7c0 1.900-2.800 3.700-2.800 3.700z"/></svg>',
    heart:    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21S3.500 15.500 3.500 9.500A4.700 4.700 0 0 1 12 7a4.700 4.700 0 0 1 8.500 2.500C20.500 15.500 12 21 12 21z"/></svg>'
  };

  var NAV_HTML =
    '<div class="nav-left" aria-hidden="true">' +
      '<svg class="ic-dots" viewBox="0 0 48 12"><circle cx="6" cy="6" r="5.5" fill="currentColor"/><circle cx="24" cy="6" r="5.5" fill="currentColor"/><circle cx="42" cy="6" r="5.5" fill="currentColor"/></svg>' +
      '<svg class="ic-chev" viewBox="0 0 24 34"><path d="M18 3 5 17l13 14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<svg class="ic-chev" viewBox="0 0 24 34"><path d="m6 3 13 14L6 31" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    '</div>' +
    '<div class="nav-center">' +
      '<a class="home" href="album.html" aria-label="Home"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 14.500 16 4l12 10.500V27a1 1 0 0 1-1 1h-7v-8h-8v8H5a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linejoin="round"/></svg></a>' +
      '<span class="search" aria-hidden="true">' +
        '<svg class="ic-search" viewBox="0 0 32 32"><circle cx="14" cy="14" r="9" fill="none" stroke="currentColor" stroke-width="2.400"/><path d="m21 21 7 7" stroke="currentColor" stroke-width="2.400" stroke-linecap="round"/></svg>' +
        '<span class="search-text">What do you want to play?</span>' +
        '<span class="divider"></span>' +
        '<svg class="ic-heart" viewBox="0 0 32 32"><path d="M16 27S4 20 4 11.500A6.500 6.500 0 0 1 16 8a6.500 6.500 0 0 1 12 3.500C28 20 16 27 16 27z" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linejoin="round"/></svg>' +
      '</span>' +
    '</div>' +
    '<div class="nav-right">' +
      '<svg class="ic-bell deco" viewBox="0 0 32 32" aria-hidden="true"><path d="M7 23v-9a9 9 0 0 1 18 0v9l2 3H5z" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linejoin="round"/><path d="M13 29a3 3 0 0 0 6 0" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round"/></svg>' +
      '<svg class="ic-people deco" viewBox="0 0 36 32" aria-hidden="true"><circle cx="12" cy="9" r="4.600" fill="none" stroke="currentColor" stroke-width="2.400"/><path d="M3 27c0-5 4-8 9-8s9 3 9 8z" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linejoin="round"/><circle cx="25" cy="11" r="3.600" fill="none" stroke="currentColor" stroke-width="2.400"/><path d="M24 18.500c5.500-.5 10 2 10 8.500h-8" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<div class="profile">' +
        '<button class="avatar-btn" id="avatarBtn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="profileMenu" aria-label="Lynn Margaret \u2013 account menu">' +
          '<img src="assets/pictures/my_baby.jpg" alt="" draggable="false">' +
        '</button>' +
        '<div class="menu" id="profileMenu" role="menu" hidden>' +
          '<a class="logout" role="menuitem" href="index.html">Log Out</a>' +
        '</div>' +
      '</div>' +
      '<svg class="ic-x deco" viewBox="0 0 28 28" aria-hidden="true"><path d="M2 2l24 24M26 2 2 26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
    '</div>';

  /* ---------- build the chrome ---------- */
  var page = document.body.getAttribute('data-page');

  var navEl = document.getElementById('nav');
  if (navEl) navEl.innerHTML = NAV_HTML;

  var sideEl = document.getElementById('side');
  if (sideEl) {
    sideEl.innerHTML = NAV.map(function (n) {
      var inner = ICONS[n.icon] + '<span>' + n.label + '</span>';
      if (!n.href) {
        return '<span class="side-item is-soon" aria-disabled="true" title="Coming soon">' + inner + '</span>';
      }
      var active = n.key === page;
      return '<a class="side-item' + (active ? ' is-active' : '') + '" href="' + n.href + '"' +
             (active ? ' aria-current="page"' : '') + '>' + inner + '</a>';
    }).join('');

    /* phones: scroll the pill row so the current page is in view */
    var act = sideEl.querySelector('.is-active');
    if (act && sideEl.scrollWidth > sideEl.clientWidth) {
      sideEl.scrollLeft = act.offsetLeft - (sideEl.clientWidth - act.offsetWidth) / 2;
    }
  }

  /* ---------- avatar pop-up ---------- */
  var avatarBtn = document.getElementById('avatarBtn');
  var menu = document.getElementById('profileMenu');
  if (avatarBtn && menu) {
    var setMenu = function (open) {
      menu.hidden = !open;
      avatarBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    avatarBtn.addEventListener('click', function (e) { e.stopPropagation(); setMenu(menu.hidden); });
    document.addEventListener('click', function (e) {
      if (!menu.hidden && !menu.contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); avatarBtn.focus(); }
    });
  }

  /* ---------- helpers for the pages ---------- */
  var DEFAULT_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'WEBP'];
  var cache = {};

  /* resolveImage('picture 3')  →  Promise<'assets/picture%203.jpg'>
     Tries each extension until one loads, remembers the result. */
  function resolveImage(base, exts) {
    if (cache[base]) return cache[base];
    var list = exts || DEFAULT_EXTS;
    cache[base] = new Promise(function (resolve, reject) {
      var i = 0;
      (function next() {
        if (i >= list.length) { delete cache[base]; reject(new Error('Image not found: ' + base)); return; }
        var url = 'assets/pictures/' + encodeURIComponent(base) + '.' + list[i++];
        var probe = new Image();
        probe.onload = function () { resolve(url); };
        probe.onerror = next;
        probe.src = url;
      })();
    });
    return cache[base];
  }

  function lockScroll(on) { document.documentElement.classList.toggle('modal-open', !!on); }

  /* keep Tab inside an open dialog */
  function trapTab(container, e) {
    if (e.key !== 'Tab') return;
    var f = container.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  var X_SVG = '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M3 3l22 22M25 3 3 25" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/></svg>';

  window.Shell = { resolveImage: resolveImage, lockScroll: lockScroll, trapTab: trapTab, X_SVG: X_SVG };
})();
