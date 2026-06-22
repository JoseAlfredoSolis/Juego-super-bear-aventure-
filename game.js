(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  // Logical resolution (canvas is scaled by CSS to fit the wrapper).
  const W = canvas.width;
  const H = canvas.height;
  const GROUND_Y = H - 60;

  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const finalScoreEl = document.getElementById("final-score");
  const newRecordEl = document.getElementById("new-record");
  const startOverlay = document.getElementById("overlay");
  const gameoverOverlay = document.getElementById("gameover");
  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");

  const BEST_KEY = "superBearBest";
  let best = Number(localStorage.getItem(BEST_KEY) || 0);
  bestEl.textContent = `Récord: ${best} m`;

  // Game state
  const STATE = { MENU: 0, PLAYING: 1, OVER: 2 };
  let state = STATE.MENU;

  const player = {
    x: 90,
    y: GROUND_Y,
    w: 46,
    h: 52,
    vy: 0,
    onGround: true,
    jumps: 0,
    ducking: false,
  };

  const GRAVITY = 2200;       // px/s^2
  const JUMP_VELOCITY = -780; // px/s
  const MAX_JUMPS = 2;

  let obstacles = [];
  let clouds = [];
  let speed = 320;            // px/s, grows over time
  let distance = 0;           // metres
  let spawnTimer = 0;
  let nextSpawn = 1.1;
  let legPhase = 0;

  function reset() {
    player.y = GROUND_Y;
    player.vy = 0;
    player.onGround = true;
    player.jumps = 0;
    player.ducking = false;
    obstacles = [];
    speed = 320;
    distance = 0;
    spawnTimer = 0;
    nextSpawn = 1.1;
    legPhase = 0;
    seedClouds();
  }

  function seedClouds() {
    clouds = [];
    for (let i = 0; i < 5; i++) {
      clouds.push({
        x: Math.random() * W,
        y: 30 + Math.random() * 140,
        scale: 0.6 + Math.random() * 0.9,
        speed: 20 + Math.random() * 30,
      });
    }
  }

  // ---- Input ----
  function jump() {
    if (state !== STATE.PLAYING) return;
    if (player.jumps < MAX_JUMPS) {
      player.vy = JUMP_VELOCITY;
      player.onGround = false;
      player.jumps++;
    }
  }

  function setDuck(on) {
    if (state !== STATE.PLAYING) return;
    player.ducking = on;
  }

  document.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    switch (e.code) {
      case "Space":
      case "ArrowUp":
      case "KeyW":
        e.preventDefault();
        if (state === STATE.PLAYING) jump();
        else if (state === STATE.MENU) startGame();
        else if (state === STATE.OVER) startGame();
        break;
      case "ArrowDown":
      case "KeyS":
        e.preventDefault();
        setDuck(true);
        break;
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.code === "ArrowDown" || e.code === "KeyS") setDuck(false);
  });

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (state === STATE.PLAYING) jump();
    else startGame();
  });

  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);

  function startGame() {
    reset();
    state = STATE.PLAYING;
    startOverlay.classList.add("hidden");
    gameoverOverlay.classList.add("hidden");
  }

  function gameOver() {
    state = STATE.OVER;
    const score = Math.floor(distance);
    finalScoreEl.textContent = score;
    if (score > best) {
      best = score;
      localStorage.setItem(BEST_KEY, String(best));
      bestEl.textContent = `Récord: ${best} m`;
      newRecordEl.style.display = "block";
    } else {
      newRecordEl.style.display = "none";
    }
    gameoverOverlay.classList.remove("hidden");
  }

  // ---- Obstacles ----
  function spawnObstacle() {
    // Ground obstacle or flying bird (must duck).
    const flying = Math.random() < 0.32 && distance > 60;
    if (flying) {
      obstacles.push({
        type: "bird",
        x: W + 20,
        y: GROUND_Y - 70 - Math.random() * 20,
        w: 44,
        h: 30,
        wing: 0,
      });
    } else {
      const tall = Math.random() < 0.4;
      const w = tall ? 28 : 34 + Math.random() * 22;
      const h = tall ? 56 + Math.random() * 24 : 34;
      obstacles.push({
        type: "rock",
        x: W + 20,
        y: GROUND_Y - h,
        w,
        h,
      });
    }
  }

  // ---- Update ----
  function update(dt) {
    if (state !== STATE.PLAYING) {
      // Drift clouds even in menu for life.
      for (const c of clouds) {
        c.x -= c.speed * 0.4 * dt;
        if (c.x < -120) c.x = W + 60;
      }
      return;
    }

    speed += 9 * dt;                       // gradual ramp
    distance += (speed * dt) / 10;         // 10 px ~= 1 m
    legPhase += speed * dt * 0.02;

    // Player physics
    player.vy += GRAVITY * dt;
    player.y += player.vy * dt;
    if (player.y >= GROUND_Y) {
      player.y = GROUND_Y;
      player.vy = 0;
      player.onGround = true;
      player.jumps = 0;
    }

    const curH = player.ducking && player.onGround ? player.h * 0.6 : player.h;

    // Clouds
    for (const c of clouds) {
      c.x -= c.speed * dt;
      if (c.x < -120) {
        c.x = W + 60;
        c.y = 30 + Math.random() * 140;
        c.scale = 0.6 + Math.random() * 0.9;
      }
    }

    // Spawning
    spawnTimer += dt;
    if (spawnTimer >= nextSpawn) {
      spawnTimer = 0;
      spawnObstacle();
      const base = Math.max(0.55, 1.25 - distance / 1500);
      nextSpawn = base + Math.random() * 0.7;
    }

    // Move obstacles + collision
    const px = player.x;
    const py = player.y - curH;
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      o.x -= speed * dt;
      if (o.type === "bird") o.wing += dt * 12;
      if (o.x + o.w < -10) {
        obstacles.splice(i, 1);
        continue;
      }
      // AABB collision with a little forgiveness margin.
      const m = 6;
      if (
        px + player.w - m > o.x &&
        px + m < o.x + o.w &&
        py + m < o.y + o.h &&
        py + curH - m > o.y
      ) {
        gameOver();
      }
    }

    scoreEl.textContent = `${Math.floor(distance)} m`;
  }

  // ---- Rendering ----
  function drawCloud(c) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(c.scale, c.scale);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.arc(22, 6, 22, 0, Math.PI * 2);
    ctx.arc(48, 0, 16, 0, Math.PI * 2);
    ctx.arc(24, -10, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawGround() {
    ctx.fillStyle = "#5a8f3c";
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = "#3f6e29";
    ctx.fillRect(0, GROUND_Y, W, 8);
    // moving dashes for a sense of speed
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    const offset = (distance * 10) % 60;
    for (let x = -offset; x < W; x += 60) {
      ctx.fillRect(x, GROUND_Y + 26, 28, 4);
    }
  }

  function drawBear() {
    const ducking = player.ducking && player.onGround;
    const h = ducking ? player.h * 0.6 : player.h;
    const w = player.w;
    const x = player.x;
    const y = player.y - h;

    ctx.save();
    ctx.translate(x, y);

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(w / 2, player.y - y + 4, w / 2, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const brown = "#8b5a2b";
    const darkBrown = "#6b421f";

    // legs (animated when on ground)
    ctx.fillStyle = darkBrown;
    if (player.onGround) {
      const swing = Math.sin(legPhase) * 6;
      ctx.fillRect(8, h - 12, 10, 12 + swing);
      ctx.fillRect(w - 18, h - 12, 10, 12 - swing);
    } else {
      ctx.fillRect(8, h - 10, 10, 10);
      ctx.fillRect(w - 18, h - 10, 10, 10);
    }

    // body
    ctx.fillStyle = brown;
    roundRect(0, ducking ? 6 : 10, w, h - (ducking ? 14 : 14), 12);
    ctx.fill();

    // belly
    ctx.fillStyle = "#c89b6a";
    roundRect(w / 2 - 9, h / 2, 18, h / 2 - 12, 8);
    ctx.fill();

    // head
    const headR = ducking ? 13 : 16;
    const hx = w - 6;
    const hy = ducking ? 8 : 6;
    ctx.fillStyle = brown;
    ctx.beginPath();
    ctx.arc(hx, hy + headR, headR, 0, Math.PI * 2);
    ctx.fill();

    // ears
    ctx.beginPath();
    ctx.arc(hx - 8, hy + 2, 5, 0, Math.PI * 2);
    ctx.arc(hx + 8, hy + 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // snout
    ctx.fillStyle = "#c89b6a";
    ctx.beginPath();
    ctx.arc(hx + 8, hy + headR + 3, 6, 0, Math.PI * 2);
    ctx.fill();

    // nose
    ctx.fillStyle = "#3a2414";
    ctx.beginPath();
    ctx.arc(hx + 11, hy + headR + 2, 2.4, 0, Math.PI * 2);
    ctx.fill();

    // eye
    ctx.beginPath();
    ctx.arc(hx + 4, hy + headR - 3, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawObstacle(o) {
    if (o.type === "bird") {
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.fillStyle = "#37474f";
      // body
      ctx.beginPath();
      ctx.ellipse(o.w / 2, o.h / 2, 14, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      // wings flap
      const flap = Math.sin(o.wing) * 10;
      ctx.beginPath();
      ctx.moveTo(o.w / 2, o.h / 2);
      ctx.lineTo(o.w / 2 - 16, o.h / 2 - flap);
      ctx.lineTo(o.w / 2 - 2, o.h / 2 + 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(o.w / 2, o.h / 2);
      ctx.lineTo(o.w / 2 + 18, o.h / 2 - flap);
      ctx.lineTo(o.w / 2 + 2, o.h / 2 + 2);
      ctx.fill();
      // beak
      ctx.fillStyle = "#ffb703";
      ctx.beginPath();
      ctx.moveTo(o.w / 2 + 12, o.h / 2 - 2);
      ctx.lineTo(o.w / 2 + 22, o.h / 2);
      ctx.lineTo(o.w / 2 + 12, o.h / 2 + 3);
      ctx.fill();
      ctx.restore();
    } else {
      // rock / stump
      ctx.fillStyle = "#6d4c41";
      roundRect(o.x, o.y, o.w, o.h, 6);
      ctx.fill();
      ctx.fillStyle = "#5d4037";
      ctx.fillRect(o.x + o.w * 0.2, o.y + 6, o.w * 0.2, o.h - 12);
    }
  }

  function roundRect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    // hills backdrop
    ctx.fillStyle = "#9ccc65";
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    const hillOffset = (distance * 2) % 400;
    for (let x = -hillOffset; x <= W + 200; x += 200) {
      ctx.quadraticCurveTo(x + 100, GROUND_Y - 80, x + 200, GROUND_Y);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    for (const c of clouds) drawCloud(c);
    drawGround();
    for (const o of obstacles) drawObstacle(o);
    drawBear();
  }

  // ---- Loop ----
  let last = performance.now();
  function loop(now) {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.05) dt = 0.05; // clamp big frame gaps
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  seedClouds();
  requestAnimationFrame(loop);
})();
