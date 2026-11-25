import { HEIGHT, STATIONS, WIDTH } from './config.js';
import { moveToPoint, moveToStation, selectOrder } from './world.js';

const STATION_HIT = {
  pantry: [94, 260, 102, 128], fridge: [94, 412, 102, 128],
  board1: [316, 270, 118, 115], board2: [496, 270, 118, 115],
  pot1: [680, 260, 110, 124], pot2: [820, 260, 110, 124],
  grill: [990, 255, 168, 128], plate: [906, 442, 134, 135],
  window: [1070, 442, 154, 136], bin: [126, 580, 118, 125], sink: [729, 594, 148, 112],
};

const normalizedKey = (key) => key.toLowerCase();

export function createInput(canvas, getWorld, callbacks) {
  const keys = new Set();
  let actionPressed = false;
  let pointerDown = false;
  let lastClick = 0;

  function activate(event) {
    const world = getWorld();
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * WIDTH;
    const y = (event.clientY - rect.top) / rect.height * HEIGHT;
    const selectedTicket = world.orders.findIndex((order, index) => {
      const left = 40 + index * 296;
      return x >= left && x < left + 280 && y >= 110 && y < 218;
    });
    if (selectedTicket !== -1) {
      selectOrder(world, world.orders[selectedTicket].id);
      callbacks.unlockAudio();
      return;
    }
    for (const station of STATIONS) {
      const [left, top, width, height] = STATION_HIT[station.id];
      if (x >= left && x <= left + width && y >= top && y <= top + height) {
        moveToStation(world, station.id, true);
        callbacks.unlockAudio();
        return;
      }
    }
    if (world.mode === 'title') callbacks.begin();
    else if (world.mode === 'gameover') callbacks.restart();
    else moveToPoint(world, x, y);
    callbacks.unlockAudio();
  }

  const onKeyDown = (event) => {
    const key = normalizedKey(event.key);
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'e'].includes(key)) event.preventDefault();
    if (event.repeat) return;
    keys.add(key);
    callbacks.unlockAudio();
    if (key === 'r') callbacks.restart();
    else if (key === 'p' || key === 'escape') callbacks.togglePause();
    else if (key === 'm') callbacks.toggleMute();
    else if ((key === ' ' || key === 'enter') && world.mode === 'title') callbacks.begin();
    else if ((key === ' ' || key === 'enter') && world.mode === 'gameover') callbacks.restart();
    else if (key === 'e' || key === ' ') actionPressed = true;
  };
  const onKeyUp = (event) => keys.delete(normalizedKey(event.key));
  const onPointerDown = (event) => { pointerDown = true; lastClick = performance.now(); activate(event); };
  const onPointerUp = () => { pointerDown = false; };
  const onContextMenu = (event) => event.preventDefault();

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('contextmenu', onContextMenu);

  return {
    frame() {
      const world = getWorld();
      const input = {
        left: keys.has('a') || keys.has('arrowleft'),
        right: keys.has('d') || keys.has('arrowright'),
        up: keys.has('w') || keys.has('arrowup'),
        down: keys.has('s') || keys.has('arrowdown'),
        interactHeld: keys.has('e') || keys.has(' '),
        interact: keys.has('e') || keys.has(' ') || pointerDown,
        interactPressed: actionPressed,
      };
      actionPressed = false;
      if (world.mode === 'title' && pointerDown && performance.now() - lastClick < 200) callbacks.begin();
      return input;
    },
    dispose() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('contextmenu', onContextMenu);
    },
  };
}
