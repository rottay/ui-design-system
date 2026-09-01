# Evidencia sighted propia del auditor

Capturada por Fable el 2026-08-28 contra el showroom en desarrollo (`pnpm dev` en `packages/showroom`, `:7001`, `dist/` fresco según `build-stamp` 2026-08-28 01:48) con Playwright 1.61.1 headless Chromium. Scripts: `evidencia/scripts/reaud-capture.mjs` (captura + diff de `:root` + estilos computados) y `reaud-overflow.mjs` (elementos que exceden el viewport). Datos crudos: `evidencia/probe.json`, `evidencia/diff-vars.txt`. Capturas seleccionadas en `evidencia/capturas/`.

Matriz: 4 fixtures (`bithire` estático, `themanagementmiami` + `tenantSource=canonical-db`, `rottay`, `evnto`) × 3 escenas (`/probe/whitelabel-torture/scenes/{dashboard,forms,shell}`) × 2 anchos (1280, 390). 24 cargas, 0 errores.

## 1. bithire (estático) vs themanagement (DB) — ¿dos proyectos?

| Medida | bithire | themanagement-db |
|---|---|---|
| `data-tenant` / `data-vertical` | bithire / bithire | themanagement / bithire |
| `data-density` | comfortable | spacious |
| Canales `--ds-*` en `:root` | 1.606 | 1.606 |
| Canales con valor distinto | — | **445 (27,7 %)**, 1.161 iguales, 0 sólo en un lado |
| Fuente de título (computada) | Space Grotesk | Fraunces (serif) |
| Fuente de input | Public Sans | Inter |
| Tamaño base computado | 15 px | 15,6 px (scale 1,04) |
| Card: fondo / radio / sombra | rgb(243,242,239) / 0 px / none | rgb(243,242,239) / 0 px / none |
| Botón: altura / radio / sombra | 32 px / 0 / none | 32 px / 0 / none |
| Input: fondo / radio / altura | rgb(237,243,247) / 8 px / 29 px | rgb(255,255,255) / 8 px / 33 px |
| Sheets / `<style>` | 3 / 2 | 4 / 3 (el artefacto DB embebido) |

Clasificación de los 445 canales que difieren (`diff-vars.txt`): color/paleta/estado ~237 (`color-primary` 13, `color-secondary` 12, `color-{warning,info,error,success}` 35, `border-color` 7…); tipografía ~30 (`font-size` 11, `text-heading` 6, `text-body` 4, `badge-font-family`…); espaciado ~22 (`spacing-component` 9, `spacing-gutter` 5, `divider-spacing` 3…); botón 25 (`button-{xs..xl}-{radius,border-radius,font-size}`, `transition-duration`); superficie/sombra ~16 (`surface-control` 5, `surface-panel` 4, `card-shadow` 4); `density-mode-factor`, `effect-intensity`.

**Lectura.** Los canales difieren en color, tipografía y algunos radios de botón; los valores **computados** de card y botón son idénticos (misma altura, mismo radio 0, sin sombra en ambos) y `data-density: spacious` no movió la altura del botón. En la captura (`dashboard-1280-bithire.png` vs `dashboard-1280-themanagement-db.png`) se ve el mismo producto con serif en los títulos, papel más cálido y tiles de icono grises en vez de azules. Misma composición de widgets, misma anatomía de card, mismos espaciados. **Veredicto: recolor + font swap.** Coincide con B-12 (la identidad del fixture entra por 37 overrides crudos), F-2/B-4 (los `data-anatomy-*` nunca se estampan) y A-1/A-4 (silueta de botón y elevación sin efecto).

Nota de alcance: los selectores de muestreo (`[data-part="card"], .ds-card, [class*="card"]`, `button`, `input`) toman el primer match del documento; la comparación fuerte es la de canales `:root` y la captura, no las 6 muestras.

## 2. Los 4 tenants a 1280 (dashboard)

| Tenant | Modo | Fuente de título | Input radio | Lectura visual |
|---|---|---|---|---|
| bithire | light | Space Grotesk | 8 px | Ledger claro, azul, tiles cuadrados |
| themanagement-db | light | Fraunces | 8 px | Mismo ledger con serif y papel cálido |
| rottay | light | (sin muestra distinta) | — | Mismo esqueleto, gris neutro |
| evnto | **dark** | Outfit | 14 px | El único que se lee como otra dirección de arte: oscuro, radios grandes |

Evnto es hoy el tenant más distinto porque su vertical autora dark + radios 14 px — es decir, por baseline de vertical, no por dial de tenant. Y es el vertical con menos decisiones autoradas (346 vs 1.707/1.510, C-4).

## 3. Mobile 390 px

| Escena | bithire | themanagement | rottay | evnto |
|---|---|---|---|---|
| dashboard | scrollW 391 (1 px, dentro de contenedor con overflow) | 390 ✓ | 392 | 394 |
| forms | 390 ✓ | 390 ✓ | 390 ✓ | 390 ✓ |
| shell | **624** | 390 ✓ (2ª pasada; 650 en la 1ª con `w=360`) | 626 | 390 ✓ |

- **dashboard y forms:** limpias en los 4 tenants; gráficos y leyendas se reacomodan (`dashboard-390-tm-top.png`).
- **shell en bithire (624 px):** `reaud-overflow.mjs` identifica el contenido que excede el viewport: `preview-heading "Live preview on both grounds"`, `action-title "Hostile input check"`, `violation-detail`, `contrast-label` — es la **preview card del propio probe** (brand-studio/torture), no chrome de producto. Se descarta como hallazgo de producto. La inconsistencia entre pasadas para themanagement (650 → 390) sugiere que ese widget se monta tarde; no cerrado.
- **`PageShell` a 390 px (`shell-390-bithire-top.png`):** el slot lateral de "PageShell (no tabs — the bare rule branch)" y el bloque anterior renderizan a ~24 px de ancho y el texto se apila **letra por letra** ("A l l r e c o r d s", "C o n t e n t"). Esto sí es chrome de producto: `PageShell` no colapsa su slot lateral en compact como sí hace `AppShell` (D-33). Registrado como RC-32.

## 4. Tiempos de carga (dev, primera compilación incluida)

Primera carga de cada escena 8-62 s (compilación de Next en dev); cargas siguientes 2-5 s. No es una medida de producción; se registra sólo para constatar que el bundle de 5,4 MB no impidió la captura.

## 5. Qué no cubre esta evidencia

- No es light/dark por tenant (cada fixture cargó en su modo por defecto).
- No cubre estados interactivos (hover/focus/press), RTL ni forced-colors.
- No compara contra la red visual del repo (462 PNG, `test:visual`), que no corrió en CI en 25 días (RC-01) y que yo tampoco ejecuté para no colisionar con la flota activa en el árbol.
- Es el showroom, no una app: la única prueba en app real sigue siendo `app-bithire/tests/e2e/two-systems/divergence.spec.ts` (I-88).
