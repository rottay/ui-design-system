# F4A-1 (parte 2) — El esquema de asignación de variantes + los 6 nudos

DT: Kimi K3. Fecha: 2026-08-20. Insumos: F4A-0 baseline + las 5
adjudicaciones definicionales (parte 1, `/tmp/f4a-1-adjudicaciones-definicionales.md`).

## 1. La decisión central: la FORMA de una asignación gobernada

Tres opciones evaluadas: (a) kit de comentarios libres, (b) archivo de
metadata paralelo, (c) vista generada. **Adjudicación: la asignación vive EN
LA FUENTE del tema como anotaciones estructuradas de vocabulario CERRADO que
el harness parsea mecánicamente** — ni prosa libre (inparseable), ni archivo
paralelo (segunda fuente de verdad = la deriva que todo el programa combate),
ni vista generada como canon (la fuente es el canon; las vistas se generan).

La convención (tags JSDoc cerrados sobre la hoja o la familia):

```
@domicile seed | baseline | derived | pro-expert | unassigned
@governor <nombre del dial | función/raíz citada | razón escrita en una línea>
```

- `seed`: literal legítimo en el punto superior (la ley de hardcodes) —
  `@governor` nombra el tenant-dial que lo gobierna.
- `baseline`: invariante vertical — `@governor` lleva la razón falsable.
- `derived`: internal-head — `@governor` cita la función/raíz de la que deriva.
- `pro-expert`: explícito y acotado — `@governor` nombra la capacidad Pro/Expert.
- `unassigned` (placeholder): la familia/slot existe en el roster canónico y
  este tema no lo asigna — `@governor` dice la capability que gobernaría o
  "none — gap aceptado" + la razón. **Una ausencia nunca es silenciosa.**

Propiedades (todas exigidas por el plan): mismo export
`FirstPartyBrandTheme` (los tags son comentarios — el export no cambia), mismo
lowering (cero cambio en el compilador), artefacto compilado byte-idéntico
(comentarios no emiten), cero segunda foundation (no hay cómputo nuevo en
brand-themes), F4A-2 parsea un vocabulario cerrado (falsable, drill-able),
folder/index intacto.

## 2. Los 4 domicilios aplicados — regla de lectura para los lotes

- `seed` ≈ los 26 tenant-dial actuales + las raíces que F4A autorice (K3).
- `baseline` ≈ invariantes con razón escrita (K5 entra acá).
- `derived` ≈ los 27 internal-head, cada uno con función/raíz citada.
- `pro-expert` ≈ capacidades acotadas declaradas.
- Las 10 `gap` quedan `unassigned` con "gap aceptado" hasta que un tema las
  necesite (decisión 9 del dueño, 2026-08-19).

## 3. Orden canónico + kit de comentarios + mecánica de placeholders

- **Orden canónico**: el orden de las 11 secciones ya es canónico (IDENSITY→
  …→CAPABILITIES); dentro de secciones, el orden canónico de familias =
  alfabético por nombre de familia (criterio único, reproducible, sin juicio).
  Los lotes F4A-3/4 aplican ese orden.
- **Kit de comentarios**: banner de sección único por sección (texto fijo);
  docblock de OVERLAY por modo (el que existe, deduplicado); comentario de
  familia = solo los tags + una línea cuando la familia tiene invariante.
  Nada de prosa narrativa en fuente (la ley de eficiencia del orchestration).
- **Placeholder**: slot presente en el objeto con su comentario
  `@domicile unassigned` + razón — nunca una llave vacía sin texto.

## 4. Los 6 nudos, adjudicados

**K1 — descongelar `--ds-color-primary` (135 lectores arrastrados).** Se
descongela en F4A-5: el literal de marca queda EN LA RAÍZ (punto superior,
hardcode legítimo, valor SIN CAMBIAR). Se recablean solo los canales
computacionalmente idénticos (los 6 rottay + 15 bithire medidos en F2 +
cualquier otro que verifique cero-delta en el lote); el resto queda literal
con `baseline` + razón, o encolado a F2-asimétrico. La congelación muere:
la raíz pasa a ser dialeable (F4B la calibra).

**K2 — par border/border-primary.** Adjudicación de dirección canónica:
**`--ds-color-border` es la raíz; `--ds-color-border-primary` deriva** (2 de
3 temas ya corren así; "primary" lee como la especialización). evnto invierte
su atadura y el literal de marca se mueve al hermano que ES la raíz — pintura
computada idéntica (hoy son el uno del otro), cero-delta por construcción.
R35 firmado: patrón REDERIVED (sha256 idénticos pre/post, re-anclaje con
valor computado sin cambios). Los canales H3 (evnto card-border[-color])
derivan de la raíz canónica en el mismo lote.

**K3 — `tier.page.fg` (42 canales #A0A0A5, 3 destinos rivales).** Se AUTORA la
raíz que falta: **`--ds-color-text-secondary`** (convención medida: ya existe
`--ds-color-text-primary` como raíz desde W1). Valor: `#A0A0A5` (el computado
de hoy — cero-delta). Los 42 canales derivan en F4A-6. Exposición:
tenant-dial (el usuario afina su tinta secundaria — es exactamente la
personalización en cascada que el dueño pidió); la calibración del dial es
F4B. root-catalog gana la entrada en el lote correspondiente.

**K4 — las 16 asimétricas** (14 derivationDebt + tier.accent.bg +
effect.intensity). Valor asignado = la resolución computada de HOY por tema
(cero-delta por construcción), raíz por raíz estilo F2.4 en F4A-14, con
declaración de packet completa por cada una.

**K5 — H4 bithire table.** `--ds-table-bg`/`--ds-table-row-bg` NO se unifican
con `tier.control.bg` (no es cero-delta — F4A-0 lo confirmó). Domicilio:
`baseline` con razón escrita ("valor vertical preservado; la unificación con
tier.control.bg es decisión de craft → F4C"). La ley de F4A es preservación
de valor: la forma se gobierna, el valor no se "mejora" de paso.

**Las 10 por-crear.** Domicilio: `seed` (son raíces state-shift/alpha/
control-ratio esperando consumidores). Su materialización (declaración con su
primer consumidor) queda en F2-asimétrico/F4B como se cerró en F2. F4A solo
asienta el domicilio en el esquema.

## 5. El registro de los 3.275 candidatos de colapso

Se REGISTRAN (raíz, canales, estado de candidatura) en el artefacto del
esquema — **no se colapsan en masa** (F4A no es eso; la enmienda lo dice
textual). El colapso masivo es trabajo posterior con el harness verde.

## 6. Artefacto del esquema

Propuesta: `manifest/cascade/variant-assignments.json` (schemaVersion'd),
generado desde los tags de fuente por un productor — nunca editado a mano.
Si algún gate lo lee, su schema se fija primero en `manifest/rules.mjs`
(el writeFence del root-catalog advierte que root-catalog.json no es entrada
de gates; el nuevo artefacto necesita su schema fijado si va a ser leído por
uno). F4A-2 decide extensión-de-mirror-parity vs productor hermano como
primera sub-decisión.
