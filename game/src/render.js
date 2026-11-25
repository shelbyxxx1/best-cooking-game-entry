import { HEIGHT, INGREDIENTS, RECIPES, STATIONS, STATION_BY_ID, WIDTH } from './config.js';

const C = {
  ink: '#25233a', muted: '#776e71', cream: '#fff5dc', paper: '#fff9e9',
  wood: '#91623d', woodLight: '#bd8856', woodDark: '#603f36', gold: '#f1bd68',
  wall: '#f2d8af', tile: '#eed1a3', navy: '#22273c', teal: '#4e9e91',
  red: '#dc6354', green: '#8cb878', floor: '#c38b5b',
};

function rounded(ctx, x, y, width, height, radius, fill, stroke = null, lineWidth = 1) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
}

function text(ctx, value, x, y, size, color = C.ink, weight = 700, align = 'left', font = 'system-ui, sans-serif') {
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fillStyle = color; ctx.fillText(value, x, y);
}

function shadow(ctx, blur = 12, color = 'rgba(36, 24, 39, .16)', x = 0, y = 5) {
  ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.shadowOffsetX = x; ctx.shadowOffsetY = y;
}

function clearShadow(ctx) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }

function drawWood(ctx, x, y, width, height, color = C.wood) {
  rounded(ctx, x, y, width, height, 12, color, '#633f37', 2);
  ctx.save();
  ctx.beginPath(); ctx.roundRect(x, y, width, height, 12); ctx.clip();
  ctx.globalAlpha = 0.18;
  for (let grain = 0; grain < 4; grain += 1) {
    ctx.beginPath(); ctx.moveTo(x + 8, y + 11 + grain * 15); ctx.bezierCurveTo(x + width * .25, y + 1 + grain * 15, x + width * .7, y + 23 + grain * 15, x + width - 7, y + 8 + grain * 15);
    ctx.strokeStyle = grain % 2 ? '#f7cd89' : '#4c3734'; ctx.lineWidth = 2; ctx.stroke();
  }
  ctx.restore();
  for (const dx of [11, width - 11]) for (const dy of [10, height - 10]) {
    ctx.beginPath(); ctx.arc(x + dx, y + dy, 2.3, 0, Math.PI * 2); ctx.fillStyle = '#e3b37a'; ctx.fill();
  }
}

function drawIcon(ctx, id, x, y, size, stage = 'raw') {
  const ingredient = INGREDIENTS[id];
  if (!ingredient) return;
  const cooked = stage === 'cooked';
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = 'rgba(37,30,35,.22)'; ctx.shadowBlur = Math.max(2, size * .12); ctx.shadowOffsetY = size * .07;
  if (id === 'rice') {
    ctx.beginPath(); ctx.ellipse(0, size * .08, size * .43, size * .31, 0, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(-size * .1, -size * .1, 1, 0, 0, size * .5);
    gradient.addColorStop(0, cooked ? '#f7daa2' : '#fff1ca'); gradient.addColorStop(1, cooked ? '#dca34d' : '#d9c9a4'); ctx.fillStyle = gradient; ctx.fill();
    ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1.2, size * .045); ctx.strokeStyle = '#fff7df';
    for (const [gx, gy, radius] of [[-.22,-.02,.10],[-.08,-.16,.085],[.12,-.19,.075],[.23,-.02,.10],[.06,.06,.1],[-.15,.12,.075]]) {
      ctx.beginPath(); ctx.ellipse(gx * size, gy * size, radius * size, radius * size * .38, .4, 0, Math.PI * 2); ctx.stroke();
    }
    if (cooked) { ctx.fillStyle = '#ed873f'; ctx.globalAlpha = .7; ctx.beginPath(); ctx.arc(size * .26, size * .09, size * .035, 0, Math.PI * 2); ctx.fill(); }
  } else if (id === 'noodle') {
    ctx.lineCap = 'round';
    for (let line = 0; line < 5; line += 1) {
      ctx.beginPath(); ctx.moveTo(-size * .35, size * (-.12 + line * .085));
      ctx.bezierCurveTo(-size * .06, size * (-.33 + line * .05), size * .12, size * (.21 - line * .04), size * .36, size * (-.19 + line * .075));
      ctx.strokeStyle = cooked && line % 2 ? '#c97432' : ['#f9d277','#e7a846','#ffdf83'][line % 3]; ctx.lineWidth = Math.max(2, size * .09); ctx.stroke();
    }
  } else if (id === 'greens') {
    for (let leaf = 0; leaf < 5; leaf += 1) {
      const angle = leaf * Math.PI * 2 / 5 - .5;
      ctx.save(); ctx.rotate(angle);
      ctx.beginPath(); ctx.ellipse(size * .12, -size * .14, size * .18, size * .32, .56, 0, Math.PI * 2);
      const gradient = ctx.createLinearGradient(0, -size * .4, 0, size * .15);
      gradient.addColorStop(0, leaf % 2 ? '#a8d774' : '#69ad65'); gradient.addColorStop(1, '#43865b');
      ctx.fillStyle = gradient; ctx.fill();
      ctx.shadowColor = 'transparent'; ctx.beginPath(); ctx.moveTo(size * .12, size * .12); ctx.quadraticCurveTo(size * .11, -size * .1, size * .12, -size * .36); ctx.strokeStyle = 'rgba(240,248,193,.7)'; ctx.lineWidth = Math.max(1, size * .025); ctx.stroke();
      ctx.restore();
    }
  } else if (id === 'egg') {
    ctx.beginPath(); ctx.ellipse(0, 0, size * .43, size * .36, -.2, 0, Math.PI * 2);
    const white = ctx.createRadialGradient(-size * .12, -size * .14, size * .02, 0, 0, size * .5);
    white.addColorStop(0, '#fffef2'); white.addColorStop(1, cooked ? '#e5d6b5' : '#fff0d7'); ctx.fillStyle = white; ctx.fill();
    ctx.beginPath(); ctx.arc(size * .08, -size * .005, size * .185, 0, Math.PI * 2);
    const yolk = ctx.createRadialGradient(0, -size * .06, 0, size * .08, 0, size * .2);
    yolk.addColorStop(0, '#ffe984'); yolk.addColorStop(.65, '#f9ac42'); yolk.addColorStop(1, cooked ? '#dc7934' : '#ef8b39'); ctx.fillStyle = yolk; ctx.fill();
    ctx.beginPath(); ctx.arc(size * .04, -size * .08, size * .054, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,220,.72)'; ctx.fill();
    if (cooked) { for (const [cx, cy] of [[-.3,.1],[.28,-.1],[.18,.24]]) { ctx.beginPath(); ctx.arc(size * cx, size * cy, size * .025, 0, Math.PI * 2); ctx.fillStyle = '#5d4037'; ctx.fill(); } }
  } else if (id === 'chicken') {
    ctx.save(); ctx.rotate(-.45);
    ctx.beginPath(); ctx.ellipse(0, 0, size * .30, size * .40, 0, 0, Math.PI * 2);
    const meat = ctx.createLinearGradient(-size * .2, 0, size * .2, 0);
    meat.addColorStop(0, cooked ? '#b96738' : '#e7a277'); meat.addColorStop(.5, cooked ? '#f1bd74' : '#f1c09b'); meat.addColorStop(1, cooked ? '#9d4b31' : '#c87554'); ctx.fillStyle = meat; ctx.fill();
    if (cooked) { ctx.beginPath(); ctx.moveTo(-size * .12, -size * .2); ctx.quadraticCurveTo(size * .08, -size * .04, -size * .05, size * .25); ctx.strokeStyle = '#9c5632'; ctx.lineWidth = Math.max(1, size * .045); ctx.stroke(); }
    ctx.shadowColor = 'transparent'; ctx.strokeStyle = '#ffe1b2'; ctx.lineWidth = Math.max(2, size * .075); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, size * .27); ctx.lineTo(size * .01, size * .41); ctx.stroke();
    for (const [cx, cy] of [[-.035,.4],[.065,.4]]) { ctx.beginPath(); ctx.arc(size * cx, size * cy, size * .065, 0, Math.PI * 2); ctx.fillStyle = '#fff0d4'; ctx.fill(); }
    ctx.restore();
  } else if (id === 'chili') {
    ctx.save(); ctx.rotate(.42);
    ctx.beginPath(); ctx.moveTo(-size * .36, -size * .09); ctx.bezierCurveTo(-size * .11, -size * .31, size * .3, -size * .16, size * .4, size * .14); ctx.bezierCurveTo(size * .1, size * .37, -size * .3, size * .18, -size * .36, -size * .09);
    const red = ctx.createLinearGradient(-size * .2, -size * .2, size * .2, size * .3); red.addColorStop(0, '#ff8c68'); red.addColorStop(.47, cooked ? '#b83938' : '#ed5546'); red.addColorStop(1, '#b73843'); ctx.fillStyle = red; ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.beginPath(); ctx.moveTo(-size * .35, -size * .08); ctx.quadraticCurveTo(-size * .5, -size * .23, -size * .42, -size * .34); ctx.strokeStyle = '#6e9e5a'; ctx.lineWidth = Math.max(2, size * .055); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-size * .1, -size * .17); ctx.quadraticCurveTo(size * .05, -size * .08, size * .2, size * .08); ctx.strokeStyle = 'rgba(255,203,143,.55)'; ctx.lineWidth = Math.max(1, size * .023); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function drawDish(ctx, plate, x, y, scale = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  shadow(ctx, 10, 'rgba(29,25,38,.24)', 0, 5);
  ctx.beginPath(); ctx.ellipse(0, 5, 54, 27, 0, 0, Math.PI * 2); ctx.fillStyle = '#e8e0ce'; ctx.fill();
  clearShadow(ctx);
  ctx.beginPath(); ctx.ellipse(0, 1, 49, 23, 0, 0, Math.PI * 2); ctx.fillStyle = '#fffdf3'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 0, 37, 16, 0, 0, Math.PI * 2); ctx.fillStyle = plate?.recipeId === 'soto_ayam' ? '#edc658' : plate?.recipeId === 'mie_ayam' ? '#c79650' : '#ead1a4'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -4, 33, 12, 0, 0, Math.PI * 2); ctx.fillStyle = '#f4e4c0'; ctx.fill();
  const components = plate?.ingredients || [];
  components.forEach((part, index) => {
    const angle = (index / Math.max(1, components.length)) * Math.PI * 2 - .35;
    const cx = Math.cos(angle) * 20; const cy = Math.sin(angle) * 7 - 5;
    drawIcon(ctx, part.id, cx, cy, 30, part.stage);
  });
  if (plate?.finished) {
    ctx.beginPath(); ctx.ellipse(0, 0, 37, 16, 0, Math.PI * 1.03, Math.PI * 1.86); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.8; ctx.stroke();
  }
  ctx.restore();
}

function drawBackground(ctx) {
  ctx.fillStyle = '#f1d9b3'; ctx.fillRect(0, 0, WIDTH, 800);
  const topWall = ctx.createLinearGradient(0, 0, 0, 230); topWall.addColorStop(0, '#fff0d0'); topWall.addColorStop(1, '#e9c696');
  ctx.fillStyle = topWall; ctx.fillRect(0, 0, WIDTH, 238);
  ctx.fillStyle = '#d5ac7a'; ctx.fillRect(0, 231, WIDTH, 17);
  for (let row = 0; row < 3; row += 1) {
    const offset = row % 2 ? 36 : 0;
    for (let column = -1; column < 13; column += 1) {
      const x = column * 102 + offset;
      ctx.strokeStyle = 'rgba(140, 92, 66, .12)'; ctx.lineWidth = 1;
      ctx.strokeRect(x + 4, 7 + row * 74, 97, 71);
      ctx.beginPath(); ctx.arc(x + 17, 21 + row * 74, 2, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,249,225,.48)'; ctx.fill();
    }
  }
  ctx.fillStyle = '#b98150'; ctx.fillRect(0, 248, WIDTH, 552);
  for (let row = 0; row < 8; row += 1) {
    const offset = row % 2 ? 57 : 0;
    for (let column = -1; column < 12; column += 1) {
      const x = column * 123 + offset; const y = 248 + row * 70;
      ctx.fillStyle = row % 2 ? '#c38e5d' : '#cb9663'; ctx.fillRect(x + 1, y + 1, 120, 68);
      ctx.strokeStyle = 'rgba(93,53,48,.23)'; ctx.lineWidth = 1; ctx.strokeRect(x + 1, y + 1, 120, 68);
      ctx.beginPath(); ctx.moveTo(x + 15, y + 14); ctx.lineTo(x + 46, y + 14); ctx.strokeStyle = 'rgba(255,219,161,.22)'; ctx.stroke();
    }
  }
  ctx.fillStyle = '#73493e'; ctx.fillRect(0, 237, WIDTH, 5);
  drawDecorSign(ctx, 36, 68, 'WARUNG  ·  SENJA', 15);
  drawSteam(ctx, 71, 212, .8, .16);
  drawLeafPlant(ctx, 1235, 222, 1.1);
  drawLeafPlant(ctx, 25, 231, .85);
  rounded(ctx, 292, 241, 688, 38, 14, 'rgba(63,48,53,.78)', 'rgba(255,239,197,.32)', 1);
  text(ctx, 'HOT LINE  ·  PREP  ·  PLATING  ·  WINDOW', 636, 260, 12, '#f7e8ca', 800, 'center');
}

function drawLeafPlant(ctx, x, y, scale) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.fillStyle = '#9f6647'; ctx.beginPath(); ctx.roundRect(-12, -5, 24, 30, [2, 2, 8, 8]); ctx.fill();
  for (const [dx, dy, rotation] of [[-13,-17,-.7],[3,-24,.4],[15,-16,.85],[-1,-37,-.12]]) {
    ctx.save(); ctx.translate(dx, dy); ctx.rotate(rotation); ctx.beginPath(); ctx.ellipse(0, 0, 6, 15, 0, 0, Math.PI * 2); ctx.fillStyle = '#688e58'; ctx.fill(); ctx.restore();
  }
  ctx.restore();
}

function drawSteam(ctx, x, y, scale = 1, alpha = .6) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.lineCap = 'round'; ctx.lineWidth = 4 * scale; ctx.strokeStyle = '#fff3d2';
  for (let line = 0; line < 3; line += 1) {
    const offset = line * 10 * scale; const phase = Math.sin(performance.now() / 630 + line) * 3 * scale;
    ctx.beginPath(); ctx.moveTo(x + offset, y); ctx.bezierCurveTo(x + offset - 7 * scale, y - 13 * scale, x + offset + phase, y - 21 * scale, x + offset + 2 * scale, y - 35 * scale); ctx.stroke();
  }
  ctx.restore();
}

function drawDecorSign(ctx, x, y, label, size = 14) {
  shadow(ctx, 4, 'rgba(70,38,40,.16)', 0, 2);
  rounded(ctx, x, y, 222, 30, 9, '#765348', '#e7c18a', 1.5); clearShadow(ctx);
  text(ctx, label, x + 111, y + 15, size, '#f8e7c8', 800, 'center');
}

function drawStationLabel(ctx, station, subtitle = station.sublabel) {
  rounded(ctx, station.x - 75, station.y + 54, 150, 39, 8, '#5b4140', '#c79b69', 1.2);
  text(ctx, station.label, station.x, station.y + 66, station.label.length > 13 ? 10.2 : 11.5, '#fff3d9', 850, 'center');
  if (subtitle) text(ctx, subtitle, station.x, station.y + 82, 7.8, '#e6c9a6', 700, 'center');
}

function drawPantry(ctx, station) {
  drawWood(ctx, station.x - 64, station.y - 55, 128, 107, '#82543f');
  for (let row = 0; row < 3; row += 1) {
    const shelfY = station.y - 26 + row * 31;
    ctx.fillStyle = '#d5a56c'; ctx.fillRect(station.x - 56, shelfY + 19, 112, 6);
    const id = ['rice', 'noodle', 'greens'][row];
    rounded(ctx, station.x - 49, shelfY - 10, 98, 28, 7, row === 2 ? '#395d45' : '#f2dfbb', '#624841', 1);
    drawIcon(ctx, id, station.x - 33, shelfY + 1, 19);
    text(ctx, id.toUpperCase(), station.x + 8, shelfY + 2, 10, row === 2 ? '#eff0c5' : '#453c39', 850, 'center');
  }
  drawStationLabel(ctx, station, '');
}

function drawFridge(ctx, station) {
  rounded(ctx, station.x - 56, station.y - 66, 112, 119, 13, '#426779', '#d5cda9', 3);
  rounded(ctx, station.x - 47, station.y - 56, 94, 99, 8, '#b6c6b5', '#344b54', 1.6);
  ctx.fillStyle = '#8ca59e'; ctx.fillRect(station.x - 43, station.y - 14, 86, 4);
  ctx.fillStyle = '#547378'; ctx.fillRect(station.x + 33, station.y - 42, 4, 19);
  ctx.fillStyle = '#547378'; ctx.fillRect(station.x + 33, station.y - 4, 4, 15);
  const items = [['chicken', station.x - 29], ['egg', station.x], ['chili', station.x + 28]];
  for (const [id, x] of items) {
    rounded(ctx, x - 12, station.y - 44, 26, 24, 4, '#eff0d9', 'rgba(54,66,67,.28)', 1);
    drawIcon(ctx, id, x, station.y - 32, 19);
  }
  ctx.strokeStyle = '#7b9790'; ctx.beginPath(); ctx.moveTo(station.x - 39, station.y + 12); ctx.lineTo(station.x + 22, station.y + 12); ctx.stroke();
  drawStationLabel(ctx, station, 'CHICKEN  ·  EGG  ·  CHILI');
}

function drawBoard(ctx, station, world) {
  drawWood(ctx, station.x - 74, station.y - 42, 148, 88, '#be8a55');
  rounded(ctx, station.x - 60, station.y - 31, 120, 65, 11, '#e1bc82', '#80533b', 1.3);
  ctx.beginPath(); ctx.ellipse(station.x, station.y - 4, 46, 20, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(125,77,54,.12)'; ctx.fill();
  ctx.save(); ctx.translate(station.x + 31, station.y - 11); ctx.rotate(.48);
  rounded(ctx, -3, -22, 7, 40, 3, '#e9e3cf', '#726768', 1); ctx.beginPath(); ctx.moveTo(-3, -21); ctx.lineTo(4, -21); ctx.lineTo(0, -36); ctx.closePath(); ctx.fillStyle = '#d7d5ca'; ctx.fill(); ctx.restore();
  if (Math.sin(world.elapsed * 5) > .78 && !world.shot) drawSparkle(ctx, station.x - 45, station.y - 35, 8, '#fff4cd');
  const chopping = world.player.nearbyStation?.id === station.id && world.player.hand?.stage === 'raw' && world.player.chopProgress > 0;
  if (chopping) drawProgress(ctx, station.x + 49, station.y - 42, world.player.chopProgress / 1.18, '#9dd787', 'CHOP');
  drawStationLabel(ctx, station, 'HOLD E  ·  1.2 SEC');
}

function drawPot(ctx, station, processor) {
  rounded(ctx, station.x - 65, station.y - 48, 130, 93, 12, '#51464a', '#312f3a', 2);
  rounded(ctx, station.x - 56, station.y - 38, 112, 53, 9, '#77706a', '#e0b476', 2);
  const burner = ctx.createRadialGradient(station.x, station.y - 7, 2, station.x, station.y - 7, 39);
  burner.addColorStop(0, '#ffc15d'); burner.addColorStop(.5, '#dc7043'); burner.addColorStop(1, '#6d4541');
  ctx.beginPath(); ctx.ellipse(station.x, station.y - 8, 34, 18, 0, 0, Math.PI * 2); ctx.fillStyle = burner; ctx.fill();
  ctx.beginPath(); ctx.ellipse(station.x, station.y - 25, 29, 13, 0, Math.PI, Math.PI * 2); ctx.fillStyle = '#9c99a0'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(station.x, station.y - 25, 27, 9, 0, Math.PI, Math.PI * 2); ctx.fillStyle = processor.burned ? '#28252c' : processor.item?.stage === 'cooked' ? '#ce9b50' : '#665954'; ctx.fill();
  if (processor.item && processor.item.stage !== 'burnt') {
    drawIcon(ctx, processor.item.id, station.x, station.y - 33, 31, processor.item.stage);
    if (processor.item.stage === 'raw') drawSteam(ctx, station.x - 15, station.y - 39, .48, .54);
    drawProgress(ctx, station.x + 46, station.y - 39, processor.progress, processor.item.stage === 'cooked' ? '#77cc8d' : '#f4c469', processor.item.stage === 'cooked' ? 'READY' : 'COOK');
  }
  if (processor.burned) {
    text(ctx, 'BURNT', station.x, station.y - 5, 10, '#ff8b78', 900, 'center');
    drawSteam(ctx, station.x + 19, station.y - 29, .55, .36);
  } else {
    ctx.beginPath(); ctx.arc(station.x - 24, station.y + 28, 4, 0, Math.PI * 2); ctx.fillStyle = processor.item?.stage === 'cooked' ? '#81d38a' : processor.item ? '#f5bc54' : '#76bc80'; ctx.fill();
  }
  drawStationLabel(ctx, station, 'BOIL  ·  FRY  ·  STEW');
}

function drawGrill(ctx, station, processor) {
  drawWood(ctx, station.x - 82, station.y - 46, 164, 96, '#57413d');
  rounded(ctx, station.x - 70, station.y - 38, 140, 68, 11, '#302d38', '#dc8552', 2);
  const fire = ctx.createRadialGradient(station.x, station.y + 1, 1, station.x, station.y + 1, 56);
  fire.addColorStop(0, '#f8b85e'); fire.addColorStop(.48, '#b95344'); fire.addColorStop(1, '#47373c');
  ctx.fillStyle = fire; ctx.beginPath(); ctx.ellipse(station.x, station.y, 57, 26, 0, 0, Math.PI * 2); ctx.fill();
  for (let line = -2; line <= 2; line += 1) { ctx.strokeStyle = 'rgba(241,219,188,.78)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(station.x - 55, station.y + line * 9); ctx.lineTo(station.x + 55, station.y + line * 9); ctx.stroke(); }
  if (processor.item && processor.item.stage !== 'burnt') {
    drawIcon(ctx, processor.item.id, station.x - 4, station.y - 7, 36, processor.item.stage);
    drawProgress(ctx, station.x + 51, station.y - 37, processor.progress, '#ffad62', processor.item.stage === 'cooked' ? 'READY' : 'SIZZLE');
    if (processor.item.stage === 'raw') drawSteam(ctx, station.x - 30, station.y - 9, .47, .72);
  }
  ctx.fillStyle = processor.burned ? '#dc6454' : '#f3ad58'; ctx.beginPath(); ctx.arc(station.x - 49, station.y + 16, 4, 0, Math.PI * 2); ctx.fill();
  drawStationLabel(ctx, station, processor.burned ? 'SMOKED  ·  BIN IT' : 'CHICKEN SKEWERS');
}

function drawPlateBar(ctx, station, world) {
  drawWood(ctx, station.x - 77, station.y - 46, 154, 100, '#976043');
  rounded(ctx, station.x - 68, station.y - 39, 136, 66, 10, '#dfbd8b', '#664843', 1.3);
  ctx.beginPath(); ctx.arc(station.x - 38, station.y - 8, 19, 0, Math.PI * 2); ctx.fillStyle = '#f4ecda'; ctx.fill();
  ctx.beginPath(); ctx.arc(station.x - 38, station.y - 8, 14, 0, Math.PI * 2); ctx.fillStyle = '#fffdf2'; ctx.fill();
  for (let stripe = 0; stripe < 3; stripe += 1) {
    rounded(ctx, station.x + 4, station.y - 25 + stripe * 14, 44, 9, 3, ['#ddd0b0','#93ad6b','#dc9c4e'][stripe]);
  }
  if (world.counterPlate && world.player.plate && !world.player.hasDish) drawDish(ctx, world.counterPlate, station.x + 2, station.y - 5, .78);
  drawStationLabel(ctx, station, 'BUILD  ·  PICK UP  ·  GO');
}

function drawServiceWindow(ctx, station, world) {
  rounded(ctx, station.x - 66, station.y - 53, 132, 104, 12, '#5e463f', '#e5bd7c', 2);
  rounded(ctx, station.x - 53, station.y - 40, 106, 72, 9, '#e0b76c', '#3d383c', 1.4);
  rounded(ctx, station.x - 46, station.y - 33, 92, 57, 5, '#583d3d');
  ctx.fillStyle = '#c57550'; ctx.fillRect(station.x - 47, station.y - 34, 94, 9);
  for (let stripe = -3; stripe <= 3; stripe += 2) {
    ctx.beginPath(); ctx.moveTo(station.x + stripe * 12, station.y - 36); ctx.lineTo(station.x + stripe * 12 + 11, station.y - 25); ctx.lineTo(station.x + stripe * 12 + 11, station.y - 17); ctx.lineTo(station.x + stripe * 12, station.y - 28); ctx.closePath(); ctx.fillStyle = stripe % 3 ? '#f2d29b' : '#f4bf6f'; ctx.fill();
  }
  ctx.fillStyle = '#a37157'; ctx.fillRect(station.x - 61, station.y + 16, 122, 10);
  if (world.windowPlate) drawDish(ctx, world.windowPlate, station.x, station.y - 1, .83);
  else {
    ctx.beginPath(); ctx.ellipse(station.x, station.y + 1, 33, 13, 0, 0, Math.PI * 2); ctx.fillStyle = '#c5c0aa'; ctx.fill();
    text(ctx, 'READY?', station.x, station.y, 9, '#6f6262', 850, 'center');
  }
  drawStationLabel(ctx, station, 'ON-TIME  ·  BIG TIPS');
}

function drawBin(ctx, station) {
  rounded(ctx, station.x - 44, station.y - 43, 88, 74, 12, '#536f70', '#e0c295', 2);
  rounded(ctx, station.x - 51, station.y - 50, 102, 15, 6, '#3a4c53', '#d0aa76', 1);
  ctx.strokeStyle = '#adc3b0'; ctx.lineWidth = 2;
  for (let line = -1; line <= 1; line += 1) { ctx.beginPath(); ctx.moveTo(station.x + line * 18, station.y - 18); ctx.lineTo(station.x + line * 18, station.y + 17); ctx.stroke(); }
  text(ctx, '✦', station.x, station.y + 4, 19, '#d0dcad', 800, 'center');
  drawStationLabel(ctx, station, 'E  ·  CLEAR A BURNER');
}

function drawPassThrough(ctx, station) {
  drawWood(ctx, station.x - 71, station.y - 33, 142, 70, '#81573f');
  rounded(ctx, station.x - 61, station.y - 26, 122, 54, 8, '#d9bd94', '#553f3f', 1.4);
  for (let note = 0; note < 4; note += 1) {
    ctx.save(); ctx.translate(station.x - 33 + note * 22, station.y - 5); ctx.rotate((note % 2 ? .12 : -.1));
    rounded(ctx, -8, -17, 16, 25, 2, note === 1 ? '#e8a45b' : '#f5e4c6', '#70514a', 1);
    ctx.restore();
  }
  drawStationLabel(ctx, station, 'STAY IN THE FLOW');
}

function drawSparkle(ctx, x, y, radius, color) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-radius, 0); ctx.lineTo(radius, 0); ctx.moveTo(0, -radius); ctx.lineTo(0, radius); ctx.stroke(); ctx.restore();
}

function drawProgress(ctx, x, y, value, color, label) {
  ctx.save();
  ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(46,40,49,.24)'; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, 14, -Math.PI / 2, -Math.PI / 2 + Math.max(.03, Math.min(1, value)) * Math.PI * 2); ctx.strokeStyle = color; ctx.stroke();
  text(ctx, `${Math.max(0, Math.round(value * 100))}%`, x, y + .5, 7.5, '#fff9e9', 900, 'center');
  if (label) text(ctx, label, x, y - 22, 7.2, color, 900, 'center');
  ctx.restore();
}

function drawKitchen(ctx, world) {
  drawBackground(ctx);
  for (const station of STATIONS) {
    if (station.id === 'pantry') drawPantry(ctx, station);
    else if (station.id === 'fridge') drawFridge(ctx, station);
    else if (station.kind === 'board') drawBoard(ctx, station, world);
    else if (station.kind === 'pot') drawPot(ctx, station, world.stations[station.id]);
    else if (station.id === 'grill') drawGrill(ctx, station, world.stations.grill);
    else if (station.kind === 'plate') drawPlateBar(ctx, station, world);
    else if (station.kind === 'window') drawServiceWindow(ctx, station, world);
    else if (station.id === 'bin') drawBin(ctx, station);
    else drawPassThrough(ctx, station);
  }
}

function drawOrderBoard(ctx, world) {
  shadow(ctx, 10, 'rgba(76,47,47,.17)', 0, 4);
  rounded(ctx, 30, 77, 1220, 153, 16, '#624844', '#edca8e', 2); clearShadow(ctx);
  rounded(ctx, 41, 88, 1198, 132, 12, '#e6c89c', '#b4825d', 1.3);
  text(ctx, 'TICKETS', 51, 97, 10, '#644947', 900);
  text(ctx, 'CLICK AN ORDER FOR YOUR NEXT STEP', 1225, 97, 9, '#795652', 750, 'right');
  if (world.orders.length === 0) {
    rounded(ctx, 50, 111, 1177, 97, 10, '#f9f0dc', '#d2b88d', 1);
    text(ctx, 'THE BOARD IS CLEAR!', 640, 148, 20, '#5f7d61', 850, 'center');
    text(ctx, 'Check the stores, keep the burners warm. New tickets are coming.', 640, 177, 13, '#766e69', 650, 'center');
    return;
  }
  world.orders.forEach((order, index) => {
    const recipe = RECIPES[order.recipeId];
    const left = 46 + index * 297;
    const selected = order.id === world.selectedOrderId;
    const danger = order.remaining / order.maxPatience < .31;
    const patina = selected ? '#fff9e8' : '#f7ecd2';
    shadow(ctx, selected ? 6 : 2, selected ? 'rgba(57,42,41,.18)' : 'rgba(40,33,39,.07)', 0, selected ? 3 : 1);
    rounded(ctx, left, 110, 285, 102, 10, patina, selected ? '#d3834a' : '#ddc7a1', selected ? 2 : 1); clearShadow(ctx);
    rounded(ctx, left + 10, 117, 37, 18, 6, danger ? '#a74747' : selected ? '#d7834c' : '#657c68');
    text(ctx, `${String(index + 1).padStart(2, '0')}`, left + 28, 126, 9, '#fff7e6', 900, 'center');
    text(ctx, recipe.short, left + 54, 127, recipe.short.length > 11 ? 11.5 : 12.5, '#3e3b3d', 900);
    if (selected) text(ctx, '●', left + 271, 127, 8, '#df8d51', 900, 'center');
    const iconsStart = left + 23;
    recipe.ingredients.forEach((ingredientId, ingredientIndex) => {
      const iconX = iconsStart + ingredientIndex * 39;
      drawIcon(ctx, ingredientId, iconX, 159, 26, ['greens', 'chili'].includes(ingredientId) ? 'chopped' : ingredientId === 'egg' && order.recipeId === 'gado_gado' ? 'chopped' : 'raw');
      text(ctx, ingredientIndex === recipe.ingredients.length - 1 ? '' : '·', iconX + 24, 160, 12, '#8e7160', 900, 'center');
    });
    const fraction = Math.max(0, order.remaining / order.maxPatience);
    const barX = left + 16; const barY = 188;
    rounded(ctx, barX, barY, 251, 8, 4, '#dfd5c5');
    rounded(ctx, barX, barY, Math.max(0, 251 * fraction), 8, 4, fraction < .3 ? '#d65c52' : fraction < .58 ? '#e6a34a' : '#78a975');
    text(ctx, `${Math.ceil(order.remaining)}s`, left + 266, 193, 9, fraction < .3 ? '#bc4945' : '#655b59', 850, 'right');
    const completed = world.player.plate?.orderId === order.id ? world.player.plate.ingredients : [];
    if (completed.length) text(ctx, `${completed.length}/${recipe.ingredients.length} ON PLATE`, left + 16, 205, 7.4, '#73836d', 800);
    else text(ctx, `${recipe.coins} COINS  ·  ${recipe.patience}s TO SERVE`, left + 16, 205, 7.4, '#8e7963', 750);
  });
  for (let index = world.orders.length; index < 4; index += 1) {
    const x = 46 + index * 297;
    rounded(ctx, x, 110, 285, 102, 10, 'rgba(251,243,224,.26)', 'rgba(110,82,68,.18)', 1);
    text(ctx, 'NEXT TICKET', x + 142, 151, 11, 'rgba(81,66,62,.48)', 800, 'center');
    text(ctx, 'Stay ahead of the rush', x + 142, 172, 9, 'rgba(81,66,62,.5)', 600, 'center');
  }
}

function drawBrandAndClock(ctx, world, audio) {
  rounded(ctx, 30, 17, 251, 49, 13, '#2e3143', '#d5a56b', 1.6);
  ctx.beginPath(); ctx.arc(55, 41, 14, 0, Math.PI * 2); ctx.fillStyle = '#eb9b5b'; ctx.fill();
  drawIcon(ctx, 'chili', 56, 41, 23);
  text(ctx, 'DAPUR', 81, 33, 16.5, '#fff5df', 950);
  text(ctx, 'KILAT', 81, 51, 15, '#f4c26d', 950);
  rounded(ctx, 186, 27, 81, 26, 8, '#464657', '#706457', 1);
  text(ctx, 'SENJA  01', 226, 40, 8, '#ead8b3', 800, 'center');

  rounded(ctx, 768, 21, 142, 42, 11, '#fff4dd', '#dbbb8e', 1.3);
  text(ctx, 'TIP JAR', 802, 32, 8, '#887670', 800);
  text(ctx, `◈ ${world.coins}`, 839, 49, 16, '#97633a', 900, 'center');
  rounded(ctx, 919, 21, 107, 42, 11, world.combo ? '#52634d' : '#5f5755', world.combo ? '#aec68e' : '#aa9c85', 1.2);
  text(ctx, 'COMBO', 972, 31, 7.5, '#f5e8cb', 800, 'center');
  text(ctx, world.combo ? `✦ ×${Math.min(5, 1 + Math.floor(world.combo / 2))}` : '—', 972, 49, 15, world.combo ? '#f6cf77' : '#e0d1bb', 900, 'center');

  const critical = world.shiftLeft <= 30 && world.mode === 'playing';
  const glow = critical ? .5 + Math.sin(performance.now() / 105) * .2 : 1;
  ctx.save(); ctx.globalAlpha = .82 + glow * .18;
  shadow(ctx, critical ? 13 : 6, critical ? 'rgba(227,86,74,.33)' : 'rgba(47,37,41,.14)', 0, 2);
  rounded(ctx, 1038, 15, 211, 56, 13, critical ? '#a94e4a' : '#f6e7c9', critical ? '#f4a77e' : '#ad805e', 1.6); clearShadow(ctx);
  text(ctx, 'SHIFT LEFT', 1070, 29, 8, critical ? '#ffe9ce' : '#82645a', 900);
  const seconds = Math.ceil(world.shiftLeft);
  const clockString = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  text(ctx, clockString, 1160, 48, 25, critical ? '#fff4dc' : '#453a3b', 900, 'center', 'ui-monospace, monospace');
  if (audio.muted) text(ctx, 'MUTE', 1237, 27, 7, '#aa6056', 900, 'right');
  ctx.restore();
}

function drawChef(ctx, player, world) {
  const bob = player.target || Math.hypot(player.x - 640, player.y - 650) > 2 ? Math.sin(player.walkPhase) * 3 : Math.sin(world.elapsed * 3.2) * 1.4;
  const px = player.x; const py = player.y + bob;
  ctx.save(); ctx.translate(px, py); ctx.scale(player.facing, 1);
  ctx.beginPath(); ctx.ellipse(1, 19, 23, 8, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(62,40,43,.27)'; ctx.fill();
  ctx.strokeStyle = '#ad694e'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-8, 12); ctx.lineTo(-10, 27); ctx.moveTo(9, 12); ctx.lineTo(11, 27); ctx.stroke();
  ctx.strokeStyle = '#463c46'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-15, 28); ctx.quadraticCurveTo(-7, 30, -3, 27); ctx.moveTo(5, 27); ctx.quadraticCurveTo(15, 31, 17, 26); ctx.stroke();
  rounded(ctx, -18, -13, 37, 34, 10, '#e68a58', '#8d564b', 1.3);
  rounded(ctx, -12, -11, 25, 31, 7, '#448a82', '#efc889', 1.2);
  ctx.strokeStyle = '#f2d39f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 13); ctx.stroke();
  ctx.beginPath(); ctx.arc(1, -29, 15, 0, Math.PI * 2); ctx.fillStyle = '#b87357'; ctx.fill();
  ctx.beginPath(); ctx.arc(5, -31, 10, 0, Math.PI * 2); ctx.fillStyle = '#d58c68'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(1, -43, 15, 10, 0, 0, Math.PI * 2); ctx.fillStyle = '#fff1d7'; ctx.fill();
  rounded(ctx, -10, -53, 21, 12, 6, '#fff9eb', '#e9d9bd', 1);
  ctx.beginPath(); ctx.arc(15, -30, 2, 0, Math.PI * 2); ctx.fillStyle = '#2e3242'; ctx.fill();
  ctx.beginPath(); ctx.arc(7, -20, 5, 0, Math.PI * 2); ctx.fillStyle = '#f5c875'; ctx.fill();
  ctx.strokeStyle = '#e7b27b'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  if (player.hand) {
    ctx.beginPath(); ctx.moveTo(12, -5); ctx.quadraticCurveTo(24, -10, 29, -14); ctx.stroke();
    drawIcon(ctx, player.hand.id, 34, -19, 28, player.hand.stage);
  } else {
    ctx.beginPath(); ctx.moveTo(13, -4); ctx.lineTo(25, 1); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(-12, -3); ctx.lineTo(-22, 2); ctx.stroke();
  if (player.plate && player.hasDish) drawDish(ctx, player.plate, -31, 10, .39);
  ctx.restore();
  if (player.chopProgress > 0 && player.chopProgress < 1.18) drawProgress(ctx, px + 30, py - 49, player.chopProgress / 1.18, '#94d688', 'CHOP');
}

function drawParticles(ctx, world) {
  for (const particle of world.particles) {
    ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, particle.life / particle.maxLife));
    if (particle.color === '#fff0a3' || particle.color === '#ffe090') drawSparkle(ctx, particle.x, particle.y, particle.size, particle.color);
    else { ctx.beginPath(); ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); ctx.fillStyle = particle.color; ctx.fill(); }
    ctx.restore();
  }
  const floaterOffset = Math.min(0, 365 - Math.max(...world.floaters.map((floater) => floater.y)));
  for (const floater of world.floaters) {
    ctx.save(); ctx.globalAlpha = Math.max(.08, Math.min(1, floater.life / 1.2));
    const size = floater.text.length > 22 ? 12 : 15;
    const floaterY = floater.y + floaterOffset;
    ctx.font = `900 ${size}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 4; ctx.strokeStyle = '#5b4240';
    ctx.strokeText(floater.text, floater.x, floaterY);
    ctx.fillStyle = floater.color; ctx.fillText(floater.text, floater.x, floaterY);
    ctx.restore();
  }
}

function drawRushBanner(ctx, world) {
  if (world.shiftLeft <= 60 && world.mode === 'playing') {
    rounded(ctx, 1047, 238, 202, 22, 8, '#a64a47', '#f2be70', 1);
    const pulse = .75 + (Math.sin(performance.now() / 150) + 1) * .1;
    ctx.save(); ctx.globalAlpha = pulse; text(ctx, '✦  RUSH HOUR  ✦', 1148, 249, 12, '#fff0d7', 900, 'center'); ctx.restore();
  } else {
    rounded(ctx, 1082, 239, 168, 20, 8, '#5e6553', '#d9b783', 1);
    text(ctx, 'DINNER SERVICE', 1166, 249, 9, '#f8e8c8', 800, 'center');
  }
  if (world.rushBanner > 0) {
    ctx.save(); ctx.globalAlpha = Math.min(1, world.rushBanner * 1.5);
    shadow(ctx, 18, 'rgba(61,34,44,.28)', 0, 5);
    rounded(ctx, 402, 277, 476, 61, 17, '#a94c47', '#f1c879', 2); clearShadow(ctx);
    text(ctx, 'RUSH HOUR', 640, 301, 25, '#fff1d7', 950, 'center');
    text(ctx, 'FOUR TICKETS. HOT LINE. ONE TINY KITCHEN.', 640, 324, 10, '#fbd7a0', 800, 'center');
    ctx.restore();
  }
}

function drawBottomHud(ctx, world) {
  rounded(ctx, 264, 746, 752, 35, 12, 'rgba(40,40,52,.93)', '#b78a5a', 1.2);
  ctx.beginPath(); ctx.arc(286, 763, 5, 0, Math.PI * 2); ctx.fillStyle = world.toastTimer > 0 ? '#edb761' : '#93bf84'; ctx.fill();
  const line = world.toastTimer > 0 ? world.toast : world.actionHint;
  text(ctx, line.length > 91 ? `${line.slice(0, 88)}…` : line, 640, 763, line.length > 80 ? 10.5 : 11.5, '#fff2da', 700, 'center');
  text(ctx, `SERVED  ${String(world.served).padStart(2, '0')}`, 1189, 757, 9, '#f9ead1', 800, 'right');
  text(ctx, `BEST ✦${world.bestCombo}`, 1189, 773, 8, '#f4d088', 800, 'right');
  rounded(ctx, 33, 740, 192, 47, 10, 'rgba(49,47,57,.89)', '#af855d', 1);
  text(ctx, world.player.hand ? `HAND · ${INGREDIENTS[world.player.hand.id].name.toUpperCase()}` : 'HAND · FREE', 46, 752, 8.5, '#f5dcad', 800);
  const plateLabel = world.player.plate ? `PLATE · ${world.player.plate.ingredients.length}/${RECIPES[world.player.plate.recipeId].ingredients.length}` : 'PLATE · NONE';
  text(ctx, plateLabel, 46, 771, 8.5, world.player.plate?.finished ? '#b8dd9c' : '#e7dccb', 800);
}

function drawTitle(ctx, world) {
  ctx.fillStyle = 'rgba(32,34,49,.31)'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  shadow(ctx, 28, 'rgba(34,27,38,.38)', 0, 9);
  rounded(ctx, 333, 291, 614, 329, 24, '#fff4dc', '#f2c47c', 3); clearShadow(ctx);
  rounded(ctx, 353, 310, 574, 292, 17, '#f7e4c5', '#d6a56c', 1.4);
  ctx.beginPath(); ctx.arc(638, 346, 26, 0, Math.PI * 2); ctx.fillStyle = '#e89053'; ctx.fill();
  drawIcon(ctx, 'chili', 638, 346, 36);
  text(ctx, 'DAPUR KILAT', 640, 397, 43, '#383345', 950, 'center');
  text(ctx, 'THE LITTLE LATE-NIGHT WARUNG', 640, 431, 12, '#966350', 850, 'center');
  text(ctx, 'Six recipes. Two burners. One very fast cook.', 640, 470, 16, '#60515a', 700, 'center');
  rounded(ctx, 445, 494, 390, 43, 13, '#448d80', '#b5d49b', 2);
  text(ctx, 'CLICK OR PRESS SPACE TO START', 640, 516, 14, '#fff4de', 900, 'center');
  text(ctx, 'WASD / ARROWS TO MOVE  ·  HOLD E TO CHOP  ·  E TO ACT', 640, 558, 10, '#645b5b', 800, 'center');
  text(ctx, 'R RESTART  ·  P PAUSE  ·  M SOUND', 640, 580, 9, '#8b7568', 750, 'center');
  text(ctx, 'CITY MARKET  /  SUNDOWN SHIFT  /  03:00', 640, 636, 9, '#f6e6ca', 900, 'center');
}

function drawPause(ctx) {
  ctx.fillStyle = 'rgba(32,34,49,.46)'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  rounded(ctx, 440, 340, 400, 139, 20, '#fff4dc', '#e6b873', 2.5);
  text(ctx, 'SERVICE PAUSED', 640, 385, 26, '#343245', 950, 'center');
  text(ctx, 'P OR ESC TO JUMP BACK INTO THE RUSH', 640, 431, 12, '#785f5c', 800, 'center');
}

function drawGameOver(ctx, world) {
  ctx.fillStyle = 'rgba(32,34,49,.77)'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  rounded(ctx, 388, 231, 504, 366, 21, '#fff4de', '#f1c17c', 3);
  text(ctx, 'THE WINDOW IS SHUT', 640, 279, 23, '#3e3744', 950, 'center');
  text(ctx, 'SHIFT COMPLETE', 640, 310, 10, '#ae775d', 850, 'center');
  ctx.fillStyle = '#ead4ae'; ctx.fillRect(450, 342, 380, 1.5);
  text(ctx, 'COINS', 514, 375, 10, '#806a60', 800, 'center');
  text(ctx, `${world.coins}`, 514, 413, 37, '#9b603e', 950, 'center');
  text(ctx, 'DISHES', 640, 375, 10, '#806a60', 800, 'center');
  text(ctx, `${world.served}`, 640, 413, 37, '#658565', 950, 'center');
  text(ctx, 'BEST COMBO', 766, 375, 10, '#806a60', 800, 'center');
  text(ctx, `×${Math.min(5, 1 + Math.floor(world.bestCombo / 2))}`, 766, 413, 37, '#bf8746', 950, 'center');
  rounded(ctx, 473, 467, 334, 48, 13, '#438a7d', '#b8d49b', 2);
  text(ctx, 'R  ·  PLAY THE SHIFT AGAIN', 640, 491, 13, '#fff3db', 900, 'center');
  text(ctx, 'Six recipes. Plenty more plates to make.', 640, 547, 12, '#796962', 700, 'center');
}

export function renderGame(ctx, world, audio) {
  ctx.save();
  if (world.shake > 0) { const nudge = world.shake * 13; ctx.translate(Math.sin(world.elapsed * 75) * nudge, Math.cos(world.elapsed * 90) * nudge * .45); }
  drawKitchen(ctx, world);
  drawOrderBoard(ctx, world);
  drawBrandAndClock(ctx, world, audio);
  drawRushBanner(ctx, world);
  drawChef(ctx, world.player, world);
  drawParticles(ctx, world);
  drawBottomHud(ctx, world);
  if (world.mode === 'title') drawTitle(ctx, world);
  else if (world.mode === 'paused') drawPause(ctx);
  else if (world.mode === 'gameover') drawGameOver(ctx, world);
  ctx.restore();
  const live = document.getElementById('status');
  if (live) live.textContent = world.toastTimer > 0 ? world.toast : world.actionHint;
}

export function fitCanvas(canvas, context) {
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.round(rect.width * pixelRatio);
  const height = Math.round(rect.height * pixelRatio);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width; canvas.height = height;
  }
  context.setTransform(width / WIDTH, 0, 0, height / HEIGHT, 0, 0);
}
