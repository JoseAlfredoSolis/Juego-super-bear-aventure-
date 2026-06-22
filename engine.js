// Pure, side-effect-free game logic for Super Bear Adventure.
// Shared by the browser game (game.js) and the automated tests.
// Works both as a browser global (window.BearEngine) and a CommonJS module.
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.BearEngine = api;
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const CONFIG = {
    GRAVITY: 2200, // px/s^2
    JUMP_VELOCITY: -780, // px/s
    MAX_JUMPS: 2,
    BASE_SPEED: 320, // px/s
    SPEED_RAMP: 9, // px/s added per second
    COLLISION_MARGIN: 6, // px of forgiveness on each side
    PX_PER_METRE: 10,
  };

  // Increase running speed over time.
  function nextSpeed(speed, dt, cfg = CONFIG) {
    return speed + cfg.SPEED_RAMP * dt;
  }

  // Distance travelled (in metres) gained this frame.
  function distanceGain(speed, dt, cfg = CONFIG) {
    return (speed * dt) / cfg.PX_PER_METRE;
  }

  // Apply gravity + integrate the player's vertical position for one frame.
  // `player` is mutated in place and returned. groundY is the floor.
  function stepPlayer(player, dt, groundY, cfg = CONFIG) {
    player.vy += cfg.GRAVITY * dt;
    player.y += player.vy * dt;
    if (player.y >= groundY) {
      player.y = groundY;
      player.vy = 0;
      player.onGround = true;
      player.jumps = 0;
    } else {
      player.onGround = false;
    }
    return player;
  }

  // Attempt a jump. Returns true if the jump was performed.
  function tryJump(player, cfg = CONFIG) {
    if (player.jumps < cfg.MAX_JUMPS) {
      player.vy = cfg.JUMP_VELOCITY;
      player.onGround = false;
      player.jumps++;
      return true;
    }
    return false;
  }

  // Axis-aligned bounding box overlap test with an inset margin.
  // a and b are {x, y, w, h}.
  function aabbCollide(a, b, margin = 0) {
    return (
      a.x + a.w - margin > b.x &&
      a.x + margin < b.x + b.w &&
      a.y + margin < b.y + b.h &&
      a.y + a.h - margin > b.y
    );
  }

  // Effective collision box of the player, accounting for ducking.
  function playerBox(player) {
    const h = player.ducking && player.onGround ? player.h * 0.6 : player.h;
    return { x: player.x, y: player.y - h, w: player.w, h };
  }

  // Did the player hit the obstacle this frame?
  function hits(player, obstacle, cfg = CONFIG) {
    return aabbCollide(playerBox(player), obstacle, cfg.COLLISION_MARGIN);
  }

  // Seconds until the next obstacle should spawn (without the random part).
  // Gets shorter as distance grows, but never below the floor.
  function spawnBaseDelay(distance) {
    return Math.max(0.55, 1.25 - distance / 1500);
  }

  return {
    CONFIG,
    nextSpeed,
    distanceGain,
    stepPlayer,
    tryJump,
    aabbCollide,
    playerBox,
    hits,
    spawnBaseDelay,
  };
});
