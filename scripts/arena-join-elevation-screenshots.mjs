#!/usr/bin/env node
/**
 * Captures join-elevation layout screenshots.
 * Usage: node scripts/arena-join-elevation-screenshots.mjs [baseUrl]
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://localhost:3005";
const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outputDir = path.join(rootDir, "docs/design/qa");

const viewports = [
  { width: 1440, height: 1200 },
  { width: 1280, height: 1200 },
  { width: 1024, height: 1200 },
  { width: 390, height: 844 }
];

const players = ["Avery", "Blake", "Casey", "Dana", "Emerson", "Finley", "Gray", "Harper"];

async function capture(page, name, viewport) {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(600);
  const file = path.join(outputDir, `${name}-${viewport.width}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`saved ${file}`);
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${baseUrl}/room/new`, { waitUntil: "networkidle" });
  await page.fill('input[name="name"]', "Friday PE Block");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/room\/[^/]+\/admin/, { timeout: 20000 });

  for (const viewport of viewports) {
    await capture(page, "join-elevated-waiting-for-players", viewport);
  }

  await page.fill('[data-testid="import-players-textarea"]', players.join("\n"));
  await page.click('form:has([data-testid="import-players-textarea"]) button[type="submit"]');
  await page.waitForURL(/imported=/, { timeout: 20000 });
  await page.waitForTimeout(800);

  for (const viewport of viewports) {
    await capture(page, "join-elevated-players-joining", viewport);
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
