import assert from 'node:assert/strict';
import test from 'node:test';

import { MAX_DEPTH, buildResolvedMap, diffMaps, diffUnresolved, isGuaranteedInvalid, resolveScope, resolveValue, splitVar } from './index.mjs';

const scope = {
  '--ds-ink': '#14283B',
  '--ds-alias': 'var(--ds-ink)',
  '--ds-deep': 'var(--ds-alias)',
  '--ds-mix': 'color-mix(in srgb, var(--ds-ink) 28%, transparent)',
  '--ds-twice': 'inset 0 0 0 1px var(--ds-ink), 0 4px 14px var(--ds-ink)',
  '--ds-with-fallback': 'var(--ds-ausente, #FFFFFF)',
  '--ds-no-fallback': 'var(--ds-ausente)',
  '--ds-loop-a': 'var(--ds-loop-b)',
  '--ds-loop-b': 'var(--ds-loop-a)',
};

/* ── 1. la ley: colapso literal→var() con el mismo valor NO mueve el mapa ── */

test('CERO-DELTA — colapsar un literal a var() de un canal con el mismo valor no mueve nada', () => {
  const before = { themes: { demo: { base: { '--ds-card-color': '#14283B', '--ds-ink': '#14283B' } } } };
  const collapsed = resolveScope({ '--ds-card-color': 'var(--ds-ink)', '--ds-ink': '#14283B' });
  const after = { themes: { demo: { base: collapsed.resolved } } };
  assert.deepEqual(diffMaps(before, after), [], 'el mapa resuelto tiene que quedar idéntico');
});

test('CUALQUIER OTRO CAMBIO — el diff nombra el canal, su antes y su despues', () => {
  const before = { themes: { demo: { base: { '--ds-card-color': '#14283B' } } } };
  const after = { themes: { demo: { base: { '--ds-card-color': '#53697E' } } } };
  const moved = diffMaps(before, after);
  assert.equal(moved.length, 1);
  assert.deepEqual(moved[0], { vertical: 'demo', scope: 'base', channel: '--ds-card-color', before: '#14283B', after: '#53697E' });
});

test('un colapso hacia una cabeza NO emitida se ve: cae al fallback y el resuelto cambia', () => {
  const before = resolveScope({ '--ds-card-bg': '#FFFFFF' }).resolved;
  const after = resolveScope({ '--ds-card-bg': 'var(--ds-surface-control, #EEEEEE)' }).resolved;
  assert.notEqual(before['--ds-card-bg'], after['--ds-card-bg']);
  assert.equal(after['--ds-card-bg'], '#EEEEEE');
});

test('el diff ve un canal que aparece y uno que desaparece', () => {
  const moved = diffMaps(
    { themes: { demo: { base: { '--ds-a': '1' } } } },
    { themes: { demo: { base: { '--ds-b': '2' } } } },
  );
  assert.equal(moved.length, 2);
  assert.deepEqual(moved.map((item) => [item.channel, item.before, item.after]).sort(),
    [['--ds-a', '1', null], ['--ds-b', null, '2']]);
});

/* ── 2. el resolvedor ───────────────────────────────────────────────────── */

test('resuelve alias encadenados hasta el literal', () => {
  assert.equal(resolveValue('var(--ds-deep)', scope).value, '#14283B');
});

test('una MISMA referencia dos veces no es un ciclo — el defecto que corregi', () => {
  const outcome = resolveValue(scope['--ds-twice'], scope);
  assert.equal(outcome.unresolved, null, 'dos referencias hermanas al mismo canal no son circularidad');
  assert.equal(outcome.value, 'inset 0 0 0 1px #14283B, 0 4px 14px #14283B');
  const mix = resolveValue(scope['--ds-mix'], scope);
  assert.equal(mix.unresolved, null);
  assert.equal(mix.value, 'color-mix(in srgb, #14283B 28%, transparent)');
});

test('un ciclo REAL se marca y no se hace pasar por literal', () => {
  const outcome = resolveValue('var(--ds-loop-a)', scope);
  assert.equal(outcome.unresolved.reason, 'cycle');
  assert.ok(['--ds-loop-a', '--ds-loop-b'].includes(outcome.unresolved.channel));
});

test('un canal que nadie declara se marca missing, no se aplana', () => {
  const outcome = resolveValue(scope['--ds-no-fallback'], scope);
  assert.equal(outcome.unresolved.reason, 'missing');
  assert.equal(outcome.unresolved.channel, '--ds-ausente');
});

test('el fallback se usa SOLO cuando el primario no resuelve', () => {
  assert.equal(resolveValue(scope['--ds-with-fallback'], scope).value, '#FFFFFF');
  assert.equal(resolveValue('var(--ds-ink, #000000)', scope).value, '#14283B');
});

test('splitVar respeta parentesis balanceados en el fallback', () => {
  const parsed = splitVar('var(--ds-x, color-mix(in srgb, #fff 10%, #000))');
  assert.equal(parsed.name, '--ds-x');
  assert.equal(parsed.fallback, 'color-mix(in srgb, #fff 10%, #000)');
  assert.equal(parsed.after, '');
});

test('una cadena mas profunda que el tope se marca depth', () => {
  const deep = {};
  for (let index = 0; index <= MAX_DEPTH + 2; index += 1) deep[`--ds-n${index}`] = `var(--ds-n${index + 1})`;
  const outcome = resolveValue('var(--ds-n0)', deep);
  assert.ok(['depth', 'missing'].includes(outcome.unresolved.reason));
  assert.notEqual(outcome.unresolved, null, 'nunca devuelve un literal fabricado');
});

test('resolveScope declara cada no-resuelto con su canal EXTERNO, su motivo y su causa inmediata', () => {
  const { resolved, unresolved } = resolveScope(scope);
  assert.equal(resolved['--ds-alias'], '#14283B');
  const reasons = unresolved.reduce((acc, item) => { acc[item.reason] = (acc[item.reason] ?? 0) + 1; return acc; }, {});
  assert.equal(reasons.missing, 1, 'solo --ds-no-fallback: --ds-with-fallback SI resuelve, por su fallback');
  assert.equal(reasons.cycle, 2, 'loop-a y loop-b');
  assert.equal(resolved['--ds-with-fallback'], '#FFFFFF', 'usar el fallback es resolver, no fallar');
  for (const item of unresolved) {
    assert.ok(Object.prototype.hasOwnProperty.call(item, 'cause'), 'toda entrada lleva su causa inmediata (o null)');
    assert.ok(item.channel.startsWith('--ds-'), 'el canal registrado es el EXTERNO que falla, no la variable interna');
  }
});

/* ── 2b. guaranteed-invalid: la correccion pre-2B (Codex via owner) ──────── */

test('una declarada cuya cadena NO resuelve es guaranteed-invalid: el fallback ENGANCHA', () => {
  const broken = { '--ds-rota': 'var(--ds-ausente)' };
  assert.equal(resolveValue('var(--ds-rota, #FFFFFF)', broken).value, '#FFFFFF',
    'IACVT: la declarada invalida se comporta como no declarada para el var() que la consume');
  const outcome = resolveValue('var(--ds-rota, #FFFFFF)', broken);
  assert.equal(outcome.unresolved, null, 'con fallback enganchado el canal RESUELVE');
});

test('una declarada invalida SIN fallback deja al consumidor unresolved con la causa raiz', () => {
  const broken = { '--ds-rota': 'var(--ds-ausente)' };
  const outcome = resolveValue('var(--ds-rota)', broken);
  assert.equal(outcome.unresolved.reason, 'missing', 'la causa raiz se propaga');
  const scoped = resolveScope({ '--ds-consumidor': 'var(--ds-rota)', '--ds-rota': 'var(--ds-ausente)' });
  const consumidor = scoped.unresolved.find((item) => item.channel === '--ds-consumidor');
  assert.ok(consumidor, 'el consumidor queda declarado como no resuelto');
  assert.equal(consumidor.cause, '--ds-rota', 'la causa inmediata es la cadena invalida');
  const rota = scoped.unresolved.find((item) => item.channel === '--ds-rota');
  assert.equal(rota.cause, '--ds-ausente', 'y la cadena completa queda atribuible eslabon por eslabon');
});

test('`--x: initial` ES guaranteed-invalid: se declara, y el fallback del consumidor engancha', () => {
  assert.ok(isGuaranteedInvalid(' initial '));
  assert.ok(isGuaranteedInvalid('INITIAL'));
  assert.ok(!isGuaranteedInvalid('#FFFFFF'));
  const withInitial = { '--ds-vacia': 'initial' };
  assert.equal(resolveValue('var(--ds-vacia, #FFFFFF)', withInitial).value, '#FFFFFF');
  assert.equal(resolveValue('var(--ds-vacia)', withInitial).unresolved.reason, 'guaranteed-invalid');
  const scoped = resolveScope(withInitial);
  assert.deepEqual(scoped.unresolved, [{ channel: '--ds-vacia', reason: 'guaranteed-invalid', cause: null }],
    'la propia declaracion initial queda marcada, nunca pasa por literal usable');
});

test('un ciclo CON fallback lo engancha (el consumidor EXTERNO)', () => {
  assert.equal(resolveValue('var(--ds-loop-a, #000000)', scope).value, '#000000');
});

test('un MIEMBRO de ciclo con fallback NO lo engancha: el ciclo entero es guaranteed-invalid (postaudit Fable)', () => {
  /* css-variables-1 §3.1: las aristas del grafo las crea el PRIMER argumento de
   * cada var(); el fallback no es escape. `--a: var(--b, 1); --b: var(--a, 2)`
   * en un navegador deja AMBAS guaranteed-invalid; la version anterior del
   * instrumento "resolvia" 1 y 2 sin dejar registro. */
  const ciclico = { '--ds-a': 'var(--ds-b, 1)', '--ds-b': 'var(--ds-a, 2)' };
  const { resolved, unresolved } = resolveScope(ciclico);
  assert.notEqual(resolved['--ds-a'], '1', 'el fallback del miembro es irrelevante');
  assert.notEqual(resolved['--ds-b'], '2', 'el fallback del miembro es irrelevante');
  const a = unresolved.find((item) => item.channel === '--ds-a');
  const b = unresolved.find((item) => item.channel === '--ds-b');
  assert.equal(a?.reason, 'cycle');
  assert.equal(b?.reason, 'cycle');
});

test('un consumidor EXTERNO de un ciclo sin fallback queda unresolved con causa el miembro ciclico', () => {
  const ciclico = { '--ds-a': 'var(--ds-b)', '--ds-b': 'var(--ds-a)', '--ds-consumidor': 'var(--ds-a)' };
  const { unresolved } = resolveScope(ciclico);
  const consumidor = unresolved.find((item) => item.channel === '--ds-consumidor');
  assert.equal(consumidor?.reason, 'cycle');
  assert.ok(['--ds-a', '--ds-b'].includes(consumidor?.cause), 'la causa inmediata es el miembro ciclico referenciado');
});

test('un consumidor externo CON fallback SI lo engancha aunque el ciclo sea invalido', () => {
  const ciclico = { '--ds-a': 'var(--ds-b)', '--ds-b': 'var(--ds-a)', '--ds-consumidor': 'var(--ds-a, #FFFFFF)' };
  const { resolved, unresolved } = resolveScope(ciclico);
  assert.equal(resolved['--ds-consumidor'], '#FFFFFF');
  assert.ok(!unresolved.some((item) => item.channel === '--ds-consumidor'));
});

test('la guarda depth NUNCA engancha un fallback: es del instrumento, no una invalidez real', () => {
  const deep = {};
  for (let index = 0; index <= MAX_DEPTH + 2; index += 1) deep[`--ds-n${index}`] = `var(--ds-n${index + 1})`;
  const outcome = resolveValue('var(--ds-n0, #FFFFFF)', deep);
  assert.notEqual(outcome.value, '#FFFFFF', 'si el fallback enganchara, la guarda quedaria escondida');
  assert.notEqual(outcome.unresolved, null, 'sigue declarada como no resuelta');
});

/* ── 2c. el conjunto unresolved entra al cero-delta (--against endurecido) ── */

test('diffUnresolved nombra lo que entra y lo que sale aunque los VALORES no se muevan', () => {
  const before = { unresolved: [{ vertical: 'demo', scope: 'base', channel: '--ds-a', reason: 'missing', cause: '--ds-x' }] };
  const after = { unresolved: [{ vertical: 'demo', scope: 'base', channel: '--ds-b', reason: 'missing', cause: '--ds-x' }] };
  assert.deepEqual(diffMaps({ themes: { demo: { base: { '--ds-c': '1' } } } }, { themes: { demo: { base: { '--ds-c': '1' } } } }), [],
    'los valores no se movieron: sin este diff seria un falso cero-delta');
  const drift = diffUnresolved(before, after);
  assert.equal(drift.added.length, 1);
  assert.equal(drift.added[0].channel, '--ds-b');
  assert.equal(drift.removed.length, 1);
  assert.equal(drift.removed[0].channel, '--ds-a');
  assert.deepEqual(diffUnresolved(before, before), { added: [], removed: [] }, 'identico contra si mismo');
});

/* ── 3. el árbol REAL ───────────────────────────────────────────────────── */

test('sobre el arbol real: el mapa resuelto no tiene ciclos y los missing estan declarados', async () => {
  const { readFileSync } = await import('node:fs');
  const doc = JSON.parse(readFileSync(new URL('../../../manifest/generated/resolved-map.json', import.meta.url), 'utf8'));
  assert.equal(doc.stats.unresolvedByReason.cycle, undefined, 'un ciclo real seria un defecto de la cascada');
  assert.equal(doc.stats.unresolvedByReason.depth, undefined, 'la guarda depth tampoco puede dispararse en el arbol real (gemela de cycle)');
  assert.equal(doc.stats.unresolved, doc.unresolved.length);
  for (const item of doc.unresolved) assert.ok(['missing', 'cycle', 'depth', 'guaranteed-invalid'].includes(item.reason));
  // El pin del arbol resuelve los canales testigo.
  assert.equal(doc.themes.bithire.base['--ds-color-text-primary'], '#14283B');
  assert.equal(doc.themes.bithire.base['--ds-input-md-line-height'], '20px');
});

test('sobre el arbol real: ninguna custom property compilada usa inherit/unset/revert (no modelados)', async () => {
  /* Esas palabras en una custom property necesitarian modelo de cascada/herencia
   * que el instrumento no tiene; hoy hay CERO ocurrencias y este drill lo fija. */
  const live = await buildResolvedMap();
  const prohibidas = new Set(['inherit', 'unset', 'revert', 'revert-layer']);
  for (const scopes of Object.values(live.themes)) {
    for (const scope of Object.values(scopes)) {
      for (const [channel, value] of Object.entries(scope)) {
        assert.ok(!prohibidas.has(String(value).trim().toLowerCase()),
          `${channel} usa una palabra de cascada no modelada: ${value}`);
      }
    }
  }
});

test('el mapa vivo y el pineado coinciden (la ley cero-delta, hecha continua)', async () => {
  const { readFileSync } = await import('node:fs');
  const pinned = JSON.parse(readFileSync(new URL('../../../manifest/generated/resolved-map.json', import.meta.url), 'utf8'));
  const live = await buildResolvedMap();
  assert.deepEqual(diffMaps(pinned, live), []);
});
