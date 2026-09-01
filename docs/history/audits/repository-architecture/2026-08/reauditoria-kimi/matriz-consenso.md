# Matriz de consenso Cloud / Codex / Kimi (RC-01..RC-10)

Veredictos: Cloud (adjudicación Fable en `02-hallazgos.md`, los 10 como
BLOQUEANTE), Codex (`reauditoria-codex/matriz-consenso-cloud.md`), Kimi (esta
sesión; "reproducido" = ejecutado/leído por mí contra HEAD `dcc44a609`).

| RC | Cloud | Codex | Kimi | Consenso real |
|---|---|---|---|---|
| RC-01 commits sin push / CI / memos | BLOQUEANTE | PARCIAL | **CONFIRMADO el hecho; fix refutado** | Los 3: 672 commits y CI apagada son reales (yo: `ahead 672`, último push 2026-08-03, `ci.yml:3-7` sólo main/develop). Codex y yo: el push WIP viola la valla never-push y **además no dispararía CI**. Memos perdidos: Cloud 100/116, Codex 63 snapshots + 11 vivas + 36 sin respaldo; no resuelto. |
| RC-02 divergencia plana / sighted 0 | BLOQUEANTE | PARCIAL | **CONFIRMADO números; PARCIAL causalidad** | Los 3 reprodujeron 34,5 % (yo: 1240/3598) y `SIGHTED_ACCEPTED: 0` (`manifest/index.json:34`). Codex y yo: métrica léxica de artefactos, plana por diseño en lotes cero-delta; no prueba arquitectura fallida ni sostiene el "20-25 %". La evidencia sighted de Cloud (recolor + font swap) sí vale como señal de producto. |
| RC-03 canales sin raíz | BLOQUEANTE | REFUTADO en formulación | **CONFIRMADO el número; interpretación NO RESUELTA** | Yo reproduje `2169 unwired of 4373` exacto. Codex: el instrumento clasifica fallbacks, no raíces; cita 729 sin atribuir y 33 no-LIVE con instrumentos vigentes (no reproducidos por mí). Acuerdo: no abrir cola de 2.169. Desacuerdo abierto: cuánta deuda real hay. |
| RC-04 anatomía / recipe-profile / scope | BLOQUEANTE | PARCIAL | **PARCIAL** | Confirmado por los 3: `recipes.profile` se pierde en code-owned (`registry/index.ts:154-162`, visto por mí) y el brazo estático del DS no proyecta anatomía (`grep anatomy` en brand-theme = 0). Codex corrige: anatomía sí llega vía brazo DB + atributos estáticos de app; el defecto es autoridad duplicada. Scope surface/instance: los 3 lo mandan a decisión del owner. |
| RC-05 button-style / elevación / stops | BLOQUEANTE | CONFIRMADO, fix Cloud refutado | **CONFIRMADO el defecto; fix Cloud refutado también por mí** | Los 3: `shape.button-style` emite sólo `--ds-radius-button` (`appearance-posture/index.ts:150`) y Button no lo lee; el testigo neutraliza el gate. Codex demuestra (y yo lo confirmo en `presentation/components/button.css:48`) que el fallback de 1 línea es vacuo. Fix correcto: derivación real por tamaño + prueba computed/sighted. |
| RC-06 transporte DB / dark | BLOQUEANTE | REFUTADO como métrica | **PARCIAL** | Codex: 5.187/7.933 keypaths jamás definidos; de los 2.746 definidos, 1.439 (52,4 %) fuera del transporte DB — y el DB es overlay acotado por diseño. Yo: `migrate-v1/index.ts:400-410` documenta la inercia de seeds dark como semántica deliberada. Acuerdo: la cifra no manda; la pregunta real es qué necesita el editor. |
| RC-07 diales / schema / editor | BLOQUEANTE | PARCIAL | **PARCIAL** | Conteos de schema reproducidos por Codex; `editorMetadata` ausente confirmado por mí (grep 0). Los 3: hojas ≠ diales; los 6 diales nuevos y las fusiones exceden la constitución 13+7 y exigen migración atómica/owner. La ergonomía Expert (2.212 hojas, 0 metadata) es el hallazgo que sobrevive. |
| RC-08 bundle CSS | BLOQUEANTE | PARCIAL | **CONFIRMADO tamaño; PARCIAL impacto** | Yo: `dist/bithire.css` = 5.385.897 B raw, sin minificador en la DS. Codex: Next/Webpack ya minifica en el consumidor (~344 KB gzip, no reproducido por mí). Acuerdo: minificar `dist/` mejora distribución/DX; desacuerdo: no es el bloqueante de red que Cloud pinta. |
| RC-09 versionado / apps | BLOQUEANTE | CONFIRMADO y más grave | **CONFIRMADO lado DS; lado app no verificable por mí** | Yo: `a037d3a3c` existe y no está en ninguna rama (riesgo GC real); `dist/` ya no produce `platform.css`/`commercial.css`. Codex amplía: 53 imports en 49 archivos desde el entrypoint `commercial` retirado y verifier roto — fuera de este repo, plausible, no reproducido por mí. Codex corrige: el symlink de evnto es `USE_LOCAL_DS` intencional, no defecto. |
| RC-10 autoridades / métricas | BLOQUEANTE | PARCIAL + hallazgo crítico nuevo | **CONFIRMADO, y el hallazgo nuevo de Codex es el más grave de la ronda** | Yo: `registry.json:3491` sigue diciendo "Codex is DT… Kimi retired" (STALE admitido en `STATUS.md:42`); 74 %/27 % sin fórmula en `STATUS.md:7,18`. Codex: fuente viva Expert 290 vs constitución 294 — yo verifiqué ambos extremos (`program/index.json:65` = 294; `manifest/controls/token-overrides.json:65` = 290). Su "67" en cascade/roots no lo reproduje. |

## Acuerdos a tres bandas (alta confianza)

1. La arquitectura (un lowering, fail-closed, restore, skin-first) se sostiene;
   nadie encontró evidencia para revertirla.
2. El próximo tramo debe ser visible: slice F4C acotado con delta esperado y
   captura A/B, antes de más infraestructura cero-delta.
3. `shape.button-style` + testigo falso, `recipes.profile` perdido y PageShell
   a 390 px son defectos causales pequeños que van primero.
4. Los 6 diales nuevos, scope surface/instance, abrir ramps y el push WIP son
   decisiones del owner, no ítems de backlog.
5. F9 no se reduce por representantes (Cloud lo propone como método; Codex lo
   veta como denominador): los grupos generan evidencia, las 5.100 celdas
   quedan — salvo que el owner decida lo contrario.

## Desacuerdos abiertos

1. **Cascada**: 2.169 "a drenar" (Cloud) vs 729+33 a clasificar (Codex). Mi
   posición: reconciliar instrumentos antes de gastar un solo lote.
2. **Entrega CSS**: minificar como bloqueante (Cloud) vs higiene de
   distribución (Codex). Mi posición: medir en consumidor antes de priorizar.
3. **Memos de auditoría**: 100 perdidos (Cloud) vs 63 reanclables + 36 a
   clasificar (Codex). Sin resolver; barato de cerrar con un script de
   reconciliación.
4. **Severidad global**: 2,61/5 y "20-25 %" (Cloud) no tienen denominador
   defendible; Codex lo dice y yo lo suscribo. Las cifras de programa útiles
   son las ancladas: 0/255, 0/5.100, 34,5 % léxico plano.

## Fixes de Cloud confirmados como rotos (no ejecutar)

- Push WIP sin enmienda (valla) y sin efecto CI (`ci.yml:3-7`).
- Fallback de una línea en `button.css:73` (vacuo: el canal ya está definido).
- Swap RTL de `env(safe-area-inset-left/right)` (coordenadas físicas: el notch
  no se mueve con RTL; introduciría el bug que dice corregir).
- Cola de drenaje sobre los 2.169 del ratchet viejo.
- Emitir CSS para `responsive.posture` (es data del solver, `OPEN_OWNER` ya
  declarado).
