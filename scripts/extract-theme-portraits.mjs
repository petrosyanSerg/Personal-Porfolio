import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let sharp;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.error(
    'This script needs `sharp`, which normally arrives with Next.\n' +
      'If it has gone missing: npm install --save-dev sharp',
  );
  process.exit(1);
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(root, 'public/themes/source/50-theme-collage.jpg');
const THEMES_DIR = path.join(root, 'public/themes');

export const COLS = [
  [0, 146],
  [146, 293],
  [293, 440],
  [440, 587],
  [587, 734],
  [734, 881],
  [881, 1024],
];

export const ROWS = [
  [21, 149],
  [171, 292],
  [313, 436],
  [452, 575],
  [588, 720],
  [733, 858],
  [878, 1004],
];

const INSET = 3;

const BOTTOM_INSET = 7;

export const SIZES = {
  plate: { dir: 'portraits', width: 140, height: 112 },
  about: { dir: 'about', width: 400, height: 500 },
};

export const TILES = {
  neoclassical: [1, 1],
  baroque: [1, 2],
  aurora: [1, 3],
  ethereal: [1, 4],
  filigree: [1, 5],
  acanthus: [1, 6],
  'pixel-art': [1, 7],
  'luxury-typography': [2, 1],
  'conceptual-sketch': [2, 2],
  japandi: [2, 3],
  memphis: [2, 4],
  bohemian: [2, 5],
  'shabby-chic': [2, 6],
  cottagecore: [2, 7],
  victorian: [3, 1],
  'art-deco': [3, 2],
  'art-nouveau': [3, 3],
  'mystical-western': [3, 4],
  y2k: [3, 5],
  bauhaus: [3, 6],
  cybercore: [3, 7],
  synthwave: [4, 1],
  vaporwave: [4, 2],
  'pop-art': [4, 4],
  'bento-box': [4, 5],
  graffiti: [4, 6],
  tenebrism: [4, 7],
  gothic: [5, 1],
  pointillism: [5, 2],
  'mixed-media': [5, 3],
  steampunk: [5, 5],
  kawaii: [5, 6],
  coquette: [5, 7],
  scrapbook: [6, 1],
  'frutiger-aero': [6, 2],
  'dark-academia': [6, 3],
  'light-academia': [6, 4],
  'wabi-sabi': [6, 5],
  utilitarian: [6, 6],
  'wild-west': [6, 7],
  nautical: [7, 2],
  rebus: [7, 3],
  glassmorphism: [7, 4],
  'modular-typography': [7, 6],
  'neo-brutalism': [7, 7],
};

export const MISSING = {
  anthropomorphic: 'tile 1x7 is captioned Anthropomorphic but draws Pixel Art',
  kitsch: 'both "Kitsch" captions sit on Bohemian and Cybercore artwork',
  brutalism: 'the "Brutalism" caption sits on a second Vaporwave tile',
  surrealism: 'no tile was drawn between Coquette and Scrapbook',
  'mid-century': 'no tile; the nearest candidate reads as Light Academia',
};

export const UNUSED = {
  '4x3': 'second Vaporwave',
  '5x4': 'second Steampunk',
  '7x1': 'second Wild West',
  '7x5': 'second Glassmorphism',
};

export const ORDER = [
  'neoclassical',
  'baroque',
  'aurora',
  'ethereal',
  'filigree',
  'acanthus',
  'anthropomorphic',
  'pixel-art',
  'conceptual-sketch',
  'luxury-typography',
  'japandi',
  'memphis',
  'bohemian',
  'shabby-chic',
  'cottagecore',
  'victorian',
  'art-deco',
  'art-nouveau',
  'mystical-western',
  'kitsch',
  'y2k',
  'bauhaus',
  'brutalism',
  'cybercore',
  'synthwave',
  'vaporwave',
  'pop-art',
  'bento-box',
  'graffiti',
  'tenebrism',
  'gothic',
  'pointillism',
  'mixed-media',
  'steampunk',
  'kawaii',
  'coquette',
  'surrealism',
  'utilitarian',
  'mid-century',
  'scrapbook',
  'frutiger-aero',
  'dark-academia',
  'light-academia',
  'wabi-sabi',
  'wild-west',
  'nautical',
  'rebus',
  'glassmorphism',
  'modular-typography',
  'neo-brutalism',
];

export function fileFor(id) {
  return `${String(ORDER.indexOf(id) + 1).padStart(2, '0')}-${id}.webp`;
}

async function crop(source, row, col, size) {
  const [x0, x1] = COLS[col - 1];
  const [y0, y1] = ROWS[row - 1];

  return (
    sharp(source)
      .extract({
        left: x0 + INSET,
        top: y0 + INSET,
        width: x1 - x0 - INSET * 2,
        height: y1 - y0 - INSET - BOTTOM_INSET,
      })
      // `north` rather than `centre` for the tall crop: nearly every tile is a
      // standing figure, and trimming a 5:4 tile to 4:5 from the middle takes
      // the top of the head off. The landscape plate is unaffected either way.
      .resize(size.width, size.height, {
        fit: 'cover',
        position: size.height > size.width ? 'north' : 'centre',
        kernel: 'lanczos3',
      })
      .webp({ quality: 88, effort: 6 })
      .toBuffer()
  );
}

async function main() {
  const check = process.argv.includes('--check');
  const source = await readFile(SOURCE);

  const { width, height } = await sharp(source).metadata();
  if (width !== 1024 || height !== 1024) {
    throw new Error(`collage is ${width}x${height}; the geometry expects 1024x1024`);
  }

  const unknown = Object.keys(TILES).filter((id) => !ORDER.includes(id));
  if (unknown.length) throw new Error(`unknown world id(s): ${unknown.join(', ')}`);

  const claimed = new Map();
  for (const [id, [row, col]] of Object.entries(TILES)) {
    const key = `${row}x${col}`;
    const owner = claimed.get(key);
    if (owner) throw new Error(`tile ${key} is claimed by both ${owner} and ${id}`);
    claimed.set(key, id);
  }

  const problems = [];
  let bytes = 0;

  for (const size of Object.values(SIZES)) {
    const dir = path.join(THEMES_DIR, size.dir);
    await mkdir(dir, { recursive: true });

    for (const [id, [row, col]] of Object.entries(TILES)) {
      const name = fileFor(id);
      const buffer = await crop(source, row, col, size);
      bytes += buffer.length;

      const target = path.join(dir, name);
      const current = await readFile(target).catch(() => null);
      if (current && current.equals(buffer)) continue;

      if (check) {
        problems.push(
          current
            ? `${size.dir}/${name} no longer matches the collage`
            : `${size.dir}/${name} is missing`,
        );
        continue;
      }
      await writeFile(target, buffer);
    }

    const expected = new Set(Object.keys(TILES).map(fileFor));
    for (const name of await readdir(dir)) {
      if (name.endsWith('.webp') && !expected.has(name)) {
        problems.push(`orphan asset: ${size.dir}/${name}`);
      }
    }
  }

  if (problems.length) {
    console.error(problems.map((line) => `  - ${line}`).join('\n'));
    console.error('\nRun `npm run portraits` to rebuild.');
    process.exitCode = 1;
    return;
  }

  const count = Object.keys(TILES).length;
  const shapes = Object.values(SIZES)
    .map((size) => `${size.dir} ${size.width}x${size.height}`)
    .join(', ');
  console.log(
    check
      ? `${count} worlds x ${Object.keys(SIZES).length} renditions match the collage.`
      : `${count} worlds written to public/themes (${shapes}) ` +
          `— ${(bytes / 1024).toFixed(1)} kB total.`,
  );
  console.log(`no tile for: ${Object.keys(MISSING).join(', ')}`);
  console.log(`duplicate tiles skipped: ${Object.keys(UNUSED).join(', ')}`);
}

await main();
