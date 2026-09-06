// Super Bear Adventure - Drawing primitives, particles, weather, parallax backgrounds and platforms.
// Loaded as a classic script; all top-level names are shared with the
// other files in load order (see index.html).

// --- Drawing Helpers ---
let ctx, curDt = 0.016;

function rect(x,y,w,h,c) { ctx.fillStyle=c; ctx.fillRect(x-cam.x,y-cam.y,w,h); }
function rrPath(x,y,w,h,r) {
  r = Math.max(0, Math.min(r, Math.abs(w)/2, Math.abs(h)/2));
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,   x+w,y+h, r);
  ctx.arcTo(x+w,y+h, x,  y+h, r);
  ctx.arcTo(x,  y+h, x,  y,   r);
  ctx.arcTo(x,  y,   x+w,y,   r);
  ctx.closePath();
}
function fillRR(x,y,w,h,r,c) { ctx.fillStyle=c; rrPath(x,y,w,h,r); ctx.fill(); }
function strokeRR(x,y,w,h,r,c,lw=2) { ctx.strokeStyle=c; ctx.lineWidth=lw; rrPath(x,y,w,h,r); ctx.stroke(); }
function ell(cx,cy,rx,ry,c) { ctx.fillStyle=c; ctx.beginPath(); ctx.ellipse(cx,cy,Math.abs(rx),Math.abs(ry),0,0,Math.PI*2); ctx.fill(); }
function vgrad(x0,y0,x1,y1,stops) {
  const g = ctx.createLinearGradient(x0,y0,x1,y1);
  for (const [p,c] of stops) g.addColorStop(p,c);
  return g;
}
/** Text with a rounded outline - the standard readable-on-anything game label. */
function textOut(str,x,y,fill,size,align='left',outline='rgba(0,0,0,.75)',lw=5,font=FONT_UI) {
  ctx.font=`bold ${size}px ${font}`; ctx.textAlign=align; ctx.textBaseline='alphabetic';
  ctx.lineJoin='round'; ctx.miterLimit=2;
  if (lw > 0) { ctx.lineWidth=lw; ctx.strokeStyle=outline; ctx.strokeText(str,x,y); }
  ctx.fillStyle=fill; ctx.fillText(str,x,y);
}
function glowDot(cx,cy,r,color,alpha=1) {
  const g = ctx.createRadialGradient(cx,cy,0,cx,cy,r);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = alpha; ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;
}
function drawStarPath(cx,cy,outer,inner,pts,rot=0) {
  ctx.beginPath();
  for (let i=0;i<pts*2;i++) {
    const r = i%2===0?outer:inner;
    const a = (i/pts)*Math.PI - Math.PI/2 + rot;
    if (i===0) ctx.moveTo(cx+r*Math.cos(a),cy+r*Math.sin(a));
    else ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));
  }
  ctx.closePath();
}
function drawStar(cx,cy,outer,inner,pts,rot=0) { drawStarPath(cx,cy,outer,inner,pts,rot); ctx.fill(); }
function drawVignette(strength=0.38) {
  const g = ctx.createRadialGradient(W/2,H*0.5,H*0.32, W/2,H*0.5,H*0.92);
  g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,`rgba(0,0,0,${strength})`);
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
}
/** Repeats drawFn across the screen at a parallax factor - never seams, never ends. */
function parallaxRow(spacing, factor, drawFn) {
  const off = cam.x * factor;
  const first = Math.floor(off/spacing) - 1;
  const last  = Math.ceil((off + W)/spacing) + 1;
  for (let i = first; i <= last; i++) drawFn(i*spacing - off, i);
}

// --- Particles & floating score text ---
let particles = [], floaters = [];
const MAX_PARTICLES = 340;

function spawnP(o) {
  if (particles.length >= MAX_PARTICLES) particles.shift();
  particles.push(Object.assign({
    x:0, y:0, vx:0, vy:0, life:0.5, max:0.5, size:4,
    color:'#fff', grav:700, drag:1, shape:'dot', rot:0, vrot:0
  }, o));
}
function burst(x, y, n, opts) {
  for (let i=0;i<n;i++) {
    const a = (opts.angle ?? -Math.PI/2) + (Math.random()-0.5)*(opts.spread ?? Math.PI*2);
    const sp = (opts.speed ?? 140) * (0.45 + Math.random()*0.85);
    const life = (opts.life ?? 0.55) * (0.6 + Math.random()*0.7);
    spawnP({
      x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp,
      life, max:life,
      size:(opts.size ?? 4)*(0.6+Math.random()*0.8),
      color: Array.isArray(opts.color) ? opts.color[(Math.random()*opts.color.length)|0] : (opts.color ?? '#fff'),
      grav: opts.grav ?? 700, drag: opts.drag ?? 1,
      shape: opts.shape ?? 'dot',
      rot: Math.random()*Math.PI*2, vrot:(Math.random()-0.5)*10
    });
  }
}
function updateParticles(dt) {
  for (let i=particles.length-1;i>=0;i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) { particles.splice(i,1); continue; }
    p.vy += p.grav*dt;
    if (p.drag !== 1) { const d = Math.pow(p.drag, dt*60); p.vx *= d; p.vy *= d; }
    p.x += p.vx*dt; p.y += p.vy*dt; p.rot += p.vrot*dt;
  }
  for (let i=floaters.length-1;i>=0;i--) {
    const f = floaters[i];
    f.life -= dt; f.y -= 46*dt;
    if (f.life <= 0) floaters.splice(i,1);
  }
}
function drawParticles() {
  for (const p of particles) {
    const a = clamp(p.life/p.max, 0, 1);
    const x = p.x-cam.x, y = p.y-cam.y;
    if (x < -40 || x > W+40 || y < -40 || y > H+40) continue;
    ctx.globalAlpha = a;
    if (p.shape === 'spark') {
      ctx.strokeStyle = p.color; ctx.lineWidth = Math.max(1, p.size*0.5); ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-p.vx*0.028, y-p.vy*0.028); ctx.stroke();
    } else if (p.shape === 'square') {
      ctx.save(); ctx.translate(x,y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color; ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size); ctx.restore();
    } else if (p.shape === 'star') {
      ctx.fillStyle = p.color; drawStar(x, y, p.size, p.size*0.45, 5, p.rot);
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(x, y, p.size*(0.35+a*0.65), 0, Math.PI*2); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
function spawnFloat(x, y, txt, color='#ffe680', size=22) {
  floaters.push({ x, y, txt, color, size, life:0.95, max:0.95 });
}
function drawFloaters() {
  for (const f of floaters) {
    const a = clamp(f.life/f.max, 0, 1);
    ctx.globalAlpha = a;
    textOut(f.txt, f.x-cam.x, f.y-cam.y, f.color, f.size, 'center', 'rgba(0,0,0,.8)', 5);
    ctx.globalAlpha = 1;
  }
}

// --- Ambient weather (screen-space, per world) ---
const flakes = [];
for (let i=0;i<150;i++) flakes.push({ x:Math.random()*W, y:Math.random()*H, r:0.8+Math.random()*2.4, sp:18+Math.random()*46, sw:Math.random()*Math.PI*2, amp:8+Math.random()*22 });
const motes = [];
for (let i=0;i<70;i++) motes.push({ x:Math.random()*W, y:Math.random()*H, r:0.6+Math.random()*1.8, sp:6+Math.random()*16, sw:Math.random()*Math.PI*2 });
const leaves = [];
for (let i=0;i<34;i++) leaves.push({ x:Math.random()*W, y:Math.random()*H, s:3+Math.random()*4, sp:22+Math.random()*30, sw:Math.random()*Math.PI*2, rot:Math.random()*6.3, vr:(Math.random()-0.5)*2.4 });

function drawWeather(world, t, dt) {
  if (!opts.weather) return;
  if (world === 2) {
    ctx.fillStyle = '#ffffff';
    for (const f of flakes) {
      f.y += f.sp*dt; f.sw += dt*1.6;
      if (f.y > H+6) { f.y = -6; f.x = Math.random()*W; }
      const x = f.x + Math.sin(f.sw)*f.amp*0.35 - cam.x*0.06;
      const sx = ((x % (W+40)) + (W+40)) % (W+40) - 20;
      ctx.globalAlpha = 0.55 + 0.4*Math.sin(f.sw*0.7);
      ctx.beginPath(); ctx.arc(sx, f.y, f.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (world === 1) {
    for (const m of motes) {
      m.y -= m.sp*dt; m.sw += dt*1.1;
      if (m.y < -6) { m.y = H+6; m.x = Math.random()*W; }
      const x = m.x + Math.sin(m.sw)*10 - cam.x*0.08;
      const sx = ((x % (W+40)) + (W+40)) % (W+40) - 20;
      ctx.globalAlpha = 0.16 + 0.3*Math.abs(Math.sin(m.sw));
      ctx.fillStyle = '#9fe8ff';
      ctx.beginPath(); ctx.arc(sx, m.y, m.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else {
    for (const l of leaves) {
      l.y += l.sp*dt; l.sw += dt*2.0; l.rot += l.vr*dt;
      if (l.y > H+10) { l.y = -10; l.x = Math.random()*W; }
      const x = l.x + Math.sin(l.sw)*26 - cam.x*0.09;
      const sx = ((x % (W+60)) + (W+60)) % (W+60) - 30;
      ctx.save(); ctx.translate(sx, l.y); ctx.rotate(l.rot);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = ['#d98b2b','#c46a1f','#9bb03a'][(l.s|0)%3];
      ctx.beginPath(); ctx.ellipse(0,0,l.s*1.6,l.s*0.7,0,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
}

// --- Backgrounds ---
function drawSky(stops) {
  ctx.fillStyle = vgrad(0,0,0,H, stops); ctx.fillRect(0,0,W,H);
}
function drawCloud(x, y, s, alpha) {
  ctx.globalAlpha = alpha; ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(x,        y, s*1.15, s*0.62, 0, 0, Math.PI*2);
  ctx.ellipse(x+s*0.85, y+s*0.14, s*0.78, s*0.46, 0, 0, Math.PI*2);
  ctx.ellipse(x-s*0.85, y+s*0.18, s*0.68, s*0.40, 0, 0, Math.PI*2);
  ctx.ellipse(x+s*0.15, y-s*0.42, s*0.72, s*0.48, 0, 0, Math.PI*2);
  ctx.fill(); ctx.globalAlpha = 1;
}
function drawPine(x, baseY, h, wRatio, body, snowy) {
  const w = h*wRatio;
  ctx.fillStyle = '#3a2a18';
  ctx.fillRect(x-h*0.035, baseY-h*0.18, h*0.07, h*0.19);
  ctx.fillStyle = body;
  for (let tier=0; tier<3; tier++) {
    const ty = baseY - h*0.14 - tier*h*0.26;
    const tw = w*(1 - tier*0.22);
    ctx.beginPath();
    ctx.moveTo(x, ty - h*0.42);
    ctx.lineTo(x + tw/2, ty);
    ctx.lineTo(x - tw/2, ty);
    ctx.closePath(); ctx.fill();
  }
  if (snowy) {
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    for (let tier=0; tier<3; tier++) {
      const ty = baseY - h*0.14 - tier*h*0.26;
      const tw = w*(1 - tier*0.22);
      ctx.beginPath();
      ctx.moveTo(x, ty - h*0.42);
      ctx.lineTo(x + tw*0.30, ty - h*0.16);
      ctx.lineTo(x - tw*0.30, ty - h*0.16);
      ctx.closePath(); ctx.fill();
    }
  }
}
function drawRidge(baseY, amp, spacing, factor, color, seed) {
  const off = cam.x*factor;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-40, H+10);
  const first = Math.floor(off/spacing) - 1;
  const last  = Math.ceil((off+W)/spacing) + 1;
  for (let i = first; i <= last; i++) {
    const px = i*spacing - off;
    const peak = baseY - amp*(0.42 + hash(i*1.7+seed)*0.58);
    ctx.lineTo(px - spacing*0.5, baseY);
    ctx.lineTo(px, peak);
  }
  ctx.lineTo(W+40, baseY); ctx.lineTo(W+40, H+10);
  ctx.closePath(); ctx.fill();
}

function drawForestBg(t, dt) {
  drawSky([[0,'#4fa8d8'],[0.42,'#8fd0e8'],[0.72,'#cbe9d8'],[1,'#e6f2cf']]);
  // sun with soft halo
  const sx = W*0.80 - cam.x*0.02, sy = H*0.17;
  glowDot(sx, sy, 190, 'rgba(255,246,190,.42)');
  glowDot(sx, sy, 78,  'rgba(255,252,225,.95)');
  // far clouds
  parallaxRow(430, 0.10, (x,i) => { if (hash(i*3.1)>0.42) drawCloud(x, 70+hash(i*5.3)*90, 26+hash(i*7.7)*22, 0.5); });
  // distant hazy hills
  drawRidge(H*0.66, 150, 300, 0.14, 'rgba(120,168,150,.55)', 3.3);
  drawRidge(H*0.72, 120, 240, 0.22, 'rgba(86,140,112,.72)', 8.1);
  // near clouds
  parallaxRow(560, 0.18, (x,i) => { if (hash(i*2.3+9)>0.5) drawCloud(x, 110+hash(i*4.1)*70, 34+hash(i*6.1)*26, 0.7); });
  // mid tree line
  parallaxRow(132, 0.36, (x,i) => {
    const h = 118 + hash(i*1.9)*66;
    drawPine(x, H*0.735, h, 0.62, '#2f6b34', false);
  });
  // near tree line - kept low and semi-transparent so it frames the playfield
  ctx.globalAlpha = 0.6;
  parallaxRow(248, 0.58, (x,i) => {
    const h = 150 + hash(i*2.7+4)*76;
    drawPine(x, H*0.885, h, 0.66, '#1d4a26', false);
  });
  ctx.globalAlpha = 1;
  // foreground bushes
  parallaxRow(150, 0.80, (x,i) => {
    const s = 34 + hash(i*3.7+2)*26;
    ctx.fillStyle = '#143a1c';
    ctx.beginPath();
    ctx.ellipse(x, H*0.985, s*1.5, s*0.85, 0, 0, Math.PI*2);
    ctx.ellipse(x+s*0.9, H*0.99, s*1.0, s*0.62, 0, 0, Math.PI*2);
    ctx.fill();
  });
  drawWeather(0, t, dt);
}

function drawCaveBg(t, dt) {
  drawSky([[0,'#04070d'],[0.45,'#0b1626'],[1,'#152a3f']]);
  // deep wall arches
  parallaxRow(260, 0.12, (x,i) => {
    ctx.fillStyle = 'rgba(30,52,76,.55)';
    ctx.beginPath(); ctx.ellipse(x, H*0.62, 150+hash(i*1.3)*90, 210+hash(i*2.9)*130, 0, 0, Math.PI*2); ctx.fill();
  });
  // glowing crystal clusters
  parallaxRow(300, 0.28, (x,i) => {
    if (hash(i*5.1) < 0.42) return;
    // anchored near the cave floor so the clusters grow out of the rock
    const baseY = H*0.74 + hash(i*3.3)*90;
    const hcol = hash(i*7.7);
    const ci = hcol > 0.66 ? 0 : hcol > 0.33 ? 1 : 2;
    const col  = ['#7ce0ff','#b48cff','#5fffc8'][ci];
    const glow = ['rgba(124,224,255,.38)','rgba(180,140,255,.38)','rgba(95,255,200,.38)'][ci];
    glowDot(x, baseY-24, 92, glow);
    for (let k=0;k<3;k++) {
      const kx = x + (k-1)*13, kh = 30 + hash(i*11+k)*36;
      ctx.fillStyle = col; ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(kx, baseY-kh);
      ctx.lineTo(kx+7, baseY-kh*0.32);
      ctx.lineTo(kx+4, baseY);
      ctx.lineTo(kx-4, baseY);
      ctx.lineTo(kx-7, baseY-kh*0.32);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
  });
  // stalactites from the ceiling
  parallaxRow(96, 0.44, (x,i) => {
    const h = 46 + hash(i*1.7+5)*118;
    ctx.fillStyle = '#12212f';
    ctx.beginPath(); ctx.moveTo(x-16, -4); ctx.lineTo(x+16, -4); ctx.lineTo(x, h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(120,170,210,.10)';
    ctx.beginPath(); ctx.moveTo(x-16,-4); ctx.lineTo(x-4,-4); ctx.lineTo(x-2,h*0.6); ctx.closePath(); ctx.fill();
  });
  // light shafts
  ctx.globalAlpha = 0.055;
  parallaxRow(520, 0.20, (x) => {
    ctx.fillStyle = '#bfe6ff';
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x+70, 0); ctx.lineTo(x+180, H); ctx.lineTo(x-30, H); ctx.closePath(); ctx.fill();
  });
  ctx.globalAlpha = 1;
  // foreground rock teeth
  parallaxRow(180, 0.78, (x,i) => {
    const h = 40 + hash(i*4.3+7)*70;
    ctx.fillStyle = '#08111a';
    ctx.beginPath(); ctx.moveTo(x-40, H+8); ctx.lineTo(x, H-h); ctx.lineTo(x+40, H+8); ctx.closePath(); ctx.fill();
  });
  drawWeather(1, t, dt);
}

function drawSnowBg(t, dt) {
  drawSky([[0,'#2b4a7a'],[0.34,'#6b9ac8'],[0.66,'#a9cde8'],[1,'#e2f1fb']]);
  // aurora ribbons
  ctx.globalAlpha = 0.16;
  for (let b=0;b<3;b++) {
    ctx.beginPath();
    const yBase = 70 + b*46;
    ctx.moveTo(-20, yBase);
    for (let x=-20;x<=W+20;x+=40) ctx.lineTo(x, yBase + Math.sin(x*0.006 + t*0.5 + b)*26);
    for (let x=W+20;x>=-20;x-=40) ctx.lineTo(x, yBase + 34 + Math.sin(x*0.006 + t*0.5 + b)*26);
    ctx.closePath();
    ctx.fillStyle = ['#7bffd4','#8fd0ff','#c9a6ff'][b]; ctx.fill();
  }
  ctx.globalAlpha = 1;
  // far mountains with snow caps
  const off = cam.x*0.14, spacing = 330;
  for (let i = Math.floor(off/spacing)-1; i <= Math.ceil((off+W)/spacing)+1; i++) {
    const x = i*spacing - off;
    const peak = H*0.34 + hash(i*2.1)*70;
    const base = H*0.74;
    ctx.fillStyle = '#5d7fa8';
    ctx.beginPath(); ctx.moveTo(x-190, base); ctx.lineTo(x, peak); ctx.lineTo(x+190, base); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#eef6ff';
    ctx.beginPath();
    ctx.moveTo(x, peak);
    ctx.lineTo(x+56, peak+(base-peak)*0.30);
    ctx.lineTo(x+28, peak+(base-peak)*0.24);
    ctx.lineTo(x+8,  peak+(base-peak)*0.34);
    ctx.lineTo(x-20, peak+(base-peak)*0.22);
    ctx.lineTo(x-52, peak+(base-peak)*0.30);
    ctx.closePath(); ctx.fill();
  }
  drawRidge(H*0.80, 90, 250, 0.26, '#8fb4d4', 5.5);
  // snowy pines - kept below the play band so platforms stay readable
  parallaxRow(148, 0.42, (x,i) => drawPine(x, H*0.775, 108+hash(i*1.9)*58, 0.62, '#2b5545', true));
  ctx.globalAlpha = 0.6;
  parallaxRow(266, 0.64, (x,i) => drawPine(x, H*0.925, 146+hash(i*3.1+3)*74, 0.66, '#1e3f36', true));
  ctx.globalAlpha = 1;
  // foreground snow drifts
  parallaxRow(230, 0.84, (x,i) => {
    const s = 50 + hash(i*4.7)*40;
    ctx.fillStyle = '#dcecf9';
    ctx.beginPath(); ctx.ellipse(x, H*1.005, s*2.1, s*0.8, 0, 0, Math.PI*2); ctx.fill();
  });
  drawWeather(2, t, dt);
}

function drawWorldBg(world, t, dt) {
  if (world === 1) drawCaveBg(t, dt);
  else if (world === 2) drawSnowBg(t, dt);
  else drawForestBg(t, dt);
}
/**
 * Atmospheric haze laid over the scenery before the playfield is drawn.
 * Pushes every background layer back so platforms, enemies and the bear
 * read as the foreground instead of competing with the trees.
 */
function hazeScrim(world) {
  const c = ['rgba(158,206,224,.30)', 'rgba(16,34,54,.30)', 'rgba(214,234,250,.34)'][world] || 'rgba(158,206,224,.30)';
  ctx.fillStyle = c; ctx.fillRect(0,0,W,H);
}

// --- Platforms ---
function drawPlatform(p, world, t) {
  const [px,py,pw,ph] = p;
  const x = px-cam.x, y = py-cam.y;
  if (x > W+60 || x+pw < -60) return;

  // contact shadow
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.fillRect(x+4, y+ph, pw-8, 8);

  if (world === 0) {
    // dirt body
    ctx.fillStyle = vgrad(0,y,0,y+ph, [[0,'#7a5330'],[0.35,'#5d3d21'],[1,'#3a2513']]);
    rrPath(x, y, pw, ph, 5); ctx.fill();
    // pebbles
    ctx.fillStyle = 'rgba(0,0,0,.20)';
    for (let i=0; i*26 < pw; i++) {
      const h1 = hash(px*0.13 + i*3.7);
      if (h1 < 0.42) continue;
      const dx = x + i*26 + h1*16, dy = y + 12 + hash(px*0.29+i*1.9)*(ph-16);
      if (dy > y+ph-4) continue;
      ctx.beginPath(); ctx.arc(dx, dy, 1.5+h1*2.4, 0, Math.PI*2); ctx.fill();
    }
    // grass cap
    const gh = Math.min(11, ph);
    ctx.fillStyle = vgrad(0,y,0,y+gh, [[0,'#79d14f'],[1,'#3f8a34']]);
    rrPath(x, y, pw, gh, 5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(x+3, y+1, pw-6, 2);
    // grass blades swaying on the lip
    ctx.fillStyle = '#4fa53c';
    for (let i=0; i*13 < pw; i++) {
      const h1 = hash(px*0.07 + i*5.1);
      if (h1 < 0.34) continue;
      const bx = x + i*13 + h1*6;
      if (bx > x+pw-4) continue;
      const bh = 5 + h1*8;
      const sway = Math.sin(t*1.7 + i*0.8 + px*0.01)*2.6;
      ctx.beginPath();
      ctx.moveTo(bx-2, y+1); ctx.lineTo(bx+sway, y-bh); ctx.lineTo(bx+2, y+1);
      ctx.closePath(); ctx.fill();
    }
  } else if (world === 1) {
    // rock body
    ctx.fillStyle = vgrad(0,y,0,y+ph, [[0,'#75809a'],[0.4,'#4b5468'],[1,'#252b38']]);
    rrPath(x, y, pw, ph, 4); ctx.fill();
    // cracks
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.5;
    for (let i=0; i*44 < pw; i++) {
      const h1 = hash(px*0.11 + i*2.3);
      if (h1 < 0.45) continue;
      const cx0 = x + i*44 + h1*22;
      ctx.beginPath();
      ctx.moveTo(cx0, y+4);
      ctx.lineTo(cx0 + (h1-0.5)*14, y + ph*0.5);
      ctx.lineTo(cx0 + (h1-0.5)*22, y + ph-3);
      ctx.stroke();
    }
    // lit top edge
    ctx.fillStyle = '#a3b1c8'; ctx.fillRect(x+2, y, pw-4, 3);
    ctx.fillStyle = 'rgba(180,220,250,.28)'; ctx.fillRect(x+2, y+3, pw-4, 2);
    // luminous moss
    for (let i=0; i*58 < pw; i++) {
      const h1 = hash(px*0.19 + i*6.7);
      if (h1 < 0.55) continue;
      const mx = x + i*58 + h1*30;
      if (mx > x+pw-6) continue;
      const pulse = 0.5 + 0.5*Math.sin(t*2 + i);
      glowDot(mx, y+2, 13, 'rgba(110,240,210,.55)', 0.35+pulse*0.4);
      ctx.fillStyle = '#7dffd8'; ctx.globalAlpha = 0.6+pulse*0.4;
      ctx.beginPath(); ctx.arc(mx, y+2, 2.1, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  } else {
    // frozen rock body
    ctx.fillStyle = vgrad(0,y,0,y+ph, [[0,'#8ba2bd'],[0.4,'#5f7592'],[1,'#3b4a63']]);
    rrPath(x, y, pw, ph, 5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.10)';
    for (let i=0; i*36 < pw; i++) {
      const h1 = hash(px*0.17 + i*4.1);
      if (h1 < 0.5) continue;
      ctx.fillRect(x + i*36 + h1*18, y + 10 + h1*(ph-18), 10+h1*14, 2);
    }
    // snow cap with a soft wavy crest
    const sh = Math.min(13, ph);
    ctx.fillStyle = vgrad(0,y-4,0,y+sh, [[0,'#ffffff'],[1,'#cfe3f4']]);
    ctx.beginPath();
    ctx.moveTo(x, y+sh);
    ctx.lineTo(x, y+2);
    for (let bx=0; bx<=pw; bx+=18) {
      ctx.quadraticCurveTo(x+bx+9, y - 2 - hash(px*0.05+bx*0.3)*4, x+Math.min(bx+18,pw), y+1);
    }
    ctx.lineTo(x+pw, y+sh);
    ctx.closePath(); ctx.fill();
    // icicles under thin ledges
    if (ph <= 24) {
      ctx.fillStyle = 'rgba(214,238,255,.85)';
      for (let i=0; i*30 < pw; i++) {
        const h1 = hash(px*0.23 + i*7.3);
        if (h1 < 0.55) continue;
        const ix = x + i*30 + h1*16, il = 6 + h1*14;
        if (ix > x+pw-5) continue;
        ctx.beginPath(); ctx.moveTo(ix-3.5, y+ph); ctx.lineTo(ix+3.5, y+ph); ctx.lineTo(ix, y+ph+il); ctx.closePath(); ctx.fill();
      }
    }
  }
}
function drawPlatforms(plats, world, t) { for (const p of plats) drawPlatform(p, world, t); }
