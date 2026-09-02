/**
 * index.mjs — the expensive leg. Real Chromium, only for what leg 1
 * cannot see by construction: cascade order, @layer, specificity, the
 * unlayered tenant-artifact mask, and portals.
 *
 * jsdom is NOT used and must not be. jsdom does not resolve var(); any custom
 * property assertion written against it is a false green by construction. The
 * package does carry jsdom and happy-dom for component tests — neither can
 * answer the question this probe asks.
 *
 * WHAT WE REUSE. There is no pre-existing Chromium harness under
 * packages/core/scripts or tooling/ to inherit: a search for
 * playwright/puppeteer/chromium there returns only two files that mention the
 * words in prose (`scripts/cra-15-runtime-hardening-gate.mjs` and its test) and
 * `@rottay/design-system` declares no browser-driver dependency. What DOES
 * already exist on this machine is the Chromium binary that Playwright
 * installed for the sibling apps (`~/Library/Caches/ms-playwright/
 * chromium_headless_shell-NNNN dirs). We drive THAT binary directly and reuse
 * nothing else: no driver package is added to this workspace.
 *
 * HOW WE DRIVE IT WITHOUT A DRIVER. `chrome-headless-shell --dump-dom` runs the
 * page's scripts and prints the serialised DOM. The fixture therefore does its
 * own measuring in-page and parks the result in a `data-probe-result`
 * attribute, which we read back out of the dumped DOM. One process, one
 * navigation, no port, no WebSocket, no dependency.
 *
 * WHAT IS READ. The RENDERED LONGHAND in px (`padding-left`, `font-size`,
 * `column-gap`, ...) — never the custom property. Chromium's computed value of
 * a custom property is the substituted token stream, `calc(1rem * 1)`, not a
 * number; asserting on it measures nothing.
 *
 * CYCLE DETECTION. A custom property caught in a cycle is invalid at
 * computed-value time, which is NOT the same as falling back. Verified in
 * Chromium 1228 on 2026-08-18 with `--a: var(--b); --b: var(--a)`:
 * getPropertyValue('--a') === '' while the declaration is present, and
 * `var(--a, 7px)` DOES take the fallback. So the detector is
 * "declared AND computes to empty string", never "the fallback showed up".
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PW_CACHE = join(
  process.env.HOME || "",
  "Library/Caches/ms-playwright",
);

/**
 * Locate a chrome-headless-shell (or full chromium) binary. Returns null when
 * none is installed — callers must then report leg 2 as NOT RUN, never as
 * passed.
 */
export function findChromium(explicit = process.env.CASCADE_PROBE_CHROMIUM) {
  if (explicit && existsSync(explicit)) return explicit;
  const candidates = [];
  if (existsSync(PW_CACHE)) {
    for (const dir of readdirSync(PW_CACHE)) {
      candidates.push(
        join(PW_CACHE, dir, "chrome-headless-shell-mac-arm64/chrome-headless-shell"),
        join(PW_CACHE, dir, "chrome-headless-shell-linux/chrome-headless-shell"),
        join(PW_CACHE, dir, "chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium"),
        join(PW_CACHE, dir, "chrome-linux/chrome"),
      );
    }
  }
  candidates.push(
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/chromium",
    "/usr/bin/google-chrome",
  );
  // newest first: playwright directories are monotonically numbered
  candidates.sort().reverse();
  return candidates.find((c) => existsSync(c)) || null;
}

/**
 * Split a complex selector into its compound parts plus the combinator that
 * joins each to the previous one. Whitespace inside brackets/parens is not a
 * combinator, so the split is bracket-aware.
 */
export function splitCombinators(sel) {
  const parts = [];
  let cur = "";
  let depth = 0;
  let q = null;
  let pending = null;
  const push = () => {
    if (cur.trim()) parts.push({ combinator: pending, compound: cur.trim() });
    cur = "";
  };
  for (let i = 0; i < sel.length; i += 1) {
    const c = sel[i];
    if (q) {
      cur += c;
      if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    if (c === "(" || c === "[") depth += 1;
    if (c === ")" || c === "]") depth -= 1;
    if (depth === 0 && (c === ">" || c === "+" || c === "~")) {
      push();
      pending = c;
      continue;
    }
    if (depth === 0 && /\s/.test(c)) {
      if (cur.trim()) {
        push();
        pending = " ";
      }
      continue;
    }
    cur += c;
  }
  push();
  return parts;
}

/**
 * Turn ONE COMPOUND selector (no combinators) into an element description.
 * Supported: tag, .class, [attr], [attr='v'], :not([attr]) and :where()/:is()
 * wrappers. Pseudo-classes that depend on user interaction or document
 * structure are NOT faked; they come back unsupported and the caller must
 * report them as NOT COVERED rather than quietly dropping them — a site that
 * was never measured must never be counted as measured fine.
 */
export function synthesiseCompound(compound) {
  let s = compound;
  const attrs = {};
  const classes = [];
  let tag = "div";
  const forbid = [];

  s = s.replace(/:not\(([^()]*)\)/g, (_, inner) => {
    forbid.push(inner.trim());
    return "";
  });
  s = s.replace(/:(?:is|where)\(([^()]*)\)/g, (_, inner) => inner.split(",")[0].trim());

  const tokenRe = /(\[[^\]]+\]|\.[A-Za-z0-9_-]+|::?[A-Za-z-]+(?:\([^)]*\))?|^[A-Za-z*][A-Za-z0-9-]*)/g;
  let m;
  let consumed = 0;
  while ((m = tokenRe.exec(s)) !== null) {
    const t = m[0];
    consumed += t.length;
    if (t.startsWith("[")) {
      const body = t.slice(1, -1);
      const eq = body.indexOf("=");
      if (eq < 0) attrs[body.trim()] = "";
      else {
        const name = body.slice(0, eq).replace(/[~^|$*]$/, "").trim();
        const val = body
          .slice(eq + 1)
          .trim()
          .replace(/\s+i$/i, "")
          .replace(/^["']|["']$/g, "");
        attrs[name] = val;
      }
    } else if (t.startsWith(".")) classes.push(t.slice(1));
    else if (t.startsWith(":")) {
      const pseudo = t.replace(/\(.*/, "");
      // :root is the document element, not a paint site we can clone.
      // The interaction pseudo-classes would need CDP input synthesis; they
      // are out of scope and are reported, not simulated.
      return { supported: false, reason: `pseudo-class ${t} cannot be synthesised statically` };
    } else if (t !== "*") tag = t;
  }
  if (consumed < s.replace(/\s/g, "").length)
    return { supported: false, reason: `unparsed remainder in '${compound}'` };
  for (const f of forbid) {
    const fm = /^\[([^\]=]+)/.exec(f);
    if (fm && attrs[fm[1].trim()] !== undefined)
      return { supported: false, reason: `:not(${f}) contradicts the compound` };
    const fc = /^\.([A-Za-z0-9_-]+)/.exec(f);
    if (fc && classes.includes(fc[1]))
      return { supported: false, reason: `:not(${f}) contradicts the compound` };
  }
  return { supported: true, tag, classes, attrs };
}

/**
 * Turn a full selector into a nestable element chain. The LAST element is the
 * one that receives the declaration; the earlier ones are the ancestors or
 * preceding siblings required for the selector to match.
 *
 * Only the first branch of a selector list is synthesised: the branches are
 * alternatives and one matching element is enough to observe the declaration.
 */
export function synthesiseElement(selector) {
  if (!selector) return { supported: false, reason: "no selector" };
  const first = selector.split(",")[0].trim();
  if (/:root|:host/.test(first))
    return { supported: false, reason: ":root/:host is the document element, not a paint site" };
  const parts = splitCombinators(first);
  if (!parts.length) return { supported: false, reason: `empty selector '${first}'` };
  const chain = [];
  const roots = [];
  for (const part of parts) {
    const el = synthesiseCompound(part.compound);
    if (!el.supported) return { supported: false, reason: el.reason };
    // `html`/`body` are singletons: they cannot be cloned into the body as
    // ordinary elements (the parser would drop them and the selector would
    // silently stop matching, turning a real measurement into a fake one).
    // They become REQUIREMENTS stamped on the actual document/body element.
    if ((el.tag === "html" || el.tag === "body") && chain.length === 0) {
      roots.push({ target: el.tag, classes: el.classes, attrs: el.attrs });
      continue;
    }
    if (el.tag === "html" || el.tag === "body")
      return { supported: false, reason: `${el.tag} appears as a descendant, which cannot exist` };
    chain.push({ ...el, combinator: part.combinator });
  }
  if (!chain.length) return { supported: false, reason: `'${first}' targets only html/body` };
  return { supported: true, chain, roots, selector: first, ...chain[chain.length - 1] };
}

/**
 * Render one probe's element chain. `>` and descendant become nesting; `+`
 * and `~` become preceding siblings inside the same parent. The final element
 * always carries data-probe-id, so it is the one measured.
 */
function renderChain(p) {
  const chain = p.element.chain || [p.element];
  const open = (el, extra = "") => {
    const cls = el.classes.length ? ` class="${esc(el.classes.join(" "))}"` : "";
    const at = Object.entries(el.attrs)
      .map(([k, v]) => ` ${esc(k)}="${esc(v)}"`)
      .join("");
    return `<${el.tag}${cls}${at}${extra}>`;
  };
  let html = "";
  let closers = [];
  for (let i = 0; i < chain.length; i += 1) {
    const el = chain[i];
    const last = i === chain.length - 1;
    const extra = last ? ` data-probe-id="${esc(p.id)}"` : "";
    if (el.combinator === "+" || el.combinator === "~") {
      // sibling: close nothing, just emit next to the previous element
      html += `${open(el, extra)}${last ? "Probe" : ""}</${el.tag}>`;
      continue;
    }
    html += open(el, extra);
    closers.push(el.tag);
    if (last) html += "Probe";
  }
  while (closers.length) html += `</${closers.pop()}>`;
  return html;
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * @param {object} spec
 * @param {string} spec.css              full stylesheet text (already inlined)
 * @param {string|null} spec.tenant      value for html[data-tenant]
 * @param {Array} spec.probes            [{ id, element, longhands, channels }]
 * @param {Array} spec.perturbations     [{ id, decls: { '--x': '1.25' } }]
 * @param {boolean} [spec.portal]        also measure a portal-detached clone
 */
export function buildFixture(spec) {
  const bodies = spec.probes.map((p) => renderChain(p)).join("\n");

  const payload = {
    probes: spec.probes.map((p) => ({
      id: p.id,
      longhands: p.longhands,
      channels: p.channels || [],
    })),
    perturbations: spec.perturbations,
    portal: Boolean(spec.portal),
  };

  // Merge every probe's html/body requirement onto the real singletons.
  const rootAttrs = { "data-ds-root": "", "data-engine": "modern" };
  const bodyAttrs = {};
  const rootClasses = new Set();
  const bodyClasses = new Set();
  if (spec.tenant) rootAttrs["data-tenant"] = spec.tenant;
  for (const p of spec.probes) {
    for (const r of p.element.roots || []) {
      const bag = r.target === "html" ? rootAttrs : bodyAttrs;
      const set = r.target === "html" ? rootClasses : bodyClasses;
      for (const [k, v] of Object.entries(r.attrs)) if (!(k in bag) || bag[k] === "") bag[k] = v;
      for (const c of r.classes) set.add(c);
    }
  }
  const attrStr = (bag, set) =>
    (set.size ? ` class="${esc([...set].join(" "))}"` : "") +
    Object.entries(bag)
      .map(([k, v]) => (v === "" ? ` ${esc(k)}` : ` ${esc(k)}="${esc(v)}"`))
      .join("");

  return `<!doctype html>
<html${attrStr(rootAttrs, rootClasses)}>
<head><meta charset="utf-8"><link rel="stylesheet" href="./sheet.css"></head>
<body${attrStr(bodyAttrs, bodyClasses)}>
<div id="probe-host">
${bodies}
</div>
<script>
(function(){
  var SPEC = ${JSON.stringify(payload)};
  var root = document.documentElement;
  function measure(){
    var out = {};
    SPEC.probes.forEach(function(p){
      var el = document.querySelector('[data-probe-id="'+p.id+'"]');
      if(!el){ out[p.id] = { missing: true }; return; }
      var cs = getComputedStyle(el);
      var longhands = {};
      p.longhands.forEach(function(lh){ longhands[lh] = cs.getPropertyValue(lh); });
      var channels = {};
      p.channels.forEach(function(ch){ channels[ch] = cs.getPropertyValue(ch); });
      out[p.id] = { longhands: longhands, channels: channels };
    });
    return out;
  }
  var result = { rest: measure(), perturbed: {}, portal: null, ua: navigator.userAgent };
  SPEC.perturbations.forEach(function(pert){
    Object.keys(pert.decls).forEach(function(k){ root.style.setProperty(k, pert.decls[k]); });
    result.perturbed[pert.id] = measure();
    Object.keys(pert.decls).forEach(function(k){ root.style.removeProperty(k); });
  });
  if (SPEC.portal) {
    // Reproduce the portal freeze: the DS portal snapshots every --ds-* it can
    // read off the anchor's computed style and stamps them INLINE on the
    // portal wrapper (ui/primitives/runtime/overlay/foundation/portal-theme).
    var host = document.getElementById('probe-host');
    var anchorCs = getComputedStyle(host);
    var wrapper = document.createElement('div');
    var stamped = 0;
    for (var i = 0; i < anchorCs.length; i++) {
      var name = anchorCs[i];
      if (name.indexOf('--ds-') === 0) { wrapper.style.setProperty(name, anchorCs.getPropertyValue(name)); stamped++; }
    }
    document.body.appendChild(wrapper);
    wrapper.appendChild(host);
    var beforeDial = measure();
    Object.keys(SPEC.perturbations[0] ? SPEC.perturbations[0].decls : {}).forEach(function(k){
      root.style.setProperty(k, SPEC.perturbations[0].decls[k]);
    });
    result.portal = { stampedCustomProperties: stamped, rest: beforeDial, afterDial: measure() };
  }
  document.body.setAttribute('data-probe-result', JSON.stringify(result));
})();
</script>
</body></html>`;
}

/**
 * Run one fixture. Returns the parsed measurement object.
 * Throws with the raw stdout when the page failed to produce a result — a
 * silent empty result would be the worst possible outcome for this probe.
 */
export function runFixture({ css, html, binary, timeoutMs = 60000 }) {
  const bin = binary || findChromium();
  if (!bin) throw new Error("no Chromium binary found; leg 2 cannot run");
  const dir = mkdtempSync(join(tmpdir(), "cascade-probe-"));
  writeFileSync(join(dir, "sheet.css"), css, "utf8");
  writeFileSync(join(dir, "probe.html"), html, "utf8");
  const out = execFileSync(
    bin,
    [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--allow-file-access-from-files",
      "--force-device-scale-factor=1",
      "--virtual-time-budget=4000",
      "--dump-dom",
      `file://${join(dir, "probe.html")}`,
    ],
    { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, timeout: timeoutMs, stdio: ["ignore", "pipe", "pipe"] },
  );
  const m = /data-probe-result="([^"]*)"/.exec(out);
  if (!m) throw new Error(`fixture produced no data-probe-result (fixture dir: ${dir})`);
  const json = m[1]
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
  return { measurement: JSON.parse(json), fixtureDir: dir, binary: bin };
}

/**
 * Concatenate a sheet built by css-model into one stylesheet, preserving the
 * layer each file landed in and, critically, leaving the tenant artifacts
 * UNLAYERED exactly as the real entrypoints import them.
 */
export function inlineSheet(sheet) {
  const parts = [];
  if (sheet.layerOrder.length) parts.push(`@layer ${sheet.layerOrder.join(", ")};`);
  for (const f of sheet.files) {
    const body = f.text.replace(/@import[^;]*;/g, "");
    parts.push(
      f.layer ? `@layer ${f.layer} {\n${body}\n}` : `/* unlayered: ${f.rel} */\n${body}`,
    );
  }
  return parts.join("\n");
}

export { mkdirSync };
