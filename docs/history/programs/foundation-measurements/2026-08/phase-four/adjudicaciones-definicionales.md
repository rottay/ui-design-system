# F4A-1 (parte 1) — Las 5 adjudicaciones definicionales del DT

Fecha: 2026-08-20. Insumo: `/tmp/f4a-0-baseline.md` (F4A-0, worker Opus).
Estas 5 quedan asentadas ANTES de escribir el esquema de asignación de
variantes, porque dos son denominadores que el harness de F4A-2 va a citar.

## A.1 — La regla de metadato (el denominador de pintura)

**Adjudicación: la regla es una LISTA ENUMERADA, no un número.** Una hoja es
metadato si y solo si está en la lista de exclusión escrita por nombre dentro
del artefacto que publica el denominador; todo lo demás es pintura. La lista
inicial es la de F4A-0 (36 hojas: id/name/prosa/booleanos), reproducible línea
por línea en `/tmp/f4a-0/`. El "45" del catálogo queda RETIRADO por no
enumerado — una resta sin sustraendo nombrado no es una regla. Denominador de
pintura vigente: **3.726 − 36 = 3.690** (rottay 1811−meta, bithire 1493−meta,
evnto 422−meta según la lista). El harness de F4A-2 cita ESTE número con la
lista, y la lista vive en el artefacto (decrease-only: entra una hoja nueva a
la lista solo con adjudicación escrita).

## A.2 — Qué es una asignación

**Adjudicación: una asignación es una posición AUTORADA sobre el valor de una
raíz EN LA FUENTE del tema** (el `brand-themes/<tema>/index.ts`), no una
declaración del canal cabeza en el artefacto. La lectura del artefacto (159)
mide otra cosa (cabezas declaradas) y queda como chequeo derivado, no como
definición. Consecuencia: el roster de asignaciones gobernadas NO se hereda
del catálogo (263, no reproducible) — **es el output del propio esquema de
F4A-1**: cada entrada del esquema ES una asignación con su domicilio, y el
número del frente es el que el esquema enumere. El catálogo se re-deriva del
esquema, no al revés. Las 95 divergencias quedan explicadas por la definición
(posiciones de fuente incluyen raíces cuya cabeza deriva o no se emite como
tal — ej. `--ds-state-hover-shift`).

## A.3 — Las 2 referencias var() fantasma (rottay, evnto)

**Disposición: rastreadas, no bloqueantes.** No aparecen en el árbol de hoy y
no hay dónde se escondan (F4A-0 verificó: un solo modo por tema, walk entero
= suma de scopes, sin arrays sueltos). La predicción probablemente vino de
otro árbol. Cada lote de familia que toque hojas con var() verifica el conteo
contra el suyo; si al cierre de F4A nadie las encontró, se asienta que la
predicción era de otro árbol y punto. No se escribe nada para "cuadrar" el
número.

## A.4 — Asimétricas: el censo correcto es 16

**Adjudicación: las raíces con al menos un tema en cero son 16, no 9** —
14 derivationDebt + `tier.accent.bg` + `effect.intensity` (las 2 sin DD). El
nudo K4 de F4A-14 trabaja sobre estas 16. El conjunto mayor "22 asimétricas"
queda como estaba registrado (su universo era otro eje), pero el subconjunto
tema-en-cero se corrige a 16 en todo documento futuro.

## A.5 — `tier.page.fg`: 42 canales, no 43

**Adjudicación: 42.** La lista exacta vive en `/tmp/f4a-0/tier-page-fg-43.txt`
(nombre histórico del archivo; el contenido son los 42). El radio 75 del
catálogo es otra métrica (canales en el radio de la raíz, no canales con
valor idéntico a la cabeza). El nudo K3 de F4A-6 trabaja sobre los 42.

---

## Lo que sigue en F4A-1 (parte 2, próximo documento de diseño)

El esquema de asignación de variantes propiamente dicho:

1. La forma de una "asignación gobernada" (convención de anotación: kit de
   comentarios vs metadata estructurada vs vista generada) — decisión central
   del DT. Restricciones del plan: mismo `FirstPartyBrandTheme` export, mismo
   lowering, sin segunda foundation, ley de placeholder (una ausencia es una
   invariancia escrita con razón + puntero a la capability que gobierna).
2. Los 4 domicilios aplicados a las 63 raíces × 3 temas (semillas/variantes
   con dial; baseline/invariante con razón; internal-head con función citada;
   Pro/Expert acotado).
3. Orden canónico + kit de comentarios canónicos + mecánica de placeholders.
4. La adjudicación escrita de los 6 nudos (K1 descongelar primary — 135
   lectores; K2 par border — 3 relaciones distintas; K3 tier.page.fg — 42
   canales, 3 destinos rivales; K4 las 16; K5 H4; + domicilios de las 10
   por-crear).
5. El registro de los 3.275 candidatos de colapso (registrar, NO colapsar).
