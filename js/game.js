// Super Bear Adventure - Gameplay loop, level flow, the 3D diorama renderer and the HUD.
// Loaded as a classic script; all top-level names are shared with the
// other files in load order (see index.html).

// --- Gameplay Scene State ---
let player, enemies, items, goalPos, levelData, gameTimer;
let hitFlash = 0;   // white/red full-screen flash on damage

function startLevel() {
  levelData = mkLevel(gs.world, gs.level);
  player = mkPlayer();
  player.lives = gs.lives;
  enemies = mkEnemies(levelData.enemies);
  items = mkCollectibles(levelData.coins, levelData.stars, levelData.powerups);
  goalPos = levelData.goal;
  gameTimer = 0;
  clearInfo.startCoins = gs.coins;
  particles = []; floaters = []; hitFlash = 0;
  shake.t = 0; shake.mag = 0;
  camUpdate(player.x, player.y, levelData.levelW, true);
  cam3.x = player.x + PLAYER_W/2;
  cam3.y = player.y + PLAYER_H/2 + D3.eye;
}

function updateGameplay(dt) {
  gameTimer += dt;
  const ld = levelData;

  updatePlayer(player, dt, ld.platforms, ld.levelW);
  for (const e of enemies) updateEnemy(e, dt, ld.platforms, player.x, player.y, ld.levelW);
  updateParticles(dt);
  updateShake(dt);
  if (hitFlash > 0) hitFlash -= dt*3.2;

  // Collectibles
  for (const it of items) {
    if (it.taken) continue;
    if (!rectOverlap(player.x,player.y,player.w,player.h, it.x,it.y,it.w,it.h)) continue;
    it.taken = true;
    const icx = it.x + it.w/2, icy = it.y + it.h/2;
    if (it.type==='coin')  {
      gs.score+=COIN_PTS; gs.coins++;
      burst(icx, icy, 10, { color:['#ffe98a','#ffc72c','#ffffff'], speed:130, spread:Math.PI*2, size:3.4, life:0.45, grav:220, drag:0.9, shape:'spark' });
      spawnFloat(icx, icy-6, `+${COIN_PTS}`, '#ffd94e', 20);
    }
    else if (it.type==='star') {
      gs.score+=STAR_PTS;
      burst(icx, icy, 26, { color:['#fff3b0','#ffc72c','#ffffff'], speed:210, spread:Math.PI*2, size:5, life:0.7, grav:150, drag:0.9, shape:'star' });
      spawnFloat(icx, icy-8, `+${STAR_PTS}`, '#fff0a0', 26);
      addShake(3, 0.15);
    }
    else {
      player.power=it.type; player.powerTimer=10; if(it.type==='djump')player.djumpUsed=false;
      const pc = it.type==='djump'?'#7ce8ff':it.type==='speed'?'#8dff9c':'#ffe37a';
      burst(icx, icy, 22, { color:[pc,'#ffffff'], speed:190, spread:Math.PI*2, size:4.4, life:0.6, grav:0, drag:0.88, shape:'spark' });
      spawnFloat(icx, icy-8, it.type==='djump'?'DOUBLE JUMP!':it.type==='speed'?'SPEED!':'INVINCIBLE!', pc, 20);
      addShake(3, 0.14);
    }
  }

  // Enemy collisions
  if (player.invTimer<=0 && player.respawnTimer<=0 && (player.power!=='inv')) {
    for (const e of enemies) {
      if (!e.active) continue;
      if (!rectOverlap(player.x,player.y,player.w,player.h, e.x,e.y,e.w,e.h)) continue;
      // Stomp?
      const stomp = player.vy>=6 && (player.y+player.h) <= e.y+(e.h/2+12);
      const ecx = e.x+e.w/2, ecy = e.y+e.h/2;
      if (stomp) {
        player.vy = STOMP_BOUNCE;
        if (e.type==='boss') {
          e.hp--;
          e.hitFlash=0.25;
          e.range = Math.floor(e.range*1.15);
          burst(ecx, ecy, 26, { color:['#ff8a4a','#ffd24a','#ffffff'], speed:250, spread:Math.PI*2, size:5.5, life:0.6, grav:420, drag:0.92 });
          addShake(11, 0.3); hitFlash = 0.5;
          if (e.hp<=0) {
            e.active=false; gs.score+=BOSS_PTS;
            burst(ecx, ecy, 60, { color:['#ffd24a','#ff5a3a','#ffffff','#ffa02a'], speed:340, spread:Math.PI*2, size:7, life:1.0, grav:400, drag:0.93 });
            spawnFloat(ecx, ecy-20, `+${BOSS_PTS}`, '#ffd24a', 34);
            addShake(20, 0.6);
          } else { gs.score+=100; spawnFloat(ecx, ecy-20, '+100', '#ffb84a', 24); }
        } else {
          e.active=false; gs.score+=ENEMY_PTS;
          burst(ecx, ecy, 18, { color: e.type==='chaser' ? ['#ff8a5a','#d63a1a','#ffffff'] : ['#c88a3e','#7b4a1c','#ffffff'], speed:200, spread:Math.PI*2, size:5, life:0.55, grav:520, drag:0.9, shape:'square' });
          spawnFloat(ecx, ecy-12, `+${ENEMY_PTS}`, '#ffe08a', 22);
          addShake(5, 0.16);
        }
      } else {
        gs.lives--; player.lives=gs.lives;
        burst(player.x+PLAYER_W/2, player.y+PLAYER_H/2, 24, { color:['#ff5a5a','#ffb0b0','#ffffff'], speed:250, spread:Math.PI*2, size:5, life:0.6, grav:400, drag:0.9, shape:'spark' });
        addShake(14, 0.35); hitFlash = 1;
        if (gs.lives<=0) { gs.scene='gameover'; return; }
        respawnPlayer();
      }
    }
  }

  // Pit death
  if (player.y > ld.levelW) { // fallback
    gs.lives--; player.lives=gs.lives;
    if (gs.lives<=0) { gs.scene='gameover'; return; }
    respawnPlayer();
  }
  if (player.y > 800) {
    gs.lives--; player.lives=gs.lives;
    addShake(10, 0.3); hitFlash = 0.8;
    if (gs.lives<=0) { gs.scene='gameover'; return; }
    respawnPlayer();
  }

  // Goal
  if (rectOverlap(player.x,player.y,player.w,player.h, goalPos[0],goalPos[1],40,80)) {
    gs.score += LEVEL_PTS;
    if (gs.score > gs.highScore) gs.highScore = gs.score;
    gs.levelDone[gs.world][gs.level] = true;
    finishLevel();
    return;
  }

  camUpdate(player.x, player.y, ld.levelW);
  if (gs.score > gs.highScore) gs.highScore = gs.score;

  // Pause / view toggle
  if (pressed('Escape')||pressed('KeyP')) { gs.scene='pause'; pauseSel=0; }
  if (pressed('KeyV')) opts.render3d = !opts.render3d;
}

function respawnPlayer() {
  player.x = player.cpX; player.y = player.cpY - 4;
  player.vx = 0; player.vy = 0;
  player.coyote = 0; player.jumpBuf = 0;
  player.invTimer = 2; player.respawnTimer = 1.5;
  camUpdate(player.x, player.y, levelData.levelW, true);
  cam3.x = player.x + PLAYER_W/2;
  cam3.y = player.y + PLAYER_H/2 + D3.eye;
}

/** Reached the flag: bank the run's stats and show the level-clear card. */
function finishLevel() {
  const key = `${gs.world}-${gs.level}`;
  const prev = gs.best[key];
  clearInfo = {
    time: gameTimer,
    coins: gs.coins - clearInfo.startCoins,
    startCoins: 0,
    record: prev === undefined || gameTimer < prev,
    prevBest: prev,
    lastOfWorld: gs.level === 2,
    unlocked: gs.level === 2 && gs.world < 2 && !gs.worldUnlocked[gs.world+1],
  };
  if (clearInfo.record) gs.best[key] = gameTimer;
  burst(player.x+PLAYER_W/2, player.y+PLAYER_H/2, 46,
    { color:['#ffd24a','#8dff9c','#ffffff','#7ce8ff'], speed:300, spread:Math.PI*2, size:6, life:0.9, grav:300, drag:0.93, shape:'star' });
  clearT = 0; clearSel = 0;
  gs.scene = 'levelclear';
}

function advanceLevel() {
  // unlock next world
  if (gs.level===2) {
    if (gs.world<2) gs.worldUnlocked[gs.world+1]=true;
    gs.scene='worldmap'; wmSel=gs.world; wmLvl=0;
  } else {
    gs.level++;
    startLevel();
    gs.scene='gameplay';
  }
}

// --- Level Clear ---
let clearInfo = { time:0, coins:0, startCoins:0, record:false, lastOfWorld:false, unlocked:false };
let clearT = 0, clearSel = 0;
const clearItems = ['CONTINUAR', 'REPETIR NIVEL', 'MAPA DE MUNDOS'];

function fmtTime(s) {
  const m = Math.floor(s/60), r = s - m*60;
  return `${m}:${r.toFixed(2).padStart(5,'0')}`;
}

function updateLevelClear(dt) {
  clearT += dt;
  updateParticles(dt);
  if (pressed('ArrowUp')||pressed('ArrowLeft'))    clearSel = (clearSel-1+3)%3;
  if (pressed('ArrowDown')||pressed('ArrowRight')) clearSel = (clearSel+1)%3;
  if (pressed('Enter')||pressed('Space')) {
    if (clearSel === 0) advanceLevel();
    else if (clearSel === 1) { startLevel(); gs.scene='gameplay'; }
    else { gs.scene='worldmap'; wmSel=gs.world; wmLvl=gs.level; }
  }
}

function drawLevelClear(t, dt) {
  drawWorld(gameTimer, 0);
  ctx.fillStyle = 'rgba(4,10,14,.72)'; ctx.fillRect(0,0,W,H);

  // confetti
  for (let i=0;i<70;i++) {
    const ph = ((clearT*0.32 + i*0.0143) % 1);
    const cx2 = ((i*173) % W) + Math.sin(clearT*2 + i)*30;
    ctx.save();
    ctx.translate(cx2, ph*H*1.1 - 40);
    ctx.rotate(clearT*3 + i);
    ctx.globalAlpha = 0.85*(1-ph);
    ctx.fillStyle = ['#ffd24a','#8dff9c','#7ce8ff','#ff8a9c','#ffffff'][i%5];
    ctx.fillRect(-4,-3,8,6);
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  const bw = 620, bh = 470, bx = W/2-bw/2, by = H/2-bh/2-6;
  ctx.fillStyle = vgrad(0, by, 0, by+bh, [[0,'rgba(22,42,32,.96)'],[1,'rgba(8,18,14,.97)']]);
  rrPath(bx, by, bw, bh, 22); ctx.fill();
  strokeRR(bx, by, bw, bh, 22, '#8dff9c', 3);
  ctx.fillStyle='rgba(255,255,255,.05)'; rrPath(bx+2, by+2, bw-4, bh*0.24, 20); ctx.fill();

  titleText('¡NIVEL SUPERADO!', W/2, by+72, 42, t);
  textOut(`MUNDO ${gs.world+1} · NIVEL ${gs.level+1}${clearInfo.lastOfWorld ? '  ·  JEFE DERROTADO' : ''}`,
          W/2, by+104, 'rgba(215,244,225,.85)', 15, 'center', 'rgba(0,0,0,.8)', 4);

  // the character takes a bow
  ctx.save();
  ctx.translate(bx+92, by+232);
  ctx.scale(2.0, 2.0);
  drawChar(curChar(), Math.sin(t*3)*0.5, 1, 0, null, 0, t);
  ctx.restore();
  ell(bx+92, by+236, 40, 9, 'rgba(0,0,0,.3)');

  const rows = [
    ['TIEMPO',  fmtTime(clearInfo.time), clearInfo.record ? '#ffd44e' : '#eaf6ff'],
    ['MONEDAS', `${clearInfo.coins}`, '#ffd94e'],
    ['PUNTOS',  `${gs.score}`, '#ffffff'],
    ['VIDAS',   `${gs.lives}`, '#ff8a9c'],
  ];
  rows.forEach(([k,v,col], i) => {
    const ry = by+156 + i*46;
    fillRR(bx+186, ry-26, 400, 38, 10, 'rgba(255,255,255,.07)');
    textOut(k, bx+204, ry, 'rgba(190,214,232,.9)', 15, 'left', 'rgba(0,0,0,.8)', 4);
    textOut(v, bx+568, ry, col, 20, 'right', 'rgba(0,0,0,.8)', 5);
  });
  if (clearInfo.record) {
    textOut('¡NUEVO RÉCORD DE TIEMPO!', W/2+92, by+364, '#ffd44e', 16, 'center', 'rgba(0,0,0,.85)', 5);
  } else if (clearInfo.prevBest !== undefined) {
    textOut(`Mejor: ${fmtTime(clearInfo.prevBest)}`, W/2+92, by+364, 'rgba(190,214,232,.75)', 14, 'center', 'rgba(0,0,0,.8)', 4);
  }
  if (clearInfo.unlocked) {
    textOut(`¡MUNDO ${gs.world+2} DESBLOQUEADO!`, W/2, by+392, '#8dff9c', 18, 'center', 'rgba(0,0,0,.85)', 5);
  }

  for (let i=0;i<clearItems.length;i++) {
    const cxb = W/2 + (i-1)*212;
    menuButton(cxb, by+bh+40, 200, 48, clearItems[i], i===clearSel, t);
  }
  hintBar('↑ ↓ / ← →  Elegir     ENTER  Confirmar');
}

// --- 3D diorama renderer ---
// The simulation stays strictly 2D; this is a second *view* of the same
// world, drawn with a perspective projection and no external libraries.
// Level slabs become extruded boxes; actors are billboarded with the very
// same artwork the 2D view uses, scaled by their perspective factor.
const D3 = { depth: 300, dist: 760, fov: 780, eye: -70, actorZ: 96 };
const cam3 = { x: 0, y: 0 };

function p3(x, y, z) {
  const s = D3.fov / (z + D3.dist);
  return { x: W/2 + (x - cam3.x) * s, y: H/2 + (y - cam3.y) * s, s };
}
function quad3(a, b, c, d, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y);
  ctx.closePath(); ctx.fill();
}
/** One extruded slab. Back faces are skipped; the near face is drawn last. */
function box3(x, y, w, h, z0, z1, cols) {
  const fA = p3(x, y, z0), fB = p3(x+w, y, z0), fC = p3(x+w, y+h, z0), fD = p3(x, y+h, z0);
  const bA = p3(x, y, z1), bB = p3(x+w, y, z1), bC = p3(x+w, y+h, z1), bD = p3(x, y+h, z1);
  if (y > cam3.y)     quad3(bA, bB, fB, fA, cols.top);      // looking down onto it
  if (y + h < cam3.y) quad3(fD, fC, bC, bD, cols.bottom);   // looking up at it
  if (x > cam3.x)     quad3(bA, fA, fD, bD, cols.side);     // its left flank
  if (x + w < cam3.x) quad3(fB, bB, bC, fC, cols.side);     // its right flank
  quad3(fA, fB, fC, fD, cols.front);
  // crisp lip along the walkable edge so landings stay readable
  ctx.strokeStyle = cols.edge; ctx.lineWidth = Math.max(1, 2 * fA.s);
  ctx.beginPath(); ctx.moveTo(fA.x, fA.y); ctx.lineTo(fB.x, fB.y); ctx.stroke();
}
const PLAT3D = [
  { front:'#5d3d21', top:'#57bf46', side:'#3d2716', bottom:'#20140a', edge:'#8ce06a' },
  { front:'#4b5468', top:'#8a99b2', side:'#272d3a', bottom:'#161a22', edge:'#b9c8de' },
  { front:'#5f7592', top:'#eef6ff', side:'#3d4c66', bottom:'#26303f', edge:'#ffffff' },
];
/** Draws 2D artwork at a world position, scaled into the perspective. */
function billboard3(wx, wy, z, drawFn) {
  const p = p3(wx, wy, z);
  if (p.x < -320 || p.x > W + 320) return;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s, p.s);
  drawFn(p.s);
  ctx.restore();
}

function drawWorld3D(t, dt) {
  const ld = levelData;
  // camera trails the player
  const tx = player.x + PLAYER_W/2;
  const ty = player.y + PLAYER_H/2 + D3.eye;
  cam3.x = lerp(cam3.x, tx, 0.16);
  cam3.y = lerp(cam3.y, ty, 0.10);
  if (shake.t > 0 && opts.shake) {
    const m = shake.mag * (shake.t/Math.max(shake.dur, 0.0001));
    cam3.x += (Math.random()*2-1)*m;
    cam3.y += (Math.random()*2-1)*m;
  }

  // reuse the 2D parallax sky by driving it from the 3D camera
  const ox = cam.x, oy = cam.y;
  cam.x = cam3.x - W/2; cam.y = 0;
  drawWorldBg(gs.world, t, dt);
  hazeScrim(gs.world);
  cam.x = 0; cam.y = 0;      // billboards draw in raw screen space

  // slabs, far side of the camera axis first
  const cols = PLAT3D[gs.world] || PLAT3D[0];
  const near = [];
  for (const p of ld.platforms) {
    if (Math.abs(p[0] + p[2]/2 - cam3.x) < 2400) near.push(p);
  }
  near.sort((a, b) => {
    const da = Math.abs(a[0] + a[2]/2 - cam3.x) + Math.abs(a[1] - cam3.y);
    const db = Math.abs(b[0] + b[2]/2 - cam3.x) + Math.abs(b[1] - cam3.y);
    return db - da;
  });
  for (const p of near) box3(p[0], p[1], p[2], p[3], 0, D3.depth, cols);

  // goal marker as a glowing pillar
  {
    const gx = goalPos[0], gy = goalPos[1];
    if (Math.abs(gx - cam3.x) < 2000) {
      box3(gx + 14, gy - 170, 10, 172, D3.actorZ, D3.actorZ + 12,
           { front:'#c9d4de', top:'#eef4fa', side:'#8b98a6', bottom:'#68737f', edge:'#ffffff' });
      billboard3(gx + 20, gy, D3.actorZ, () => {
        const sv = { x:cam.x, y:cam.y }; cam.x = 0; cam.y = 0;
        ctx.translate(-20, 0);
        drawGoal(0, 0, t);
        cam.x = sv.x; cam.y = sv.y;
      });
    }
  }

  // actors and pickups, far to near by |x - camera|
  const acts = [];
  for (const it of items) if (!it.taken) acts.push({ k:'item', o:it, x:it.x + it.w/2, y:it.y + it.h/2 });
  for (const e of enemies) if (e.active) acts.push({ k:'enemy', o:e, x:e.x + e.w/2, y:e.y + e.h });
  acts.push({ k:'player', o:player, x:player.x + PLAYER_W/2, y:player.y + PLAYER_H });
  acts.sort((a, b) => Math.abs(b.x - cam3.x) - Math.abs(a.x - cam3.x));

  for (const a of acts) {
    if (a.k === 'item') {
      billboard3(a.x, a.y, D3.actorZ, () => {
        const o = a.o;
        drawCollectible({ ...o, x:-o.w/2, y:-o.h/2 }, t);
      });
    } else if (a.k === 'enemy') {
      const e = a.o;
      billboard3(a.x, a.y, D3.actorZ, () => {
        drawEnemy({ ...e, x:-e.w/2, y:-e.h, noBar:false }, t, null, player.x - a.x, player.y);
      });
    } else {
      const p = a.o;
      if (p.respawnTimer > 0) continue;
      billboard3(a.x, a.y, D3.actorZ, () => {
        if (p.invTimer > 0 && Math.floor(p.invTimer*16)%2===0) return;
        if (p.power) {
          const col = p.power==='djump' ? 'rgba(90,225,255,.34)'
                    : p.power==='speed' ? 'rgba(105,255,140,.34)' : 'rgba(255,215,70,.40)';
          glowDot(0, -24, 40*(1 + Math.sin(t*7)*0.09), col);
        }
        const st = clamp(1 + p.vy/5200, 0.90, 1.12);
        ctx.scale(1/st, st);
        drawChar(p.char || curChar(), p.animT, p.facing, p.vy, p.power, p.blink, t);
      });
    }
  }

  // contact shadows on the slab tops
  for (const a of acts) {
    if (a.k !== 'player' && a.k !== 'enemy') continue;
    const gy = groundYBelow(a.x - 18, 36, a.y, ld.platforms);
    if (gy === Infinity) continue;
    const s = p3(a.x, gy, D3.actorZ);
    ctx.globalAlpha = 0.26;
    ell(s.x, s.y, 18*s.s, 5*s.s, '#000');
    ctx.globalAlpha = 1;
  }

  // particles projected into the same space
  if (opts.particles) {
    for (const pt of particles) {
      const sp = p3(pt.x, pt.y, D3.actorZ);
      if (sp.x < -30 || sp.x > W+30) continue;
      ctx.globalAlpha = clamp(pt.life/pt.max, 0, 1);
      ctx.fillStyle = pt.color;
      ctx.beginPath(); ctx.arc(sp.x, sp.y, Math.max(0.6, pt.size*sp.s), 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  for (const f of floaters) {
    const sp = p3(f.x, f.y, D3.actorZ);
    ctx.globalAlpha = clamp(f.life/f.max, 0, 1);
    textOut(f.txt, sp.x, sp.y, f.color, Math.max(11, f.size*sp.s), 'center', 'rgba(0,0,0,.8)', 5);
    ctx.globalAlpha = 1;
  }

  cam.x = ox; cam.y = oy;
  drawVignette(0.3);
  if (hitFlash > 0) {
    ctx.fillStyle = `rgba(255,70,70,${clamp(hitFlash,0,1)*0.32})`;
    ctx.fillRect(0,0,W,H);
  }
}

function drawWorld(t, dt) {
  if (opts.render3d) { drawWorld3D(t, dt); return; }
  const ld = levelData;
  drawWorldBg(gs.world, t, dt);
  hazeScrim(gs.world);
  // shake is applied by nudging the camera for world-space draws only
  const ox = cam.x, oy = cam.y;
  if (shake.t > 0 && opts.shake) {
    const m = shake.mag * (shake.t/Math.max(shake.dur, 0.0001));
    cam.x += (Math.random()*2-1)*m;
    cam.y += (Math.random()*2-1)*m;
  }
  drawPlatforms(ld.platforms, gs.world, t);
  for (const it of items) drawCollectible(it, t);
  drawGoal(goalPos[0], goalPos[1], t);
  for (const e of enemies) drawEnemy(e, t, ld.platforms, player.x, player.y);
  drawPlayer(player, t, ld.platforms);
  if (opts.particles) drawParticles();
  drawFloaters();
  cam.x = ox; cam.y = oy;
  drawVignette(0.24);
  if (hitFlash > 0) {
    ctx.fillStyle = `rgba(255,70,70,${clamp(hitFlash,0,1)*0.32})`;
    ctx.fillRect(0,0,W,H);
  }
}

function drawGameplay(t, dt) {
  drawWorld(t, dt);
  drawHUD(t);
}

// --- HUD ---
function drawHeart(cx, cy, s, filled, t) {
  const pulse = filled ? 1 + Math.sin(t*4)*0.05 : 1;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s*pulse, s*pulse);
  ctx.beginPath();
  ctx.moveTo(0, 0.85);
  ctx.bezierCurveTo(-1.25, -0.15, -0.85, -1.15, 0, -0.55);
  ctx.bezierCurveTo(0.85, -1.15, 1.25, -0.15, 0, 0.85);
  ctx.closePath();
  ctx.fillStyle = filled ? '#ff4d5e' : 'rgba(255,255,255,.16)';
  ctx.fill();
  if (filled) {
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 0.14; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.beginPath(); ctx.ellipse(-0.4, -0.35, 0.22, 0.14, -0.5, 0, Math.PI*2); ctx.fill();
  } else {
    ctx.strokeStyle = 'rgba(255,255,255,.30)'; ctx.lineWidth = 0.12; ctx.stroke();
  }
  ctx.restore();
}
function hudPanel(x, y, w, h, r=12) {
  ctx.fillStyle = 'rgba(10,16,24,.62)'; rrPath(x, y, w, h, r); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1.5; rrPath(x, y, w, h, r); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.06)'; rrPath(x+1, y+1, w-2, h*0.42, r); ctx.fill();
}
function drawCoinIcon(cx, cy, r) {
  ctx.fillStyle = vgrad(cx-r, cy-r, cx+r, cy+r, [[0,'#ffe98a'],[0.5,'#ffc72c'],[1,'#d99404']]);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,250,205,.9)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, cy, r*0.6, 0, Math.PI*2); ctx.stroke();
}
function drawHUD(t) {
  // lives
  hudPanel(14, 12, 22 + Math.max(3, gs.lives)*30, 44);
  for (let i=0; i<Math.max(3, gs.lives); i++) drawHeart(38 + i*30, 34, 11, i < player.lives, t);

  // score (centre)
  const scoreTxt = String(gs.score).padStart(6, '0');
  ctx.font = `bold 26px ${FONT_UI}`;
  const sw = ctx.measureText(scoreTxt).width;
  hudPanel(W/2 - sw/2 - 28, 12, sw + 56, 44);
  textOut('SCORE', W/2, 27, 'rgba(180,205,230,.85)', 11, 'center', 'rgba(0,0,0,.7)', 3);
  textOut(scoreTxt, W/2, 50, '#ffffff', 24, 'center', 'rgba(0,0,0,.8)', 5);

  // coins
  const coinTxt = `× ${gs.coins}`;
  ctx.font = `bold 22px ${FONT_UI}`;
  const cw = ctx.measureText(coinTxt).width;
  hudPanel(W - 34 - cw - 46, 12, cw + 66, 44);
  drawCoinIcon(W - 34 - cw - 22, 34, 11);
  textOut(coinTxt, W - 26, 42, '#ffd94e', 22, 'right', 'rgba(0,0,0,.8)', 5);

  // run timer + active view, top-left under the hearts
  {
    const tTxt = fmtTime(gameTimer);
    ctx.font = `bold 18px ${FONT_UI}`;
    const twd = ctx.measureText(tTxt).width;
    hudPanel(14, 64, twd + 40, 34, 10);
    textOut(tTxt, 28, 87, '#cfe6ff', 18, 'left', 'rgba(0,0,0,.8)', 4);
    const badge = opts.render3d ? '3D' : '2D';
    hudPanel(14 + twd + 48, 64, 46, 34, 10);
    textOut(badge, 14 + twd + 71, 87, opts.render3d ? '#8dff9c' : '#7fd8ff', 16, 'center', 'rgba(0,0,0,.8)', 4);
  }

  // character chip, top-right under the coins
  {
    const c = player.char || curChar();
    hudPanel(W - 150, 64, 136, 46, 12);
    ctx.save();
    ctx.translate(W - 130, 104); ctx.scale(0.62, 0.62);
    drawChar(c, 0, 1, 0, null, 0, t);
    ctx.restore();
    textOut(c.name, W - 26, 94, '#eaf6ff', 16, 'right', 'rgba(0,0,0,.8)', 4);
  }

  // level tag
  const tag = `WORLD ${gs.world+1} — ${['FOREST','CAVE','SNOW'][gs.world]}  ·  LEVEL ${gs.level+1}`;
  ctx.font = `bold 14px ${FONT_UI}`;
  const tw = ctx.measureText(tag).width;
  hudPanel(14, H-46, tw + 28, 32, 10);
  textOut(tag, 28, H-25, 'rgba(215,232,248,.95)', 14, 'left', 'rgba(0,0,0,.75)', 4);

  // power-up meter
  if (player.power) {
    const pw = 190, ph = 14, px2 = W - pw - 30, py2 = H - 34;
    const col = player.power==='djump' ? '#5fd8ff' : player.power==='speed' ? '#6dfa86' : '#ffd94e';
    const label = player.power==='djump' ? 'DOUBLE JUMP' : player.power==='speed' ? 'SPEED BOOST' : 'INVINCIBLE';
    hudPanel(px2 - 42, py2 - 26, pw + 60, 50, 12);
    drawPowerIcon(px2 - 20, py2 + 2, player.power, col);
    textOut(label, W - 30, py2 - 6, col, 13, 'right', 'rgba(0,0,0,.8)', 4);
    fillRR(px2, py2, pw, ph, 7, 'rgba(0,0,0,.55)');
    const frac = clamp(player.powerTimer/10, 0, 1);
    if (frac > 0) {
      ctx.fillStyle = col; rrPath(px2, py2, pw*frac, ph, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.4)'; rrPath(px2+2, py2+2, Math.max(0, pw*frac-4), 4.5, 2.5); ctx.fill();
    }
    strokeRR(px2, py2, pw, ph, 7, 'rgba(255,255,255,.35)', 1.4);
  }

  if (player.respawnTimer > 0) {
    ctx.fillStyle='rgba(0,0,0,.45)'; ctx.fillRect(0,0,W,H);
    const p = 1 - clamp(player.respawnTimer/1.5, 0, 1);
    textOut('RESPAWNING', W/2, H/2-6, '#ffffff', 40, 'center', 'rgba(0,0,0,.85)', 8, FONT_TITLE);
    fillRR(W/2-130, H/2+22, 260, 10, 5, 'rgba(255,255,255,.18)');
    ctx.fillStyle = '#ffd94e'; rrPath(W/2-130, H/2+22, 260*p, 10, 5); ctx.fill();
    textOut(`${player.lives} ${player.lives === 1 ? 'LIFE' : 'LIVES'} LEFT`, W/2, H/2+62, 'rgba(255,190,190,.95)', 18, 'center', 'rgba(0,0,0,.8)', 5);
  }
}
