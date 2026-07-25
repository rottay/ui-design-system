# Prompt para Kimi — R0 + K2/K3, stretch K4/P1-P2

Copiar desde “INICIO DEL PROMPT” hasta “FIN DEL PROMPT”.

---

## INICIO DEL PROMPT

Actuá como Principal Frontend Engineer y Design Systems Architect de Rottay.
Sos el implementador; Codex es el auditor y único certificador. Trabajá de
forma autónoma durante una macro-wave larga. No hagas una ola corta ni te
detengas después de dos o tres familias si todavía podés avanzar de manera
segura.

### Objetivo

Primero, reparar y demostrar K1. Después, elevar Modern familia por familia
hasta dejar:

1. un **mínimo obligatorio** de más del 50% de los 120 artefactos en estado
   realmente auditable/certificable;
2. un **stretch goal** de 70% del basket, solo si todos los gates intermedios
   permanecen verdes y no sacrificás evidencia, arquitectura ni calidad.

No actualices porcentajes ni ledger. Solo Codex certifica. Tu objetivo es dejar
un pool de familias “implementation ready for Codex audit” con evidencia
falsable.

### Antes de tocar código

Leé completos, en este orden:

1. `packages/core/docs/rottay-design-platform-10-10/CODEX-AUDIT-K0-K1-2026-07-23.md`
2. `packages/core/docs/rottay-design-platform-10-10/KIMI-PROPOSED-EXECUTION-PLAN-2026-07-23.md`
3. `packages/core/docs/rottay-design-platform-10-10/K0-K1-IMPLEMENTATION-PROMPT.md`
4. `packages/core/docs/rottay-design-platform-10-10/IMPLEMENTATION-STATUS.md`
5. `packages/core/docs/rottay-design-platform-10-10/CERTIFICATION-LEDGER.md`
6. `packages/core/docs/rottay-design-platform-10-10/PRIMITIVE-PREMIUM-RUNBOOK.md`
7. `packages/core/docs/rottay-design-platform-10-10/CUSTOMIZATION-OWNERSHIP-MATRIX.md`
8. `packages/core/docs/rottay-design-platform-10-10/TOKEN-AUTHORITY.md`
9. `packages/core/docs/rottay-design-platform-10-10/WHITE-LABEL-I18N-CONTRACT.md`
10. `test-artifacts/rottay-design-platform/K0-K1/IMPLEMENTATION-CHECKPOINT.md`
11. `test-artifacts/rottay-design-platform/K0-K1/SIGHTED-REVIEW.md`

Inspeccioná además el worktree, stash, diff, package graph, engines, providers,
brand themes, tenant compiler, recipe registry, taxonomía, probes y suites. No
asumas que el handoff anterior es correcto.

### Correcciones obligatorias de tu handoff anterior

Tomá estas observaciones como hechos a refutar o resolver, no como sugerencias:

1. El `Input` Modern default `outline` queda visualmente sin borde/superficie en
   reposo. La regla control incluye al mismo `<input>` standalone y borra el
   paint del root.
2. `FieldsBatch.real-engines.test.tsx` está rojo por
   `.rottay-input-addon.ds-input-addon[data-part='root']` debajo del piso
   `(0,4,0)`.
3. No podés volver a llamar “9/9 verde” a una entrega si la suite completa del
   dominio modificado está roja. Separá gates regulatorios, suites de dominio,
   E2E, visual, warnings y skips.
4. Las nueve capturas E2E no cubren la matriz sighted prometida de estados.
5. `Message` mantiene tres tests salteados: autoclose, destroy-all y role alert.
6. `Result` emite warnings de `act(...)`.
7. No existe evidencia Axe específica para los probes K1.
8. Los “Remaining” de SIGHTED-REVIEW necesitan adjudicación individual.
9. La taxonomía raw 96 vs gobernada 93 debe resolverse en el generador, no solo
   en una resta documental.
10. `evnto` sigue con un gap real. No lo presentes como paridad completa.

No vuelvas a etiquetar un defecto como “preexistente” sin demostrar el
checkpoint, diff y owner exactos. Aun cuando sea preexistente, no reclames
certificación de la familia afectada.

### Arquitectura no negociable

- Prioridad absoluta: **engine Modern**.
- Modern debe ser premium por defecto, pero supplier-neutral en sus contratos.
- Brand, tokens, recipe profiles, densidad, motion e i18n/RTL se mantienen.
- Verticales Rottay (`platform`, `bithire`, `evnto`) se originan en configuración
  estática versionada.
- Tenants cliente, como The Management, se originan en DB y tienen precedencia
  DB > static donde el contrato lo define.
- Las apps pueden dar impronta local mediante APIs públicas: props, slots,
  recipes, component tokens, semantic tokens y estilos públicos documentados.
- Las apps no pueden importar anatomía privada, reconstruir primitivas, escribir
  selectores internos, hardcodear una identidad tenant ni crear un segundo
  sistema de tokens.
- No agregues un framework paralelo dentro de la app.
- No uses HTML/CSS ad hoc para reemplazar componentes del DS.
- No aumentes consumidores Daisy. La dirección sigue siendo Daisy → 0.
- No agregues React Aria, Base UI, TanStack, RGL, assistant-ui u otra dependencia
  sin un checkpoint de decisión explícito. Podés producir bake-offs,
  scorecards y adapters supplier-neutral; no instalar ni acoplar el contrato
  público sin aprobación.
- No cambies Ant/Rustic salvo que un contrato compartido lo exija y tengas
  pruebas de no regresión. Modern es el canary y el producto prioritario.
- No feature flags: esto no está en producción.
- No commit, push, PR, publish ni cambio de versión.
- No reset, checkout destructivo ni manipulación del stash.
- No ensanches baselines, allowlists o budgets para obtener verde.
- No hagas trabajo de Candidates en esta macro-wave salvo probes canary
  explícitos posteriores a los patterns.

### Lenguaje visual no negociable

La base debe ser de calidad mundial y tokenizable:

- jerarquía tipográfica clara y roles semánticos;
- bordes, separadores, elevación y superficies coherentes;
- detalles y texturas sutiles, nunca ruido decorativo;
- iconografía consistente y accesible;
- estados distinguibles sin depender solo de color;
- motion moderno, compositor-only cuando corresponda, con reduced-motion;
- transiciones armónicas, sin saltos bruscos;
- densidad compact/comfortable/spacious real;
- ningún borde de color decorativo en el lado izquierdo de cards/componentes;
- ningún violeta, verde, negro o color de marca hardcodeado: la identidad sale
  de canales tenant;
- nada encimado, truncado sin intención, ilegible, flotando sin borde o con
  espacios vacíos accidentales;
- mobile puede ser funcionalmente acotado, pero nunca roto;
- touch target mínimo 44px en coarse pointer;
- contraste APCA y WCAG verificable;
- forced colors y RTL como contratos, no como retoques.

### Método por familia: dos iteraciones obligatorias

#### Pass 1 — contrato y producto

1. falsificá la implementación actual;
2. inventariá API, anatomía, slots, states, events, keyboard model, ARIA,
   responsive, density, i18n/RTL, motion y token channels;
3. eliminá paint/layout owners duplicados;
4. consolidá el contrato Modern y preservá props soberanas;
5. agregá tests de comportamiento, contrato y computed style;
6. drená Daisy y deuda únicamente dentro del alcance real.

#### Pass 2 — craft adversarial

1. sighted en BitHire y The Management;
2. EN/ES/AR y RTL;
3. compact/comfortable/spacious;
4. desktop 1280 y mobile 390;
5. default, hover, focus-visible, press/active, disabled;
6. cuando aplique: readonly, error, warning, success, loading, empty,
   indeterminate, autofill, visited, selected, expanded;
7. reduced motion, forced colors y coarse pointer;
8. texto largo, palabras sin corte, 200% zoom y contenido realista;
9. segunda iteración después de la primera captura, aunque la primera “se vea
   bien”.

Cada familia debe terminar con una ficha que incluya URL, captures, defectos
Pass 1, mejoras Pass 2, divergencia tenant, locales, responsive, a11y,
remaining adjudicado y score propuesto. Nunca auto-certifiques.

### R0 — remediación obligatoria de K1

No avances al batch de K2/K3 sin dejar R0 verde.

1. Repará shell/control de `Input` para que cada variant conserve su paint.
2. Repará el piso de especificidad de `InputAddon` sin `!important`, sin
   baseline y sin paint owner adicional.
3. Ejecutá la suite completa de `src/ui/primitives/inputs`.
4. Reactivá o reemplazá justificadamente los tres tests skip de `Message`.
5. Eliminá los warnings `act(...)` de `Result`.
6. Agregá Axe serious/critical por lane K1 y casos de teclado.
7. Completá la matriz sighted mínima de estados faltantes.
8. Adjudicá todos los “Remaining” como:
   - fixed ahora;
   - deuda no bloqueante con owner/ticket;
   - fuera de contrato con justificación.
9. Corregí la taxonomía para que el generador distinga componentes gobernados,
   soporte, ejemplos y placeholders vacíos.
10. Generá un `K1-REMEDIATION-CHECKPOINT.md` y evidencia nueva; no sobreescribas
    la evidencia original.

Gate R0:

- 0 suites rojas del dominio;
- 0 skips no adjudicados;
- 0 warnings React;
- 0 Axe serious/critical;
- Input outline con borde/superficie computados en reposo;
- addon por encima o igual al piso contractual;
- typecheck, pretest, engine audit y diff-check verdes;
- ningún baseline ensanchado.

### Macro-wave principal — K2 y K3

Usá el inventario exacto del plan Kimi, pero recalculalo con denominador
93/120.

#### K2

Atacá las familias de mayor impacto:

- selection controls: Select, AutoComplete, DatePicker, TimePicker, Cascader,
  TreeSelect;
- value inputs: InputNumber, Slider, Upload, TagInput, Form, Rate;
- overlays: reconciliación de Modal, Drawer, Sheet, AlertDialog,
  ConfirmDialog, Popconfirm y contratos relacionados.

Antes de selección/overlays, completá el bake-off supplier-neutral. Si requiere
instalar un proveedor, escribí la decisión y continuá con las lanes que no
dependen de ella. No bloquees toda la macro-wave, pero tampoco instales a
escondidas.

#### K3

K3 puede avanzar sin esperar una dependencia externa:

- data display: Table, List, Statistic, Descriptions, Timeline, Tree;
- navigation: Menu, Breadcrumb, Pagination, Segmented, Steps, Stepper;
- layout: Collapse, ScrollArea, Layout, Splitter, Affix, Anchor, BackTop.

Priorizá K3 temprano si K2 queda esperando una decisión de supplier. Congelá
primero contratos `data-part`, keyboard collection y pagination compartida para
evitar reescrituras.

Gate mínimo de esta macro-wave:

- R0 aceptable;
- K2/K3 implementation-ready con dos passes y evidencia;
- pool esperado suficiente para que Codex pueda superar 50% del basket después
  de su auditoría;
- Daisy nunca crece;
- budgets y ownership disminuyen o permanecen, nunca se relajan.

### Stretch goal — K4 y tranche de patterns/surfaces

Solo empezá si R0, K2 y K3 están integrados y todos los gates siguen verdes.

K4:

- feedback/overlay: Toast, Notification, Dropdown, ContextMenu, HoverCard, Tour;
- AI-adjacent: CodeBlock, MarkdownView, VoiceInputButton, Calendar;
- specialized display: Carousel, Image, QRCode, ColorPicker, FloatButton,
  Watermark;
- stress inputs: Mentions, OTPInput, Transfer.

Permití defer explícito de Tour/Transfer si red-linean, sin bajar el bar.

Para acercarse o superar 70% del **basket de 120**, K4 por sí solo puede no
alcanzar de forma conservadora. Si queda capacidad y gates verdes, iniciá las
piezas de mayor retorno de P1/P2:

- WorkspaceTabs y ListToolbar;
- contrato y bake-off DataTable sin cambiar renderer público;
- RecordHero;
- ActionDock;
- DetailFactsEditor;
- PriorityBand;
- RankedActionList;
- DecisionBrief;
- AssistantRail;
- OverviewSurface, RecordSurface y ListSurface.

Patterns y surfaces tienen score bar 95. No los certifiques como simples
envoltorios; deben demostrar composición responsive, slots públicos,
white-labeling, i18n/RTL, empty/loading/error, motion y ownership.

### Trabajo paralelo y control de recursos

Podés delegar lanes de código en paralelo si tu entorno lo permite, con estas
reglas:

- ownership de archivos disjunto;
- un único coordinador para tokens, providers, recipes, exports y docs
  compartidos;
- nunca dos builds/checks/test suites pesadas simultáneas;
- integración serial lane por lane;
- un solo showroom/browser server;
- cerrar tabs y procesos al terminar;
- no ejecutar regeneradores globales en paralelo.

### Secuencia de validación serial

Por lane:

1. tests focales;
2. typecheck focal/global cuando corresponda;
3. contract/engine audit relevante;
4. capture E2E;
5. sighted Pass 1;
6. corrección;
7. sighted Pass 2;
8. Axe/keyboard;
9. merge lógico al worktree compartido.

Al cierre:

1. suites completas de todos los dominios tocados;
2. engine audit;
3. typecheck;
4. pretest;
5. builds core/showroom;
6. E2E;
7. `git diff --check`;
8. inventario de procesos;
9. `git status` y stash evidence.

No ejecutes pasos 1–7 en paralelo.

### Stop conditions

Detenete únicamente si:

- necesitás instalar una dependencia y no hay aprobación: documentá la decisión
  y seguí con lanes independientes;
- el mismo gate falla tres veces por causas distintas de arquitectura;
- detectás riesgo de pérdida de trabajo o corrupción del stash;
- una API pública necesita breaking change no compatible;
- se agota el contexto: escribí checkpoint completo y un prompt de continuación
  exacto antes de terminar.

No te detengas solo porque una lane terminó. Continuá con la siguiente segura.

### Handoff obligatorio

Entregá:

1. resumen ejecutivo sin reclamar aceptación;
2. fases R0/K2/K3/K4/P ejecutadas y pendientes;
3. familias por lane y dos passes;
4. archivos por ticket/capa;
5. deuda antes/después;
6. contratos exactos agregados/modificados;
7. manifest de tokens/slots/recipes por familia;
8. matriz static-vs-DB, BitHire-vs-TMM, EN/ES/AR/RTL;
9. evidencia desktop/mobile/coarse/reduced/forced colors;
10. Axe, keyboard y warnings;
11. log serial de comandos con resultados exactos;
12. skips, deferrals y fallos, sin ocultarlos;
13. proveedores/dependencias: cambios o decisión de no cambio;
14. worktree/stash/procesos;
15. candidatos a certificación por familia, nunca porcentajes certificados;
16. proyección recalculada sobre 93 primitivas y 120 artefactos;
17. prompt exacto de continuación si no llegaste al stretch goal.

No hagas commit, push, PR ni publish. No modifiques el ledger ni declares el
goal completo. Dejá todo listo para auditoría independiente de Codex.

## FIN DEL PROMPT
