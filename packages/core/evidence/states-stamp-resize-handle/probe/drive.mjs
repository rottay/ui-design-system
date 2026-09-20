import { chromium } from '/Users/daniel/Developer/Rottay/ui-design-system/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs';
import { readFileSync, writeFileSync } from 'node:fs';

const ARM = process.argv[2];
const BUNDLE = ARM === 'before' ? 'before.js' : 'after.js';
writeFileSync('/tmp/rhprobe/index.html', readFileSync('/tmp/rhprobe/page.html', 'utf8').replace('BUNDLE', BUNDLE));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 700 }, hasTouch: false });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto('file:///tmp/rhprobe/index.html');
await page.waitForSelector("[data-part='gutter']");

const GUT = "[data-testid='p1']"; // placeholder
const gutters = page.locator("[data-part='gutter']");
const live = gutters.nth(0);          // free gutter
const locked = gutters.nth(1);        // locked gutter (resizable={false})

const read = async (loc) => loc.evaluate((n) => {
  const cs = getComputedStyle(n);
  // Colours come back as color(srgb ...) once color-mix is involved, so read
  // them through a canvas instead of parsing the serialization.
  const cv = document.createElement('canvas');
  cv.width = 1; cv.height = 1;
  const c = cv.getContext('2d');
  c.fillStyle = cs.backgroundColor;
  c.fillRect(0, 0, 1, 1);
  const [r, g, b] = c.getImageData(0, 0, 1, 1).data;
  const hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  return {
    state: n.getAttribute('data-state'),
    dragging: n.getAttribute('data-dragging'),
    resizable: n.getAttribute('data-resizable'),
    part: n.getAttribute('data-part'),
    bg: hex,
    ring: cs.outlineStyle === 'none' ? 'none' : cs.outlineWidth + ' ' + cs.outlineStyle,
    pseudoHover: n.matches(':hover'),
    pseudoActive: n.matches(':active'),
    pseudoFocusVisible: n.matches(':focus-visible'),
    focused: document.activeElement === n,
  };
});

const rows = [];
const step = async (name, loc = live) => {
  // Transitions are pinned off in the page, but a settle tick keeps the read
  // off a frame the style resolver has not finished.
  await page.waitForTimeout(60);
  rows.push({ step: name, ...(await read(loc)) });
};

const box = await live.boundingBox();
const cx = box.x + box.width / 2, cy = box.y + box.height / 2;

await page.mouse.move(5, 5);
await step('1 rest');

await page.mouse.move(cx, cy);
await step('2 hover (pointer over gutter)');

await page.mouse.down();
await step('3 press (pointer down, drag begins)');

// The gutter FOLLOWS the pointer along the drag axis, so the only way off it
// is out of the splitter's own block extent.
await page.mouse.move(cx + 120, box.y + box.height + 220);
await step('4 drag out of the splitter, pointer off the gutter');

await page.mouse.up();
await step('5 release with the pointer OFF the gutter  [LATCH CHECK]');

await page.mouse.move(5, 5);
await page.waitForTimeout(50);
await step('6 pointer parked far away');

// blur whatever holds focus, then walk the tab order in
await page.evaluate(() => { document.activeElement?.blur?.(); document.body.focus?.(); });
// Walk the tab order until the live gutter takes it, so the reading is never
// attributed to a stop that is not the gutter.
for (let i = 0; i < 8; i += 1) {
  await page.keyboard.press('Tab');
  if (await live.evaluate((n) => document.activeElement === n)) break;
}
await step('7 keyboard Tab onto the gutter');

await page.keyboard.press('ArrowRight');
await step('8 ArrowRight (keyboard resize) -- no synthesized press');

await page.keyboard.press('Tab');
await step('9 Tab away (blur)');

// pointer focus: the owner focuses the separator explicitly mid-gesture.
// The gutter MOVED during the drag above, so re-measure before clicking it.
const box2 = await live.boundingBox();
await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2);
await page.mouse.down();
await page.mouse.up();
await page.mouse.move(5, 5);
await page.waitForTimeout(50);
await step('10 after a mouse click, pointer parked  [ring must stay off]');

await page.evaluate(() => (document.activeElement)?.blur?.());
await page.mouse.move(5, 5);
await page.waitForTimeout(50);

// locked gutter
const lbox = await locked.boundingBox();
await step('11 locked gutter at rest', locked);
await page.mouse.move(lbox.x + lbox.width / 2, lbox.y + lbox.height / 2);
await step('12 locked gutter hovered  [skin must refuse]', locked);

await browser.close();
const out = { arm: ARM, pageerrors: errors, rows };
writeFileSync(`/tmp/rhprobe/${ARM}.json`, JSON.stringify(out, null, 2));
console.log(ARM.toUpperCase(), 'pageerrors:', errors.length);
for (const r of rows) console.log(
  String(r.step).padEnd(50),
  'data-state=' + String(r.state).padEnd(24),
  'bg=' + String(r.bg).padEnd(9),
  'ring=' + String(r.ring).padEnd(10),
  'drag=' + String(r.dragging).padEnd(6),
  ':hover=' + String(r.pseudoHover)[0],
  ':active=' + String(r.pseudoActive)[0],
  ':fv=' + String(r.pseudoFocusVisible)[0],
  'af=' + String(r.focused)[0]
);
