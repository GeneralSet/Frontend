#!/usr/bin/env node
/**
 * Renders a registered deckBuilder shape with Playwright and reports whether
 * it is actually legible on a card.
 *
 *   yarn render:shape "Fried Egg"
 *   node .claude/skills/deckbuilder-shape/scripts/render-shape.mjs "Fried Egg" --out ./somewhere
 *
 * It writes a contact-sheet PNG (true size / zoom / variant grid) and prints
 * PASS·WARN·FAIL for a handful of mechanical checks. The PNG is the point:
 * open it and confirm the shape is the thing that was asked for. The checks
 * only catch the failures a machine can see — blank output, content spilling
 * out of the viewBox, strokes too thin to survive the card's 0.29x downscale.
 *
 * Exit codes: 0 = no failures (warnings allowed), 1 = a check failed,
 * 2 = the shape could not be rendered at all.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "../../../..");
const MARKUP_SCRIPT = path.join(HERE, "card-markup.tsx");

/** Card sizes to eyeball, bracketing the app's real `max-height: 10vh` card. */
const TRUE_SIZES = [60, 90, 140];
/** The size the checks are stated against — a typical real card. */
const REFERENCE_CARD_PX = 90;
const ZOOM_PX = 240;
const VARIANT_PX = 90;

/** A stroke thinner than this many device px at REFERENCE_CARD_PX vanishes. */
const MIN_EFFECTIVE_STROKE_PX = 1;
/** Authored stroke width floor, in the shape's own user units (see iconography.md). */
const MIN_AUTHORED_STROKE = 4;
/** Below this share of lit pixels the card is effectively empty. */
const MIN_INK_COVERAGE = 0.01;
/** A shape spanning less than this much of its viewBox is drawn too small. */
const MIN_BBOX_FILL = 0.55;

const die = (code, ...lines) => {
  for (const line of lines) console.error(line);
  process.exit(code);
};

// ---------------------------------------------------------------- arguments

const args = process.argv.slice(2);
let shapeName;
let outDir;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--out") {
    outDir = args[++i];
  } else if (!shapeName) {
    shapeName = args[i];
  }
}
if (!shapeName) {
  die(2, 'Usage: render-shape.mjs "<Shape Name>" [--out DIR]');
}

// ------------------------------------------------------------- dependencies

if (!existsSync(path.join(REPO_ROOT, "node_modules"))) {
  die(2, "node_modules is missing — run `yarn install` from the repo root first.");
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch (error) {
  die(
    2,
    "Could not load playwright.",
    "Run `yarn install` (it is in devDependencies), or `yarn add --dev playwright` if it is missing.",
    String(error.message || error)
  );
}

// ------------------------------------------------------ render to SVG markup

const markup = spawnSync(
  process.execPath,
  ["-r", "ts-node/register", MARKUP_SCRIPT, shapeName],
  {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: {
      ...process.env,
      TS_NODE_TRANSPILE_ONLY: "1",
      // Overrides the repo tsconfig, which targets es5/esnext modules for the
      // browser build and cannot be require()d from node as-is.
      TS_NODE_COMPILER_OPTIONS: JSON.stringify({
        jsx: "react",
        module: "commonjs",
        target: "es2019",
        esModuleInterop: true,
        isolatedModules: false,
      }),
    },
  }
);

if (markup.error) {
  die(2, "Failed to spawn the markup renderer.", String(markup.error.message || markup.error));
}
if (markup.status !== 0) {
  die(2, markup.stderr ? markup.stderr.trimEnd() : `Markup renderer exited with ${markup.status}.`);
}

let data;
try {
  data = JSON.parse(markup.stdout);
} catch {
  die(
    2,
    "The markup renderer did not produce JSON. Raw output:",
    markup.stdout.slice(0, 2000),
    markup.stderr.slice(0, 2000)
  );
}

const [vbMinX, vbMinY, vbWidth, vbHeight] = data.viewBox.split(/\s+/).map(Number);
/** Shape user units -> device px on a REFERENCE_CARD_PX card. */
const cardScale = (data.symbolSize / vbWidth) * (REFERENCE_CARD_PX / data.cardViewport);

// ------------------------------------------------------------- contact sheet

const escapeHtml = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const cell = (label, svg, px) => `
  <figure class="cell" style="--px:${px}px">
    <div class="card">${svg}</div>
    <figcaption>${escapeHtml(label)}</figcaption>
  </figure>`;

const html = `
<style>
  :root { color-scheme: light; }
  body { margin: 0; padding: 24px; background: #f4f4f5; color: #18181b;
         font: 13px/1.4 ui-sans-serif, system-ui, sans-serif; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .08em;
       color: #52525b; margin: 28px 0 10px; }
  h2:first-of-type { margin-top: 0; }
  .row { display: flex; flex-wrap: wrap; gap: 18px; align-items: flex-end; }
  /* Uniform card size here, so top-align keeps the grid straight when a
     caption wraps to two lines. */
  #variants { align-items: flex-start; }
  .cell { margin: 0; }
  .cell .card { width: var(--px); height: var(--px); background: #fff;
                border: 1px solid #d4d4d8; border-radius: 4px; display: flex;
                align-items: center; justify-content: center; }
  /* Direct child only: CardSvg nests one sized <svg> per symbol, and a
     descendant selector would stretch each of those to the full card. */
  .cell .card > svg { width: 100%; height: 100%; }
  figcaption { margin-top: 6px; font-size: 11px; color: #52525b; text-align: center;
               max-width: var(--px); }
  #zoom-wrap { position: relative; width: ${ZOOM_PX}px; height: ${ZOOM_PX}px;
               background: #fff; border: 1px solid #d4d4d8;
               background-image:
                 linear-gradient(to right, #eee 1px, transparent 1px),
                 linear-gradient(to bottom, #eee 1px, transparent 1px);
               background-size: ${ZOOM_PX / 12}px ${ZOOM_PX / 12}px; }
  #zoom-wrap > svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  #zoom-wrap .frame { position: absolute; inset: 0; border: 2px dashed #ef4444;
                      pointer-events: none; }
  .legend { color: #52525b; font-size: 11px; margin-top: 8px; max-width: 480px; }
</style>

<h2>True size — the card as the app draws it</h2>
<div class="row" id="truesize">
  ${TRUE_SIZES.map((px) => cell(`${px}px card`, data.variants[0].svg, px)).join("")}
  ${TRUE_SIZES.map((px) =>
    cell(`${px}px · 3 symbols`, (data.variants.find((v) => /3 symbols/.test(v.label)) || data.variants[0]).svg, px)
  ).join("")}
</div>

<h2>Zoom — one symbol in its own viewBox (${escapeHtml(data.viewBox)})</h2>
<div id="zoom-wrap">
  ${data.bare}
  <div class="frame"></div>
</div>
<p class="legend">The dashed red frame is the declared viewBox. Anything touching or
crossing it is clipped on a card. Leave ~5% inset so strokes are not cut.</p>

<h2>Variants — every option this shape declares support for</h2>
<div class="row" id="variants">
  ${data.variants.map((variant) => cell(variant.label, variant.svg, VARIANT_PX)).join("")}
</div>
`;

// -------------------------------------------------------------- render + check

const outputDir = outDir
  ? path.resolve(outDir)
  : mkdtempSync(path.join(tmpdir(), "deckbuilder-render-"));
mkdirSync(outputDir, { recursive: true });
const slug = data.shape.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Chromium builds already on the machine, newest first. Playwright only looks
 * for the exact revision it ships with, so an environment that pre-installs
 * browsers (CI images, sandboxes) can have a perfectly good Chromium that
 * `chromium.launch()` refuses to use. Fall back to it rather than telling the
 * user to download another copy.
 */
const findInstalledChromium = () => {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!root || !existsSync(root)) return null;
  const direct = path.join(root, "chromium");
  if (existsSync(direct) && statSync(direct).isFile()) return direct;
  const candidates = readdirSync(root)
    .filter((entry) => /^chromium(_headless_shell)?-\d+$/.test(entry))
    .sort((a, b) => Number(b.match(/\d+$/)[0]) - Number(a.match(/\d+$/)[0]))
    .flatMap((entry) => [
      path.join(root, entry, "chrome-linux", "chrome"),
      path.join(root, entry, "chrome-headless-shell-linux64", "chrome-headless-shell"),
      path.join(root, entry, "chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium"),
    ]);
  return candidates.find((candidate) => existsSync(candidate)) || null;
};

const pageErrors = [];
let browser;
try {
  browser = await chromium.launch();
} catch (error) {
  const fallback = findInstalledChromium();
  if (!fallback) {
    die(
      2,
      "Chromium failed to launch and no pre-installed browser was found.",
      "Check PLAYWRIGHT_BROWSERS_PATH points at an existing browser install.",
      String(error.message || error)
    );
  }
  try {
    browser = await chromium.launch({ executablePath: fallback });
    console.error(`note: using pre-installed Chromium at ${fallback}`);
  } catch (fallbackError) {
    die(
      2,
      "Chromium failed to launch.",
      `Also tried the pre-installed browser at ${fallback}.`,
      String(fallbackError.message || fallbackError)
    );
  }
}

const page = await browser.newPage({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 2 });
page.on("pageerror", (error) => pageErrors.push(`pageerror: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") pageErrors.push(`console: ${message.text()}`);
});

await page.setContent(html, { waitUntil: "load" });

const probe = await page.evaluate(
  async ({ cardSvg, referencePx }) => {
    const result = { parseErrors: 0, bbox: null, strokes: [], groups: 0, coverage: null };

    result.parseErrors = document.querySelectorAll("parsererror").length;

    const symbol = document.querySelector("#bare-symbol");
    if (symbol) {
      const box = symbol.getBBox();
      result.bbox = { x: box.x, y: box.y, width: box.width, height: box.height };
      result.groups = symbol.querySelectorAll("g").length;
      for (const el of symbol.querySelectorAll("*")) {
        const style = getComputedStyle(el);
        if (style.stroke === "none" || style.stroke === "" || Number(parseFloat(style.strokeWidth)) === 0) {
          continue;
        }
        result.strokes.push({
          tag: el.tagName,
          stroke: style.stroke,
          width: parseFloat(style.strokeWidth),
          linecap: style.strokeLinecap,
          linejoin: style.strokeLinejoin,
        });
      }
    }

    // Ink coverage: rasterize one card and count non-transparent pixels. A
    // shape that renders to nothing still produces valid, passing markup.
    try {
      const sized = cardSvg
        .replace(/width="[^"]*"/, `width="${referencePx}"`)
        .replace(/height="[^"]*"/, `height="${referencePx}"`);
      const image = new Image();
      image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(sized);
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = referencePx;
      canvas.height = referencePx;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, referencePx, referencePx);
      const { data: pixels } = ctx.getImageData(0, 0, referencePx, referencePx);
      let lit = 0;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] > 8) lit++;
      }
      result.coverage = lit / (referencePx * referencePx);
    } catch (error) {
      result.coverage = null;
      result.coverageError = String(error && error.message ? error.message : error);
    }

    return result;
  },
  { cardSvg: data.variants[0].svg, referencePx: REFERENCE_CARD_PX }
);

const sheetPath = path.join(outputDir, `${slug}.png`);
const trueSizePath = path.join(outputDir, `${slug}-truesize.png`);
await page.screenshot({ path: sheetPath, fullPage: true });
const trueSizeRow = await page.$("#truesize");
if (trueSizeRow) await trueSizeRow.screenshot({ path: trueSizePath });
await browser.close();

// ------------------------------------------------------------------- report

const checks = [];
const add = (level, name, detail) => checks.push({ level, name, detail });

if (pageErrors.length || probe.parseErrors) {
  add(
    "FAIL",
    "renders without errors",
    [...pageErrors, probe.parseErrors ? `${probe.parseErrors} SVG parse error(s)` : ""]
      .filter(Boolean)
      .join("; ")
  );
} else {
  add("PASS", "renders without errors", "no page, console, or SVG parse errors");
}

if (probe.coverage === null) {
  add("SKIP", "not blank", `could not rasterize the card (${probe.coverageError || "unknown"})`);
} else if (probe.coverage < MIN_INK_COVERAGE) {
  add(
    "FAIL",
    "not blank",
    `only ${(probe.coverage * 100).toFixed(2)}% of the ${REFERENCE_CARD_PX}px card has ink ` +
      `(need ${MIN_INK_COVERAGE * 100}%) — check fills, stroke colors, and coordinates`
  );
} else {
  add("PASS", "not blank", `${(probe.coverage * 100).toFixed(1)}% of the card has ink`);
}

const maxStroke = probe.strokes.reduce((max, s) => Math.max(max, s.width), 0);
if (!probe.bbox) {
  add("FAIL", "fits the viewBox", "could not measure the symbol — it rendered no geometry");
} else {
  /**
   * `getBBox()` is the geometry alone; strokes straddle it. Geometry poking
   * out of the viewBox is real clipping and fails. A stroke halo poking out
   * only shaves the outline, so that warns and points at the inset rule.
   */
  const overflowOf = (pad) =>
    [
      probe.bbox.x - pad < vbMinX ? `left by ${(vbMinX - probe.bbox.x + pad).toFixed(1)}` : "",
      probe.bbox.y - pad < vbMinY ? `top by ${(vbMinY - probe.bbox.y + pad).toFixed(1)}` : "",
      probe.bbox.x + probe.bbox.width + pad > vbMinX + vbWidth
        ? `right by ${(probe.bbox.x + probe.bbox.width + pad - vbMinX - vbWidth).toFixed(1)}`
        : "",
      probe.bbox.y + probe.bbox.height + pad > vbMinY + vbHeight
        ? `bottom by ${(probe.bbox.y + probe.bbox.height + pad - vbMinY - vbHeight).toFixed(1)}`
        : "",
    ].filter(Boolean);

  const geometryOverflow = overflowOf(0);
  const strokeOverflow = overflowOf(maxStroke / 2);

  if (geometryOverflow.length) {
    add("FAIL", "fits the viewBox", `content is clipped: overflows ${geometryOverflow.join(", ")} user units`);
  } else if (strokeOverflow.length) {
    add(
      "WARN",
      "fits the viewBox",
      `geometry fits but the stroke is shaved: overflows ${strokeOverflow.join(", ")} user units — ` +
        `inset the shape by at least half the stroke width (~${(vbWidth * 0.05).toFixed(0)} units)`
    );
  } else {
    add(
      "PASS",
      "fits the viewBox",
      `bbox ${probe.bbox.width.toFixed(0)}x${probe.bbox.height.toFixed(0)} sits inside ${vbWidth}x${vbHeight} with room for the stroke`
    );
  }

  const fillX = probe.bbox.width / vbWidth;
  const fillY = probe.bbox.height / vbHeight;
  if (Math.max(fillX, fillY) < MIN_BBOX_FILL) {
    add(
      "WARN",
      "fills the viewBox",
      `spans only ${(fillX * 100).toFixed(0)}% x ${(fillY * 100).toFixed(0)}% of the viewBox — ` +
        `scale the geometry up, it shrinks another ${(data.symbolSize / vbWidth).toFixed(2)}x on a card`
    );
  } else {
    add("PASS", "fills the viewBox", `spans ${(fillX * 100).toFixed(0)}% x ${(fillY * 100).toFixed(0)}% of the viewBox`);
  }
}

if (!probe.strokes.length) {
  add("WARN", "stroke survives card scale", "the shape has no strokes — outlines are what keep it readable at 26px");
} else {
  const effective = maxStroke * cardScale;
  if (maxStroke < MIN_AUTHORED_STROKE || effective < MIN_EFFECTIVE_STROKE_PX) {
    add(
      "WARN",
      "stroke survives card scale",
      `widest stroke is ${maxStroke} user units = ${effective.toFixed(2)}px on a ${REFERENCE_CARD_PX}px card ` +
        `(want >= ${MIN_AUTHORED_STROKE} units / ${MIN_EFFECTIVE_STROKE_PX}px — see references/iconography.md)`
    );
  } else {
    add(
      "PASS",
      "stroke survives card scale",
      `widest stroke is ${maxStroke} user units = ${effective.toFixed(2)}px on a ${REFERENCE_CARD_PX}px card`
    );
  }
}

// Non-blocking observations that mirror the authoring rules.
const notes = [];
if (probe.strokes.length) {
  const widths = new Set(probe.strokes.map((s) => s.width));
  const colors = new Set(probe.strokes.map((s) => s.stroke));
  if (widths.size > 1) notes.push(`mixed stroke widths: ${[...widths].join(", ")} (rules ask for one uniform width)`);
  if (colors.size > 1) notes.push(`mixed stroke colors: ${[...colors].join(", ")} (rules ask for a single outline color)`);
  const rounded = probe.strokes.every((s) => s.linecap === "round" && s.linejoin === "round");
  if (!rounded) notes.push('strokes are not all stroke-linecap="round" stroke-linejoin="round"');
}
if (!probe.groups) {
  notes.push("no <g> groups — rules ask for layered base fill / outline / highlight groups");
}

const failures = checks.filter((c) => c.level === "FAIL").length;
const warnings = checks.filter((c) => c.level === "WARN").length;

const icon = { PASS: "✓", WARN: "!", FAIL: "✗", SKIP: "-" };
console.log(`\n${data.shape} — ${data.variants.length} variants, viewBox "${data.viewBox}"`);
console.log(`supports: ${JSON.stringify(data.supports)}\n`);
for (const check of checks) {
  console.log(`  ${icon[check.level]} ${check.level.padEnd(4)} ${check.name} — ${check.detail}`);
}
if (notes.length) {
  console.log("\n  notes (not gating):");
  for (const note of notes) console.log(`    · ${note}`);
}
console.log(`\n  contact sheet: ${sheetPath}`);
console.log(`  true size:     ${trueSizePath}`);
console.log(
  `\n${failures} failed, ${warnings} warned. Open the contact sheet and confirm the shape ` +
    `is what was asked for — the checks above cannot do that for you.\n`
);

process.exit(failures ? 1 : 0);
