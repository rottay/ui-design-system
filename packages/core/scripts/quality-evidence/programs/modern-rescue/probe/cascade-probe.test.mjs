/**
 * cascade-probe.test.mjs
 *
 * La sonda no vale nada si no se pone ROJA cuando debe. La mitad de esta suite
 * son CONTROLES NEGATIVOS: cada uno PLANTA un defecto en una COPIA EN MEMORIA
 * de la hoja (el arbol real nunca se toca) y exige que la sonda lo condene.
 *
 * Los cinco controles obligatorios:
 *   1 doble escalado                → FAIL  (el defecto real que ya ocurrio)
 *   2 escalon de rampa equivocado   → FAIL  (equivalencia en reposo)
 *   3 rol equivocado, mismo valor   → REQUIRES-ADJUDICATION (nunca PASS mudo)
 *   4 canal muerto                  → MASKED
 *   5 reescritura pisada            → MASKED
 *
 * Y un CONTROL POSITIVO, porque una sonda que siempre dice rojo tampoco mide
 * nada: una reescritura correcta tiene que dar PASS.
 *
 * Ejecutar:  node --test scripts/quality-evidence/programs/modern-rescue/probe/cascade-probe.test.mjs
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  CSS_INITIAL_ROOT_PX,
  CSS_ROOT,
  DOCUMENT_ROOT_CONTEXT,
  VERDICT,
  adjudicate,
  cloneSheet,
  deriveRootFontSize,
  derivative,
  evaluate,
  evaluateLiteral,
  evaluateSite,
  findReadingSites,
  formatValue,
  loadSheet,
  measureExponent,
  multiplicativeRefs,
  plantDeclaration,
  plantNewRule,
  restEquivalence,
  rootFontSize,
  valuesEqual,
} from "./cascade-probe.mjs";

/* ── hoja compartida (solo lectura) ─────────────────────────────────────── */

let BASE = null;
function base() {
  if (!BASE) BASE = loadSheet();
  return BASE;
}

/**
 * Aritmetica PURA, sin hoja: no hay cadena que resolver, asi que `rem` usa el
 * inicial de CSS y eso se pasa EXPLICITO. Para todo lo ligado al arbol real
 * esta `qs()`, que usa la raiz derivada — que no es 16.
 */
function q(text) {
  return evaluateLiteral(text, { remPx: CSS_INITIAL_ROOT_PX });
}

/** Literal interpretado con la raiz DERIVADA de una hoja. */
function qs(sheet, text) {
  return evaluateLiteral(text, { remPx: rootFontSize(sheet).px });
}

/* ═══════════════════════════════════════════════════════════════════════════
   A · EL EVALUADOR — sin hoja, aritmetica pura
   ═══════════════════════════════════════════════════════════════════════════ */

test("A1 · rem se convierte a px con la raiz que se le pasa", () => {
  assert.equal(CSS_INITIAL_ROOT_PX, 16);
  assert.deepEqual(q("1rem"), { kind: "quantity", n: 16, unit: "px" });
  assert.deepEqual(q("0.875rem"), { kind: "quantity", n: 14, unit: "px" });
});

test("A2 · calc con + - * / y parentesis", () => {
  assert.deepEqual(q("calc(1rem * 2)"), { kind: "quantity", n: 32, unit: "px" });
  assert.deepEqual(q("calc(1rem + 4px)"), { kind: "quantity", n: 20, unit: "px" });
  assert.deepEqual(q("calc(2rem - 8px)"), { kind: "quantity", n: 24, unit: "px" });
  assert.deepEqual(q("calc(1rem / 2)"), { kind: "quantity", n: 8, unit: "px" });
  assert.deepEqual(q("calc((1rem + 1rem) * 1.5)"), {
    kind: "quantity",
    n: 48,
    unit: "px",
  });
});

test("A3 · clamp, min y max", () => {
  assert.deepEqual(q("clamp(0.5, 2, 3)"), { kind: "quantity", n: 2, unit: "" });
  assert.deepEqual(q("clamp(0.5, 9, 3)"), { kind: "quantity", n: 3, unit: "" });
  assert.deepEqual(q("clamp(0.5, 0.1, 3)"), { kind: "quantity", n: 0.5, unit: "" });
  assert.deepEqual(q("min(1rem, 8px)"), { kind: "quantity", n: 8, unit: "px" });
  assert.deepEqual(q("max(1rem, 8px)"), { kind: "quantity", n: 16, unit: "px" });
});

test("A4 · un shorthand se compara COMPONENTE A COMPONENTE, no como texto", () => {
  const a = q("0 1rem");
  const b = q("0 calc(1rem * clamp(0.5, calc(1 * 1), 3))");
  assert.equal(a.kind, "list");
  assert.equal(b.kind, "list");
  assert.ok(valuesEqual(a, b), "0 16px debe igualar 0 calc(...)=16px");
  assert.ok(!valuesEqual(a, q("0 1.5rem")));
});

test("A5 · 1rem == 16px pero 1.5 != 1.5rem — la unidad es parte del valor", () => {
  assert.ok(valuesEqual(q("1rem"), q("16px")));
  assert.ok(!valuesEqual(q("1.5"), q("1.5rem")));
});

test("A6 · em y % sin base son UNRESOLVED, no un numero adivinado", () => {
  assert.throws(() => evaluateLiteral("2em", {}), /em-without-basis/);
  assert.throws(() => evaluateLiteral("50%", {}), /percent-without-basis/);
  assert.deepEqual(evaluateLiteral("2em", { emBasis: 10 }), {
    kind: "quantity",
    n: 20,
    unit: "px",
  });
});

test("A7 · un valor no numerico se devuelve como texto, no se inventa", () => {
  assert.deepEqual(q("solid"), { kind: "text", text: "solid" });
  assert.equal(q("1px solid red").kind, "text");
  assert.equal(q("var(--x)").kind, "text"); // sin sustituir aun
});

test("A8 · deteccion estructural de dial: var() como factor de * o /", () => {
  const refs = multiplicativeRefs(
    "calc(var(--ds-button-md-padding-x) * var(--ds-density-effective-scale))",
  );
  assert.ok(refs.has("--ds-button-md-padding-x"));
  assert.ok(refs.has("--ds-density-effective-scale"));
  const none = multiplicativeRefs("var(--ds-line-height-heading)");
  assert.equal(none.size, 0);
});

/* ═══════════════════════════════════════════════════════════════════════════
   B · LA HOJA — carga, exclusiones, cascada
   ═══════════════════════════════════════════════════════════════════════════ */

test("B1 · la hoja carga desde el arbol real de tokens", () => {
  const sheet = base();
  assert.ok(sheet.stats.files > 100, "deben parsearse cientos de archivos");
  assert.ok(sheet.rules.length > 1000);
  assert.ok(sheet.customProps.size > 1000);
  assert.ok(sheet.layerOrder.includes("rottay-tokens"));
  assert.ok(sheet.layerOrder.includes("rottay-components"));
  assert.ok(sheet.layerOrder.includes("rottay-engines"));
});

test("B2 · facade/artifacts/** queda EXCLUIDO y declarado", () => {
  const sheet = base();
  const leaked = sheet.rules.filter((r) =>
    r.relFile.includes("facade/artifacts/"),
  );
  assert.equal(leaked.length, 0, "ningun snapshot de tenant entra en la hoja");
  assert.ok(CSS_ROOT.endsWith("foundation/tokens/css"));
});

test("B3 · lo excluido se CUENTA — excluir sin contar seria mentir", () => {
  const s = base().stats;
  assert.ok(s.conditionalBlocks > 0, "hay @media y se cuentan");
  assert.ok(s.unsupportedSelectorRules > 0, "hay :hover etc. y se cuentan");
  assert.ok(Array.isArray(s.externalImportsSkipped));
  assert.equal(s.missingFiles.length, 0);
});

test("B4 · anclas del arbol real: valores y procedencia", () => {
  const sheet = base();

  // `button.css` declara `1rem`, y `1rem` NO son 16px en este arbol: la raiz
  // derivada es 15px. El ancla se escribe en rem, que es lo que dice la
  // fuente, y se comprueba contra los px que realmente se pintan.
  const pad = evaluate("--ds-button-md-padding-x", { sheet });
  assert.equal(pad.status, "ok");
  assert.ok(valuesEqual(pad.value, qs(sheet, "1rem")), formatValue(pad.value));
  assert.ok(valuesEqual(pad.value, q("15px")), formatValue(pad.value));
  assert.match(pad.chain[0].origin.file, /presentation\/components\/button\.css$/);

  const fs = evaluate("--ds-input-md-font-size", { sheet });
  assert.ok(valuesEqual(fs.value, qs(sheet, "0.875rem")), formatValue(fs.value));
  assert.ok(valuesEqual(fs.value, q("13.125px")), formatValue(fs.value));
  assert.match(fs.chain[0].origin.file, /presentation\/components\/input\.css$/);

  // la rampa de tipografia SI encadena, y termina en el dial de tipografia
  const sm = evaluate("--ds-font-size-sm", { sheet, checkReadership: false });
  assert.ok(sm.chain.some((s) => s.property === "--ds-font-size-sm-base"));
  assert.ok(sm.chain.some((s) => s.property === "--ds-type-scale"));

  const dial = evaluate("--ds-density-effective-scale", { sheet });
  assert.ok(valuesEqual(dial.value, q("1")), formatValue(dial.value));
});

test("B5 · el fallback se usa cuando la propiedad no tiene declarador", () => {
  const sheet = base();
  const r = evaluate("--ds-font-size-sm", { sheet, checkReadership: false });
  const step = r.chain.find((s) => s.property === "--ds-type-scale");
  assert.ok(step, "--ds-type-scale aparece en la cadena");
  assert.match(step.value, /undefined → fallback 1/);
});

test("B6 · un ciclo se reporta como UNRESOLVED, nunca como un numero", () => {
  const sheet = cloneSheet(base());
  plantNewRule(sheet, {
    selector: ":root",
    declarations: {
      "--ds-probe-cycle-a": "var(--ds-probe-cycle-b)",
      "--ds-probe-cycle-b": "var(--ds-probe-cycle-a)",
    },
  });
  const r = evaluate("--ds-probe-cycle-a", { sheet, checkReadership: false });
  assert.equal(r.status, "unresolved");
  assert.equal(r.reason, "cycle");
  assert.equal(r.value, null);
});

test("B7 · una propiedad indefinida y sin fallback es UNRESOLVED", () => {
  const r = evaluate("--ds-probe-nunca-declarado", {
    sheet: base(),
    checkReadership: false,
  });
  assert.equal(r.status, "unresolved");
  assert.equal(r.reason, "undefined-custom-property");
});

/* ═══════════════════════════════════════════════════════════════════════════
   C · SITIOS DE LECTURA + LA DERIVADA sobre el arbol real
   ═══════════════════════════════════════════════════════════════════════════ */

test("C1 · los sitios de lectura se DESCUBREN, no se declaran", () => {
  const sites = findReadingSites(base(), "--ds-button-md-padding-x");
  assert.ok(sites.length > 0);
  const skin = sites.find(
    (s) =>
      s.file.includes("runtime/engines/modern/skin/button.css") &&
      s.property === "padding-inline",
  );
  assert.ok(skin, "el skin modern de button debe aparecer solo");
  assert.match(skin.selector, /data-size='md'/);
});

test("C2 · el skin modern ya aplica la densidad UNA vez (linea base)", () => {
  const sheet = base();
  const site = findReadingSites(sheet, "--ds-button-md-padding-x").find(
    (s) =>
      s.file.includes("modern/skin/button.css") && s.property === "padding-inline",
  );
  const m = measureExponent({
    sheet,
    site,
    dial: "--ds-density-effective-scale",
  });
  assert.equal(m.status, "ok");
  assert.equal(m.integralExponent, 1, "e = 1 antes de cualquier reescritura");
});

test("C3 · derivative() reporta valor en cada punto y factor observado", () => {
  const sheet = base();
  const site = findReadingSites(sheet, "--ds-button-md-padding-x").find(
    (s) =>
      s.file.includes("modern/skin/button.css") && s.property === "padding-inline",
  );
  const d = derivative({
    sheet,
    channel: "--ds-button-md-padding-x",
    dial: "--ds-density-effective-scale",
    points: ["1", "1.5"],
    expectedExponent: 1,
    site,
  });
  assert.equal(d.status, "ok");
  // 1rem = 15px con la raiz derivada, no 16px.
  assert.equal(formatValue(d.points[0].value), "15px");
  assert.equal(formatValue(d.points[1].value), "22.5px");
  assert.ok(Math.abs(d.observedFactor - 1.5) < 1e-9);
  assert.equal(d.matchesDeclared, true);
});

/* ═══════════════════════════════════════════════════════════════════════════
   D · LOS CINCO CONTROLES NEGATIVOS
   Cada uno siembra el defecto en una COPIA EN MEMORIA.
   ═══════════════════════════════════════════════════════════════════════════ */

test("D1 · CONTROL 1 — doble escalado: FAIL, y la sonda LOCALIZA el sitio sola", () => {
  const before = base();
  const after = cloneSheet(before);
  const planted = plantDeclaration(after, {
    property: "--ds-button-md-padding-x",
    value: "var(--ds-spacing-4, 1rem)",
  });
  assert.equal(planted.previous, "1rem");

  // En reposo es BYTE-EQUIVALENTE: por eso ninguna captura puede verlo.
  const rest = restEquivalence({
    before,
    after,
    channel: "--ds-button-md-padding-x",
  });
  assert.equal(rest.equal, true, "en reposo NO se distingue: la vista es ciega");

  // A la sonda solo se le dice el canal y el valor nuevo. Ni el sitio de
  // lectura, ni el dial, ni el archivo del skin.
  const v = adjudicate({
    before,
    after,
    channel: "--ds-button-md-padding-x",
    planted,
  });
  assert.equal(v.verdict, VERDICT.FAIL);
  assert.equal(v.reason, "double-application");

  const d = v.doubles[0];
  assert.equal(d.dial, "--ds-density-effective-scale");
  assert.equal(d.exponentAfter, 2, "densidad al cuadrado");
  assert.equal(d.exponentBefore, 1, "antes se aplicaba una sola vez");
  assert.match(d.site.file, /runtime\/engines\/modern\/skin\/button\.css$/);
  assert.equal(d.site.property, "padding-inline");

  // y a densidad 1.5 el padding se va a 36px en vez de 24px
  const dd = derivative({
    sheet: after,
    channel: "--ds-button-md-padding-x",
    dial: "--ds-density-effective-scale",
    points: ["1", "1.5"],
    site: d.site,
  });
  assert.equal(formatValue(dd.points[0].value), "15px");
  assert.equal(formatValue(dd.points[1].value), "33.75px"); // 15 × 1.5 × 1.5
});

test("D2 · CONTROL 2 — escalon de rampa equivocado: FAIL por reposo", () => {
  const before = base();
  const after = cloneSheet(before);
  const planted = plantDeclaration(after, {
    property: "--ds-input-md-font-size",
    value: "var(--ds-font-size-md, 0.875rem)",
  });
  const v = adjudicate({
    before,
    after,
    channel: "--ds-input-md-font-size",
    planted,
  });
  assert.equal(v.verdict, VERDICT.FAIL);
  assert.equal(v.reason, "rest-equivalence");
  assert.equal(formatValue(v.rest.channel.before.value), "13.125px"); // 0.875rem
  assert.equal(formatValue(v.rest.channel.after.value), "15px"); // escalon `md`
});

test("D3 · CONTROL 3 — mismo valor, rol distinto: REQUIRES-ADJUDICATION, jamas PASS", () => {
  const before = base();
  const after = cloneSheet(before);

  // ambos valen 1.2: reposo identico y misma dimension (adimensional)
  assert.ok(
    valuesEqual(
      evaluate("--ds-button-xl-line-height", { sheet: before }).value,
      evaluate("--ds-line-height-heading", { sheet: before, checkReadership: false })
        .value,
    ),
  );

  const planted = plantDeclaration(after, {
    property: "--ds-button-xl-line-height",
    value: "var(--ds-line-height-heading)",
  });
  const v = adjudicate({
    before,
    after,
    channel: "--ds-button-xl-line-height",
    planted,
  });
  assert.notEqual(v.verdict, VERDICT.PASS, "un PASS aqui seria un falso verde");
  assert.equal(v.verdict, VERDICT.ADJUDICATE);
  assert.equal(v.reason, "static-root-role-undecidable");
  assert.ok(v.sites.length > 0, "el canal SI se lee: no es MASKED, es indecidible");
});

test("D4 · CONTROL 4 — canal muerto: MASKED, nunca PASS", () => {
  const seed = cloneSheet(base());
  plantNewRule(seed, {
    selector: ":root",
    declarations: { "--ds-probe-orphan-padding-x": "1rem" },
  });
  const before = cloneSheet(seed);
  const after = cloneSheet(seed);
  const planted = plantDeclaration(after, {
    property: "--ds-probe-orphan-padding-x",
    value: "var(--ds-spacing-4, 1rem)",
  });

  assert.equal(findReadingSites(after, "--ds-probe-orphan-padding-x").length, 0);

  const v = adjudicate({
    before,
    after,
    channel: "--ds-probe-orphan-padding-x",
    planted,
  });
  assert.equal(v.verdict, VERDICT.MASKED);
  assert.equal(v.reason, "dead-channel");
  assert.notEqual(v.verdict, VERDICT.PASS);

  // y evaluate() lo dice por su cuenta: status 'unread'
  const e = evaluate("--ds-probe-orphan-padding-x", { sheet: after });
  assert.equal(e.status, "unread");
  assert.equal(e.reason, "no-reading-site");
  assert.ok(
    valuesEqual(e.value, qs(base(), "1rem")),
    "evalua bien... y aun asi no pinta",
  );
});

test("D5 · CONTROL 5 — la reescritura no llega: la pisa un declarador posterior", () => {
  const before = base();
  const after = cloneSheet(before);
  const planted = plantDeclaration(after, {
    property: "--ds-button-md-padding-x",
    value: "var(--ds-spacing-4, 1rem)",
  });
  // un declarador posterior en la misma cascada la pisa con el literal
  plantNewRule(after, {
    selector: ":root",
    declarations: { "--ds-button-md-padding-x": "1rem" },
  });

  const v = adjudicate({
    before,
    after,
    channel: "--ds-button-md-padding-x",
    planted,
  });
  assert.equal(v.verdict, VERDICT.MASKED);
  assert.equal(v.reason, "rewrite-not-winning");
  assert.notEqual(v.verdict, VERDICT.PASS);
  assert.notEqual(
    v.verdict,
    VERDICT.FAIL,
    "el doble escalado NO ocurre porque la edicion nunca gana la cascada",
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   E · CONTROL POSITIVO — una sonda siempre-roja tampoco mide nada
   ═══════════════════════════════════════════════════════════════════════════ */

test("E1 · una reescritura correcta da PASS con e: 0 → 1", () => {
  const before = base();
  const after = cloneSheet(before);
  const planted = plantDeclaration(after, {
    property: "--ds-switch-label-gap",
    value: "var(--ds-spacing-2, 0.5rem)",
  });
  assert.equal(planted.previous, "0.5rem");

  const v = adjudicate({
    before,
    after,
    channel: "--ds-switch-label-gap",
    planted,
  });
  assert.equal(v.verdict, VERDICT.PASS, JSON.stringify(v.detail));

  const density = v.measurements.find(
    (m) => m.dial === "--ds-density-effective-scale",
  );
  assert.ok(density);
  assert.equal(density.before.integralExponent, 0, "antes el dial no llegaba");
  assert.equal(density.after.integralExponent, 1, "ahora llega exactamente una vez");
});

test("E2 · el mismo canal, cableado a un escalon equivocado, se pone rojo", () => {
  const before = base();
  const after = cloneSheet(before);
  const planted = plantDeclaration(after, {
    property: "--ds-switch-label-gap",
    value: "var(--ds-spacing-3, 0.5rem)", // 12px, no 8px
  });
  const v = adjudicate({
    before,
    after,
    channel: "--ds-switch-label-gap",
    planted,
  });
  assert.equal(v.verdict, VERDICT.FAIL);
  assert.equal(v.reason, "rest-equivalence");
});

/* ═══════════════════════════════════════════════════════════════════════════
   F · HIGIENE — la sonda no toca nada
   ═══════════════════════════════════════════════════════════════════════════ */

test("F1 · sembrar en la copia no altera la hoja original", () => {
  const before = base();
  const original = evaluate("--ds-button-md-padding-x", { sheet: before });
  const after = cloneSheet(before);
  plantDeclaration(after, {
    property: "--ds-button-md-padding-x",
    value: "var(--ds-spacing-4, 1rem)",
  });
  const again = evaluate("--ds-button-md-padding-x", { sheet: before });
  assert.equal(again.chain[0].value, original.chain[0].value);
  assert.equal(again.chain[0].value, "1rem");
});

test("F2 · el veredicto MASKED nunca se confunde con PASS", () => {
  assert.notEqual(VERDICT.MASKED, VERDICT.PASS);
  assert.equal(VERDICT.MASKED, "MASKED");
  assert.equal(VERDICT.ADJUDICATE, "REQUIRES-ADJUDICATION");
});

/* ═══════════════════════════════════════════════════════════════════════════
   G · LA RAIZ DE `rem` — DERIVADA, Y PORTADORA DEL DIAL DE TIPOGRAFIA

   Esta seccion fija el supuesto que la sonda tuvo mal. Modelaba `rem → px con
   raiz 16`, y en este arbol eso es falso por partida doble:
     • la raiz es 15px, porque `html[data-tenant]` fija font-size en
       `--ds-font-size-base` = calc(0.9375rem × --ds-type-scale);
     • y por eso mismo `rem` YA LLEVA el dial de tipografia una vez.
   Con la raiz clavada en 16, una reescritura que aplica el dial una SEGUNDA
   vez media exponente 1 y salia PASS. Es el falso verde exacto que la sonda
   existe para impedir.
   ═══════════════════════════════════════════════════════════════════════════ */

test("G1 · la raiz de rem se DERIVA de la cadena: 15px, no 16", () => {
  const sheet = base();
  const root = rootFontSize(sheet);

  assert.equal(root.derived, true, root.reason ?? "");
  assert.equal(root.px, 15);
  assert.notEqual(root.px, CSS_INITIAL_ROOT_PX);

  // y se deriva de la fuente real, no de una constante
  assert.match(root.origin.file, /runtime\/engines\/classic\/theme\.css$/);
  assert.equal(root.origin.selector, "html[data-tenant]");
  assert.equal(root.expression, "var(--ds-font-size-base)");
  assert.equal(root.expandedText, "calc(0.9375rem * 1)");

  // consecuencia directa: todo literal en rem vale 15/16 de lo que decia
  // el modelo viejo
  assert.deepEqual(qs(sheet, "1rem"), { kind: "quantity", n: 15, unit: "px" });
  assert.deepEqual(qs(sheet, "0.75rem"), {
    kind: "quantity",
    n: 11.25,
    unit: "px",
  });
});

test("G2 · la raiz lleva --ds-type-scale: se re-deriva bajo perturbacion", () => {
  const sheet = base();
  const at = (k) =>
    rootFontSize(sheet, { overrides: { "--ds-type-scale": String(k) } }).px;

  assert.equal(at(1), 15);
  assert.equal(at(1.5), 22.5); // 16 × 0.9375 × 1.5 — exponente 1, exacto
  assert.equal(at(2), 30);

  // el exponente de la raiz frente al dial es 1, no 0. Una raiz congelada
  // reportaria 0 y esconderia la primera aplicacion.
  const e = Math.log(at(1.5) / at(1)) / Math.log(1.5);
  assert.ok(Math.abs(e - 1) < 1e-12, String(e));
});

test("G3 · sin declaracion de raiz que resuelva, el 16 se DECLARA como ultimo recurso", () => {
  const sheet = cloneSheet(base());
  plantDeclaration(sheet, {
    property: "font-size",
    value: "var(--ds-probe-inexistente-sin-fallback)",
    context: DOCUMENT_ROOT_CONTEXT,
  });
  const root = rootFontSize(sheet);

  assert.equal(root.px, CSS_INITIAL_ROOT_PX);
  assert.equal(root.derived, false);
  assert.match(root.reason, /^root-font-size-unresolved:/);
  // el motivo nombra la propiedad que no resolvio: el 16 nunca es mudo
  assert.match(root.reason, /--ds-probe-inexistente-sin-fallback/);

  // y la derivacion directa dice lo mismo cuando no hay hoja
  assert.equal(deriveRootFontSize(null).derived, false);
  assert.equal(deriveRootFontSize(null).reason, "no-sheet");
});

test("G4 · CONTROL — 0.75rem → var(--ds-font-size-xs, 0.75rem) es DOBLE ESCALADO", () => {
  const before = base();
  const after = cloneSheet(before);
  const channel = "--ds-toggle-helper-font-size";
  const planted = plantDeclaration(after, {
    property: channel,
    value: "var(--ds-font-size-xs, 0.75rem)",
  });

  // EN REPOSO SON IDENTICOS. Por eso ninguna captura visual puede verlo, y
  // por eso el oraculo del reposo, solo, daria luz verde.
  const b = evaluate(channel, { sheet: before, checkReadership: false });
  const a = evaluate(channel, { sheet: after, checkReadership: false });
  assert.equal(formatValue(b.value), "11.25px");
  assert.equal(formatValue(a.value), "11.25px");
  assert.ok(valuesEqual(b.value, a.value));

  const v = adjudicate({ before, after, channel, planted });
  assert.notEqual(v.verdict, VERDICT.PASS);
  assert.equal(v.verdict, VERDICT.FAIL);
  assert.equal(v.reason, "double-application");

  const d = v.doubles.find((x) => x.dial === "--ds-type-scale");
  assert.ok(d, "el dial condenado es el de tipografia");
  assert.equal(d.exponentBefore, 1); // lo traia la raiz de rem
  assert.equal(d.exponentAfter, 2); // y la reescritura lo aplica otra vez

  // el mismo hecho, medido sobre el canal y no sobre el sitio
  const mBefore = measureExponent({
    sheet: before,
    channel,
    dial: "--ds-type-scale",
    fallbacks: a.fallbacks,
  });
  const mAfter = measureExponent({
    sheet: after,
    channel,
    dial: "--ds-type-scale",
    fallbacks: a.fallbacks,
  });
  assert.equal(mBefore.integralExponent, 1);
  assert.equal(mAfter.integralExponent, 2);
});

test("G5 · CONTROL CRUZADO — 8px → var(--ds-spacing-2, 8px) corre el reposo", () => {
  const before = base();
  const after = cloneSheet(before);
  const channel = "--ds-tree-checkbox-margin";
  const planted = plantDeclaration(after, {
    property: channel,
    value: "var(--ds-spacing-2, 8px)",
  });

  const v = adjudicate({ before, after, channel, planted });
  assert.equal(v.verdict, VERDICT.FAIL);
  assert.equal(v.reason, "rest-equivalence");
  assert.equal(formatValue(v.rest.channel.before.value), "8px");
  assert.equal(formatValue(v.rest.channel.after.value), "7.5px"); // 0.5rem × 15

  // los dos diales suben de 0 a 1: uno por la rampa de espaciado, el otro
  // por la raiz de rem. Subir de 0 a 1 es legal; el veredicto lo decide el
  // corrimiento en reposo, no la derivada.
  const exps = {};
  for (const dial of ["--ds-density-effective-scale", "--ds-type-scale"]) {
    const mB = measureExponent({ sheet: before, channel, dial });
    const mA = measureExponent({ sheet: after, channel, dial });
    exps[dial] = [mB.integralExponent, mA.integralExponent];
  }
  assert.deepEqual(exps["--ds-density-effective-scale"], [0, 1]);
  assert.deepEqual(exps["--ds-type-scale"], [0, 1]);
});

test("G6 · ninguna evaluacion ligada a la hoja usa el 16 de reserva", () => {
  const sheet = base();
  // Si alguna ruta volviera a clavar 16, estas dos igualdades se romperian:
  // 1rem valdria 16px y el canal en rem dejaria de moverse con el dial.
  const pad = evaluate("--ds-button-md-padding-x", { sheet });
  assert.equal(formatValue(pad.value), "15px");
  assert.equal(pad.rootFontSize.derived, true);
  assert.equal(pad.rootFontSize.px, 15);

  const site = findReadingSites(sheet, "--ds-button-md-padding-x").find(
    (s) =>
      s.file.includes("modern/skin/button.css") && s.property === "padding-inline",
  );
  const sv = evaluateSite(sheet, site, {});
  assert.equal(sv.rootFontSize.px, 15);
  assert.equal(formatValue(sv.value), "15px");
});

test("G7 · el dial que viaja en rem no fabrica un PASS: raiz estatica sigue indecidible", () => {
  const before = base();
  const after = cloneSheet(before);
  const channel = "--ds-toggle-helper-font-size";
  // `--ds-font-size-xs-base` es el escalon SIN dial: mismo valor en reposo,
  // misma derivada, solo cambia el nombre. El dial de tipografia que trae la
  // raiz de rem esta a los dos lados y no es evidencia de nada.
  const planted = plantDeclaration(after, {
    property: channel,
    value: "var(--ds-font-size-xs-base, 0.75rem)",
  });
  const v = adjudicate({ before, after, channel, planted });
  assert.notEqual(v.verdict, VERDICT.PASS);
  assert.equal(v.verdict, VERDICT.ADJUDICATE);
  assert.equal(v.reason, "static-root-role-undecidable");
});
