/**
 * app.js — Stopwatch & Countdown Application
 * Encapsulated in an IIFE to avoid polluting global scope.
 * Uses Date.now() + requestAnimationFrame for precision timing.
 */
(() => {
  'use strict';

  // ─────────────────────────────────────────────
  // ROUTING MODULE
  // ─────────────────────────────────────────────

  const screens = {
    home:      document.getElementById('screen-home'),
    stopwatch: document.getElementById('screen-stopwatch'),
    countdown: document.getElementById('screen-countdown'),
  };

  /**
   * Show a screen by key, hide all others.
   * @param {'home'|'stopwatch'|'countdown'} key
   */
  function showScreen(key) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[key].classList.add('active');
  }

  // Home navigation buttons
  document.getElementById('btn-go-stopwatch').addEventListener('click', () => {
    swReset();
    showScreen('stopwatch');
  });
  document.getElementById('btn-go-countdown').addEventListener('click', () => {
    cdReset();
    showScreen('countdown');
  });


  // ─────────────────────────────────────────────
  // AUDIO MODULE  (Web Audio API — no external files)
  // ─────────────────────────────────────────────

  let audioCtx = null;

  /** Lazily create AudioContext (must be after a user gesture on some browsers). */
  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  /**
   * Play a beep tone at ~880 Hz for ~1.2 seconds.
   * Uses a sine oscillator with an exponential ramp-out.
   */
  function playBeep() {
    try {
      const ctx  = getAudioCtx();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type      = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);

      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }


  // ─────────────────────────────────────────────
  // UTILITY: Format milliseconds → HH:MM:SS + ms
  // ─────────────────────────────────────────────

  /**
   * Convert a milliseconds value into display parts.
   * @param {number} ms — total milliseconds (non-negative)
   * @returns {{ hms: string, millis: string }}
   */
  function formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const millis   = Math.floor(ms % 1000);
    const secs     = totalSec % 60;
    const mins     = Math.floor(totalSec / 60) % 60;
    const hrs      = Math.floor(totalSec / 3600);

    const pad2 = n => String(n).padStart(2, '0');
    const pad3 = n => String(n).padStart(3, '0');

    return {
      hms:    `${pad2(hrs)}:${pad2(mins)}:${pad2(secs)}`,
      millis: pad3(millis),
    };
  }


  // ─────────────────────────────────────────────
  // STOPWATCH MODULE
  // ─────────────────────────────────────────────

  const swTimeEl   = document.getElementById('sw-time');
  const swMillisEl = document.getElementById('sw-millis');
  const swBtnStart = document.getElementById('sw-btn-start');
  const swBtnClear = document.getElementById('sw-btn-clear');
  const swBtnBack  = document.getElementById('sw-btn-back');

  /** Stopwatch state */
  const sw = {
    running:   false,
    startTime: 0,     // Date.now() snapshot when last started
    elapsed:   0,     // accumulated ms before last pause
    rafId:     null,  // requestAnimationFrame id
  };

  /** Render the current elapsed time into the display. */
  function swRender() {
    const total = sw.elapsed + (sw.running ? Date.now() - sw.startTime : 0);
    const { hms, millis } = formatTime(total);
    swTimeEl.textContent   = hms;
    swMillisEl.textContent = millis;
  }

  /** Animation loop for stopwatch. */
  function swLoop() {
    swRender();
    if (sw.running) {
      sw.rafId = requestAnimationFrame(swLoop);
    }
  }

  /** Start or pause the stopwatch. */
  function swToggle() {
    if (sw.running) {
      // Pause: accumulate elapsed
      sw.elapsed += Date.now() - sw.startTime;
      sw.running  = false;
      cancelAnimationFrame(sw.rafId);
      swBtnStart.textContent = 'Start';
      swBtnStart.classList.replace('btn-red', 'btn-green');
    } else {
      // Start
      sw.startTime = Date.now();
      sw.running   = true;
      swBtnStart.textContent = 'Stop';
      swBtnStart.classList.replace('btn-green', 'btn-red');
      swLoop();
    }
  }

  /** Reset stopwatch to zero. */
  function swReset() {
    sw.running = false;
    sw.elapsed = 0;
    cancelAnimationFrame(sw.rafId);
    swBtnStart.textContent = 'Start';
    swBtnStart.classList.remove('btn-red');
    swBtnStart.classList.add('btn-green');
    swRender();
  }

  swBtnStart.addEventListener('click', swToggle);
  swBtnClear.addEventListener('click', swReset);
  swBtnBack.addEventListener('click', () => {
    swReset();
    showScreen('home');
  });


  // ─────────────────────────────────────────────
  // COUNTDOWN MODULE
  // ─────────────────────────────────────────────

  const cdTimeEl       = document.getElementById('cd-time');
  const cdMillisEl     = document.getElementById('cd-millis');
  const cdDisplay      = document.getElementById('cd-display');
  const cdNumpad       = document.getElementById('cd-numpad');
  const cdRunControls  = document.getElementById('cd-run-controls');
  const cdBtnSet       = document.getElementById('cd-btn-set');
  const cdBtnClearCfg  = document.getElementById('cd-btn-clear-cfg');
  const cdBtnStart     = document.getElementById('cd-btn-start');
  const cdBtnClearRun  = document.getElementById('cd-btn-clear-run');
  const cdBtnBack      = document.getElementById('cd-btn-back');
  const cdDigitBtns    = document.querySelectorAll('.btn-digit');

  /**
   * Countdown state.
   * buffer: array of 6 digits [HH1, HH2, MM1, MM2, SS1, SS2], right-to-left filled.
   */
  const cd = {
    phase:     'config',  // 'config' | 'run'
    buffer:    [0,0,0,0,0,0],
    totalMs:   0,
    remaining: 0,
    running:   false,
    startTime: 0,
    rafId:     null,
  };

  // ── Config phase helpers ──

  /**
   * Push a digit into the buffer from the right (like a calculator).
   * @param {number} digit — 0-9
   */
  function cdPushDigit(digit) {
    // Shift left, push new digit at position 5
    cd.buffer = [...cd.buffer.slice(1), digit];
    cdRenderBuffer();
  }

  /** Clear the digit buffer. */
  function cdClearBuffer() {
    cd.buffer = [0,0,0,0,0,0];
    cdRenderBuffer();
  }

  /**
   * Render the buffer as HH:MM:SS in the display.
   * buffer = [HH1, HH2, MM1, MM2, SS1, SS2]
   */
  function cdRenderBuffer() {
    const [h1,h2,m1,m2,s1,s2] = cd.buffer;
    cdTimeEl.textContent   = `${h1}${h2}:${m1}${m2}:${s1}${s2}`;
    cdMillisEl.textContent = '000';
  }

  /**
   * Convert buffer to total milliseconds.
   * @returns {number}
   */
  function cdBufferToMs() {
    const [h1,h2,m1,m2,s1,s2] = cd.buffer;
    const hrs  = h1 * 10 + h2;
    const mins = m1 * 10 + m2;
    const secs = s1 * 10 + s2;
    return ((hrs * 3600) + (mins * 60) + secs) * 1000;
  }

  /** Switch to run phase after Set is pressed. */
  function cdEnterRunPhase() {
    const ms = cdBufferToMs();
    if (ms === 0) return; // nothing to count

    cd.totalMs   = ms;
    cd.remaining = ms;
    cd.running   = false;
    cd.phase     = 'run';

    // Show run controls, hide numpad
    cdNumpad.classList.add('hidden');
    cdRunControls.classList.remove('hidden');

    cdDisplay.classList.remove('blinking');
    cdBtnStart.textContent = 'Start';
    cdBtnStart.classList.remove('btn-red');
    cdBtnStart.classList.add('btn-green');
    cdBtnStart.disabled = false;

    cdRenderRemaining();
  }

  /**
   * Return to config phase — used only by Back button.
   * Wipes all state and shows the numpad again.
   */
  function cdEnterConfigPhase() {
    cd.running = false;
    cd.phase   = 'config';
    cancelAnimationFrame(cd.rafId);
    cdDisplay.classList.remove('blinking');
    cdNumpad.classList.remove('hidden');
    cdRunControls.classList.add('hidden');
    cdClearBuffer();
  }

  /**
   * Fix 3: Clear in run phase — stop and reset to the originally configured time,
   * staying in run phase ready to Start again. Does NOT go back to the numpad.
   */
  function cdRestartRun() {
    cd.running = false;
    cancelAnimationFrame(cd.rafId);
    cd.remaining = cd.totalMs;
    cdDisplay.classList.remove('blinking');
    cdBtnStart.textContent = 'Start';
    cdBtnStart.classList.remove('btn-red');
    cdBtnStart.classList.add('btn-green');
    cdBtnStart.disabled = false;
    cdRenderRemaining();
  }

  // ── Run phase helpers ──

  /** Render cd.remaining into the display. */
  function cdRenderRemaining() {
    const { hms, millis } = formatTime(cd.remaining);
    cdTimeEl.textContent   = hms;
    cdMillisEl.textContent = millis;
  }

  /** Animation loop for countdown. */
  function cdLoop() {
    const elapsed   = Date.now() - cd.startTime;
    cd.remaining    = Math.max(0, cd.totalMs - elapsed);

    cdRenderRemaining();

    if (cd.remaining <= 0) {
      // Time's up!
      cd.running = false;
      cdDisplay.classList.add('blinking');
      cdBtnStart.disabled = true;
      playBeep();
      return; // stop rAF
    }

    if (cd.running) {
      cd.rafId = requestAnimationFrame(cdLoop);
    }
  }

  /** Start or pause the countdown. */
  function cdToggle() {
    if (cd.running) {
      // Pause: preserve cd.totalMs as the original reference for Clear.
      // cd.remaining is kept as-is so resuming continues from the right point.
      cd.running  = false;
      cancelAnimationFrame(cd.rafId);
      cdBtnStart.textContent = 'Start';
      cdBtnStart.classList.replace('btn-red', 'btn-green');
    } else {
      // Resume: update cd.totalMs to remaining so cdLoop counts correctly from here.
      cd.totalMs   = cd.remaining;
      cd.startTime = Date.now();
      cd.running   = true;
      cdBtnStart.textContent = 'Stop';
      cdBtnStart.classList.replace('btn-green', 'btn-red');
      cdLoop();
    }
  }

  /** Full reset of countdown state. */
  function cdReset() {
    cd.running  = false;
    cd.phase    = 'config';
    cd.buffer   = [0,0,0,0,0,0];
    cd.totalMs  = 0;
    cd.remaining = 0;
    cancelAnimationFrame(cd.rafId);
    cdDisplay.classList.remove('blinking');
    cdNumpad.classList.remove('hidden');
    cdRunControls.classList.add('hidden');
    cdBtnStart.textContent = 'Start';
    cdBtnStart.classList.remove('btn-red');
    cdBtnStart.classList.add('btn-green');
    cdBtnStart.disabled = false;
    cdRenderBuffer();
  }

  // ── Countdown event listeners ──

  // Digit buttons
  cdDigitBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      cdPushDigit(Number(btn.dataset.digit));
    });
  });

  cdBtnSet.addEventListener('click', cdEnterRunPhase);
  cdBtnClearCfg.addEventListener('click', cdClearBuffer);
  cdBtnStart.addEventListener('click', cdToggle);
  cdBtnClearRun.addEventListener('click', cdRestartRun);
  cdBtnBack.addEventListener('click', () => {
    cdReset();
    showScreen('home');
  });


  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────
  showScreen('home');
  swRender();
  cdRenderBuffer();

})();
