# Roadmap propuesto, no aplicado

Estado: borrador de consenso. No modifica el roadmap real.<br>
Objetivo: llegar rápido a una versión demostrable sin aceptar cascada ficticia.

## Principio de ejecución

Se paraleliza por ownership disjunto. No se paralelizan dos writers sobre el
singleton del compilador, no se abre drenaje sobre un baseline no reproducible y
no se publica/repinea antes de cerrar delivery.

## Autorizaciones previas del owner

- D2: permitir la enmienda T-1 Expert 294→290 con vínculo a fuente.
- D3: permitir una canaria F4C acotada si la cola vigente no la admite.
- D1: decidir por separado respaldo/CI; no bloquea el trabajo local si se
  acepta el riesgo.
- Button: adjudicar la precedencia de la hoja authored de BitHire.
- app-platform: decidir únicamente el reemplazo de `ProductWindow`; 14/15
  símbolos ya tienen sucesor conocido.

## Tramo 0 — recuperar confianza en los instrumentos

Timebox orientativo: horas a un día.

### Lane A · autoridad y gates

1. Llevar Expert a 290 sin revivir canales retirados.
2. Corregir proyecciones 294/67 y hacer que `program-check` consulte la fuente
   ejecutable.
3. Endurecer el gate causal:
   `output declarado → canal pintado → computed property`.
4. Hacer transport-aware la paridad de proyecciones; estático y DB prueban su
   productor por separado.
5. Corregir el checkpoint de liveness y mantener separadas pertenencia,
   liveness y fallback activo.
6. Volver hermético el drill de `cascade-producers`: fixture temporal y restore
   ante señales; nunca mutar el artefacto real.

### Lane B · evidencia y seguridad local

1. Reanclar los 63 memos con snapshot durable.
2. Persistir y reanclar los 11 que siguen vivos.
3. Inventariar los 36 restantes como `UNRECOVERED`; no fabricar evidencia.

Exit gate: una mutación 290→294, una proyección estática justificada por DB o un
output sin canal pintado deben fallar de forma focal.

## Tramo 1 — conexiones causales con delta

Timebox orientativo: uno a dos días, en tandas paralelas.

### Tanda singleton del compilador

1. Resolver precedencia BitHire.
2. Hacer fan-out de `shape.button-style` a cinco tamaños.
3. Probar static/DB, tres stops, cinco tamaños, restore y negative controls.

### Lanes disjuntos en paralelo

- `recipes.profile`: llevar la selección code-owned al provider con precedencia
  explícita y captura A/B.
- Expert console: búsqueda por descendientes/keypath, con semántica padre/hijos.
- PageShell: reproducir 390 px en Playwright, probar la hipótesis
  `inline-size:100%` y aplicar sólo si el A/B confirma.
- `palette.dark`: preparar la decisión de UX; no ampliar el contrato de
  validación por accidente.

Exit gate: cada fix mueve la propiedad esperada, enumera consumidores que no
movió, restaura byte-exacto y tiene una observación visual.

## Tramo 2 — canaria F4C

### S2a · máximo 48 horas

Familias: Button, Card y DataTable o SectionCard.<br>
Matriz mínima: tres verticales, 390/1280, light/dark cuando aplique, estados
relevantes, static/DB, mutation sentinels, computed y sighted.

Cada control declara:

- universo esperado;
- consumidores que cambiaron;
- consumidores esperados que no cambiaron;
- hardcodes que bypassan;
- fallbacks activos;
- restore y controles negativos.

Stop condition: si la canaria revela que la gramática de edges o evidencia es
incorrecta, no se expande; se corrige el modelo con ese alcance pequeño.

### S2b · expansión condicional

Agregar otras tres a cinco familias y 768 px sólo si S2a mantiene la gramática.
No se intenta cerrar diez controles `SOURCE_BOUND` en una captura si alguno no
tiene cadena productiva.

## Tramo 3 — mapa de cascada y drenaje escalable

1. Renombrar la población a `literal-activo-sin-productor` para no colisionar
   con las clases A/B/C/D constitucionales.
2. Construir un enumerador durable de declaraciones CSS, artefactos, TS/TSX
   literales e interpolados, con scope por engine.
3. Incorporar los drills A/B que falsan el ratchet viejo.
4. Agregar gate de contradicción entre instrumentos.
5. Recalcular la población; recién entonces fijar el baseline.
6. Drenar en paralelo por familias/archivos disjuntos, priorizando fan-out y
   superficie visible. Cada lote termina en computed/sighted, no en conteo de
   tokens.

No se adopta 760/960 ni 2.169 como baseline antes de estos pasos.

## Track de delivery — corre en paralelo con Tramos 1–2

### DS package

- minificar reproduciblemente `dist/*.css` y conservar `styles/*.css` legible;
- actualizar la ley de build que hoy exige paridad byte a byte;
- agregar drill de pintura/paridad semántica y verificar doble minificación en
  Next;
- correr el análisis de release completo: hoy hay otros fallos de bundle además
  de los cuatro CSS.

Timebox técnico estimado: 3–6 horas para el lote CSS, sin contar otros fallos de
release.

### app-platform

- codemod de los 21 canales no ambiguos y `.ds-commercial`→`.ds-mono-surface`;
- migrar 14 símbolos con destino conocido;
- resolver `ProductWindow` en sus 6 imports;
- retirar aliases/entrypoints/verifier obsoletos;
- agregar preflight cross-repo y capturas con la versión candidata.

Superficie real: 22 nombres, 1.329 referencias, 82 archivos de tokens; unión de
imports/CSS/tokens de 102 archivos. Timebox orientativo: 1–2 jornadas incluyendo
visuales, porque casi todo es mecánico.

### Evnto

- reemplazar el build cruzado por un verifier read-only;
- exigir sólo artefactos realmente consumidos;
- alinear pin y symlink;
- documentar el modo local.

Timebox orientativo: 2–4 horas.

### Exit de delivery

No hay publish/repin hasta que CI de release, app-platform y Evnto queden verdes
con la versión candidata. El split por engine se investiga después; no bloquea
la canaria ni este release.

## Después del mapa

- adjudicar diales nuevos nombre por nombre;
- adoptar scope de instancia por cohortes, sin cambiar el registry tenant;
- ejecutar F9 por las 5.100 celdas, usando grupos como generadores de evidencia;
- perfilar gates antes de cualquier recorte;
- publicar métricas ancladas en cada asiento.
