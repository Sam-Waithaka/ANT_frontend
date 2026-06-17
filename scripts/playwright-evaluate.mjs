import { chromium } from 'playwright';

const [, , url, expression, ...rest] = process.argv;

if (!url || !expression) {
  console.error('Usage: pnpm pw:evaluate <url> <expression> [--viewport=width,height]');
  process.exit(1);
}

const viewportArg = rest.find((arg) => arg.startsWith('--viewport='));
const viewportValue = viewportArg?.slice('--viewport='.length);
const [width, height] = viewportValue
  ? viewportValue.split(/[,\s]+/).map((value) => Number(value.trim()))
  : [1440, 1100];

if (!Number.isFinite(width) || !Number.isFinite(height)) {
  console.error('Invalid viewport. Use --viewport=width,height, for example --viewport=390,844');
  process.exit(1);
}

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width, height } });

try {
  await page.goto(url, { waitUntil: 'networkidle' });
  const result = await page.evaluate((source) => {
    const value = globalThis.eval(`(${source})`);
    return typeof value === 'function' ? value() : value;
  }, expression);
  console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
