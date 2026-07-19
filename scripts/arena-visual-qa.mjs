#!/usr/bin/env node
/**
 * Captures Arena visual QA screenshots at key event phases.
 * Usage: node scripts/arena-visual-qa.mjs [baseUrl]
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://localhost:3005";
const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outputDir = path.join(rootDir, "docs/design/qa");

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

  const adminUrl = page.url();

  // 1. Waiting for players
  await capture(page, "01-waiting-for-players", { width: 1440, height: 1200 });
  await capture(page, "01-waiting-for-players", { width: 1024, height: 1200 });
  await capture(page, "01-waiting-for-players", { width: 390, height: 844 });

  // 2. Players joining
  await page.fill('[data-testid="import-players-textarea"]', players.join("\n"));
  await page.click('form:has([data-testid="import-players-textarea"]) button[type="submit"]');
  await page.waitForURL(/imported=/, { timeout: 20000 });
  await page.waitForTimeout(800);

  await capture(page, "02-players-joining", { width: 1440, height: 1400 });
  await capture(page, "02-players-joining", { width: 390, height: 844 });

  // 3. Ready to generate teams
  await capture(page, "03-ready-to-generate-teams", { width: 1440, height: 1400 });
  await capture(page, "03-ready-to-generate-teams", { width: 1024, height: 1400 });

  // 4. Teams generated
  await page.fill('[data-testid="balanced-random-team-count"]', "4");
  await page.click('[data-testid="balanced-random-submit"]');
  await page.waitForURL(/balancedTeams=/, { timeout: 20000 });
  await page.waitForTimeout(800);

  await capture(page, "04-teams-generated", { width: 1440, height: 1800 });
  await capture(page, "04-teams-generated", { width: 390, height: 844 });

  // 5. Print view
  await page.emulateMedia({ media: "print" });
  await capture(page, "05-print-view", { width: 850, height: 1100 });
  await page.emulateMedia({ media: "screen" });

  await browser.close();
  console.log(`\nAdmin URL: ${adminUrl}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
