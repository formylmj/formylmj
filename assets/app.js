(function () {
  /* ---------- Profile pop-up (album page) ---------- */
  var btn = document.getElementById('avatarBtn');
  var menu = document.getElementById('profileMenu');
  var logout = document.getElementById('logoutBtn');

  if (btn && menu) {
    function open()  { menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); }
    function close() { menu.hidden = true;  btn.setAttribute('aria-expanded', 'false'); }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.hidden ? open() : close();
    });
    document.addEventListener('click', function (e) {
      if (!menu.hidden && !menu.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { close(); btn.focus(); }
    });
    logout.addEventListener('click', function () {
      window.location.href = 'index.html';       // back to the vinyl-player page
    });
  }

  /* ---------- Play / pause the song from the album page ---------- */
  var play = document.getElementById('playBtn');
  var song = document.getElementById('song');
  if (play && song) {
    play.addEventListener('click', function () {
      if (song.paused) { var p = song.play(); if (p && p.catch) p.catch(function () {}); }
      else song.pause();
    });
    song.addEventListener('play',  function () { play.classList.add('is-playing');    play.setAttribute('aria-label', 'Pause'); });
    song.addEventListener('pause', function () { play.classList.remove('is-playing'); play.setAttribute('aria-label', 'Play'); });
    song.addEventListener('ended', function () { play.classList.remove('is-playing'); play.setAttribute('aria-label', 'Play'); });
  }
})();
