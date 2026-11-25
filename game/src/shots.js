import { INGREDIENTS, RECIPES, TUNING } from './config.js';
import { createWorld } from './world.js';

function stagedPortion(id, recipeId, stage, progress = 1) {
  return { id, recipeId, method: id === 'chicken' ? recipeId === 'sate_ayam' ? 'grill' : 'stew' : id === 'rice' || id === 'noodle' ? 'boil' : id === 'egg' ? 'fry' : 'chop', stage, cookProgress: progress * 7, burnAt: 0 };
}

function stagedOrder(id, recipeId, remaining, createdAt) {
  return { id, recipeId, remaining, maxPatience: RECIPES[recipeId].patience, createdAt, flash: 0 };
}

function stagedPlate(orderId, recipeId, ingredientIds, finished = false) {
  const ingredients = ingredientIds.map((id) => stagedPortion(id, recipeId, ['greens', 'chili'].includes(id) || (recipeId === 'gado_gado' && id === 'egg') ? 'chopped' : 'cooked'));
  return { orderId, recipeId, ingredients, finished, readyAt: 0 };
}

export function createShotStage(shotName, seed = 7) {
  const world = createWorld(seed);
  world.shot = true;
  world.mode = shotName === 'start' ? 'title' : 'playing';
  world.elapsed = 61;
  world.shiftLeft = TUNING.shiftSeconds - world.elapsed;
  world.orders = [stagedOrder(101, 'nasi_goreng', 54, 48), stagedOrder(102, 'mie_ayam', 63, 48)];
  world.selectedOrderId = 101;
  world.spawnTimer = 9;

  if (shotName === 'play') {
    world.player.x = Number(seed) > 7 ? 555 : 375; world.player.y = 409; world.player.facing = 1;
    world.player.hand = stagedPortion('chili', 'nasi_goreng', 'raw', 0);
    world.player.chopProgress = 0.77;
    world.player.nearbyStation = { id: world.player.x === 375 ? 'board1' : 'board2', x: world.player.x, y: 325 };
    world.player.plate = stagedPlate(101, 'nasi_goreng', ['rice', 'egg']);
    world.counterPlate = world.player.plate;
    world.player.hasDish = false;
    world.stations.pot1.item = stagedPortion('noodle', 'mie_ayam', 'raw', 0.83);
    world.stations.pot1.progress = 0.82;
    world.stations.pot2.item = null;
    world.windowPlate = { ...stagedPlate(102, 'mie_ayam', ['noodle', 'chicken', 'greens'], true), x: 1140, y: 443 };
    world.toast = 'Two tickets, one free burner. Keep the chili moving.';
    world.toastTimer = 99;
  } else if (shotName === 'rush') {
    world.elapsed = 153; world.shiftLeft = 27;
    world.orders = [
      stagedOrder(111, 'sate_ayam', 7.2, 111),
      stagedOrder(112, 'nasi_goreng', 35, 111),
      stagedOrder(113, 'mie_ayam', 51, 111),
      stagedOrder(114, 'soto_ayam', 64, 111),
    ];
    world.selectedOrderId = 111;
    world.player.x = 1045; world.player.y = 475; world.player.facing = 1;
    world.player.hand = null; world.player.plate = null; world.player.hasDish = false;
    world.player.plate = stagedPlate(112, 'nasi_goreng', ['rice', 'egg']);
    world.counterPlate = world.player.plate;
    world.selectedOrderId = 112;
    world.stations.pot1.item = stagedPortion('rice', 'nasi_goreng', 'cooked', 0.96);
    world.stations.pot1.progress = 0.97;
    world.stations.pot2.item = stagedPortion('chicken', 'soto_ayam', 'cooked', 0.74);
    world.stations.pot2.progress = 1;
    world.stations.grill.item = stagedPortion('chicken', 'sate_ayam', 'cooked', 0.93);
    world.stations.grill.progress = 1;
    world.windowPlate = { ...stagedPlate(111, 'sate_ayam', ['chicken', 'chili'], true), x: 1140, y: 443 };
    world.rushBanner = 3.5;
    world.rushAnnounced = true;
    world.toast = 'RUSH HOUR! Four hungry tickets. One near the buzzer.';
    world.toastTimer = 99;
    if (Number(seed) > 7) {
      world.player.x = 555; world.player.y = 409; world.player.facing = -1;
      world.player.hand = stagedPortion('greens', 'mie_ayam', 'chopped');
      world.player.plate = stagedPlate(113, 'mie_ayam', ['noodle', 'chicken']);
      world.counterPlate = world.player.plate;
      world.selectedOrderId = 113;
      world.toast = 'RUSH HOUR! The noodle ticket is next — keep the greens moving.';
    }
  } else if (shotName === 'serve') {
    world.elapsed = 113; world.shiftLeft = 67;
    world.orders = [stagedOrder(121, 'mie_ayam', 48, 113), stagedOrder(122, 'nasi_uduk', 55, 113)];
    world.selectedOrderId = 121;
    world.player.x = 935; world.player.y = 471; world.player.facing = 1;
    world.player.hand = null; world.player.hasDish = false;
    world.player.plate = stagedPlate(121, 'mie_ayam', ['noodle', 'chicken', 'greens'], true);
    world.counterPlate = world.player.plate;
    world.floaters = [
      { text: '+72 COINS  ·  +12 TIP', x: 968, y: 421, life: 1.35, color: '#ffe178' },
      { text: '✦  MIE AYAM  ✦', x: 961, y: 390, life: 1.2, color: '#e8f2bd' },
    ];
    world.coins = 286; world.combo = 4; world.bestCombo = 4; world.served = 6;
    world.toast = 'A beautiful bowl, still warm. Find the service window!';
    world.toastTimer = 99;
  } else if (shotName === 'start') {
    world.elapsed = 0; world.shiftLeft = TUNING.shiftSeconds;
    world.orders = [stagedOrder(131, 'gado_gado', 58, 0), stagedOrder(132, 'nasi_goreng', 66, 0)];
    world.selectedOrderId = 131;
    world.player.x = 640; world.player.y = 650;
    world.player.hand = null; world.player.plate = null;
    world.stations.pot1.item = null; world.stations.pot2.item = null; world.stations.grill.item = null;
  }
  world.shotName = shotName;
  world.actionHint = 'WASD / arrows · HOLD E to chop · E to cook & plate · CLICK a station to hustle · R restart · P pause · M mute';
  return world;
}

export function getShotName() {
  const parameters = new URLSearchParams(window.location.search);
  return parameters.get('shot') || '';
}

export function getSeed() {
  const value = Number(new URLSearchParams(window.location.search).get('seed'));
  return Number.isFinite(value) ? value : 7;
}
