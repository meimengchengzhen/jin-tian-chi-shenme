// Playwright screenshot generator for README.
// Visits the running production server (NODE_ENV=production node dist/index.cjs on :5000)
// and captures each main tab + a mobile viewport.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.SCREENSHOT_BASE || "http://localhost:5000";
const OUT = path.resolve("docs/screenshots");

const desktop = { width: 1280, height: 900 };
const mobile = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

const targets = [
  { hash: "#/home", file: "home.png", label: "今日推荐" },
  { hash: "#/weekly", file: "weekly.png", label: "一周菜单" },
  { hash: "#/lazy", file: "lazy.png", label: "懒人决定" },
  { hash: "#/takeout", file: "takeout.png", label: "外卖" },
  { hash: "#/snacks", file: "snacks.png", label: "零食" },
  { hash: "#/fruit", file: "fruit.png", label: "水果" },
  { hash: "#/health", file: "health.png", label: "健康饮食" },
  { hash: "#/search", file: "search.png", label: "菜谱搜索" },
  { hash: "#/companion", file: "companion.png", label: "饭桌陪伴" },
  { hash: "#/hotboard", file: "hotboard.png", label: "饭桌热榜" },
];

async function setup(page) {
  // Skip onboarding (modal blocks layout) by pre-seeding localStorage flags.
  await page.addInitScript(() => {
    try {
      localStorage.setItem("chishenme.onboarded.v1", "1");
    } catch {}
  });
}

async function captureDesktop(browser, target) {
  const ctx = await browser.newContext({ viewport: desktop, locale: "zh-CN" });
  const page = await ctx.newPage();
  await setup(page);
  await page.goto(`${BASE}/${target.hash}`, { waitUntil: "networkidle", timeout: 60_000 });
  // Give framer-motion / lazy chunks a moment.
  await page.waitForTimeout(1500);
  // Make sure we're at the top.
  await page.evaluate(() => window.scrollTo(0, 0));
  const file = path.join(OUT, target.file);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`✓ desktop ${target.label} -> ${file}`);
  await ctx.close();
}

async function captureMobile(browser, target, file) {
  const ctx = await browser.newContext({ viewport: mobile, locale: "zh-CN", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1" });
  const page = await ctx.newPage();
  await setup(page);
  await page.goto(`${BASE}/${target.hash}`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  const out = path.join(OUT, file);
  await page.screenshot({ path: out, fullPage: false });
  console.log(`✓ mobile ${target.label} -> ${out}`);
  await ctx.close();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const t of targets) {
    await captureDesktop(browser, t);
  }
  // Two extra mobile shots (home + lazy) so README has phone view.
  await captureMobile(browser, targets[0], "mobile-home.png");
  await captureMobile(browser, targets[2], "mobile-lazy.png");
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
