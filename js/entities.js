// Super Bear Adventure - Physics, the playable roster, enemies, pickups and the goal flag.
// Loaded as a classic script; all top-level names are shared with the
// other files in load order (see index.html).

// --- Physics ---
function resolveX(e, plats) {
  for (const p of plats) {
    if (!rectOverlap(e.x,e.y,e.w,e.h, p[0],p[1],p[2],p[3])) continue;
    const overlapX = Math.min(e.x+e.w, p[0]+p[2]) - Math.max(e.x, p[0]);
    const overlapY = Math.min(e.y+e.h, p[1]+p[3]) - Math.max(e.y, p[1]);
    if (overlapX < overlapY) {
      if (e.x < p[0]) { e.x = p[0]-e.w; } else { e.x = p[0]+p[2]; }
      e.vx = 0;
    }
  }
}
function resolveY(e, plats) {
  e.onGround = false;
  for (const p of plats) {
    if (!rectOverlap(e.x,e.y,e.w,e.h, p[0],p[1],p[2],p[3])) continue;
    const overlapX = Math.min(e.x+e.w, p[0]+p[2]) - Math.max(e.x, p[0]);
    const overlapY = Math.min(e.y+e.h, p[1]+p[3]) - Math.max(e.y, p[1]);
    if (overlapY <= overlapX) {
      if (e.y < p[1]) { e.y = p[1]-e.h; e.vy = 0; e.onGround = true; }
      else { e.y = p[1]+p[3]; e.vy = 0; }
    }
  }
}
/** Nearest platform surface below a box - used for drop shadows. */
function groundYBelow(x, w, y, plats) {
  let best = Infinity;
  for (const p of plats) {
    if (x + w > p[0] && x < p[0]+p[2] && p[1] >= y - 2) best = Math.min(best, p[1]);
  }
  return best;
}

// --- Player ---
function mkPlayer() {
  const c = curChar();
  return { x:80, y:570, vx:0, vy:0, w:PLAYER_W, h:PLAYER_H,
    onGround:false, canDjump:false, djumpUsed:false,
    lives:gs.lives, invTimer:0, respawnTimer:0,
    power:null, powerTimer:0,
    facing:1, char:c,
    animT:0, wasOnGround:true, dustT:0, blink:0, blinkT:2+Math.random()*3,
    coyote:0, jumpBuf:0,        // forgiving jump timing
    cpX:80, cpY:570             // last safe ground, used on respawn
  };
}
function updatePlayer(p, dt, plats, levelW) {
  if (p.respawnTimer > 0) { p.respawnTimer -= dt; return; }
  const c = p.char || curChar();
  // A character with innate double jump keeps it even without the power-up.
  const canDouble = p.power === 'djump' || c.djump;

  // Input
  const spd = (p.power==='speed' ? PLAYER_SPEED*1.65 : PLAYER_SPEED) * c.speed;
  let ax = 0;
  if (held('ArrowLeft')||held('KeyA'))  { ax=-spd; p.facing=-1; }
  if (held('ArrowRight')||held('KeyD')) { ax=spd;  p.facing=1; }

  // Forgiving jump timing: a short grace period after walking off a ledge
  // (coyote time) and a short memory of a press made just before landing.
  const jumpKey  = pressed('Space')||pressed('ArrowUp')||pressed('KeyW');
  const jumpHeld = held('Space')||held('ArrowUp')||held('KeyW');
  p.coyote  = p.onGround ? COYOTE_TIME : Math.max(0, p.coyote - dt);
  p.jumpBuf = jumpKey ? JUMP_BUFFER   : Math.max(0, p.jumpBuf - dt);

  if (p.jumpBuf > 0 && p.coyote > 0) {
    p.vy = JUMP_V * c.jump; p.onGround = false;
    p.coyote = 0; p.jumpBuf = 0;
    if (canDouble) p.djumpUsed = false;
    burst(p.x+PLAYER_W/2, p.y+PLAYER_H, 8, { color:['#ffffff','#e8e0d0'], speed:110, spread:Math.PI*0.9, angle:Math.PI/2, size:4, life:0.35, grav:180, drag:0.9 });
  } else if (p.jumpBuf > 0 && !p.onGround && canDouble && !p.djumpUsed) {
    p.vy = DJUMP_V * c.jump; p.djumpUsed = true; p.jumpBuf = 0;
    burst(p.x+PLAYER_W/2, p.y+PLAYER_H*0.7, 16, { color:['#7cf6ff','#bff8ff','#ffffff'], speed:190, spread:Math.PI*2, size:4, life:0.45, grav:60, drag:0.9, shape:'spark' });
  }
  // Variable jump height: releasing early cuts the rise short.
  const cut = JUMP_V * c.jump * JUMP_CUT;
  if (!jumpHeld && p.vy < cut) p.vy = cut;

  // Physics - a lighter character falls slower and tops out sooner
  p.vx = ax;
  p.vy = Math.min(p.vy + GRAVITY*c.fall*dt, MAX_FALL*c.fall);
  p.x += p.vx*dt; p.x = Math.max(0, Math.min(levelW-p.w, p.x));
  resolveX(p, plats);
  const fallSpeed = p.vy;
  p.y += p.vy*dt;
  resolveY(p, plats);
  if (p.onGround && canDouble) p.djumpUsed = false;

  // Landing impact
  if (p.onGround && !p.wasOnGround && fallSpeed > 260) {
    const n = clamp(Math.round(fallSpeed/90), 4, 14);
    burst(p.x+PLAYER_W/2, p.y+PLAYER_H, n, { color:['#ffffff','#d9cfbc','#bdb2a0'], speed:150, spread:Math.PI*0.75, angle:Math.PI, size:5, life:0.4, grav:520, drag:0.88 });
    if (fallSpeed > 700) addShake(4, 0.16);
  }
  p.wasOnGround = p.onGround;

  // Checkpoint: the furthest solid ground actually stood on, so a death deep
  // into a level does not send the player back to the very start.
  if (p.onGround && p.x > p.cpX + 40 && p.y < 760) { p.cpX = p.x; p.cpY = p.y; }

  // Animation + running dust
  if (p.onGround && Math.abs(p.vx) > 1) {
    p.animT += dt * (Math.abs(p.vx)/PLAYER_SPEED) * 11;
    p.dustT -= dt;
    if (p.dustT <= 0) {
      p.dustT = 0.07;
      burst(p.x+PLAYER_W/2 - p.facing*8, p.y+PLAYER_H-2, 1, { color:'rgba(232,224,208,.85)', speed:55, spread:Math.PI*0.5, angle:-Math.PI/2 - p.facing*0.6, size:4, life:0.35, grav:120, drag:0.9 });
    }
  } else if (p.onGround) {
    p.animT = lerp(p.animT % (Math.PI*2), 0, Math.min(1, dt*10));
  } else {
    p.animT += dt*3;
  }
  p.blinkT -= dt;
  if (p.blinkT <= 0) { p.blink = 0.12; p.blinkT = 2.2 + Math.random()*3.5; }
  if (p.blink > 0) p.blink -= dt;

  // Trail while sprinting
  if (p.power === 'speed' && Math.abs(p.vx) > 1 && Math.random() < 0.5) {
    burst(p.x+PLAYER_W/2, p.y+PLAYER_H*0.6, 1, { color:'rgba(120,255,150,.7)', speed:30, spread:Math.PI, size:4, life:0.3, grav:-40, drag:0.9 });
  }

  // Timers
  if (p.invTimer > 0) p.invTimer -= dt;
  if (p.powerTimer > 0) { p.powerTimer -= dt; if (p.powerTimer<=0) p.power=null; }
}

/**
 * Playable roster. Every character is drawn by the same routine; the entries
 * below supply the palette, the silhouette flags and the stat multipliers.
 */
const CHARACTERS = [
  { id:'bruno', name:'BRUNO', kind:'Oso pardo',   perk:'Equilibrado, sin puntos débiles',
    speed:1.00, jump:1.00, fall:1.00, djump:false,
    fur:'#8d5a2b', furDark:'#6d431f', furLight:'#a86f38',
    belly:'#e0bc8c', muzzle:'#ecd3ac', inner:'#c98a72',
    ears:'round', tail:'stub', scarf:'#c8352f', scarfDark:'#9e2721', patches:false, beak:false },

  { id:'rara',  name:'RARA',  kind:'Zorra veloz', perk:'Corre un 20% más rápido',
    speed:1.20, jump:0.96, fall:1.00, djump:false,
    fur:'#e0712c', furDark:'#b4501a', furLight:'#f59243',
    belly:'#fbeadb', muzzle:'#fbeadb', inner:'#3b2a22',
    ears:'pointy', tail:'bushy', scarf:'#2f6fc8', scarfDark:'#1e4d92', patches:false, beak:false },

  { id:'pang',  name:'PANG',  kind:'Panda fuerte', perk:'Salta un 18% más alto',
    speed:0.88, jump:1.18, fall:1.00, djump:false,
    fur:'#f2f2f0', furDark:'#cfcfcb', furLight:'#ffffff',
    belly:'#ffffff', muzzle:'#ffffff', inner:'#e2a0a8',
    ears:'black', tail:'stub', scarf:'#3aa76d', scarfDark:'#26754b', patches:true, beak:false },

  { id:'kiro',  name:'KIRO',  kind:'Gato ligero', perk:'Cae mucho más despacio',
    speed:1.10, jump:1.08, fall:0.70, djump:false,
    fur:'#5a5f6e', furDark:'#3f4450', furLight:'#767c8c',
    belly:'#d7dbe4', muzzle:'#d7dbe4', inner:'#d98fa0',
    ears:'pointy', tail:'thin', scarf:'#ffcf3a', scarfDark:'#c99b12', patches:false, beak:false },

  { id:'nix',   name:'NIX',   kind:'Pingüino',    perk:'Doble salto siempre activo',
    speed:0.94, jump:1.02, fall:1.00, djump:true,
    fur:'#26303f', furDark:'#161d27', furLight:'#39465a',
    belly:'#f4f7fb', muzzle:'#ffb43a', inner:'#ffb43a',
    ears:'none', tail:'none', scarf:'#e8554e', scarfDark:'#b03a34', patches:false, beak:true },
];
function charById(id) { return CHARACTERS.find(c => c.id === id) || CHARACTERS[0]; }

/**
 * Draws a roster character in local space: origin at the feet, facing +x,
 * 48 units tall. Shared by gameplay, the menu and every UI preview.
 */
function drawChar(c, animT, facing, vy, power, blink, t) {
  ctx.save();
  ctx.scale(facing, 1);
  const sw = Math.sin(animT);          // walk cycle
  const airborne = Math.abs(vy) > 4;
  const legSwing = airborne ? 3 : sw*5;
  const armSwing = airborne ? -5 : -sw*5;
  const bodyBob  = airborne ? 0 : Math.abs(sw)*1.6;

  // tail sits behind the body
  if (c.tail === 'bushy') {
    // wide at the hip, tapering to a pale tip, swept back behind the body
    const wag = Math.sin(t*4)*4;
    ctx.fillStyle = c.furDark;
    ctx.beginPath();
    ctx.moveTo(-12, -32 + bodyBob);
    ctx.quadraticCurveTo(-34, -40 + wag, -41, -26 + wag);
    ctx.quadraticCurveTo(-32, -17, -12, -17 + bodyBob);
    ctx.closePath(); ctx.fill();
    ell(-38, -25 + wag, 5.5, 5.2, c.belly);
  } else if (c.tail === 'thin') {
    const wag = Math.sin(t*5)*5;
    ctx.strokeStyle = c.furDark; ctx.lineWidth = 5.5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-12, -19 + bodyBob);
    ctx.quadraticCurveTo(-30, -22 + wag, -28, -38 + wag);
    ctx.stroke();
    ctx.strokeStyle = c.belly; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-28.5, -33 + wag); ctx.lineTo(-28, -37 + wag);
    ctx.stroke();
  } else if (c.tail === 'stub') {
    ell(-15, -18 + bodyBob, 4.5, 4.5, c.furDark);
  }

  // legs
  fillRR(-11 + legSwing, -13, 9, 13, 4, c.furDark);
  fillRR(  2 - legSwing, -13, 9, 13, 4, c.furDark);
  // feet
  const footCol = c.beak ? c.muzzle : '#4d2e14';
  ell(-6.5 + legSwing, -1.5, 4.6, 2.2, footCol);
  ell( 6.5 - legSwing, -1.5, 4.6, 2.2, footCol);

  // back arm
  fillRR(-14, -32 + bodyBob + armSwing, 7, 16, 3.5, c.furDark);

  // body
  ctx.fillStyle = vgrad(0,-34+bodyBob,0,-8+bodyBob, [[0,c.furLight],[0.55,c.fur],[1,c.furDark]]);
  rrPath(-14, -34 + bodyBob, 28, 27, 11); ctx.fill();
  ell(0.5, -19 + bodyBob, 8.5, 9.5, c.belly);
  if (c.patches) { ell(-10, -30 + bodyBob, 6, 7.5, '#2a2a2a'); ell(11, -30 + bodyBob, 6, 7.5, '#2a2a2a'); }

  // scarf
  if (c.scarf) {
    ctx.fillStyle = c.scarf;
    rrPath(-13, -35 + bodyBob, 26, 7, 3); ctx.fill();
    ctx.fillStyle = c.scarfDark;
    const flap = Math.sin(t*6)*3;
    ctx.beginPath();
    ctx.moveTo(-9, -33 + bodyBob);
    ctx.lineTo(-19 - Math.abs(flap)*0.6, -26 + bodyBob + flap);
    ctx.lineTo(-13, -22 + bodyBob + flap*0.4);
    ctx.closePath(); ctx.fill();
  }

  // head group
  const hy = -44 + bodyBob;
  if (c.ears === 'round' || c.ears === 'black') {
    const outer = c.ears === 'black' ? '#2a2a2a' : c.furDark;
    ell(-8.5, hy-9, 6.2, 6.2, outer);
    ell( 9.5, hy-9, 6.2, 6.2, outer);
    if (c.ears === 'round') { ell(-8.5, hy-9, 3.2, 3.2, c.inner); ell(9.5, hy-9, 3.2, 3.2, c.inner); }
  } else if (c.ears === 'pointy') {
    ctx.fillStyle = c.furDark;
    ctx.beginPath(); ctx.moveTo(-13,hy-8); ctx.lineTo(-9,hy-23); ctx.lineTo(-3,hy-9); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo( 13,hy-8); ctx.lineTo( 9,hy-23); ctx.lineTo( 3,hy-9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.inner;
    ctx.beginPath(); ctx.moveTo(-10.5,hy-9.5); ctx.lineTo(-9,hy-18); ctx.lineTo(-5.5,hy-10); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo( 10.5,hy-9.5); ctx.lineTo( 9,hy-18); ctx.lineTo( 5.5,hy-10); ctx.closePath(); ctx.fill();
  }
  // head
  ctx.fillStyle = vgrad(0,hy-13,0,hy+11, [[0,c.furLight],[1,c.fur]]);
  rrPath(-13, hy-13, 27, 24, 11); ctx.fill();
  if (c.patches) { ell(-2, hy-4, 5.6, 6.8, '#2a2a2a'); ell(10, hy-4, 5.6, 6.8, '#2a2a2a'); }

  // muzzle or beak
  if (c.beak) {
    ctx.fillStyle = c.muzzle;
    ctx.beginPath(); ctx.moveTo(5, hy+0.5); ctx.lineTo(19, hy+4); ctx.lineTo(5, hy+7.5); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(120,70,0,.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(5, hy+4); ctx.lineTo(18, hy+4); ctx.stroke();
  } else {
    ell(7, hy+4, 8.6, 6.6, c.muzzle);
    ctx.fillStyle = '#241610';
    ctx.beginPath();
    ctx.moveTo(11.5, hy-0.5); ctx.lineTo(15.5, hy+2.6); ctx.lineTo(7.5, hy+2.6);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#5a3520'; ctx.lineWidth = 1.3; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(11.5, hy+3.2); ctx.quadraticCurveTo(9, hy+7, 5.5, hy+5.6); ctx.stroke();
  }

  // eyes
  const closed = blink > 0;
  for (const ex of [-1.5, 9]) {
    if (closed) {
      ctx.strokeStyle='#241610'; ctx.lineWidth=1.7;
      ctx.beginPath(); ctx.moveTo(ex-3, hy-4); ctx.lineTo(ex+3, hy-4); ctx.stroke();
    } else {
      ell(ex, hy-4, 3.6, 4.0, '#ffffff');
      ell(ex+1.1, hy-3.6, 2.1, 2.4, '#241610');
      ell(ex+1.9, hy-4.9, 0.8, 0.9, '#ffffff');
    }
  }
  // brow line - gives the character a bit of attitude
  if (!c.patches) {
    ctx.strokeStyle = c.furDark; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-5, hy-8.6); ctx.lineTo(1.5, hy-9.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, hy-9.6); ctx.lineTo(12.5, hy-8.6); ctx.stroke();
  }

  // front arm (drawn last so it reads in front of the body)
  fillRR(8, -32 + bodyBob - armSwing, 7.5, 16, 3.5, c.fur);

  ctx.restore();
}

function drawPlayer(p, t, plats) {
  if (p.respawnTimer > 0) return;
  if (p.invTimer > 0 && Math.floor(p.invTimer*16)%2===0) return;

  const cx = p.x + PLAYER_W/2 - cam.x;
  const feet = p.y + PLAYER_H - cam.y;

  // drop shadow on the ground below
  if (plats) {
    const gy = groundYBelow(p.x, p.w, p.y + p.h, plats);
    if (gy !== Infinity) {
      const dist = clamp((gy - (p.y+p.h)) / 260, 0, 1);
      ctx.globalAlpha = 0.34 * (1 - dist*0.8);
      ell(cx, gy - cam.y + 3, 17*(1-dist*0.45), 5.5*(1-dist*0.4), '#000');
      ctx.globalAlpha = 1;
    }
  }

  // power aura behind the bear
  if (p.power) {
    const auraCol = p.power==='djump' ? 'rgba(90,225,255,.34)' : p.power==='speed' ? 'rgba(105,255,140,.34)' : 'rgba(255,215,70,.40)';
    const pulse = 1 + Math.sin(t*7)*0.09;
    glowDot(cx, feet-24, 40*pulse, auraCol);
    if (p.power === 'inv') {
      ctx.strokeStyle = `rgba(255,225,90,${0.35+0.3*Math.sin(t*10)})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(cx, feet-24, 26, 32, Math.sin(t*2)*0.3, 0, Math.PI*2); ctx.stroke();
    }
  }

  ctx.save();
  ctx.translate(cx, feet);
  // squash & stretch driven by vertical speed
  const st = clamp(1 + p.vy/5200, 0.90, 1.12);
  ctx.scale(1/st, st);
  drawChar(p.char || curChar(), p.animT, p.facing, p.vy, p.power, p.blink, t);
  ctx.restore();
}

// --- Enemy ---
function mkEnemies(data) {
  return data.map(([ex,ey,type,range]) => ({
    x:ex, y:ey, vx:0, vy:0, w:type==='boss'?58:34, h:type==='boss'?66:38,
    onGround:false, type, range, startX:ex,
    dir:1, hp:type==='boss'?3:1, active:true,
    hitFlash:0, animT:Math.random()*6.28,
    // boss state
    phase:'patrol', phaseTimer:3, chargeDir:1,
  }));
}
function updateEnemy(e, dt, plats, px, py, levelW) {
  if (!e.active) return;
  e.vy = Math.min(e.vy + GRAVITY*dt, MAX_FALL);

  if (e.type==='boss') {
    updateBoss(e, dt, px, py);
  } else {
    const spd = e.type==='chaser' ? 140 : 100;
    const dx = px - e.x;
    if (e.type==='chaser' && Math.abs(dx) < 260) {
      e.vx = dx > 0 ? spd : -spd;
    } else {
      if (e.x <= e.startX - e.range/2) e.dir = 1;
      if (e.x >= e.startX + e.range/2) e.dir = -1;
      e.vx = e.dir * spd;
    }
  }

  e.x += e.vx*dt; e.x = clamp(e.x, 0, levelW-e.w);
  resolveX(e, plats);
  e.y += e.vy*dt;
  resolveY(e, plats);
  if (e.hitFlash > 0) e.hitFlash -= dt;
  e.animT += dt * (2.5 + Math.abs(e.vx)*0.02);

  // boss charge kicks up dust
  if (e.type === 'boss' && e.phase === 'charge' && e.onGround && Math.random() < 0.55) {
    burst(e.x+e.w/2 - Math.sign(e.vx)*e.w*0.4, e.y+e.h, 2, { color:['#c9b8a4','#e8dccb'], speed:120, spread:Math.PI*0.6, angle:Math.PI, size:5, life:0.35, grav:400, drag:0.9 });
  }
}
function updateBoss(b, dt, px, py) {
  b.phaseTimer -= dt;
  if (b.phase==='patrol') {
    b.vx = b.dir * 80;
    if (b.x <= b.startX - b.range/2) b.dir=1;
    if (b.x >= b.startX + b.range/2) b.dir=-1;
    if (b.phaseTimer<=0) { b.phase='windup'; b.phaseTimer=0.6; b.vx=0; b.chargeDir=px<b.x?-1:1; }
  } else if (b.phase==='windup') {
    b.vx=0;
    if (b.phaseTimer<=0) { b.phase='charge'; b.phaseTimer=0.7; }
  } else if (b.phase==='charge') {
    b.vx = b.chargeDir * 380;
    if (b.phaseTimer<=0) { b.phase='rest'; b.phaseTimer=1.2; b.vx=0; }
  } else if (b.phase==='rest') {
    b.vx=0;
    if (b.phaseTimer<=0) { b.phase='patrol'; b.phaseTimer=3.0; }
  }
}

function drawEnemy(e, t, plats, px, py) {
  if (!e.active) return;
  const x = e.x-cam.x, y = e.y-cam.y;
  if (x > W+80 || x+e.w < -80) return;
  const face = e.vx < 0 ? -1 : 1;
  const flash = e.hitFlash > 0;

  // shadow
  if (plats) {
    const gy = groundYBelow(e.x, e.w, e.y+e.h, plats);
    if (gy !== Infinity) {
      const dist = clamp((gy - (e.y+e.h))/240, 0, 1);
      ctx.globalAlpha = 0.3*(1-dist*0.8);
      ell(x+e.w/2, gy-cam.y+3, e.w*0.46*(1-dist*0.4), 5*(1-dist*0.4), '#000');
      ctx.globalAlpha = 1;
    }
  }

  if (e.type === 'boss') {
    const windup = e.phase === 'windup';
    const charging = e.phase === 'charge';
    const bob = Math.sin(e.animT*1.4)*2;
    const cx = x + e.w/2, feet = y + e.h;

    // menace glow
    glowDot(cx, feet - e.h*0.5, e.w*1.15, charging ? 'rgba(255,90,50,.34)' : 'rgba(180,30,30,.22)');

    ctx.save();
    ctx.translate(cx, feet);
    ctx.scale(e.chargeDir === -1 && (charging||windup) ? -1 : face, 1);
    if (windup) ctx.scale(1.06, 0.94);

    const base = flash ? '#ffffff' : '#7d1218';
    const lite = flash ? '#ffffff' : '#a81c22';
    // legs
    fillRR(-19, -15, 13, 15, 5, flash ? '#fff' : '#5a0d12');
    fillRR(  6, -15, 13, 15, 5, flash ? '#fff' : '#5a0d12');
    // cape
    ctx.fillStyle = flash ? 'rgba(255,255,255,.8)' : '#3a0a12';
    ctx.beginPath();
    ctx.moveTo(-14, -52 + bob);
    ctx.quadraticCurveTo(-40 - Math.abs(bob)*2, -26, -22, -4);
    ctx.lineTo(10, -8); ctx.lineTo(12, -50 + bob);
    ctx.closePath(); ctx.fill();
    // body
    ctx.fillStyle = vgrad(0,-52+bob,0,-10+bob, [[0,lite],[1,base]]);
    rrPath(-21, -52 + bob, 42, 44, 15); ctx.fill();
    // chest plate
    ell(2, -30 + bob, 11, 13, flash ? '#fff' : '#521016');
    ctx.fillStyle = flash ? '#fff' : '#d8a020';
    drawStar(2, -30 + bob, 8, 3.6, 5, 0);
    // head
    const hy = -60 + bob;
    ctx.fillStyle = vgrad(0,hy-12,0,hy+12, [[0,lite],[1,base]]);
    rrPath(-17, hy-12, 34, 26, 12); ctx.fill();
    // horns
    ctx.fillStyle = flash ? '#fff' : '#e8dcc0';
    ctx.beginPath(); ctx.moveTo(-16, hy-9); ctx.lineTo(-25, hy-24); ctx.lineTo(-9, hy-13); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo( 16, hy-9); ctx.lineTo( 25, hy-24); ctx.lineTo( 9, hy-13); ctx.closePath(); ctx.fill();
    // crown
    ctx.fillStyle = flash ? '#fff' : '#ffcf3a';
    ctx.beginPath();
    ctx.moveTo(-13, hy-11); ctx.lineTo(-13, hy-22); ctx.lineTo(-6, hy-15);
    ctx.lineTo(0, hy-26); ctx.lineTo(6, hy-15); ctx.lineTo(13, hy-22);
    ctx.lineTo(13, hy-11); ctx.closePath(); ctx.fill();
    ctx.fillStyle = flash ? '#fff' : '#ff5a4a';
    ctx.beginPath(); ctx.arc(0, hy-20, 2.6, 0, Math.PI*2); ctx.fill();
    // glowing eyes
    const eg = charging ? '#fff2a0' : '#ff6a2a';
    glowDot(-7, hy-2, 11, 'rgba(255,120,40,.75)');
    glowDot( 8, hy-2, 11, 'rgba(255,120,40,.75)');
    ell(-7, hy-2, 4.4, 3.4, eg);
    ell( 8, hy-2, 4.4, 3.4, eg);
    // snarl
    ctx.fillStyle = '#1a0508';
    rrPath(-8, hy+5, 18, 6, 3); ctx.fill();
    ctx.fillStyle = '#fff';
    for (let i=0;i<4;i++) ctx.fillRect(-7 + i*4.4, hy+5, 2.4, 4);
    ctx.restore();

    // health bar (suppressed for the instructions line-up)
    if (e.noBar) return;
    const bw = e.w + 26, bx = cx - bw/2, by = y - 30;
    fillRR(bx-2, by-2, bw+4, 13, 6, 'rgba(0,0,0,.6)');
    fillRR(bx, by, bw, 9, 4.5, '#3a0d10');
    const hpFrac = clamp(e.hp/3, 0, 1);
    ctx.fillStyle = vgrad(0,by,0,by+9, [[0,'#7dff8a'],[1,'#1f9e3a']]);
    rrPath(bx, by, bw*hpFrac, 9, 4.5); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.35)'; rrPath(bx, by, bw*hpFrac, 3.5, 2); ctx.fill();
    strokeRR(bx, by, bw, 9, 4.5, 'rgba(255,255,255,.5)', 1.2);
    textOut('BOSS', cx, by-6, '#ffd45e', 13, 'center', 'rgba(0,0,0,.8)', 4);

  } else {
    const chaser = e.type === 'chaser';
    const squash = 1 + Math.sin(e.animT*2)*0.07;
    const cx = x + e.w/2, feet = y + e.h;
    // eyes track the player
    const look = clamp(((px ?? e.x) - e.x)/180, -1, 1);

    ctx.save();
    ctx.translate(cx, feet);
    ctx.scale(1/squash, squash);

    const bodyTop = chaser
      ? [[0,'#ff6a3d'],[0.55,'#d63a1a'],[1,'#8f1f0c']]
      : [[0,'#c88a3e'],[0.55,'#9a5f24'],[1,'#5f3712']];

    // feet
    ctx.fillStyle = chaser ? '#6d1608' : '#4a2a0e';
    ell(-8 + Math.sin(e.animT*4)*2.5, -1.5, 5.5, 2.8, chaser ? '#6d1608' : '#4a2a0e');
    ell( 8 - Math.sin(e.animT*4)*2.5, -1.5, 5.5, 2.8, chaser ? '#6d1608' : '#4a2a0e');

    // spikes / crest on the back
    ctx.fillStyle = chaser ? '#ffd24a' : '#7b4a1c';
    for (let i=0;i<3;i++) {
      const sxp = -12 + i*8 - face*3;
      ctx.beginPath();
      ctx.moveTo(sxp-4, -26); ctx.lineTo(sxp, -26 - (8 + i*2)); ctx.lineTo(sxp+4, -26);
      ctx.closePath(); ctx.fill();
    }

    // body
    ctx.fillStyle = flash ? '#fff' : vgrad(0,-34,0,0, bodyTop);
    rrPath(-16, -34, 32, 34, 14); ctx.fill();
    // belly highlight
    ell(0, -12, 9, 7, chaser ? 'rgba(255,190,150,.35)' : 'rgba(255,225,180,.30)');

    // eyes
    for (const ex of [-6.5, 6.5]) {
      ell(ex, -22, 5.4, 5.8, '#ffffff');
      ell(ex + look*1.8, -21.6, 2.7, 3.0, '#101010');
      ell(ex + look*1.8 + 0.9, -22.9, 0.9, 1.0, '#ffffff');
    }
    // angry brows
    ctx.strokeStyle = chaser ? '#5c1206' : '#3d2209'; ctx.lineWidth = 2.6; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(-11.5, -30); ctx.lineTo(-2.5, -26.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( 11.5, -30); ctx.lineTo( 2.5, -26.5); ctx.stroke();
    // mouth with teeth
    ctx.fillStyle = '#2a0d06';
    rrPath(-7, -14, 14, 6, 3); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.moveTo(-5, -14); ctx.lineTo(-2.5, -9.5); ctx.lineTo(-0.5, -14); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo( 1, -14); ctx.lineTo( 3.5, -9.5); ctx.lineTo( 5.5, -14); ctx.closePath(); ctx.fill();

    ctx.restore();

    if (chaser) glowDot(cx, feet-18, 30, 'rgba(255,90,40,.20)');
  }
}

// --- Collectibles & Power-ups ---
function mkCollectibles(coins, stars, powerups) {
  const items = [];
  for (const [cx,cy] of coins)   items.push({x:cx,y:cy,w:20,h:20,type:'coin',taken:false,bob:Math.random()*Math.PI*2});
  for (const [sx,sy] of stars)   items.push({x:sx,y:sy,w:24,h:24,type:'star',taken:false,bob:Math.random()*Math.PI*2});
  for (const [ux,uy,ut] of powerups) items.push({x:ux,y:uy,w:28,h:28,type:ut,taken:false,bob:Math.random()*Math.PI*2});
  return items;
}
function drawPowerIcon(cx, cy, type, color) {
  ctx.fillStyle = color;
  if (type === 'djump') {
    for (let k=0;k<2;k++) {
      const oy = cy + 3 + k*7;
      ctx.beginPath();
      ctx.moveTo(cx, oy-7); ctx.lineTo(cx+6, oy); ctx.lineTo(cx+3, oy); ctx.lineTo(cx+3, oy+1.6);
      ctx.lineTo(cx-3, oy+1.6); ctx.lineTo(cx-3, oy); ctx.lineTo(cx-6, oy);
      ctx.closePath(); ctx.fill();
    }
  } else if (type === 'speed') {
    ctx.beginPath();
    ctx.moveTo(cx+2, cy-9); ctx.lineTo(cx-6, cy+1); ctx.lineTo(cx-1, cy+1);
    ctx.lineTo(cx-3, cy+9); ctx.lineTo(cx+6, cy-2); ctx.lineTo(cx+1, cy-2);
    ctx.closePath(); ctx.fill();
  } else {
    drawStar(cx, cy, 9, 4, 5, 0);
  }
}
function drawCollectible(it, t) {
  if (it.taken) return;
  const bob = Math.sin(t*3 + it.bob)*4;
  const cx = it.x-cam.x + it.w/2, cy = it.y-cam.y + it.h/2 + bob;
  if (cx < -50 || cx > W+50) return;

  if (it.type === 'coin') {
    const spin = Math.cos(t*3.2 + it.bob);
    const rx = Math.max(1.6, 10*Math.abs(spin));
    glowDot(cx, cy, 20, 'rgba(255,208,60,.30)');
    ctx.fillStyle = vgrad(cx-rx, cy-10, cx+rx, cy+10, [[0,'#ffe98a'],[0.5,'#ffc72c'],[1,'#d99404']]);
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, 10, 0, 0, Math.PI*2); ctx.fill();
    if (rx > 3.5) {
      ctx.strokeStyle = 'rgba(255,250,205,.85)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx*0.62, 6.2, 0, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.beginPath(); ctx.ellipse(cx - rx*0.32, cy - 3.5, rx*0.20, 2.6, -0.5, 0, Math.PI*2); ctx.fill();
    }
  } else if (it.type === 'star') {
    const rot = t*1.6 + it.bob;
    const pulse = 1 + Math.sin(t*4 + it.bob)*0.08;
    glowDot(cx, cy, 30*pulse, 'rgba(255,220,80,.42)');
    ctx.fillStyle = '#fff3b0'; drawStar(cx, cy, 15*pulse, 6.6*pulse, 5, rot);
    ctx.fillStyle = '#ffc72c'; drawStar(cx, cy, 11.5*pulse, 5*pulse, 5, rot);
    ctx.fillStyle = 'rgba(255,255,255,.9)'; drawStar(cx, cy-1.5, 4.6, 2, 5, rot);
    // twinkle
    const tw = (Math.sin(t*5 + it.bob) + 1)/2;
    ctx.globalAlpha = tw*0.8; ctx.strokeStyle = '#fffbe0'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx-20,cy); ctx.lineTo(cx+20,cy); ctx.moveTo(cx,cy-20); ctx.lineTo(cx,cy+20); ctx.stroke();
    ctx.globalAlpha = 1;
  } else {
    const colors = { djump:['#7ce8ff','#1b9fd0'], speed:['#8dff9c','#1fa03f'], inv:['#ffe37a','#d19a10'] };
    const [c1,c2] = colors[it.type] || ['#fff','#888'];
    const glows = { djump:'rgba(124,232,255,.34)', speed:'rgba(141,255,156,.34)', inv:'rgba(255,227,122,.36)' };
    const pulse = 1 + Math.sin(t*5 + it.bob)*0.07;
    glowDot(cx, cy, 34*pulse, glows[it.type] || 'rgba(255,255,255,.25)');
    glowDot(cx, cy, 18*pulse, 'rgba(255,255,255,.20)');
    // orb
    const g = ctx.createRadialGradient(cx-4, cy-5, 2, cx, cy, 16*pulse);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, 15*pulse, 0, Math.PI*2); ctx.fill();
    // rotating ring
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(cx, cy, 18*pulse, 7, t*2 + it.bob, 0, Math.PI*2); ctx.stroke();
    drawPowerIcon(cx, cy, it.type, 'rgba(20,30,40,.85)');
  }
}

// --- Goal Flag ---
function drawGoal(gx, gy, t) {
  const x = gx-cam.x, y = gy-cam.y;
  if (x < -140 || x > W+140) return;

  // glowing capture column
  const g = ctx.createLinearGradient(0, y+80, 0, y-170);
  g.addColorStop(0, 'rgba(90,255,140,.34)');
  g.addColorStop(1, 'rgba(90,255,140,0)');
  ctx.fillStyle = g; ctx.fillRect(x, y-170, 40, 250);
  // rising sparks in the column
  for (let i=0;i<7;i++) {
    const ph = (t*0.55 + i*0.143) % 1;
    const sy = y + 78 - ph*230;
    ctx.globalAlpha = (1-ph)*0.85;
    ctx.fillStyle = '#c8ffd8';
    ctx.beginPath(); ctx.arc(x + 8 + ((i*7)%26) + Math.sin(t*2+i)*3, sy, 1.8, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // pole
  ctx.fillStyle = vgrad(x+15,0,x+22,0, [[0,'#e8eef4'],[0.4,'#a9b6c4'],[1,'#68737f']]);
  ctx.fillRect(x+15, y-170, 7, 172);
  fillRR(x+8, y-4, 21, 8, 3, '#5c6773');
  // finial
  glowDot(x+18.5, y-176, 16, 'rgba(255,225,120,.65)');
  ell(x+18.5, y-176, 6.5, 6.5, '#ffd44e');
  ell(x+17, y-178, 2.2, 2.2, '#fff6c8');

  // waving checkered flag
  const segs = 8, fw = 62, fh = 40, fy = y-168;
  for (let i=0;i<segs;i++) {
    const t0 = i/segs, t1 = (i+1)/segs;
    const w0 = Math.sin(t*5 - t0*3.4)*7*t0;
    const w1 = Math.sin(t*5 - t1*3.4)*7*t1;
    for (let r=0;r<3;r++) {
      const ry0 = fy + r*(fh/3) + w0*0.35;
      const ry1 = fy + r*(fh/3) + w1*0.35;
      ctx.fillStyle = ((i + r) % 2 === 0) ? '#2fd45f' : '#f2fff5';
      ctx.beginPath();
      ctx.moveTo(x+21 + t0*fw, ry0);
      ctx.lineTo(x+21 + t1*fw, ry1);
      ctx.lineTo(x+21 + t1*fw, ry1 + fh/3);
      ctx.lineTo(x+21 + t0*fw, ry0 + fh/3);
      ctx.closePath(); ctx.fill();
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.fillRect(x+21, fy, 3, fh);

  textOut('GOAL', x+20, y+40, '#d6ffe2', 15, 'center', 'rgba(0,60,20,.85)', 5);
}
