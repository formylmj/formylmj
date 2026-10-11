(function () {
  /* ---------- Tonearm geometry (measured from the Desktop 2 design) ----------
     All numbers are in "player units": the player box is 476 x 321.        */
  var BOX_W = 476, BOX_H = 321;
  var PIVOT = { x: 378.05, y: 80.4 };      // centre of the arm's base
  var TIP   = { x: 282.0,  y: 232.1 };     // the stylus tip at angle 0 (= the design pose)
  var DISC  = { x: 160.5,  y: 160.5, r: 160.5 };
  var LABEL_R = 52;                        // pink centre label – no grooves there

  var REST  = -24;    // deg – needle lifted, clear of the record
  var PLAY  = 0;      // deg – needle on the record exactly like the design
  var DRIFT = 10;     // deg – the needle slowly travels inward while the song plays
  var MIN_A = -45;    // free-drag limits
  var MAX_A = 22;

  var player = document.getElementById('player');
  var arm    = document.getElementById('arm');
  var handle = document.getElementById('handle');
  var audio  = document.getElementById('song');
  var cont   = document.getElementById('continueBtn');

  var angle = REST;
  var dragging = false, moved = false, startPtr = 0, startArm = 0;
  var dropAngle = PLAY, dropTime = 0, landingUntil = 0;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function setAngle(a) {
    angle = a;
    arm.style.transform = 'rotate(' + a + 'deg)';
  }

  /* Where is the stylus for a given arm angle?  Is it touching the grooves? */
  function onRecord(a) {
    var rad = a * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad);
    var vx = TIP.x - PIVOT.x, vy = TIP.y - PIVOT.y;
    var x = PIVOT.x + vx * c - vy * s;
    var y = PIVOT.y + vx * s + vy * c;
    var dist = Math.hypot(x - DISC.x, y - DISC.y);
    return dist <= DISC.r - 3 && dist >= LABEL_R;
  }

  function tryPlay() {
    var p = audio.play();
    if (p && p.catch) p.catch(function () { /* blocked until a real tap – pointerup retries */ });
  }

  /* ----- tap (no drag): needle swings down / up on its own ----- */
  function placeNeedle() {
    arm.classList.remove('dragging', 'following');
    setAngle(PLAY);
    dropAngle = PLAY;
    dropTime = audio.currentTime;
    landingUntil = performance.now() + 950;
    var p = audio.play();
    if (p && p.catch) p.catch(function () { liftNeedle(); });
  }
  function liftNeedle() {
    arm.classList.remove('dragging', 'following');
    audio.pause();
    setAngle(REST);
  }
  function toggle() { audio.paused ? placeNeedle() : liftNeedle(); }

  /* ----- keep the disc spinning only while music plays ----- */
  audio.addEventListener('play',  function () { player.classList.add('is-playing'); });
  audio.addEventListener('pause', function () { player.classList.remove('is-playing'); });

  /* needle drifts toward the centre as the song progresses */
  audio.addEventListener('timeupdate', function () {
    if (audio.paused || dragging || !audio.duration) return;
    if (performance.now() < landingUntil) return;
    arm.classList.add('following');
    var a = dropAngle + ((audio.currentTime - dropTime) / audio.duration) * DRIFT;
    setAngle(Math.min(a, MAX_A));
  });
  audio.addEventListener('ended', function () {
    liftNeedle();
    audio.currentTime = 0;
  });

  /* ----- drag the tonearm freely (mouse + touch + pen via Pointer Events) ----- */
  function pivotOnScreen() {
    var r = player.getBoundingClientRect();
    return { x: r.left + r.width * (PIVOT.x / BOX_W), y: r.top + r.height * (PIVOT.y / BOX_H) };
  }
  function pointerAngle(e) {
    var p = pivotOnScreen();
    return Math.atan2(e.clientY - p.y, e.clientX - p.x) * 180 / Math.PI;
  }
  function wrap(d) {
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return d;
  }

  handle.addEventListener('pointerdown', function (e) {
    if (e.button !== undefined && e.button > 0) return;
    dragging = true; moved = false;
    startPtr = pointerAngle(e);
    startArm = angle;
    arm.classList.add('dragging');
    arm.classList.remove('following');
    try { handle.setPointerCapture(e.pointerId); } catch (err) {}
    e.preventDefault();
  });

  handle.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var d = wrap(pointerAngle(e) - startPtr);
    if (Math.abs(d) > 1.5) moved = true;
    if (!moved) return;
    setAngle(clamp(startArm + d, MIN_A, MAX_A));

    /* needle on the record → music plays;  lifted off the record → music stops */
    if (onRecord(angle)) { if (audio.paused) tryPlay(); }
    else if (!audio.paused) audio.pause();
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    arm.classList.remove('dragging');
    try { handle.releasePointerCapture(e.pointerId); } catch (err) {}
    if (!moved) { toggle(); return; }

    if (onRecord(angle)) {
      dropAngle = angle;                 // drift continues from wherever she put it
      dropTime = audio.currentTime;
      landingUntil = 0;
      if (audio.paused) tryPlay();       // retry inside a real tap for iOS / Safari
    } else {
      audio.pause();
    }
  }
  handle.addEventListener('pointerup', endDrag);
  handle.addEventListener('pointercancel', endDrag);

  /* keyboard: Enter / Space toggle, arrow keys nudge the arm */
  handle.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); return; }
    var dir = (e.key === 'ArrowLeft' || e.key === 'ArrowDown') ? 1
            : (e.key === 'ArrowRight' || e.key === 'ArrowUp') ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    arm.classList.remove('following');
    setAngle(clamp(angle + dir * 4, MIN_A, MAX_A));
    if (onRecord(angle)) { dropAngle = angle; dropTime = audio.currentTime; if (audio.paused) tryPlay(); }
    else audio.pause();
  });
  handle.addEventListener('keyup', function (e) { if (e.key === ' ') e.preventDefault(); });

  /* ----- Continue → "Who's listening?" ----- */
  cont.addEventListener('click', function () { audio.pause(); });

  setAngle(REST);
})();
