# F4A-1c — Roster del esquema de asignacion de variantes (re-emision)

**READ-ONLY.** Arbol `c20e16a35`. **66 raices x 3 = 198 entradas.** Universo limpio: sin fila agregada.

schemaVersion 3. Re-emitido con las adjudicaciones de la parte 3 (**posture medido por tema**, **par border como raiz autora**, **2 citaciones ancladas**, **baseline/pro-expert con nota de nivel**) y con el **cambio de adjudicacion de K3 del 2026-08-20**: --ds-color-text-secondary queda INTACTA y los 42 canales cuelgan de una raiz NUEVA, --ds-color-text-page.

**BLOCKED: 0 · MISSING-CITATION: 0.** Los 12 bloqueos y las 6 citas faltantes del borrador quedaron resueltos por las adjudicaciones.

---

## Resumen — el roster ya NO es identico por tema

| domicilio | rottay | bithire | evnto | total |
|---|---|---|---|---|
| `seed` | 24 | 37 | 24 | **85** |
| `derived` | 12 | 10 | 7 | **29** |
| `baseline` | 0 | 0 | 0 | **0** |
| `pro-expert` | 0 | 0 | 0 | **0** |
| `unassigned` | 30 | 19 | 35 | **84** |
| `BLOCKED` | 0 | 0 | 0 | **0** |
| **total** | 66 | 66 | 66 | **198** |

### Posture medido — el insumo que rompe la simetria

| tema | raices con posicion **autorada** | sin posicion |
|---|---|---|
| rottay | **36** / 66 | 30 |
| bithire | **47** / 66 | 19 |
| evnto | **29** / 66 | 37 |

**Metodo:** compileBrandTheme sobre la FUENTE del tema (A.2): la raiz esta authored si su canal cabeza aparece en cssVariables del cuerpo o de algun modeBlock. NO es la lectura del artefacto (esa dio 159 y es chequeo derivado).

> **Precedencia aplicada:** posture manda sobre el domicilio (una raiz que el tema no autora queda `unassigned` con la razon de la ley de placeholder) **salvo donde un nudo escribe el domicilio** (K1, K2, por-crear). Ahi el domicilio del nudo se conserva y la ausencia queda declarada en la nota. Es la lectura literal de la parte 3 §2: los nudos overridean SOLO donde lo dice escrito.

### baseline / pro-expert = 0 a nivel raiz — por diseno

baseline y pro-expert son 0 A NIVEL RAIZ por diseno (parte 3 §1): viven a nivel hoja/familia en los tags de fuente. K5 se etiqueta baseline en F4A-15; pro-expert se ancla a la capability activa del tema.

Roster CAPABILITIES medido hoy (ancla de `pro-expert`): motion **activo en los 3** · recipes **rottay + bithire** · expressive **solo bithire** · responsive y engineBridge **disabled en los 3**. Coincide exacto con lo que cita la parte 3 §1.

---

## Las 2 raices autoras

### `color.border`

| tema | posture | domicilio | governor |
|---|---|---|---|
| rottay | `authored` | `seed` | dial: (raiz autora — dial en F4B) |
| bithire | `authored` | `seed` | dial: (raiz autora — dial en F4B) |
| evnto | `authored` | `seed` | dial: (raiz autora — dial en F4B) |

> RAIZ AUTORA #2 (parte 3 §3). El par sale del eje de tiers: la colision a 4 bandas era la prueba de que es su propia entidad. seed = --ds-color-border; --ds-color-border-primary = derived de ella. K2 se ejecuta en F4A-5 sobre esta raiz (evnto invierte su atadura al canon; pintura computada identica; R35 patron REDERIVED).

### `--ds-color-text-secondary`

| tema | posture | domicilio | governor |
|---|---|---|---|
| rottay | `authored` | `seed` | dial: (raiz autora — dial en F4B) |
| bithire | `authored` | `seed` | dial: (raiz autora — dial en F4B) |
| evnto | `authored` | `seed` | dial: (raiz autora — dial en F4B) |

> Raiz seed EXISTENTE, gobernada por el campo autorado textSecondaryColor. INTACTA: ni valor ni lectores se tocan (262 archivos de src/ la leen). Dial tenant en F4B.

### `--ds-color-text-page`

| tema | posture | domicilio | governor |
|---|---|---|---|
| rottay | `authored` | `seed` | dial: (raiz autora — dial en F4B) |
| bithire | `authored` | `seed` | dial: (raiz autora — dial en F4B) |
| evnto | `authored` | `seed` | dial: (raiz autora — dial en F4B) |

> RAIZ NUEVA. Cabeza de la cadena de tinta de tiers; los 42 canales de tier.page.fg cuelgan de ella. Colision verificada por grep: text-page / textPage NO existen en src/. Materializacion en F4A-6 con packet REDERIVED (sha256 identicos). Valor por tema = el computado de hoy (cero-delta por construccion). Dial tenant en F4B. Valor medido en rottay: #A0A0A5 (base) / #6B6B6B (light).

---

## El roster, por raiz


### color

**`chart.palette`** · --ds-chart-series-1 · exposure `tenant-dial` · status `solo-artefacto` · radio 4

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `seed` | exposure | dial: palette.seeds |
| bithire | `authored` | `seed` | exposure | dial: palette.seeds |
| evnto | `authored` | `seed` | exposure | dial: palette.seeds |

**`ramp.seed.accent`** · --ds-color-accent · exposure `tenant-dial` · status `existe` · radio 47

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `seed` | exposure | dial: palette.seeds |
| bithire | `authored` | `seed` | exposure | dial: palette.seeds |
| evnto | `authored` | `seed` | exposure | dial: palette.seeds |

**`ramp.seed.error`** · --ds-color-error · exposure `gap` · status `existe` · radio 47

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |
| bithire | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |
| evnto | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |

**`ramp.seed.info`** · --ds-color-info · exposure `gap` · status `existe` · radio 50

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |
| bithire | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |
| evnto | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |

**`ramp.seed.neutral`** · --ds-color-neutral-500 · exposure `gap` · status `existe` · radio 132

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |
| bithire | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |
| evnto | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |

**`ramp.seed.primary`** · --ds-color-primary · exposure `tenant-dial` · status `existe` · radio 60

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `seed` | nudo K1 | dial: palette.seeds — K1 descongelada |
| bithire | `authored` | `seed` | nudo K1 | dial: palette.seeds — K1 descongelada |
| evnto | `authored` | `seed` | nudo K1 | dial: palette.seeds — K1 descongelada |

> K1: se descongela en el LOTE K1 (propio del DT, post-F4A-6 — quedó fuera de F4A-5 con razón medida: los 32 canales idénticos son CHROME, no PALETTE), VALOR SIN CAMBIAR; 135 lectores arrastrados (r25/b90/e20); recableo solo cero-delta.

**`ramp.seed.secondary`** · --ds-color-secondary · exposure `tenant-dial` · status `existe` · radio 57

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `seed` | exposure | dial: palette.seeds |
| bithire | `authored` | `seed` | exposure | dial: palette.seeds |
| evnto | `authored` | `seed` | exposure | dial: palette.seeds |

**`ramp.seed.success`** · --ds-color-success · exposure `gap` · status `existe` · radio 47

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |
| bithire | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |
| evnto | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |

**`ramp.seed.warning`** · --ds-color-warning · exposure `gap` · status `existe` · radio 45

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |
| bithire | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |
| evnto | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |


### elevacion-forma-efectos

**`alpha.ladder`** · --ds-alpha-8 · exposure `internal-head` · status `por-crear` · radio 2

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |
| bithire | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |
| evnto | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |

> por-crear: materializacion en F2-asimetrico/F4B (cierre F2). Hoy 0 declaraciones y 0 lectores. posture unassigned en rottay, pero el nudo escribe el domicilio: se conserva y la ausencia queda declarada. K4: valor = resolucion computada de hoy ((no declarado)); raiz por raiz en F4A-14.

**`density.scale`** · --ds-density-effective-scale · exposure `tenant-dial` · status `existe` · radio 3

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: dial: density.mode |
| bithire | `unassigned` | `unassigned` | posture | ley de placeholder: bithire no toma posicion autorada sobre esta raiz. Gobernaria: dial: density.mode |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: dial: density.mode |

**`effect.intensity`** · --ds-effect-intensity · exposure `tenant-dial` · status `existe` · radio 1

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: dial: surfaces.effect-intensity |
| bithire | `authored` | `seed` | exposure | dial: surfaces.effect-intensity |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: dial: surfaces.effect-intensity |

> Medido con el compilador productivo: --ds-effect-intensity emite rottay "1" · bithire "0.58" · evnto "1". Rottay y evnto declinan explicitamente (@placeholder SURFACES.effectIntensity, @domicile unassigned -- rottay index.ts:3767-3769, evnto 2076-2078) y heredan el fallback del lowering. La materializacion en rottay/evnto fue probada cero-delta (0 diffs sobre el mapa completo) y el DT la declino el 2026-08-21 para preservar la declinacion explicita. Escribir base=1 sobre bithire es regresion medida (1 diff: 0.58 -> 1) y esta prohibido.

**`elevation.ladder`** · --ds-elevation-1 · exposure `tenant-dial` · status `existe` · radio 191

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `seed` | exposure | dial: surfaces.elevation-posture |
| bithire | `authored` | `seed` | exposure | dial: surfaces.elevation-posture |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: dial: surfaces.elevation-post |

**`glass.recipe`** · --ds-glass-blur · exposure `tenant-dial` · status `existe` · radio 12

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: dial: surfaces.effect-intens |
| bithire | `authored` | `seed` | exposure | dial: surfaces.effect-intensity |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: dial: surfaces.effect-intensi |

**`gradient.recipe`** · --ds-gradient-primary · exposure `internal-head` · status `existe` · radio 14

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: --ds-gradient-sur |
| bithire | `authored` | `derived` | exposure | deriva de: --ds-gradient-surface |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: --ds-gradient-surf |

**`radius.base`** · --ds-radius-md · exposure `tenant-dial` · status `existe` · radio 38

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: dial: shape.radius-scale |
| bithire | `unassigned` | `unassigned` | posture | ley de placeholder: bithire no toma posicion autorada sobre esta raiz. Gobernaria: dial: shape.radius-scale |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: dial: shape.radius-scale |

**`scrim.opacity`** · --ds-overlay-scrim · exposure `internal-head` · status `existe` · radio 29

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: --ds-color-bg-ove |
| bithire | `unassigned` | `unassigned` | posture | ley de placeholder: bithire no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: --ds-color-bg-ov |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: --ds-color-bg-over |


### estados

**`state.delta.active`** · --ds-state-active-shift · exposure `internal-head` · status `por-crear` · radio 118

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |
| bithire | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |
| evnto | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |

> por-crear: materializacion en F2-asimetrico/F4B (cierre F2). Hoy 0 declaraciones y 0 lectores. posture unassigned en rottay, pero el nudo escribe el domicilio: se conserva y la ausencia queda declarada.

**`state.delta.checked`** · --ds-state-checked-shift · exposure `internal-head` · status `por-crear` · radio 2

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |
| bithire | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |
| evnto | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |

> por-crear: materializacion en F2-asimetrico/F4B (cierre F2). Hoy 0 declaraciones y 0 lectores. posture unassigned en rottay, pero el nudo escribe el domicilio: se conserva y la ausencia queda declarada. K4: valor = resolucion computada de hoy ((no declarado)); raiz por raiz en F4A-14.

**`state.delta.disabled`** · --ds-state-disabled-opacity · exposure `internal-head` · status `existe` · radio 43

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: el reposo de su c |
| bithire | `unassigned` | `unassigned` | posture | ley de placeholder: bithire no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: el reposo de su  |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: el reposo de su co |

> Citacion anclada por el DT (parte 3 §4).

**`state.delta.expanded`** · --ds-state-expanded-shift · exposure `internal-head` · status `por-crear` · radio 2

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |
| bithire | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |
| evnto | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |

> por-crear: materializacion en F2-asimetrico/F4B (cierre F2). Hoy 0 declaraciones y 0 lectores. posture unassigned en rottay, pero el nudo escribe el domicilio: se conserva y la ausencia queda declarada. K4: valor = resolucion computada de hoy ((no declarado)); raiz por raiz en F4A-14.

**`state.delta.focus`** · --ds-focus-ring · exposure `internal-head` · status `existe` · radio 53

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: --ds-focus-ring-w |
| bithire | `unassigned` | `unassigned` | posture | ley de placeholder: bithire no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: --ds-focus-ring- |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: --ds-focus-ring-wi |

**`state.delta.hover`** · --ds-state-hover-shift · exposure `internal-head` · status `existe` · radio 241

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: --ds-wash-band, - |
| bithire | `unassigned` | `unassigned` | posture | ley de placeholder: bithire no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: --ds-wash-band,  |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: --ds-wash-band, -- |

**`state.delta.pressed`** · --ds-state-pressed-shift · exposure `internal-head` · status `por-crear` · radio 3

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |
| bithire | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |
| evnto | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |

> por-crear: materializacion en F2-asimetrico/F4B (cierre F2). Hoy 0 declaraciones y 0 lectores. posture unassigned en rottay, pero el nudo escribe el domicilio: se conserva y la ausencia queda declarada. K4: valor = resolucion computada de hoy ((no declarado)); raiz por raiz en F4A-14.

**`state.delta.selected`** · --ds-state-selected-shift · exposure `internal-head` · status `por-crear` · radio 26

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |
| bithire | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |
| evnto | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |

> por-crear: materializacion en F2-asimetrico/F4B (cierre F2). Hoy 0 declaraciones y 0 lectores. posture unassigned en rottay, pero el nudo escribe el domicilio: se conserva y la ausencia queda declarada.


### geometria-de-controles

**`control.height`** · --ds-input-md-height · exposure `tenant-dial` · status `existe` · radio 67

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `seed` | exposure | dial: density.mode |
| bithire | `authored` | `seed` | exposure | dial: density.mode |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: dial: density.mode |

**`control.ratio.fontSize`** · --ds-input-md-font-size · exposure `internal-head` · status `existe` · radio 23

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `derived` | exposure | deriva de: --ds-input-md-font-size, --ds-font-size-md |
| bithire | `authored` | `derived` | exposure | deriva de: --ds-input-md-font-size, --ds-font-size-md |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: --ds-input-md-font |

> K4: valor = resolucion computada de hoy (base=var(--ds-font-size-sm)); raiz por raiz en F4A-14.

**`control.ratio.gap`** · --ds-control-gap-ratio · exposure `internal-head` · status `por-crear` · radio 13

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `derived` | nudo K4 | deriva de: calc (gap = altura x 0.18) |
| bithire | `authored` | `seed` | nudo K4 | seed sin dial — autorado directo, literales por familia |
| evnto | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |

> K4 (F4A-14a): rottay SI toma posicion -- deriva de calc (gap = altura x 0.18, seis veces seguidas). El canal --ds-control-gap-ratio sigue channelStatus por-crear: la materializacion de cabeza sigue pendiente en F2-asimetrico/F4B (cierre F2); rottay ya escribio la ley por calc(), a la espera de esa cabeza. raiz por raiz en F4A-14.

**`control.ratio.iconSize`** · --ds-input-md-icon-size · exposure `internal-head` · status `existe` · radio 23

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `derived` | nudo K4 | deriva de: --ds-icon-sm-size |
| bithire | `authored` | `seed` | nudo K4 | seed sin dial — autorado directo, 15px literal |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: --ds-icon-size-sta |

> K4 (F4A-14a): valor = resolucion computada de hoy (base=var(--ds-icon-sm-size)); rottay SI toma posicion -- deriva de --ds-icon-sm-size; bithire SI toma posicion -- seed sin dial, autorado directo (15px literal). La emision real corre por --ds-input-md-icon-size / --ds-button-md-icon-size; el catalogo adjudico --ds-input-md-icon-size como el channel representativo de esta raiz (F4A-close, Lote B: convencion del grupo geometria-de-controles, input como cabeza representativa; evidence en input.css:38). --ds-icon-md-size vuelve a ser token base del primitivo Icon, sin raiz. raiz por raiz en F4A-14.

**`control.ratio.lineHeight`** · --ds-input-md-line-height · exposure `internal-head` · status `existe` · radio 23

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `derived` | exposure | deriva de: --ds-line-height-tight |
| bithire | `authored` | `seed` | exposure | seed sin dial — autorado directo, 20px literal |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: --ds-line-height-t |

> K4: valor = resolucion computada de hoy (base=var(--ds-line-height-tight)); raiz por raiz en F4A-14.

**`control.ratio.padding`** · --ds-control-padding-ratio-label · exposure `internal-head` · status `por-crear` · radio 33

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `derived` | nudo K4 | deriva de: calc (paddingX = altura x 0.42 boton / altura x 0.35 campo; paddingY = altura x 0.20) |
| bithire | `authored` | `seed` | nudo K4 | seed sin dial — autorado directo, literales por familia |
| evnto | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |

> K4 (F4A-14a): rottay SI toma posicion -- deriva de calc (paddingX = altura x 0.42 boton / altura x 0.35 campo; paddingY = altura x 0.20 en las cinco filas de campo). El canal --ds-control-padding-ratio-label sigue channelStatus por-crear: la materializacion de cabeza sigue pendiente en F2-asimetrico/F4B (cierre F2); rottay ya escribio la ley por calc(), a la espera de esa cabeza. raiz por raiz en F4A-14.

**`control.ratio.radius`** · --ds-button-md-radius · exposure `tenant-dial` · status `existe` · radio 13

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: dial: shape.button-style |
| bithire | `authored` | `seed` | exposure | dial: shape.button-style |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: dial: shape.button-style |

> K4: valor = resolucion computada de hoy ((no declarado)); raiz por raiz en F4A-14.

**`spacing.step`** · --ds-spacing-2 · exposure `tenant-dial` · status `existe` · radio 73

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: dial: spacing.rhythm |
| bithire | `unassigned` | `unassigned` | posture | ley de placeholder: bithire no toma posicion autorada sobre esta raiz. Gobernaria: dial: spacing.rhythm |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: dial: spacing.rhythm |


### movimiento-perfil

**`experience.profile`** · --ds-experience-profile · exposure `tenant-dial` · status `solo-artefacto` · radio 16

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: dial: experience.profile |
| bithire | `authored` | `seed` | exposure | dial: experience.profile |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: dial: experience.profile |

**`motion.duration`** · --ds-motion-duration-scale · exposure `tenant-dial` · status `existe` · radio 22

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: dial: motion.dial |
| bithire | `unassigned` | `unassigned` | posture | ley de placeholder: bithire no toma posicion autorada sobre esta raiz. Gobernaria: dial: motion.dial |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: dial: motion.dial |

**`motion.intensity`** · --ds-motion-intensity · exposure `tenant-dial` · status `solo-artefacto` · radio 36

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `seed` | exposure | dial: motion.dial |
| bithire | `authored` | `seed` | exposure | dial: motion.dial |
| evnto | `authored` | `seed` | exposure | dial: motion.dial |

**`motion.spring`** · --ds-motion-spring · exposure `tenant-dial` · status `existe` · radio 9

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: dial: motion.dial |
| bithire | `unassigned` | `unassigned` | posture | ley de placeholder: bithire no toma posicion autorada sobre esta raiz. Gobernaria: dial: motion.dial |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: dial: motion.dial |


### superficie-por-nivel

**`tier.accent.bg`** · --ds-surface-accent · exposure `gap` · status `por-crear` · radio 63

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |
| bithire | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |
| evnto | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |

> por-crear: materializacion en F2-asimetrico/F4B (cierre F2). Hoy 0 declaraciones y 0 lectores. posture unassigned en rottay, pero el nudo escribe el domicilio: se conserva y la ausencia queda declarada. K4: valor = resolucion computada de hoy ((no declarado)); raiz por raiz en F4A-14.

**`tier.accent.border`** · --ds-color-border-accent · exposure `internal-head` · status `por-crear` · radio 38

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |
| bithire | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |
| evnto | `unassigned` | `seed` | nudo por-crear | seed sin dial — materializacion pendiente |

> por-crear: materializacion en F2-asimetrico/F4B (cierre F2). Hoy 0 declaraciones y 0 lectores. posture unassigned en rottay, pero el nudo escribe el domicilio: se conserva y la ausencia queda declarada.

**`tier.accent.fg`** · --ds-color-info-ink · exposure `internal-head` · status `existe` · radio 74

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: --ds-color-neutra |
| bithire | `authored` | `derived` | exposure | deriva de: --ds-color-neutral-900 |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: --ds-color-neutral |

**`tier.base.bg`** · --ds-color-bg-primary · exposure `tenant-dial` · status `existe` · radio 88

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `seed` | exposure | dial: palette.seeds |
| bithire | `authored` | `seed` | exposure | dial: palette.seeds |
| evnto | `authored` | `seed` | exposure | dial: palette.seeds |

**`tier.base.border`** · --ds-color-border · exposure `internal-head` · status `existe` · radio 51

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `derived` | nudo K2 | deriva de: raiz color.border + la logica de nivel del tier |
| bithire | `authored` | `derived` | nudo K2 | deriva de: raiz color.border + la logica de nivel del tier |
| evnto | `authored` | `derived` | nudo K2 | deriva de: raiz color.border + la logica de nivel del tier |

> K2: el par salio del eje de tiers a la raiz autora color.border (parte 3 §3). Este tier deriva de ella.

**`tier.base.fg`** · --ds-color-text-primary · exposure `internal-head` · status `existe` · radio 19

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `derived` | exposure | deriva de: packages/core/src/foundation/contracts/composition/tenants/capabilities/index.ts:593 |
| bithire | `authored` | `derived` | exposure | deriva de: packages/core/src/foundation/contracts/composition/tenants/capabilities/index.ts:593 |
| evnto | `authored` | `derived` | exposure | deriva de: packages/core/src/foundation/contracts/composition/tenants/capabilities/index.ts:593 |

**`tier.control.bg`** · --ds-surface-control · exposure `tenant-dial` · status `existe` · radio 200

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: dial: chrome.families |
| bithire | `authored` | `seed` | exposure | dial: chrome.families |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: dial: chrome.families |

**`tier.control.border`** · --ds-color-border · exposure `internal-head` · status `existe` · radio 165

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `derived` | nudo K2 | deriva de: raiz color.border + la logica de nivel del tier |
| bithire | `authored` | `derived` | nudo K2 | deriva de: raiz color.border + la logica de nivel del tier |
| evnto | `authored` | `derived` | nudo K2 | deriva de: raiz color.border + la logica de nivel del tier |

> K2: el par salio del eje de tiers a la raiz autora color.border (parte 3 §3). Este tier deriva de ella.

**`tier.control.fg`** · --ds-color-text-primary · exposure `internal-head` · status `existe` · radio 267

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `derived` | exposure | deriva de: --ds-color-text-on-primary |
| bithire | `authored` | `derived` | exposure | deriva de: --ds-color-text-on-primary |
| evnto | `authored` | `derived` | exposure | deriva de: --ds-color-text-on-primary |

**`tier.overlay.bg`** · --ds-material-overlay-background · exposure `tenant-dial` · status `existe` · radio 55

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: dial: token-overrides |
| bithire | `authored` | `seed` | exposure | dial: (raiz autora — dial en F4B) |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: dial: token-overrides |

> K4: valor = resolucion computada de hoy ((no declarado)); raiz por raiz en F4A-14.

**`tier.overlay.border`** · --ds-color-border · exposure `internal-head` · status `existe` · radio 28

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `derived` | nudo K2 | deriva de: raiz color.border + la logica de nivel del tier |
| bithire | `authored` | `derived` | nudo K2 | deriva de: raiz color.border + la logica de nivel del tier |
| evnto | `authored` | `derived` | nudo K2 | deriva de: raiz color.border + la logica de nivel del tier |

> K2: el par salio del eje de tiers a la raiz autora color.border (parte 3 §3). Este tier deriva de ella. K4: valor = resolucion computada de hoy (base=#28282C \| overlay=#E5E5E3); raiz por raiz en F4A-14.

**`tier.overlay.fg`** · --ds-material-overlay-foreground · exposure `internal-head` · status `solo-artefacto` · radio 72

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: la tinta del nivel inmediato anterior en la cadena de tiers (page -> base -> raised -> overlay; la cabeza de tinta es --ds-color-text-page cuando aterrice F4A-6) |
| bithire | `authored` | `seed` | exposure | seed sin dial — autorado directo, base y dark |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: la tinta del nivel inmediato anterior en la cadena de tiers (page -> base -> raised -> overlay; la cabeza de tinta es --ds-color-text-page cuando aterrice F4A-6) |

> Citacion anclada por el DT (parte 3 §4). K4: valor = resolucion computada de hoy ((no declarado)); raiz por raiz en F4A-14.

**`tier.page.bg`** · --ds-sidebar-bg · exposure `tenant-dial` · status `existe` · radio 80

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `seed` | exposure | dial: navigation.sidebar-tone |
| bithire | `authored` | `seed` | exposure | dial: navigation.sidebar-tone |
| evnto | `authored` | `seed` | exposure | dial: navigation.sidebar-tone |

**`tier.page.border`** · --ds-color-border-subtle · exposure `gap` · status `existe` · radio 50

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |
| bithire | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |
| evnto | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |

**`tier.page.fg`** · --ds-sidebar-item-color · exposure `tenant-dial` · status `solo-artefacto` · radio 75

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `derived` | nudo K3 | deriva de: --ds-color-text-page (MATERIALIZADO en F4A-6, commit 3393f70d4; REDERIVED cero-delta verificado) |
| bithire | `authored` | `derived` | nudo K3 | deriva de: --ds-color-text-page (MATERIALIZADO en F4A-6, commit 3393f70d4; REDERIVED cero-delta verificado) |
| evnto | `authored` | `derived` | nudo K3 | deriva de: --ds-color-text-page (MATERIALIZADO en F4A-6, commit 3393f70d4; REDERIVED cero-delta verificado) |

> K3 (adjudicacion nueva 2026-08-20): los 42 canales cuelgan de la raiz NUEVA --ds-color-text-page, no de --ds-color-text-secondary (que ya existia con otro valor). Valor de esta raiz en rottay: base=#A0A0A5 \| overlay=#6B6B6B.

**`tier.raised.bg`** · --ds-surface-card · exposure `tenant-dial` · status `existe` · radio 75

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: dial: token-overrides |
| bithire | `authored` | `seed` | exposure | dial: token-overrides |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: dial: token-overrides |

**`tier.raised.border`** · --ds-color-border · exposure `gap` · status `existe` · radio 56

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `derived` | nudo K2 | deriva de: raiz color.border + la logica de nivel del tier |
| bithire | `authored` | `derived` | nudo K2 | deriva de: raiz color.border + la logica de nivel del tier |
| evnto | `authored` | `derived` | nudo K2 | deriva de: raiz color.border + la logica de nivel del tier |

> K2: el par salio del eje de tiers a la raiz autora color.border (parte 3 §3). Este tier deriva de ella.

**`tier.raised.fg`** · --ds-material-raised-foreground · exposure `internal-head` · status `existe` · radio 93

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: calc |
| bithire | `authored` | `seed` | exposure | seed sin dial — autorado directo, base y dark |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: calc |

> K4: valor = resolucion computada de hoy ((no declarado)); raiz por raiz en F4A-14.


### tipografia

**`type.family.base`** · --ds-font-family-base · exposure `tenant-dial` · status `existe` · radio 3

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `seed` | exposure | dial: typography.families |
| bithire | `authored` | `seed` | exposure | dial: typography.families |
| evnto | `authored` | `seed` | exposure | dial: typography.families |

**`type.family.display`** · --ds-font-family-display · exposure `gap` · status `existe` · radio 3

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |
| bithire | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |
| evnto | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |

**`type.family.heading`** · --ds-font-family-heading · exposure `tenant-dial` · status `existe` · radio 3

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `seed` | exposure | dial: typography.pairing |
| bithire | `authored` | `seed` | exposure | dial: typography.pairing |
| evnto | `authored` | `seed` | exposure | dial: typography.pairing |

**`type.family.mono`** · --ds-font-family-mono · exposure `gap` · status `existe` · radio 3

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |
| bithire | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |
| evnto | `authored` | `unassigned` | exposure | none — gap aceptado (decision 9, 2026-08-19) |

**`type.leading`** · --ds-line-height-normal · exposure `internal-head` · status `existe` · radio 16

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: packages/core/src |
| bithire | `unassigned` | `unassigned` | posture | ley de placeholder: bithire no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: packages/core/sr |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: packages/core/src/ |

**`type.scale`** · --ds-type-scale · exposure `tenant-dial` · status `solo-artefacto` · radio 68

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `seed` | exposure | dial: typography.scale |
| bithire | `authored` | `seed` | exposure | dial: typography.scale |
| evnto | `authored` | `seed` | exposure | dial: typography.scale |

**`type.tracking`** · --ds-letter-spacing-body · exposure `tenant-dial` · status `existe` · radio 6

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `authored` | `seed` | exposure | dial: experience.profile |
| bithire | `authored` | `seed` | exposure | dial: experience.profile |
| evnto | `authored` | `seed` | exposure | dial: experience.profile |

**`type.weight`** · --ds-font-weight-medium · exposure `internal-head` · status `existe` · radio 6

| tema | posture | domicilio | regla | governor |
|---|---|---|---|---|
| rottay | `unassigned` | `unassigned` | posture | ley de placeholder: rottay no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: packages/core/src |
| bithire | `unassigned` | `unassigned` | posture | ley de placeholder: bithire no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: packages/core/sr |
| evnto | `unassigned` | `unassigned` | posture | ley de placeholder: evnto no toma posicion autorada sobre esta raiz. Gobernaria: deriva de: packages/core/src/ |


---

## Punto 4 — qué computan HOY los `tier.page.fg` de los tres temas

Medido con `compileBrandTheme` sobre la fuente (el mismo método de `posture`).
La cabeza es `--ds-sidebar-item-color`, que baja del campo autorado
`sidebar.itemColor`.

| tema | valor de `tier.page.fg` | ¿literal propio? | `--ds-color-text-secondary` del mismo tema | veredicto |
|---|---|---|---|---|
| **rottay** | `#A0A0A5` base / `#6B6B6B` light | **sí** | `#B0B0B5` / `#6B6B6B` | **caso (a)** — literal propio, y **distinto** de text-secondary en base |
| **bithire** | `#53697E` base / `#9aacbf` dark | **sí** | `#53697e` / `#9aacbf` | **caso (a)** — literal propio, pero **coincide** con text-secondary en los dos scopes (sólo cambia el case del hex) |
| **evnto** | `#3d3d3d` base, **sin dark** | **sí** | `#3d3d3d` / `#A8A898` | **caso (a)** — literal propio; coincide en base pero **text-secondary tiene un dark que este canal no tiene** |

**Los tres son caso (a): ninguno deriva hoy, los tres autoran su literal.** Por
eso `--ds-color-text-page` se autora en los tres y el universo es **66 × 3 = 198**.

### Descomposición del total

```
63 raíces del catálogo
+ 1  color.border            (raíz autora #2, parte 3 §3)
+ 1  --ds-color-text-secondary (raíz seed EXISTENTE, se registra intacta)
+ 1  --ds-color-text-page    (raíz NUEVA, materializa en F4A-6)
= 66 raíces × 3 temas = 198 entradas   ·   fila agregada retirada
```

### Dos cosas que la medición agrega, y que conviene mirar antes de F4A-6

**bithire ya es cero-delta contra `text-secondary`.** Su `tier.page.fg` vale
exactamente lo mismo que su tinta secundaria en los dos scopes. Es decir: en
bithire hay **dos** destinos válidos con cero-delta (`text-page` nuevo, o
`text-secondary` existente). Autoré `text-page` porque es lo que dice la
adjudicación (caso a), pero la alternativa existe y es más barata.

**evnto NO puede derivar de `text-secondary`.** Su `sidebar-item-color` no tiene
scope dark y `text-secondary` sí (`#A8A898`): atarlos le daría a evnto una tinta
de sidebar en oscuro que hoy no tiene. `text-page` en evnto se autora **sólo en
base**, sin dark — está anotado en la fila.

**`#A0A0A5` en la fuente de rottay: medí 50 ocurrencias, no 48** (case-sensitive,
mayúsculas; 0 en minúsculas; 0 en bithire y evnto). El conteo de canales que
cuelgan sigue siendo 42 — las 8 restantes son ocurrencias del mismo literal en
hojas que no son de `tier.page.fg`. Lo reporto porque el brief citaba 48.

### Colisión verificada por grep, no por convención

```
grep -ril -e "text-page" -e "textPage" src/   →   (vacío)
```

`--ds-color-text-page` y `textPage` están libres en todo `src/`.

---

## Lección de método registrada

> **Toda "convención medida" se verifica con grep del nombre exacto ANTES de
> asentarla.**

La premisa original de K3 —*"se autora la raíz que falta:
`--ds-color-text-secondary`; convención medida: ya existe
`--ds-color-text-primary` como raíz desde W1"*— citaba una convención correcta
(el patrón `--ds-color-text-*`) pero **no verificó que el nombre concreto
estuviera libre**. Estaba ocupado: el canal existía en los tres temas, con
**262 archivos de `src/` leyéndolo** y un valor base distinto del que la
adjudicación asumía.

El costo de no verificar habría sido re-apuntar 42 canales a una raíz con otro
valor y llamarlo cero-delta. El costo de verificar fue un `grep`.

**Regla operativa para los lotes que vienen:** antes de asentar un nombre nuevo,
`grep -ril "<nombre-exacto>" src/` y `grep -ril "<camelCase>" src/`; si devuelve
algo, la raíz no es nueva y hay que medir su valor y sus lectores antes de
adjudicar.
