// Super Bear Adventure - Canvas setup and the requestAnimationFrame loop.
// Loaded as a classic script; all top-level names are shared with the
// other files in load order (see index.html).

// --- Main Loop ---
const canvas = document.getElementById('c');
canvas.width = W; canvas.height = H;
ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = true;
ctx.textBaseline = 'alphabetic';

// Scale canvas to window
function resize() {
  const scale = Math.min(window.innerWidth/W, window.innerHeight/H);
  canvas.style.width  = (W*scale)+'px';
  canvas.style.height = (H*scale)+'px';
}
window.addEventListener('resize', resize); resize();

let lastTime = 0, fpsAcc = 0, fpsFrames = 0, fpsShown = 0;
function loop(ts) {
  const dt = Math.min((ts - lastTime)/1000, 0.05);
  lastTime = ts;
  curDt = dt;
  const t = ts/1000;

  ctx.clearRect(0,0,W,H);

  switch(gs.scene) {
    case 'menu':
      updateMenu(dt); drawMenu(t, dt);
      break;
    case 'charselect':
      updateCharSelect(dt); drawCharSelect(t, dt);
      break;
    case 'instructions':
      drawInstructions(t, dt);
      break;
    case 'settings':
      updateSettings(dt); drawSettings(t, dt);
      break;
    case 'worldmap':
      updateWorldMap(dt); drawWorldMap(t, dt);
      break;
    case 'gameplay':
      updateGameplay(dt); drawGameplay(t, dt);
      break;
    case 'pause':
      updatePause(dt); drawPause(t, dt);
      break;
    case 'levelclear':
      updateLevelClear(dt); drawLevelClear(t, dt);
      break;
    case 'gameover':
      updateGameOver(dt); drawGameOver(t);
      break;
  }

  if (opts.showFps) {
    fpsAcc += dt; fpsFrames++;
    if (fpsAcc >= 0.4) { fpsShown = Math.round(fpsFrames/fpsAcc); fpsAcc = 0; fpsFrames = 0; }
    hudPanel(W-92, H-92, 78, 32, 9);
    textOut(`${fpsShown} FPS`, W-53, H-70, '#8dff9c', 15, 'center', 'rgba(0,0,0,.8)', 4);
  }

  clearFrame();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
