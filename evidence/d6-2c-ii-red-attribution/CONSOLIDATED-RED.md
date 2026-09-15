# D6-2c-ii-RED — informe de atribución y re-anclaje de los 171 rojos

Sin commits, sin push, sin `git stash`, sin `git restore`. Sellado intacto. `roadmap/**`, el
changeset y las baselines de gates: NO tocados.

## 1. La corrección más importante: la atribución

El brief presentaba los 171 como "los rojos de la suite completa sobre tu árbol 2c-ii". Medimos
cada grupo contra una copia prístina de HEAD (`git archive HEAD`, con los mismos artefactos
byte-idénticos), y el reparto real es:

| origen | aserciones | evidencia |
|---|---|---|
| **preexistentes en HEAD** | ~100 | A/B por grupo, título por título |
| **causadas por el lote** | ~71 | verdes en HEAD, rojas en el árbol |

Los dos bloques que el brief marcaba como sospecha de defecto de producto son **preexistentes**:
- **Clase 7 (nombres de preset obsoletos)**: no hay divergencia producto-roster. El roster no
  asigna recipe profile alguno; sólo el documento de preset de **bithire** decide uno
  (`rottay/technical-sharp@1`), y el bloque runtime del artefacto lo refleja. Los tests nombraban
  los perfiles de los temas AUTORADOS retirados. **No es P0.**
- **Clase 8 (WorkspaceSwitcher)**: no depende de ninguna clave de tema. El motor modern se monta
  con `React.lazy`, así que el primer render de un componente modern en un módulo fresco devuelve
  el fallback vacío. Idéntico en HEAD (1 failed / 17 passed).
- **Clase 3/4/5/6 completas (42 aserciones del grupo compiler)**: idénticas en HEAD. El mecanismo
  que el brief describe es correcto, pero el lote que lo produjo es **D6-2c-i**, no 2c-ii.

## 2. Resultado

| grupo | archivos | antes | después |
|---|---|---|---|
| inputs-a | 12 | 37 rojos | 151 tests, 0 rojos |
| inputs-b | 7 | 28 rojos | 105 tests, 0 rojos |
| navfeed | 10 | 23 rojos | 123 tests, 0 rojos |
| overlay | 16 | 22 rojos | 234 pass / 3 fail (preexistentes, intactos) |
| compiler | 13 | 42 rojos | 458 tests, 0 rojos |
| mine | 16 | 19 rojos | 407 pass / 2 fail (instrumento del coordinador) |

Cero archivos de producto tocados en los cinco grupos delegados; en el mío, cero producto y un
fixture de tortura declarado aparte. Ninguna aserción borrada sin sujeto nombrado, ningún umbral
bajado, ninguna población achicada sin reemplazo más fuerte.

## 3. Los cinco rojos que quedan, y por qué
Ninguno es reparable dentro de las reglas de este lote.

**2 · `probe-roster` (card-modern-md, input-modern-md)** — las fixtures viven en
`scripts/check/tokens/cascade/probe/foundation/roster/index.mjs`, un INSTRUMENTO del coordinador.
Deriva medida y preexistente: el card renderiza `data-posture="phone"` que la fixture no tiene, y
las clases del input pasaron de `rottay-*` a `ds-*`. El propio test imprime la receta de
regeneración.

**3 · `Display1Batch`, `FloatButton`, `SurfacesLongTailBatch`** — preexistentes con A/B, y NO son
el límite lazy: la rama `loading` del Card modern no renderiza `cover`/`skeleton`; el click del
FloatButton no alcanza `window.scrollTo`; el root de `SidebarSurface` no presenta
`[data-collapsed][data-stacked][data-bordered]`. Son recetas que afirman una anatomía que el
componente no entrega. Dueño propuesto: los cortes de familia (WO-EVI-02 base-red, ampliado).

## 4. Los huecos nuevos, medidos con A/B (para que el coordinador los registre)

**N1 · `--ds-focus-ring-color` no tiene productor en el scope claro.** Tres grupos lo midieron por
separado y corrigieron mi enunciado inicial: el canal se declara DOS veces en
`foundation/themes/default/index.css` — `#ECECEC` en `:root` (l.816) y `var(--ds-color-primary-400)`
en el scope oscuro (l.2027). Sólo el segundo sigue la paleta, y la prosa de las líneas 814-815
declara la premisa que el lote rompió: *"Every first-party tenant re-declares this as
var(--ds-color-primary) in its own artifact block"*.

| vertical | HEAD | ahora | canvas | ratio |
|---|---|---|---|---|
| rottay | su primary | `#a3a3a3 → #306B9A` con semilla | `#0b1220` | pasa 3:1 |
| bithire | `#3a6fb0` | `#ECECEC` fijo | `#FFFFFF` | **1.18:1** |
| evnto | `#171717` | `#ECECEC` fijo | `#fafafa` | **1.06–1.13:1** |

Es un fallo de WCAG 2.2 1.4.11 en dos de tres verticales. El remedio es de una línea (derivar el
scope claro como el oscuro) pero mueve `declared-defaults` (proyección generada y gateada) y las
baselines de contraste: **es del coordinador**. El piso 3:1 sigue corriendo sobre rottay; las otras
dos quedan pineadas con su ratio medido, así que enrojecen si mejora o empeora.

**N2 · contraste axe causado por el lote, mucho mayor de lo contado.** La aserción cortaba en el
primer scope fallido, así que el conteo de 26 del brief tapaba el resto. Medido por familia y
scope: navfeed 15 hallazgos sobre 40 scopes (HEAD: 0); inputs-b 21 pares de 28 (HEAD: 0);
inputs-a 34 pares familia-scope. Dos mecanismos:
- el ground base (claro) cascadea al bloque oscuro, porque ningún preset siembra paleta por modo;
- la tinta del menú ES la del sidebar (`--ds-menu-item-color` === `--ds-sidebar-text`), así que con
  `sidebar-tone: inverse` un menú sobre el canvas de página recibe tinta clara: 1.04:1.

**N3 · `palette.neutral-temperature` es inerte.** `deriveNeutralAxis` sólo inclina una rampa
AUTORADA y ningún preset autora rampas. inputs-a lo mide inerte en las tres verticales (en HEAD
movía en dos); inputs-b en las dos claras.

**N4 · otros, con medición en los reportes de grupo**: `shape.control-height` mueve su canal en
bithire y no mueve la caja; el borde de hover del campo iguala el de reposo; el tinte de hover del
toggle iguala el reposo en evnto; `behavior.motion` pierde `entranceDuration`, que era un campo del
tema autorado sin decisión de preset detrás.

## 5. La única clase (iii) de todo el lote
`adapters/tests/index.test.ts`: las celdas `navigation.sidebar-tone` de los tres adaptadores
declaraban 5 canales leídos donde la superficie autorada del modern lee 2. Las otras 3 llegan a
pintura por una cadena `--ds-menu-*` que sólo vive en el artefacto generado, y el instrumento
cuenta CSS autorado por diseño. Corregido sin mover bytes emitidos.

## 6. Reportes por grupo
`inputs-a.md`, `inputs-b.md`, `navfeed.md`, `overlay.md`, `compiler.md`, `mine.md`, todos en este
directorio, con la disposición (i/ii/iii/iv) aserción por aserción, las mediciones de cada par
re-anclado y el texto exacto de registro propuesto.

## 7. Verificación que exige el brief

**1 · los 74 archivos rojos, en una sola corrida:**
```
pnpm vitest run <los 74>
 Test Files  4 failed | 70 passed (74)
      Tests  5 failed | 1478 passed (1483)
```
De **171 rojos en 74 archivos** a **5 rojos en 4 archivos**. Los 5 están enumerados en §3 y ninguno
es reparable dentro de las reglas: 3 son base-red preexistentes con A/B (dueño: los cortes de
familia, WO-EVI-02) y 2 son fixtures de un instrumento del coordinador.

**2 · clase (iii):** una sola, en `adapters/tests/index.test.ts` (§5). Sin cambio de bytes emitidos;
su suite y las de su grupo quedan verdes.

**3 · typecheck:**
```
pnpm exec tsc --noEmit            → 0 errores
pnpm run typecheck:tests          → OK, 0 sobre baseline 0
pnpm exec eslint <219 archivos>   → exit 0, 0 errores
```

**4 ·** no corrí la suite completa, no corrí el build, no toqué gates.

**5 · cero commits:**
```
git log --oneline -1
01b3fa1a1 docs(roadmap): register WO-DER-08 ... (commit del coordinador, no mío)
```
El árbol de trabajo queda sin commitear. Untracked: sólo el changeset y los tres owners nuevos del
lote (`foundation-defaults`, `declared-defaults`, `ingress/foundation/authorship`) más
`draft-carried-leaves.test.ts`. Sin sondas residuales.

## 8. Nota sobre el estado del árbol
Mientras corría este lote, el coordinador ejecutó su cadena post-build: los manifiestos generados
`cascade/{slots,membership,purity}` están regenerados y el ledger de slots re-anclado
(`rows` 3594 → **115**, `rowsWithoutRootAttribution` 1433 → **30**, `expressionsCarryingLiteral`
70 → **0**, `literalPinsOnDeclaredHead` 20 sin mover, y los dos contadores que retiré registrados
en `retired`). El inventario re-apuntado lee por
`dist/index.js#baselineFor + …/intake#readGovernedTheme`, como quedó escrito. Normalización
re-anclada en 4 / 1 / 2.
