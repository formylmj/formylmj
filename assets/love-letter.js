/* =========================================================
   Love Letter page
   "Message from the Artist" player: plays assets/sound/Love Letter.mp3
   ========================================================= */
(function () {
  'use strict';

  var audio  = document.getElementById('loveAudio');
  var artist = document.getElementById('artist');
  var play   = document.getElementById('playBtn');
  var seek   = document.getElementById('seek');
  var now    = document.getElementById('timeNow');
  var total  = document.getElementById('timeTotal');
  var restart = document.getElementById('restartBtn');
  var repeat  = document.getElementById('repeatBtn');
  if (!audio || !play) return;

  var scrubbing = false;

  function fmt(s) {
    if (!isFinite(s) || s < 0) s = 0;
    var m = Math.floor(s / 60), x = Math.floor(s % 60);
    return m + ':' + (x < 10 ? '0' : '') + x;
  }

  function paint() {
    var d = audio.duration;
    var pct = d && isFinite(d) ? (audio.currentTime / d) * 100 : 0;
    now.textContent = fmt(audio.currentTime);
    if (!scrubbing) seek.value = Math.round(pct * 10);
    seek.style.setProperty('--p', (scrubbing ? seek.value / 10 : pct) + '%');
  }

  function ready() {
    if (isFinite(audio.duration)) {
      total.textContent = fmt(audio.duration);
      seek.disabled = false;
    }
    paint();
  }

  function setPlaying(on) {
    play.classList.toggle('is-playing', on);
    play.setAttribute('aria-label', on ? 'Pause the love letter' : 'Play the love letter');
  }

  /* ----- play / pause ----- */
  play.addEventListener('click', function () {
    if (audio.paused) {
      var p = audio.play();
      if (p && p.catch) p.catch(function () { setPlaying(false); });
    } else {
      audio.pause();
    }
  });
  audio.addEventListener('play',  function () { setPlaying(true); });
  audio.addEventListener('pause', function () { setPlaying(false); });
  audio.addEventListener('ended', function () { setPlaying(false); audio.currentTime = 0; paint(); });

  /* ----- progress ----- */
  audio.addEventListener('loadedmetadata', ready);
  audio.addEventListener('durationchange', ready);
  audio.addEventListener('timeupdate', paint);
  if (audio.readyState >= 1) ready();

  seek.addEventListener('input', function () {
    scrubbing = true;
    seek.style.setProperty('--p', (seek.value / 10) + '%');
    if (isFinite(audio.duration)) now.textContent = fmt(audio.duration * seek.value / 1000);
  });
  seek.addEventListener('change', function () {
    if (isFinite(audio.duration)) audio.currentTime = audio.duration * seek.value / 1000;
    scrubbing = false;
    paint();
  });

  /* ----- extra buttons ----- */
  if (restart) restart.addEventListener('click', function () { audio.currentTime = 0; paint(); });
  if (repeat) repeat.addEventListener('click', function () {
    audio.loop = !audio.loop;
    repeat.setAttribute('aria-pressed', audio.loop ? 'true' : 'false');
  });

  /* ----- recording missing? keep the page working, just say so ----- */
  audio.addEventListener('error', function () {
    artist.classList.add('is-missing');
    total.textContent = '--:--';
    play.setAttribute('aria-label', 'The recording could not be loaded');
    seek.disabled = true;
  });
})();
