import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 980 },
  deviceScaleFactor: 1,
});

await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
await page.screenshot({ path: "public/screenshots/workspace.png", fullPage: false });

await page.getByRole("button", { name: "Preview sample report" }).click();
await page.getByRole("tab", { name: "Revision Plan" }).waitFor();
await page.waitForTimeout(350);
await page.screenshot({ path: "public/screenshots/sample-report.png", fullPage: false });

await browser.close();
