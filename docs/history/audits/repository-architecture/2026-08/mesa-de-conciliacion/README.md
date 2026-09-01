# Mesa de conciliación — Daniel · Cloud/Fable · Codex · Kimi K3

Fecha: 2026-08-28.<br>
Estado: advisory, listo para decisión del owner.<br>
Base principal: HEAD `f166570d92433fe1437133975732003c1fd29a32`.

## Resultado

La dirección arquitectónica es correcta. Lo que falta probar es la última
milla: que cada control cambie todas las familias declaradas, no sólo una
variable o dos componentes, y que ningún hardcode brandable activo deje el skin
inconsistente.

Los tres revisores convergen en un cambio de orden acotado:

1. recuperar confianza en instrumentos y proyecciones;
2. reparar conexiones causales reales;
3. ejecutar una canaria visible de tres familias con timebox de 48 horas;
4. reconstruir el mapa de hardcodes/cascada antes de fijar baseline;
5. escalar por ownership disjunto;
6. preparar delivery en paralelo, sin publish/repin hasta cerrar consumidores.

No se modificó el roadmap real, el programa, los manifests ni la implementación
como consecuencia de esta mesa. Los únicos escritos propios son documentos de
reauditoría bajo `docs/reauditoria-cloud/`.

## Documentos de la mesa

- [`01-manifest-source-of-truth.md`](01-manifest-source-of-truth.md): qué manda
  el manifest y qué evidencia falta para afirmar cascada.
- [`02-posturas-y-consenso.md`](02-posturas-y-consenso.md): postura de cada
  modelo, consenso firme, resoluciones conservadoras y propuestas rechazadas.
- [`03-roadmap-propuesto-no-aplicado.md`](03-roadmap-propuesto-no-aplicado.md):
  secuencia rápida, dependencias, paralelización, timeboxes y exit gates.
- [`04-decisiones-para-daniel.md`](04-decisiones-para-daniel.md): decisiones que
  no puede tomar ningún agente por el owner.

## Posturas originales preservadas

- Cloud/Fable: [`../06-reauditoria-cloud-sobre-codex-kimi.md`](../06-reauditoria-cloud-sobre-codex-kimi.md)
  y [`../07-correcciones-y-consenso-owner.md`](../07-correcciones-y-consenso-owner.md).
- Codex: [`../reauditoria-codex/revision-post-cloud-v2.md`](../reauditoria-codex/revision-post-cloud-v2.md).
- Kimi K3: [`../reauditoria-kimi/revision-post-cloud-v2.md`](../reauditoria-kimi/revision-post-cloud-v2.md).

Las diferencias no se borraron: la mesa usa la postura más conservadora cuando
no hubo prueba común. En particular, no adopta 760/960 como baseline, no acepta
el fix de PageShell sin A/B y no convierte `palette.dark` en un parche de
validación sin decidir su UX.

## Hallazgos que cambian el próximo tramo

- Expert vivo 290 vs 294 constitucional y 67 en proyecciones stale.
- Button-style registrado pero no productivo sobre los cinco tamaños.
- Población real —aún no baselinable— de fallbacks literales sin productor.
- Recipe profile perdido en code-owned y paridad de anatomía no consciente del
  transporte.
- PageShell móvil, filtro Expert profundo y UX de dark mode.
- app-platform: 102 archivos en la unión real; 14/15 símbolos con destino
  conocido, sólo `ProductWindow` necesita decisión.
- `dist/*.css`: Next resuelve red, pero CI de publish ve cuatro fallos de
  presupuesto antes de minificar.
- Evnto intenta compilar otro repo y espera un `platform.css` retirado.
- Evidencia local: 63 memos respaldados, 11 vivos y 36 sin recuperar.

## Lo que Daniel debería decidir al volver

1. Autorizar o no T-1 Expert.
2. Autorizar o no la canaria F4C de 48 horas.
3. Definir la precedencia de Button en BitHire.
4. Definir la ventana de app-platform y el destino de `ProductWindow`.
5. Elegir la UX de `palette.dark` fuera de `auto`.
6. Decidir respaldo/CI remota sin ampliar por accidente la autoridad de push.
