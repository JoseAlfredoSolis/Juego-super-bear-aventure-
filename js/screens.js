// Super Bear Adventure - Every menu and full-screen scene.
// Loaded as a classic script; all top-level names are shared with the
// other files in load order (see index.html).

// --- Shared menu chrome ---
function menuButton(cx, cy, w, h, label, selected, t, accent='#ffd44e', fill=['rgba(60,120,50,.95)','rgba(26,70,26,.95)'], glow='rgba(255,205,80,.22)') {
  const s = selected ? 1 + Math.sin(t*6)*0.018 : 1;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
  if (selected) {
    glowDot(cx, cy, w*0.62, glow);
    ctx.fillStyle = vgrad(0, cy-h/2, 0, cy+h/2, [[0,fill[0]],[1,fill[1]]]);
    rrPath(cx-w/2, cy-h/2, w, h, 14); ctx.fill();
    strokeRR(cx-w/2, cy-h/2, w, h, 14, accent, 3);
    textOut(label, cx, cy + h*0.16, '#fff6cf', h*0.44, 'center', 'rgba(0,0,0,.8)', 6);
    // side arrows
    ctx.fillStyle = accent;
    const ax = w/2 + 16, wob = Math.sin(t*7)*3;
    ctx.beginPath(); ctx.moveTo(cx-ax-wob, cy-8); ctx.lineTo(cx-ax-wob+11, cy); ctx.lineTo(cx-ax-wob, cy+8); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx+ax+wob, cy-8); ctx.lineTo(cx+ax+wob-11, cy); ctx.lineTo(cx+ax+wob, cy+8); ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle = 'rgba(8,16,12,.5)';
    rrPath(cx-w/2, cy-h/2, w, h, 14); ctx.fill();
    strokeRR(cx-w/2, cy-h/2, w, h, 14, 'rgba(255,255,255,.16)', 2);
    textOut(label, cx, cy + h*0.16, 'rgba(226,238,226,.82)', h*0.40, 'center', 'rgba(0,0,0,.7)', 5);
  }
  ctx.restore();
}
function titleText(str, cx, cy, size, t) {
  ctx.save();
  ctx.font = `bold ${size}px ${FONT_TITLE}`; ctx.textAlign='center'; ctx.lineJoin='round';
  // drop shadow
  ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillText(str, cx+4, cy+6);
  // heavy outline
  ctx.lineWidth = size*0.17; ctx.strokeStyle = '#2a1a06'; ctx.strokeText(str, cx, cy);
  ctx.lineWidth = size*0.08; ctx.strokeStyle = '#8a5a12'; ctx.strokeText(str, cx, cy);
  // gold gradient fill
  const g = ctx.createLinearGradient(0, cy-size*0.85, 0, cy+size*0.15);
  g.addColorStop(0,'#fff6c9'); g.addColorStop(0.45,'#ffd23f'); g.addColorStop(0.55,'#f6a81c'); g.addColorStop(1,'#ffe887');
  ctx.fillStyle = g; ctx.fillText(str, cx, cy);
  // sweeping shine
  const sweep = ((t*0.35) % 1.6) - 0.3;
  ctx.save();
  ctx.beginPath(); ctx.rect(cx - size*6, cy-size, size*12, size*1.3); ctx.clip();
  const sg = ctx.createLinearGradient(cx - size*6 + sweep*size*12, 0, cx - size*6 + sweep*size*12 + size*1.6, 0);
  sg.addColorStop(0,'rgba(255,255,255,0)'); sg.addColorStop(0.5,'rgba(255,255,255,.55)'); sg.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle = sg; ctx.fillText(str, cx, cy);
  ctx.restore();
  ctx.restore();
}
function hintBar(str) {
  ctx.fillStyle = 'rgba(0,0,0,.42)'; ctx.fillRect(0, H-40, W, 40);
  textOut(str, W/2, H-15, 'rgba(228,240,255,.85)', 15, 'center', 'rgba(0,0,0,.8)', 4);
}

// --- Menu Scene ---
let menuSel=0, menuT=0;
const menuItems=['JUGAR','PERSONAJES','INSTRUCCIONES','OPCIONES'];

function updateMenu(dt) {
  menuT+=dt;
  updateParticles(dt);
  const n = menuItems.length;
  if (pressed('ArrowUp')||pressed('KeyW'))   menuSel=(menuSel-1+n)%n;
  if (pressed('ArrowDown')||pressed('KeyS')) menuSel=(menuSel+1)%n;
  if (pressed('Enter')||pressed('Space')) {
    if (menuSel===0) { gs.scene='worldmap'; wmSel=0; wmLvl=0; }
    if (menuSel===1) { gs.scene='charselect'; csSel=CHARACTERS.findIndex(c=>c.id===gs.charId); if(csSel<0)csSel=0; }
    if (menuSel===2) { gs.scene='instructions'; }
    if (menuSel===3) { gs.scene='settings'; setSel=0; }
  }
}

function drawMenu(t, dt) {
  // slowly drifting forest as a living backdrop
  const ox = cam.x, oy = cam.y;
  cam.x = t*22; cam.y = 0;
  drawForestBg(t, dt);
  cam.x = ox; cam.y = oy;

  ctx.fillStyle = 'rgba(4,12,8,.34)'; ctx.fillRect(0,0,W,H);

  // hero bear waving on a little mound
  ctx.save();
  ctx.translate(W*0.5, 268);
  const idle = Math.sin(t*2)*3;
  ctx.translate(0, idle);
  ctx.scale(2.35, 2.35);
  drawChar(curChar(), Math.sin(t*1.4)*0.35, 1, 0, null, (Math.sin(t*0.8) > 0.985) ? 1 : 0, t);
  ctx.restore();
  ell(W*0.5, 272, 52, 11, 'rgba(0,0,0,.28)');

  const bob = Math.sin(t*1.6)*6;
  titleText('SUPER BEAR', W/2, 118 + bob, 76, t);
  titleText('ADVENTURE',  W/2, 186 + bob, 62, t);
  textOut('A MonoGame C# platformer · HTML5 edition', W/2, 218 + bob, 'rgba(226,244,255,.8)', 16, 'center', 'rgba(0,0,0,.75)', 4);

  for (let i=0;i<menuItems.length;i++) {
    menuButton(W/2, 382 + i*68, 320, 52, menuItems[i], i===menuSel, t);
  }

  // best score badge
  hudPanel(W-206, 16, 190, 46, 12);
  drawStarPath(W-180, 39, 11, 5, 5, t*1.2); ctx.fillStyle='#ffd44e'; ctx.fill();
  textOut(`BEST  ${gs.highScore}`, W-26, 46, '#eaf6ff', 20, 'right', 'rgba(0,0,0,.8)', 5);

  // active character + view badges
  hudPanel(16, 16, 210, 46, 12);
  ctx.save(); ctx.translate(44, 56); ctx.scale(0.62, 0.62);
  drawChar(curChar(), 0, 1, 0, null, 0, t);
  ctx.restore();
  textOut(curChar().name, 68, 38, '#eaf6ff', 18, 'left', 'rgba(0,0,0,.8)', 4);
  textOut(curChar().kind, 68, 55, 'rgba(200,224,244,.75)', 12, 'left', 'rgba(0,0,0,.8)', 3);
  hudPanel(16, 70, 84, 34, 10);
  textOut(opts.render3d ? 'VISTA 3D' : 'VISTA 2D', 58, 93,
          opts.render3d ? '#8dff9c' : '#7fd8ff', 13, 'center', 'rgba(0,0,0,.8)', 4);

  drawVignette(0.42);
  hintBar('↑ ↓  Navegar     ENTER  Seleccionar     V  Cambiar vista 2D/3D');
}

// --- Character Select ---
let csSel = 0;

function updateCharSelect(dt) {
  updateParticles(dt);
  const n = CHARACTERS.length;
  if (pressed('ArrowLeft')||pressed('KeyA'))  csSel = (csSel-1+n)%n;
  if (pressed('ArrowRight')||pressed('KeyD')) csSel = (csSel+1)%n;
  if (pressed('Enter')||pressed('Space')) {
    gs.charId = CHARACTERS[csSel].id;
    gs.scene = 'menu'; menuSel = 1;
  }
  if (pressed('Escape')) gs.scene = 'menu';
  if (pressed('KeyV')) opts.render3d = !opts.render3d;
}

/** Horizontal 0..1 stat meter used on the character cards. */
function statBar(x, y, w, frac, col, label, value) {
  textOut(label, x, y-6, 'rgba(196,218,238,.85)', 12, 'left', 'rgba(0,0,0,.8)', 3);
  textOut(value, x+w, y-6, col, 12, 'right', 'rgba(0,0,0,.8)', 3);
  fillRR(x, y, w, 8, 4, 'rgba(0,0,0,.45)');
  ctx.fillStyle = col; rrPath(x, y, w*clamp(frac,0,1), 8, 4); ctx.fill();
  strokeRR(x, y, w, 8, 4, 'rgba(255,255,255,.25)', 1);
}

function drawCharSelect(t, dt) {
  const ox = cam.x; cam.x = t*16;
  drawWorldBg(0, t, dt);
  cam.x = ox;
  ctx.fillStyle = 'rgba(5,11,9,.68)'; ctx.fillRect(0,0,W,H);

  titleText('ELIGE TU PERSONAJE', W/2, 76, 44, t);

  const n = CHARACTERS.length;
  const cw = 208, gap = 14;
  const total = n*cw + (n-1)*gap;
  const x0 = W/2 - total/2;

  for (let i=0;i<n;i++) {
    const c = CHARACTERS[i];
    const sel = i === csSel;
    const cx = x0 + i*(cw+gap) + cw/2;
    const ch = sel ? 372 : 336;
    const cy = 330;
    const cardY = cy - ch/2;

    ctx.save();
    if (sel) { const s = 1.02 + Math.sin(t*3)*0.008; ctx.translate(cx,cy); ctx.scale(s,s); ctx.translate(-cx,-cy); }
    if (sel) glowDot(cx, cy, cw*0.9, 'rgba(255,210,80,.20)');

    ctx.fillStyle = vgrad(0, cardY, 0, cardY+ch,
      [[0, sel ? 'rgba(38,54,44,.97)' : 'rgba(20,28,26,.86)'],
       [1, sel ? 'rgba(14,24,20,.97)' : 'rgba(10,15,14,.86)']]);
    rrPath(cx-cw/2, cardY, cw, ch, 18); ctx.fill();
    strokeRR(cx-cw/2, cardY, cw, ch, 18, sel ? '#ffd44e' : 'rgba(255,255,255,.14)', sel ? 3.5 : 2);

    // portrait well
    fillRR(cx-cw/2+12, cardY+12, cw-24, 138, 12, 'rgba(0,0,0,.30)');
    glowDot(cx, cardY+120, 62, `rgba(255,255,255,${sel ? 0.12 : 0.06})`);
    ctx.save();
    ctx.translate(cx, cardY+138);
    const sc = sel ? 2.25 : 1.95;
    ctx.scale(sc, sc);
    drawChar(c, sel ? Math.sin(t*3)*0.45 : 0, 1, 0, null,
             (sel && Math.sin(t*0.9) > 0.97) ? 1 : 0, t);
    ctx.restore();
    ell(cx, cardY+142, 34, 7, 'rgba(0,0,0,.34)');

    textOut(c.name, cx, cardY+180, sel ? '#ffd44e' : '#eaf6ff', 24, 'center', 'rgba(0,0,0,.8)', 5);
    textOut(c.kind, cx, cardY+200, 'rgba(200,224,244,.8)', 13, 'center', 'rgba(0,0,0,.8)', 3);

    const bx = cx - cw/2 + 20, bw = cw - 40;
    statBar(bx, cardY+228, bw, (c.speed-0.8)/0.5, '#8dff9c', 'VELOCIDAD', `${Math.round(c.speed*100)}%`);
    statBar(bx, cardY+264, bw, (c.jump -0.8)/0.5, '#7ce8ff', 'SALTO',     `${Math.round(c.jump*100)}%`);
    statBar(bx, cardY+300, bw, ((1/c.fall)-0.9)/0.7, '#ffd44e', 'PLANEO', `${Math.round(100/c.fall)}%`);

    if (sel) {
      fillRR(cx-cw/2+12, cardY+ch-40, cw-24, 28, 8, 'rgba(255,212,78,.16)');
      textOut(c.perk, cx, cardY+ch-21, '#ffe7a0', 11.5, 'center', 'rgba(0,0,0,.85)', 3);
    }
    ctx.restore();
  }

  // selected-character summary strip
  const c = CHARACTERS[csSel];
  hudPanel(W/2-330, 540, 660, 62, 14);
  textOut(`${c.name} — ${c.perk}`, W/2, 570, '#ffffff', 19, 'center', 'rgba(0,0,0,.8)', 5);
  textOut(c.djump ? 'Doble salto sin necesidad de power-up' : 'Consigue el power-up 2x para doble salto',
          W/2, 590, 'rgba(200,224,244,.8)', 13, 'center', 'rgba(0,0,0,.8)', 3);

  drawVignette(0.4);
  hintBar('← →  Cambiar personaje     ENTER  Confirmar     ESC  Volver');
}

// --- Settings ---
let setSel = 0;
const settingRows = [
  { key:'render3d',  label:'VISTA',            on:'3D — diorama en perspectiva', off:'2D — vista lateral clásica' },
  { key:'particles', label:'PARTÍCULAS',       on:'Activadas', off:'Desactivadas' },
  { key:'shake',     label:'SACUDIDA',         on:'Activada',  off:'Desactivada' },
  { key:'weather',   label:'CLIMA AMBIENTAL',  on:'Activado',  off:'Desactivado' },
  { key:'showFps',   label:'CONTADOR DE FPS',  on:'Visible',   off:'Oculto' },
];

function updateSettings(dt) {
  updateParticles(dt);
  const n = settingRows.length + 1;   // + "volver"
  if (pressed('ArrowUp'))   setSel = (setSel-1+n)%n;
  if (pressed('ArrowDown')) setSel = (setSel+1)%n;
  const toggle = pressed('Enter')||pressed('Space')||pressed('ArrowLeft')||pressed('ArrowRight');
  if (toggle) {
    if (setSel === settingRows.length) { gs.scene='menu'; menuSel=3; }
    else {
      const k = settingRows[setSel].key;
      opts[k] = !opts[k];
    }
  }
  if (pressed('Escape')) { gs.scene='menu'; menuSel=3; }
}

function drawSettings(t, dt) {
  const ox = cam.x; cam.x = t*12;
  drawWorldBg(gs.world, t, dt);
  cam.x = ox;
  ctx.fillStyle = 'rgba(5,9,14,.72)'; ctx.fillRect(0,0,W,H);

  titleText('OPCIONES', W/2, 88, 46, t);

  const bw = 760, bx = W/2 - bw/2;
  settingRows.forEach((row, i) => {
    const ry = 150 + i*72;
    const sel = i === setSel;
    const on = !!opts[row.key];
    if (sel) glowDot(W/2, ry+26, 300, 'rgba(255,210,80,.13)');
    ctx.fillStyle = sel ? 'rgba(34,50,40,.95)' : 'rgba(14,20,24,.72)';
    rrPath(bx, ry, bw, 56, 14); ctx.fill();
    strokeRR(bx, ry, bw, 56, 14, sel ? '#ffd44e' : 'rgba(255,255,255,.12)', sel ? 3 : 1.5);

    textOut(row.label, bx+26, ry+26, sel ? '#ffd44e' : '#eaf6ff', 17, 'left', 'rgba(0,0,0,.8)', 4);
    textOut(on ? row.on : row.off, bx+26, ry+46, 'rgba(198,220,240,.8)', 13, 'left', 'rgba(0,0,0,.8)', 3);

    // pill switch
    const sx = bx+bw-124, sy = ry+16, sw2 = 84, sh2 = 26;
    fillRR(sx, sy, sw2, sh2, 13, on ? 'rgba(80,200,120,.85)' : 'rgba(90,100,116,.7)');
    strokeRR(sx, sy, sw2, sh2, 13, 'rgba(255,255,255,.35)', 1.5);
    const knob = on ? sx + sw2 - 21 : sx + 5;
    ell(knob+8, sy+13, 11, 11, '#ffffff');
    textOut(on ? 'ON' : 'OFF', on ? sx+22 : sx+58, sy+18,
            on ? '#0d2a16' : '#e6ecf4', 12, 'center', 'rgba(0,0,0,.25)', 0);
  });

  const backSel = setSel === settingRows.length;
  menuButton(W/2, 150 + settingRows.length*72 + 34, 260, 50, 'VOLVER', backSel, t);

  drawVignette(0.38);
  hintBar('↑ ↓  Moverse     ENTER / ← →  Cambiar     ESC  Volver');
}

// --- Instructions ---
function drawInstructions(t, dt) {
  const ox = cam.x; cam.x = t*10;
  drawForestBg(t, dt);
  cam.x = ox;
  ctx.fillStyle = 'rgba(4,10,8,.66)'; ctx.fillRect(0,0,W,H);

  titleText('INSTRUCTIONS', W/2, 82, 48, t);

  const cols = [
    { title:'CONTROLES', x: W*0.27, rows:[
      ['← →  /  A D', 'Mover'],
      ['SPACE / W / ↑', 'Saltar'],
      ['SPACE en el aire', 'Doble salto'],
      ['Caer encima', 'Derrotar enemigos'],
      ['V', 'Cambiar vista 2D / 3D'],
      ['ESC  /  P', 'Pausa'],
    ]},
    { title:'PUNTOS', x: W*0.73, rows:[
      ['Moneda', '50 pts'],
      ['Estrella', '200 pts'],
      ['Enemigo', '100 pts'],
      ['Jefe final', '1000 pts'],
      ['Bandera de meta', '500 pts'],
      ['Personajes', `${CHARACTERS.length} jugables`],
    ]},
  ];
  for (const col of cols) {
    hudPanel(col.x - 270, 126, 540, 285, 16);
    textOut(col.title, col.x, 160, '#ffd44e', 22, 'center', 'rgba(0,0,0,.8)', 5);
    col.rows.forEach(([k,v], i) => {
      const ry = 200 + i*36;
      fillRR(col.x-246, ry-20, 250, 28, 8, 'rgba(255,255,255,.08)');
      textOut(k, col.x-234, ry, '#eaf6ff', 15, 'left', 'rgba(0,0,0,.8)', 4);
      textOut(v, col.x+248, ry, 'rgba(200,224,244,.9)', 15, 'right', 'rgba(0,0,0,.8)', 4);
    });
  }

  // power-up legend with live icons
  hudPanel(W/2-390, 420, 780, 114, 16);
  textOut('POWER-UPS', W/2, 452, '#ffd44e', 20, 'center', 'rgba(0,0,0,.8)', 5);
  const pus = [
    ['djump','#7ce8ff','DOBLE SALTO','Un salto extra en el aire'],
    ['speed','#8dff9c','VELOCIDAD','Te mueves un 65% más rápido'],
    ['inv','#ffe37a','INVENCIBLE','Los enemigos no te dañan'],
  ];
  pus.forEach(([type,col,name,desc], i) => {
    const px = W/2 - 260 + i*260;
    glowDot(px, 500, 26, 'rgba(255,255,255,.12)');
    const g = ctx.createRadialGradient(px-4, 495, 2, px, 500, 16);
    g.addColorStop(0,'#fff'); g.addColorStop(0.35, col); g.addColorStop(1, 'rgba(0,0,0,.35)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, 500, 15, 0, Math.PI*2); ctx.fill();
    drawPowerIcon(px, 500, type, 'rgba(20,30,40,.85)');
    textOut(name, px+26, 494, col, 15, 'left', 'rgba(0,0,0,.8)', 4);
    textOut(desc, px+26, 512, 'rgba(210,230,245,.8)', 12, 'left', 'rgba(0,0,0,.8)', 3);
  });

  // a live enemy line-up so the player knows what they're facing
  hudPanel(W/2-390, 552, 780, 108, 16);
  textOut('ENEMIGOS', W/2, 580, '#ff9a6a', 18, 'center', 'rgba(0,0,0,.8)', 5);
  const demo = [
    { type:'patrol', label:'PATRULLA', x:W/2-250 },
    { type:'chaser', label:'PERSEGUIDOR', x:W/2-10 },
    { type:'boss',   label:'JEFE', x:W/2+240 },
  ];
  const savedCam = { x:cam.x, y:cam.y };
  cam.x = 0; cam.y = 0;
  for (const d of demo) {
    const w = d.type==='boss'?58:34, h = d.type==='boss'?66:38;
    const scale = d.type==='boss' ? 0.62 : 0.86;
    ctx.save(); ctx.translate(d.x, 640); ctx.scale(scale, scale); ctx.translate(-d.x, -640);
    drawEnemy({ x:d.x-w/2, y:640-h, w, h, type:d.type, active:true, vx:1, hitFlash:0, animT:t*2, hp:3, phase:'patrol', noBar:true }, t, null, d.x+200, 600);
    ctx.restore();
    textOut(d.label, d.x, 656, 'rgba(226,240,252,.9)', 13, 'center', 'rgba(0,0,0,.8)', 4);
  }
  cam.x = savedCam.x; cam.y = savedCam.y;

  drawVignette(0.35);
  hintBar('ENTER o ESC para volver');
  if (pressed('Enter')||pressed('Escape')) gs.scene='menu';
}

// --- World Map ---
let wmSel=0, wmLvl=0;
const worldNames=['FOREST','CAVE','SNOW'];
const worldSubs=['Bosque soleado','Cuevas de cristal','Cumbres heladas'];
const worldColors=[['#2d6e1a','#12300d'],['#2a3f5a','#0a1420'],['#5f8fbd','#22405f']];

function updateWorldMap(dt) {
  updateParticles(dt);
  if (pressed('ArrowLeft'))  wmSel=Math.max(0,wmSel-1);
  if (pressed('ArrowRight')) wmSel=Math.min(2,wmSel+1);
  if (pressed('ArrowUp'))    wmLvl=Math.max(0,wmLvl-1);
  if (pressed('ArrowDown'))  wmLvl=Math.min(2,wmLvl+1);
  if (pressed('Enter')||pressed('Space')) {
    if (gs.worldUnlocked[wmSel]) {
      gs.world=wmSel; gs.level=wmLvl;
      startLevel(); gs.scene='gameplay';
    }
  }
  if (pressed('Escape')) gs.scene='menu';
}

/** Small illustrated preview of a world, drawn inside a card. */
function worldThumb(x, y, w, h, wi, t, locked) {
  ctx.save();
  rrPath(x, y, w, h, 12); ctx.clip();
  if (wi === 0) {
    ctx.fillStyle = vgrad(0,y,0,y+h, [[0,'#6fc0e0'],[1,'#cfe9c4']]); ctx.fillRect(x,y,w,h);
    glowDot(x+w*0.78, y+h*0.24, 34, 'rgba(255,246,190,.85)');
    for (let i=0;i<6;i++) drawPine(x + 14 + i*(w/5.4) + Math.sin(t+i)*1.5, y+h-8, 52+((i*13)%22), 0.62, i%2?'#2f6b34':'#1d4a26', false);
    ctx.fillStyle='#4b8b3a'; ctx.fillRect(x, y+h-12, w, 12);
  } else if (wi === 1) {
    ctx.fillStyle = vgrad(0,y,0,y+h, [[0,'#08111c'],[1,'#16324a']]); ctx.fillRect(x,y,w,h);
    for (let i=0;i<7;i++) {
      const sx2 = x + 10 + i*(w/6.6);
      ctx.fillStyle='#12212f';
      ctx.beginPath(); ctx.moveTo(sx2-8,y); ctx.lineTo(sx2+8,y); ctx.lineTo(sx2, y+18+((i*11)%22)); ctx.closePath(); ctx.fill();
    }
    for (let i=0;i<3;i++) {
      const gx2 = x + 26 + i*(w/3.1), gy2 = y+h-22;
      glowDot(gx2, gy2, 26, 'rgba(120,225,255,.45)');
      ctx.fillStyle = ['#7ce0ff','#b48cff','#5fffc8'][i];
      ctx.beginPath(); ctx.moveTo(gx2, gy2-22); ctx.lineTo(gx2+7, gy2-6); ctx.lineTo(gx2-7, gy2-6); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle='#1b2733'; ctx.fillRect(x, y+h-12, w, 12);
  } else {
    ctx.fillStyle = vgrad(0,y,0,y+h, [[0,'#3a5e92'],[1,'#d8ecfa']]); ctx.fillRect(x,y,w,h);
    ctx.fillStyle='#5d7fa8';
    ctx.beginPath(); ctx.moveTo(x-10,y+h-14); ctx.lineTo(x+w*0.42, y+16); ctx.lineTo(x+w*0.86, y+h-14); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#eef6ff';
    ctx.beginPath(); ctx.moveTo(x+w*0.42,y+16); ctx.lineTo(x+w*0.55,y+40); ctx.lineTo(x+w*0.42,y+34); ctx.lineTo(x+w*0.30,y+42); ctx.closePath(); ctx.fill();
    for (let i=0;i<4;i++) drawPine(x + 20 + i*(w/3.6), y+h-8, 44, 0.62, '#22493d', true);
    ctx.fillStyle='#eaf5ff'; ctx.fillRect(x, y+h-12, w, 12);
    ctx.fillStyle='rgba(255,255,255,.85)';
    for (let i=0;i<16;i++) {
      const fy = ((t*22 + i*23) % (h+10));
      ctx.beginPath(); ctx.arc(x + ((i*37)%w), y + fy, 1.4, 0, Math.PI*2); ctx.fill();
    }
  }
  if (locked) { ctx.fillStyle='rgba(6,10,16,.72)'; ctx.fillRect(x,y,w,h); }
  ctx.restore();
}

function drawWorldMap(t, dt) {
  // subtle animated backdrop of the selected world
  const ox = cam.x, oy = cam.y;
  cam.x = t*14; cam.y = 0;
  drawWorldBg(wmSel, t, dt);
  cam.x = ox; cam.y = oy;
  ctx.fillStyle='rgba(5,9,14,.62)'; ctx.fillRect(0,0,W,H);

  titleText('SELECT WORLD', W/2, 74, 44, t);

  for (let wi=0; wi<3; wi++) {
    const cx = W/2 + (wi-1)*386, cy = H/2 + 6;
    const cw = 340, ch = 372;
    const cardX = cx - cw/2, cardY = cy - ch/2;
    const locked = !gs.worldUnlocked[wi];
    const sel = wi === wmSel;
    const [c1,c2] = worldColors[wi];

    ctx.save();
    if (sel) { const s = 1.035 + Math.sin(t*3)*0.008; ctx.translate(cx,cy); ctx.scale(s,s); ctx.translate(-cx,-cy); }

    if (sel) glowDot(cx, cy, cw*0.82, 'rgba(255,210,80,.20)');
    // card body
    ctx.fillStyle = vgrad(0, cardY, 0, cardY+ch, [[0, locked ? '#20242c' : c1],[1, locked ? '#0f1116' : c2]]);
    rrPath(cardX, cardY, cw, ch, 18); ctx.fill();
    strokeRR(cardX, cardY, cw, ch, 18, sel ? '#ffd44e' : 'rgba(255,255,255,.15)', sel ? 3.5 : 2);

    worldThumb(cardX+14, cardY+52, cw-28, 150, wi, t, locked);

    textOut(worldNames[wi], cx, cardY+36, locked ? 'rgba(190,200,215,.6)' : '#ffffff', 26, 'center', 'rgba(0,0,0,.8)', 5);
    textOut(worldSubs[wi], cx, cardY+222, locked ? 'rgba(160,172,190,.55)' : 'rgba(220,238,252,.85)', 14, 'center', 'rgba(0,0,0,.8)', 4);

    if (locked) {
      // padlock
      const lx = cx, ly = cardY+282;
      ctx.strokeStyle='rgba(200,210,228,.7)'; ctx.lineWidth=5;
      ctx.beginPath(); ctx.arc(lx, ly-12, 13, Math.PI, 0); ctx.stroke();
      fillRR(lx-19, ly-12, 38, 30, 6, 'rgba(200,210,228,.75)');
      ctx.fillStyle='#20242c'; ctx.beginPath(); ctx.arc(lx, ly+1, 4, 0, Math.PI*2); ctx.fill();
      ctx.fillRect(lx-2, ly+1, 4, 8);
      textOut('BLOQUEADO', cx, cardY+334, 'rgba(200,210,228,.75)', 15, 'center', 'rgba(0,0,0,.8)', 4);
    } else {
      const done = gs.levelDone[wi];
      for (let lv=0; lv<3; lv++) {
        const lx = cx + (lv-1)*92, ly = cardY+286;
        const lsel = sel && lv === wmLvl;
        const r = lsel ? 27 : 22;
        if (lsel) glowDot(lx, ly, 46, 'rgba(120,255,140,.35)');
        ctx.fillStyle = done[lv]
          ? vgrad(0,ly-r,0,ly+r, [[0,'#ffe07a'],[1,'#e0a010']])
          : lsel ? vgrad(0,ly-r,0,ly+r, [[0,'#8dff9c'],[1,'#2aa347']])
                 : 'rgba(255,255,255,.16)';
        ctx.beginPath(); ctx.arc(lx, ly, r, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = lsel ? '#ffffff' : 'rgba(255,255,255,.35)'; ctx.lineWidth = lsel ? 3 : 2;
        ctx.beginPath(); ctx.arc(lx, ly, r, 0, Math.PI*2); ctx.stroke();
        textOut(String(lv+1), lx, ly+7, done[lv] || lsel ? '#1a2410' : 'rgba(255,255,255,.85)', lsel ? 22 : 18, 'center', 'rgba(0,0,0,.35)', 3);
        if (lv === 2) textOut('BOSS', lx, ly+r+16, '#ff9a6a', 11, 'center', 'rgba(0,0,0,.8)', 3);
        if (done[lv]) { ctx.fillStyle='#ffd44e'; drawStar(lx+r-4, ly-r+4, 8, 3.6, 5, t*1.5); }
      }
      const stars = done.filter(Boolean).length;
      textOut(`${stars} / 3 COMPLETADOS`, cx, cardY+348, stars===3 ? '#ffd44e' : 'rgba(215,232,248,.8)', 14, 'center', 'rgba(0,0,0,.8)', 4);
    }
    ctx.restore();
  }

  // stats bar
  ctx.fillStyle='rgba(6,10,16,.75)'; ctx.fillRect(0, H-72, W, 72);
  ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(0,H-72); ctx.lineTo(W,H-72); ctx.stroke();
  for (let i=0;i<Math.max(3, gs.lives);i++) drawHeart(40 + i*30, H-46, 11, i < gs.lives, t);
  drawCoinIcon(200, H-46, 11);
  textOut(`× ${gs.coins}`, 218, H-39, '#ffd94e', 20, 'left', 'rgba(0,0,0,.8)', 5);
  textOut(`SCORE  ${gs.score}`, W/2, H-39, '#ffffff', 20, 'center', 'rgba(0,0,0,.8)', 5);
  textOut(`BEST  ${gs.highScore}`, W-26, H-39, '#7fe8ff', 20, 'right', 'rgba(0,0,0,.8)', 5);
  textOut('← →  Mundo     ↑ ↓  Nivel     ENTER  Jugar     ESC  Menú', W/2, H-12, 'rgba(200,220,240,.8)', 14, 'center', 'rgba(0,0,0,.8)', 4);

  drawVignette(0.34);
}

// --- Pause Scene ---
let pauseSel=0;
const pauseItems=['RESUME','RESTART LEVEL','MAIN MENU'];

function updatePause(dt) {
  if (pressed('ArrowUp'))   pauseSel=(pauseSel-1+3)%3;
  if (pressed('ArrowDown')) pauseSel=(pauseSel+1)%3;
  if (pressed('Escape')||pressed('KeyP')) { gs.scene='gameplay'; }
  if (pressed('Enter')||pressed('Space')) {
    if (pauseSel===0) gs.scene='gameplay';
    if (pauseSel===1) { startLevel(); gs.scene='gameplay'; }
    if (pauseSel===2) { gs.lives=3; gs.score=0; gs.coins=0; gs.scene='menu'; menuSel=0; }
  }
}

function drawPause(t, dt) {
  drawWorld(gameTimer, 0);   // frozen world underneath
  ctx.fillStyle='rgba(4,8,14,.70)'; ctx.fillRect(0,0,W,H);

  const bw = 460, bh = 366, bx = W/2-bw/2, by = H/2-bh/2;
  ctx.fillStyle = vgrad(0, by, 0, by+bh, [[0,'rgba(24,40,28,.96)'],[1,'rgba(10,20,14,.96)']]);
  rrPath(bx, by, bw, bh, 20); ctx.fill();
  strokeRR(bx, by, bw, bh, 20, '#ffd44e', 3);
  ctx.fillStyle='rgba(255,255,255,.05)'; rrPath(bx+2, by+2, bw-4, bh*0.30, 18); ctx.fill();

  titleText('PAUSED', W/2, by+70, 42, t);
  textOut(`WORLD ${gs.world+1}-${gs.level+1}  ·  SCORE ${gs.score}`, W/2, by+100, 'rgba(215,232,248,.8)', 15, 'center', 'rgba(0,0,0,.8)', 4);

  for (let i=0;i<pauseItems.length;i++) {
    menuButton(W/2, by+164 + i*68, 336, 52, pauseItems[i], i===pauseSel, t);
  }
  textOut('ESC para continuar', W/2, by+bh-18, 'rgba(190,210,230,.7)', 13, 'center', 'rgba(0,0,0,.8)', 4);
}

// --- Game Over ---
let goSel=0, goT=0;

function updateGameOver(dt) {
  goT+=dt;
  updateParticles(dt);
  if (pressed('ArrowLeft')||pressed('ArrowRight')) goSel=(goSel+1)%2;
  if (pressed('Enter')||pressed('Space')) {
    if (goSel===0) { gs.lives=3; gs.score=0; gs.coins=0; gs.world=0; gs.level=0; startLevel(); gs.scene='gameplay'; }
    else           { gs.lives=3; gs.score=0; gs.coins=0; gs.scene='menu'; menuSel=0; }
  }
}

function drawGameOver(t) {
  ctx.fillStyle = vgrad(0,0,0,H, [[0,'#2a0708'],[0.55,'#14040a'],[1,'#050103']]); ctx.fillRect(0,0,W,H);
  // slow embers
  for (let i=0;i<40;i++) {
    const ph = (goT*0.16 + i*0.025) % 1;
    const ex = (i*137)%W + Math.sin(goT + i)*22;
    ctx.globalAlpha = (1-ph)*0.5;
    ctx.fillStyle = i%3 ? '#ff7a3a' : '#ffc24a';
    ctx.beginPath(); ctx.arc(ex, H - ph*H, 1.4 + (i%3), 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.save();
  const s = 1 + Math.sin(goT*3)*0.035;
  ctx.translate(W/2, H/2-130); ctx.scale(s,s); ctx.translate(-W/2, -(H/2-130));
  ctx.font = `bold 96px ${FONT_TITLE}`; ctx.textAlign='center'; ctx.lineJoin='round';
  ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillText('GAME OVER', W/2+5, H/2-124);
  ctx.lineWidth=16; ctx.strokeStyle='#3a0508'; ctx.strokeText('GAME OVER', W/2, H/2-130);
  const g = ctx.createLinearGradient(0, H/2-210, 0, H/2-110);
  g.addColorStop(0,'#ff9a8a'); g.addColorStop(0.5,'#ef2b2b'); g.addColorStop(1,'#8e0d12');
  ctx.fillStyle=g; ctx.fillText('GAME OVER', W/2, H/2-130);
  ctx.restore();

  // sad bear
  ctx.save();
  ctx.translate(W/2, H/2-6); ctx.scale(1.6,1.6);
  ctx.globalAlpha = 0.9;
  drawChar(curChar(), 0, 1, 0, null, 1, t);
  ctx.restore();

  // score panel
  hudPanel(W/2-230, H/2+18, 460, 96, 16);
  textOut('SCORE', W/2-118, H/2+48, 'rgba(200,220,240,.8)', 13, 'center', 'rgba(0,0,0,.8)', 4);
  textOut(String(gs.score), W/2-118, H/2+82, '#ffffff', 30, 'center', 'rgba(0,0,0,.8)', 6);
  textOut('COINS', W/2, H/2+48, 'rgba(200,220,240,.8)', 13, 'center', 'rgba(0,0,0,.8)', 4);
  textOut(String(gs.coins), W/2, H/2+82, '#ffd94e', 30, 'center', 'rgba(0,0,0,.8)', 6);
  textOut('BEST', W/2+118, H/2+48, 'rgba(200,220,240,.8)', 13, 'center', 'rgba(0,0,0,.8)', 4);
  textOut(String(gs.highScore), W/2+118, H/2+82, '#7fe8ff', 30, 'center', 'rgba(0,0,0,.8)', 6);
  if (gs.score >= gs.highScore && gs.score > 0) {
    textOut('¡NUEVO RÉCORD!', W/2, H/2+134, '#ffd44e', 20, 'center', 'rgba(0,0,0,.85)', 5);
  }

  const btns=['TRY AGAIN','MAIN MENU'];
  for (let i=0;i<2;i++) {
    menuButton(W/2 + (i===0?-140:140), H/2+186, 254, 52, btns[i], i===goSel, t,
               '#ff9a7a', ['rgba(158,52,42,.96)','rgba(84,18,18,.96)'], 'rgba(255,110,80,.26)');
  }

  drawVignette(0.5);
  hintBar('← →  Seleccionar     ENTER  Confirmar');
}
