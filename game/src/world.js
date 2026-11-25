import { INGREDIENTS, RECIPES, RECIPE_ORDER, STATIONS, STATION_BY_ID, TUNING } from './config.js';

let nextEntityId = 1;

function seededRandom(seed) {
  let value = (Number(seed) >>> 0) || 1;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function recipeMethod(ingredientId, recipeId) {
  if (recipeId === 'gado_gado' && ingredientId === 'egg') return 'chop';
  if (ingredientId === 'chicken') return recipeId === 'sate_ayam' ? 'grill' : 'stew';
  if (ingredientId === 'rice' || ingredientId === 'noodle') return 'boil';
  if (ingredientId === 'egg') return 'fry';
  return 'chop';
}

function createOrder(recipeId, elapsed = 0, remaining = undefined) {
  const recipe = RECIPES[recipeId];
  return {
    id: nextEntityId++, recipeId, remaining: remaining ?? recipe.patience,
    maxPatience: recipe.patience, createdAt: elapsed, flash: 0,
  };
}

function createTicketPlate(order) {
  return { recipeId: order.recipeId, orderId: order.id, ingredients: [], finished: false, readyAt: 0 };
}

export function createWorld(seed = 7) {
  nextEntityId = 1;
  return {
    mode: 'title', elapsed: 0, shiftLeft: TUNING.shiftSeconds,
    coins: 0, combo: 0, bestCombo: 0, served: 0,
    random: seededRandom(seed), orders: [], selectedOrderId: null,
    spawnTimer: 2.8, stations: Object.fromEntries(STATIONS.filter((station) => ['pot1', 'pot2', 'grill'].includes(station.id)).map((station) => [station.id, { stationId: station.id, item: null, progress: 0, burned: false }])),
    player: { x: 640, y: 640, facing: 1, walkPhase: 0, target: null, hand: null, plate: null, hasDish: false, chopProgress: 0 },
    particles: [], floaters: [], shake: 0, rushBanner: 0, soundEvents: [], toast: 'Select a ticket. The tiny kitchen is yours.', toastTimer: 4,
    actionHint: 'WASD move  ·  HOLD E chop  ·  E interact  ·  CLICK a station to hustle there',
    shot: false,
  };
}

export function startShift(world) {
  world.mode = 'playing';
  if (world.orders.length === 0) {
    spawnOrder(world, 'gado_gado');
    spawnOrder(world, 'nasi_goreng');
  }
  world.spawnTimer = 15;
  world.toast = 'Hot wok, bright eyes. Let’s cook.';
  world.toastTimer = 2.4;
}

function spawnOrder(world, recipeId = undefined, remaining = undefined) {
  const chosen = recipeId || RECIPE_ORDER[Math.floor(world.random() * RECIPE_ORDER.length)];
  const order = createOrder(chosen, world.elapsed, remaining);
  world.orders.push(order);
  if (world.selectedOrderId == null) world.selectedOrderId = order.id;
  return order;
}

function getOrder(world, orderId = world.selectedOrderId) {
  return world.orders.find((order) => order.id === orderId) || null;
}

export function selectOrder(world, orderId) {
  const order = getOrder(world, orderId);
  if (!order) return;
  world.selectedOrderId = order.id;
  world.toast = ticketHint(world, order);
  world.toastTimer = 2.7;
}

function ticketHint(world, order) {
  const recipe = RECIPES[order.recipeId];
  const collected = world.player.plate?.orderId === order.id ? world.player.plate.ingredients.map((item) => item.id) : [];
    const carried = world.player.hand?.recipeId === order.recipeId ? [world.player.hand.id] : [];
  const missing = recipe.ingredients.find((ingredient) => !collected.includes(ingredient) && !carried.includes(ingredient));
  if (!missing) return `${recipe.name}: plate it at the bar, then sprint to the window.`;
  const source = INGREDIENTS[missing].source;
  const method = recipeMethod(missing, order.recipeId);
  const step = method === 'chop' ? 'prep board' : method === 'grill' ? 'charcoal grill' : 'a free burner';
  return `${recipe.name}: ${missing} → ${step} → plating bar. Grab it at the ${source}.`;
}

function addParticle(world, x, y, color, count = 10, burst = 100) {
  for (let index = 0; index < count; index += 1) {
    const angle = world.random() * Math.PI * 2;
    const speed = 24 + world.random() * burst;
    world.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 25, life: 0.35 + world.random() * 0.48, maxLife: 0.83, size: 2 + world.random() * 5, color });
  }
}

function pop(world, text, x, y, color = '#ffe49a') {
  world.floaters.push({ text, x, y, life: 1.35, color });
}

export function moveToStation(world, stationId, automatic = true) {
  const station = STATION_BY_ID[stationId];
  if (!station || world.mode !== 'playing') return;
  world.player.target = { x: station.x, y: station.y + 84, stationId, automatic };
  world.toast = `${station.label} → hustle!`;
  world.toastTimer = 1.2;
}

export function moveToPoint(world, x, y) {
  if (world.mode !== 'playing') return;
  world.player.target = { x: Math.max(52, Math.min(1228, x)), y: Math.max(268, Math.min(718, y)), stationId: null, automatic: false };
}

function currentTray(world) {
  return world.player.plate;
}

function requiredStage(method) {
  return method === 'chop' ? 'chopped' : 'cooked';
}

function plateIsComplete(plate, order) {
  if (!plate || !order || plate.orderId !== order.id || plate.recipeId !== order.recipeId) return false;
  const wanted = [...RECIPES[order.recipeId].ingredients].sort();
  const actual = plate.ingredients.map((item) => item.id).sort();
  return wanted.length === actual.length && wanted.every((ingredient, index) => ingredient === actual[index]);
}

function interactWithSource(world, station) {
  const order = getOrder(world);
  if (!order) {
    world.toast = 'Choose a ticket first; every plate has a purpose.';
    world.toastTimer = 2;
    return;
  }
  if (world.player.hand) {
    world.toast = 'One ingredient in your hand. Chop it, cook it, plate it, or trash it.';
    world.toastTimer = 2.1;
    return;
  }
  const wanted = RECIPES[order.recipeId].ingredients;
  const obtained = new Set(world.player.plate?.orderId === order.id ? world.player.plate.ingredients.map((item) => item.id) : []);
  const ingredientId = wanted.find((id) => !obtained.has(id) && INGREDIENTS[id].source === station.id);
  if (!ingredientId) {
    const missing = wanted.find((id) => !obtained.has(id));
    const source = missing ? INGREDIENTS[missing].source : 'plating bar';
    world.toast = missing ? `Next up: ${missing} from the ${source}. Click that counter.` : 'Everything is on the plate. Sprint to the service window!';
    world.toastTimer = 2.4;
    return;
  }
  const method = recipeMethod(ingredientId, order.recipeId);
  world.player.hand = { id: ingredientId, recipeId: order.recipeId, stage: 'raw', method, cookProgress: 0, burnAt: 0 };
  world.toast = `${INGREDIENTS[ingredientId].name} grabbed — ${method === 'chop' ? 'find a board' : method === 'grill' ? 'hit the grill' : 'fire a burner'}!`;
  world.toastTimer = 2.2;
  addParticle(world, station.x, station.y + 25, INGREDIENTS[ingredientId].color, 9, 70);
  world.soundEvents.push('grab');
}

function tryChop(world, delta, held) {
  const item = world.player.hand;
  const chickenPrep = item?.id === 'chicken' && item.stage === 'raw';
  if (!item || (item.method !== 'chop' && !chickenPrep) || item.stage !== 'raw') {
    world.player.chopProgress = 0;
    return;
  }
  if (!held) return;
  world.player.chopProgress += delta;
  if (Math.floor(world.elapsed * 11) !== Math.floor((world.elapsed - delta) * 11)) {
    const board = world.player.nearbyStation;
    addParticle(world, board.x + (world.random() - 0.5) * 46, board.y + 26 + (world.random() - 0.5) * 25, item.id === 'chili' ? '#ff7461' : item.id === 'chicken' ? '#e59870' : '#a3d789', 2, 24);
    world.soundEvents.push('chop');
  }
  if (world.player.chopProgress >= TUNING.chopSeconds) {
    item.stage = 'chopped';
    world.player.chopProgress = 0;
    world.player.target = null;
    world.toast = `${INGREDIENTS[item.id].name} prepped! A clean cut. Next station.`;
    world.toastTimer = 2;
    addParticle(world, world.player.nearbyStation.x, world.player.nearbyStation.y, '#d0f092', 18, 115);
    world.soundEvents.push('ready');
  }
}

function processorDuration(method, ingredientId) {
  if (method === 'grill') return ingredientId === 'chicken' ? 7.6 : 6.4;
  if (method === 'stew') return 7.1;
  return ingredientId === 'rice' ? 7.1 : 5.8;
}

function interactWithProcessor(world, processor) {
  const item = world.player.hand;
  if (processor.burned) {
    world.toast = 'That burner is a charcoal tragedy. One-tap the bin to clear it.';
    world.toastTimer = 2.8;
    return;
  }
  if (processor.item) {
    if (processor.item.stage === 'cooked') {
      if (item) {
        world.toast = 'Hands full! Take the cooked portion first.';
        world.toastTimer = 1.9;
        return;
      }
      world.player.hand = processor.item;
      processor.item = null;
      processor.progress = 0;
      world.toast = `${INGREDIENTS[world.player.hand.id].name} is ready. Go plate it!`;
      world.toastTimer = 1.7;
      addParticle(world, STATION_BY_ID[processor.stationId].x, STATION_BY_ID[processor.stationId].y + 30, '#fff0a3', 12, 86);
      world.soundEvents.push('ready');
      return;
    }
    world.toast = `${INGREDIENTS[processor.item.id].name} is cooking — multitask at a free station.`;
    world.toastTimer = 2;
    return;
  }
  if (!item) {
    world.toast = 'Pick up an ingredient, then press E to start this station.';
    world.toastTimer = 1.8;
    return;
  }
  const cookReady = item.stage === 'raw' || (item.id === 'chicken' && item.stage === 'chopped');
  if (!cookReady || !['boil', 'fry', 'stew', 'grill'].includes(item.method)) {
    world.toast = item.method === 'chop' ? 'This one needs a knife and a prep board.' : 'Pick up a raw portion for the burner.';
    world.toastTimer = 1.8;
    return;
  }
  if (item.method === 'grill' ? processor.stationId !== 'grill' : processor.stationId === 'grill') {
    world.toast = item.method === 'grill' ? 'Satay needs the charcoal grill.' : 'Only satay belongs on the grill; use a burner.';
    world.toastTimer = 2.3;
    return;
  }
  processor.item = item;
  processor.item.stage = 'raw';
  processor.item.cookProgress = 0;
  processor.progress = 0;
  world.player.hand = null;
  world.toast = `${INGREDIENTS[item.id].name} down. ${processor.stationId === 'grill' ? 'Hear that sizzle?' : 'Burner on — keep moving!'}`;
  world.toastTimer = 1.8;
  addParticle(world, STATION_BY_ID[processor.stationId].x, STATION_BY_ID[processor.stationId].y + 27, '#ffd37c', 8, 60);
  world.soundEvents.push('sizzle');
}

function interactWithPlate(world) {
  const order = getOrder(world);
  const item = world.player.hand;
  if (item) {
    if (!order || item.recipeId !== order.recipeId) {
      world.toast = 'Select the ticket that matches what you are holding.';
      world.toastTimer = 2;
      return;
    }
    if (item.stage !== requiredStage(item.method)) {
      world.toast = item.stage === 'raw' ? `That ${INGREDIENTS[item.id].name.toLowerCase()} needs ${item.method === 'chop' ? 'chopping' : 'cooking'} first.` : 'This ingredient is not ready for the plate.';
      world.toastTimer = 2.2;
      return;
    }
    if (!world.player.plate) {
      world.player.plate = createTicketPlate(order);
    }
    if (world.player.plate.orderId !== order.id) {
      world.toast = 'Plate the order you selected. Finish one ticket at a time.';
      world.toastTimer = 2.3;
      return;
    }
    if (world.player.plate.ingredients.some((portion) => portion.id === item.id)) {
      world.toast = `${INGREDIENTS[item.id].name} is already on this dish — no double toppings.`;
      world.toastTimer = 2;
      return;
    }
    world.player.plate.ingredients.push({ id: item.id, stage: item.stage, method: item.method });
    world.player.hand = null;
    const complete = plateIsComplete(world.player.plate, order);
    world.player.plate.finished = complete;
    world.counterPlate = world.player.plate;
    if (complete) {
      world.player.plate.readyAt = world.elapsed;
      world.toast = `${RECIPES[order.recipeId].name} is ready! Pick it up from the plating bar.`;
      world.soundEvents.push('ready');
    } else {
      const left = RECIPES[order.recipeId].ingredients.length - world.player.plate.ingredients.length;
      world.toast = `${INGREDIENTS[item.id].name} plated — ${left} ingredient${left === 1 ? '' : 's'} to go.`;
      world.soundEvents.push('plate');
    }
    world.toastTimer = 2.5;
    addParticle(world, STATION_BY_ID.plate.x, STATION_BY_ID.plate.y - 12, INGREDIENTS[item.id].color, 10, 60);
    return;
  }
  if (world.player.plate) {
    if (world.player.plate.finished && !world.player.hasDish) {
      world.player.hasDish = true;
      world.counterPlate = null;
      world.toast = 'Beautiful plate, in your hands! Hustle to the golden service window.';
      world.soundEvents.push('plate');
    } else {
      world.toast = world.player.plate.finished ? 'Plate in your hands. Take it to the golden service window!' : `Dish building at the bar: ${world.player.plate.ingredients.length} / ${RECIPES[world.player.plate.recipeId].ingredients.length}. Grab the next one.`;
    }
    world.toastTimer = 2.4;
    return;
  }
  if (!order) {
    world.toast = 'Pick an order to get your first clean plate.';
    world.toastTimer = 1.9;
    return;
  }
  world.player.plate = createTicketPlate(order);
  world.counterPlate = world.player.plate;
  world.counterPlate = world.player.plate;
  world.toast = `Clean plate for ${RECIPES[order.recipeId].name}. Fresh ingredients are on the left.`;
  world.toastTimer = 2.2;
}

function serveAtWindow(world) {
  const order = world.player.plate && world.player.hasDish ? getOrder(world, world.player.plate.orderId) : null;
  if (!world.player.plate || !world.player.hasDish || !plateIsComplete(world.player.plate, order)) {
    world.toast = world.player.plate ? 'The ticket is still hungry. Finish the dish at the plating bar.' : 'No plate to serve. Bring a completed dish to the window.';
    world.toastTimer = 2.3;
    world.shake = 0.12;
    world.soundEvents.push('error');
    return;
  }
  const tip = order.remaining / order.maxPatience > 0.5;
  const earned = Math.round(RECIPES[order.recipeId].coins * Math.min(5, 1 + Math.floor(world.combo / 2))) + (tip ? 12 : 0);
  world.coins += earned;
  world.served += 1;
  world.combo += 1;
  world.bestCombo = Math.max(world.bestCombo, world.combo);
  pop(world, `+${earned} COINS${tip ? '  ·  +12 TIP' : ''}`, STATION_BY_ID.window.x, STATION_BY_ID.window.y - 175, '#ffe178');
  pop(world, `✦  ${RECIPES[order.recipeId].name.toUpperCase()}  ✦`, STATION_BY_ID.window.x, STATION_BY_ID.window.y - 205, '#e8f2bd');
  addParticle(world, STATION_BY_ID.window.x, STATION_BY_ID.window.y - 72, '#ffe090', 28, 150);
  world.orders = world.orders.filter((ticket) => ticket.id !== order.id);
  world.selectedOrderId = world.orders[0]?.id ?? null;
  world.player.plate = null;
  world.player.hasDish = false;
  world.counterPlate = null;
  world.windowPlate = null;
  world.toast = `Ticket served! ${tip ? 'Fast hands earned a VIP tip.' : 'Keep that combo alive!'}`;
  world.toastTimer = 2.5;
  world.soundEvents.push('serve');
}

export function interactAtStation(world, stationId, { automatic = false, held = false, delta = 0 } = {}) {
  const station = STATION_BY_ID[stationId];
  if (!station || world.mode !== 'playing') return;
  world.player.nearbyStation = station;
  if (station.kind === 'pantry' || station.kind === 'fridge') {
    if (!automatic || !world._lastAutomaticSource || world.elapsed - world._lastAutomaticSource > 0.5) {
      interactWithSource(world, station);
      if (automatic) world._lastAutomaticSource = world.elapsed;
    }
  } else if (station.kind === 'board') {
    tryChop(world, delta || 1 / 60, held || automatic);
  } else if (['pot', 'grill'].includes(station.kind)) {
    const processor = world.stations[station.id];
    if (!automatic || !world._lastAutomaticStation || world._lastAutomaticStation.stationId !== station.id || world.elapsed - world._lastAutomaticStation.at > 0.5) {
      interactWithProcessor(world, processor);
      if (automatic) world._lastAutomaticStation = { stationId: station.id, at: world.elapsed };
    }
  } else if (station.kind === 'plate') {
    if (!automatic || !world._lastAutomaticPlate || world.elapsed - world._lastAutomaticPlate > 0.5) {
      interactWithPlate(world);
      if (automatic) world._lastAutomaticPlate = world.elapsed;
    }
  } else if (station.kind === 'window') {
    if (!automatic || !world._lastAutomaticWindow || world.elapsed - world._lastAutomaticWindow > 0.5) {
      serveAtWindow(world);
      if (automatic) world._lastAutomaticWindow = world.elapsed;
    }
  } else if (station.kind === 'bin') {
    const processor = Object.values(world.stations).find((burner) => burner.burned || burner.item?.stage === 'burnt');
    if (world.player.hand?.stage === 'burnt') {
      world.player.hand = null;
      world.toast = 'Burnt portion binned. The kitchen smells like a fresh start.';
    } else if (processor) {
      processor.item = null;
      processor.burned = false;
      processor.progress = 0;
      world.toast = 'Burner cleared! The next ticket gets a clean flame.';
    } else if (world.player.hand) {
      world.player.hand = null;
      world.toast = 'Ingredient tossed. Back to the counter.';
    } else if (world.player.plate) {
      world.player.plate = null;
      world.player.hasDish = false;
      world.counterPlate = null;
      world.toast = 'Plate scrapped. Take a breath and start a fresh one.';
    } else {
      world.toast = 'Bin empty. Less mess, more momentum.';
    }
    world.toastTimer = 2;
  } else if (station.kind === 'sink') {
    world.toast = 'Keep the rhythm: left counter, hot line, plating bar, service window.';
    world.toastTimer = 2.4;
  }
}

export function updateWorld(world, input, delta) {
  const dt = Math.min(delta, 0.05);
  if (world.mode !== 'playing') return;
  if (!world.shot) {
    world.elapsed += dt;
    world.shiftLeft = Math.max(0, TUNING.shiftSeconds - world.elapsed);
    if (world.shiftLeft <= 0) {
      world.mode = 'gameover';
      world.player.target = null;
      return;
    }
  }
  if (world.toastTimer > 0) world.toastTimer -= dt;
  if (world.rushBanner > 0) world.rushBanner -= dt;
  world.shake = Math.max(0, world.shake - dt);

  if (!world.shot) {
    for (const order of [...world.orders]) {
      order.remaining -= dt;
      order.flash = Math.max(0, order.flash - dt);
      if (order.remaining <= 0) {
        const missedName = RECIPES[order.recipeId].name;
        world.orders = world.orders.filter((ticket) => ticket.id !== order.id);
        world.combo = 0;
        world.shake = 0.3;
        world.toast = `${missedName} went cold. Reset, refocus, new ticket.`;
        world.toastTimer = 2.6;
        world.soundEvents.push('error');
        if (world.selectedOrderId === order.id) world.selectedOrderId = world.orders[0]?.id ?? null;
        if (world.player.plate?.orderId === order.id) world.player.plate = null;
      }
    }
    const spawnRate = world.shiftLeft <= TUNING.rushAtSeconds ? TUNING.rushSpawnSeconds : TUNING.earlySpawnSeconds;
    world.spawnTimer -= dt;
    if (world.spawnTimer <= 0) {
      if (world.orders.length < TUNING.ticketCap) spawnOrder(world);
      world.spawnTimer = spawnRate + world.random() * 2.4;
    }
    if (world.shiftLeft <= TUNING.rushAtSeconds && !world.rushAnnounced) {
      world.rushAnnounced = true;
      world.rushBanner = 3.6;
      world.toast = 'RUSH HOUR! The line is full and the tickets won’t wait.';
      world.toastTimer = 3.5;
    }
  }

  const { player } = world;
  const vectorX = Number(input.right) - Number(input.left);
  const vectorY = Number(input.down) - Number(input.up);
  if (vectorX || vectorY) {
    const length = Math.hypot(vectorX, vectorY) || 1;
    player.x = Math.max(48, Math.min(1232, player.x + vectorX / length * TUNING.walkSpeed * dt));
    player.y = Math.max(270, Math.min(716, player.y + vectorY / length * TUNING.walkSpeed * dt));
    player.facing = vectorX ? Math.sign(vectorX) : player.facing;
    player.walkPhase += dt * 13;
    player.target = null;
  } else if (player.target) {
    const target = player.target;
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 6) {
      const step = Math.min(distance, TUNING.walkSpeed * dt);
      player.x += dx / distance * step;
      player.y += dy / distance * step;
      if (dx) player.facing = Math.sign(dx);
      player.walkPhase += dt * 13;
    } else {
      player.x = target.x;
      player.y = target.y;
      const station = target.stationId && STATION_BY_ID[target.stationId];
      if (target.automatic && station) {
        if (station.kind === 'board' && player.hand?.stage === 'raw' && (player.hand.method === 'chop' || player.hand.id === 'chicken')) {
          target.clickActionTime = (target.clickActionTime ?? 0) + dt;
          interactAtStation(world, station.id, { automatic: true, held: true, delta: dt });
          if (target.clickActionTime >= TUNING.chopSeconds + 0.1) player.target = null;
        } else {
          if (!target.autoInteracted) {
            interactAtStation(world, station.id, { automatic: true });
            target.autoInteracted = true;
          }
          player.target = null;
        }
      } else if (station && input.interact) {
        interactAtStation(world, station.id, { held: input.interactHeld, delta: dt });
      }
    }
  }

  const nearStation = STATIONS.find((station) => Math.hypot(station.x - player.x, station.y + 84 - player.y) <= TUNING.interactionRadius);
  if (nearStation) {
    player.nearbyStation = nearStation;
    if (input.interactPressed) {
      interactAtStation(world, nearStation.id, { held: input.interactHeld, delta: dt });
      player.target = null;
    } else if (input.interactHeld && nearStation.kind === 'board') {
      interactAtStation(world, nearStation.id, { held: true, delta: dt });
    } else if (nearStation.kind === 'board' && player.chopProgress > 0 && !player.target) {
      player.chopProgress = Math.max(0, player.chopProgress - dt * 1.5);
    }
  } else if (player.chopProgress > 0 && !player.target) {
    player.chopProgress = Math.max(0, player.chopProgress - dt * 1.8);
  }

  if (!world.shot) {
    for (const processor of Object.values(world.stations)) {
      const item = processor.item;
      if (!item) continue;
      if (item.stage === 'cooked') {
        item.cookProgress += dt;
        const duration = processorDuration(item.method, item.id);
        if (item.cookProgress >= duration + TUNING.burnGraceSeconds) {
          item.stage = 'burnt';
          processor.burned = true;
          world.combo = 0;
          world.shake = 0.2;
          world.toast = `${INGREDIENTS[item.id].name} burned! Free the station at the one-tap bin.`;
          world.toastTimer = 3;
          world.soundEvents.push('error');
        }
        continue;
      }
      if (item.stage !== 'raw') continue;
      item.cookProgress += dt;
      const duration = processorDuration(item.method, item.id);
      processor.progress = Math.min(1, item.cookProgress / duration);
      if (item.cookProgress >= duration) {
        item.stage = 'cooked';
        item.burnAt = item.cookProgress;
        world.soundEvents.push('ready');
        pop(world, 'READY!', STATION_BY_ID[processor.stationId].x, STATION_BY_ID[processor.stationId].y - 3, '#ffdc83');
        addParticle(world, STATION_BY_ID[processor.stationId].x, STATION_BY_ID[processor.stationId].y + 22, '#ffe3a2', 11, 68);
      }
    }
  }
  if (!world.shot) {
    for (const particle of world.particles) {
      particle.x += particle.vx * dt; particle.y += particle.vy * dt;
      particle.vx *= 1 - dt * 2; particle.vy += 105 * dt; particle.life -= dt;
    }
    world.particles = world.particles.filter((particle) => particle.life > 0);
    for (const floater of world.floaters) { floater.y -= dt * 34; floater.life -= dt; }
    world.floaters = world.floaters.filter((floater) => floater.life > 0);
  }
}
