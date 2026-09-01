# Decisiones reservadas para Daniel

Estado: borrador de conciliación, no aplicado.<br>
Nada de esta lista autoriza cambios al roadmap, push, publish o repin.

## D1 — Respaldo y CI

Situación: el trabajo está cientos de commits por delante del remoto y la
constitución prohíbe todo push por agentes.

Propuesta:

- preservar Git fuera de la máquina mediante el mecanismo que autorices;
- si querés CI remota, enmendar explícitamente la cerca para una rama espejo y
  PR draft; el workflow actual se activa con el PR, no requiere ser reescrito;
- preservar aparte la evidencia efímera: un bundle Git no contiene memos que
  sólo existen en `/private/tmp`.

Sin tu autorización no se ejecuta ninguna de estas acciones externas.

## D2 — Precedencia de Button en BitHire

`shape.button-style` no cambia el Button pintado. Para Rottay/Evnto el fan-out a
cinco tamaños es directo; en BitHire la hoja authored
`chrome.controls.buttonGeometry.radius` gana en el brazo estático.

Decisión necesaria: ¿un `surfaces.buttonStyle` tenant debe prevalecer sobre la
geometría authored de la vertical, o BitHire debe conservar su excepción? La
implementación y su prueba por brazo dependen de esa respuesta.

## D3 — Excepción de orden para la canaria F4C

La propuesta conciliada adelanta una canaria visible de tres familias después
del bloque corto de instrumentos/conexiones. Si la cola vigente impide abrirla,
necesita una excepción escrita y acotada; no una reescritura general del
programa.

Recomendación: autorizar S2a con timebox de 48 horas y stop condition si la
gramática causal falla.

## D4 — Ventana de app-platform

El próximo repin no es compatible con la superficie actual de app-platform:
hay imports JS del entrypoint retirado, CSS, aliases y un verifier que espera
artefactos eliminados. La unión real alcanza 102 archivos: 22 nombres
`--ds-commercial-*`, 1.329 referencias y 82 archivos sólo en la superficie de
tokens, además de imports y CSS.

Recomendación: autorizar diseño y preparación en paralelo ahora, y exigir la
migración completa antes de cualquier publish/repin. Si el repin es inminente,
el lote pasa a bloqueante de entrega.

De 15 símbolos, 14 ya tienen destino conocido; `TreeView`/`TreeNode` migran a
`TreeViewConnector`/`TreeViewConnectorNode`. Sólo hay que adjudicar el reemplazo
de `ProductWindow`, usado en seis imports.

## D5 — Nuevos diales y fusiones

No se propone autorizar seis diales ahora. Primero hace falta la canaria y el
mapa de mutación/cascada.

Un dial nuevo sólo entra si:

- el gap aparece en varias familias o capas;
- ningún control/raíz existente puede gobernarlo;
- funciona por static y DB;
- mueve computed styles;
- retira atómicamente el predecesor.

`focus.identity` y `control.size` son candidatos de estudio, no backlog
aprobado. Las fusiones requieren solape observado de consumidores/property
groups, no similitud de nombres.

## D6 — `palette.dark` y expansión DB

Hoy `palette.dark` queda ignorado cuando `backgroundMode !== auto` sin una
explicación útil al editor. El contrato de validación no tiene warnings en una
respuesta exitosa.

Recomendación inmediata: decidir UX —ocultar, deshabilitar o explicar el campo—
sin abrir todavía más campos DB. Después del slice se puede evaluar
`modes.dark.{typography,surfaces}` con lista exacta y presupuesto de bytes. No
abrir `modes.*.chrome`, `materials`, ramps ni elevations como solución general.

## D7 — Scope por debajo del tenant

No agregar `scope: surface|instance` al registry tenant. El tier de instancia ya
existe y debe probarse de forma reducida:

- corregir el bypass `admin/audit`;
- adoptar `densityScopeAttributes` por cohortes sobre las surfaces canónicas;
- documentar `profileOverrides`;
- permitir `RecipeProfileProvider` por subárbol.

Anatomía permanece separada hasta definir un contrato específico. También queda
por definir qué significa el valor existente `vertical`, hoy sin adopción.

## D8 — Qué cifra comunicar

No usar 62 %, 43 %, 20–25 % ni 51–217 días como métricas duras. La lectura
honesta combina:

- celdas certificadas / 5.100;
- familias aceptadas / 255;
- familias con divergencia visible mínima / 255;
- `SIGHTED_ACCEPTED` / 255;
- estado de los controles y conexiones causales, separado de aceptación final.
