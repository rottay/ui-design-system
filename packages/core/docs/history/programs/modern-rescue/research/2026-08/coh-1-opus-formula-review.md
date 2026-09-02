# COH-1 - Revision arquitectonica OPUS: formula de derivacion de tints status

**Fecha:** 2026-08-30 - **Rol:** OPUS (revision arquitectonica), READ-ONLY
**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system`
**Control:** `palette.status-seeds` (`packages/core/manifest/controls/palette.status-seeds.json`)
**Insumo revisado:** `packages/core/docs/history/programs/modern-rescue/research/2026-08/coh-1-status-tints.md`
**Unico archivo escrito:** este informe.

---

## 0. ADVERTENCIA DE BANCO: el arbol de trabajo esta contaminado

Antes de cualquier medicion. `git diff --stat` en el momento de esta revision:

```
packages/core/src/foundation/tokens/css/facade/artifacts/bithire/index.css  | 30 ++++----
packages/core/src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts |  2 +-
packages/core/artifacts/generated/css/verticals/bithire/index.css                                           | 30 ++++----
packages/core/artifacts/generated/css/all-verticals/index.css                                             | 30 ++++----
packages/showroom/src/app/probe/ds-reference/ground/index.tsx              | 68 +++++++------
```

El diff del brand-theme es exactamente la **mutacion de fase D del canary F4C, sin
revertir**:

```
-  successColor: "#327CA8",
+  successColor: "#7C3AED",
```

Consecuencias operativas, todas bloqueantes para COH-1:

1. El enunciado del encargo cita `bithire/index.ts:3456` con `#327CA8`. En el arbol
   vivo esa linea es `:3456` con `#7C3AED`. **El valor pristino es `#327CA8`** y esta
   solo en `HEAD`. Toda cifra de este informe se midio con `git show HEAD:<path>`,
   nunca contra el working tree.
2. Los tres artifacts modificados (`artifacts/bithire/index.css`, `styles/bithire.css`,
   `styles/index.css`) son **build output de la mutacion**, no del baseline. Cualquier
   `--source-digest` o gate `lint:artifacts` corrido ahora certifica el arbol mutado.
3. La fase E (revert + rebuild + captura byte-identica a A) **no se cerro**. COH-1 no
   puede abrir su write-set sobre un canary a medio correr: el primer `pnpm -C
   packages/core build` de COH-1 mezclaria su delta con el residuo de fase D y ninguna
   de las dos evidencias quedaria atribuible.

> **Accion previa exigida (P0, antes de tocar una linea de COH-1):** cerrar F4C fase E
> -- revertir `successColor` a `#327CA8`, rebuild, capturar fase E, verificar E == A
> byte a byte -- o descartar la corrida y restaurar los cuatro archivos a `HEAD`. Sin
> `git stash` (ley del owner) y sin `git checkout --` sobre directorios.

Todo lo que sigue asume el arbol en `HEAD`.

---

## A. Veredicto por canal y por modo

### A.0 El hallazgo que reordena la adjudicacion: el precedente citado esta roto

La propuesta 1 se apoya en un precedente doble: `default.css` y **evnto dark**. El
segundo **no sostiene la formula, la desmiente aparentemente** -- y al abrirlo resulta
que la formula es correcta y el defecto es otro. Cadena medida:

- evnto dark declara `--ds-color-success-bg: var(--ds-color-success-50)`
  (`brand-themes/evnto/index.ts:217`, artifact `evnto/index.css:556`).
- El bloque dark del artifact emite, de toda la rampa success, **un solo paso**:
  `--ds-color-success-900: #DFFFE4` (`evnto/index.css:555`). No emite `-50`.
  Medicion: `awk 'NR>487' evnto/index.css | grep -o -- "--ds-color-success-[0-9]*:"`
  devuelve exactamente `-900`.
- Por tanto, en dark, `var(--ds-color-success-50)` resuelve contra el bloque base
  (light): `--ds-color-success-50: #F5FFF6` (`evnto/index.css:193`).
- Ground dark de evnto: `--ds-color-bg-primary: #131210` (`evnto/index.css:525`).

**El pozo success de evnto en dark es `#F5FFF6` -- blanco -- sobre `#131210`.** Defecto
vivo, hoy, en `HEAD`.

La causa **no es la formula**. El overlay dark de evnto autora `ramps.success` con los
pasos 50..800 **copiados literalmente del bloque light** y **omite el 900**
(`brand-themes/evnto/index.ts:286-296`: `50: "#F5FFF6" ... 800: "#002B0E"`, sin `900`).
El unico paso que la derivacion calcula libremente es el 900, y **se invierte
correctamente**: light `#001204` (`evnto/index.css:198`) frente a dark `#DFFFE4`
(`:555`). Es decir:

> `deriveTenantColorRamps` **si** es consciente del modo y produce el paso correcto.
> Lo que rompe evnto dark es una rampa **autorada ciega al modo** que pisa la
> derivacion correcta en 9 de 10 pasos.

**Consecuencia para la adjudicacion.** La formula `-bg = var(--ds-color-{tone}-50)` queda
**exonerada** y confirmada. Pero se aprende una ley que la propuesta del DT no enuncia y
que hay que escribir en el lote:

> **Ley del ancla de rampa.** `var(--ds-color-{tone}-50)` solo es un pozo valido en el
> bloque donde ese `-50` **se deriva del seed de ese bloque**. Un `-50` autorado ciego
> al modo convierte la formula en un canal de propagacion del defecto, no en su cura.

### A.1 `-bg` : ACEPTADA sin cambios de forma

**Forma exacta a emitir:** `var(--ds-color-{tone}-50)` (cadena literal, no resuelta).

Que la cadena `var()` sobrevive la compilacion verbatim ya esta pineado:
`brand-authored-residue-retirement.test.ts:1094` afirma
`dark!.cssVariables["--ds-color-success-bg"]` es `"var(--ds-color-success-50)"`.

Precedentes validos (no el de evnto dark):
- `foundation/themes/default.css:252,254,256,258` -- los cuatro defaults de `:root` ya
  son exactamente esa forma.
- rottay light: `-bg = rgba(22, 163, 74, 0.06)` (`rottay/index.css:1489`) y
  `-50 = rgba(22, 163, 74, 0.06)` (`:1483`). **Identidad byte a byte.**

### A.2 `-border` : ACEPTADA sin cambios de forma

**Forma exacta:** `color-mix(in srgb, var(--ds-color-{tone}) 20%, transparent)`.

Es la unica forma con precedente autorado literal y pasante:
`brand-themes/evnto/index.ts:1901-1916` -> `evnto/index.css:130,143,200,220` verbatim.
Y coincide byte a byte con rottay light: `-border = rgba(22, 163, 74, 0.20)`
(`rottay/index.css:1490`) con seed `#16A34A` = rgb(22,163,74) (`:1478`).

**Rechazo del ancla `-500` que propuso el scout.** El scout (§4.1, §5.2) propone anclar
el borde al paso `-500` "porque los literales foundation estan clavados al 500". El dato
del scout es correcto pero la inferencia no. Medicion en `default.css`:

| canal `:root` | valor | paso equivalente | `--ds-color-{tone}` es |
|---|---|---|---|
| `--ds-color-success-border` (`:253`) | `rgba(34,197,94,0.2)` | success-**500** (`#22c55e`, `:70`) | `-600` (`:182`) |
| `--ds-color-warning-border` (`:255`) | `rgba(245,158,11,0.2)` | warning-**500** (`#f59e0b`, `:85`) | `-600` (`:183`) |
| `--ds-color-error-border` (`:257`) | `rgba(239,68,68,0.2)` | error-**500** (`#ef4444`, `:100`) | `-400` (`:184`) |
| `--ds-color-info-border` (`:259`) | `rgba(59,130,246,0.2)` | info-**500** (`#3b82f6`, `:115`) | `-400` (`:185`) |

El ancla `-500` en foundation **es residuo de un re-nivelado documentado**, no un
diseno: `default.css:175-181` explica que el canal se movio por medicion APCA
("Both fixes land on the 600 step") y quedo en 600/600/400/400. Los literales de borde y
alpha se quedaron donde estaba el canal **antes** del movimiento. Anclar la ley nueva a
ese residuo seria fosilizar un accidente.

Contra-evidencia decisiva de que el ancla correcta es el **seed**: en bithire light el
paso `-500` de warning es `#8E5F00` (`bithire/index.css:376`) -- marron oscuro -- frente
al seed `#D6A04E` (`:370`). Un borde `-500 @ 20%` pintaria marron sobre un pozo ambar.
El ancla seed da `rgba(214,160,78,0.20)`, que es lo que el vertical quiso decir.

### A.3 `alpha-{tone}-*` : AJUSTADA en dos puntos

**Forma exacta:** `color-mix(in srgb, var(--ds-color-{tone}) 10%, transparent)` y
`... 20%, transparent)`.

**Ajuste 1 - el ancla es el seed, no el paso `-500`.** Mismo argumento que A.2, con
evidencia adicional: rottay, el unico vertical que autora alphas, las ancla al **seed**,
no al `-500`.

| | seed | alpha autorada | paso `-500` |
|---|---|---|---|
| rottay light success | `#16A34A` = rgb(22,163,74) (`rottay/index.css:1478`) | `-10: rgba(22,163,74,0.08)` (`:1398`), `-20: rgba(22,163,74,0.14)` (`:1399`) | `#22C55E` (`:1484`) |
| rottay dark success | `#22C55E` = rgb(34,197,94) (`:423`) | `-20: rgba(34,197,94,0.18)` (`:327`) | `#16A34A` (`:429`) |

En ambos modos la alpha lleva los componentes del **seed** y el `-500` es otro color. La
casa ya decidio; el ancla seed hace ley lo que rottay practica.

**Ajuste 2 - `--ds-color-alpha-info-20` NO se emite.** El scout escribe la familia como
`alpha-{tone}-{10,20}` y anota que `alpha-info-20` "no existe". No es una ausencia: es
una **retirada ejecutada**. `residual-adjudication.json` -> `entries` ->
`--ds-color-alpha-info-20`: `"decision": "RETIRE_PROPOSED", "executed": true`,
`"emittedBy": []`. Emitirlo desde el piso **resucitaria un canal retirado** y contradiria
la ley de retiros del programa.

> Radio final de la familia alpha: **7 canales**, no 8 --
> `alpha-{success,warning,error}-{10,20}` + `alpha-info-10`.

### A.4 `-ink` : NO TOCAR. Confirmado

`default.css:480-483` ya deriva del canal (`--ds-color-success-ink = color-mix(in srgb,
var(--ds-color-success) 60%, var(--ds-color-neutral-900) 40%)`), con la autoridad
declarada `tinted-well-tone-ink` (`capabilities/index.ts:1018-1031`) y el flip dark por
construccion pineado en `tone-ink-authority.test.ts`. **Sigue al seed hoy.** Correcto
excluirlo.

Medicion de contraste del par ink/pozo en el caso que mas se mueve (bithire light
success). Ink = mix(`#327CA8` 60%, `#191919` 40%) = `#28546F`.

| pozo | contraste WCAG con `#28546F` |
|---|---|
| hoy `#f0fdf4` (verde legacy) | 7.75:1 |
| tras COH-1 `#F0F9FF` (`-50` del seed) | 7.61:1 |

**Sin regresion de contraste** (ambos AAA para texto grande, AA holgado para normal). El
`inkTrap` de `residual-adjudication.json` sigue respetado: no se reusa
`--ds-color-on-{tone}`, que es ink de solido.

### A.5 Modo: el piso NO se puede acotar a light, y no hace falta

Trampa del encargo. `compileTheme` re-entra por bloque con la paleta fusionada del modo
(`brand-theme/index.ts:852-855`: "A mode overlay re-enters this function with its own
merged palette"). **Un piso en el compilador dispara en los dos bloques**; no existe
"emitir solo en light" sin un guard por modo, y un guard por modo seria una derivacion
que responde distinto segun el modo, es decir una segunda autoridad disfrazada.

No hace falta, porque el techo autorado absorbe dark casi por completo. Movimiento real
en dark, enumerado y cerrado:

| vertical/modo | canal | hoy | tras el piso | clase |
|---|---|---|---|---|
| rottay dark | `-bg`,`-border` de los 4 tonos | autorados (`rottay/index.css:434,435,...`) | sin cambio (techo gana) | CERO-DELTA |
| rottay dark | `alpha-{success,warning}-20` | autorados 0.18 (`:327,328`) | sin cambio | CERO-DELTA |
| rottay dark | `alpha-success-10` | no autorado; hereda foundation `rgba(34,197,94,0.10)` | seed `#22C55E` @10% = `rgba(34,197,94,0.10)` | **CERO-DELTA byte** |
| rottay dark | `alpha-warning-10` | hereda `rgba(245,158,11,0.10)` | seed `#F59E0B` @10% = `rgba(245,158,11,0.10)` | **CERO-DELTA byte** |
| rottay dark | `alpha-error-10` | hereda `rgba(239,68,68,0.10)` | seed `#F87171` @10% = `rgba(248,113,113,0.10)` | delta minimo |
| rottay dark | `alpha-info-10` | hereda `rgba(59,130,246,0.10)` | seed `#60A5FA` @10% = `rgba(96,165,250,0.10)` | delta minimo |
| bithire dark | `-bg`,`-border` 4 tonos | autorados (`bithire/index.css:1338,1339,1396,1397,...`) | sin cambio | CERO-DELTA |
| bithire dark | 7 alphas | heredan foundation | siguen al seed dark | correccion (coherencia de hue sobre `#0f1520`) |
| evnto dark | `-bg` 4 tonos | `var(--ds-color-{tone}-50)` autorado | el piso emitiria la **misma cadena** | CERO-DELTA |
| evnto dark | `-border` | hereda la formula light autorada | sin cambio | CERO-DELTA |
| evnto dark | 7 alphas | heredan foundation | siguen al seed | correccion |

**Total de movimiento dark no cubierto por techo autorado: 2 canales en rottay**
(`alpha-error-10`, `alpha-info-10`), ambos de `#EF4444`->`#F87171` y `#3B82F6`->`#60A5FA`
a 10% de alfa. Recomendacion: **aceptarlos y enumerarlos**, no autorar literales muertos
para taparlos (autorar seria ir contra el programa de drenaje). Son estrictamente mas
correctos: pasan de la foundation al seed dark propio de rottay.

### A.6 Donde vive cada emision - resolucion del "foundation vs compilador"

**Veredicto: la derivacion vive SOLO en el compilador. `default.css` no se toca.**

El scout propone (§5.2) reescribir `default.css:253-259` y `:197-203` a formulas.
**Rechazado**, por tres razones medidas:

1. **No es cero-delta.** Con el ancla seed (la correcta, A.2/A.3), los ocho literales de
   `:root` cambian, porque el canal es `-600/-600/-400/-400` y los literales estan en
   `-500` (tabla de A.2). Se cambiaria un default global no scopeado para cero ganancia
   funcional.
2. **No hace falta.** El defecto que COH-1 cierra es *"el seed no propaga"*. En `:root`
   **no hay seed**: es precisamente el caso sin autor. El piso del compilador cubre el
   100% de los scopes con seed (vertical y tenant DB). Foundation no queda fuera de la
   ley: queda fuera del **dominio** de la ley.
3. **Ensancha el radio del lote gratis.** `modern-tenant-value-free.test.ts:238-246`
   allowlistea `default.css :: #f0fdf4 / #fef2f2 / #fffbeb` con una justificacion escrita
   ("claimed by two verticals each, `palette.{success,error,warning}BgColor`"). Tocar
   `default.css` obliga a re-adjudicar esa entrada en el mismo lote.

Reparto final, sin solapamiento:

| condicion del scope | productor | cita |
|---|---|---|
| no hay seed de ese tono | literales de foundation | `default.css:197-203` (alphas), `:252-259` (bg/border) |
| hay seed y el campo no esta autorado | **piso nuevo del compilador** | `deriveStatusTintFloor`, merge en `brand-theme/index.ts:864` |
| hay seed y el campo esta autorado | `setExtendedPaletteVariables` (techo) | `brand-theme/index.ts:610-630`, invocado en `:865` |

**Sitio exacto del merge.** Inmediatamente antes de `setExtendedPaletteVariables(vars,
bt.palette)` (`brand-theme/index.ts:865`), en la misma posicion que ya ocupa
`Object.assign(vars, deriveExtendedPaletteFloor(effectivePrimary))` (`:864`). La ley ya
esta escrita ahi y se hereda sin enmienda: *"derivation is the floor, authored is the
ceiling, and it is never the other way around. Precedence is per channel"*
(`:643-648`).

**Guard obligatorio (ley del ancla de rampa, A.0).** `deriveStatusTintFloor` emite el
`-bg` de un tono **solo si el bloque que compila lleva el seed de ese tono**, que es la
misma guarda `if (seed)` que usa todo el resto de la familia (`:846-851`). Esto tiene el
efecto correcto sobre evnto dark: su overlay no declara seeds status, el piso no dispara,
y el lote **no propaga** el defecto de la rampa ciega al modo. Ese defecto se reporta
aparte (§F).

---

## B. Autoridad por caso, sin doble autoridad

### (i) Nadie autora

Un solo productor por scope, con condiciones **disjuntas**:

- Sin seed -> foundation `default.css` (literales). Es el default del sistema, no una
  derivacion; no hay seed del que derivar.
- Con seed -> `deriveStatusTintFloor` en el compilador.

No es doble autoridad porque las condiciones no se solapan: el piso solo existe donde hay
seed, y donde hay seed el bloque del compilador gana la cascada sobre `:root` por
especificidad de selector (`:is(html[data-tenant='x'], ...)` vs `:root`).

### (ii) El vertical autora literal

`setExtendedPaletteVariables` (`brand-theme/index.ts:610-630`) sobrescribe **por canal**
(el bucle escribe `vars[variable] = value` cuando el string existe). El piso queda
debajo. Precedencia por canal, no por familia: bithire puede retirar `successBgColor` y
conservar `warningBgColor`, y cada canal resuelve por su lado.

**Esto es lo que hace que el bug de bithire NO se arregle solo.** El piso no puede tocar
un canal autorado -- es la ley correcta. La correccion de bithire **exige retirar los
literales del TS**, no anadir codigo al compilador. El compilador aporta el destino; el
brand-theme aporta el hueco.

### (iii) El tenant DB autora el seed

La puerta `appearance.general.palette.status.{tone}` confluye a `BrandPalette.{tone}Color`
**antes** del lowering unico (`compilers/composition/tenant-theme/migrate-v1/index.ts:402-423`),
asi que el piso dispara con el seed del tenant sin emisor paralelo. Pero si el vertical
baseline autora el literal, el **techo del vertical le gana al seed del tenant** -- que es
exactamente la inversion `BASELINE_LEAF` > `TENANT_DERIVED` que el programa ya adjudico
como defecto de white-label (`brand-theme/index.ts:1614-1622`).

Se cierra replicando `applyTenantSeedDerivations` (`:1645-1670`) con sus tres guardas
(provenance, shadowing leaf, `bakesItsOwnColor`).

> **DEFECTO en el plan del scout (§5.1b): NO extender `SEED_SHADOWING_FIELDS`.**
>
> El scout propone anadir `palette.{tone}{Bg,Border}Color` y `palette.alpha{Tone}{10,20}`
> a `SEED_SHADOWING_FIELDS`. Eso rompe un invariante pineado. La tabla se documenta como
> *"exactamente la union de lo que `derivePrimarySemantics` y `deriveInteractionFloor`
> emiten para un seed, y un test lo afirma"* (`brand-theme/index.ts:1563-1567`), y el
> test lo cierra como complemento:
>
> ```ts
> const SEED_FAMILY = Object.keys(SEED_SHADOWING_FIELDS);            // :120
> expect([...Object.keys(BITHIRE_SEED_DERIVED), ...BITHIRE_SEED_INHERITED].sort())
>   .toEqual([...SEED_FAMILY].sort());                               // :213-215
> ```
> (`compilers/composition/tenant-theme/tests/provenance-acceptance.test.ts`)
>
> Los canales status no los emite ninguno de esos dos owners y **no derivan del seed
> primario**: derivan de cuatro seeds distintos. Meterlos en la misma tabla vuelve falsa
> la documentacion, rompe la cerradura de `:213-215` y obliga a la fixture de la familia
> primaria a absorber canales ajenos.
>
> **Correcto:** una tabla hermana `STATUS_SEED_SHADOWING_FIELDS` (11 canales por tono
> segun A.3) y un `applyTenantStatusSeedDerivations` propio, con provenance por tono
> (`palette.status.{tone}` autorado por el tenant). Dos familias de seed, dos tablas, un
> mismo rango de rangos `PRODUCER_RANK`.

Orden de autoridad resultante, identico al ya vigente para primary:
`TENANT_LEAF > TENANT_DERIVED > BASELINE_LEAF > floor > foundation`.

---

## C. Clasificacion por vertical

Regla del lote: cero-delta se exige; correccion visual debe ser explicita y pequena.
Todos los valores desde `git show HEAD:.../artifacts/<v>/index.css`.

### C.1 rottay -- CERO-DELTA (salvo 2 canales dark enumerados)

Rottay autora `-bg`, `-border` y las alphas en los dos modos, y sus literales **ya son
su propio seed con alfa**. El techo los conserva intactos.

| canal | light (`:1478-1490`) | dark (`:423-435`) | tras COH-1 |
|---|---|---|---|
| `-bg` | `rgba(22,163,74,0.06)` | `rgba(34,197,94,0.10)` | sin cambio (autorado) |
| `-border` | `rgba(22,163,74,0.20)` | `rgba(34,197,94,0.22)` | sin cambio (autorado) |
| `alpha-*-10/20` | autoradas 0.08/0.14 (`:1391-1401`) | `-20` autorada 0.18 (`:322-328`) | sin cambio |

Movimiento total: `alpha-error-10` y `alpha-info-10` **en dark unicamente** (tabla A.5).
**Recomendacion: no tocar rottay.** Es su direccion de arte y la propuesta 4 la preserva
correctamente.

### C.2 evnto -- CERO-DELTA en border; CORRECCION MINIMA opcional en bg; CORRECCION en alphas

`-border` light: los cuatro literales autorados **son exactamente la cadena que emitiria
el piso** (`evnto/index.ts:1901-1916` -> `evnto/index.css:130,143,200,220`). Retirarlos es
**cero-delta demostrable byte a byte**, y es la retirada mas limpia de todo el lote:
elimina cuatro literales sin mover un pixel.

`-bg` light -- si se retiran los literales:

| tono | hoy | derivado (`-50`) | fuente |
|---|---|---|---|
| success | `#f0fdf4` | `#F5FFF6` | `evnto/index.css:199` -> `:193` |
| warning | `#fefce8` | `#FFFBF7` | `:219` -> `:213` |
| error | `#fef2f2` | `#FFFBFA` | `:129` -> `:123` |
| info | `#f8fafc` | `#FAFCFF` | `:142` -> `:136` |

Cuatro correcciones minimas, misma familia de tono, delta sub-perceptual. **Recomendacion:
retirarlos** -- son literales tailwind genericos que no expresan direccion de arte propia
(evnto ya expreso la suya derivando los bordes).

`alpha-*` light: ninguna autorada -> hoy heredan foundation. Tras el piso siguen al seed.
La unica visible: **info**, cuyo seed evnto es slate `#475569` (`:131`) y hoy pinta el azul
foundation `rgba(59,130,246,...)`. Pasa a `rgba(71,85,105,...)`. **CORRECCION intended**:
el info de evnto ES slate, y hoy su alpha lo desmiente.

`-bg` dark: `var(--ds-color-{tone}-50)` autorado == cadena del piso -> CERO-DELTA.
(El defecto de §A.0 persiste y se reporta aparte; COH-1 no lo crea ni lo cura.)

### C.3 bithire -- CORRECCION VISUAL intended (el delta del lote)

Seeds light pristinos: success `#327CA8` (`bithire/index.css:350`), warning `#D6A04E`
(`:370`), error `#C5504C` (`:277`), info `#3A6FB0` (`:290`).

| canal | ANTES | DESPUES | clase |
|---|---|---|---|
| `success-bg` | `#f0fdf4` (verde) `:361` | `#F0F9FF` (`-50`, `:355`) | **CORRECCION MAYOR - el bug** |
| `success-border` | `rgba(5,118,66,0.25)` (verde) `:362` | seed @20% -> `rgba(50,124,168,0.20)` | **CORRECCION MAYOR - el bug** |
| `warning-bg` | `#fffbeb` `:381` | `#FFF6EA` (`:375`) | menor, misma familia |
| `warning-border` | `rgba(231,163,62,0.25)` `:382` | `rgba(214,160,78,0.20)` | menor |
| `error-bg` | `#fef2f2` `:288` | `#FFF5F4` (`:282`) | menor |
| `error-border` | `rgba(204,16,22,0.25)` `:289` | `rgba(197,80,76,0.20)` | menor |
| `info-bg` | `#f0f7ff` `:301` | `#F3F8FF` (`:295`) | menor |
| `info-border` | `rgba(10,102,194,0.25)` `:302` | `rgba(58,111,176,0.20)` | menor |
| `alpha-success-10/20` | `rgba(34,197,94,.10/.20)` (verde foundation) | `rgba(50,124,168,.10/.20)` | **CORRECCION MAYOR** |
| `alpha-warning-10/20` | `rgba(245,158,11,...)` | `rgba(214,160,78,...)` | menor |
| `alpha-error-10/20` | `rgba(239,68,68,...)` | `rgba(197,80,76,...)` | menor |
| `alpha-info-10` | `rgba(59,130,246,...)` | `rgba(58,111,176,...)` | menor |

Nota sobre el 0.25 -> 0.20 de los bordes: los cuatro bordes de bithire bajan 5 puntos de
alfa ademas de cambiar de hue. Es consecuencia de adoptar la formula unica de la casa
(20%, el valor de evnto y rottay light). Delta pequeno y deliberado; hay que decirlo en el
asiento, no dejarlo implicito.

**Chrome de input (adyacente, decidir explicitamente).** `bithire/index.ts:6751` y `:6756`
cuecen otro verde: `successBorder: "#2F8B68"` y
`successBg: "color-mix(in srgb, #2F8B68 4%, #FFFFFF)"`. El overlay dark del mismo control
ya usa `var(--ds-color-success)` (`bithire/index.css:1476`). Es **el mismo bug de clase**
que el `-bg` verde, en la familia chrome. **Recomendacion: incluirlo** -- dejarlo fuera
deja bithire light con un input verde junto a un badge azul, que es peor que el estado
actual (hoy al menos ambos son verdes). Si el owner prefiere acotar, debe quedar escrito
como deuda nominada, no omitido.

### C.4 Tenants DB -- CORRECCION (cierre del defecto de white-label)

Hoy, un tenant que autora `palette.status.success`: el `-border` y las alphas **nunca**
siguen su seed (siempre foundation), y el `-bg` sigue el literal del baseline cuando el
vertical lo autora (bithire, rottay). Tras (i)+(iii) los tres siguen el seed del tenant.
Cero cambios de documento y cero migracion: la puerta ya confluye antes del lowering.

---

## D. Blast radius

### D.1 Censo de lectores (medido, excluyendo artifacts)

`grep -rho "var(--ds-color-<canal>" packages/core/src --include='*.css' --include='*.tsx' --include='*.ts' | grep -v artifacts/`

| canal | sitios | | canal | sitios |
|---|---|---|---|---|
| `--ds-color-success-bg` | 15 | | `--ds-color-alpha-success-10` | 8 |
| `--ds-color-success-border` | 10 | | `--ds-color-alpha-success-20` | 1 |
| `--ds-color-warning-bg` | 10 | | `--ds-color-alpha-warning-10` | 2 |
| `--ds-color-warning-border` | 9 | | `--ds-color-alpha-warning-20` | 1 |
| `--ds-color-error-bg` | 10 | | `--ds-color-alpha-error-10` | 3 |
| `--ds-color-error-border` | 11 | | `--ds-color-alpha-error-20` | 1 |
| `--ds-color-info-bg` | 23 | | `--ds-color-alpha-info-10` | 2 |
| `--ds-color-info-border` | 13 | | | |

Total: 101 sitios de lectura en 20 archivos de produccion.

### D.2 Familias consumidoras

- **modern skin:** `badge.css` (`:396,403,410,412,417`), `shift-matrix.css`
- **presentation skin:** `record-workbench.css:95`, `cell-renderers.css`,
  `export-button.css:50`, `guided-draft-form.css`, `chart-heatmap.css`,
  `surface-states.css`
- **rustic skin:** `alert.css`, `message.css`, `toast.css`, `live-feed.css`
- **foundation:** `base/shadows.css`
- **estampado inline (TSX/TS, fuera de CSS):** `Toast/contracts/index.ts:611-634`
  (8 lecturas), `charts/families/heat-map/index.tsx:28`,
  `chart-engine/.../renderers/heat-map/index.tsx:26`,
  `map-view/engines/classic/index.tsx:64,102`,
  `live-feed/engines/classic/index.tsx:111`

> **CORRECCION al scout (§3).** El scout lista `badge.css:396,403,417` como lectores de
> `-bg` e implica simetria entre los cuatro tonos. Es falso para **error**: `badge.css:410`
> lee `--ds-color-alpha-error-10` **directamente, sin `-bg`**, y `:411` lee
> `--ds-color-error-700`, **no `-ink`**. Consecuencia util: `badge-error` es la unica fila
> que prueba la propuesta 3 (alphas) de forma aislada, porque no puede moverse por `-bg`.

### D.3 Segundo autor a limpiar: `brand-studio`

`ui/patterns/customization/brand-studio/index.tsx:101-110` estampa inline un
`SEMANTIC_GROUND` que declara **a la vez el seed y el `-bg`**, con una **tercera formula**
(seed al 12%):

```ts
'--ds-color-success': '#16a34a',
'--ds-color-success-bg': 'rgba(22, 163, 74, 0.12)',   // ni -50 ni 20%: 12%
```

Su comentario (`:95-97`) lo justifica como andamio de preview porque *"el compilador emite
solo los overrides que un tema fija"*. **Esa premisa deja de valer** en cuanto el piso
emita `-bg` para todo seed autorado. Los cuatro `-bg` del scaffold pasan a ser
redundantes-o-divergentes. **Deben entrar en el write-set**: retirar las 4 entradas `-bg`
y dejar solo los 4 seeds.

### D.4 Tests que rompen (rutas verificadas)

| archivo:linea | pin | accion |
|---|---|---|
| `foundation/tokens/__tests__/brand-authored-residue-retirement.test.ts:1053` | rottay `-bg` = `rgba(34,197,94,0.10)` | **no rompe** (rottay conserva autorado) |
| idem `:1064` | bithire `-bg` = `#f0fdf4` | **ROMPE** -> `var(--ds-color-success-50)` |
| idem `:1084` | evnto `-bg` = `#f0fdf4` | **ROMPE si se retira** -> `var(--ds-color-success-50)` |
| idem `:1094` | evnto dark `-bg` = `var(--ds-color-success-50)` | no rompe (misma cadena) |
| idem `:263-264,287-288,313` | listas de canales `-bg`/`-border` | revisar cohorte |
| idem `:75` | `--ds-color-alpha-info-20` en lista de retirados | **verificar que sigue retirado** (guarda de A.3) |
| `foundation/tokens/__tests__/mass-c3-bithire-drain.test.ts:79,727` | `--ds-badge-success-bg` chrome | revisar (adyacente) |
| `foundation/tokens/__tests__/modern-tenant-value-free.test.ts:238-246` | allowlist `default.css :: #f0fdf4/#fef2f2/#fffbeb` justificada por `palette.*BgColor` de bithire+evnto | **la justificacion queda obsoleta** al retirar esos campos; re-adjudicar el comentario |
| `compilers/composition/tenant-theme/tests/provenance-acceptance.test.ts:120,213-215,260` | cerradura `SEED_FAMILY` | **ROMPE si se extiende `SEED_SHADOWING_FIELDS`**; no rompe con tabla hermana (ver B.iii) |
| `foundation/tokens/css/foundation/themes/tests/tone-ink-authority.test.ts` | inks light byte a byte | **no rompe** (no tocamos `default.css`) |
| `ui/primitives/display/Badge/tests/Badge.labelled-chrome.test.tsx`, `Badge.rustic-engine-advanced.test.tsx` | leen la familia | verificar |
| `ui/patterns/visualization/charts/tests/Heatmaps.correctness.test.tsx` | `--ds-color-info-bg` | verificar |

Tests **nuevos** exigidos: §E.1.

### D.5 Gobernanza: `declaredOutputs` SI debe ensancharse, y arrastra dos artefactos

Estado actual, verificado: `capabilities/index.ts:855-861` declara la exclusion
**explicitamente**:

> *"`--ds-color-{tone}-bg` / `-border` (y `--ds-color-info-ink`) estan deliberadamente
> EXCLUIDOS: pertenecen a `EXTENDED_PALETTE_CHANNELS` (:493-517) ... Ningun SEED status
> los alcanza."*

Tras COH-1 la ultima frase es **falsa**. Ensanchamiento requerido:

- `capabilities/index.ts` `derivedChannels` (`:862+`): +8 (`-bg`,`-border` x4) +7 (alphas
  segun A.3) = **+15 canales**, de 68 a **83**. `--ds-color-info-ink` **sigue excluido**
  (autoridad `tinted-well-tone-ink`, A.4). Reescribir el comentario `:855-861`.
- `manifest/controls/palette.status-seeds.json`: `declaredOutputs.channels` **y**
  `calibration.channels` (dos listas, hoy identicas -- ambas de 68).
- **`semanticOwner.registryDigest`** (`:11`). No es cosmetico: lo calcula
  `manifest/generator/index.mjs:257` como `sha256(readFileSync(REGISTRY_SOURCE))` sobre
  `capabilities/index.ts`. **Editar `capabilities/index.ts` staleza el digest del
  manifest**, y el manifest se regenera por `pnpm ... manifest` (modo `--check` en
  `generator/index.mjs:918`). Orden obligatorio: editar capabilities -> regenerar
  manifest -> recien entonces emitir receipts.
- **`f4c-canary-capture.mjs`**: el harness lee la lista del disco
  (`CONTROL_MANIFEST_RELPATH`, `:200`) y viaja el sha256 en el receipt, asi que se
  actualiza solo. Pero `UNDECLARED_CHANNELS_WATCHED` (`:205-213`) queda **vacio de
  proposito** -- sus 7 canales pasan a ser declarados -- y
  `DECLARED_PARTIAL_PROPAGATION` (`:219-235`) queda **falso**: sus dos entradas dicen que
  `badge-success` y `workbench-status-success` pueden NO seguir al seed. Tras COH-1 deben
  seguirlo. **Ambas constantes entran en el write-set.**

> **Riesgo de orden (ley "receipts se emiten ultimos").** El manifest esta en los
> `sourceFiles` de los receipts. Toda edicion de manifest staleza **todos** los receipts
> cerrados del control. Congelar el write-set completo -- capabilities, manifest, harness,
> compilador, brand-themes, tests -- **antes** de emitir el primer receipt.

---

## E. Plan de verificacion

### E.1 Unitarios nuevos

**T1 - el piso, por tono y por ausencia** (junto a `brand-authored-residue-retirement.test.ts`):
- paleta sintetica con `successColor` y **sin** `successBgColor` =>
  `cssVariables["--ds-color-success-bg"] === "var(--ds-color-success-50)"`;
  `-border === "color-mix(in srgb, var(--ds-color-success) 20%, transparent)"`;
  `alpha-success-10/20 === "color-mix(in srgb, var(--ds-color-success) {10,20}%, transparent)"`.
- **sin** `successColor` => los cuatro canales **ausentes** (`toBeUndefined`). Prueba la
  guarda `if (seed)`.
- con `successBgColor` autorado => gana el literal y `-border`/alphas **siguen derivados**.
  Prueba la precedencia **por canal**, no por familia.
- `--ds-color-alpha-info-20` **ausente** en todos los casos. Guarda de la retirada (A.3).

**T2 - re-derivacion tenant** (en `provenance-acceptance.test.ts` o hermano):
- documento DB con `appearance.general.palette.status.success` sobre baseline bithire
  => `-bg`/`-border`/alphas llevan el seed del tenant, no el literal del baseline.
- tenant que autora ademas `palette.successBgColor` => TENANT_LEAF gana (guarda 2).
- valor que no cuece color (`var(...)`) => se conserva (guarda 3, `bakesItsOwnColor`).
- compilacion first-party pura => **cero bytes movidos** (guarda 1).
- **cerradura**: `Object.keys(STATUS_SEED_SHADOWING_FIELDS)` == union de lo que
  `deriveStatusTintFloor` emite, con la misma forma de aserto que `:213-215` -- y
  `SEED_FAMILY` **sin cambios**, probando que no se contamino la familia primaria.

**T3 - cero-delta de evnto border** (el aserto mas barato y mas fuerte del lote):
retirar los 4 `*BorderColor` de evnto y afirmar que las 4 cadenas emitidas son
**identicas** a las de `HEAD`. Cero-delta demostrado por construccion.

**T4 - `:root` congelado**: afirmar que `default.css:197-203` y `:252-259` **no
cambiaron** (digest o pin literal). Cierra la decision A.6 con un gate, no con prosa.

**T5 - contraste ink/pozo** en bithire light: par (`--ds-color-success-ink` computado,
`--ds-color-success-bg` computado) >= 4.5:1. Medido hoy: 7.61:1 (A.4).

### E.2 F4C focal

Precondicion no negociable: **cerrar o descartar la fase D en curso** (§0) y re-anclar la
fase A sobre el arbol limpio. Sin eso, A no es baseline.

Matriz completa A->E segun `artifacts/quality/programs/modern-rescue/cascade-proofs/controls/palette-status-seeds/pre-derivation-five-phase-canary/README.md`.
Filas focales, elegidas para que cada propuesta tenga al menos un testigo **y** al menos
un control negativo:

| fila (id en `f4c-canary-capture.mjs`) | canal que la mueve | prueba |
|---|---|---|
| `badge-success` (`:438`) | `-bg` + `-border` + `-ink` | **propuesta 1 y 2**; pasa de NON-MOVER pre-declarado a MOVER |
| `workbench-status-success` (`:580`) | `-bg` (`record-workbench.css:95`) | **propuesta 1**; la segunda entrada de `DECLARED_PARTIAL_PROPAGATION` |
| `badge-error` (`:450`) | **solo** `alpha-error-10` (`badge.css:410`) | **propuesta 3 aislada** -- no puede moverse por `-bg` (D.2) |
| `badge-warning` (`:457`) | `warning-bg` | propuesta 1, segundo tono |
| `feedback-alert-{success,warning,error,info}` (`:627-648`) | rustic `alert.css` `-bg`/`-border` | cobertura cross-engine (rustic, no solo modern) |
| `tag-success` (`:464`), `tag-error` (`:478`) | chrome adyacente | detecta si el chrome `--ds-tag-*` queda desincronizado |
| `result-success-well` (`:367`) | `--ds-tint-success-8` | **control negativo**: ya declarado, debe moverse por el seed y **no** por COH-1 |
| `timeline-success` (`:705`) | seed directo | **control negativo**: ya MOVER antes y despues |
| `cockpit-info` (`:507`) | `info-bg` (23 lectores, el canal mas leido) | maxima superficie |

Legs a correr: **D/E** (mutacion del seed estatico de bithire + revert, que es el leg que
prueba la cascada vertical completa) y **B/C** (seed DB, que prueba (iii)). A y C/E deben
volver byte-identicos.

### E.3 Gates mecanicos

```
pnpm -C packages/core build            # build:vertical-artifacts + build:css
pnpm -C packages/core lint:artifacts   # frescura de los 3 artifacts (package.json:706-707)
pnpm -C packages/core structure:check
# manifest --check DESPUES de capabilities, ANTES de receipts (D.5)
```
Recordatorio de la ley de frescura: calcular el `--source-digest` **fuera de banda**; la
lista de `sourceFiles` de un artifact viejo esta incompleta porque el conjunto crece.

---

## F. Riesgos y alternativas rechazadas

### F.1 Riesgos

1. **BLOQUEANTE - arbol contaminado por F4C fase D** (§0). Ya descrito. Es el riesgo
   numero uno porque contamina la evidencia, no solo el codigo.
2. **Defecto colateral descubierto, NO cubierto por este lote: evnto dark pinta pozos
   blancos.** `ramps.{success,warning,error,info}` del overlay dark
   (`brand-themes/evnto/index.ts:286-296` y hermanos) copian los pasos 50..800 del bloque
   light y omiten el 900. El 900, unico paso derivado, si invierte correctamente
   (`#001204` light vs `#DFFFE4` dark). Resultado: `-bg` dark = `#F5FFF6` sobre ground
   `#131210`. **Lote hermano, no este.** La cura es retirar la rampa autorada ciega al
   modo, no cambiar la formula. Debe quedar asentado antes de que alguien "arregle" el
   sintoma cambiando el ancla del pozo y rompa los tres verticales.
3. **El piso no puede acotarse a light** (A.5). Enumerados los 2 canales dark de rottay
   que se mueven. Si el owner exige cero-delta dark estricto, la unica salida limpia es
   posponer las alphas a un sub-lote; autorar literales para taparlos va contra el drenaje.
4. **Bordes de bithire bajan 0.25 -> 0.20.** Delta de alfa ademas del de hue. Explicito en
   C.3; debe estar en el asiento del commit.
5. **`brand-studio` como segundo autor** (D.3). Si se olvida, la preview del theme builder
   pintara seed@12% mientras produccion pinta `var(-50)`: un falso-verde de canary y un
   reporte de usuario esperando a suceder.
6. **Orden manifest/receipts** (D.5). `registryDigest` se calcula desde
   `capabilities/index.ts`; congelar el write-set antes de emitir.
7. **Semantica alfa vs opaco en los pozos.** Los `-bg` dark de rottay son pozos con alfa
   (0.08-0.10) que compositan sobre cualquier superficie, no solo el ground. `var(-50)`
   la preserva porque el `-50` de rottay tambien es alfa (`rottay/index.css:428,1483`).
   Un pozo opaco (`tint-N` sobre `--ds-color-bg-primary`) la perderia -- ver F.2.3.

### F.2 Alternativas rechazadas

1. **Anclar `-border`/alphas al paso `-500`** (propuesta del scout §4.1/§5.2).
   RECHAZADA. El `-500` de foundation es residuo del re-nivelado APCA documentado en
   `default.css:175-181`, no un diseno. Rompe los tres precedentes autorados vivos (evnto
   borders, rottay alphas light y dark) y produce absurdos: borde marron `#8E5F00` sobre
   pozo ambar en bithire warning. Evidencia completa en A.2/A.3.
2. **Reescribir `default.css` a formulas.** RECHAZADA (A.6): no es cero-delta con el ancla
   correcta, no cierra ningun defecto que el piso no cierre, y arrastra la re-adjudicacion
   de `modern-tenant-value-free.test.ts:238-246`.
3. **Derivar `-bg` desde `--ds-tint-{tone}-8`.** RECHAZADA: `tintStep` mezcla en oklab
   contra `--ds-color-bg-primary` (`brand-theme/index.ts:1472-1474`), produciendo un valor
   **opaco**; destruye los pozos con alfa de rottay dark (F.1.7) y abandona el precedente
   doble del `-50`.
4. **Extender `SEED_SHADOWING_FIELDS` con los canales status.** RECHAZADA: rompe el
   invariante documentado en `brand-theme/index.ts:1563-1567` y la cerradura de
   `provenance-acceptance.test.ts:213-215`. Tabla hermana (B.iii).
5. **Anadir `successInkColor`/`warningInkColor`/`errorInkColor` al contrato.** RECHAZADA:
   los `-ink` ya derivan del canal con autoridad declarada (`capabilities/index.ts:1018-1031`)
   y flip dark por construccion. Serian una segunda autoridad sin consumidor nuevo.
6. **Emitir `--ds-color-alpha-info-20` por simetria.** RECHAZADA: retirada **ejecutada**
   (`residual-adjudication.json`, `"executed": true`, `"emittedBy": []`). La simetria no es
   razon para resucitar un canal retirado.
7. **Re-apuntar los skins a `--ds-tint-{tone}-*` en vez de derivar `-bg`.** RECHAZADA
   (coincido con el scout): 101 sitios de lectura en 20 archivos (D.1), rompe la capa de
   authoring chrome y contradice la ley de un solo productor.
8. **Solo retirar los literales de bithire, sin piso en el compilador.** RECHAZADA: sin
   piso, bithire cae a los literales verdes de foundation (`default.css:253`) y el bug se
   reproduce identico un nivel mas abajo. Los tenants DB quedan sin cura.
9. **Guard por modo en el piso (emitir solo en light).** RECHAZADA (A.5): una derivacion
   que responde distinto por modo es una segunda autoridad disfrazada. El guard correcto es
   por **presencia de seed en el bloque**, que es el que ya usa toda la familia.

---

## VEREDICTO

### FORMULA AJUSTADA

Las cinco propuestas del DT se sostienen en lo esencial. Tres ajustes son necesarios y uno
de ellos es un defecto que habria producido un lote incorrecto.

**ACEPTADAS sin cambio de forma:**
- **(1) `-bg` = `var(--ds-color-{tone}-50)`** -- confirmada; el precedente de evnto dark
  que la sostenia esta roto por otra causa (rampa autorada ciega al modo), y al abrirlo la
  formula queda exonerada, no debilitada.
- **(2) `-border` = `color-mix(in srgb, var(--ds-color-{tone}) 20%, transparent)`** --
  confirmada; unica forma con precedente autorado pasante y con identidad byte a byte en
  rottay light.
- **(4) el authored gana al derivado** -- confirmada; es la ley ya vigente
  (`brand-theme/index.ts:643-648`), precedencia **por canal**.
- **(5) la correccion del verde legacy de bithire es el delta intended** -- confirmada, con
  la recomendacion de incluir el `#2F8B68` del chrome de input (C.3): dejarlo fuera produce
  un estado peor que el actual.

**AJUSTADAS:**
- **(3) alphas.** El ancla es el **seed**, no el paso `-500`
  (`color-mix(in srgb, var(--ds-color-{tone}) {10,20}%, transparent)`), porque el `-500` de
  foundation es residuo de un re-nivelado APCA y rottay -- el unico vertical que autora
  alphas -- ancla al seed en los dos modos. Y la familia son **7 canales, no 8**:
  `--ds-color-alpha-info-20` es una retirada ejecutada y no se resucita.
- **Sede de la emision.** La derivacion vive **solo en el piso del compilador**
  (`deriveStatusTintFloor`, merge en `brand-theme/index.ts:864`, inmediatamente antes de
  `setExtendedPaletteVariables` en `:865`). **`default.css` no se toca**: con el ancla
  correcta no seria cero-delta, y `:root` es el caso sin seed, es decir fuera del dominio
  de la ley.
- **Guarda nueva (ley del ancla de rampa).** El piso emite el `-bg` de un tono solo cuando
  el bloque que compila lleva el seed de ese tono. Sin esta guarda, la formula propagaria
  el defecto de evnto dark en vez de curarlo.

**DEFECTO corregido en el plan de ejecucion (no en la formula):**
- **No extender `SEED_SHADOWING_FIELDS`** (scout §5.1b). Rompe el invariante documentado en
  `brand-theme/index.ts:1563-1567` y la cerradura de `provenance-acceptance.test.ts:213-215`.
  Va en tabla hermana `STATUS_SEED_SHADOWING_FIELDS` con su propio
  `applyTenantStatusSeedDerivations`.

**Radio de gobernanza:** `declaredOutputs.channels` **si** debe ensancharse, de 68 a **83**
(+8 bg/border, +7 alphas; `--ds-color-info-ink` sigue excluido), en tres artefactos
acoplados -- `capabilities/index.ts:855-861` (comentario y lista), las **dos** listas del
manifest, y el `registryDigest` que `manifest/generator/index.mjs:257` deriva de
capabilities. Con `UNDECLARED_CHANNELS_WATCHED` y `DECLARED_PARTIAL_PROPAGATION` del
harness F4C (`f4c-canary-capture.mjs:205-235`) en el mismo write-set.

**Precondicion bloqueante:** cerrar o descartar la fase D del canary F4C que esta sin
revertir en el arbol de trabajo (§0). COH-1 no abre write-set sobre un canary a medio
correr.
