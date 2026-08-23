# F4A pre-K4 — Ratificación Fable 5 del ruling DT de secuencia (auditor READ-ONLY)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system`
**Preestado verificado (apertura):** HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` · staged 0 · exactamente UN path dirty y es el DT-owned esperado: `docs/ROADMAP-EJECUCION-2026-08-19.md`. Coincide con el preestado exigido por el encargo. No se restauró nada.
**Cierre:** re-verificado idéntico antes de emitir este memo (mismo HEAD, staged 0, mismo único path dirty).

**Insumos, SHA-256 verificados por mí (todos coinciden byte-exactos con el encargo):**
- Encargo `/private/tmp/f4a-pre-k4-fable-sequence-ratification.prompt.txt` = `b941cc555d7df7fcbb6f74483844a2722b8a60f5b1a736411f025af3b20dcce2`
- Ruling DT `/private/tmp/f4a-pre-k4-dt-sequence-ruling.md` = `baa48c13d99db39c150c4eb2329d189e24e8bb34340a04a83b391549565c7bd2`
- Roadmap dirty `docs/ROADMAP-EJECUCION-2026-08-19.md` = `a4aabddee653cf94f66a7d589a4947bda5fef64a270441ded93e44caae83b202` (diff: +215 líneas, 0 borradas — el asiento "Libro mayor único del DT")
- Mi challenge `/private/tmp/f4a-close-opus-fable-challenge.md` = `e5375ae35be400a78abb492d3d94b6ad112d57989ca02f85fb0968cde2939845`
- Memo Opus `/private/tmp/f4a-close-opus-adjudication.md` = `9ab5229577259f5bc2df76f31522346f42a9dabb2a74c4ac0be438b8a6d15b2a`

**Autoridad aplicada:** por orden más reciente del owner, Kimi queda fuera (ni gate ni dependencia); cadena auditada: Codex DT → Opus/Sonnet writers por riesgo → Fable read-only. Este memo NO exige respuesta ni excepción Kimi en ningún punto.

**Leyes cumplidas:** cero writes al repo, cero tests mutantes/build/generadores/git mutante/prompts a otros panes. Sólo lectura, `shasum`, `grep`, `git diff`/`git show` de lectura, y UN `import()` del módulo de datos congelado `gates-manifest/index.mjs` para contar entradas (sin efectos). Write-set exacto de esta sesión: este memo y su `.ready`.

---

## VERDICT: ACCEPT

El ruling de secuencia queda **ratificado**: la cola vinculante T-0 → T-1a → T-1b → K4 → K5 → deudas/paridad/ratchet/cerca → gates:ci final + auditoría + registro oficial es correcta, completa en sus precedencias sustantivas, y el asiento "Libro mayor único del DT" es fiel a las evidencias. Tres correcciones mínimas vinculantes (R-1..R-3) y seis notas; ninguna cambia el orden ni la adopción de C-1…C-7. Este ACCEPT ratifica el ORDEN y habilita el preaudit del brief T-0; **no autoriza implementación** — esa puerta sigue siendo el preaudit Fable del brief y el postaudit del diff, como el propio ruling declara.

---

## Adjudicación de los 7 puntos del encargo

### 1. Adopción completa C-1…C-7 — CUMPLIDA

El ruling adopta "íntegramente C-1…C-7" y las instancia correctamente: C-1 (fórmula `evaluatedUnion−evaluatedIntersection→0` prohibida; `1918/1823` prohibidos sin derivación — verbatim en ruling y en el asiento, con mi aritmética `2559−342=2217` reproducida exacta); C-4 (clausura completa derivada/pineada: census, AGENTS/CLAUDE, showroom, ~25 site-files — en el asiento verbatim); C-5 (negativas corregidas por referencia; el asiento nombra ambos backups y crash-determinista-sólo-post-fix); C-6 (denominador 14 salvo subsunción citada — en ambos); C-7 (postura `por-crear`/`solo-artefacto` en el work order PRE_F4B — en ambos). C-2 y C-3 se satisfacen por la reapertura expresa (punto 2). Dos piezas adoptadas sólo por referencia deben aterrizar literalmente aguas abajo: la retirada de la frase "habría cazado el defecto actual" (C-5, negativa 2) en el brief T-1a, y la precisión "el pin numérico del baseline, no los invariantes, es hoy la única detección de rotura grosera" (C-7) en el texto del work order PRE_F4B. Son obligaciones de brief, no defectos del ruling.

### 2. Reapertura de la cola — EXPLÍCITA Y JUSTIFICADA

"La reabro expresamente como DT por hechos nuevos verificados" + cuatro hechos. Los hechos 1–3 los verifiqué de primera mano en mi propio challenge sobre este mismo HEAD: (1) el punto de entrada humano publica wave superado, `blockedOn` ajeno al intent y `fable-and-kimi-read-only` como auditor activo (mi §F, verbatim); (2) `program-state --check` existe y no está cableado a `gates:ci` (mi §F); (3) la raza P1 + ventanas P0 de `renameSync` en la suite usada como evidencia (mi §B). El hecho 4 (directiva del owner) está atestado por el propio encargo. El argumento de fondo — "no es aceptable certificar K4/K5 con evidencia dependiente del timing y corregir la credibilidad del gate después" — es el §8.1 de Opus que yo mismo verifiqué como verdadero. Las dos cláusulas que C-2/C-3 exigían reabrir quedan reabiertas en sustancia (la adjudicación "corrección de autoridad y cra-12 después de K4" = K5 v2 §0.1(ii); la "cola vinculante, no se reordena" = `prompt-codex-continue:56`, verificada aún viva en el archivo). Ver N-1 para el asiento de la puerta C-3.

### 3. T-0 primer tranche — CORRECTO, NO INVENTA PROGRESO

Contenido y orden interno (intent → `--write` del bloque stampado con la herramienta canónica → cablear `--check`) coinciden con el §6.4 de Opus que verifiqué seguro: la edición de `blockedOn` no rompe ningún pin de `program-check` (`:956-963`), el bloque README sólo se regenera por `program-state --write`, e invertir el orden pondría CI en rojo o renderizaría un intent falso. "Sin inventar avance" está escrito en el ruling; T-0 corrige declaraciones de autoridad/bloqueo, no registra progreso. Es el primer tranche correcto tras el cambio de rol: mientras el humanEntry publique un modelo operativo retirado, todo "gates:ci verde" posterior arrastra el punto ciego. T-0 no toca roadmap/registry — explícito en el ruling.

### 4. Canon `89 blocking + 2 excluded` — CORRECTO

Re-conté el manifiesto por import esta sesión: hoy **90 = 88 blocking + 2 excluded** (`channel-liveness`, `lane-control-drills`), idéntico a mi challenge. T-0 agrega exactamente UNA entrada blocking (`program-state --check`) → **89 blocking + 2 excluded**. La cerca interina de T-1a (`--test-concurrency=1`) modifica el comando de una entrada existente, no el conteo. Ver R-3 por el arrastre de textos y el segundo movimiento del canon en T-5.

### 5. Registro oficial sólo tras postaudit — CUMPLIDO

La ley por tranche ("…inspección DT del diff, mismo diff completo a Fable, y sólo después registro oficial"), el "no toque roadmap/registry todavía" de T-0, y el paso final de la cola (actualización oficial tras gates:ci + auditoría) son consistentes entre sí y con la excepción legítima: `checkpoint.intent.json` y el bloque README son el objeto propio de T-0, no registro de progreso. El asiento dirty actual es la consolidación misma que el owner ordenó y declara estados de preparación, no cierres (ver punto 7).

### 6. Condiciones de seguridad y precedencia — UNA FALTA SUSTANTIVA (R-1), UNA DE CONSISTENCIA EN DISCO (R-2)

Presentes y correctas: protocolo de restore por backup/prehash idéntico a mi §H (con la prohibición completa `git show HEAD:path > path`/checkout/restore/reset/stash/add/commit/push/R7); tranches atómicos y seriales con pruebas causales y negativas; precedencia dura K4→K5; deudas semánticas antes de ratchet→0; cerca cascade sin mover veredictos; stop conditions delegadas a briefs preauditados; postaudit Fable en cada tranche de escritura. Lo que falta está en R-1 y R-2.

### 7. Libro mayor único del DT — FIEL; NO CONVIERTE PREPARACIÓN EN CIERRE; PUEDE REEMPLAZAR AL HANDOFF (con R-2)

- **Los 14 SHA citados por el asiento: verificados byte-exactos** (cadena K4 v1/v2/v3 + 3 Fable; cadena K5 completa incl. el REJECT v1; cadena close). El brief Opus v2 de K4 citado sólo por SHA resuelve a `/private/tmp/f4a-14a-opus-implementation-brief-v2.md` (N-5).
- **Números reproducidos: exactos.** `268−7=261=95+96+70` está verbatim en K4 v3 (incl. el stop "si no da 261, PARAR"); `2519/2559=98,4%` es `universe−untagged` (2559−40); `40=36+4+0` todas CHROME.table (verificado en mi challenge); `~46 MB/4264 archivos` es mi propia medición; `2559−342=2217`; `8+3+5=16` asimétricas.
- **No convierte preparación en cierre:** "Implementación K4: 0%", "K5 … implementación: 0%", "14/14 medida; ~7/14 diseñada; 0/14 implementada" (normalización fiel de mi "13(+1 C-6)/14"), tabla titulada "Progreso operativo, no certificación", y la Regla de reporte explícita ("producir memos read-only no infla progreso"). El 35–40% queda como estimación del DT, no certificada — exactamente el estatus que Opus y yo le dimos.
- **Manejo de mi memo:** supersede sólo las frases Kimi-como-gate por orden del owner y conserva válidas las correcciones técnicas — es el tratamiento correcto; no reescribe el documento.
- **Reemplazo del handoff:** el asiento porta autoridad, cadena de SHAs, verdades medidas, hallazgos, cola y próximo paso — el estado adjudicativo completo para reanudar. El reemplazo es ÍNTEGRO sólo cuando R-2 se ejecute: hoy el handoff aún conserva estado paralelo vivo en disco.

---

## Correcciones mínimas (vinculantes; ninguna reordena la cola)

- **R-1 — Cláusula de re-anclaje de la vara de evidencia (antes de K4).** K4 v3 y K5 v2 pinean su aceptación contra "pierna 1 = 1717/13 por nombre". T-1a/T-1b cambian esa cohorte por diseño (raza eliminada; el par `export-missing`/`export-unshipped` colapsa determinista). El ruling ordena la baseline pair-aware de T-1b pero NO escribe que la aceptación de K4/K5 se compara contra la baseline RE-ANCLADA registrada en el libro mayor, supersediendo el literal `1717/13` de los briefs pinneados **sin editar los briefs**. Sin esa cláusula, K4 fracasa contra una vara stale o alguien la "arregla" ad hoc a mitad de tranche. Una línea en el asiento la cierra.
- **R-2 — Reducción física del handoff en el mismo lote que commitea el asiento.** El asiento declara "el handoff externo… no conserva estado paralelo", pero `docs/prompt-codex-continue.md` sigue entero en disco, limpio y sin tocar: 6 menciones a Kimi y la ley "cola vinculante, no se reordena" viva en `:56` (verificado esta sesión); `docs/prompt-kimi-continue.md` existe también. Hasta reducirlos a puntero/banner-superseded, coexisten dos autoridades humanas contradictorias — exactamente la clase de defecto que T-0 existe para eliminar. El lote que commitea el asiento debe incluir esa reducción (o el asiento debe declarar el tranche exacto que la hará).
- **R-3 — Arrastre del canon en el brief T-0 (C-2 segunda mitad).** Además de declarar `89 blocking + 2 excluded`, el brief T-0 debe enumerar todo texto VIVO que pinee "88 blocking + 2 excluded" como expectativa vigente y arrastrarlo en el mismo tranche (los asientos históricos quedan como historia, no se reescriben). Y registrar que T-5 volverá a mover el canon si su §5.6 agrega una entrada al manifiesto — el brief de T-5 lo redeclara entonces.

## Notas (no bloqueantes)

- **N-1** Asentar en una línea que la orden del owner 2026-08-21 es la autoridad bajo la cual queda satisfecha la puerta de C-3 (adelantar test-hygiene), nombrando las dos cláusulas reabiertas: K5 v2 §0.1(ii) y `prompt-codex-continue:56`. Hoy la reapertura las identifica en sustancia; nombrarlas la hace inatacable.
- **N-2** Durabilidad: K4 v3 y K5 v2 — los especificantes de los pasos 4 y 5 de la cola — viven sólo en `/private/tmp`, volátil; en el libro mayor sólo sobrevive su SHA. Antes de ejecutar K4, preservar el contenido durablemente (p. ej. `docs/f4a/`) o aceptar el riesgo por escrito.
- **N-3** Los `34/46/132/98` del asiento son medidas de la cadena K5 (indirectas para la cadena close, doblemente cruzadas con métodos distintos — mi §I claim I). Anotarlo evita que un lector las eleve a re-medición de esta ronda.
- **N-4** "Rechazado por falsa colisión de write-sets" comprime un REJECT de cinco correcciones; la falsa colisión (§0.1: write-sets K4/K5 declarados colisionantes siendo disjuntos) era la principal — fiel como causa, opcional anotar "entre cinco correcciones".
- **N-5** Agregar el path del brief Opus v2 de K4 al asiento (`/private/tmp/f4a-14a-opus-implementation-brief-v2.md`, SHA ya citado y verificado): hoy es el único eslabón citado sin ruta.
- **N-6** "F4A estructural ~86%" no enuncia derivación (consistente con 13/15 tranches); enunciarla mantiene la disciplina del propio asiento de no publicar números sin origen.

---

## Cierre

- HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` re-verificado al cierre · staged 0 · único dirty: `docs/ROADMAP-EJECUCION-2026-08-19.md` (intacto por mí).
- Cero writes al repo. Write-set exacto: este memo y `/private/tmp/f4a-pre-k4-fable-sequence-ratification.ready`.
- Kimi: fuera de la cadena por orden del owner; este memo no le exige nada ni lo sustituye por nadie.

# VERDICT FINAL: ACCEPT

La cola T-0 → T-1a → T-1b → K4 → K5 → deudas/paridad/ratchet/cerca → cierre queda ratificada con R-1..R-3 vinculantes y N-1..N-6. Próximo paso conforme al ruling: preaudit Fable del brief read-only T-0 de Opus; sólo tras ese ACCEPT, Opus implementa T-0.
