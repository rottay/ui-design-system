# Reauditoría Kimi (consultoría read-only del owner) — sobre Cloud y Codex

Fecha: 2026-08-28 · HEAD verificado: `dcc44a6093de0ba4f9dcbdb733ae467008cffb21`
Carácter: advisory, independiente, read-only sobre programa/roadmap/implementación.
Perímetro: no se leyeron ni controlaron los panes modern-rescue; no se tocó
roadmap, programa, manifests ni implementación. Esta carpeta es la única escritura.

Actualización posterior: [`revision-post-cloud-v2.md`](revision-post-cloud-v2.md)
reproduce la segunda pasada de Cloud y participa de la
[`mesa de conciliación`](../mesa-de-conciliacion/README.md).

## Qué es esto

Tercera lectura. Cloud produjo la auditoría primaria (96 ópticas, RC-01..43,
evidencia sighted propia). Codex reauditó a Cloud y corrigió denominadores,
causalidad y varios fixes. Esta sesión (Kimi, consultoría read-only pedida por
el owner) reprodujo contra HEAD y worktree las afirmaciones centrales de ambos
y adjudica dónde discrepan. Ni Cloud ni Codex ni este informe son autoridad del
programa: sus hallazgos entran al árbol canónico sólo si el DT los reproduce,
según la ley del programa.

## Veredicto ejecutivo

**Codex gana en método; Cloud gana en frescura de evidencia de producto; los dos
coinciden en lo único que importa: la dirección arquitectónica se sostiene y la
secuencia necesita un tramo visible ya.**

- Los números duros de Cloud que pude re-ejecutar reproducen **exactos**
  (divergencia 34,5 %, 2169/4373, 672 commits, 5.385.897 B, a037d3a3c colgante,
  anatomy=0 en el brazo estático, appearance desestructurado, editorMetadata=0).
- Codex demuestra que varios de esos números **no significan lo que Cloud
  concluye** (divergencia léxica ≠ producto; hojas de schema ≠ diales; 72,6 %
  mezcla keypaths jamás definidos; minificación ya ocurre en el consumidor).
- Codex aporta el hallazgo más grave de toda la ronda, que Cloud omitió:
  **el denominador Expert driftó (fuente viva 290 vs constitución 294) y
  `program-check` queda verde comparando copias stale entre sí**. Yo verifiqué
  los dos extremos: `program/index.json:65` exige 294 y
  `manifest/controls/token-overrides.json:65` declara 290 publicados. Su
  sub-afirmación "67" en `manifest/cascade/roots/token-overrides.json` no la
  reproduje (mi grep no encontró ningún conteo en ese archivo).
- Cloud aporta dos cosas que Codex no tiene: la lectura sighted propia
  (bithire vs tenant DB = recolor + font swap) y la medición de ergonomía del
  editor (2.212 hojas, 0 editorMetadata). Son evidencia de producto real, no de
  métrica; sobreviven a las correcciones de Codex.
- Ambos proponen fixes rotos en algún punto, y cada uno atrapó los del otro:
  Cloud propuso un push que viola la valla y no encendería CI (ci.yml sólo
  escucha main/develop), un fallback de botón vacuo y un swap RTL de safe-area
  físicamente incorrecto; Codex cifra con precisión pero sus números de cascada
  alternativos (881/1610, 407/440) y su gzip post-minify (344 KB) no los pude
  re-ejecutar en esta sesión (el owner vetó más comandos) — quedan como
  afirmaciones plausibles no reproducidas por mí.

## Autocrítica de esta consultoría

Mi primera pasada recomendó como "cambio mínimo" el fallback de una línea en
`button.css:73`. **Estaba mal y lo retiro**: Codex tiene razón —
`--ds-button-md-radius` ya se define siempre
(`presentation/components/button.css:48` → `--ds-button-md-border-radius`),
así que un fallback hacia `--ds-radius-button` jamás dispararía. El fix real es
que la rama del dial derive los canales por tamaño de la familia, con prueba
computed + sighted en los cinco tamaños (Bloque 1.2 de Codex).

## Estado de mi matriz RC-01..10 tras contrastar con Codex

Mi matriz anterior queda así corregida (detalle en
[`matriz-consenso.md`](matriz-consenso.md)):

- Mantengo CONFIRMADO de hecho: RC-01, RC-02 (números), RC-03 (número), RC-05
  (defecto), RC-08 (tamaño), RC-09 (lado DS), RC-10.
- Bajo a PARCIAL por interpretación: RC-02 (atribución causal), RC-03 (el
  número no prueba "49,6 % de pintura rota"), RC-04 (es autoridad duplicada,
  no ausencia total), RC-06 (métrica mal construida), RC-07 (hojas ≠ diales),
  RC-08 (impacto de red sobredimensionado).
- Subo RC-09 a "confirmado y probablemente más grave" por la evidencia
  cross-repo de Codex (no reproducida por mí: vive fuera de este repo).

## Qué sigue sin resolver (ninguno de los tres lo cerró)

1. **Qué instrumento manda en cascada**: `cascade-wiring-ratchet` (2169/4373)
   vs `root-membership`/`channel-liveness` (729 sin atribuir, 33 no-LIVE según
   Codex). Es una decisión de instrumento, no de opinión: hay que correr ambos
   sobre el mismo universo y reconciliar clasificadores antes de abrir
   cualquier cola de drenaje.
2. **Cuánto del gap DB es demanda real del editor**: ni el 72,6 % de Cloud ni
   el 52,4 % de Codex miden qué necesita autorar un tenant DB de verdad.
3. **La discrepancia de cifras menores**: 22/22 (Cloud) vs 23 `scope:'tenant'`
   que conté yo; 49 findings (checkpoint) vs 48 (Codex); 116/100 memos (Cloud)
   vs 63+11+36 (Codex). Ninguna cambia una decisión, pero delatan que los tres
  árboles de conteo se mueven distinto — síntoma consistente con RC-10.
