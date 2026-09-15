# D6-2c-ii-RED — grupo `navfeed` (10 archivos, 23 aserciones del inventario)

Ningún archivo de producto tocado. Sólo los 10 archivos de test asignados.

## Corrección a la política: R1 no es "sin productor"

La política dice que `--ds-focus-ring-color` "no tiene productor". **Medido, es más preciso y menos grave en un vertical y más grave en dos.** La fundación lo declara DOS veces:

- `foundation/themes/default/index.css:816` (scope claro `:root`): `--ds-focus-ring-color: #ECECEC`
- `foundation/themes/default/index.css:2027` (scope oscuro): `--ds-focus-ring-color: var(--ds-color-primary-400)`

Sonda propia, arms `base` vs `palette.seeds.primary = #2F6B9A`:

| vertical | base | con semilla | ¿la semilla lo mueve? |
|---|---|---|---|
| rottay (dark-default) | `#a3a3a3` | `#306B9A` | **sí** |
| bithire (light-default) | `#ECECEC` | `#ECECEC` | no |
| evnto (light-default) | `#ECECEC` | `#ECECEC` | no |

O sea: el alcance SOBREVIVE en un scope oscuro y muere en el claro. El literal claro es un fallback sin tenant, y su propio comentario (líneas 810-815) dice: *"Every first-party tenant re-declares this as var(--ds-color-primary) in its own artifact block (rottay dark/light, bithire, evnto — W8)"*. Los temas autorados lo hacían por `chrome.controls.focusRingColor`, que es el ÚNICO emisor del compilador (`kernel/foundation/css/chrome-variables/index.ts:1998`). Los documentos de preset no lo autoran, así que el vertical claro se queda con el fallback.

Consecuencia que excede la pérdida de alcance: el anillo de bithire mide **1.18:1** contra su propio canvas (`#ECECEC` sobre `#FFFFFF`) y el de evnto **~1.06:1** (`#ECECEC` sobre `#fafafa`), contra el piso de 3:1 que la propia ley del anillo exige.

## Disposición por aserción

### (ii) RE-ANCHORED — `density.mode`, 10 aserciones · causa R4
El arm probaba `'compact'`, que es exactamente lo que el preset de bithire decide, así que sobre bithire la mutación era un no-op. Re-anclado a `'spacious'`, que **ningún** preset decide (dominio `compact | normal | spacious`; rottay y evnto deciden `normal`, bithire `compact`). Misma aserción, misma fuerza, las tres verticales conservadas.

Medición de las dos caras, a nivel de canal (`--ds-density-mode-factor`):

| vertical | base | `compact` (arm viejo) | `spacious` (arm nuevo) |
|---|---|---|---|
| rottay | 1 | 0.85 | 1.15 |
| bithire | **0.85** | **0.85 — idéntico a base** | 1.15 |
| evnto | 1 | 0.85 | 1.15 |

Aserciones cubiertas, con su lectura base de bithire tomada del inventario:
1. `menu > density.mode moves rowHeight and holds rowRadius` — base `35.9531px`
2. `segmented > density.mode moves trackPadding, trackGap, optionPadding, optionGap and holds selectedWeight` — base `2.99…px`
3. `stepper > density.mode moves dotSlotHeight and holds triggerRadius` — base `5.98438px`
4. `pagination > density.mode moves pageHeight and holds edgeRadius` — base `26.9531px`
5. `breadcrumb > density.mode moves crumbHeight and holds crumbRadius` — base `20.9738px`
6. `modal > density.mode moves padding and holds radius` — base `10.1873px`
7. `drawer > density.mode moves padding and holds radius` — base `10.1873px`
8. `alert > density.mode moves padding and holds radius` — base `10.1873px`
9. `notifier > density.mode moves padding and holds radius` — base `10.1873px`
10. `sidebar-surface > density.mode moves gap and holds divider` — base `15.2809px`

### (ii) RE-ANCHORED — `states.emphasis`, 2 aserciones · causa R4
Mismo mecanismo: el arm probaba `'strong'`, la decisión del preset de bithire. Re-anclado a `'subtle'`, que ningún preset decide (dominio `subtle | medium | strong`; rottay y evnto deciden `medium`).

| vertical | base (`press` / `disabledOpacity`) | `strong` (viejo) | `subtle` (nuevo) |
|---|---|---|---|
| rottay | 0.98 / 0.6 | 0.965 / 0.5 | 0.99 / 0.68 |
| bithire | **0.965 / 0.5** | **0.965 / 0.5 — idéntico** | 0.99 / 0.68 |
| evnto | 0.98 / 0.6 | 0.965 / 0.5 | 0.99 / 0.68 |

11. `segmented > states.emphasis moves press and holds optionHeight` — base `matrix(0.965, 0, 0, 0.965, 0, 0)`
12. `modal > states.emphasis moves disabledOpacity and holds radius` — base `0.5`

### (iv) REGISTERED NEW — el anillo de foco, 4 aserciones · causa R1 corregida
13. `modal > palette.seeds moves okBg, focusRing and holds radius` — `focusRing` sale del arm (`okBg` lo mantiene real en las tres verticales).
14. `drawer > palette.seeds moves iconInk, focusRing and holds radius` — ídem con `iconInk`.
15. `notifier > palette.seeds moves edgeInk, focusRing and holds radius` — ídem con `edgeInk`.
16. `alert > palette.seeds moves focusRing and holds warningEdge` — el anillo es su ÚNICO target, así que el arm se conserva donde el alcance es real: `in: ['rottay']`.

El detector no se pierde: `Modal.causality` gana un test **de dos caras** que afirma el mapa exacto `{ rottay: true, bithire: false, evnto: false }` sobre `--ds-focus-ring-color`. Cuando el carril le dé un default claro atado a la paleta, ese test se pone rojo y hay que restituir los cuatro arms. Los otros tres archivos citan ese pin por nombre.

### (iv) REGISTERED NEW — la tinta del menú, 1 aserción · causa R2
17. `menu > palette.seeds moves selectedInk and holds rowRadius` — arm restringido a `['evnto']`, donde sigue moviendo. Se agrega `menu ink provenance under the neutral compile`, que afirma la identidad `--ds-menu-item-color === --ds-sidebar-text` y la inmovilidad de la tinta seleccionada en bithire. Enrojece el día que una tinta de menú deje de ser una tinta de sidebar.

### (iv) REGISTERED NEW — axe, 6 aserciones / 15 hallazgos de scope · causas R2 y R3
**A/B decisivo: en el archivo prístino de HEAD los 40 scopes de las 10 familias auditan LIMPIO.** Ningún hallazgo de este grupo es preexistente; los 15 los causa el lote.

El inventario sólo listaba 6 porque el `for` de la aserción cortaba en el primer scope que fallaba: **9 de los 15 estaban enmascarados** y salen a la luz con el pin por scope.

| familia | scope | hallazgo pineado | HEAD |
|---|---|---|---|
| menu | rottay dark | `color-contrast:3` | limpio |
| menu | bithire light | `color-contrast:4` | limpio |
| menu | bithire dark | `color-contrast:6` | limpio |
| segmented | bithire light | `color-contrast:5` | limpio |
| segmented | bithire dark | `color-contrast:5` | limpio |
| segmented | evnto light | `color-contrast:5` | limpio |
| stepper | bithire light | `color-contrast:3` | limpio |
| stepper | bithire dark | `color-contrast:5` | limpio |
| stepper | evnto light | `color-contrast:3` | limpio |
| pagination | rottay dark | `color-contrast:3` | limpio |
| pagination | bithire light | `color-contrast:1` | limpio |
| pagination | bithire dark | `color-contrast:1` | limpio |
| pagination | evnto light | `color-contrast:1` | limpio |
| breadcrumb | rottay dark | `color-contrast:1` | limpio |
| sidebar-surface | bithire dark | `color-contrast:6` | limpio |

`alert`, `drawer`, `modal` y `notifier` auditan limpio en los cuatro scopes y conservan su `toEqual([])` intacto.

Forma del pin: `expect(findings.map((f) => \`${f.id}:${f.nodes}\`)).toEqual(CONTRAST_GAP[key] ?? [])`. Otra regla de axe, un nodo más, o un scope que hoy está limpio y se ensucie: rojo. El título pasa a `audits clean in every gated vertical mode, apart from the pinned contrast gap` en las seis familias con hueco; las cuatro limpias conservan el suyo.

Ejemplos medidos del par ink/ground (sonda propia sobre `menu`):
- rottay dark: `#f3f4f6` sobre `#f8f8f8` = 1.03:1 (R3, el ground base claro cascadea al bloque oscuro)
- bithire light: `#f5f5f5` sobre `#f9fafe` = 1.04:1 (R2, la tinta del rail inverso sobre el canvas de página)
- bithire dark: `#111827` sobre `#19243a` = 1.14:1

## Registros propuestos (texto exacto para el coordinador)

**WO-DER-06 — anillo de foco sin default claro atado a la paleta**
> D6-2c-ii-RED (2026-09-15): `--ds-focus-ring-color` tiene dos declaraciones en `foundation/themes/default/index.css`: `#ECECEC` en el scope claro (l.816) y `var(--ds-color-primary-400)` en el oscuro (l.2027). El literal claro es el fallback sin tenant, y su comentario declara la premisa que este lote rompió: "Every first-party tenant re-declares this as var(--ds-color-primary) in its own artifact block". El único emisor del compilador es `chrome.controls.focusRingColor` (`chrome-variables/index.ts:1998`), que los documentos de preset no autoran. Medido: la semilla mueve el anillo en rottay (`#a3a3a3` → `#306B9A`, dark-default) y no lo mueve en bithire ni evnto (`#ECECEC` en ambos brazos). Contraste del anillo contra su propio canvas: bithire 1.18:1, evnto ~1.06:1, contra el piso de 3:1. Obligación: un deriver de `palette.seeds`/`states.focus-style` que emita `--ds-focus-ring-color` para el scope claro. Evidencia viva: `Modal.causality > focus ring reach under the neutral compile` afirma `{ rottay: true, bithire: false, evnto: false }` y enrojece cuando el carril cierre el hueco; los arms `palette.seeds` de modal, drawer, notifier y alert deben recuperar `focusRing` en ese mismo lote.

**WO-DER-06 — la tinta del menú es la tinta del sidebar**
> D6-2c-ii-RED (2026-09-15): medido, `--ds-menu-item-color` resuelve a `--ds-sidebar-text` en las tres verticales. Con `navigation.sidebar-tone` decidido por el preset (bithire: `inverse`), un menú montado sobre el canvas de página recibe la tinta del rail inverso (`#f5f5f5`) sobre un fondo claro: 1.04:1, y ninguna semilla de paleta la mueve. A/B contra HEAD prístino: la familia auditaba limpia. Evidencia viva: `Menu.causality > menu ink provenance under the neutral compile`.

**WO-DER-06 / P3#6 — extensión de evidencia del hueco de contraste**
> D6-2c-ii-RED (2026-09-15): 15 hallazgos `color-contrast` en 10 familias de navegación y feedback, los 40 scopes de esas familias LIMPIOS en el archivo prístino de HEAD. 9 de los 15 estaban enmascarados porque la aserción cortaba en el primer scope fallido. Pineados por regla y por cantidad de nodos en cada suite; la tabla completa está en el reporte del grupo `navfeed`.

## Archivos tocados

**Tests (10):** los 10 de `g-navfeed.txt`. **Producto: ninguno.**

## Verificación

| comando | resultado |
|---|---|
| `pnpm vitest run` sobre los 10 archivos | **Test Files 10 passed (10) · Tests 123 passed (123)**, 0 rojos |
| `pnpm exec tsc --noEmit` | 0 errores |
| `pnpm exec eslint` sobre los 10 | exit 0 |

Log: `navfeed-vitest.log`. Las 23 aserciones del inventario quedan cubiertas: 12 (ii), 11 (iv).

Sondas temporales: cuatro, todas borradas (`zzaxe`, `zzring`, `zzaxes` en `menu/tests`, y la instrumentación temporal del bloque axe en los 10 archivos). El archivo prístino de HEAD quedó restaurado a sus bytes de HEAD con `git show`, sin `git restore`.

Fuera de mi radio, en una sola frase: quedó una sonda sin trackear de otro grupo en `src/infrastructure/compilers/composition/tenant-theme/tests/zzrow.test.ts`.
