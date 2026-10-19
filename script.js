(() => {
  const canvas = document.getElementById('cyber-canvas');
  const ctx = canvas.getContext('2d');
  const introScreen = document.getElementById('intro-screen');
  const mainSite = document.getElementById('main-site');
  const enterBtn = document.getElementById('enter-btn');
  const replayBtn = document.getElementById('replay-intro-btn');
  const logoStage = document.getElementById('logo-stage');
  const logoSpinner = document.getElementById('logo-spinner');
  const hudTelemetry = document.getElementById('hud-telemetry');
  const hudStatusText = document.getElementById('hud-status-text');
  const spinChips = document.querySelectorAll('.hud-chip');
  const copyCaBtn = document.getElementById('copy-ca-btn');
  const copyCaText = document.getElementById('copy-ca-text');
  const caValueEl = document.getElementById('ca-value');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Starfield / Cyber Particle State
  const STAR_COUNT = 260;
  const stars = [];
  let baseSpeed = 1.6;
  let targetSpeed = 1.6;
  let isWarping = false;
  let mouseX = 0;
  let mouseY = 0;

  function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * width,
        pz: 0,
        color:
          Math.random() > 0.35
            ? '#00f0ff'
            : Math.random() > 0.5
            ? '#0077ff'
            : '#ffffff',
        size: Math.random() * 1.8 + 0.5,
      });
      stars[i].pz = stars[i].z;
    }
  }

  initStars();

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Mouse Parallax for Canvas & 3D Stage
  window.addEventListener('mousemove', (e) => {
    const normX = (e.clientX / width - 0.5) * 2;
    const normY = (e.clientY / height - 0.5) * 2;
    mouseX = normX * 35;
    mouseY = normY * 35;

    if (!isWarping && logoStage) {
      const tiltX = -normY * 10;
      const tiltY = normX * 10;
      logoStage.style.transform = `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
    }
  });

  // Render Loop for 3D Starfield & Warp Trails
  function animateStars() {
    baseSpeed += (targetSpeed - baseSpeed) * 0.08;

    ctx.fillStyle = isWarping
      ? 'rgba(1, 4, 12, 0.22)'
      : 'rgba(1, 4, 10, 0.42)';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2 + mouseX;
    const cy = height / 2 + mouseY;

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.pz = s.z;
      s.z -= baseSpeed * 4;

      if (s.z <= 1) {
        s.x = (Math.random() - 0.5) * width * 2;
        s.y = (Math.random() - 0.5) * height * 2;
        s.z = width;
        s.pz = s.z;
      }

      const sx = (s.x / s.z) * (width * 0.6) + cx;
      const sy = (s.y / s.z) * (height * 0.6) + cy;
      const px = (s.x / s.pz) * (width * 0.6) + cx;
      const py = (s.y / s.pz) * (height * 0.6) + cy;

      const alpha = Math.min(1, (1 - s.z / width) * 1.3);
      const radius = Math.max(0.4, (1 - s.z / width) * s.size * 2.2);

      ctx.beginPath();
      ctx.strokeStyle = s.color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = isWarping ? radius * 1.4 : radius;
      ctx.moveTo(px, py);
      ctx.lineTo(sx, sy);
      ctx.stroke();

      if (!isWarping && alpha > 0.6) {
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(sx, sy, radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(animateStars);
  }

  animateStars();

  // Subtle Web Audio Synth for Futuristic UI Feedback
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playHoverSound() {
    const ctxAudio = getAudioCtx();
    if (!ctxAudio) return;
    const osc = ctxAudio.createOscillator();
    const gain = ctxAudio.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, ctxAudio.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctxAudio.currentTime + 0.08);

    gain.gain.setValueAtTime(0.04, ctxAudio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctxAudio.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(ctxAudio.destination);
    osc.start();
    osc.stop(ctxAudio.currentTime + 0.09);
  }

  function playWarpSound() {
    const ctxAudio = getAudioCtx();
    if (!ctxAudio) return;
    const now = ctxAudio.currentTime;

    const osc1 = ctxAudio.createOscillator();
    const gain1 = ctxAudio.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(90, now);
    osc1.frequency.exponentialRampToValueAtTime(640, now + 0.85);

    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    const osc2 = ctxAudio.createOscillator();
    const gain2 = ctxAudio.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(140, now);
    osc2.frequency.exponentialRampToValueAtTime(38, now + 0.8);

    gain2.gain.setValueAtTime(0.18, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc1.connect(gain1);
    gain1.connect(ctxAudio.destination);
    osc2.connect(gain2);
    gain2.connect(ctxAudio.destination);

    osc1.start(now);
    osc1.stop(now + 0.9);
    osc2.start(now);
    osc2.stop(now + 0.85);
  }

  // Live Telemetry Clock
  function updateTelemetry() {
    if (!hudTelemetry) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const ms = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0');
    hudTelemetry.textContent = `${hh}:${mm}:${ss}.${ms} // SYNC 100%`;
  }
  setInterval(updateTelemetry, 75);
  updateTelemetry();

  // Spin Mode Switcher in Bottom HUD
  spinChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      playHoverSound();
      spinChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');

      const mode = chip.dataset.spin;
      logoSpinner.classList.remove('mode-orbit', 'mode-pulse');
      if (mode === 'orbit') {
        logoSpinner.classList.add('mode-orbit');
        hudStatusText.textContent = 'GYRO ORBITAL MATRIX : ENGAGED';
      } else if (mode === 'pulse') {
        logoSpinner.classList.add('mode-pulse');
        hudStatusText.textContent = 'HOLOGRAPHIC LOCK : STABILIZED';
      } else {
        hudStatusText.textContent = 'QUANTUM ORBITAL CORE : ACTIVE';
      }
    });
  });

  // Hovering Enter Button speeds up starfield slightly
  enterBtn.addEventListener('mouseenter', () => {
    if (!isWarping) {
      targetSpeed = 5.5;
      playHoverSound();
      hudStatusText.textContent = 'READY FOR HYPERSPACE INITIALIZATION';
    }
  });

  enterBtn.addEventListener('mouseleave', () => {
    if (!isWarping) {
      targetSpeed = 1.6;
      hudStatusText.textContent = 'QUANTUM ORBITAL CORE : ACTIVE';
    }
  });

  // Trigger Enter Transition
  function triggerEnter() {
    if (isWarping) return;
    isWarping = true;
    targetSpeed = 28;
    playWarpSound();

    hudStatusText.textContent = 'WARP DRIVE ENGAGED // ACCESS GRANTED';
    logoSpinner.style.animationDuration = '1.2s';

    setTimeout(() => {
      introScreen.classList.add('warp-exit');
      mainSite.classList.remove('hidden');
      mainSite.setAttribute('aria-hidden', 'false');
    }, 550);
  }

  enterBtn.addEventListener('click', triggerEnter);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !isWarping) {
      triggerEnter();
    }
  });

  // Replay Intro Button
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      playHoverSound();
      isWarping = false;
      targetSpeed = 1.6;
      logoSpinner.style.animationDuration = '';
      hudStatusText.textContent = 'QUANTUM ORBITAL CORE : ACTIVE';
      mainSite.classList.add('hidden');
      mainSite.setAttribute('aria-hidden', 'true');
      introScreen.classList.remove('warp-exit');
    });
  }

  // Copy Contract Address (CA) Buttons (Intro Screen & Main Site)
  const introCopyCaBtn = document.getElementById('intro-copy-ca-btn');
  const introCopyCaText = document.getElementById('intro-copy-ca-text');
  const introCaValueEl = document.getElementById('intro-ca-value');

  if (introCopyCaBtn && introCaValueEl) {
    introCopyCaBtn.addEventListener('click', async () => {
      playHoverSound();
      const textToCopy = introCaValueEl.textContent.trim();
      try {
        await navigator.clipboard.writeText(textToCopy);
      } catch {
        // Fallback if clipboard permission denied
      }
      introCopyCaText.textContent = 'COPIED ✓';
      introCopyCaBtn.style.background = '#00ff9d';
      introCopyCaBtn.style.color = '#01040a';
      setTimeout(() => {
        introCopyCaText.textContent = 'COPY';
        introCopyCaBtn.style.background = '';
        introCopyCaBtn.style.color = '';
      }, 2000);
    });
  }

  if (copyCaBtn && caValueEl) {
    copyCaBtn.addEventListener('click', async () => {
      playHoverSound();
      const textToCopy = caValueEl.textContent.trim();
      try {
        await navigator.clipboard.writeText(textToCopy);
      } catch {
        // Fallback if clipboard permission denied
      }
      copyCaText.textContent = 'COPIED ✓';
      copyCaBtn.style.background = '#00ff9d';
      copyCaBtn.style.color = '#01040a';
      setTimeout(() => {
        copyCaText.textContent = 'COPY CA';
        copyCaBtn.style.background = '';
        copyCaBtn.style.color = '';
      }, 2000);
    });
  }
})();
