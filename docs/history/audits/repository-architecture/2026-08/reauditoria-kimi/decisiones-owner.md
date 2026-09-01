# Decisiones que requieren el criterio del owner (Daniel)

Tres auditorías (Cloud, Codex, esta) coinciden en que estos puntos no puede
resolverlos ningún agente: tocan la constitución del programa, la valla de
push, el modelo de controles o dinero/calendario. Cada uno lleva mi
recomendación y, donde difiero de Codex, la discrepancia explícita.

## D1 · Respaldo del trabajo y CI (RC-01)

Hecho innegable: 672 commits existen sólo en esta máquina desde el 2026-08-03.
La valla "never push" protege a las apps consumidoras de una DS en movimiento;
no fue escrita para prohibir réplicas de respaldo, pero el texto es absoluto.

Opciones:

- **a)** Enmienda escrita: permitir push a `refs/heads/modern-rescue/wip`
  (rama espejo, nunca `main`, jamás publish). Ojo: `ci.yml:3-7` sólo escucha
  `main,develop` — para que CI corra hay que tocar también el workflow.
- **b)** Réplica externa sin push (bundle/bacula del repo a otro disco) + CI
  local equivalente por cohorte.
- **c)** Status quo. No recomendable: un disco muerto borra 25 días.

Mi recomendación: **(a) con las dos piezas** (enmienda + rama en ci.yml).
Coincido con Codex en que ningún agente lo haga sin orden; discrepo de Cloud
en que el push solo basta — sin tocar ci.yml no enciende nada.

## D2 · Denominador Expert: 294 vs 290 (hallazgo Codex, verificado por mí)

`program/index.json:65`, README, `customization-model/index.json`, `rounds/index.json` y
`program-check.mjs` exigen 294; la fuente viva publica 290
(`manifest/controls/token-overrides.json:65` lo declara) y el commit
`dcadb84743` retiró 4 canales muertos deliberadamente. `program-check` queda
verde comparando copias stale entre sí.

Decisión: corregir la constitución a 290 y añadir a `program-check` igualdad
exacta contra `TENANT_THEME_OVERRIDE_TOKENS` (fuente viva, no copias). Es una
edición T-1: requiere orden explícita + corrida de `program-check.mjs` y su
test antes y después.

Mi recomendación: **hacerlo primero que cualquier lote de producto** — un
checker que compara copias es exactamente el defecto que RC-10 denuncia.
Sin discrepancia con Codex; Cloud no lo vio.

## D3 · Commit del fix schemaVersion ya escrito en el worktree

El gate de techos de public-entrypoint aceptaba anclas con `schemaVersion`
ausente/null/999 en HEAD; el arreglo (fail-closed en lectura y escritura, con
tests que cubren undefined/null/999/"1"/0/2/true) ya existe en el worktree,
**mezclado con cambios ajenos en `producers.json`**.

Decisión: autorizar el commit de ese lote acotado (y exigir que se separe de
`producers.json`). Mi recomendación: autorizar. Coincido con Codex
("ratificar"); añado el riesgo de pérdida por worktree mixto, que Codex no
mencionó.

## D4 · Lote cross-repo app-platform antes de cualquier publish/repin (RC-09)

DS-side verificado por mí: `dist/` ya no produce `platform.css` ni
`commercial.css`; el commit pinneado por bithire (`a037d3a3c`) no está en
ninguna rama. Codex amplía: 53 imports en 49 archivos desde el entrypoint
`commercial` retirado y verifier local roto (no verificable desde este repo,
pero consistente).

Decisión: alcance y ventana explícitos del lote (imports JS, CSS, aliases,
verifier) + rama `release/2.19.37` anclando `a037d3a3c` antes del GC. Mi
recomendación: **es el ítem más urgente de todos** — el próximo repin rompe la
app en producción. Sin discrepancia con Codex; Cloud lo subestimó.

## D5 · Seis diales nuevos y fusiones (RC-07 / Ola 3 de Cloud)

Cloud propone `focus.identity`, `control.size`, `surface.material`,
`shape.geometry`, `surface.depth`, `type.weight` + fusionar
`families→pairing` y `radius-scale→geometry`. La constitución fija 13 Standard
+ 7 Pro y prohíbe nombres propuestos junto a controles equivalentes; Codex
veta asumirlos y yo lo suscribo.

Decisión del owner: adjudicar nombre a nombre (¿entra? ¿qué retira? ¿stops?),
sabiendo que cada uno exige migración atómica con retiro del predecesor. Mi
recomendación: **no abrir ninguno antes del slice F4C** — si el slice prueba
que los diales actuales sí mueven pintura cuando se cablean, varios de los 6
pierden justificación. Discrepo de Codex en prioridad, no en fondo: su Bloque 0
los aplaza sin fecha; yo los condiciono explícitamente al resultado del slice.

## D6 · Scope surface/instance ("una card en una página") (RC-04 / Ola 4)

Los 22 capabilities son `scope: 'tenant'`; `DensityScope` y `profileOverrides`
existen sin consumidores en apps. Cloud quiere `scope: surface|instance` en el
registro; Codex advierte que mezcla mecanismos que la constitución separa
(theme controls vs recipes/anatomy vs instance APIs).

Decisión del owner: si el pedido "esta página/esta card" entra al modelo y por
cuál mecanismo. Mi recomendación: **explotar primero lo ya construido**
(montar `densityScopeAttributes` en las ~30 surfaces que ya resuelven
`profileDefaults` y documentar `profileOverrides` como vía oficial) antes de
ampliar el registro. Es la opción más barata y no compromete el modelo.
Coincido con Codex en el freno; discrepo en que hay un paso intermedio que su
propuesta no nombra.

## D7 · Instrumento canónico de cascada (RC-03)

`cascade-wiring-ratchet` dice 2.169/4.373; Codex cita `root-membership`
(729 sin atribuir) y `channel-liveness` (33 no-LIVE). Yo reproduje el 2.169 y
no pude correr los otros dos (vedado por el owner en esta sesión).

Decisión: qué instrumento clasifica la deuda de cascada y con qué
denominador. Mi recomendación: **una corrida de reconciliación de los tres
clasificadores sobre el mismo universo, antes de abrir cualquier cola de
drenaje**. Sin esto, la Ola 2 de Cloud gasta 5-10 días sobre un mapa
posiblemente falso. Discrepo de ambos en la urgencia: Cloud quiere drenar ya,
Codex quiere clasificar con sus instrumentos sin demostrar que el ratchet
viejo miente; primero la reconciliación, después la cola.

## D8 · Secuencia del próximo tramo

Cloud: Olas 1-2 (última milla + drenaje) antes que F4C. Codex: Bloque 0
(instrumentos) → Bloque 1 (defectos causales) → slice F4C.

Mi recomendación, que discrepa de ambos en el orden:

1. D2 + D3 (instrumentos que pueden mentir: denominador Expert, schemaVersion,
   testigo de button-style) — horas, no días.
2. Defectos causales con delta visible: `shape.button-style` por derivación
   real (no fallback), `recipes.profile`, PageShell a 390 px.
3. Slice F4C de 6-8 familias insignia con captura A/B 390/768/1280 light/dark
   — **antes** del drenaje de cascada (Cloud lo pone después; sin evidencia
   visible primero, el drenaje no tiene criterio de aceptación de producto).
4. Reconciliación de cascada (D7) y recién entonces drenaje.
5. D4 (app-platform) en cuanto haya ventana de publish/repin — no espera a la
   secuencia anterior si un repin se acerca.

## Lo que ninguna auditoría debe decidir

- Reducir el denominador F9 (5.100 celdas) por aceptación de representantes.
- Cambiar el límite Standard/Pro o el máximo de 15 Standard.
- Ampliar el contrato DB con ramps/chrome crudos sin análisis de demanda del
  editor.
- Cualquier push, publish o repin.
- Tocar los roles: Kimi K3 DT, Fable 5 auditor único, Codex consultor
  read-only. (Esta consultoría fue pedida por el owner y no crea asiento.)
