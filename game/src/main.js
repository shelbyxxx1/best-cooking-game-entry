import { createAudio } from './audio.js';
import { createInput } from './input.js';
import { fitCanvas, renderGame } from './render.js';
import { createShotStage, getSeed, getShotName } from './shots.js';
import { createWorld, startShift, updateWorld } from './world.js';

const canvas = document.getElementById('game');
const context = canvas?.getContext('2d', { alpha: false });
if (!canvas || !context) throw new Error('Dapur Kilat needs a browser canvas.');

const audio = createAudio();
const requestedShot = getShotName();
const seed = getSeed();
let world = requestedShot ? createShotStage(requestedShot, seed) : createWorld(seed);
let previousFrame = performance.now();

function begin() {
  if (world.mode === 'title') startShift(world);
}

function restart() {
  world = createWorld(seed);
  startShift(world);
}

function togglePause() {
  if (world.mode === 'playing') world.mode = 'paused';
  else if (world.mode === 'paused') world.mode = 'playing';
}

const input = createInput(canvas, () => world, {
  begin,
  restart,
  togglePause,
  toggleMute() {
    const muted = audio.toggle();
    world.toast = muted ? 'Sound is off. Press M when you want the kitchen back.' : 'Sound is on. Hear the rhythm.';
    world.toastTimer = 2.2;
  },
  unlockAudio: () => audio.unlock(),
});

function frame(now) {
  const delta = Math.max(0, Math.min(.05, (now - previousFrame) / 1000));
  previousFrame = now;
  fitCanvas(canvas, context);
  if (world.mode === 'playing') updateWorld(world, input.frame(), delta);
  else input.frame();
  for (const sound of world.soundEvents.splice(0)) audio.play(sound);
  renderGame(context, world, audio);
  window.requestAnimationFrame(frame);
}

window.addEventListener('resize', () => fitCanvas(canvas, context), { passive: true });
window.addEventListener('blur', () => {
  if (world.mode === 'playing') world.mode = 'paused';
});
fitCanvas(canvas, context);
window.requestAnimationFrame(frame);
