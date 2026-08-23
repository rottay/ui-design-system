# F4A-15 / K5 — paquete FINAL de decisión para Kimi (Opus, READ-ONLY)

Integrador de arquitectura: Claude Opus, read-only. DT: Codex. Auditor formal:
Fable 5. Challenger de diseño: **Kimi K3 — destinatario de este paquete.**

Propósito: que Kimi adjudique K5 **sin reconstruir el historial**. Este paquete
consolida las rondas previas (Sonnet inventario, Opus v1/v2, Fable challenge,
Sonnet K5c v2, Fable ratificación, Fable preauditoría del paquete) y **no
resuelve ninguna decisión de diseño**.

**Sucesión.** Ésta es la **v2**. Reemite
`/private/tmp/f4a-15-k5-final-decision-packet-opus.md` (v1, SHA `5e53fcad8a02…`)
incorporando **exactamente** las cinco correcciones del **REJECT** de Fable (SHA
`44414513d85d…`). El cuerpo validado —colisiones, MEASURED / FABLE_ACCEPTED /
OPEN_KIMI, las siete decisiones con sus opciones, la regla de los 98, el sidecar
condicionado, el impacto anti-clausura-falsa, los contadores y el prompt— **no se
reestructura**: las ediciones son puntuales y van marcadas `[C-1]`…`[C-5]` y
`[nit]`. **Ninguna decisión de diseño se resuelve en esta v2.**

```
HEAD exigido   9d5582dfdf1d02f1d7e8fd468720b1d829e50454
HEAD apertura  9d5582dfdf1d02f1d7e8fd468720b1d829e50454   -> COINCIDE
worktree       porcelain 0 · staged 0 · unstaged 0 · untracked 0  -> LIMPIO
K4             CERCADO — no tocado, no citado salvo como precedente
```

---

## 0. PRECEDENCIA — qué habilita este paquete (nada)

1. **K4 debe cerrar primero — y NO por conflicto de archivos.** `[C-1]`
   **Los write-sets de K4 y K5 son DISJUNTOS**, medido: el de **K4 v3** son
   **exactamente 3 paths** —`packages/core/manifest/cascade/root-catalog.json`,
   `docs/f4a/roster-variantes.json`, `docs/f4a/roster-variantes.md`— y su
   **invariante 1 PROHÍBE tocar los temas**: *"Cero fuente de tema. Los 3
   `brand-themes/*/index.ts` byte-idénticos, probado por hash"*. K5, en cambio,
   sólo tocaría `brand-themes/*/index.ts`. **La v1 de este paquete afirmaba que
   compartían archivos: era FALSO y queda retirado** — sostenerlo induciría a
   inferir conflictos de merge inexistentes o, peor, a relajar la invariante 1
   de K4.
   La precedencia **se conserva**, sobre sus tres bases verdaderas:
   **(i) orden del programa** — la secuencia del checkpoint es F4A-14 (K4) antes
   de F4A-15 (K5), y el frente serializa **un lote por vez** bajo el DT;
   **(ii) corrección de autoridades después de K4** — la corrección única de
   roadmap/checkpoint fue adjudicada a ejecutarse **DESPUÉS** de K4 (Opus K5 v1
   §8, sostenida por el challenge de Fable);
   **(iii) serialización de gates/lotes** — ambos lotes re-corren la misma cadena
   de verificación/gates, que el DT serializa.
   Ninguna fila de este paquete se despacha antes del cierre de K4.
2. **Este paquete NO habilita K5 ni ningún write.** No es un brief de escritura.
   Es material de adjudicación. El brief de escritura lo emite el DT, con su
   propio ciclo de preauditoría, y sólo después de que Kimi responda.
3. **Orden obligatorio**: K4 cierra -> **Kimi responde este paquete** (adjudica
   los 7) -> DT emite brief -> recién ahí existe un write-set. Saltarse un
   eslabón es condición de PARADA. `[C-3]` **Sin excepción, tampoco para K5a**:
   su contenido no depende de ninguna de las siete decisiones, pero **no salta la
   consulta** exigida por el owner (ver la fila K5a de §7).
4. Placeholders sembrados hasta hoy por el frente K5c: **0**. Este paquete no
   cambia ese número.

---

## 1. Insumos — SHA-256 verificados byte-exactos al abrir esta ronda

| insumo | SHA-256 | verdict propio |
|---|---|---|
| `/private/tmp/f4a-15-k5-opus-adjudication-v2.md` | `3590a3234222bb74386e2dac4cfd945ee064ae82bf3f30629924c7686e3869a9` | COINCIDE |
| `/private/tmp/f4a-15-k5c-sonnet-semantic-map-v2.md` | `fdf3ccc7a1831dce49636afde07d3d5c2f7c73f33bf9a38bc20caff58b3c9c4b` | COINCIDE |
| `/private/tmp/f4a-15-k5c-v2-fable-ratification.md` | `f0a972c08134c3c307435db15a86d498c4bd826708d8789ad574a2e622b6f967` | COINCIDE |
| `/private/tmp/f4a-15-k5-fable-challenge.md` | `65a4604cb8f5bcc617c8f01f368dd0b2b88c3a47c3465388c6d27259c425c32b` | COINCIDE |
| `/private/tmp/f4a-15-k5-final-decision-packet-opus.md` (**v1**, antecesor) | `5e53fcad8a0281e482c22f626ae12d4304380ba798651da0d10b1262a046818b` | COINCIDE |
| `/private/tmp/f4a-15-k5-final-packet-fable-preaudit.md` (**REJECT** de Fable) | `44414513d85d4b3d0d34c177be330b26629a8c61abc0d8a29de1dca582d608ca` | COINCIDE |
| `/private/tmp/f4a-14a-opus-implementation-brief-v3.md` (**K4 brief v3**, leído para C-1 y C-4) | `06ecaa76c0a54b018fa91ca5d1bc68326e83e0af8af49c7779361a9ec0622ff1` | COINCIDE |

Insumos de segundo grado citados por los anteriores (no re-verificados por mí en
esta ronda, sus SHA constan en los memos): inventario Sonnet
`5ea2c0eaef80e802730ae44f139d736565b1f2d51286d8d1adf6b7bd0c2bf2a2`; Opus v1
`ab3002b27a4f4e3de022f2488f35f6a744f64a1ca2c79302800c07276ff160c4`; mapa K5c v1
`d60e893cf9e7ffd40b0d420ff6eb14c91aac2215f32ce0eb7a96bf286ee8456f`; auditoría
Fable K5c `6e11dca156e62ce7bf9f791961797c9336151822b25962701b012dae98714a3a`.

### Sucesión v1 -> v2 — las cinco correcciones del REJECT, con su sitio exacto

| corrección | qué se corrigió | sitio en esta v2 |
|---|---|---|
| **C-1** (bloqueante) | La **premisa** de la precedencia era **falsa**: K4 y K5 tienen write-sets **DISJUNTOS** y la invariante 1 de K4 **prohíbe** tocar los temas. La **conclusión** K4-primero **se conserva**, sobre sus tres bases verdaderas (orden F4A-14 -> F4A-15, corrección de autoridades después de K4, serialización de gates/lotes) | **§0.1** |
| **C-2** | Los dos **37** **SÍ** son el **mismo conjunto** (biyección 1:1 medida). Los dos **34** siguen siendo **distintos** (intacto). Se anota el **tercer 34** (destino del contador de K5a) | **§2** |
| **C-3** | Contradicción §0.3 vs §7-K5a: la precondición de K5a pasa a **K4 cerrado + respuesta de Kimi recibida**, con la aclaración de que su contenido no depende de K-1…K-7 pero no salta la consulta | **§0.3** y **§7** (fila K5a) |
| **C-4** | El restore **no** es universalmente seguro: se escribe el protocolo completo (prehashes, write-set limpio, respaldo verificado por hash, diff post-restore, dirty ajeno intacto) | **§7** (preámbulo) |
| **C-5** | El prompt no portaba el SHA de su insumo único: se añade el **marcador a rellenar por el DT** y el path de la v2 | **§13** |
| **nit** | "10 reglas `data-anatomy-table`" -> **9 selectores** + 1 línea de comentario | **§12** |

Lo que el REJECT verificó **a favor** del paquete y por lo tanto **no se toca**:
M-14 (el byte-claim de rottay, confirmado contra `rottay/index.css:336`), las
citas verbatim de `token-overrides`, la colisión de los dos 34, "Baja #14" como
destino legítimo, los **siete** `OPEN_KIMI` exactos y sin adjudicar, los
contadores, el sidecar condicionado y la declaración anti-clausura-falsa.

---

## 2. COLISIONES NUMÉRICAS — leer ANTES que las tablas

Cinco números del corpus se repiten con **significados distintos**. Confundirlos
produce exactamente la clase de error que ya costó una reemisión. Los marcados
`[re-verificado]` los medí yo en esta ronda contra el árbol en HEAD.

| número | lectura (a) | lectura (b) | ¿mismo hecho? |
|---|---|---|---|
| **33** | `divergentSlots` del sello F4A-13 | placeholders de `table` existentes, **todos OVERLAY** (rottay 12 · bithire 2 · evnto 19) | **NO.** Coincidencia de cifra, contadores distintos |
| **37** | slots **léxicos** de la unión base autorada por los 3 temas | campos **emisibles** del tipo `BrandTableChrome` (34 vivos + 3 muertos) | **SÍ — MISMO CONJUNTO: biyección 1:1 MEDIDA** `[C-2]` (auditoría Fable K5c `6e11dca1…`, campo a campo contra `themes/index.ts:2060-2107`: cero campos emisibles que ningún tema autore, cero hojas autoradas fuera del tipo). La v1 decía que ningún insumo lo establecía: **era falso** |
| **34** | ejes **SEMÁNTICOS** = 37 léxicos − 3 por **colapso de padding** (4 slots -> 1 eje). **Contiene** los 3 canales muertos | canales **emitidos ∩ consumidos** = 37 campos − 3 **muertos**. **Excluye** los muertos y cuenta los 4 canales de padding **por separado** | **NO — son conjuntos DISTINTOS** que llegan al mismo número restando tres cosas sin relación entre sí |
| **34** (el **tercero**) | destino del **contador** de K5a: `untaggedAuthoredLeaves` **40 -> 34** | — | **NO** — es un **valor de contador**, no un conjunto de ejes ni de canales. `[C-2]` No confundir con los dos 34 de la fila anterior: los tres números coinciden y **los tres significan cosas distintas** |
| **40 vs 46** | 40 = hojas autoradas **sin tag** (mueve `untaggedAuthoredLeaves`) | 46 = **silencios semánticos** (terreno de `divergentSlots`/placeholders) | **NO.** Nunca se suman ni se comparan |
| **53 vs 46** | 53 = medida **LÉXICA**, obsoleta para decisión | 46 = medida **SEMÁNTICA**, exacta y ratificada | **NO.** 53 sólo sobrevive como cita histórica |

**Por qué la biyección de los 37 se sostiene, y qué queda fuera de ambos**
`[re-verificado en la v2]`: `BrandTableChrome` declara **38** campos
(`themes/index.ts:2060-2107`). El campo 38 es **`anatomy`** — plano ATRIBUTO,
`derivedChannels: []`, y **autorado por 0 de los 3 temas** (medido: 0 menciones
de `anatomy` en cada `brand-themes/*/index.ts`). Por eso **ambos 37 excluyen
exactamente el mismo campo** y coinciden como conjunto: **37 = 38 − `anatomy`**.
Consecuencia directa para **K-7**: `anatomy` es precisamente el campo que hoy
**no tiene domicilio en ninguno de los dos conteos**, y no por descuido — está
fuera porque **ningún conteo de canal puede contenerlo**.

**Prueba de la colisión del 34** `[re-verificado esta ronda]`: en el skin modern
(`.../engines/modern/skin/{table,data-table}.css`) los tres canales muertos
tienen **0 ocurrencias** (`--ds-table-filter-row-bg` 0,
`--ds-table-filter-focus-shadow` 0, `--ds-table-loading-overlay-bg` 0), mientras
que los cuatro canales del eje padding **sí se consumen**
(`--ds-table-padding-compact` 1, `-comfortable` 1, `-spacious` 1,
`--ds-table-cell-padding` 3). Los tres muertos son hojas **autoradas** (bithire
autora las tres: `filterFocusShadow` está entre las 5 ya-derivadas,
`filterRowBg` entre las ~12 graduadas, `loadingOverlayBg` entre las ~6
candidatas a `baseline`), por lo tanto **están dentro del 34 semántico y fuera
del 34 consumido**. Los conjuntos difieren.

**Consecuencia operativa**: cualquier prosa, gate o sidecar que diga "los 34"
debe decir **cuál de los dos 34**. Un gate que cruce ambos sin distinguirlos daría
verde por construcción.

---

## 3. Tabla **MEASURED** — hechos, no adjudicables

Nada de esta tabla se re-litiga. Reproducido por rondas independientes (Sonnet,
Opus, Fable) con la maquinaria real del programa importada en caliente.

| # | hecho | valor | procedencia |
|---|---|---|---|
| M-1 | hojas autoradas sin tag | **40 = bithire 36 · evnto 4 · rottay 0**, las 40 en `CHROME.table.*`, **0 fuera de la familia** | Sonnet + Opus + Fable (`build()` en vivo) |
| M-2 | descomposición de las 40 | 5 derived + 4 clase A + 6 clase B/C + 1 control-input + 21 (se parten, ver M-9) + 3 seeds evnto = **40** | Fable, verificado contra fuente |
| M-3 | mínimo **K5a mecánico previo a toda decisión de diseño** | **6** = las 5 ya-derivadas + `cellFontSize` (`dial: typography.scale`, precedente dark real en `bithire/index.ts:1641`) | Opus v2 §3, corregido por C-F2 |
| M-4 | unión de slots | **37 léxicos -> 34 semánticos**, un único colapso (eje padding: 4 slots -> 1 eje) | Sonnet K5c v2, ratificado Fable |
| M-5 | silencios **semánticos** | **16 rottay · 0 bithire · 30 evnto = 46**, exacto | Sonnet K5c v2, ratificado Fable |
| M-6 | silencios **léxicos** (histórico) | 19 · 1 · 33 = 53 sobre unión léxica de 37 — el "1 de bithire" es **pseudo-silencio** (cubre el eje bajo otro nombre) | Fable C-F3 |
| M-7 | `anatomy` | **plano = ATRIBUTO, vivo**: policy gate `allowAnatomyVariants` (fail-closed), proyección `data-anatomy-*`, los **3** valores no-default (`ruled`/`zebra`/`open`) con regla propia de skin, capability con `derivedChannels: []` y `derivedRootAttributes` no vacío, `brandThemePath` idéntico a `BrandTableChrome.anatomy` | Sonnet §1 + Fable · **`[re-verificado]`** |
| M-8 | censo de canales en modern | **132** consumidos (`--ds-table-*` únicos, unión `table.css` + `data-table.css`) · **34** emitidos+consumidos · **3** emitidos muertos · **98** consumer-only fuera de `BrandTableChrome` | Sonnet (grep+comm) + Fable (parser propio) · **132 `[re-verificado]`** |
| M-9 | la manta "21 baseline" | **FALSADA por medición**: 3 coinciden con la emisión de 4 raíces tier · ~12 con canales vivos no-raíz · ~6 libres de coincidencia (2 de ellas convergentes con rottay) | Fable C-F1 |
| M-10 | H4 (`bg`/`rowBg`) | **coincide en base, diverge en dark** (`--ds-table-bg` dark `#0f1520` vs `--ds-surface-control` dark `var(--ds-color-bg-primary)`) — sustancia medible del "no es cero-delta" de F4A-0 | Fable §6 |
| M-11 | `PRO_EXPERT` en table | **0** en los 3 temas | Fable §4 |
| M-12 | placeholders | **0 sembrados ahora** · **0 en plano base** · los 33 existentes de table son **todos OVERLAY** | Fable §2 |
| M-13 | sello de contadores F4A-13 | `2559` universo · `342` intersección · `2526` positionIntersection · `4099` tagRegistry · `33` divergentSlots · `40` untaggedAuthoredLeaves | commit F4A-13, reproducido dígito a dígito por Fable en vivo |
| M-14 | precisión de vocabulario | las coincidencias son de **color**, no uniformemente de **byte** (hex CSS es case-insensitive). Byte-idéntico medido: rottay `bg`/`rowBg` `#0C0C0E` = emisión de `tier.base.bg` | Opus v2 §1 |
| M-15 | salvedad rustic | rustic **invierte** la prioridad del padding (genérico primero) y nunca lee `--ds-table-padding-{compact,comfortable,spacious}`: ahí bithire pierde su especificidad por densidad. **No cambia el 46** (universo de autoría, no de consumo por engine) | Sonnet §9, ratificado |

---

## 4. Tabla **FABLE_ACCEPTED** — qué está ratificado, y hasta dónde llega

**Advertencia central: `ACCEPT` de Fable ratifica MEDICIÓN y ARQUITECTURA. NO
ratifica implementación. No habilita un solo tag, placeholder, sidecar, gate ni
corrección de prosa.** Es texto literal de la ratificación.

| # | qué | verdict | alcance exacto |
|---|---|---|---|
| F-A | K5 (inventario Sonnet + adjudicación Opus v1) | **ACCEPT_WITH_CORRECTIONS** | Ratifica: los 40, el 53 léxico, clases A/B/C, las 5 derived, la 1 control-input, los 3 seeds de evnto, H4 base/dark, las anclas documentales. **Corrige**: C-F1 (parte las 21), C-F2 (K5a no es entero mecánico), C-F3 (el 53 es léxico), C-F4 (dos destinos separados). Las cuatro correcciones son **autoridad del paquete** |
| F-B | K5c v2 (mapa semántico Sonnet) | **ACCEPT** | Ratifica como **MEASURED del paso 1 de K5c**: 37->34, 46 = 16/0/30 exacto, `anatomy` plano-atributo, censo 132/34/3/98, las 4 default-inheritance direccionales, el retiro completo de `STOP_NEEDS_SCHEMA`, la salvedad rustic |
| F-C | arquitectura de la adjudicación | **sobrevive entera** | Tercera vía (relación escrita), tres tranches, K5c como lote aparte, consulta de diseño sin inventar consenso. Las correcciones mueven **fronteras**, no la estructura |
| F-D | condición de validez de la tercera vía | **ratificada** | Cumple la ley (`roadmap:271`, "shadowing **no justificado**") **sólo si el régimen de relación-escrita se aplica a TODAS las coincidencias medidas**. Aplicado selectivamente, lo no cubierto vuelve a ser shadowing sin justificar: maquillaje |
| F-E | separación de destinos | **ratificada** | **F4A** documenta relaciones · **F4B/F2-asimétrico** recablea causalidad · **F4C** unifica H4 (`bg`/`rowBg`). Tres decisiones distintas sobre hojas distintas; fusionarlas hace que una decisión de craft arrastre un recableo de identidad |
| F-F | el séptimo `OPEN_KIMI` | **legítimo, no duplica** | Los seis versan sobre domicilios/criterios/razones del plano **CSS-canal**; el séptimo sobre si el plano **ATRIBUTO** entra al roster. Dimensión de transporte que ningún ítem previo contenía |
| F-G | sidecar/gate | **forma ratificada, nada escrito** | Las 3 condiciones de Fable incorporadas (ley en el TIPO, domicilio bajo `variant-parity`, `plane` en el esquema desde el día uno). No crea segunda autoridad |
| F-H | stop de los 98 | **ratificada verbatim** | Ver §5 |

**Notas no bloqueantes del acta** (Fable, no exigen reemisión): puntero interno
colgado en K5c v2 §6 ("stop 8 en §9"); errata "No until muevo" en §10.

---

## 5. Regla de los **98 consumer-only** — contractual, no negociable por tag

**Ratificada.** Ningún `@placeholder` ni tag de tema puede pretender cubrir uno
de los 98 canales consumer-only **como si fuera autoría de `BrandTableChrome`**.
Hoy **no existe campo del tipo** para ellos: darles domicilio de tema es ampliar
la **interfaz** — cambio de CONTRATO —, no etiquetar algo ya declarado.

Los tres tiers **no se mezclan**:

| tier | qué es | cómo se reconoce | ¿cuenta en el roster de temas? |
|---|---|---|---|
| **control de tenant normal** | campo con nombre en `BrandTableChrome` / `TenantThemeDocument`, con `documentPath` y `brandThemePath` propios | está en los **37** campos emisibles del tipo | **SÍ** — es lo que el roster cuenta y lo único que admite domicilio por tenant |
| **`tokenOverrides`** | capability `token-overrides`, **tier `pro`**, `defaultBehavior: 'none; closed allowlist, max 200 entries, fails closed'`, `compat: 'escape hatch, not the model: every recurring override is a candidate for a real capability'` `[re-verificado]` | vía por la que HOY se alcanzan los 98 | **NO** — es vía de escape, no modelo. El propio contrato dice que un override recurrente es **candidato a capability real**: la salida honesta para un canal de los 98 que un tenant necesite es **promoverlo a campo**, no taggearlo |
| **`pro-expert`** | domicilio reservado a controles de tier `pro` **anclados a su propia capability** con el estado autorado medido (precedente F4A-13, `CAPABILITIES.*`) | requiere capability propia existente | **NO es comodín** para canales sin campo. En table, `PRO_EXPERT` medido = **0** en los 3 temas |

Clases observadas dentro de los 98 (nombradas, no exhaustivas): padding de
columnas especiales leading/selection/action (9), `sort-*` (9),
`drag-grip-*`/`drop-indicator-*` (9), `pinned-cell-bg*` (5), `editor-*` (5),
`pagination-*`/`bulk-bar-*` (7), los **sockets de `anatomy`** (6, ver K-7),
`control-size*`/`control-radius`/`control-font-size` (4), tipografía auxiliar
(7), geometría (7), y resto disperso.

**Consecuencia de conteo**: "34" **jamás** debe citarse fuera de su informe como
el tamaño de la superficie personalizable de `table`. Consumida = 132; autorable
por campo con nombre = 37 (34 vivos + 3 muertos); los 98 restantes **no son
silencios de tema**.

---

## 6. Tabla **OPEN_KIMI** — exactamente SIETE decisiones

Ninguna adjudicada. **No atribuyo posición a nadie sobre ninguna**, ni infiero
consenso de los precedentes del programa. Las opciones se presentan con sus
consecuencias medidas; la elección es de Kimi.

| id | decisión | bloquea |
|---|---|---|
| **K-1** | `seed` vs `baseline` en base/dark | K5b · define `baseline` en TODO el programa |
| **K-2** | regla general de root-coincidence governor | K5a ampliado · K-4 |
| **K-3** | criterio graduado para coincidencias con canales no-raíz | K5b (las ~12) |
| **K-4** | las 18 hojas de rottay | K5a/K5b · la promesa `rottay:7259` |
| **K-5** | **sentido** de los 46 silencios | K5c paso 3 (todo placeholder) |
| **K-6** | razón falsable de cada `baseline` | K5b (las ~6) |
| **K-7** | ¿el plano ATRIBUTO entra al roster/placeholder? | sidecar (campo `plane`) · cobertura de `anatomy` |

### K-1 — `seed` vs `baseline` en base/dark

**Pregunta binaria**: ¿`baseline` (plano base) y `seed` (plano dark) son
domicilios **distintos** para la misma clase de dato, o el **mismo** domicilio
con dos nombres según plano?

- **(A) Mismo domicilio, unificar.** Consecuencia: hay que reescribir **o** los
  12 tags `seed` del dark de bithire **o** los `baseline` propuestos en base. No
  ambos regímenes pueden sobrevivir.
- **(B) Domicilios distintos por plano, con ley escrita.** Consecuencia: la ley
  debe decir explícitamente qué significa cada uno **en cada plano**, y el gate
  debe poder verificar la distinción.

Medido: bithire dark ya usa `seed` (12 tags) para la misma clase de dato que la
prosa vigente llamaría `baseline` en base. **Elegir define qué significa
`baseline` en todo el programa, no sólo en table.**

### K-2 — regla general de root-coincidence governor

**Pregunta binaria**: ¿toda hoja cuyo valor **coincida en color** con la emisión
de una raíz del catálogo lleva **obligatoriamente** la relación medida escrita en
su governor?

- **(A) SÍ.** Consecuencia: las 18 de rottay vuelven a ser **mecánicas** y entran
  a un K5a ampliado; el write-set suma `rottay/index.ts`; y como su re-tag **no
  mueve el contador** (ya están cubiertas por el tag de familia), la prueba de que
  sirvió es el **retiro del tag de familia vencido** (`rottay/index.ts:7259`), no
  el ratchet.
- **(B) NO.** Consecuencia: las hojas coincidentes de rottay bajan a K5b y se
  deciden hoja por hoja bajo K-3. K5a queda en **6**.

Restricción de formulación (M-14): el governor debe decir *"coincide en color con
la emisión de X"*, **no** *"es byte-idéntico a X"*, salvo donde se midió byte.

### K-3 — criterio graduado para canales no-raíz

**Pregunta**: ¿dónde está el umbral entre **relación** y **accidente** para las
~12 hojas que coinciden con canales vivos que **no** son raíces del catálogo?

- **(A) Por rol semántico declarado** (mismo rol -> relación; distinto rol ->
  accidente declarado). Ejemplo medido a favor: `rowBgSelected` (`#E8F3FF`) <->
  `--ds-select-option-bg-selected`, mismo rol.
- **(B) Por cardinalidad de la coincidencia** (coincidir con 1 canal -> relación;
  con N -> accidente). Ejemplo medido a favor: `headerFontWeight` (`600`) coincide
  con **14** canales; `pageButtonHoverShadow` con **6**.
- **(C) Sin regla general**: cada hoja lleva razón escrita propia.

Consecuencia común: **sin criterio, cada hoja se decide a ojo y ningún gate puede
verificarlo.** Cualquier opción debe quedar **falsable**.

Caso testigo declarado: **`headerFontWeight` aparece en dos filas** (graduada por
sus 14 coincidencias; convergente con rottay por su valor `600`). No se fuerza a
una sola: es exactamente la hoja cuyo régimen depende de este criterio.

### K-4 — las 18 hojas de rottay

**Pregunta**: destino de las 18 literales de rottay `table`.

- **(A) K5a ampliado**, bajo K-2=(A).
- **(B) K5b**, hoja por hoja, bajo K-3.
- **(C) Fuera de F4A**: su domicilio se decide junto con el recableo en F4B/F2.

Medido: rottay `bg`/`rowBg` (`#0C0C0E`) son **byte-idénticas** a la emisión de
`tier.base.bg`; `cellFontSize` = `--ds-text-body-size`; `rowBorder` (`#222226`) =
`--ds-border-color-muted` +17; `cellColor` <-> 66 canales; sólo `cellPadding`,
`loadingOverlayBg` y `headerFontSize` limpias. **Taguearlas `seed` a secas sería
la misma clase de shadowing que la ley exige escribir para las 10 de
bithire/evnto.** Consecuencia lateral: de esto depende si la promesa vencida de
`rottay:7259` **se cierra** en F4A-15 o **se reescribe**.

### K-5 — el **sentido** de los 46 (forma de respuesta obligada)

**Pregunta, por cada silencio**: la ausencia, ¿es **minimalidad intencional** (el
tenant eligió no autorar, y el fallback del skin **es** la decisión) o
**incompletitud** (el tenant debía autorar y no lo hizo)?

**FORMA OBLIGATORIA: la adjudicación es POR VERTICAL y POR EJE.** Una respuesta
manta —"todos intencionales" o "todos incompletos"— es **inadmisible**: la manta
ya fue falsada por medición una vez (C-F1, ratificada), y un placeholder es una
**afirmación** en una autoridad. Opciones admisibles por celda:

- **(a) minimalidad intencional** -> **NO** placeholder; el governor declara la
  ausencia como decisión.
- **(b) incompletitud** -> placeholder **admisible** (sujeto a K-7 si el eje vive
  en plano atributo).
- **(c) indecidible con la evidencia actual** -> queda **medido como gap sin
  domicilio**, sin placeholder.

Reparto medido a adjudicar: **rottay 16 · bithire 0 · evnto 30**. Dos hechos que
la respuesta no puede ignorar: **rottay, el tenant que el inventario presenta
como limpio, es el segundo mayor deudor**; y **46 no es una cantidad de
placeholders** — la cantidad de placeholders es una **salida** de esta decisión,
nunca su insumo.

### K-6 — la razón falsable de cada `baseline`

**Pregunta binaria**: ¿se admite `baseline` **sin** razón falsable escrita?

- **(A) NO, en ningún caso.** Consecuencia: las ~6 candidatas necesitan razón
  **hoja por hoja** antes de K5b, y cuatro tienen contenido obligatorio medido:
  `headerFontSize` y `headerFontWeight` deben citar la **convergencia con
  rottay** (mismo valor) o el rótulo miente; `radius` debe citar la relación **ya
  escrita en el propio archivo** ("Tables/panels ride the lg radius step"), que un
  `baseline` a secas contradiría; `bg`/`rowBg` deben citar la coincidencia base
  con las 4 raíces tier **y** la divergencia dark, **y** que `--ds-surface-card`
  es el fallback literal del skin (`data-table.css:288`).
- **(B) SÍ, con razón genérica de familia.** Consecuencia: la ley debe definir
  qué hace **falsable** a esa razón genérica, o `baseline` deja de ser verificable.

Medido: hoy **no existe razón falsable para ninguna** de las ~6.

### K-7 — ¿el plano ATRIBUTO entra al roster/placeholder? (nuevo, de F-1)

**Pregunta binaria**: `chrome.<familia>.anatomy` —enum cerrado, policy-gated
fail-closed, `derivedChannels: []`, `derivedRootAttributes` no vacío, mismo
`brandThemePath` que `BrandTableChrome.anatomy`— ¿entra al **mismo**
roster/placeholder de temas que el plano CSS-canal, con domicilio propio por
tenant (`seed`/`derived`/`baseline`/`unassigned`/`pro-expert`)?

- **(A) SÍ, mismo roster.** Consecuencias: hay que **definir qué significa
  "placeholder de atributo"** (hoy `placeholder` sólo tiene semántica de
  canal-ausente); el write-set tocaría los 3 `brand-themes/*.ts` con un
  `@domicile` sobre `chrome.table.anatomy`, **no** sobre un canal; y entra al
  alcance el barrido de las otras **3** familias con `anatomy`
  (`cardComponent`, `sidebar`, `layout`).
- **(B) NO, categoría aparte con ley de cobertura propia.** Consecuencias:
  `anatomy` queda fuera del conteo de canal (como hoy), pero necesita **su propia
  regla de cobertura escrita** o una declaración explícita de estar fuera de
  cobertura. La exclusión ad-hoc en prosa deja de ser aceptable.

En ambos casos la exclusión actual —que hoy vive sólo en prosa— queda reemplazada
por ley escrita. **De esta decisión depende el campo `plane` del sidecar**, y por
eso el sidecar no puede escribirse antes de K-7.

---

## 7. Matriz de tranches futura — según cada decisión

`write-set` marcado **`[depende de Kimi]`** no se estima: inventarlo sería
fabricar precisión. Pruebas causales comunes a todo lote de escritura:
byte-identidad ida y vuelta (**3 builds reales**, hash conjunto de
`facade/artifacts/` + `styles/` idéntico), `failures: 0`, y **negativo
obligatorio** (mutar una hoja etiquetada y comprobar que el contador o el hash
**se mueve**: si no muerde, el tag no prueba nada).

**Protocolo de restore** `[C-4]` — **`git show HEAD:<path> > <path>` NO es una
receta universalmente segura**: **pisa** cualquier cambio previo no commiteado
del archivo. Es admisible **sólo** bajo el protocolo completo que K4 v3 escribe
y que la v1 de este paquete omitía:

1. **Prehashes a `/tmp` ANTES de escribir**:
   `shasum -a 256 <write-set> > /tmp/<lote>-pre.sha`, más los hashes de temas y
   de `facade/artifacts/` + `styles/` para las invariantes de cero-delta.
2. **Write-set limpio al abrir el lote**, verificado path por path. Si un archivo
   del write-set ya venía sucio -> **PARAR**, no escribir.
3. **Respaldo por copia verificada por hash** a `/tmp/<lote>-backup/` antes de la
   primera escritura.
4. **Restore desde el respaldo exacto**, y **diff/hash post-restore contra el
   pre-estado**: `shasum -a 256 <write-set> | diff - /tmp/<lote>-pre.sha` -> vacío,
   y `git status --porcelain` -> vacío.

**Ley general, no negociable**: se restauran **sólo** los archivos del write-set.
El **estado dirty ajeno se preserva siempre** — jamás se borra ni se toca (p. ej.
`stash@{0}`). Prohibidos `git checkout`, `reset` y `stash` (ley post-incidente
2026-02-05).

| lote | precondición | write-set candidato | pruebas causales | STOP |
|---|---|---|---|---|
| **K5a** (mínimo mecánico, **6** hojas: 5 ya-derivadas + `cellFontSize`) | **K4 cerrado + respuesta de Kimi al paquete recibida.** `[C-3]` Su **contenido** no depende de ninguna elección entre K-1…K-7 (sigue siendo mecánico), pero **no salta la consulta** exigida por el owner | `bithire/index.ts` — **1 path** | `untaggedAuthoredLeaves` **40 -> 34** (el **tercer 34**, §2); negativo obligatorio; 3 builds byte-idénticos | Despachar **sin** respuesta de Kimi -> PARAR (§0.3). Si el contador no llega exacto a 34, o si un tag exige cambiar un **valor** -> PARAR (K5 no materializa) |
| **K5a+** (ampliado con las 18 de rottay) | K4 cerrado **+ K-2=(A) + K-4=(A)** por escrito | K5a **+ `rottay/index.ts`** | El contador **NO se mueve** (ya cubiertas por el tag de familia): la prueba es el **retiro del tag de familia vencido** `rottay/index.ts:7259` | Entrar sin K-2 aprobada -> PARAR (C-F2) |
| **K5b** (resto de las 40: 3 de raíz + ~12 graduadas + ~6 baseline + 10 con relación escrita + 3 seeds evnto) | K4 cerrado **+ K-1, K-3, K-6 adjudicadas por escrito** (y K-4 si fue (B)) | `bithire/index.ts`, `evnto/index.ts`, y la entrada "Baja #14" de `variant-parity.baseline.json` **después** de regenerar y verificar | `untaggedAuthoredLeaves` **-> 0**; negativo obligatorio; relación-escrita aplicada a **todas** las coincidencias medidas | Un `baseline` sin razón falsable -> PARAR. Régimen aplicado **selectivamente** -> PARAR (F-D: sería maquillaje) |
| **K5c paso 1** (unión semántica) | — | — | **YA HECHO**: `MEASURED`, ratificado (37->34, 46 = 16/0/30) | — |
| **K5c paso 2** (sentido de los gaps) | K4 cerrado + **K-5 adjudicada por vertical y por eje** | ninguno (adjudicación) | La adjudicación debe ser **falsable celda por celda** | Respuesta **manta** -> PARAR (inadmisible por forma) |
| **K5c paso 3** (placeholders) | K-5 celda por celda **+ K-7 si toca plano atributo** | **`[depende de Kimi]`** — cantidad y destino son **salida** de K-5, jamás 46 ni 53 | Mueve **`divergentSlots`**, **nunca** `untaggedAuthoredLeaves`. No se mezcla con K5a/K5b **bajo ninguna circunstancia** | Sembrar antes de K-5 -> PARAR. Usar 46 o 53 como cantidad -> PARAR. Placeholder sobre uno de los 98 -> PARAR (§5) |
| **sidecar + gate semántico** | **K-7 adjudicada** (define el campo `plane`) + brief del DT | **`[depende de Kimi]`** — bajo `manifest/variant-parity/…`, **nunca** un root nuevo | Proyección **generada** desde el TIPO (`themes/index.ts:2088`) o manual con `lawSource: archivo:línea`; guarda anti-rename estilo `metadataGuard`; ratchet léxico de `variant-parity` **intacto** como unidad propia | Crear segunda autoridad -> PARAR. Alcance inicial > 1 familia / 1 grupo -> PARAR |
| **F4B / F2-asimétrico** (recableo causal) | Fuera de F4A. Frente propio | **`[fuera de alcance de este paquete]`** | La pregunta es *"¿el valor que hoy coincide **debe** moverse junto mañana?"* | Recablear **cualquier** coincidencia dentro de F4A -> PARAR |
| **F4C** (unificación H4, par `bg`/`rowBg`) | Fuera de F4A. Decisión de **craft** | **`[fuera de alcance de este paquete]`** | La unificación **movería el dark** (M-10): no es cero-delta | Unificar el par H4 fuera de F4C -> PARAR |

**Fronteras duras**: K5b no se despacha antes de que sus `OPEN_KIMI` estén
resueltos **por escrito**; K5c no se mezcla con los otros dos; ninguno toca K4.

---

## 8. Sidecar/gate — sólo si Kimi lo acepta

No se escribe nada. Forma propuesta, ya ratificada por Fable, **condicionada a
K-7**:

1. **La ley vive en el TIPO** (`themes/index.ts:2088`, "These win over the legacy
   global value"). El sidecar es **proyección GENERADA** de esa fuente; si la
   extracción automática de docstrings no es viable, archivo manual con
   `lawSource: archivo:línea` **obligatorio** y la misma disciplina de revisión
   que el baseline de `variant-parity`.
2. **Domicilio bajo `variant-parity`**, no un root nuevo — `manifest/semantic-groups/`
   de primer nivel queda **rechazado** (sugiere autoridad nueva). El colapso es un
   paso **DENTRO** de `variant-parity`, no un segundo pipeline, con guarda
   anti-rename estilo `metadataGuard`.
3. **Esquema con `plane: "css-channel" | "attribute"` desde el día uno.** La razón
   no es hipotética: M-7 mide que `table` ya tiene un eje real en plano atributo.
   Un sidecar sin esa dimensión repetiría en código la exclusión ad-hoc que hoy
   sólo vive en prosa.
4. **Alcance inicial: 1 familia (`chrome.table`), 1 grupo (`padding-axis`, plane
   `css-channel`).** El barrido de las otras ~114 familias, y de otros campos
   `anatomy` en plano atributo, es **lote aparte**.
5. **El ratchet léxico existente queda intacto como unidad propia.** El colapso
   semántico es una capa **ENCIMA**, jamás un reemplazo. **No es una segunda
   autoridad.**

---

## 9. Impacto explícito — y qué este paquete NO resuelve

| eje | qué hace K5 | qué NO hace |
|---|---|---|
| **Personalización de tenant** | Organiza **autoridad**: qué hoja tiene domicilio declarado y cuál está shadowing sin justificar. Fija la ley de los 3 tiers (§5) para que nadie confunda un canal sin campo con un silencio de tema | **No agrega ni quita un solo control.** El efecto sobre lo que un tenant puede cambiar es **CERO** en K5a/K5b. Sólo K-7, o la **promoción** de canales de los 98 a campos (fuera de alcance), moverían la superficie |
| **Identidad vertical** | Deja medido que **rottay —presentado como limpio— es el segundo mayor deudor semántico** (16 de 46), y que el par H4 coincide en base y diverge en dark | **No decide** si la tabla adopta la identidad "superficie de control": eso es **F4C**, decisión de craft, sobre el par `bg`/`rowBg` y nada más |
| **Responsive / mobile** | Nada directo. Lo único con arista responsive es el eje **densidad/padding**: el colapso semántico (4 slots -> 1 eje) y la salvedad rustic (invierte la prioridad; ahí bithire pierde su especificidad por densidad) | **No diseña responsive.** Es una **salvedad de medición**, no un diseño. Presentar K5 como avance de responsive sería falso |
| **Craft premium** | Aporte **indirecto**: sin domicilio declarado, todo trabajo premium futuro sobre `table` opera sobre valores cuyo origen no está escrito. K5 elimina el shadowing como excusa | **No pinta nada.** No diseña la superficie premium. Los dueños de eso son F4C (H4) y el programa Quiet Premium |

**Declaración anti-clausura-falsa**: este paquete **no debe presentarse** como
avance de responsive ni de premium, ni como cierre de F4A. Decir lo contrario
sería clausura falsa — el riesgo ALTO ya nombrado por dos rondas.

---

## 10. Errores de v1 que este paquete NO repite

| error de v1 | corrección vigente |
|---|---|
| usar **53** como cifra de decisión | 53 es **sólo medida léxica**, obsoleta para decidir. La cifra viva es **46 semántico** (16/0/30, exacto y ratificado) |
| decir que `anatomy` está **desconectado** del compilador | `anatomy` es **eje vivo en plano ATRIBUTO**: policy gate fail-closed, proyección `data-anatomy-*`, 3 valores con regla de skin, capability propia. Se excluye del conteo de **canal** por pertenecer a **otro plano**, no por estar muerto |
| leer **34** como "todos los sockets de `table`" | Consumidos en modern: **132**. Autorables por campo: **37** (34 vivos + 3 muertos). **98** consumer-only sin campo. Y hay **dos 34 distintos** (§2) |
| leer el **ACCEPT** de Fable como habilitación | **ACCEPT ratifica MEDICIÓN y ARQUITECTURA, no implementación.** No habilita un solo tag, placeholder, sidecar, gate ni corrección de prosa |
| llamar **"byte-idéntico"** a toda coincidencia | Las coincidencias son de **color**; byte sólo donde se midió (rottay `bg`/`rowBg` <-> `tier.base.bg`) |
| **manta `baseline`** sobre 21 hojas | **Falsada por medición**: se parte en 3 / ~12 / ~6. K5a mecánico son **6**, no 24 |
| tratar `~46-49` como cifra | **Superado**: 46 es ahora exacto y ratificado. Sigue **sin ser** una cantidad de placeholders (eso es salida de K-5) |

**Supersesión declarada de la stop 8 de Opus v2**: la cláusula (a) —*"usar 53 como
cantidad de placeholders -> PARAR"*— **sigue vigente**. La cláusula (b) —*"~46-49
como cifra exacta -> PARAR"*— queda **superada** por la medición ratificada: 46
es exacto. Pero **46 tampoco es una cantidad de placeholders**.

---

## 11. STOP global de este paquete

1. **Cero writes de K4.** K4 sigue cercado.
2. **Cero writes de K5** — cero tags, cero placeholders, cero sidecar, cero gate,
   cero corrección de prosa.
3. Cero build, cero generadores, cero tests mutantes, cero git de mutación, cero
   commit.
4. Write-set exacto de esta ronda: **este memo y su `.ready`**. Nada más.
5. Vigentes por herencia declarada: las **stops 1-12** de Opus v2 §6 (con la
   supersesión de §10 arriba) y la **stop nueva** de K5c v2 §6 (los 98
   consumer-only exigen cambio contractual, jamás placeholder).
6. Si `build()` deja de reproducir **40** con las mismas rutas, o aparece una hoja
   sin tag **fuera** de `CHROME.table` / `OVERLAY.chrome.table` -> PARAR: el árbol
   se movió y este paquete caducó.

---

## 12. Repo — apertura y cierre

```
apertura   HEAD 9d5582dfdf1d02f1d7e8fd468720b1d829e50454 · porcelain 0 · staged 0
cierre     HEAD 9d5582dfdf1d02f1d7e8fd468720b1d829e50454 · porcelain 0 · staged 0
```

Comandos read-only ejecutados en esta ronda: `git rev-parse HEAD`,
`git status --porcelain`, `git diff --cached --name-only`, `git diff --name-only`,
`git ls-files --others --exclude-standard`; `shasum -a 256` de los 4 insumos;
lectura completa de los 4 memos; y **cinco verificaciones propias contra el
árbol**: censo de 132 canales `--ds-table-*` en los dos skins modern; los **9
selectores** `data-anatomy-table` `[nit]` (2126/2131 `ruled`; 2140/2148/2154
`zebra`; 2167/2173/2178/2183 `open`) más la línea de comentario 2114 — **10
líneas, 9 selectores**; el bloque de
capability `Anatomy variants` (`derivedChannels: []`, `derivedRootAttributes`,
`defaultBehavior` fail-closed); el bloque `token-overrides` (tier `pro`, escape
hatch); y el contraste de consumo **dead-3 (0/0/0) vs padding-4 (1/1/1/3)** que
prueba la colisión de los dos "34".

**Verificaciones propias añadidas en la v2**, para no adoptar el REJECT por
confianza: `BrandTableChrome` declara **38** campos en
`themes/index.ts:2060-2107`, y **`anatomy` está autorado por 0 de los 3 temas**
(0 menciones en cada `brand-themes/*/index.ts`) — lo que ancla `37 = 38 −
anatomy` y sostiene la biyección de **C-2**; y el **write-set de 3 paths**, la
**invariante 1** y la **§9 Restore** de K4 v3
(`f4a-14a-opus-implementation-brief-v3.md`, SHA `06ecaa76…`, líneas 14, 60-65,
348-352, 491-506), que anclan **C-1** y **C-4**. **Cero escrituras al repo.**

---

## 13. PROMPT FINAL PARA KIMI — listo para copiar

```text
Sos Kimi K3, challenger de diseño del programa Modern Rescue, READ-ONLY.
Codex es DT. Fable 5 es auditor formal. Opus es integrador de arquitectura.

Tarea: ADJUDICAR K5 (F4A-15). Sos el único que puede resolver las siete
decisiones de diseño abiertas. Nadie te atribuyó posición sobre ninguna.

Repo: /Users/daniel/Developer/Rottay/ui-design-system
HEAD obligatorio: 9d5582dfdf1d02f1d7e8fd468720b1d829e50454
Worktree obligatorio: limpio, staged 0. K4 SIGUE CERCADO: no lo toques.

Insumo único y suficiente (no reconstruyas el historial):
- /private/tmp/f4a-15-k5-final-decision-packet-opus-v2.md
  SHA-256 del paquete: <<RELLENA EL DT AL EMITIR v2>>
Verificá ese SHA-256 ANTES de leer nada. Si no coincide, PARÁ y reportalo:
estarias leyendo un paquete que no es el emitido.
Insumos de respaldo, sólo si necesitás la evidencia cruda de un punto
(verificá SHA antes de leer):
- /private/tmp/f4a-15-k5-opus-adjudication-v2.md
  3590a3234222bb74386e2dac4cfd945ee064ae82bf3f30629924c7686e3869a9
- /private/tmp/f4a-15-k5c-sonnet-semantic-map-v2.md
  fdf3ccc7a1831dce49636afde07d3d5c2f7c73f33bf9a38bc20caff58b3c9c4b
- /private/tmp/f4a-15-k5c-v2-fable-ratification.md
  f0a972c08134c3c307435db15a86d498c4bd826708d8789ad574a2e622b6f967
- /private/tmp/f4a-15-k5-fable-challenge.md
  65a4604cb8f5bcc617c8f01f368dd0b2b88c3a47c3465388c6d27259c425c32b

QUE TENÉS QUE PRODUCIR

Respuesta PUNTO POR PUNTO a las SIETE decisiones de la seccion 6 del paquete.
Ninguna puede quedar sin respuesta, y ninguna se responde por referencia a otra:

  K-1  seed vs baseline en base/dark            -> elegí (A) o (B)
  K-2  regla general de root-coincidence        -> elegí (A) o (B)
  K-3  criterio graduado para canales no-raiz   -> elegí (A), (B) o (C)
  K-4  las 18 hojas de rottay                   -> elegí (A), (B) o (C)
  K-5  sentido de los 46 silencios              -> POR VERTICAL Y POR EJE
  K-6  razon falsable de cada baseline          -> elegí (A) o (B)
  K-7  el plano ATRIBUTO en el roster           -> elegí (A) o (B)

Reglas de forma, no negociables:
1. K-5 NO admite respuesta manta. "Todos intencionales" o "todos incompletos"
   es INADMISIBLE: la manta ya fue falsada por medicion una vez (C-F1). Adjudicá
   por vertical (rottay 16 / bithire 0 / evnto 30) y por eje, con (a) minimalidad
   intencional, (b) incompletitud, o (c) indecidible, celda por celda o por grupo
   de ejes explicitamente nombrado. 46 NO es una cantidad de placeholders: la
   cantidad es SALIDA de tu decision.
2. Si elegis una opcion, decí que consecuencia de las listadas aceptas. Si
   rechazas las dos/tres opciones, proponé una tercera con su consecuencia medida.
3. No inventes numeros. Si necesitas una medicion que no esta en el paquete,
   declarala como pendiente; no la estimes.
4. Respetá las colisiones numericas de la seccion 2: hay dos "33", dos "37" y
   DOS "34" DISTINTOS (ejes semanticos vs canales consumidos, conjuntos
   diferentes). Decí siempre cual estas usando.
5. La regla de los 98 consumer-only (seccion 5) es contractual: ningun placeholder
   ni tag de tema puede cubrirlos. Si tu adjudicacion la toca, decilo explicito y
   nombrala como cambio de CONTRATO.
6. ACCEPT de Fable ratifica MEDICION, no implementacion. No lo cites como
   habilitacion de nada.

STOP GLOBAL (identico al del paquete):
- Cero writes de K4. Cero writes de K5: cero tags, cero placeholders, cero
  sidecar, cero gate, cero correccion de prosa.
- Cero build, cero generadores, cero tests mutantes, cero git de mutacion,
  cero commit.
- Tu write-set exacto son DOS archivos y nada mas.
- Verificá HEAD y worktree limpio a la APERTURA y al CIERRE, y dejalo escrito.

SALIDA UNICA:
- /private/tmp/f4a-15-k5-final-kimi-challenge.md
- al terminar: touch /private/tmp/f4a-15-k5-final-kimi-challenge.ready

VERDICT obligatorio en la primera linea del informe, uno de:
  ACCEPT                      (el paquete es correcto y adjudicás los 7)
  ACCEPT_WITH_CORRECTIONS     (adjudicás los 7 y corregis hechos del paquete)
  REJECT                      (el paquete no es adjudicable: decí exactamente
                               que medicion falta o que hecho es falso)

Incluí en el informe: SHA de todos los insumos que leiste, HEAD y worktree a la
apertura y al cierre, y la lista de comandos read-only que ejecutaste.
```

---

`VERDICT: READY_FOR_KIMI_FINAL_CHALLENGE_V2`
