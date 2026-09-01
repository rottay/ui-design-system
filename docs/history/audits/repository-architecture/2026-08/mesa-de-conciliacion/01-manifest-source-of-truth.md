# El manifest como source of truth

Estado: propuesta de conciliación, no aplicada.<br>
Fecha: 2026-08-28.<br>
Base comprobada: HEAD `f166570d92433fe1437133975732003c1fd29a32`.

## Respuesta corta

Sí: por constitución, el manifest segmentado es la autoridad de evaluación y
aceptación. Pero no es —ni conviene que sea— una copia manual de todo valor
runtime. Debe decir qué se promete, quién lo posee, qué familias alcanza y qué
evidencia lo acepta. Los vocabularios ejecutables conservan su dueño de código y
el manifest los proyecta con gates fail-closed.

El problema actual no es que se haya ignorado por completo el manifest. El
problema es que algunas proyecciones están stale, algunos campos no tienen lector
y algunos edges son `PRESCRIPCION` o `UNKNOWN`, no efecto observado.

## Tres capas que no deben confundirse

| Capa | Pregunta | Autoridad | Qué no prueba por sí sola |
|---|---|---|---|
| Contrato | ¿Qué control existe, cuál es su dominio y qué familia debería alcanzar? | registry + manifest segmentado | Que el navegador cambie |
| Grafo | ¿Qué raíz, canales y consumidores conectan la promesa? | roots/materialized/family bindings | Que el edge esté vivo y gane la cascada |
| Prueba | ¿Qué computed property cambió, dónde, y quedó aceptable? | mutation, computed, restore, negative controls y sighted | — |

`manifest/index.json` debe agregar estas verdades, no inventarlas ni convertir
una prescripción en aceptación.

## Evidencia de que hoy hay huecos

### Expert: tres cifras para la misma superficie

- fuente ejecutable: 290 entradas;
- constitución y `program-check`: 294;
- tres proyecciones de cascada: 67;
- `program-check` no importa ni ejecuta la fuente viva, por eso queda verde.

La reparación correcta es 290 como verdad runtime, proyecciones regeneradas y
un check contra el dueño ejecutable. No se reponen los cuatro canales retirados
para conservar una constante histórica.

### `shape.button-style`: contrato honesto, wiring incompleto

- el control emite `--ds-radius-button`;
- Button pinta desde `--ds-button-{xs,sm,md,lg,xl}-radius`;
- la celda Button permanece `UNKNOWN` y explica que el computed radius no se
  mueve;
- el root de cascada enumera 89 destinos como `PRESCRIPCION`;
- el materialized contiene la derivación del root, no el fan-out productivo a
  los cinco tamaños.

El manifest aquí no miente sobre el estado de la celda; sí sería un error leer
la prescripción como cascada cerrada. El gate debe fallar si el output declarado
no llega a un canal pintado y a una propiedad computed.

### Campos sin consumidor

`staticDoorDisposition` está documentado para anatomía, pero no tiene lector de
gate/runtime. A la vez, el gate de paridad permite que una proyección estática
se justifique con un productor DB-only. El contrato necesita prueba separada
por transporte.

### Estado agregado honesto

El índice declara 255 familias, 20 controles y 5.100 celdas; mantiene 0 familias
aceptadas y 0 `SIGHTED_ACCEPTED`. Esto no invalida la arquitectura. Informa que
la máquina de contrato/calibración está más avanzada que la certificación de
producto.

## Regla de aceptación propuesta

Una celda sólo puede subir si existe evidencia de esta cadena completa:

`ingreso estático/DB → lowering único → raíz pública → canal de familia → consumidor → propiedad computed → sighted`

La evidencia debe incluir:

- universo esperado de consumidores;
- consumidores que cambiaron y los esperados que no cambiaron;
- hardcodes que bypassan el control;
- fallbacks activos durante la prueba;
- restore exacto;
- controles negativos;
- modos, estados, responsive y transportes aplicables.

Un fallback literal puede ser una red de seguridad. Si durante el runtime
gobernado es el único valor que pinta, es deuda de branding y la celda no puede
considerarse cerrada.

## Modelo de gobierno propuesto

1. El manifest sigue siendo source of truth de edges, aplicabilidad y
   aceptación.
2. Cada vocabulario runtime tiene un único owner ejecutable.
3. Toda proyección del vocabulario en el manifest cita ese owner y se contrasta
   con él fail-closed.
4. `PRESCRIPCION`, `UNKNOWN`, `SOURCE_BOUND`, `COMPUTED_VERIFIED` y
   `SIGHTED_ACCEPTED` nunca se colapsan en un booleano genérico “wired”.
5. Los rollups se derivan únicamente de evidencia aceptada; archivos tocados,
   cantidad de variables y capturas sin causalidad siguen siendo señales de
   priorización.

Ésta es la forma de conservar el manifest como autoridad sin permitir que una
variable declarada, un fallback o un gate circular simulen el efecto cascada.
