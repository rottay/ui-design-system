# Auditoría Codex — Macro-wave K0 + K1

Fecha: 2026-07-23
Estado: **requiere remediación antes de certificación**
Alcance: evidencia K0, 21 familias K1, contratos Modern, white labeling,
i18n/RTL, densidad, suites focales y gates agregados.
Política de esta auditoría: Codex no corrigió código de producto. Los defectos
se devuelven a Kimi para que los repare y demuestre su cierre.

## 1. Veredicto

### K0

- **Densidad y precedencia static/DB:** aceptable a nivel contractual y
  mecánico. La matriz `density-authority` pasó 32/32.
- **Perfiles de receta:** `platform` y `bithire` tienen evidencia suficiente
  para mantener `rottay/technical-sharp@1`.
- **evnto:** el comportamiento fail-safe es correcto, pero K0 no puede
  considerarse visualmente completo para las tres verticales mientras la fuente
  de tema de evnto siga subdeclarando canales de texto/chrome/surface.
- **Taxonomía:** la reconciliación a 93 primitivas gobernadas y 120 artefactos
  totales es utilizable, pero el generador todavía incluye tres elementos que no
  son primitivas certificables. Debe sanearse antes de usar la taxonomía para
  repartir lotes autónomos.

### K1

**No aceptado todavía como lote certificable.**

El volumen implementado es real y la mayoría de las suites focales pasan, pero
hay dos defectos bloqueantes verificables, una afirmación de validación final
incorrecta y una matriz sighted más estrecha que el contrato de aceptación
prometido.

Los porcentajes certificados permanecen en:

- **14/93 primitivas = 15,1%**
- **14/120 artefactos = 11,7%**

Codex no moverá el ledger por batch. Después de la remediación se certificará
familia por familia.

## 2. Hallazgos bloqueantes

### K1-B01 — Input Modern outline pierde toda su pintura en reposo

Severidad: **P0**

En el probe real de Lane B, el `Input` default declara `data-variant="outline"`
pero se ve como texto suelto, sin borde, superficie ni contenedor discernible.
La inspección computada confirma:

- `border: 0px none`
- `background: transparent`
- `box-shadow: none`

La causa está en:

`packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/input.css`

La regla raíz pinta borde/superficie, pero la regla posterior para el control
incluye al mismo nodo cuando el control es un `<input>` standalone:

```css
.rottay-input.rottay-input--modern[data-part='root'] > .rottay-input__control,
input.rottay-input.rottay-input--modern[data-part='root'] {
  background: transparent;
  border: 0;
  box-shadow: none;
}
```

Esto confunde shell y control. El focus halo aparece, pero no repara la ausencia
de affordance en reposo. Bloquea la certificación de `Input` y obliga a
revalidar los compuestos que reutilizan su anatomía.

Condición de cierre:

1. separar contractualmente shell/control para standalone y compound;
2. restituir pintura de cada variant sin duplicar owners;
3. probar rest, hover, focus-visible, error, disabled, readonly y autofill;
4. verificar BitHire, The Management, EN/ES/AR, RTL y 390 px;
5. agregar una prueba de estilo computado que falle si `outline` vuelve a
   quedar con `border-width: 0`.

### K1-B02 — InputAddon viola el piso de especificidad P-48

Severidad: **P0**

Suite reproducible:

```bash
pnpm --filter @rottay/design-system exec vitest run \
  src/ui/primitives/inputs/tests/FieldsBatch.real-engines.test.tsx \
  --reporter=verbose
```

Resultado: **1 test failed / 113 passed**.

Selector infractor:

```css
.rottay-input-addon.ds-input-addon[data-part='root']
```

El test exige `(0,4,0)` para que la pintura de borde no pierda contra el floor
tenant. El diff actual reemplazó el booster contractual
`[data-part='root'][data-part='root']` por una regla de menor especificidad.

La clasificación del handoff como “preexistente” no es evidencia suficiente:
el worktree actual contiene una reescritura sustancial del archivo y el gate
está rojo. Si Kimi sostiene ownership ajeno, debe demostrar el checkpoint exacto
que introdujo el defecto; en cualquier caso la familia no es certificable hasta
que el contrato quede verde.

Condición de cierre:

- corregir la causa sin `!important`, sin ensanchar baseline y sin crear un
  tercer paint owner;
- ejecutar la suite completa de inputs, no solo las suites por nombre;
- sighted de addon solo, compacto, before/after, error y focus-within.

## 3. Hallazgos mayores

### K1-M01 — “validación serial final 9/9 verde” no equivale a árbol relevante verde

Severidad: **P1**

`typecheck`, `pretest`, engine audit y los E2E reportados pasan, pero `pretest`
no incluye `FieldsBatch.real-engines.test.tsx`. La suite completa de inputs
expone el rojo de K1-B02.

La entrega futura debe declarar por separado:

- gates regulatorios;
- suites completas por dominio modificado;
- E2E;
- evidencia visual;
- warnings y skips.

No se permite resumirlos como “todo verde” si cualquiera de esos planos está
rojo o incompleto.

### K1-M02 — La evidencia sighted no cubre la matriz de estados comprometida

Severidad: **P1**

Las capturas cubren fuentes, locales, densidades, desktop/mobile y algunos
estados agregados. No demuestran de manera sighted, por familia:

- hover;
- focus-visible;
- pressed/active;
- reduced motion;
- forced colors/high contrast;
- coarse pointer/touch floor;
- Axe serious/critical en los probes K1.

Los tests de strings CSS no reemplazan evidencia visual de interacción. Para
certificación 10/10 se requiere una matriz mínima deliberadamente acotada pero
completa, no una explosión cartesiana indiscriminada.

### K1-M03 — El propio review mantiene pendientes en familias declaradas listas

Severidad: **P1**

`SIGHTED-REVIEW.md` conserva asuntos abiertos, entre otros:

- Avatar mixed-size/loading;
- Badge solid hover;
- Link standalone touch policy y visited;
- Callout action tray;
- Message positioning;
- Progress fallback de `@property` y gradiente circular.

Un “remaining” puede ser deuda documentada y no bloqueante, pero debe tener
adjudicación explícita. No corresponde proyectar 21 certificaciones mientras
esas decisiones siguen mezcladas con defectos y tareas futuras.

### K1-M04 — Message tiene tres pruebas salteadas, incluida accesibilidad básica

Severidad: **P1**

Pruebas salteadas:

- `auto closes after duration`;
- `destroys all messages`;
- `message has alert role`.

La última es un contrato de accesibilidad, no un nice-to-have. Kimi debe
reactivar las tres o documentar con evidencia causal por qué un contrato fue
reemplazado y dónde quedó cubierto.

### K1-M05 — Result emite warnings de `act(...)`

Severidad: **P1**

Los tests pasan, pero el output de `Result.modern-engine.test.tsx` contiene
warnings de actualización fuera de `act`. Esto reduce la confiabilidad del
harness y puede ocultar estados asincrónicos. Debe quedar limpio antes de usar
la suite como evidencia.

### K1-M06 — No hay evidencia Axe específica de las tres lanes

Severidad: **P1**

El E2E Axe existente cubre galleries flagship, no los probes agregados K1.
Agregar Axe por lane con cero violaciones `serious`/`critical`, y casos de
teclado para controles interactivos.

## 4. Hallazgos de programa que no se atribuyen exclusivamente a K1

### DS-D01 — evnto todavía no es prueba completa de primera parte

Severidad: **P2**

El default seguro evita una rotura, pero la captura `editorial-round` muestra
tab activo oscuro sobre fondo oscuro. El gap de canales de fuente debe tener
owner y ticket; no bloqueará BitHire/TMM, pero sí una afirmación global de
paridad de primeras partes.

### DS-D02 — Taxonomía física y taxonomía gobernada todavía divergen

Severidad: **P2**

El generador cuenta 96 elementos y luego se corrige documentalmente a 93 por:

- `layout/MaterialSurface` vacío;
- `layout/responsive` de soporte;
- `navigation/examples`.

El generador debe expresar la exclusión por regla, no depender de una resta
manual.

### DS-D03 — Gates verdes contienen deuda baselined significativa

Severidad: **P2 / seguimiento**

El engine audit sigue informando, entre otros:

- 1.028 literales hardcoded pendientes;
- 6 pairings APCA bajo umbral;
- canales muertos y excepciones de ownership baselined.

No son regresiones adjudicadas a K1, pero explican por qué “gate verde” no
significa todavía “Design Platform 10/10”. Los ratchets no deben ensancharse y
la macro-wave siguiente debe reducirlos donde toque cada familia.

## 5. Evidencia ejecutada por Codex

En serie, nunca en paralelo:

1. Lane A: **248/248**.
2. Lane B focal: **371/371**.
3. Inputs completos: **1 failed / 1336 passed**.
4. FieldsBatch focal: **1 failed / 113 passed**.
5. Lane C: **291 passed / 3 skipped**.
6. Message focal: **36 passed / 3 skipped**.
7. `engine-audit:check`: exit 0.
8. `typecheck`: exit 0.
9. `pretest`: 14 gates, exit 0, ratchet 4.074/4.074.
10. density E2E: **32/32**.
11. profile E2E: **10/10**.
12. K1 captures E2E: **9/9**.
13. `git diff --check`: limpio.

Inspección de browser:

- divergence BitHire/TMM: confirmada;
- locale ES y RTL AR: confirmados;
- densidad y mobile sin overflow documental: confirmados;
- `Input` outline sin affordance en reposo: confirmado;
- focus halo de `Input`: presente;
- consola del probe inspeccionado: sin errores/warnings.

## 6. Decisión de avance

Es razonable continuar, pero no saltar la remediación.

Orden obligatorio:

1. **R0:** cerrar K1-B01/B02 y M01–M06.
2. **Reauditoría Codex por familia:** mover solo las aprobadas.
3. **K2 + K3:** objetivo mínimo, superar 50% del basket con evidencia.
4. **K4 + tranche P1/P2 seleccionada:** stretch goal, aproximarse o superar
   70% del basket sin autocertificación ni relajación de gates.

Kimi implementa y propone. Codex certifica ledger y porcentajes.
