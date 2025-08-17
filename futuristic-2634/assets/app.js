// NEO-UI 2634 Script
(function() {
  'use strict';

  // Utility: formatted time
  function timeStamp() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour12: false });
  }

  // Starfield
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let pointer = { x: 0, y: 0 };

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    genStars();
  }

  function genStars() {
    const count = Math.floor((window.innerWidth * window.innerHeight) / 2200);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: Math.random() * 0.8 + 0.2,
      tw: Math.random() * 2
    }));
  }

  function drawStars(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const s of stars) {
      const parallaxX = (pointer.x - window.innerWidth / 2) * 0.002 * s.z;
      const parallaxY = (pointer.y - window.innerHeight / 2) * 0.002 * s.z;

      const x = s.x + parallaxX * 20;
      const y = s.y + parallaxY * 20;

      const size = s.z * 1.3;
      const twinkle = 0.6 + 0.4 * Math.sin(t / 500 + s.tw);

      ctx.beginPath();
      ctx.fillStyle = `rgba(${150 + 100 * s.z | 0}, ${200 + 55 * s.z | 0}, 255, ${twinkle})`;
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX; pointer.y = e.clientY;
  });
  resize();

  let last = 0;
  function loop(ts) {
    const t = ts || 0;
    drawStars(t);
    last = t;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // HUD: Stardate
  function updateStardate() {
    const el = document.getElementById('stardate');
    if (!el) return;
    const d = new Date();
    const y = 2634; // fixed cinematic year
    const doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
    const h = String(d.getUTCHours()).padStart(2, '0');
    const m = String(d.getUTCMinutes()).padStart(2, '0');
    const s = String(d.getUTCSeconds()).padStart(2, '0');
    el.textContent = `STARDATE ${y}.${String(doy).padStart(3, '0')}:${h}${m}${s}`;
  }
  setInterval(updateStardate, 1000);
  updateStardate();

  // Controls and Console
  const logEl = document.getElementById('log');
  function log(tag, msg) {
    if (!logEl) return;
    const li = document.createElement('li');
    li.innerHTML = `<span class="time">${timeStamp()}</span><span class="tag">${tag}</span>${msg}`;
    logEl.prepend(li);
  }

  const btnInit = document.getElementById('btn-init');
  const btnScan = document.getElementById('btn-scan');
  const entropyEl = document.getElementById('stat-entropy');
  const uplinkEl = document.getElementById('stat-uplink');
  const latencyEl = document.getElementById('stat-latency');
  const shieldEl = document.getElementById('stat-shield');

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  let uplink = 0;
  let shield = 100;

  function animateInit() {
    log('INIT', 'Boot sequence engaged. Allocating quantum cache...');
    let step = 0;
    const seq = setInterval(() => {
      step++;
      const e = rand(0, 1);
      entropyEl.textContent = e.toFixed(2);
      if (step % 3 === 0) log('SYS', 'Recalibrating photon lattice...');
      if (step > 25) {
        clearInterval(seq);
        log('OK', 'All clusters synchronized. Ready.');
      }
    }, 120);
  }

  function animateScan() {
    log('SCAN', 'Initiating deep-sector sweep...');
    let p = 0;
    const start = performance.now();
    const t = setInterval(() => {
      p = clamp(p + rand(4, 11), 0, 100);
      uplink = p;
      uplinkEl.textContent = `${p.toFixed(0)}%`;
      const lat = clamp(1 + (performance.now() - start) / 800, 1, 42);
      latencyEl.textContent = `${lat.toFixed(1)} ms`;
      if (Math.random() < 0.12) {
        shield = clamp(shield - rand(0.1, 0.6), 0, 100);
        shieldEl.textContent = `${shield.toFixed(0)}%`;
        log('WARN', 'Minor turbulences in subspace channel.');
      }
      if (p >= 100) {
        clearInterval(t);
        log('OK', 'Deep scan complete. No anomalies detected.');
      }
    }, 180);
  }

  btnInit && btnInit.addEventListener('click', animateInit);
  btnScan && btnScan.addEventListener('click', animateScan);
})();
