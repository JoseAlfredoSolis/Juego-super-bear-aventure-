"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const E = require("../engine.js");

const GROUND_Y = 340;

function newPlayer(overrides = {}) {
  return Object.assign(
    {
      x: 90,
      y: GROUND_Y,
      w: 46,
      h: 52,
      vy: 0,
      onGround: true,
      jumps: 0,
      ducking: false,
    },
    overrides
  );
}

test("nextSpeed ramps speed up over time", () => {
  const s = E.nextSpeed(320, 1);
  assert.equal(s, 320 + E.CONFIG.SPEED_RAMP);
  assert.ok(E.nextSpeed(320, 0.5) > 320);
});

test("distanceGain scales with speed and dt", () => {
  assert.equal(E.distanceGain(100, 1), 10); // 100px / 10 px-per-m
  assert.equal(E.distanceGain(0, 1), 0);
  assert.ok(E.distanceGain(320, 1) > E.distanceGain(160, 1));
});

test("tryJump succeeds up to MAX_JUMPS then fails (double jump)", () => {
  const p = newPlayer();
  assert.equal(E.tryJump(p), true); // first jump
  assert.equal(p.jumps, 1);
  assert.equal(p.onGround, false);
  assert.equal(p.vy, E.CONFIG.JUMP_VELOCITY);

  assert.equal(E.tryJump(p), true); // second (double) jump
  assert.equal(p.jumps, 2);

  assert.equal(E.tryJump(p), false); // no triple jump
  assert.equal(p.jumps, 2);
});

test("stepPlayer applies gravity while airborne", () => {
  const p = newPlayer({ y: 100, vy: 0, onGround: false, jumps: 1 });
  E.stepPlayer(p, 0.1, GROUND_Y);
  assert.ok(p.vy > 0, "velocity should increase downward");
  assert.ok(p.y > 100, "player should fall");
  assert.equal(p.onGround, false);
});

test("stepPlayer lands the player and resets jumps", () => {
  const p = newPlayer({ y: GROUND_Y - 1, vy: 500, onGround: false, jumps: 2 });
  E.stepPlayer(p, 0.1, GROUND_Y);
  assert.equal(p.y, GROUND_Y);
  assert.equal(p.vy, 0);
  assert.equal(p.onGround, true);
  assert.equal(p.jumps, 0);
});

test("aabbCollide detects overlap and respects margin", () => {
  const a = { x: 0, y: 0, w: 10, h: 10 };
  const b = { x: 5, y: 5, w: 10, h: 10 };
  assert.equal(E.aabbCollide(a, b), true);

  const c = { x: 20, y: 20, w: 10, h: 10 };
  assert.equal(E.aabbCollide(a, c), false);

  // Touching only at the very edge -> margin removes the false positive.
  const edge = { x: 10, y: 0, w: 10, h: 10 };
  assert.equal(E.aabbCollide(a, edge, 1), false);
});

test("playerBox shrinks when ducking on the ground", () => {
  const standing = E.playerBox(newPlayer());
  const ducking = E.playerBox(newPlayer({ ducking: true }));
  assert.ok(ducking.h < standing.h);
  assert.equal(ducking.h, 52 * 0.6);

  // Ducking in the air should NOT shrink the box.
  const airDuck = E.playerBox(newPlayer({ ducking: true, onGround: false }));
  assert.equal(airDuck.h, 52);
});

test("hits: ducking lets the bear pass under a high bird", () => {
  const bird = { type: "bird", x: 100, y: GROUND_Y - 70, w: 44, h: 30 };
  const standing = newPlayer({ x: 90 });
  const ducking = newPlayer({ x: 90, ducking: true });
  // Standing tall (head reaches the bird) collides; ducking clears it.
  assert.equal(E.hits(standing, bird), true);
  assert.equal(E.hits(ducking, bird), false);
});

test("hits: a ground rock in the player's path is a collision", () => {
  const rock = { type: "rock", x: 100, y: GROUND_Y - 34, w: 40, h: 34 };
  const p = newPlayer({ x: 90 });
  assert.equal(E.hits(p, rock), true);
});

test("hits: a far away obstacle does not collide", () => {
  const rock = { type: "rock", x: 600, y: GROUND_Y - 34, w: 40, h: 34 };
  const p = newPlayer({ x: 90 });
  assert.equal(E.hits(p, rock), false);
});

test("spawnBaseDelay shrinks with distance but has a floor", () => {
  assert.equal(E.spawnBaseDelay(0), 1.25);
  assert.ok(E.spawnBaseDelay(1000) < E.spawnBaseDelay(0));
  assert.equal(E.spawnBaseDelay(100000), 0.55); // never below floor
});
