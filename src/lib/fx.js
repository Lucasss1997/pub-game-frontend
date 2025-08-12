// Lightweight confetti (no deps)
export function confetti(durationMs = 1200) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -Math.random() * 40,
    r: Math.random() * 6 + 2,
    c: `hsl(${Math.random() * 360}, 90%, 60%)`,
    s: Math.random() * 2 + 1,
  }));

  let start = performance.now();
  function tick(now) {
    const t = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.s * 3;
      p.x += Math.sin((p.y + t) / 25) * 0.8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.fill();
    });
    if (t < durationMs) requestAnimationFrame(tick);
    else document.body.removeChild(canvas);
  }
  requestAnimationFrame(tick);
}

// Tiny WebAudio “ping”
export async function ping() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine'; o.frequency.setValueAtTime(880, ctx.currentTime);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    o.start(); o.stop(ctx.currentTime + 0.28);
  } catch (_) {}
}

// Gentle vibration (if supported)
export function vibe(ms = 30) {
  if (navigator.vibrate) navigator.vibrate(ms);
}