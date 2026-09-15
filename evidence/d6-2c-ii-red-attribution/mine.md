# Grupo `mine` (coordinador del lote) — 16 archivos, 19 aserciones

## Atribución primero (A/B contra el HEAD prístino)
Corrí mis 16 archivos en las dos ramas antes de tocar nada:

| | árbol 2c-ii | HEAD prístino |
|---|---|---|
| tests | 19 failed / 390 passed | 18 failed / 390 passed |

**18 de mis 19 rojos son FORÁNEOS**, idénticos en HEAD. Sólo uno lo causó el lote. Eso **corrige la pre-clasificación en sus clases 7 y 8**: ni el "stale preset naming" ni la ausencia de DOM de WorkspaceSwitcher son de este lote.

## Clase 8 · WorkspaceSwitcher (4 aserciones) — causa raíz, y NO es un defecto de tema
**Root cause medida.** El motor modern se monta con `React.lazy` dentro de un `Suspense`
(`runtime/engines/presentation/component-factory/index.tsx`), así que el PRIMER render de un
componente modern en un módulo fresco devuelve el fallback vacío. Sonda: primer
`render(<Button engine="modern"/>)` → `<<EMPTY>>`; `rerender` en el mismo test → todavía vacío;
segundo test del archivo → renderiza. Por eso falla exactamente UNA aserción por archivo (la
primera que monta modern) y pasan las demás.

**A/B**: `WorkspaceSwitcher.test.tsx` da 1 failed / 17 passed idéntico en HEAD. **Preexistente.**
No depende de ninguna clave de tema: la hipótesis de la pre-clasificación ("¿renderiza
condicionalmente sobre una clave que el compile neutro ya no emite?") queda descartada por medición.

**Disposición (i)** en las cuatro, con la reparación que no debilita nada: esperar el límite lazy
con `findBy*` en vez de `getBy*`. `findBy` falla igual de fuerte si el elemento nunca monta.
Resultado: **4 archivos, 73/73 verdes.**

## Clase 7 · nombres de preset obsoletos (6 aserciones) — (ii), y NO hay defecto P0
El brief pedía: "si el mount reporta un preset que el roster no asigna, es un defecto P0 de
producto". **Verificado, y es al revés**: el roster no asigna ningún recipe profile, sólo el
documento de preset de **bithire** decide uno (`rottay/technical-sharp@1`), y el bloque runtime
del artefacto lo refleja. Los tests nombraban `rottay/network-professional@1` y
`rottay/editorial-round@1`, que eran los perfiles de los temas AUTORADOS retirados. No hay
divergencia producto-roster: hay fixtures obsoletas.

- `tampered-runtime-block` (2): el tamper apuntaba a rottay, que ya no compila perfil, así que no
  había desacuerdo posible que la ley pudiera detectar. Re-apuntado a **bithire**, la única
  vertical con perfil compilado, y la segunda aserción pasa a afirmar que rottay proyecta
  `data-recipe-profile` ausente. La ley ("el bloque embarcado no puede contradecir al compile")
  queda igual de fuerte y ahora tiene sujeto. 2/2.
- `recipe-profile.integration` (3): la lectura code-owned pasa a bithire; el anti-trampa
  "al menos dos verticales declaran y declaran distinto" se reemplaza por un pin EXACTO de la
  población (`['bithire:rottay/technical-sharp@1']`), que es más fuerte: una vertical que empiece
  o deje de declarar enrojece. El par visible pasa a "vertical con perfil" contra "vertical en
  defaults de engine", con `size=sm`/`variant=outline` como evidencia de que el perfil MUEVE. 10/10.
- `code-owned-governed-behavior` (1): perfil de bithire re-anclado. Y un hallazgo adyacente:
  `behavior.motion` pierde `entranceDuration` — era un campo del tema autorado sin decisión de
  preset detrás. Re-anclado y **reportado al DT como candidato de registro**.

## Clase 9 y 10 · el resto de mi set
- `canonical-digest-identity` (1) — (ii). Duodécimo movimiento declarado, con la causa escrita: el
  delta resta OTRA baseline. Además cambié el censo de un `toHaveLength(63)` a un **pin por
  nombre de los 63 canales**, más fuerte que el conteo que reemplaza. Y las tres filas
  "displaced" pasan del primary autorado `#3a6fb0` al del preset `#2F5BE8` / `#2047D3`, medidos.
- `customization-fields` (1) — (ii). El par derivado `--ds-color-text-on-primary` ya no se reporta
  **porque aprueba**: la semilla es casi blanca y la tinta derivada sobre ella es oscura. Pineé el
  conjunto EXACTO de los 8 mensajes (4 tintas × 2 modos, con su Lc), más fuerte que el
  `some(...)` que reemplaza, y asevero explícitamente la ausencia del par derivado con su razón.
- `tenant-document-v2` (1) — (ii). El brazo "unlit" se quedó sin sujeto: **ninguna fila del catálogo
  carece hoy de `keypath.brandTheme`** (medido, lista vacía). Reemplazado por esa medición sobre
  el catálogo entero, que es lo que el ejemplo representaba y enrojece si nace una fila sin keypath.
- `context-identity` (1) — (i) registrada en D6-2b. El octavo consumidor es
  `adaptation/runtime/container-posture`, que lee el contexto para resolver la escalera de
  contenedores. Inscripto en el inventario con su razón; el título pasa de "siete" a "ocho".
- `quality-evidence` (1) — **el ÚNICO rojo que este lote causó en mi set**, y es el piso haciendo su
  trabajo. Con el verificador APCA resolviendo referencias (ronda 2), los tres fixtures de tortura
  quedaron medibles y dos pares resultaron ilegibles de verdad. Reparados en el fixture siguiendo
  su propia convención escrita, cada uno con su medición:
  - `quality-editorial-flat`: par del sidebar Lc **0.0** (tinta y fondo resolvían al mismo canal
    neutro que el fixture sobreescribe) → autora `bg #F2ECE0` / `text #25231F`, Lc **91.6**.
  - `quality-humanist-soft`: idéntico mecanismo → `#F9F7F2` / `#20303A`, Lc **95.3**.
  - `quality-technical-dark`: tres tintas disabled derivadas medían Lc **-10.9 / -10.1 / -10.8**
    contra panel, card y control, con piso 45 → autora `#8FA3BA`, que mide **-50.2 / -49.3 / -50.0**.
  16/16.
- `SpatialExperience` (1) — flake: verde al re-correr, sin tocar nada.
- `transport-parity` (1) y `capability-propagation` (1) — (ii). `recipe-profile` declara
  `effect: "data-only"`, así que no es una fila de doble transporte CSS y la ley de paridad de
  bytes no tiene sujeto para ella. Sale de la tabla de `CASES` con la razón escrita, y en
  capability-propagation el lazo de canales excluye las filas data-only **leyendo el `effect` del
  catálogo**, nunca una lista de ids. 122/122 y 43/43.

## Lo que NO toqué, y por qué
`probe-roster` (2 aserciones) sigue rojo **a propósito**. Las fixtures viven en
`scripts/check/tokens/cascade/probe/foundation/roster/index.mjs`, que es un INSTRUMENTO del
coordinador; el brief prohíbe que yo re-ancle instrumentos. La deriva está medida y es preexistente:
- `card-modern-md`: el componente renderiza `data-posture="phone"` que la fixture no tiene.
- `input-modern-md`: las clases pasaron de `rottay-input-field` / `rottay-input--modern` a
  `ds-input-field` / `ds-input-shell--modern`.
El propio test imprime la receta: renderizar con `renderToStaticMarkup`, quitar los ids de React,
re-agregar `data-probe` y pegar en el roster.

## Verificación
`vitest run` sobre mis 16 archivos: **407 passed / 2 failed**, y los 2 son los de `probe-roster`.
`tsc --noEmit`: 0. `typecheck:tests`: OK, 0 sobre baseline 0.

## Archivos tocados (tests y fixtures; CERO producto)
- `src/components/patterns/navigation/workspace-switcher/tests/{WorkspaceSwitcher,WorkspaceSwitcher.integration,WorkspaceSwitcher.modern-rescue,WorkspaceSwitcher.menu-anatomy}.test.tsx`
- `src/infrastructure/runtime/theming/composition/mount/tests/tampered-runtime-block.test.ts`
- `src/infrastructure/runtime/bootstrap/facade/react/provider/tests/{recipe-profile.integration,code-owned-governed-behavior.integration}.test.tsx`
- `src/infrastructure/compilers/composition/tenant-theme/tests/canonical-digest-identity.test.ts`
- `src/infrastructure/runtime/tenant/composition/react/provider/tests/context-identity.test.ts`
- `tests/integration/{customization-fields,transport-parity,capability-propagation}/index.test.ts`
- `tests/system/public-api/tenant-document-v2/index.test.ts`
- `tests/fixtures/tenants/quality-evidence/index.ts` (fixture, declarado aparte)
