# Reauditoría Codex de la reauditoría Cloud

Fecha de corte: 2026-08-28<br>
HEAD reproducido: `dcc44a6093de0ba4f9dcbdb733ae467008cffb21`<br>
Carácter: advisory, independiente y read-only sobre programa/roadmap/implementación.

## Veredicto ejecutivo

Cloud hizo una revisión útil y encontró deuda real, pero su conclusión necesita
correcciones antes de convertirse en roadmap. No hay evidencia suficiente para
afirmar que Modern Rescue tomó una dirección arquitectónica equivocada. Sí hay
evidencia suficiente para cambiar el **orden del próximo tramo**: cerrar varios
defectos causales pequeños y abrir cuanto antes una cohorte visual F4C, en vez de
seguir acumulando infraestructura cero-delta.

De los diez hallazgos ejecutivos de Cloud:

- uno queda confirmado y es más grave de lo informado (`RC-09`);
- cinco son parciales porque el hecho base existe, pero el denominador, la
  severidad o la corrección propuesta no se sostienen (`RC-01`, `02`, `04`,
  `07`, `08`);
- uno confirma un defecto real pero propone un arreglo que no funciona
  (`RC-05`);
- dos quedan refutados en su formulación ejecutiva (`RC-03`, `RC-06`), aunque
  detrás de ellos existe deuda más acotada;
- uno mezcla higiene documental real con una descripción exagerada del árbol
  de autoridad (`RC-10`).

La estimación Cloud de “20–25 % de probabilidad de completar en 2026” y su rango
de 51–217 días no son reproducibles: no tienen modelo, denominador ni una serie
de lotes comparables. No deben usarse como métricas de programa.

## Cambios que recomendamos discutir para el roadmap

1. Corregir el contrato Expert de 294 a 290 y hacer que el gate contraste la
   fuente viva, no copias constitucionales entre sí.
2. Ratificar el cierre fail-closed de `schemaVersion` que se encontraba en el
   worktree durante esta auditoría.
3. Abrir un lote cross-repo para `app-platform` antes de publicar o repinear la
   DS: migrar el entrypoint JS `commercial`, CSS, aliases y verifier.
4. Cerrar los defectos causales PageShell mobile, `shape.button-style` y la
   pérdida de `recipes.profile` en el brazo code-owned.
5. Ejecutar inmediatamente después un slice F4C de 6–8 familias insignia, con
   delta visual esperado, 390/768/1280, light/dark y estados.
6. Escalar según el resultado computed/sighted del slice. Para cascada, usar
   `root-membership` y `channel-liveness`; no convertir `2169` en una cola.

Esto es una propuesta para consenso con el owner, no una modificación ya
aplicada. En esta reauditoría no se cambió roadmap, programa ni código de
producto.

## Decisiones que siguen siendo del owner

- **Respaldo y CI:** la rama está 672 commits por delante del remoto, pero la
  constitución prohíbe todo push. Cloud no puede convertir un push WIP en paso
  autónomo. El owner debe enmendar la cerca o elegir réplica externa al disco +
  CI local equivalente.
- **P0 de paleta:** no se autorizaron automáticamente los seis diales de Cloud.
  Compiten con `palette.status-seeds`, exceden el modelo operativo asentado y
  algunos duplican autoridades existentes.
- **Scope/instance:** no se recomienda agregar `surface|instance` al registro
  tenant sin una decisión de arquitectura. Theme controls, recipes/anatomy e
  instance APIs son mecanismos separados por la constitución actual.
- **Entrega cross-repo:** la migración de `app-platform` debe tener alcance y
  ventana explícitos antes de cualquier publish/repin.

## Documentos

- [Matriz de consenso](./matriz-consenso-cloud.md)
- [Evidencia reproducida y hallazgos propios](./evidencia-y-hallazgos-propios.md)
- [Propuesta de secuencia](./propuesta-de-secuencia.md)
- [Consenso triangulado y decisiones para el owner](./consenso-triangulado-para-owner.md)
- [Revisión Codex posterior a Cloud v2](./revision-post-cloud-v2.md)
- [Mesa de conciliación final](../mesa-de-conciliacion/README.md)
- [Reauditoría independiente Kimi](../reauditoria-kimi/README.md)

## Método y límites

La revisión se dividió entre tres auditores paralelos —theme/controls,
cascade/plan y delivery/apps— y una sesión Kimi K3 nueva, aislada de los panes
activos de Modern Rescue. Se leyeron primero `AGENTS.md`, `CLAUDE.md` y las
cuatro autoridades del programa. Los hallazgos Cloud fueron tratados como
hipótesis y se reprodujeron desde fuente/HEAD cuando fue posible.

El worktree se estaba moviendo por agentes del programa mientras se auditaba.
Por eso este informe separa el estado del HEAD citado de los arreglos aún no
ratificados observados en el worktree. No se enviaron tareas ni mensajes a los
agentes activos de Modern Rescue.
