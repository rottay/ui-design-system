# Auditoría Fable — Frente F2 (la cascada existe en fuente) — VEREDICTO

- Auditor: Fable (claude-fable-5), 2026-08-20
- HEAD auditado: `a7e479dd0` (árbol limpio antes y después de la auditoría).
  Nota: durante la auditoría el coordinador commiteó `2b3cae707` (docs-only,
  +13 líneas al roadmap §13; `git diff` confirma que no toca ningún archivo
  auditado — el veredicto aplica igual al nuevo HEAD).
- Node: v22.17.0 (nvm), como pide el brief
- Método: verificación de primera mano contra el árbol — cada número recomputado,
  cada mutación restaurada byte-exacta, cero afirmaciones tomadas de palabra.

## Veredicto

**Los cuatro lotes ejecutados (F2.1–F2.4 W2): APROBADOS.** Las 7 verificaciones
del brief pasan contra el árbol, incluida una prueba de restauración del packet
W2 que yo mismo ejecuté (revert→tsc+vite→rebuild→byte-idéntico, ida y vuelta).

**La declaración de cierre "F2-seguro AGOTADO": DEVUELTA con hallazgos.** Mi
barrido independiente (severs Y artefacto completo, 3 temas, resolución var()
por scope) encontró **1 candidato inequívoco sin clasificar** (evnto
`--ds-layout-sider-bg` — el gemelo literal del packet W2), **1 candidato casi
inequívoco sin cerca** (bithire `--ds-card-bg`), y **2 clústeres equívocos que
el residuo declarado no nombra**. Además, la re-adjudicación de los 2 gates
excluded y el domicilio de las 10 raíces aún `por-crear` quedan pendientes de
escritura. Nada de esto invalida lo hecho; invalida la palabra "agotado" tal
como está escrita hoy en §13.

Disposición recomendada: una ola W3 corta (o una enmienda de la declaración
con razones explícitas por candidato) + el commit de re-adjudicación de los
excluded, ANTES de abrir F4A.

---

## 1. Las 7 verificaciones del brief

### 1.1 Packets F2.4 cumplen la declaración de la enmienda — ✓

Verificado contra los diffs de los 3 commits y contra el artefacto en HEAD:

| packet | raíz → canales | verificación de primera mano |
|---|---|---|
| Piloto `14262d45c` | ramp.seed.primary: 6 canales rottay `#FFFFFF`→`var(--ds-color-primary)` + 6 restituciones claras `#0A0A0A` borradas | 12 líneas exactas en el artefacto; rottay base `--ds-color-primary: #FFFFFF` (l.394) y claro `#0A0A0A` (l.1468) — la resolución da los mismos literales que se borraron. bithire/evnto no aparecen en el commit |
| W1 `8f58229e3` | tier.base.fg→`--ds-color-text-primary` (bithire input-color, table-cell-color) + tier.page.bg→`--ds-sidebar-bg` (rottay sidebar-footer-bg) | bithire base `#14283B` (l.366) / dark `#e4e8ed` (l.1407) empatan los literales sustituidos y las restituciones borradas; rottay sidebar-bg `#0D0D10`/`#F4F4F3` ídem; evnto intacto en el commit |
| W2 `a7929df5a` | tier.page.bg (`--ds-sidebar-bg`) ← `--ds-layout-sider-bg` rottay | l.626 sustitución + l.1627 colapso (3 líneas diff); scope oscuro `--ds-sidebar-bg: #0D0D10` (l.824, mismo bloque), scope claro re-declara `#F4F4F3` (l.1763) — cero-delta computado se sostiene |

**El negativo de W2, verificado a nivel de CAMPO** (diff estructural completo de
`mirror-parity.json` pre/post): `surface.*`, `valueParity.commonChannels/
identicalValue/divergentValue`, `cascadePresence.*` y todo `cascadeSeverance`
salvo `rootFrozen.readerEdges/distinctReaders` (31→32, patrón del piloto)
quedaron IDÉNTICOS. Se movieron exactamente los campos del permiso
(identicalRoleShape 291→290, divergentRoleShape 140→141 con la entrada exacta
`--ds-layout-sider-bg`, occurrenceTrap 1937, multiDeclaration 726) más
`provenance` (esperado) y `sourceSkeleton.*` — este último NO estaba enumerado
en la declaración del packet (nit, ver pregunta 2).

**Restauración probada por mí, no de palabra**: revertí los 2 hunks del TS de
rottay, corrí el loop completo (tsc + vite build + build-vertical-artifacts —
ojo: el builder importa de `dist/`, tsc solo no alcanza) y el artefacto rottay
volvió **byte-idéntico al pre-W2**, con bithire/evnto byte-idénticos. Restauré
el TS byte-exacto, repetí el loop, y el artefacto volvió byte-idéntico a HEAD.
`git status` limpio al final. Además `build-vertical-artifacts --check` en HEAD:
3/3 up-to-date (frescura probada, no asumida).

### 1.2 El ratchet (F2.2) muerde en las dos direcciones — ✓

Mutación real del baseline (`cascade-wiring-ratchet.baseline.json`):
- `debt` 2171→2170 (baja artificial): **FAILED** — "debt GREW from 2170 to 2171".
- `debt` 2171→2172 (alza artificial): **FAILED** — "debt SHRANK … lower `debt` …
  decrease-only".
- Restaurado byte-exacto (`cmp` limpio), gate verde de nuevo: `2171 de 4374;
  2203 cableados; 768 raíces/rampas excluidas; 391 skin files` — coincide con
  la declaración de F2.2.

### 1.3 `channel: null` = 0 y las 12 bautizadas sin lectores espurios — ✓

`root-catalog.json`: 63 raíces, **0 con channel null**; channelStatus = 48
existe / 10 por-crear / 5 solo-artefacto (10 por-crear + 2 adopciones = las 12
de F2.1). Grep de los 10 canales bautizados sobre TODO `src/` (ts/tsx/css/mjs):
**0 apariciones** cada uno — "bautizar tampoco es declarar" se cumple, y nadie
les creó lectores por la ventana.

### 1.4 Suite 1683/13 por nombre — ✓ (con una lección de método)

Corrida propia de la pierna 1 (`node --test "scripts/**/*.test.mjs"
"manifest/**/*.test.mjs"`, Node 22): mi primera corrida dio **21** fails porque
mi propio rebuild parcial (tsc+vite sin modern-css/fonts/stamp) dejó `dist/`
incoherente — los 8 extra eran todos de sabor dist (exports-artifact, bundles,
drills APP_ROOT, corpus). Tras `pnpm build` completo:

- Corrida 2: **1683 · 1669 pass · 13 fail**. Corrida 3: **idéntica por nombre**
  (diff vacío de los conjuntos de nombres).
- Los 13 nombres son **subconjunto estricto** de la baseline adjudicada
  histórica de 25 (`/tmp/e-fail1-names.txt`): 13 en común, **0 nuevos**. Nada
  nuevo rojo, nada arreglado en silencio.
- lane-control-drills corrido aparte: 4 suites verdes + tenant-reachability
  **10/13, sin crecer** (union 606 vs rottay 625, los 3 emisores interpolados
  sin enumerador — intactos).

### 1.5 Cadena de sellos fresca y en orden — ✓

- gates:ci verde cubre la frescura de los eslabones con gate (controls-catalog,
  customization-surface --check, tokens-catalog, root-catalog-freshness).
- mtimes en orden: censo 15:59 → reconciliation/kimi/controls 16:00 → gat-07
  16:14 (último).
- **gat-07 verificado por recomputación**: `--check-artifact` exit 0 — "2
  deterministic runs agree (`cd6ba2a8aca72186…`)" — el digest declarado es el
  vigente en HEAD contra el árbol real, no contra el recuerdo.

### 1.6 gates:ci en HEAD — ✓

`pnpm --filter @rottay/design-system gates:ci` con Node 22.17.0:
**`ci-gates OK — 87 blocking gate(s) passed`**, exit 0, con los **2 excluded
visibles** (channel-liveness, lane-control-drills) con razón/dueño/fecha.

### 1.7 Rosters firmados T2/T3 solo REDERIVED — ✓

- En los 3 commits del frente, **cero literales de 64 hex** tocados en
  `rottay-t2-mass-drain.test.ts` / `rottay-t3-mass-drain.test.ts`.
- El conjunto completo de sha256 firmados es **idéntico** entre el pre-frente
  (`0de3acab6^`) y HEAD (md5 del set ordenado: iguales en ambos archivos).
- Lo único que cambió: mapas `REDERIVED` + helper `emittedToday(row)` + censos
  computados (141→140) — exactamente el patrón declarado.

---

## 2. El ataque a la afirmación central: "F2-seguro está agotado"

Barrido propio, independiente del worker: parser de los 3 artefactos (2 scopes
por artefacto, verificado: base + overlay-mode exactos), resolución recursiva de
`var()` por scope, contra (a) el universo severs (50/99/15) y (b) el artefacto
completo (todo canal literal, excluyendo los que ya derivan y las raíces
mismas), cruzado con las 41 raíces `derivationDebt`.

Resultado artefacto-completo: **14 raíces con ≥1 canal literal idéntico a su
cabeza** (el worker midió 15 en W1; la diferencia es exactamente lo drenado por
W2 — consistente). La clasificación del worker cubre bien el ruido: los empates
`none`/`12px`/`20px`/ratios (elevation.ladder 24, glass.recipe 9,
control.ratio.* 13, type.scale/motion.intensity vía `--ds-radius-scale`/
`--ds-density-scale`) son coincidencia de valor, no derivación — categoría (a)
legítima; los 41 canales `#A0A0A5` de tier.page.fg son la colisión declarada
(b); el clúster `--ds-color-border-primary` ×3 temas es el par adjudicado.

**Pero quedan 4 hallazgos que la declaración de agotamiento no cubre:**

### H1 — evnto `--ds-layout-sider-bg` → `--ds-sidebar-bg` (INEQUÍVOCO, sin clasificar)

El gemelo literal del packet W2, en evnto: base `#FAFAFA` vs raíz `#fafafa`
(mismo color computado; solo difiere el case del hex), overlay `#0E0D0B` vs
`#0E0D0B` exacto. Fuente TS presente (`siderBg: '#FAFAFA'` l.528 /
`"#0E0D0B"` l.267). **Cero cercas**: ningún test del árbol referencia
`--ds-layout-sider-bg` (grep completo de `__tests__`), no está en
`evnto-t2-final-drain`, y tier.page.bg tiene asignación completa en evnto
(base+dark) — no aplica ningún blocker de la enmienda. Mismo bonus de
gobernanza que W2 celebró (el sider de evnto pasaría a obedecer
`navigation.sidebar-tone`). Misma forma de packet (sustitución base + colapso
overlay). Si W2-rottay fue seguro, esto es seguro por el mismo argumento,
símbolo por símbolo.

### H2 — bithire `--ds-card-bg` → `--ds-surface-card` (tier.raised.bg) (casi inequívoco, sin cerca)

Paridad computada en ambos scopes (base `#ffffff`≡`#FFFFFF`; dark `#151d2b` ≡
surface-card→var(--ds-color-bg-surface)→`#151d2b`, sin ciclo). Identidad
semántica de nombre (card ↔ surface-card) — el mismo estándar que justificó
sider↔sidebar en W2. **Ninguna cerca encontrada**: `--ds-card-bg` NO es fila
digerida de `mass-c3-bithire-drain` (solo aparece dentro de valores de otros
canales, que no cambian) ni de ningún otro test. Y el propio tema bithire ya
ata `cardBg: "var(--ds-surface-card)"` en otra sección (l.629 del TS) — el
patrón existe en su propia fuente; los literales restantes son la restitución
redundante de manual.

### H3 — evnto `--ds-card-border` / `--ds-card-border-color` (equívoco, residuo SIN DECLARAR)

Paridad computada con `--ds-color-border` en ambos scopes — pero
`--ds-color-border` en evnto es un alias de `--ds-color-border-primary` (la
atadura invertida que el propio W2 documentó). Recablearlos exige decidir cuál
nombre del par es el padre: exactamente el nudo adjudicado a F4A/F4B. Correcto
NO hacerlo en F2 — incorrecto que el residuo declarado no lo nombre. Debe
domiciliarse junto al par.

### H4 — bithire `--ds-table-bg` / `--ds-table-row-bg` → tier.control.bg (equívoco, residuo SIN DECLARAR)

Paridad computada en ambos scopes (dark `#0f1520` ≡ surface-control→
var(--ds-color-bg-primary)→`#0f1520` discrimina contra card/elevated — no es
el empate blanco trivial del base). Pero table↔control es una atribución
semántica que el catálogo no pre-adjudica (0 apariciones en root-checklists) y
el nombre no la da gratis. Decisión de F4A/F4B — nómbrese en el residuo.

### Nota sobre el universo de la afirmación

La frase "dentro de los 150 severos (único universo donde cascadeSeverance
puede bajar)" es internamente inconsistente con W2: `--ds-layout-sider-bg`
(rottay) **nunca estuvo en severs** — severs quedó idéntico (50) pre/post W2;
lo que se movió fue rootFrozen.readerEdges. El universo real del frente fue más
ancho que severs (e incluye H1/H2, que tampoco están en severs). La declaración
de cierre debería re-enunciar el universo con honestidad: "canales literales del
artefacto con paridad computada contra una raíz derivationDebt", no "los 150
severos". Los severs actuales son además 50+99+15=164, no 150.

---

## 3. Las 4 preguntas

### P1 — Los 2 excluded si F2-seguro cierra por agotamiento

**Mi criterio: se re-adjudican explícitamente a las fases que de verdad los
drenan, y esa re-adjudicación (no su cierre) es condición de aceptación del
cierre de F2-seguro.** Fundamento medido, no doctrinal:

- Corrí `channel-liveness --check` en HEAD: la deuda es **idéntica al censo del
  2026-08-19** (24 AUTHORABLE_UNPROVEN_EFFECT + 3 READ_NO_PRODUCTIVE_TERMINAL +
  1 READ_UNPROVEN + 4 UNREAD_EMITTED_NO_KNOWN_ROUTE + 52 unknown-family). Diez
  canales recableados con cero-delta no drenaron NI UN hallazgo — prueba
  empírica de que esta deuda nunca fue drenable por el conjunto seguro: cada
  fila es retirar-o-probar-efecto (autoría), y las escaleras accent/tints/
  overlays/glass son decisiones de valor de tema → F4A/F4B; el resto (y los 52
  unknown-family) → F2-asimétrico.
- `lane-control-drills`: tenant-reachability sigue 10/13 — necesita AUTORAR
  enumeradores para 3 emisores interpolados. Autoría, no recableo cero-delta.
- La letra actual del gates-manifest ("F2's acceptance includes returning this
  gate to blocking with its findings drained by the rewiring") se escribió
  antes de que el dueño partiera F2. Convertir su cierre en condición de
  F2-seguro obligaría a meter decisiones semánticas en la fase que la enmienda
  definió justamente por excluirlas — contradiría la enmienda con la enmienda.
- Lo INACEPTABLE es el estado intermedio actual: dos exclusiones cuyo dueño
  ("F2 cascade front since=2026-08-19") apunta a un frente declarado AGOTADO.
  Una exclusión con dueño muerto es el anti-patrón exacto que la ley de
  exclusión visible existe para impedir.

**Acción concreta**: en el mismo commit que selle el cierre de F2-seguro (o
antes de abrir F4A), reescribir ambos bloques `excluded`: owner →
"F4A/F4B + F2-asimétrico (enmienda de secuencia 2026-08-20)", trackedSince
nuevo, y reason que nombre qué fase drena qué clase de fila (channel-liveness:
escaleras accent/tint/overlay/glass = F4A/F4B, resto + unknown-family =
F2-asimétrico; lane-control: enumeradores = F2-asimétrico). Los drills siguen
blocking (ya lo están). El retorno a blocking sigue siendo "findings drained,
not re-baselined" — esa cláusula no se toca.

### P2 — ¿Es sólida la enmienda de permiso sobre identicalRoleShape/divergentRoleShape?

**Sí, y la verifiqué empíricamente, no solo doctrinalmente.** El diff
estructural de mirror-parity en W2 muestra que la pintura computada quedó
cubierta exactamente por lo que quedó inmóvil: `surface.*` completo,
`valueParity.identicalValue/divergentValue/commonChannels`, `cascadePresence`,
y la partición de severance. Y la identidad de pintura la probé por dos vías
independientes: resolución por scope contra el artefacto y restauración
byte-idéntica del loop completo. Role shape es censo de QUÉ scopes re-declaran
un canal — colapsar una re-declaración redundante es el mecanismo, no un
efecto colateral; el canal pasa a seguir la raíz dinámicamente, que es el
objetivo de gobernanza (el 6.º consumidor de sidebar-tone).

Dos matices para el template de packet:
1. "Se movieron SOLO los campos del permiso" no fue literalmente exhaustivo:
   `sourceSkeleton.*` (censo de la fuente .ts — otra unidad, como el propio
   artefacto advierte) se mueve necesariamente con cada colapso. Enumerarlo
   como sección esperada-móvil, para que el negativo siga siendo falsable.
2. El colapso convierte "cero-delta hoy" en "sigue a la raíz mañana". Con la
   secuencia enmendada eso es correcto (F4 re-valora raíces a propósito), pero
   conviene decirlo en la declaración: el permiso de role shape es también un
   compromiso a futuro, no solo un censo inmóvil.

### P3 — ¿El residuo declarado está completo y bien domiciliado?

**Bien domiciliado: sí. Completo: no.** Lo declarado (par border/
border-primary, tier.page.fg 43, descongelar primary 6+15, las 22 asimétricas,
ratchet 2171→F3) verifica contra el árbol y sus domicilios son correctos. Pero
faltan cuatro colas (sección 2): **H1** (evnto sider — hacerlo o declarar por
qué no), **H2** (bithire card-bg — ídem), **H3** (evnto card-border al nudo del
par), **H4** (bithire table-bg/row-bg a F4A/F4B). Y una quinta de otra especie:
**las 10 raíces `por-crear` siguen sin declaración y sin lector** — correcto
por adjudicación B, pero el cierre de F2-seguro las deja sin dueño programado:
la materialización que §5 ordena debe re-domiciliarse explícitamente
(F2-asimétrico, o F4B cuando nazcan valores/consumidores).

### P4 — ¿Algo viola la letra de §5 o de la enmienda que los gates no vean?

Cuatro cosas, ninguna invisible por accidente — todas son deuda de escritura,
no de ejecución:

1. **§5 bullet 1 ("Materializar las 12 raíces")**: F2 cierra con 10/12 sin
   materializar (0 declaraciones, 0 lectores — verificado). Adjudicación B lo
   justifica y está registrada, pero la letra de §5 queda incumplida sin
   domicilio sucesor escrito. (Ver P3.)
2. **§5 "La red visual (462 PNG, job visual de CI) cubre el recableo"**:
   ningún reporte de F2.4 evidencia una corrida del job visual. La cobertura
   real fue byte/computada (analíticamente más fuerte para cero-delta), pero la
   red que §5 nombra no se ejercitó — que el cierre lo diga, o que se corra una
   vez sobre el estado final del frente.
3. **La frase de universo "dentro de los 150 severos"** (§13, declaración de
   agotamiento): inconsistente con el propio W2 (que drenó fuera de severs) y
   con el conteo real (164). Re-enunciar.
4. **El gates-manifest de los 2 excluded** (P1): su cláusula de retorno quedó
   escrita contra un F2 monolítico que ya no existe. Re-adjudicar en el commit
   de cierre.

Nit menor adicional: la enumeración del negativo de W2 omite `sourceSkeleton`
(P2.1).

---

## 4. Registro de mutaciones de esta auditoría (todas restauradas)

1. Ratchet baseline: debt 2170/2172 → restaurado byte-exacto (`cmp` limpio),
   gate verde.
2. `brand-themes/rottay/index.ts`: revertido a pre-W2 → rebuild completo →
   comparaciones → restaurado byte-exacto → rebuild completo → artefactos
   byte-idénticos a HEAD.
3. `pnpm build` completo corrido al final (dist coherente con HEAD).
4. `git status` final: limpio. Ningún archivo versionado difiere de HEAD.

Evidencia durable: /tmp/fable-f2-gates-ci-head.log, /tmp/fable-f2-pierna1*.tap,
/tmp/fable-f2-fails-run{1,2,3}.txt, /tmp/f2-mp-{before,after}.json (diff
estructural W2), scratchpad sweep-derivation-debt.py (el barrido reproducible).
