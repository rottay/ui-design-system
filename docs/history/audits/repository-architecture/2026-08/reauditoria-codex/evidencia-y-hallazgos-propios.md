# Evidencia reproducida y hallazgos propios

## 1. Contradicción Expert 294 / 290 / 67

Este es el hallazgo propio más importante.

La fuente y el artefacto compilado exponen 290 nombres:

```text
node --input-type=module -e "import('./packages/core/dist/server.js').then(m => console.log(m.TENANT_THEME_OVERRIDE_TOKENS.length))"
290
```

`packages/core/manifest/controls/token-overrides.json` también declara 290.
Sin embargo:

- `program/index.json` exige 294;
- `customization-model/index.json` exige 294;
- `rounds/index.json` registra 294;
- el README dice 294;
- `program-check.mjs` hardcodea 294 varias veces;
- `manifest/cascade/roots/token-overrides.json` todavía dice 67.

`program-check.mjs` devuelve `CONSTITUTION_READY` porque compara estas copias
stale entre sí. No las contrasta con `TENANT_THEME_OVERRIDE_TOKENS`.

El commit `dcadb84743` retiró deliberadamente cuatro canales muertos:
`--ds-color-dark-primary`, `secondary`, `accent` y `bg`. No deben reponerse para
alcanzar 294. Debe corregirse el denominador a 290 y añadirse igualdad exacta
contra la fuente viva.

## 2. Gate `schemaVersion` aceptaba formatos desconocidos

En el HEAD auditado, `evaluateCeilings` no verificaba `schemaVersion`: un ancla
sin campo, con `null`, `999`, `"1"` u otra versión podía compararse como si el
gate entendiera su formato.

Durante la reauditoría apareció un arreglo no ratificado en el worktree que:

- fija `CEILINGS_SCHEMA_VERSION = 1`;
- falla cerrado tanto al leer como al reanclar;
- prueba missing, `null`, `999`, string, cero, boolean y versión distinta;
- conserva los 77 techos reales.

Clasificación: defecto confirmado en HEAD; corrección observada en worktree,
pendiente de la ratificación normal del programa. Esta reauditoría no editó esos
archivos.

## 3. `app-platform` tiene una migración mayor que RC-09

La DS local 2.19.36 ya no exporta:

- `./commercial`;
- `./dist/platform.css`;
- `./dist/commercial.css`.

`app-platform` sigue fijado a 2.19.35 y contiene 53 líneas de import en 49
archivos desde `@rottay/design-system/commercial`, además de CSS y aliases hacia
artefactos retirados. La mayoría de símbolos tiene export canónico nuevo, pero
`ProductWindow` pasó a showroom y `TreeView` cambió de identidad. El verifier
local falla hoy:

```text
USE_LOCAL_DS=true node scripts/verify-local-ds.mjs
```

Por tanto el lote previo a publish/repin debe ser cross-repo e incluir imports
JS, sustituciones, CSS, aliases y verifier. Cambiar sólo `globals.css` no basta.

El enlace local de Evnto no es accidental: `USE_LOCAL_DS`, `dev:local-ds` y
`scripts/link-local-ds.mjs` lo gobiernan explícitamente.

## 4. Cascada: el número 2169 no significa lo que Cloud afirma

Se reprodujo el output histórico:

```text
2169 names still unwired of 4373
```

Pero el instrumento clasifica fallbacks, no productores ni alcance a una raíz
canónica. Su propia definición histórica incluye raíces posicionales. Los
instrumentos actuales y accionables son:

- `root-membership`: 1.610 canales emitidos, 881 con raíz y 729 sin atribuir;
- `channel-liveness`: 407/440 LIVE, 33 no-LIVE, 48 findings.

El checkpoint que dice 49 findings está stale por uno. La acción correcta es
clasificar esos universos con evidencia causal, no abrir una cola de 2.169.

## 5. Divergencia y evidencia visual

La divergencia léxica se reprodujo desde Git, sin usar el snapshot Cloud:

```text
origin/main: 1238 / 3571 = 34,668 %
HEAD:        1240 / 3598 = 34,464 %
```

Es una comparación de sets de declaraciones presentes en tres artefactos, no
de computed styles, pares estático/DB ni percepción. Sirve como señal gruesa.
No permite atribuir causalidad a lotes diseñados para cero delta.

Las capturas sighted sí sostienen dos hechos:

- BitHire y el tenant DB conservan mucha composición/anatomía compartida y
  cambian principalmente paleta/fuente;
- PageShell a 390 px colapsa y requiere una regresión browser dirigida.

Esto justifica adelantar F4C; no prueba que deba descartarse la arquitectura.

## 6. Controles y último kilómetro

La compilación reproducida confirma:

- `shape.button-style` emite sólo `--ds-radius-button` para sharp/soft/pill;
- Button pinta con canales por tamaño y no lee ese dial;
- `flat` y `soft` de elevación no emiten variables; `elevated` sólo emite 1–3;
- `controls-catalog --check` queda verde porque el testigo de button-style
  apunta a otro canal.

El microfix Cloud es vacuo: `--ds-button-md-radius` ya está definido en base y
artefacto, por lo que siempre gana antes de llegar a un fallback hacia
`--ds-radius-button`.

También se verificó que `recipes.profile` se pierde en
`CodeOwnedGovernedBehavior`. En cambio, anatomía no está ausente: BitHire usa la
proyección DB en SSR/cliente y `BITHIRE_ANATOMY_ATTRIBUTES` para el brazo
estático. La deuda es consolidar la autoridad y obtener paridad.

## 7. Corrección de las métricas DB/editor

El 72,6 % Cloud mezcla ausencia de valor con inaccesibilidad. Sobre 7.933
keypaths posibles, 5.187 nunca tienen valor en ningún vertical. El universo
definido es 2.746; 1.439 no viajan por el contrato DB (52,4 %).

Incluso esa proporción no es una métrica de aceptación: el contrato DB es un
overlay fail-closed y bounded, no una serialización total del Theme code-owned.
Debe decidirse por capacidad qué necesita autoría DB.

Los conteos de la schema avanzada sí reproducen (2.212 hojas, 2.080
`visual-value`, 1.875 chrome, cero `editorMetadata`), pero describen leaves, no
diales públicos. El problema accionable es metadata/ergonomía Expert.

## 8. Entrega CSS

Bundle BitHire medido en HEAD:

```text
5.385.897 bytes raw
1.043.235 bytes gzip
35,45 % de bytes de comentarios
```

Aplicando el minificador que ya usa Next/Webpack en producción:

```text
3.052.989 bytes raw
344.492 bytes gzip
```

Conclusión: minificar el dist sigue siendo saludable para paquete, DX y
consumidores no-Next; no es el ahorro de red bloqueante para estas tres apps que
Cloud calculó sobre el artefacto sin pipeline consumidor. El split por engine
merece un experimento compatible con switching y medición.

## 9. Cadena de evidencia Cloud

La auditoría Cloud no es completamente portable/reproducible:

- varios scripts hardcodean `/Users/daniel/...` y `/private/tmp/...`;
- algunos scripts empaquetados dependen de helpers/intermedios ausentes;
- algunos scripts llamados “read-only” escriben outputs si se ejecutan.

Esto no invalida los resultados que fueron reproducidos desde fuente, pero sí
impide tratar el bundle completo como instrumento durable sin hardening.

La pérdida de memos también estaba sobredimensionada: `docs/evidence/2026-08`
conserva 63 snapshots hash-matched. La cola correcta es reanclar esos 63 y
resolver hasta 36 referencias sin respaldo directo, no asumir 100 pérdidas.

## 10. Tests y estado

En el corte auditado:

- `program-check.mjs`: `CONSTITUTION_READY`;
- barrido reportado por el programa antes de la auditoría: 103 PASS / 0 FAIL;
- gates dirigidos de programa, dist-freshness, CSS source, parity, roots,
  hooks, supplier, GAT-07 y root-membership: verdes en la reproducción del
  brazo independiente;
- estado de aceptación: 0/255 familias y 0/5.100 celdas sighted aceptadas.

Los gates verdes demuestran coherencia con sus leyes actuales; el hallazgo
294/290 demuestra por qué no bastan si la ley compara copias stale en vez de la
fuente.
