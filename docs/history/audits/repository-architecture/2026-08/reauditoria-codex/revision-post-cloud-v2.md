# Revisión Codex posterior a Cloud v2

Fecha de corte: 2026-08-28<br>
HEAD comprobado: `f166570d92433fe1437133975732003c1fd29a32`<br>
Carácter: advisory. Este documento no modifica roadmap, programa, manifests ni implementación.

## Veredicto actualizado

Cloud corrigió de manera sustancial su primera reauditoría. La arquitectura base
del Rescue sigue siendo correcta, pero la implementación todavía no demuestra
que cada dial produzca una cascada visible, coherente y completa. El riesgo no
es sólo la presencia de literales: es aceptar como conectado un edge que vive en
un manifest o en un fallback, pero no mueve el `computed style` del consumidor.

La decisión de orden converge: reparar primero los instrumentos que pueden dar
verde falso, cerrar un grupo pequeño de defectos causales, ejecutar un slice
F4C visible y recién entonces escalar el drenaje de cascada. No recomiendo
volver a una ola larga de infraestructura sin delta visual.

## Qué significa que el manifest sea el source of truth

La constitución es explícita: el manifest segmentado es la autoridad de
evaluación y aceptación. También separa propietarios:

- `family-inventory/index.json` posee el denominador de familias;
- el registry de capacidades posee los controles operativos;
- `manifest/controls/*` posee dominio, tier, ingreso, salidas y calibración;
- `manifest/groups/*` posee vocabularios finitos de receta/anatomía;
- `manifest/families/*` posee aplicabilidad, bindings a partes y evidencia;
- `manifest/index.json` es un rollup generado, no una segunda autoridad.

Por lo tanto, el manifest debe ser el libro mayor canónico de **edges,
aplicabilidad y aceptación**, pero no debe duplicar manualmente vocabularios
runtime que ya tienen un dueño ejecutable. Esas proyecciones sólo son fiables si
un gate las contrasta fail-closed con su fuente.

Hoy esa condición no se cumple de forma uniforme:

1. Expert tiene 290 entradas vivas, la constitución y `program-check` fijan 294,
   y tres proyecciones de cascada todavía dicen 67. El checker queda verde
   comparando copias stale, no la fuente viva.
2. `shape.button-style` declara `--ds-radius-button`, mientras el Button pinta
   desde `--ds-button-{size}-radius`. El propio control y la celda Button dejan
   el defecto asentado y permanecen `SOURCE_BOUND`/`UNKNOWN`, pero el árbol de
   cascada enumera 89 destinos como `PRESCRIPCION`. Eso es intención, no prueba.
3. `staticDoorDisposition` aparece en manifests de anatomía sin lector de gate
   o runtime. Un campo correcto pero no consumido no cierra una brecha.
4. El rollup sigue en 0/255 familias aceptadas, 0/255 `SIGHTED_ACCEPTED` y
   0/5.100 celdas certificadas. Es honesto: el contrato existe, la adjudicación
   completa todavía no.

La unidad mínima de aceptación de cascada debe ser:

`ingreso → lowering → raíz pública → canal de familia → consumidor → propiedad computed → resultado sighted`

Además debe probar restore exacto, controles negativos y los modos/estados
aplicables. Un literal de último recurso puede existir por resiliencia, pero no
puede quedar activo en el camino gobernado ni ser la única fuente de branding.

## Correcciones a Cloud v2 que mantengo

### Cascada

Reproduje los tres universos: ratchet 2.169/4.373, root-membership
1.610/881/729 y liveness 440/407/33 con 48 findings. El ratchet viejo mide
forma de fallback, no pertenencia a raíz ni pintura; no puede gobernar una cola
de 2.169.

Cloud reproduce 960 candidatos de corpus y 760 de Modern con literal y sin
productor encontrado, más 170 contradicciones contra root-membership. Es una
población importante, pero todavía no un baseline constitucional: su censo ad
hoc no enumera exhaustivamente productores interpolados/dinámicos y no prueba
computed. La acción correcta es construir un instrumento compuesto y durable,
recalcular, y fijar el baseline sólo después.

Las salidas deben permanecer separadas:

- pertenencia a raíz canónica;
- productor y alcance productivo;
- fallback literal activo sin productor;
- efecto computed/sighted por celda.

### Expert

La fuente viva es 290. No se deben reponer los cuatro canales oscuros retirados
para conservar el número 294. La reparación debe actualizar las copias, corregir
67→290 donde corresponda y agregar un check ejecutable contra el dueño vivo.

### Evidencia efímera y CI

Hay 674 commits locales sobre `origin/main`. Ningún agente puede hacer push bajo
la constitución actual. Un PR desde una rama espejo activaría CI, pero crear esa
rama remota requiere una enmienda explícita del owner.

De los paths `/private/tmp` citados por el roadmap, 63 tienen snapshot durable,
11 originales siguen vivos y 36 no tienen respaldo localizado. No corresponde
prometer “reanclar 36”: se reanclan los 63, se preservan los 11 y los 36 quedan
`UNRECOVERED` hasta recuperación o adjudicación. Un `git bundle` tampoco guarda
memos que sólo existen en `/private/tmp`.

### Defectos causales y entrega

- `shape.button-style`: el fallback de una línea propuesto originalmente es
  vacuo porque el canal por tamaño siempre existe. La solución causal requiere
  adjudicar primero la precedencia de la hoja authored de BitHire y luego hacer
  fan-out del lowering a los cinco canales por tamaño con prueba por brazo.
- `recipes.profile`: el compilador valida/devuelve la selección, pero el brazo
  code-owned no la entrega al provider; es un corte causal acotado.
- PageShell: el síntoma móvil está confirmado y la combinación
  `container-type:inline-size` + `margin-inline:auto` dentro de flex, sin
  `inline-size:100%`, es una causa plausible. Debe demostrarse con A/B en
  Playwright antes de aceptar la línea como fix.
- app-platform: antes de repin necesita migración cross-repo de imports JS,
  CSS, aliases, verifier, 22 canales `--ds-commercial-*` con 1.329 referencias
  en 82 archivos y símbolos retirados; la unión de superficies alcanza 102
  archivos. No basta cambiar `globals.css`.
- CSS: Next lo deja cerca de 344 KB gzip para red, pero el CI del paquete mide
  `dist/*.css` sin esa minificación. Los cuatro bundles exceden sus presupuestos
  de 410–460 KB; minificar `dist` los coloca bajo el límite. No bloquea el slice
  visual, pero sí forma parte del cierre de publish.

## Secuencia rápida propuesta, todavía no aplicada

### S0 — instrumentos y seguridad operativa

- corregir Expert 294/290/67 con vínculo a fuente;
- endurecer el testigo causal de `shape.button-style` y corregir el checkpoint
  49/48; el `evidence.symbol` no debe cambiarse para ocultar la contradicción;
- preservar/reanclar evidencia recuperable y separar los 36 `UNRECOVERED`;
- decidir fuera de esta auditoría el respaldo Git y CI remota;
- no reabrir `schemaVersion`: ya está cerrado en HEAD.

### S1 — defectos causales con delta visible

- gate de proyección consciente del transporte y testigo
  output→canal pintado→computed;
- adjudicación BitHire, fan-out y prueba por brazo de `shape.button-style`;
- entrega de `recipes.profile` en code-owned;
- reproducción A/B de PageShell a 390 px y fix sólo si confirma la causa;
- búsqueda Expert por descendientes/keypath; pasar un parámetro recursivo no
  basta porque hoy el padre puede quedar filtrado antes;
- decisión de UX para `palette.dark` cuando el modo no es `auto`; el contrato de
  validación no tiene warnings-on-success, por lo que `ignored_field` no es un
  parche mecánico.

Cada fix debe declarar el delta esperado y cerrar computed + captura A/B; no
alcanza con un unit test de estructura.

### S2 — slice F4C en dos checkpoints

S2a, con timebox de 48 horas: Button, Card y DataTable o SectionCard, tres
verticales, 390/1280, mutations sentinel, computed y sighted. S2b agrega otras
tres a cinco familias sólo si S2a no obliga a cambiar la gramática. Después se
completa 768, light/dark y estados relevantes en el cierre de cohorte.

Cada corrida debe declarar universo esperado, consumidores que cambiaron,
consumidores esperados que no cambiaron, hardcodes que bypassan, fallbacks
activos y restore exacto. Éste es el primer ensayo honesto de que pocos
controles cambian muchas familias sin dejar una aplicación inconsistente.

### S3 — cascada a escala

Construir el clasificador compuesto, enumerar todos los planos y scopes por
engine, ejecutar drills anti-coincidencia y recalcular la clase de fallback
activo. Sólo después se fija el baseline y se paraleliza el drenaje por familias
disjuntas.

### S4 — entrega

Preparar app-platform en paralelo, pero hacer su migración antes de cualquier
publish/repin. Minificar `dist` con el mecanismo compatible con el análisis de
CI; medir el CSS real por aplicación antes de convertir el split por engine en
bloqueante de producto.

## Límites de esta postura

Todavía no doy por cerrado el consenso triple sobre el baseline 760/960: Cloud
lo propone, Codex lo considera candidato y Kimi debe volver a reproducirlo
sobre la versión v2. Tampoco convierto en roadmap las propuestas de nuevos
diales, cambios de scope, transporte DB, reducción de gates o push remoto: son
decisiones del owner.
