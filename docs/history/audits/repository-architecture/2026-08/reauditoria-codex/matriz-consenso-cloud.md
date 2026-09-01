# Matriz de consenso sobre RC-01…RC-10

Leyenda:

- **CONFIRMADO:** hecho, interpretación y prioridad se sostienen.
- **PARCIAL:** existe un problema, pero Cloud exagera, mezcla denominadores o
  propone una corrección no demostrada.
- **REFUTADO EN SU FORMULACIÓN:** el número puede existir, pero no prueba la
  conclusión ejecutiva atribuida.

| ID | Veredicto | Qué se sostiene | Qué corregimos de Cloud |
|---|---|---|---|
| RC-01 | PARCIAL | HEAD estaba 672 commits por delante, ningún ref remoto lo contiene y esos commits no atravesaron CI remota. Hay riesgo de respaldo y trazabilidad. | El push WIP propuesto viola las cercas `never push`. De 110 rutas `/private/tmp` únicas del roadmap, 63 tienen snapshot con SHA, 11 seguían vivas y hasta 36 no tenían original ni snapshot homónimo; no son 100 evidencias perdidas. |
| RC-02 | PARCIAL | La similitud visible BitHire/DB y `0/255 SIGHTED_ACCEPTED` justifican adelantar craft visible. PageShell mobile contiene un bug real. | La divergencia `34,668 % → 34,464 %` compara sets léxicos de declaraciones, no estilos computados. Era esperable que quedara plana durante lotes cero-delta. No prueba arquitectura fallida ni el 20–25 % de probabilidad. |
| RC-03 | REFUTADO EN SU FORMULACIÓN | Hay deuda de atribución/liveness en la cascada. | `2169/4373` reproduce, pero el gate viejo llama “raíz” a cualquier target de fallback. No demuestra 2169 canales sin dial ni 49,6 % de pintura rota. Los instrumentos vigentes dan 881/1610 con raíz atribuida y 407/440 LIVE; quedan 729 sin atribución y 33 no-LIVE para clasificar. |
| RC-04 | PARCIAL | `recipes.profile` se pierde en el brazo code-owned y la autoridad estática/DB de anatomía es asimétrica. | La anatomía sí llega a producción: BitHire estampa el brazo DB y mantiene atributos estáticos propios. El problema es autoridad duplicada, no ausencia total. Agregar `surface|instance` a capacidades tenant no es una consecuencia mecánica y puede mezclar mecanismos constitucionalmente separados. |
| RC-05 | CONFIRMADO, FIX CLOUD REFUTADO | `shape.button-style` sólo emite `--ds-radius-button` y Button no lo consume. El catálogo queda verde con un testigo que apunta a otro canal. Elevación tiene escalones incompletos/redundantes. | El fallback de una línea sugerido no funciona: `--ds-button-md-radius` ya está siempre definido y ganaría. `responsive.posture` es data deliberada hacia el solver, no un canal CSS muerto. |
| RC-06 | REFUTADO COMO MÉTRICA BLOQUEANTE | Existen gaps dirigidos de dark/anatomy y debe revisarse qué necesita realmente el editor DB. | El 72,6 % cuenta como identidad ausente miles de keypaths que nunca tienen valor. Sobre 7.933 paths, 5.187 nunca están definidos; entre los 2.746 alguna vez definidos, 1.439 quedan fuera del transporte DB (52,4 %). Aun así, el DB es un overlay acotado, no un clon exhaustivo de BrandTheme. Abrir ramps/raw chrome no se desprende de esa cifra. |
| RC-07 | PARCIAL | La schema avanzada tiene 2.212 hojas, 2.080 `visual-value`, 1.875 campos chrome y cero `editorMetadata`: la ergonomía Expert necesita trabajo. | Hoja de schema no equivale a dial público. El modelo operativo sigue siendo 13 Standard + 7 Pro y el editor segmenta por familia. Los seis diales propuestos exceden decisiones asentadas y requieren adjudicación/migración atómica. |
| RC-08 | PARCIAL | El CSS distribuido es enorme, concatena tres engines y conserva mucho comentario. Conviene medir split/minificación. | Para las tres apps Next, Webpack ya minifica en producción: el bundle BitHire medido pasó de ~1,04 MB gzip a ~344 KB gzip. Minificar en la DS mejora distribución/DX y otros consumidores, pero no entrega el ahorro de red atribuido por Cloud en estas apps. Los 1.024 nombres no leídos dentro del mismo bundle son un upper bound, no prueba de tokens muertos globales. |
| RC-09 | CONFIRMADO Y MÁS GRAVE | El próximo repin de `app-platform` rompe imports retirados. `dev:local-ds` ya falla. | No son sólo cuatro CSS: hay 53 líneas de import en 49 archivos desde `@rottay/design-system/commercial`, entrypoint JS retirado, además de CSS/aliases/verifier. El symlink Evnto es un modo local intencional (`USE_LOCAL_DS`), no el defecto que describió Cloud. |
| RC-10 | PARCIAL + HALLAZGO CRÍTICO NUEVO | Hay notas de roles, checkpoint de liveness y documentación de engine obsoletos; el juicio `62 % / ~43 %` carece de fórmula reproducible. | El árbol de entrada sí es determinista y las autoridades especializadas son intencionales. El defecto grave omitido por Cloud es otro: fuente viva Expert = 290, mientras README/program/model/rounds/checker exigen 294 y un manifest todavía afirma 67. El checker queda verde comparando copias stale. |

## Propuestas Cloud que no deben ejecutarse como están

- `git push` sin enmienda explícita de la cerca constitucional.
- Crear una cola para “drenar 2169” canales.
- Intercambiar `safe-area-inset-left/right` en RTL; son coordenadas físicas y
  ese cambio introduciría un bug.
- Aplicar el fallback de una línea de Button.
- Emitir CSS para `responsive.posture`, hoy data del solver.
- Abrir `palette.ramps`, raw chrome o seis diales a partir de RC-06/07.
- Añadir `surface|instance` al registro tenant sin decisión arquitectónica.
- Reducir 103 gates a ≤35 sin perfil de tiempo/riesgo; los drills protegen
  contra gates vacuos.
- Eliminar 1.024 tokens sólo porque no se leen dentro del bundle medido.
- Reemplazar las 5.100 disposiciones F9 por aceptación de representantes. Los
  grupos pueden generar evidencia, no reducir el denominador constitucional.

## Correcciones puntuales a causalidad

- PageShell mobile falla, pero la causa reproducida es el root con
  `container-type: inline-size` + `margin-inline: auto` dentro de un flex sin
  `inline-size: 100%`, no un slot lateral.
- De 198 lecturas privadas `--_ds-*` consumidas sin declaración CSS, 194 tienen
  fallback en toda lectura. Las cuatro sin fallback tienen productor TSX/inline.
  No existe el bug runtime masivo descrito.
- El estado `responsive.posture` ya está declarado `OPEN_OWNER`; no es un
  descubrimiento nuevo de Cloud.
