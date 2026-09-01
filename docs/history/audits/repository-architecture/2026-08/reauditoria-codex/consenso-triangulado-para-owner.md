# Consenso triangulado y decisiones para el owner

Este documento cruza Cloud, los tres brazos de reauditoría Codex y la
reauditoría Kimi. No crea autoridad ni cambia el roadmap.

## Consenso firme

1. **La dirección arquitectónica se sostiene.** Ninguna revisión encontró
   evidencia para revertir el lowering único, fail-closed, restore o
   skin-first. El problema es la secuencia y el último kilómetro.
2. **El próximo tramo debe producir evidencia visible.** Después de cerrar un
   bloque corto de instrumentos/defectos causales, conviene un slice F4C de
   6–8 familias, 390/768/1280, light/dark, estados y captura A/B.
3. **Expert está constitucionalmente driftado.** La fuente viva publica 290,
   mientras programa/model/rounds/README/checker fijan 294. Los cuatro canales
   retirados estaban muertos y no deben reponerse. El checker tiene que
   contrastar la fuente viva.
4. **`schemaVersion` era fail-open en HEAD.** El arreglo completo existe en el
   worktree y requiere el cierre normal del programa como lote separado.
5. **`shape.button-style` tenía un defecto real y un testigo falso.** El fix de
   fallback sugerido por Cloud es vacuo; debe derivarse la familia por tamaño y
   probar pintura computed/sighted.
6. **`recipes.profile` se pierde en code-owned.** Anatomía sí pinta, pero por
   autoridades estática/DB asimétricas que deben consolidarse.
7. **PageShell mobile tiene un bug real a 390 px.** La causa reproducida está en
   el sizing del root, no en el slot que señaló Cloud.
8. **`app-platform` necesita un lote cross-repo antes de publish/repin.** La
   rotura incluye el entrypoint JS `commercial`, no sólo CSS. El modo local de
   Evnto es intencional.
9. **No se ejecuta ningún push autónomo.** La constitución vigente lo prohíbe;
   además, una rama WIP no encendería la CI actual sin cambiar el workflow.
10. **Las proyecciones 20–25 % y 51–217 días de Cloud no son métricas.** No
    tienen denominador/modelo defendible.

## Desacuerdos que no conviene ocultar

### Cascada

Cloud quiere drenar 2.169/4.373. Ese output reproduce, pero su ratchet analiza
fallbacks y su etiqueta “root” no equivale necesariamente a raíz canónica ni a
dial. Los instrumentos más nuevos reportan 729 canales sin atribuir y 33
no-LIVE. Kimi reprodujo el 2.169 pero no los dos instrumentos nuevos.

**Salida de consenso:** no drenar 2.169 ni asumir que 729+33 es toda la deuda.
Ejecutar una reconciliación de los tres clasificadores sobre el mismo universo,
separando productores JS/inline, fallbacks legítimos y huérfanos reales.

### CSS

Cloud lo trata como bloqueante de red; Codex midió que Next/Webpack ya reduce
el bundle BitHire a ~344 KB gzip en producción. Kimi confirmó el tamaño raw,
pero no repitió el minificado consumidor.

**Salida de consenso:** medir los tres consumidores reales; minificar el dist
por distribución/DX, y experimentar split por engine sin convertirlo todavía
en bloqueante de producto.

### Evidencia efímera

Cloud reporta 100/116 memos rotos; el recuento Codex encuentra 110 paths únicos,
63 snapshots hash-matched, 11 originales vivos y 36 sin respaldo homónimo.

**Salida de consenso:** reanclar los 63 y resolver el delta 36 con un script
reproducible. No copiar indiscriminadamente todo advisory.

### El `67` stale

Codex reprodujo la frase “67 nombres” en
`packages/core/manifest/cascade/roots/token-overrides.json`; Kimi no la encontró
con su búsqueda. La evidencia de línea existe y no cambia la adjudicación
principal 294→290. Debe eliminarse/derivarse junto con el resto del contrato.

## Secuencia técnica recomendada

1. **Instrumentos:** 294→290 + gate contra fuente; ratificar `schemaVersion`;
   corregir el testigo de button-style; reconciliar el checkpoint 49/48.
2. **Último kilómetro:** button-style real, `recipes.profile`, PageShell mobile;
   después consolidar anatomía y adjudicar elevación.
3. **Slice F4C:** 6–8 familias con delta declarado y evidencia computed/sighted.
4. **Cascada:** reconciliar instrumentos y recién entonces priorizar por
   causalidad/fanout.
5. **Escalado:** F4C por cohortes; F9 conserva 5.100 celdas, usando grupos para
   generación/revisión, no para aceptación por representante.
6. **Entrega:** el lote `app-platform` corre antes de cualquier publish/repin y
   puede adelantarse si esa ventana es inminente.

## Decisiones para Daniel

### D1 · Respaldo y CI

- Opción conservadora: réplica externa al disco + CI local equivalente,
  manteniendo `never push`.
- Opción remota: enmienda explícita para rama WIP y cambio del workflow para
  que esa rama sí ejecute CI.

Recomendación Codex: empezar por la opción conservadora; sólo enmendar la valla
si se quiere que la rama remota forme parte permanente del modelo operativo.
Kimi prefiere la opción remota completa. Cloud propuso sólo el push, que no
alcanza.

### D2 · Autorizar la corrección constitucional Expert 294→290

Recomendación unánime Codex/Kimi: sí, como T-1 acotado, sin reponer canales
muertos y con igualdad exacta contra la fuente.

### D3 · Autorizar el cierre del lote `schemaVersion`

Recomendación unánime: sí, separado de cualquier cambio ajeno y con sus drills
fail-closed. El código está en el worktree, todavía no ratificado.

### D4 · Ventana del lote `app-platform`

Decidir si hay publish/repin cercano. Si lo hay, es bloqueante inmediato. Si no,
debe quedar diseñado y ejecutarse antes de la próxima ventana; no publicar la
DS esperando arreglar consumidores después.

### D5 · Nuevos diales y fusiones Cloud

Recomendación: no autorizar los seis diales ni fusiones antes del slice F4C.
Adjudicarlos nombre por nombre después de observar qué limitaciones persisten
con los controles actuales correctamente cableados.

### D6 · `palette.status-seeds`

Es una decisión distinta de los seis diales Cloud. La reauditoría no demuestra
que sea incorrecto, pero tampoco lo convierte en paso mecánico. Si se autoriza,
debe entrar como migración pública explícita, con stops, source/consumer,
light/dark y retiro/no duplicación de cualquier autoridad previa.

### D7 · Scope de página/surface/instance

Recomendación: probar primero `profileOverrides` y scopes ya existentes en
surfaces reales. Sólo ampliar el registro tenant si esa vía no cubre el caso;
evitar mezclar theme controls con instance props sin adjudicación.

### D8 · Qué porcentaje comunicar

No comunicar 20–25 %, 62 % o ~43 % como avance derivado. Hasta construir un
denominador estable, comunicar métricas ancladas por separado: familias/celdas
aceptadas, sighted, liveness, root membership y gates.

## Lo que no debe cambiar sin una decisión explícita

- denominador F9 de 5.100 celdas;
- roster 13 Standard + 7 Pro y límite constitucional correspondiente;
- separación theme controls / recipes-anatomy / instance APIs;
- roles Kimi DT, Fable auditor independiente único, Codex consultor;
- cualquier push, publish o repin;
- apertura raw de ramps/chrome en el transporte DB.
