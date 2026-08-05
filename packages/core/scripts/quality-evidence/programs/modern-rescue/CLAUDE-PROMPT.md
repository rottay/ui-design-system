# Claude bootstrap — WO-CRA-23

Copy everything inside the fence into a fresh top-tier Claude session.

```text
Actuás como Principal Design-System Architect, Program Coordinator y Lead
Product Design Engineer de Rottay. Tu ventaja debe ser la paralelización
disciplinada; no se asume que tengas criterio visual suficiente sin los
contratos matemáticos del programa.

REPOSITORIO:
/Users/daniel/Developer/Rottay/ui-design-system

WORK ORDER Y PROGRAMA VINCULANTE:
- roadmap/craft.md — WO-CRA-23
- packages/core/scripts/quality-evidence/programs/modern-rescue/README.md
- todos los JSON, templates y contratos de esa carpeta
- packages/core/scripts/quality-evidence/programs/modern-rescue/TENANT-ART-DIRECTION.md
- packages/core/scripts/quality-evidence/programs/modern-rescue/tenant-art-direction.json
- packages/core/scripts/quality-evidence/programs/modern-rescue/VISUAL-CRAFT-CONTRACT.md
- packages/core/scripts/quality-evidence/programs/modern-rescue/visual-craft-contract.json

Leé todo antes de delegar. Ejecutá:

node packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.mjs
node --test packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs
pnpm roadmap:status claim WO-CRA-23 --by claude-modern-rescue

Si el WO ya está in-progress por este programa, no reclames otra vez. Si el
contract check falla o el WO no puede reclamarse, diagnosticá y reportá: no
inventes estado, plan o dashboard paralelo.

ROUND AUTORIZADO: R0

Ejecutá solamente el round autorizado de rounds.json. No cruces al siguiente
round aunque tengas agentes o contexto disponibles. Cada round termina en
IMPLEMENTED_PENDING_CODEX_AUDIT y espera GO explícito de Codex/owner.

DIRECCIÓN DE PRODUCTO VINCULANTE:

No diseñes “dos skins”. BitHire debe convertirse en un Professional Network
Hiring OS: familiar como un gran producto de red profesional pero original de
BitHire, con canvas cool, superficies blancas, blue action grammar,
people-first hierarchy, geometry medium/approachable, material calmo y mobile
orientado a identidad/estado/next action. No copies logo, assets, copy ni
trade dress exacto de LinkedIn.

The Management debe convertirse en un Monochrome Executive Ledger: blanco o
papel, negro y grises; cuadrado, minimalista, editorial y rústico; rule-led,
sombras nulas o duras mínimas, textura content-safe, motion corto y mecánico,
tablas ledger y mobile dossier. Los estados semánticos siguen accesibles.

El source actual contradice ambos targets: BitHire selecciona technical-sharp;
The Management selecciona editorial-round y un profile soft/warm/Art-Deco.
R0 debe cerrar la migración mediante los registros existentes, sin mutar el
significado de ids publicados. R1 debe demostrar al menos ocho ejes visibles,
seis no-color, reconocimiento en grayscale y neutralización temporal del hue.

LABORATORIO VISUAL VINCULANTE PARA R1:

Toda decisión de grammar, craft y divergencia de R1 se implementa y evalúa en
`http://localhost:7001/probe/ds-reference`, cuyo source vive en
`packages/showroom/src/app/probe/ds-reference/` y reutiliza el catálogo
hardcodeado de `/probe/whitelabel-torture`. Las ocho escenas son primitives,
forms, data, workflow, dashboard, shell, surfaces y all. BitHire entra por el
BrandTheme estático canónico; The Management entra por el documento DB
publicado y el compiler productivo. El árbol, contenido, viewport y locale son
idénticos. Iframes separados son obligatorios porque la autoridad tenant vive
en `<html>`.

Está PROHIBIDO usar Candidates u otra app como canvas de R1, importar CSS,
rutas, APIs, fixtures o componentes de app-bithire, o copiar su markup. Las
apps se auditan después como integración/adopción; no deciden si la grammar del
DS es válida. R1 debe hacer que el lab aislado sea excelente antes de propagar
a las 252 familias.

R0 debe resolver dos defectos ya reproducidos por Codex: (1) el substrate
`whitelabel-torture/page.tsx` es un monolito de 5.796 líneas y compila todos los
imports aunque se pida una escena; separalo detrás de boundaries por escena sin
copiar componentes, fixtures ni data; (2) el primer frame SSR muestra el ground
dark/default y recién hidratado cambia al tenant light. Primer frame y settled
frame deben coincidir en ambos paths. No aceptes FOUC como detalle de showroom.

Las capturas base actuales NO son un north star. `visual-craft-contract.json`
registra seis incidentes reproducidos: Steps con conectores atravesando labels;
Badge/Tag diminuto y genérico; Transfer como cajas desalineadas con espacio
muerto; Select desktop con chrome nativo ajeno; Toggle/Switch pequeño y con
estados reducidos a pintura; y compound fields con borde dentro de borde sin
owner. Cerrá la clase completa de defecto, no sólo el selector fotografiado.

Los seis incidentes no limitan el scope. Ejecutá la failureTaxonomy completa:
20 categorías y 120 checks. Cada familia devuelve cada fila como PASS, FAIL o
NOT_APPLICABLE_WITH_REASON. Un FAIL mantiene ASSESSED_NOT_ELEVATED; omitir una
categoría o usar N/A cuando la anatomy/capability existe es blocker. No reduzcas
la revisión a lo que casualmente se ve en las capturas iniciales.

No fabriques blockers ya descartados: Advanced DB ya admite los radios exactos
y los cuatro status tones; no ensanches el envelope ni abras una vertical por
eso. El envelope gobierna seis dials Standard — density, effect, motion
intensity/duration, type y radius — mientras los valores exactos Advanced
siguen su ruta allowlisted; no confundas ambas capas. Recipe profile y
expressive experience profile son registries distintos,
no unifiques ids ni vocabularios. `profiles.icon` ya está activo. Agotá
`ruled/inset-double`, `flat/paper`, motifs vigentes y motion dials antes de
proponer nuevos ejes. Semántica recruiting-specific permanece app-owned.

KIMI ES ADVISOR, NO AUTORIDAD:

No leas `KIMI-ANNOTATIONS/inbox`. Sus carpetas son input temporal para Codex,
no documentación ni evidencia para Claude. Consumí exclusivamente las
decisiones reconciliadas en `tenant-art-direction.json` y los demás contratos
del programa. Nunca edites el inbox como parte de una ronda Claude.

MODELO DE AGENTES:

“20 agentes” es una expresión de escala, no una topología fija. Construí
primero el grafo de conflictos definido en agent-orchestration.json:

- nodo = lane/familia con readSet, writeSet y sharedRequests exactos;
- hay arista si comparten archivo, contrato, compiler, barrel, i18n, test,
  manifest, generated output, anatomy parent/child o canal/recipe;
- ejecutá en paralelo el mayor conjunto independiente seguro;
- la cantidad puede ser 3, 8, 20 o la que resulte;
- un archivo tiene un único writer por cohort;
- contratos, compilers, tokens, manifests, i18n, barrels, tests, docs y
  generated pertenecen a integradores singleton;
- reviewers nunca editan aquello que revisan.

ROUTING DE MODELOS Y ECONOMÍA DE CONTEXTO:

Usá `agent-orchestration.json#modelRouting` como preferencia adaptable, no como
dogma. Si están disponibles, Fable —o el Claude más fuerte como coordinador—
controla arquitectura, conflicto, canon y aceptación de diffs; Opus —o el
modelo con mejor criterio de producto— ejecuta las familias que requieren
composición premium, creatividad, responsive y art direction; Sonnet —o el
modelo eficiente más confiable— hace censos, wiring repetitivo, i18n, barrels,
contratos focales y evidencia estructurada. Escalá una lane si aparece juicio
de producto o autoridad; no uses al cerebro coordinador para repetición
mecánica ni dejes a una lane mecánica inventar arquitectura.

Maximizá output productivo por contexto. Entregá a cada agente sólo su family
packet, dependencias inmediatas, rubric y ownership. No hagas que veinte agentes
relean el repo o redacten veinte relatos. Una sola fuente de censo, una sola
integración y un solo reporte compacto. Los comentarios de código son útiles y
esperados únicamente para explicar un porqué no obvio, un invariant, una
restricción a11y, un algoritmo o una condición de retiro. Prohibidos comments
que repiten el código, dicen “premium”, narran la migración, copian el prompt o
guardan razonamiento del agente. Priorizá código productivo y documentación
canónica útil; no journals, dashboards paralelos ni progreso en prosa.

OBJETIVO DE CALIDAD:

No midas progreso por archivos tocados, tokens agregados, líneas ni agentes.
Usá quality-rubric.json y customization-model.json. Una familia sólo es
elegible cuando:

- pasan todos sus contratos binarios aplicables;
- tiene cero hard vetoes;
- supera el threshold de su capa;
- toda dimensión crítica alcanza 4/5;
- cada dimensión puntuada trae una evidencia observable concreta; sin ella
  puntúa 0;
- resilience, canonClosure y pathParity son 1;
- resilience incluye todos los casos aplicables del stressMatrix; una lane
  sólo puede agregar casos;
- unknownTargetedImpact es 0 en el scope del round;
- la evidencia existe, tiene hash y corresponde al source actual;
- Codex aprueba sighted. Vos no podés aprobar visuales.

PROFUNDIDAD MÍNIMA POR FAMILIA — FAIL CLOSED:

Antes de editar, generá un ledger de defectos y puntuá con evidencia las doce
dimensiones aplicables. Identificá el defecto dominante, todos los P0/P1 y la
matriz aplicable de estados/stresses. Después de editar, repetí exactamente el
mismo caso. Cada familia termina en uno y sólo uno de estos estados:

- ELEVATED_PENDING_CODEX_AUDIT;
- ALREADY_REFERENCE_GRADE_PENDING_CODEX_AUDIT;
- ASSESSED_NOT_ELEVATED;
- BLOCKED_OWNER_DECISION.

Tocar, visitar o “mejorar un poco” una familia no la completa. Tests, docs,
comments, stories, snapshots, styles/dist generados, LOC y declaraciones sin
consumer causal valen cero craft. Un cambio material debe cerrar defectos
observables en código productivo y quedar ligado a part + propiedad renderizada
+ control/recipe/private value canónico.

Aplicá íntegramente familyCompletionContract de quality-rubric.json. Como piso,
una elevación debe mejorar materialmente 6 dimensiones en canarios, 4 en
primitives, 5 en patterns/charts, 6 en structures, 7 en surfaces/compositions
y 5 en commercial. La única excepción es demostrar con evidencia independiente
que TODAS las dimensiones aplicables no cambiadas ya estaban en 4/5 o más. Por
eso dos retoques pueden ser suficientes sólo si cierran todos los déficits de
una familia ya premium; si queda cualquier dimensión aplicable bajo 4/5 o un
P0/P1 abierto, el estado obligatorio es ASSESSED_NOT_ELEVATED y la familia
permanece en el round.

El reporte debe incluir por familia scores before/after, una tabla de delta
material, pruebas de las dimensiones no cambiadas, matriz de estados/stress,
mutación causal+restore, ejes de divergencia y receipts source-bound. No uses
“already premium” como atajo: ALREADY_REFERENCE_GRADE exige cero edición
productiva y el mismo paquete de evidencia completo; Codex lo confirma.

El progreso del round es familias ACEPTADAS por Codex sobre el denominador, no
familias visitadas ni pending. No cruces a otra familia para inflar cobertura
si la actual queda parcial: terminála o registrá blocker real y mantenela en la
cola del round.

El sistema debe quedar tope de gama en anatomy, jerarquía tipográfica, títulos,
subtítulos, body/supporting/captions/números, shape y edge grammar, bordes y
dividers, backgrounds, gradientes y motivos con content-safe zones, profundidad
y elevación, layout intrínseco y container-aware, density/rhythm/type-scale,
mobile simplificado, estados, motion y transitions semánticos, iconos DS,
keyboard/focus/touch, forced colors, reduced motion/transparency, lifecycle,
i18n EN/ES/AR RTL, paridad FR/PT y contenido largo.

“Sutil e integrado” es vinculante, no una recomendación estética. Aplicá cada
bindingCraftLaw, hardVisualVeto y mechanicalFloor de
`visual-craft-contract.json`. Un family root no puede parecer un conjunto de
controles default dentro de cajas. Una región semántica tiene un boundary
dominante; connectors/rules/motifs no cruzan contenido; peer panels se alinean;
focus/error/selection no apilan outlines; whitespace tiene intención; native
desktop chrome accidental, mini-tipografía, random pills y gradientes/sombras
como atajo premium son veto.

Los doce incidentes reproducidos son muestras, no una lista cerrada. Además de
los seis controles iniciales, ya vimos: un glyph genérico repetido para conceptos
no relacionados; charts reducidos a rectángulos/arcos sin scaffold editorial;
cards que son sólo un outline alrededor de texto suelto; micro-pills usados como
heading/explicación/acción; headers hechos de tiras, rails y chips sin jerarquía;
y shells que colapsan contenido a una columna de un carácter mientras sobra
canvas. No parches esas capturas: eliminá las clases completas de fallo usando la
matriz obligatoria de 20 categorías/120 checks.

No interpretes “premium” como poner borde, sombra o background a todo. Una
superficie borderless puede ser excelente si typography/spacing/material la
agrupan; una ruled puede ser excelente si una sola línea manda; una raised puede
ser excelente si flota por una razón. Un outline redondeado sin anatomy, una
sombra sin jerarquía o un gradient sobre markup genérico siguen siendo FAIL.
Los charts no pasan por dibujar geometría válida: title/plot/axes/labels/legend/
tooltip/focus/annotations/lifecycle, asignación del espacio y distinción no-color
son anatomía productiva. Cualquier overlap, clip, wrap por carácter, plot vacío
injustificado o región mayor debajo de su medida legible mantiene la familia en
`ASSESSED_NOT_ELEVATED`.

Iconos leading/trailing deben ser opcionales: `none` colapsa slot y gap a cero
sin romper balance. Usá sólo iconos DS. Un affordance IA aparece únicamente si
la acción es realmente suggested/generated/automated/confidence-bearing y debe
poder desactivarse sin pérdida de nombre, alineación ni prioridad. No rocíes
sparkles decorativos.

No confundas “importado desde icons” con semántica gobernada. El barrel
histórico de nombres es compatibility-only. Codex reprodujo que el torture lab
usa `TagIcon` 34 veces para conceptos no relacionados, al menos siete stand-ins
unicode/span, mientras existen 282 role files semánticos generados. R0 re-censa
y drena el lab a `Icon name=<semantic-role>` o packs semánticos focales antes de
usar sus screenshots. R2–R4 drenan por familia; R5/R6 cierran todo Modern y las
fixtures/stories activas. Cero icono funcional local SVG/emoji/unicode, cero
external provider, cero fallback genérico y cero icon well universal. Las únicas
excepciones son geometría de charts/data, QR/barcode/progress/rating, marks por
su facade gobernada y media del usuario, todas itemizadas. La excepción de chart
cubre marks/axes/structural drawing, nunca toolbar actions, legend controls,
statuses, annotations ni navegación: esos siguen usando `Icon` semántico.

Responsive inteligente significa reflow causal, no scaling cosmético:
container queries, intrinsic sizing, minmax/clamp/auto-fit, prioridades,
disclosure y mobile composition. Son vetos: overlap, clipping, scroll
accidental, wrap por carácter, truncamiento crítico sin acceso, acciones
inaccesibles, desktop comprimido en 390px o huecos internos injustificados.

CUSTOMIZACIÓN:

No crees otro token system. Preservá la cadena:

tenant input -> capability -> profile -> semantic channels ->
group recipe/anatomy/emphasis -> private values -> stable part -> property.

CSS PRODUCTIVO — CERO TIERRA DE NADIE:

Aplicá íntegramente `quality-rubric.json#cssOwnershipContract`. No significa
copiar cada literal CSS dentro de BrandTheme. Significa que cada regla visible,
writer y read del scope tiene exactamente un owner y una razón:

1. invariant estructural de una familia;
2. invariant compartido con owner foundation/runtime;
3. valor tenant directo y acotado por BrandTheme/TenantTheme;
4. valor tenant derivado causalmente por capability/profile/channel/recipe/
   private value;
5. estado/preferencia/accesibilidad gobernado;
6. retiro con death proof.

No existe una séptima categoría “CSS que quedó ahí”. El CSS visible de una
familia debe mapear a la familia canónica, stable part y estado/recipe
alcanzable. El CSS compartido necesita owner foundation/runtime y no puede ser
un skin paralelo. Todo valor tenant-variable debe funcionar por el mismo path
static BrandTheme y DB TenantTheme: directo para valores brand/Advanced
bounded; indirecto —preferido para impacto amplio— cuando una decisión de alto
nivel deriva docenas de canales y familias. Un literal estructural legítimo
puede quedarse sólo si no codifica identidad tenant y se declara como invariant,
no como customización ficticia.

En cada round, el scope aceptable termina con cero stylesheets no importados,
selectores sin anatomy/estado alcanzable, writers sin reader, reads sin emitter/
fallback/owner, reglas siempre anuladas, mirrors sin consumer y output generado
sin source. R5/R6 repiten el censo sobre todo Modern. Retirá únicamente con
owner, census, successor cuando conserva capacidad y reconciliación source→
generated; “dead” jamás autoriza borrar por sí solo.

CHECKPOINTS CODEX — NO PROPAGACIÓN CIEGA:

`visual-craft-contract.json#checkpointPolicy` manda. Para cada nueva capa o
grammar compartida implementá primero sólo tres familias representativas y
detenete con evidencia before/after completa. Sin GO explícito de Codex no
propagues. Luego respetá los cohorts cerrados R1–R4: nunca más de veinticinco
familias entre checkpoints y cada cohort vuelve a detenerse. Si cambiás palette,
recipe, anatomy o grammar compartida después de una calibración, invalidá los
receipts dependientes y repetí el checkpoint; no los heredes por conveniencia.

La paleta actual de ambos tenants queda RECHAZADA como target. R1 debe proponer
y ejecutar mediante las autoridades canónicas una BitHire cool-neutral con
surfaces limpias, ink profundo y un solo action-blue disciplinado, y una The
Management papel/near-white, near-black, grayscale, ruled y con excepciones
semánticas accesibles. Ninguna puede ser fea a propósito para hacer destacar a
la otra. Codex aprueba palette y grammar antes de cualquier propagación.

Primero consumí los 13 Standard, 7 Pro y 294 Expert existentes. Standard debe
seguir pequeño; Pro proyecta 20–30 fields agrupados; Expert es allowlist
buscable, no cientos de sliders. Ampliá profundidad mediante los mismos grupos
semánticos de recipes/anatomy/emphasis, no con 252 knobs sueltos.

Family writers no crean --ds-* públicos. La creatividad se expresa mediante
las propuestas completas de customization-model.json. Toda necesidad nueva
empieza privada/prototype y el integrador decide derive/private/recipe/
Standard/Pro/Expert/hook/merge/retire. Cada propuesta se cierra en el mismo
round. Dead no significa borrable; capacidad Kimi requiere successor o death
proof. Prohibidos engineBridge, ComponentExtensions, tenant selectors,
conditional tenant TSX, icon providers externos y app patches de anatomía DS.

TESTS, DOCS Y EVIDENCIA:

Los family writers desarrollan y no gastan cada lane en builds o suites. Al
cerrar el cohort, el quality integrator actualiza:

- contratos observables, no clases/anatomía privada obsoleta;
- causal mutation + exact restore;
- static BrandTheme/DB TenantTheme parity;
- geometry en viewport/container/density/rhythm/type-scale;
- DOM, hydration, keyboard, focus, a11y y touch;
- EN/ES/AR RTL, pseudo-long y FR/PT parity;
- estados, lifecycle, motion/reduced-motion y forced-colors;
- icon provenance y same-tree tenant divergence;
- un negative drill por gate nuevo;
- documentación activa y catálogo generado cuando corresponda.

No corras full build/suite/browser por agente. Ejecutá solamente checks focales
del round y deja la serial completa, bundles, captures finales, commit y push a
Codex. Respetá el mínimo progresivo de `evidence-contract.json`: R0 sin
captures, R1 completo para 12 canarios, R2-R4 una captura representativa por
lane más scorecard por familia, y matriz completa en R5/R6. No edites
manualmente styles/dist. No uses git reset/restore/checkout,
no limpies untracked, no alteres stashes y no hagas commit/push/publish/tag.

SALIDA DEL ROUND:

1. Generá los artefactos de evidence-contract.json.
2. Completá un único ROUND-REPORT-TEMPLATE.md consolidado; no pegues veinte
   narrativas de agentes.
3. Registrá una sola nota:
   pnpm roadmap:status progress WO-CRA-23 --by claude-modern-rescue
     --note "R? implemented; evidence=<path>; sha256=<digest>; next=Codex audit"
4. Dejá WO-CRA-23 in-progress.
5. Cerrá exactamente con:
   ROUND_R?_IMPLEMENTED_PENDING_CODEX_AUDIT

No cruces el round boundary. Si un agente falla, reasigná el mismo ownership.
Detenete sólo ante los stopConditions vinculantes, no ante dificultad normal.
```
