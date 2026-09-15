# D6-2c-i — Debrief de revisión focal: textura descartada en silencio por value-safety

Autor: claude-admin (implementador D6-2c-i). Para: revisión focal (Codex + Fable + DT). Ruta elegida por el DT: (i) ampliar el allowlist de value-safety.

**Estado 2026-09-15 (post-revisión): Codex ACCEPT + Fable ACCEPT con la unión de guardarraíles; lote `lot-d6-2c-texture-kernel.md` EJECUTADO en el worktree (sin commits).** Correcciones de cita adoptadas de los dos veredictos:

- El emisor real NO es `chrome-variables/index.ts:1588` (esa línea es un comentario sobre la rejilla classic del page-shell). Los emisores son las filas de motivo de `packages/core/src/foundation/tokens/ts/presentation/expressive-profiles/expansion/index.ts`: `micro-grid` (:361-364, dos capas de `repeating-linear-gradient`, 329 chars) y `pinstripe` (:365-368, una capa; hoy ningún documento first-party la selecciona, por eso el censo contó un canal). El deriver `derivation/expressive` declara el canal en su `produces`; el documento de bithire selecciona el motivo en `presets/verticals/bithire/document/index.json:55`; la fila del catálogo `profiles.expressive` declara el fan-out.
- El canal tiene lectores reales: `presentation/components/semantic-surface/index.css:70` (`--_surface-texture: var(--ds-material-canvas-texture, none)`) y `presentation/components/patterns/index.css:19` (`--ds-workspace-shell-overlay: var(--ds-material-canvas-texture, transparent)`). La caída era pérdida de pintura, no vocabulario muerto.
- Root fix ejecutado = cerrar la CLASE: el kernel exporta `ALLOWED_VALUE_FUNCTIONS` (con los dos nombres) y admission importa ese conjunto y borra su copia. Un solo origen para las dos puertas.

## 1. La asimetría exacta

Dos allowlists de funciones CSS conviven en el pipeline de tema y no coinciden:

| Puerta | Owner | Qué hace con `repeating-linear-gradient` |
|---|---|---|
| Admisión (ingreso del documento) | `packages/core/src/infrastructure/compilers/runtime/theme/facade/foundation/admission/runtime/limits/index.ts:62` | La ADMITE por nombre (está en la lista de funciones permitidas del documento). |
| Emisión (ensamblado del CSS) | `packages/core/src/infrastructure/compilers/kernel/foundation/css/value-safety/index.ts:35-74` `ALLOWED_VALUE_FUNCTIONS` | La RECHAZA: la lista contiene `linear-gradient`, `radial-gradient`, `conic-gradient` y no contiene ninguna variante `repeating-*`. `isSafeCssValue` exige que toda función del valor esté en la lista (`index.ts:156-158`), y `admitCssVariables` omite el canal entero. |

Los emisores de la textura son las filas de motivo `micro-grid` (`expansion/index.ts:361-364`) y `pinstripe` (`:365-368`) de los perfiles expresivos, que el deriver `derivation/expressive` proyecta al canal. Es decir, el compilador admite la decisión, la expande, y su propio ensamblador la descarta. (Cita original a `chrome-variables:1588` corregida: esa línea es un comentario.)

El descarte no deja rastro: `emitDeclarations` (`runtime/theme/runtime/emission/index.ts`) llama `admitCssVariables` y emite sólo lo admitido; no hay log, no hay canal de evidencia, y el artifact generado simplemente no declara el canal. Hasta hoy nadie lo vio porque los BrandThemes autoraban la textura de bithire como un `radial-gradient` literal, que sí está admitido.

## 2. Censo medido (2026-09-15, compile neutro + preset)

- bithire, `compileThemeIntent(staticThemeIntent("bithire"), { baselineSource: "neutral-preset" })`: 1747 canales compilados, 1746 emitidos por `emitDeclarations`. Descartado: exactamente uno.
- Canal: `--ds-material-canvas-texture`.
- Valor compilado (íntegro):
  `repeating-linear-gradient(0deg, color-mix(in srgb, var(--ds-color-text-primary) calc(2% * var(--ds-effect-intensity, 1)), transparent) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, color-mix(in srgb, var(--ds-color-text-primary) calc(2% * var(--ds-effect-intensity, 1)), transparent) 0 1px, transparent 1px 24px)`
- Resultado en el artifact regenerado `facade/artifacts/bithire/index.css`: 0 ocurrencias del canal (grep). `first-party-artifacts-parity` lo reporta como `MISSING from artifact` (única falla de paridad de bithire bajo el compile neutro).
- rottay y evnto: 1590 compilados, 1590 emitidos, sin descartes (no autoran textura).
- Sonda reproducible: `scratchpad/probe-admit.mjs` (compila, pasa por `emitDeclarations`, resta nombres).

## 3. Diff aplicado (la unión de guardarraíles)

Kernel `value-safety/index.ts`: `ALLOWED_VALUE_FUNCTIONS` pasa a `export const`, agrega EXACTAMENTE `repeating-linear-gradient` y `repeating-radial-gradient` (`repeating-conic-gradient` fuera a propósito, ningún emisor la produce). Admission `runtime/limits/index.ts`: borra su `const ALLOWED_VALUE_FUNCTIONS = new Set([...])` (34 nombres) e importa el conjunto del kernel (`@/infrastructure/compilers/kernel/foundation/css/value-safety`, dirección facade → kernel ya legal en el archivo). Medición previa al cambio: admission − kernel = {repeating-linear-gradient, repeating-radial-gradient}; kernel − admission = ∅; tras el cambio las dos puertas leen el mismo objeto de 34 nombres.

Ninguna otra regla tocada (guardarraíl Codex-1): `STRUCTURAL_BREAKOUT`, `FORBIDDEN_TOKENS`, `MAX_VALUE_LENGTH` (512), escaneo de balance/comillas y el chequeo de funciones sobre el valor completo, intactos.

Tests agregados en `value-safety/tests/index.test.ts` (Fable-2/3 + Codex-2): positivos con los valores REALES de `micro-grid` y `pinstripe` leídos del owner de expansión (no copiados), un `admitCssVariables` que muestra `--ds-material-canvas-texture` intacto, `repeating-radial-gradient` admitido; negativos: `url(x)` dentro de un repeating gradient rechazado a cualquier profundidad, `repeating-conic-gradient` rechazado (pinea la exclusión deliberada); single-source: admission importa la tabla del kernel y no declara ninguna propia (assert sobre la fuente), y las dos puertas responden igual para cada nombre de la tabla y para uno fuera de ella.

## 4. Argumento de seguridad

- Misma clase que `linear-gradient`, ya admitida: `repeating-*-gradient` son las mismas funciones de imagen generada con la única diferencia de repetir las paradas de color. Toman los mismos argumentos (ángulo o posición, paradas de color y longitudes) y no aceptan URLs, identificadores externos ni cadenas.
- No habilita `url()`, `attr()`, `image()`, `image-set()`, `src()`, `element()` ni ninguna carga externa: esos nombres siguen fuera del allowlist y `isSafeCssValue` rechaza el valor entero si aparecen como función, en cualquier nivel de anidamiento (`matchAll` sobre todo el valor).
- No abre un vector de escape de la declaración: `;`, `}`, `<`, `>`, `[`, `]`, `\` siguen prohibidos por `STRUCTURAL_BREAKOUT`, y `FORBIDDEN_TOKENS` (expresiones, `javascript:`, `@import`, etc.) sigue intacto.
- El valor tiene que seguir balanceado y sin control chars; el escaneo no cambia.
- La evidencia de que el guard no se debilita en la práctica: la ampliación admite exactamente 1 canal más en los tres artifacts de primera parte (censo §2) y 0 en los fixtures de tortura si se repite la sonda sobre ellos (recomendado como paso de la revisión).

## 5. Consecuencia

- `first-party-artifacts-parity` de bithire deja de reportar `--ds-material-canvas-texture: MISSING`; el artifact regenerado lo declara y la textura de rejilla que el preset decide llega al DOM.
- El descarte silencioso queda cerrado para esta clase: lo que admisión admite, emisión emite. La asimetría residual (cualquier otra función admitida por `admission/runtime/limits` y ausente en `ALLOWED_VALUE_FUNCTIONS`) se puede cerrar con un test cruzado que compare ambas listas; lo propongo como seguimiento, no como parte de este diff.
- Impacto en pins: al aplicarse, los tres artifacts se regeneran (bithire cambia en 1 canal; rottay y evnto no cambian), `artifact-coverage` de bithire puede subir en las lecturas de ese canal (medir y re-pinear en ese commit), y `theme-parity` no cambia de bucket (el canal ya estaba emitido en el BrandTheme anterior con otro valor).

## 6. Alternativas consideradas y rechazadas

- (ii) Cambiar la textura del preset (o del deriver) a una función admitida: sería un cambio visual del kit para satisfacer un instrumento; la decisión de diseño del preset es de la vertical, no del allowlist. Rechazada.
- (iii) Excluir el canal del pin de paridad: esconde un descarte real y deja al kernel descartando decisiones admitidas sin que ningún gate lo vea. Rechazada.
- (iv) Emitir un aviso en `emitDeclarations` cuando descarta: útil como instrumento, pero no resuelve la asimetría; puede acompañar al seguimiento del test cruzado.

## 7. Estado

- Worktree: diff de §3 aplicado (kernel + admission + tests), sin commits. La regeneración de artifacts y la verificación de que `first-party-artifacts-parity` de bithire pasa sin exclusiones las hace el build serializado del DT (guardarraíl Codex-3).
- Reproducción del descarte previo: `node --input-type=module --eval "$(cat evidence-d6-2c-i/probe-admit.mjs)" "$PWD"` desde `packages/core` (imprime compiladas/emitidas/descartadas y el valor).
- Seguimiento registrado en WO-DER-06 (fuera de este lote): test cruzado admission↔emisión como instrumento general y aviso de `emitDeclarations` al descartar.
