# Posturas y conciliación Cloud · Codex · Kimi

Estado: propuesta no aplicada.<br>
Corte base: 2026-08-28, HEAD `f166570d92433fe1437133975732003c1fd29a32`.

## Criterio de Daniel

El objetivo no es “tener muchas variables”. Es que una cantidad acotada de
controles de branding produzca un cambio coherente sobre todas las familias que
declaran alcanzar. Un hardcode brandable que queda activo sólo en una familia
rompe ese efecto y deja la aplicación visualmente inconsistente. La velocidad
importa, pero no justifica baselinar un clasificador falso ni aceptar por
existencia de token.

## Postura de Cloud/Fable v2

Cloud corrigió cinco de sus diez bloqueantes iniciales en severidad, causa o
fix. Mantiene que la arquitectura es válida, adelanta defectos causales y F4C,
retira los porcentajes/plazos no reproducibles y exige migración cross-repo
antes del repin. Su aporte nuevo más fuerte es la población de fallbacks
literales sin productor encontrado y las contradicciones entre instrumentos.

Cloud propone reconstruir el clasificador y luego usar 760 Modern/960 corpus
como nueva cola. También corrige su primer fix de Button: el fallback en el skin
es vacuo; la dirección es fan-out por tamaños.

## Postura de Codex

El manifest debe gobernar edges, aplicabilidad y aceptación, enlazado a fuentes
runtime ejecutables. La arquitectura no se revierte. Antes de escalar se
endurece la prueba output→canal pintado→computed→sighted, se corrigen conexiones
causales y se ejecuta una canaria pequeña.

Codex reproduce la clase literal-huérfana, pero considera 760/960 un conjunto
candidato: el censo actual no enumera exhaustivamente emisiones dinámicas ni
prueba computed. La cola debe salir de un instrumento compuesto y un baseline
recalculado.

## Postura de Kimi K3

Kimi confirma que el manifest funciona como contrato, grafo derivado y memoria,
pero su prueba observada sigue en cero. Señala que Button, anatomía y responsive
ya tenían sus defectos documentados: el problema fue no consumir esas señales
como cola de trabajo.

Kimi rechaza los tres instrumentos como autoridad única. Propone la conjunción
de pertenencia, liveness y literal sin productor, con las 170 contradicciones
primero. Además exige renombrar la “clase B” porque el programa ya posee otra
clasificación A/B/C/D, y no pudo reproducir 760/960 desde los datos publicados.

## Consenso triple firme

1. La arquitectura de lowering único, static/DB y skin-first se conserva.
2. El manifest es la autoridad de edges/aplicabilidad/aceptación; existencia de
   variable o `PRESCRIPCION` no equivale a cascada verificada.
3. Expert 294/290/67 es un defecto de instrumento/autoridad prioritario. La
   verdad viva queda en 290 y el gate debe consultar la fuente.
4. No se drenan 2.169 canales. El ratchet viejo mide forma de fallback y tiene
   falsos positivos.
5. Existe una población real de literales activos sin productor; debe medirse
   exhaustivamente antes de baselinarla.
6. `shape.button-style` no pinta el Button real; el fallback de una línea no
   sirve. La solución requiere fan-out a tamaños y prueba por brazo, después de
   adjudicar BitHire.
7. `recipes.profile` se pierde en el brazo code-owned y necesita una conexión
   real al provider.
8. PageShell tiene un defecto visible a 390 px; se hace A/B ejecutable antes de
   aceptar la línea propuesta como fix.
9. El filtro Expert profundo y la experiencia de `palette.dark` necesitan
   corrección, sin fingir que son one-liners.
10. El próximo ensayo de producto es una canaria F4C con delta esperado,
    computed, restore, negative controls y sighted.
11. app-platform debe migrar completamente antes de publish/repin. El trabajo
    es mayor que cuatro imports CSS, pero casi todos los símbolos tienen sucesor
    canónico; `ProductWindow` queda como decisión.
12. Ningún agente hace push. Respaldo y CI remota requieren autorización del
    owner.
13. F9 conserva las 5.100 celdas; los grupos generan evidencia, no reducen el
    denominador.
14. No se recortan gates sin perfil y no se usan 20–25 %, 51–217 días o
    62 %/43 % como métricas duras.

## Resoluciones conservadoras donde los informes diferían

### Cascada

Resolución: no fijar 760/960. Renombrar la población
`literal-activo-sin-productor`, construir un enumerador durable de todos los
planos y scopes por engine, agregar drills A/B y un gate anti-contradicción, y
recién entonces fijar el baseline. `root-membership`, liveness y la nueva
clasificación conservan salidas separadas.

### Button

Resolución: no cambiar `evidence.symbol` para hacer desaparecer la
contradicción; usarla como testigo de que el output y el canal pintado difieren.
Adjudicar la precedencia BitHire, fan-out a cinco tamaños y verificar cada
brazo/stop.

### PageShell

Resolución: el síntoma es real; la causa propuesta es plausible pero no queda
aceptada hasta un A/B Playwright a 390 px. El fix entra sólo si ese A/B lo
demuestra.

### `palette.dark`

Resolución: no agregar directamente `ignored_field`. El resultado de validación
no admite warnings en success; se decide primero entre ocultar/deshabilitar el
campo, explicarlo en UI, rechazarlo o ampliar formalmente el contrato.

### Elevación y nuevos diales

Resolución: no expandir elevación a seis niveles como “bugfix”; el manifest
actual promete 1–3 y declara el no-op. No autorizar diales nuevos después de una
captura aislada: primero canaria, luego mapa de mutación/cascada y recién después
adjudicación nombre por nombre.

### CSS y entrega

Resolución: Next reduce la carga de red, pero el CI del paquete mide
`dist/*.css` sin minificar y los cuatro bundles exceden el presupuesto. Minificar
`dist` forma parte del cierre de publish; el split por engine queda como
experimento de producto, no bloqueante de la canaria.

## Propuestas explícitamente rechazadas

- push autónomo a cualquier rama;
- drenaje de 2.169;
- fallback de una línea de Button;
- swap RTL de safe-area;
- `scope: surface|instance` en el registry tenant;
- expansión general de DB a `modes.*.chrome`, materials, ramps o elevations;
- seis diales antes del mapa de mutación;
- reducción de 5.100 por aceptación de representante;
- recorte directo de gates;
- borrado de tokens por ausencia de lectura en un único bundle;
- cambio aislado de `globals.css` en app-platform.
