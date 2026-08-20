# F4A-0 — Medición pre-rewrite. Baseline del árbol de HOY (`6eb622d78`)

**READ-ONLY cumplido: cero escrituras en el repo** (`git status --porcelain` vacío
al abrir y al cerrar). Todo en `/tmp/f4a-0/`.

**7 predicciones falsifican exacto. 5 NO.** Las 5 no son un movimiento del árbol:
son métodos del catálogo que no se pueden reproducir desde lo que el catálogo
documenta. Están en §A y **hay que resolverlas antes de F4A-1**, porque tres de
ellas son denominadores que el harness de F4A-2 iba a citar.

---

## A. LO QUE NO FALSIFICA — parar acá

### A.1 El denominador de pintura (3.693) no es reproducible

El **total de hojas SÍ falsifica, y perfecto**:

| | catálogo (2026-08-18) | hoy | delta |
|---|---|---|---|
| rottay | 1819 | **1811** | −8 |
| bithire | 1496 | **1493** | −3 |
| evnto | 423 | **422** | −1 |
| **total** | **3738** | **3726** | **−12** |

**−12 exacto = las 12 restituciones que colapsaron en F2** (rottay 8, bithire 3,
evnto 1). El método del catálogo —walk del objeto evaluado, 2 scopes— reproduce
al canal.

Lo que NO reproduce es el paso siguiente: *"Se restaron 45 hojas de
metadato/prosa"*. **El catálogo nunca enumera esas 45.** Probé dos
clasificaciones honestas:

| clasificación | metadato | pintura hoy | esperado si el catálogo fuera reproducible (3693−12) |
|---|---|---|---|
| `id`+`name`+prosa+booleanos | 36 | 3690 | 3681 |
| `id`+`name`+todo `capabilities.*` | 39 | 3687 | 3681 |
| catálogo | **45** | (3693) | — |

Ninguna da 45, y el faltante no se reparte parejo entre temas. **F4A-1 tiene que
adjudicar la regla y enumerarla**, no heredar el número. Mi lista de 36 está en
`/tmp/f4a-0/` y es reproducible línea por línea.

### A.2 Asignaciones: 263 vs 159 re-medidas, 95 divergencias

El catálogo define asignación como *"un par raíz × modo por tema"*. Re-medí lo
único que esa frase permite medir —¿el tema declara la cabeza de la raíz, en
cuántos scopes?— y da:

| | catálogo | re-medido | delta |
|---|---|---|---|
| rottay | 99 | **55** | −44 |
| bithire | 95 | **64** | −31 |
| evnto | 69 | **40** | −29 |
| **total** | **263** | **159** | **−104** |

**95 pares raíz×tema divergen, y en las dos direcciones** (`tier.raised.fg`
evnto: catálogo 0 → hoy 2). Un delta de F2 sería ≤12 y en un solo sentido. Esto
es **otro método**, no otro árbol: "tomar posición sobre una raíz" no es
"declarar su canal cabeza". `--ds-state-hover-shift` tiene 2 asignaciones en el
catálogo por tema y **cero declaraciones en los tres artefactos**.

**No inventé un método para cerrar el número.** F4A-1 lo define.
Datos crudos: `/tmp/f4a-0/asignaciones-delta.json`.

### A.3 `var()`: rottay y evnto dan −2 cada uno

La postura literal/derivado se mide por **ocurrencias**, no por hojas (una hoja
con `color-mix(var(a), var(b))` son 2 referencias). Con esa lectura:

| tema | hex literal (pred.) | hex literal (hoy) | var() (pred.) | var() (hoy) |
|---|---|---|---|---|
| rottay | 1134 | **1134** ✓ | 271 | **269** ✗ −2 |
| bithire | 468 | **468** ✓ | 629 | **629** ✓ |
| evnto | 188 | **188** ✓ | 134 | **132** ✗ −2 |

**Los tres literales dan exacto y bithire da exacto en las dos columnas**, así
que el método es el correcto. Los −2 de rottay y evnto no los pude atribuir:
verifiqué que cada tema tiene **un solo** modo, que el walk del objeto entero da
la misma cifra que la suma de los 2 scopes, y que no hay arrays con valores
sueltos. No hay dónde escondan 2 referencias.

### A.4 "Las 22 asimétricas, 9 con tema en cero" → son 16

Raíces con al menos un tema en **0 asignaciones**: **16**, no 9 — y no caen en
las 22: **14 son `derivationDebt:true`** y sólo 2 son de las 22.

```
DD  tier.raised.fg · tier.overlay.fg · tier.overlay.bg · tier.overlay.border
    control.ratio.{padding,fontSize,lineHeight,iconSize,gap,radius}
    state.delta.{pressed,checked,expanded} · alpha.ladder
    tier.accent.bg · effect.intensity          (estas 2, sin DD)
```

Recordá lo de F2.4: **"las 41" es `derivationDebt`, no simetría de modos.** El
"9" parece venir de una tercera lectura que tampoco es ésta.

### A.5 `tier.page.fg`: 42 canales, no 43 — y el radio es 75

Medido hoy sobre el artefacto de rottay: **42** canales con valor idéntico a la
cabeza, no 43. El radio del catálogo para esa raíz es **75**, que es otra cifra
todavía. Lista exacta en `/tmp/f4a-0/tier-page-fg-43.txt`.

---

## B. LO QUE FALSIFICA EXACTO

| # | predicción | medido | veredicto |
|---|---|---|---|
| 1 | hojas evaluadas 3738 ± F2 | **3726 = 3738 − 12** | ✓ exacto, y el −12 son los 12 recables |
| 3 | sourceSkeleton 1820/1503/397 | **1820 / 1503 / 397** | ✓ exacto |
| 3 | unión 2613 · intersección 345 | **2613 · 345** (13,2 %) | ✓ exacto |
| 5 | exclusivos 1061/788/2 | **1061 / 788 / 2** | ✓ exacto |
| 6 | hex literales 1134/468/188 | **1134 / 468 / 188** | ✓ exacto |
| 7 | 37 internal-head+gap sin `governedBy` | **37** | ✓ exacto |
| 8 | 10 por-crear: 0 declaraciones, 0 lectores | **10/10 confirmadas** | ✓ exacto |

---

## C. Matriz CHROME familia × subfamilia — completa

`/tmp/f4a-0/chrome-matrix.md`: **54 familias, 34 subfamilias**, body + overlay ×
3 temas. Sin truncar (la corrida previa se cortaba en bithire controls).
Notación: `A<n>` = autorada con n hojas · `ph` = presente pero todo degenerado
(`none`/`transparent`/`0`) · `—` = ausente.

**La asimetría de cobertura es el hallazgo:**

- Sólo rottay: `alert`, `anchor`, `avatar`, `backTop`, `calendar`, `collapse` …
- Sólo bithire: `collectionCard` …
- Las tres: `accent` (A6 · A6 · A6), `card` (A5 · A5 · A5), `cardComponent`
  (A29/A20 · A36/A18 · **A4/A2**)

`cardComponent` es el retrato del frente: la misma familia autorada con 29, 36 y
**4** hojas. Evnto no es "más simple" — está **vacío**.

---

## D. Los 6 nudos, medidos hoy

**1 · border / border-primary.** rottay los tiene **idénticos** en los 2 scopes
(`#28282C`/`#E5E5E3`); bithire idénticos salvo el case (`#d4e0ea` vs `#D4E0EA`);
**evnto los ata al revés**: `--ds-color-border: var(--ds-color-border-primary)`,
con `border-primary` en `rgba(0,0,0,0.08)`/`#2E2C24`. Tres temas, tres
relaciones distintas para el mismo par. Es el bloqueo de W2, confirmado.

**2 · tier.page.fg.** Cabeza `--ds-sidebar-item-color`, `solo-artefacto`,
gobernada por `navigation.sidebar-tone`. **42** canales de rottay con su mismo
valor, y **tres destinos rivales con el valor idéntico**: `--ds-color-accent`,
`--ds-color-neutral-500`, `--ds-color-secondary`. El destino correcto no existe
como raíz.

**3 · `--ds-color-primary`.** **Congelada en los tres**, con lectores
arrastrados: rottay 25 · bithire 90 · evnto 20. **135 canales** cuelgan de tres
literales de marca.

**4 · asimétricas.** Ver §A.4: 16 raíces con un tema en cero, 14 de ellas DD.

**5 · H4 bithire table.** `--ds-table-bg` y `--ds-table-row-bg` valen **lo
mismo** (`#ffffff`/`#0f1520`) y **difieren** de `--ds-surface-control`
(`#FFFFFF`/`var(--ds-color-bg-primary)`). No es cero-delta contra
`tier.control.bg`: bien excluido de la ola 3.

**6 · las 10 por-crear.** **Confirmado: 0 declaraciones y 0 lecturas** en los
tres artefactos, las diez. `--ds-state-{active,selected,pressed,checked,expanded}-shift`,
`--ds-surface-accent`, `--ds-color-border-accent`,
`--ds-control-{padding-ratio-label,gap-ratio}`, `--ds-alpha-8`. Bautizadas en
F2.1 y siguen inertes, como se declaró.

---

## E. Entregables

```
/tmp/f4a-0-baseline.md              este documento
/tmp/f4a-0/walk.mjs                 el walk evaluado (importa dist/, no toca el repo)
/tmp/f4a-0/chrome-matrix.md         54 familias × 34 subfamilias × 3 temas × 2 scopes
/tmp/f4a-0/exclusive-rottay.txt     1061 keypaths
/tmp/f4a-0/exclusive-bithire.txt     788 keypaths
/tmp/f4a-0/exclusive-evnto.txt         2 keypaths
/tmp/f4a-0/internal-head-sin-gobierno.json  las 37 con valor por tema
/tmp/f4a-0/asignaciones-delta.json  las 95 divergencias raíz×tema
/tmp/f4a-0/tier-page-fg-43.txt      los 42 canales
/tmp/f4a-0/literal-vs-derivado.json
```

---

## F. Lo que F4A-1 tiene que decidir antes de escribir el esquema

1. **La regla de metadato** (§A.1): enumerada, no un número heredado. Sin eso el
   denominador de pintura no es citable.
2. **Qué es una asignación** (§A.2): 104 de diferencia no se arregla midiendo
   otra vez, se arregla definiendo.
3. **Las dos referencias `var()` que faltan** en rottay y evnto (§A.3): o
   aparecen, o la predicción venía de otro árbol.
4. **Los tres destinos rivales de `tier.page.fg`** (§D.2): promover una tinta
   secundaria a raíz, o aceptar `--ds-sidebar-item-color` con su nombre torcido.
5. **`--ds-color-primary`**: 135 lectores arrastrados por tres literales. Es la
   palanca más grande del frente y sigue sin dueño.

**Ninguna de las 5 se puede resolver midiendo. Las cinco son adjudicación.**
