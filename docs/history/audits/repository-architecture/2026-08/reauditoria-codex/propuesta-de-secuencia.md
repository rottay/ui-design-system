# Propuesta de secuencia para consenso

Esta secuencia no fue aplicada. Busca cambiar lo mínimo necesario y conservar
las leyes que siguen siendo útiles.

## Bloque 0 — corregir instrumentos/contratos que pueden mentir

1. **Expert 290:** reconciliar README/program/model/rounds/manifests y añadir un
   check de igualdad contra `TENANT_THEME_OVERRIDE_TOKENS`.
2. **Ceilings schema:** ratificar el fail-closed de `schemaVersion` observado en
   el worktree.
3. **Testigo button-style:** hacer que el gate pruebe el canal que realmente
   produce y el componente que debe pintarlo.
4. **Liveness:** actualizar el checkpoint 49→48 o derivarlo; usar los 33
   no-LIVE/729 sin atribuir como universos de clasificación.

Salida: instrumentos que no quedan verdes por comparar copias o testigos
incorrectos.

## Bloque 1 — defectos causales de último kilómetro

1. PageShell mobile: `inline-size` y browser regression a 390 px.
2. Button style: derivación real hacia la familia por tamaño, con prueba
   computed y sighted en cinco tamaños; no fallback vacuo.
3. `recipes.profile`: restituirlo en `CodeOwnedGovernedBehavior`.
4. Consolidar luego anatomía estática/DB bajo una sola autoridad Theme sin
   afirmar que hoy no pinta.
5. Adjudicar elevación 0–5 y stops redundantes.

Salida: las capacidades ya aprobadas llegan realmente a consumo/pintura.

## Bloque 2 — compatibilidad de entrega antes de publish

Lote cross-repo de `app-platform`:

- migrar 49 archivos del entrypoint `commercial` retirado;
- resolver `ProductWindow` y la nueva identidad de `TreeView` explícitamente;
- reemplazar CSS/aliases retirados;
- reparar `verify-local-ds.mjs`;
- verificar con la DS local y recién después permitir repin/publicación.

En paralelo, el owner decide respaldo/CI. Sin enmienda, ningún agente debe
hacer push.

## Bloque 3 — vertical slice F4C

Seleccionar 6–8 familias insignia y exigir:

- delta visual intencional declarado;
- estático y DB cuando corresponda;
- 390/768/1280;
- light/dark;
- estados relevantes;
- computed evidence y sighted audit;
- full suite local al cierre.

El objetivo no es aceptar por representante: es validar causalidad y costo antes
de escalar a 255 familias. Si el slice funciona, se escala. Si no, se corrigen
los blockers observados, sin abrir modelos nuevos por intuición.

## Bloque 4 — escalado y optimización

- F4C por cohortes, con métricas computadas/sighted.
- F9 sigue siendo per-family/per-cell; los grupos sirven para generar pruebas y
  revisar outliers, no para bajar el denominador 5.100.
- `editorMetadata` obtiene un domicilio ejecutable y el console lo consume.
- Cascada se prioriza por `root-membership`, `channel-liveness` y fanout causal.
- Minificación/split por engine se miden en artefacto y consumidor antes de
  convertirse en bloqueantes.
- Las 63 evidencias persistidas se reanclan; las 36 restantes se clasifican.

## Decisiones aplazadas, no asumidas

- `palette.status-seeds` y cualquier otro dial público nuevo;
- los seis diales propuestos por Cloud;
- ampliar DB con ramps/raw chrome;
- introducir scope `surface|instance` en capabilities tenant;
- cambiar el límite Standard/Pro o la regla de máximo 15;
- permitir una rama remota WIP;
- fallback de identidad de Evnto;
- bundle por engine como contrato público.

## Qué mantener

- las disposiciones F9 por familia/celda;
- Fable como auditor independiente único del programa;
- Kimi K3 como DT/coordinador, no auditor de su propio trabajo;
- separación entre theme controls, recipes/anatomy e instance APIs;
- drills anti-vacuidad, salvo que un perfil de tiempo/riesgo demuestre qué gate
  puede consolidarse sin perder cobertura;
- política no-push hasta una decisión explícita del owner.
