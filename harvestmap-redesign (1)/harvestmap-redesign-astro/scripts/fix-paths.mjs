// Rewrite Astro's absolute /_astro/ asset URLs to relative ones so the
// built site works when served from any path (preview, subdirectory, file).
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = new URL("../dist", import.meta.url).pathname;
const EXT = new Set([".html", ".js", ".css", ".mjs"]);

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (EXT.has(p.slice(p.lastIndexOf(".")))) yield p;
  }
}

let touched = 0;
for (const file of walk(DIST)) {
  const before = readFileSync(file, "utf8");
  const after = before
    .replaceAll('"/_astro/', '"./_astro/')
    .replaceAll("'/_astro/", "'./_astro/")
    .replaceAll("(/_astro/", "(./_astro/")
    .replaceAll("url(/_astro/", "url(./_astro/");
  if (after !== before) {
    writeFileSync(file, after);
    touched++;
  }
}
console.log(`fix-paths: rewrote ${touched} file(s)`);
