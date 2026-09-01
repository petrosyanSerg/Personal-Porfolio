/**
 * PostToolUse hook — formats whatever Claude just wrote.
 *
 * `format:check` and `lint:styles` are both hard gates in
 * .github/workflows/ci.yml, so an unformatted edit is a guaranteed red build.
 * This closes that loop at the moment of the edit instead of minutes later.
 *
 * Uses the Prettier and Stylelint Node APIs rather than shelling out to npx:
 * no per-edit process spawn, and no .cmd/shell quoting differences between
 * Windows and CI.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

let payload;
try {
  payload = JSON.parse(readStdin() || '{}');
} catch {
  process.exit(0);
}

const root = path.resolve(payload.cwd ?? process.cwd());
const target = payload.tool_input?.file_path ?? payload.tool_input?.notebook_path;
if (!target) process.exit(0);

const file = path.resolve(root, target);
// Never reformat anything outside the project.
if (!file.startsWith(root + path.sep)) process.exit(0);

const rel = path.relative(root, file);
const isScss = file.endsWith('.scss');
const notes = [];
let unfixable = false;

async function stylelint() {
  return (await import('stylelint')).default;
}

// Stylelint fixes first, so Prettier gets the last word on formatting.
// Reversed, the two CI gates disagree and `format:check` fails on
// stylelint's output.
if (isScss) {
  try {
    await (await stylelint()).lint({ files: [file], fix: true });
  } catch (error) {
    notes.push(`stylelint errored on ${rel}: ${error.message}`);
  }
}

// getFileInfo honours .prettierignore (which excludes docs/) and returns a
// null parser for anything Prettier does not handle, so unsupported files
// fall through untouched.
try {
  const prettier = await import('prettier');
  const info = await prettier.getFileInfo(file, {
    ignorePath: path.join(root, '.prettierignore'),
  });
  if (!info.ignored && info.inferredParser) {
    const source = readFileSync(file, 'utf8');
    const options = await prettier.resolveConfig(file);
    const formatted = await prettier.format(source, { ...options, filepath: file });
    if (formatted !== source) writeFileSync(file, formatted);
  }
} catch (error) {
  // A parse failure means the file is syntactically broken. `npm run
  // typecheck` will say so with far better detail than this hook can.
  notes.push(`prettier skipped ${rel}: ${error.message}`);
}

// What survives BOTH passes is what `npm run lint:styles` will actually see.
// Checking before Prettier reflows the file reports errors it then fixes.
if (isScss) {
  try {
    const { results } = await (await stylelint()).lint({ files: [file], fix: false });
    const errors = (results[0]?.warnings ?? []).filter((w) => w.severity === 'error');
    if (errors.length) {
      unfixable = true;
      notes.push(
        `stylelint could not auto-fix ${rel} — these will fail \`npm run lint:styles\`:`,
        ...errors.slice(0, 10).map((w) => `  ${w.line}:${w.column}  ${w.text}`),
      );
    }
  } catch {
    // Already reported by the fix pass above.
  }
}

if (notes.length) process.stderr.write(`${notes.join('\n')}\n`);

// Exit 2 feeds stderr back to Claude. Reserved for stylelint errors no
// autofix can clear — a real CI failure that wants a real edit.
process.exit(unfixable ? 2 : 0);
