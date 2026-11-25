export const WIDTH = 1280;
export const HEIGHT = 800;

export const TUNING = {
  shiftSeconds: 180,
  walkSpeed: 255,
  interactionRadius: 66,
  chopSeconds: 1.18,
  burnGraceSeconds: 4.2,
  rushAtSeconds: 60,
  ticketCap: 4,
  earlySpawnSeconds: 18,
  rushSpawnSeconds: 9,
  ingredientValue: 13,
};

export const INGREDIENTS = {
  rice: { name: 'Rice', color: '#f2dba1', icon: 'rice', source: 'pantry' },
  noodle: { name: 'Noodles', color: '#f4bc58', icon: 'noodle', source: 'pantry' },
  greens: { name: 'Greens', color: '#78bb73', icon: 'greens', source: 'pantry' },
  chicken: { name: 'Chicken', color: '#d6814f', icon: 'chicken', source: 'fridge' },
  egg: { name: 'Egg', color: '#fff0c8', icon: 'egg', source: 'fridge' },
  chili: { name: 'Chili', color: '#ed6450', icon: 'chili', source: 'fridge' },
};

export const INGREDIENT_ORDER = ['rice', 'noodle', 'greens', 'chicken', 'egg', 'chili'];

export const RECIPES = {
  nasi_goreng: {
    name: 'Nasi Goreng', short: 'NASI GORENG', color: '#e8a94b',
    ingredients: ['rice', 'egg', 'chili'], patience: 66, coins: 45,
  },
  mie_ayam: {
    name: 'Mie Ayam', short: 'MIE AYAM', color: '#69b796',
    ingredients: ['noodle', 'chicken', 'greens'], patience: 68, coins: 48,
  },
  soto_ayam: {
    name: 'Soto Ayam', short: 'SOTO AYAM', color: '#f0c45d',
    ingredients: ['chicken', 'egg', 'greens'], patience: 72, coins: 50,
  },
  gado_gado: {
    name: 'Gado-Gado', short: 'GADO-GADO', color: '#80b77d',
    ingredients: ['greens', 'egg', 'chili'], patience: 58, coins: 43,
  },
  sate_ayam: {
    name: 'Sate Ayam', short: 'SATE AYAM', color: '#e77b50',
    ingredients: ['chicken', 'chili'], patience: 52, coins: 39,
  },
  nasi_uduk: {
    name: 'Nasi Uduk', short: 'NASI UDUK', color: '#a59cd5',
    ingredients: ['rice', 'egg', 'greens'], patience: 70, coins: 47,
  },
};

export const RECIPE_ORDER = Object.keys(RECIPES);

export const STATIONS = [
  { id: 'pantry', label: 'PANTRY', sublabel: 'RICE · NOODLE · GREENS', x: 145, y: 325, kind: 'pantry' },
  { id: 'fridge', label: 'CHILLER', sublabel: 'CHICKEN · EGG · CHILI', x: 145, y: 470, kind: 'fridge' },
  { id: 'board1', label: 'PREP BOARD', sublabel: 'HOLD E · CHOP', x: 375, y: 325, kind: 'board' },
  { id: 'board2', label: 'PREP BOARD', sublabel: 'HOLD E · CHOP', x: 555, y: 325, kind: 'board' },
  { id: 'pot1', label: 'BURNER 01', sublabel: 'BOIL · FRY · STEW', x: 735, y: 325, kind: 'pot' },
  { id: 'pot2', label: 'BURNER 02', sublabel: 'BOIL · FRY · STEW', x: 875, y: 325, kind: 'pot' },
  { id: 'grill', label: 'CHARCOAL GRILL', sublabel: 'SATE · SIZZLE', x: 1075, y: 325, kind: 'grill' },
  { id: 'plate', label: 'PLATING BAR', sublabel: 'BUILD YOUR DISH', x: 975, y: 520, kind: 'plate' },
  { id: 'window', label: 'SERVE WINDOW', sublabel: 'ON TIME = BIG TIPS', x: 1140, y: 520, kind: 'window' },
  { id: 'bin', label: 'ONE-TAP BIN', sublabel: 'CLEAR A BURNER / HAND', x: 185, y: 650, kind: 'bin' },
  { id: 'sink', label: 'PASS-THROUGH', sublabel: 'NEXT ORDER, KEEP MOVING', x: 800, y: 650, kind: 'sink' },
];

export const STATION_BY_ID = Object.fromEntries(STATIONS.map((station) => [station.id, station]));
