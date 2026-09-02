# Evidencia persistida - 2026-08 (snapshots inmutables)

Persistencia ejecutada por el paquete documental del asiento 2026-08-23 de
`docs/history/programs/architecture-refactor/2026-08/execution/index.md` (correccion C5, con el alcance ampliado
que fijo la revision Fable de esa fecha).

Motivo: `/private/tmp` es medio volatil y la cadena probatoria del ledger vivia
entera en el. Estos archivos son snapshots inmutables: no se editan jamas; una
correccion futura es un archivo nuevo, nunca una edicion de estos.

Procedimiento aplicado, archivo por archivo:

1. Enumeracion de los memos `/private/tmp/*.md` referenciados por el roadmap
   (`grep -o '/private/tmp/[a-z0-9._-]*\.md'`, unicos).
2. Recomputo del SHA-256 del archivo en origen.
3. Busqueda del SHA asentado para ese path en el roadmap, exigiendo adyacencia
   al path: prosa `, SHA <hex>` o fila de tabla `| path | hex |`.
4. Copia solo si el SHA recomputado coincide con el asentado. Un path sin SHA
   asentado se copia y se marca `SIN_SHA_ASENTADO`. Un `MISMATCH` NO se copia y
   queda registrado como tal.
5. Los tres artefactos del 2026-08-23 se verifican contra el SHA declarado en la
   seccion 0 de la revision Fable y en su archivo `.ready`.
6. Cada copia se re-hashea en destino y se compara contra el origen.

Resultado: **63 filas** (MATCH = 62, MATCH(SHA en .ready, no inline) = 1). Archivos copiados: **63**. No copiados: **0**.

## Memos del ledger referenciados por el roadmap

| # | Archivo | Origen | SHA-256 recomputado | Estado |
|---|---|---|---|---|
| 1 | `f4a-14a-fable-preaudit.md` | `/private/tmp/f4a-14a-fable-preaudit.md` | `50b307dedc89c751c9b77096d8a0a0dd5470258af76e985faa4c0203932adbd2` | `MATCH` |
| 2 | `f4a-14a-opus-implementation-brief-v3.md` | `/private/tmp/f4a-14a-opus-implementation-brief-v3.md` | `06ecaa76c0a54b018fa91ca5d1bc68326e83e0af8af49c7779361a9ec0622ff1` | `MATCH` |
| 3 | `f4a-14a-opus-implementation-brief.md` | `/private/tmp/f4a-14a-opus-implementation-brief.md` | `bb44393a163e1624b75b2d2fbab572b3c50dc71bfc4dd97526c15cf16fa14837` | `MATCH` |
| 4 | `f4a-14a-reporte.md` | `/private/tmp/f4a-14a-reporte.md` | `20d748556bc9272cd74331701ee7138c1dde25000d1d3fb3bae971e5f407f088` | `MATCH` |
| 5 | `f4a-14a-v2-fable-reaudit.md` | `/private/tmp/f4a-14a-v2-fable-reaudit.md` | `adb815ef7f30dd2d3be5c860271424fd6dbb562ad9556f22a5051949f8e3e53b` | `MATCH` |
| 6 | `f4a-14a-v3-fable-reaudit.md` | `/private/tmp/f4a-14a-v3-fable-reaudit.md` | `22c39c6de36f75cd78e53f192f00106af249db033cd20a0e3f559d41cc0f5918` | `MATCH` |
| 7 | `f4a-15-k5-final-decision-packet-opus-v2.md` | `/private/tmp/f4a-15-k5-final-decision-packet-opus-v2.md` | `c29bf3fbfd5cdbf81b106d595c70c4572b2864549fdc52746aaf951f27a3ae15` | `MATCH` |
| 8 | `f4a-15-k5-final-packet-fable-preaudit.md` | `/private/tmp/f4a-15-k5-final-packet-fable-preaudit.md` | `44414513d85d4b3d0d34c177be330b26629a8c61abc0d8a29de1dca582d608ca` | `MATCH` |
| 9 | `f4a-15-k5-final-packet-v2-fable-ratification.md` | `/private/tmp/f4a-15-k5-final-packet-v2-fable-ratification.md` | `d2554c9068836bd364e18d979c058ac8e416871d607bdff16220fbbb3cc3fe20` | `MATCH` |
| 10 | `f4a-15-k5-opus-adjudication-v2.md` | `/private/tmp/f4a-15-k5-opus-adjudication-v2.md` | `3590a3234222bb74386e2dac4cfd945ee064ae82bf3f30629924c7686e3869a9` | `MATCH` |
| 11 | `f4a-15-k5-sonnet-inventory.md` | `/private/tmp/f4a-15-k5-sonnet-inventory.md` | `5ea2c0eaef80e802730ae44f139d736565b1f2d51286d8d1adf6b7bd0c2bf2a2` | `MATCH` |
| 12 | `f4a-15-k5c-sonnet-semantic-map-v2.md` | `/private/tmp/f4a-15-k5c-sonnet-semantic-map-v2.md` | `fdf3ccc7a1831dce49636afde07d3d5c2f7c73f33bf9a38bc20caff58b3c9c4b` | `MATCH` |
| 13 | `f4a-15-k5c-v2-fable-ratification.md` | `/private/tmp/f4a-15-k5c-v2-fable-ratification.md` | `f0a972c08134c3c307435db15a86d498c4bd826708d8789ad574a2e622b6f967` | `MATCH` |
| 14 | `f4a-close-lot-a-fable-final-postaudit.md` | `/private/tmp/f4a-close-lot-a-fable-final-postaudit.md` | `fe593863a4ee9daaa73ec33950dba329f69f6d2817afcd898178a7e1b75f11c9` | `MATCH` |
| 15 | `f4a-close-lot-a-sonnet-source-ready.md` | `/private/tmp/f4a-close-lot-a-sonnet-source-ready.md` | `376864d0350661cedcffd8d91597baf6852e1fc243eeb7def4625e7eb43c8f24` | `MATCH` |
| 16 | `f4a-close-lot-b-fable-postaudit.md` | `/private/tmp/f4a-close-lot-b-fable-postaudit.md` | `06a624a2bd79c9a3d582ed85cb0added96abc816596060886688fae9af032793` | `MATCH` |
| 17 | `f4a-close-lot-b-sonnet-source-ready.md` | `/private/tmp/f4a-close-lot-b-sonnet-source-ready.md` | `57161e5b7c86814c5e8bcf5a945758c0dae0c2ace0687cbf1dd7a97fbee40e86` | `MATCH` |
| 18 | `f4a-close-lot-c-fable-postaudit.md` | `/private/tmp/f4a-close-lot-c-fable-postaudit.md` | `1c5a9a865ae54cf131d208e4237668949e13fe3782660fe1cca14ea39bb5b3ed` | `MATCH` |
| 19 | `f4a-close-lot-c-sonnet-source-ready.md` | `/private/tmp/f4a-close-lot-c-sonnet-source-ready.md` | `efce37aadebf3e2787ec8c5376040ace54cf33b98859d85793e202400d6a9eed` | `MATCH` |
| 20 | `f4a-close-opus-adjudication.md` | `/private/tmp/f4a-close-opus-adjudication.md` | `9ab5229577259f5bc2df76f31522346f42a9dabb2a74c4ac0be438b8a6d15b2a` | `MATCH` |
| 21 | `f4a-close-opus-fable-challenge.md` | `/private/tmp/f4a-close-opus-fable-challenge.md` | `e5375ae35be400a78abb492d3d94b6ad112d57989ca02f85fb0968cde2939845` | `MATCH` |
| 22 | `f4a-close-real-parity-fable-postaudit.md` | `/private/tmp/f4a-close-real-parity-fable-postaudit.md` | `c1b081910ad347ad1d6cc02f659e71763186313d08df20fafab4ecc00e90b563` | `MATCH` |
| 23 | `f4a-close-real-parity-sonnet-source-ready.md` | `/private/tmp/f4a-close-real-parity-sonnet-source-ready.md` | `9256c7688d8b6af488c1cdbf51ee8ae22251fc2f63b4754077d59bb6b8dbe73c` | `MATCH` |
| 24 | `f4a-close-semantic-groups-opus.md` | `/private/tmp/f4a-close-semantic-groups-opus.md` | `9298efb4fbd690fdfc88722c57b2ea3929b46f0755bda902063bd73ad30f5cdc` | `MATCH` |
| 25 | `f4a-close-sonnet-inventory.md` | `/private/tmp/f4a-close-sonnet-inventory.md` | `d52f36ac4a086bc3f196255573c0d4203032b194bd09685c32a7d569998abd87` | `MATCH` |
| 26 | `f4a-final-conflict-fable.md` | `/private/tmp/f4a-final-conflict-fable.md` | `f3737fd8ee778b10001e1ac0a9a5314ee708bdf03e5a46ca1550437afdb7a425` | `MATCH` |
| 27 | `f4a-k4-fable-postaudit.md` | `/private/tmp/f4a-k4-fable-postaudit.md` | `e81d965fd51643e6c2a05f0fbcdddc51b6312e793aa8fd91a23b7768472174f4` | `MATCH` |
| 28 | `f4a-k5-full-consolidated-opus-brief.md` | `/private/tmp/f4a-k5-full-consolidated-opus-brief.md` | `7580e63289d7ef2ad3f01e69737ee790e32335d0d6ef8f9809ae2e51a675ace8` | `MATCH` |
| 29 | `f4a-k5-full-dt-corrections-v2.md` | `/private/tmp/f4a-k5-full-dt-corrections-v2.md` | `f38de26fa8fd20a14825de6ba8f3517a3421dc9de40c83eac0102e6f2336112a` | `MATCH` |
| 30 | `f4a-k5-full-fable-postaudit.md` | `/private/tmp/f4a-k5-full-fable-postaudit.md` | `b4b401eae4fec10ac976845056f5c8fd6abde65063e2f93f0a66822ecf53a619` | `MATCH` |
| 31 | `f4a-k5-full-fable-ratification.md` | `/private/tmp/f4a-k5-full-fable-ratification.md` | `d4be41dfc06007a27170d4660e83285f2255bf8f5fe2872982f2c9c666c67b12` | `MATCH` |
| 32 | `f4a-k5-full-sonnet-source-ready.md` | `/private/tmp/f4a-k5-full-sonnet-source-ready.md` | `e3d9adb415abe70e8488e6b295454dac17f4739d6b1f51bead08adb0b62b23e6` | `MATCH` |
| 33 | `f4a-k5-gat07-authority-digest-fable.md` | `/private/tmp/f4a-k5-gat07-authority-digest-fable.md` | `6e2a800ae0956b3c34db5e6b53e8a178cde888408ea4359d4f341d20d7b6abf2` | `MATCH` |
| 34 | `f4a-k5-gat07-authority-digest-opus.md` | `/private/tmp/f4a-k5-gat07-authority-digest-opus.md` | `f9ae84efdeb5f9695fc4f30901b003c52e529a5cbe299cc50a64d9d797af7116` | `MATCH` |
| 35 | `f4a-k5-gat07-seal-fable-postaudit.md` | `/private/tmp/f4a-k5-gat07-seal-fable-postaudit.md` | `884d3cbf898ff00cbc25f29b42aaf52522675868eb694b9b268c3ae639ebd01b` | `MATCH` |
| 36 | `f4a-k5-gat07-seal-sonnet-retry-source-ready.md` | `/private/tmp/f4a-k5-gat07-seal-sonnet-retry-source-ready.md` | `1427ebec193fc249c818d081eb3147b005a2d90435c09db13af006704e419471` | `MATCH` |
| 37 | `f4a-pre-k4-dt-sequence-ruling.md` | `/private/tmp/f4a-pre-k4-dt-sequence-ruling.md` | `baa48c13d99db39c150c4eb2329d189e24e8bb34340a04a83b391549565c7bd2` | `MATCH` |
| 38 | `f4a-pre-k4-fable-sequence-ratification.md` | `/private/tmp/f4a-pre-k4-fable-sequence-ratification.md` | `e6a6ba3f60924d8ada3b9d740e43ed30c2d6083439bdb54b1c6149b5d521a263` | `MATCH` |
| 39 | `f4a-pre-k4-hardening-fable-postaudit.md` | `/private/tmp/f4a-pre-k4-hardening-fable-postaudit.md` | `929870cd5ccfb1fb54fca8474e08733ca2e8a5c0b312b2688a61456f97232997` | `MATCH` |
| 40 | `f4a-pre-k4-hardening-opus-source-ready.md` | `/private/tmp/f4a-pre-k4-hardening-opus-source-ready.md` | `291ff3e9c8e0cecc22e42dcd3a1194059337574a11cafc0ddef707193d27e94a` | `MATCH` |
| 41 | `f4a-pre-k4-r1-reanchor.md` | `/private/tmp/f4a-pre-k4-r1-reanchor.md` | `09d8a180cd0ab34bbde5656ac77536f66c4c33c2d215c8130038cdeaf23c0c23` | `MATCH` |
| 42 | `f4a-pre-k4-t1a-fable-postaudit.md` | `/private/tmp/f4a-pre-k4-t1a-fable-postaudit.md` | `f5c3f1044f03261b40f271eceb1189df0e81acca856b52ba2f1403075a8cb851` | `MATCH` |
| 43 | `f4a-pre-k4-t1a-fable-preaudit.md` | `/private/tmp/f4a-pre-k4-t1a-fable-preaudit.md` | `be99a11fe11c3bf3d94235659e7fa02ad69ff1aaa5e28f6be4bdb6b4cf23ab6e` | `MATCH` |
| 44 | `f4a-pre-k4-t1a-opus-brief.md` | `/private/tmp/f4a-pre-k4-t1a-opus-brief.md` | `53110c0573ec41e3c208028ad3b0e1046862f46e6f5872519376fe3a67465e02` | `MATCH` |
| 45 | `f4a-pre-k4-t1a-sonnet-source-ready.md` | `/private/tmp/f4a-pre-k4-t1a-sonnet-source-ready.md` | `95d695f8190fd4ed4c2e70a59781403ce011609653559f2936b644f700344906` | `MATCH` |
| 46 | `f4a-pre-k4-t1b-fable-postaudit.md` | `/private/tmp/f4a-pre-k4-t1b-fable-postaudit.md` | `df8f92c8ce08d48651596d9eaed55b2d4228bd4e04941feff4fb8fe7ed2f1ac9` | `MATCH` |
| 47 | `f4a-pre-k4-t1b-fable-preaudit.md` | `/private/tmp/f4a-pre-k4-t1b-fable-preaudit.md` | `1223e2cf83c90d447e6e558bbfb4e7b2499cb3b09115e161bfb2ddcf55076eee` | `MATCH` |
| 48 | `f4a-pre-k4-t1b-opus-brief.md` | `/private/tmp/f4a-pre-k4-t1b-opus-brief.md` | `83df046539cc498ee129c7fd9fc48a11856488f9fc53e88f1ffa74e0be50ca7d` | `MATCH` |
| 49 | `f4a-pre-k4-t1b-sonnet-source-ready.md` | `/private/tmp/f4a-pre-k4-t1b-sonnet-source-ready.md` | `1a42e6fffc22b1a7dcb1b42c12cb5adbc088de905bb0da9b79ff996fc5c66e86` | `MATCH` |
| 50 | `f4a-t0-dt-adjudication.md` | `/private/tmp/f4a-t0-dt-adjudication.md` | `0d9b57705609be63533e3ede44a3feaa10b396484790f66ea96a44711fe4d468` | `MATCH` |
| 51 | `pre-f4b-lot-a-correction-plan-fable-challenge.md` | `/private/tmp/pre-f4b-lot-a-correction-plan-fable-challenge.md` | `37dcdf461f4ff7741cec8c04976f01113c6abd27f19e8565148e0ef204ef1a2d` | `MATCH` |
| 52 | `pre-f4b-lot-a-correction-plan-independent-audit.md` | `/private/tmp/pre-f4b-lot-a-correction-plan-independent-audit.md` | `092cd49ce47163e0a514de64fd19732bd7dde94187635de57e0ecb91086330cc` | `MATCH` |
| 53 | `pre-f4b-lot-a-correction-plan-opus.md` | `/private/tmp/pre-f4b-lot-a-correction-plan-opus.md` | `979b5187e2d97394a1000a66ba264363944709b620c16144b4eff716cbedc459` | `MATCH` |
| 54 | `pre-f4b-lot-a-fable-postaudit.md` | `/private/tmp/pre-f4b-lot-a-fable-postaudit.md` | `caa9c481e9e5f7adf7220625305da673a8f73ad22921b2847d36ce5f9ed46885` | `MATCH` |
| 55 | `pre-f4b-lot-a-opus-source-ready.md` | `/private/tmp/pre-f4b-lot-a-opus-source-ready.md` | `e81ee0fe30e45951806f7cd930424393f27fa3074f01d4fdf67429f8ecf52611` | `MATCH` |
| 56 | `pre-f4b-lot-a-unknown-provenance.md` | `/private/tmp/pre-f4b-lot-a-unknown-provenance.md` | `f97642537049b03fc642f5a3ee2f0e2e750b7ee280f247f8cec8572d69f60f3f` | `MATCH` |
| 57 | `pre-f4b-sonnet-inventory.md` | `/private/tmp/pre-f4b-sonnet-inventory.md` | `411f29a1fe4a66f63160db12d8c11a66c33b92d5d09f112cb7da578503ddd731` | `MATCH` |
| 58 | `pre-f4b-unknown-sonnet-census-fable-review.md` | `/private/tmp/pre-f4b-unknown-sonnet-census-fable-review.md` | `97207ad3bfd9b9f4ae2037e5f15b2171790e593e201a3621bfb5b0efabfdc0e9` | `MATCH` |
| 59 | `pre-f4b-unknown-sonnet-census-independent-audit.md` | `/private/tmp/pre-f4b-unknown-sonnet-census-independent-audit.md` | `43bef9bf9471016ff733255010f4028030f87fb0399dc3aff94526c00b9c1c5a` | `MATCH` |
| 60 | `pre-f4b-unknown-sonnet-census.md` | `/private/tmp/pre-f4b-unknown-sonnet-census.md` | `4b0c3e5da33b44032a425cff5504c6d59fe4a567110aa47390d028eec4d1aab4` | `MATCH` |

## Artefactos del 2026-08-23 (re-auditoria Kimi K3 y su revision Fable)

| # | Archivo | Origen | SHA-256 recomputado | Estado |
|---|---|---|---|---|
| 1 | `modern-rescue-fable-review-kimi-corrections-2026-08-23.md` | `/private/tmp/modern-rescue-fable-review-kimi-corrections-2026-08-23.md` | `a73cca0d25cdf2acb1f43e1a816b14072950a062bb0da812168202c41c0b5c6f` | `MATCH(SHA en .ready, no inline)` |
| 2 | `modern-rescue-kimi3-fresh-session-prompt-2026-08-23.md` | `/private/tmp/modern-rescue-kimi3-fresh-session-prompt-2026-08-23.md` | `c328f4254c1509c1894885028c1bd85f5d170f1f84ade0fcee8f6590953fbd62` | `MATCH` |
| 3 | `modern-rescue-kimi3-independent-reaudit-2026-08-23.md` | `/private/tmp/modern-rescue-kimi3-independent-reaudit-2026-08-23.md` | `2b87b306e2b4d372533dd314f35d8e6c165e027e806eab4b16fecf391791a518` | `MATCH` |

## Artefactos del 2026-08-23 (segundo lote): re-medicion advisory de experience.profile post-H-1

Estos 10 archivos son la medicion pintada que REFUTO la equivalencia de brazos
de `experience.profile` bajo el instrumento corregido (brazo estatico con
baseline del vertical). No son receipts del programa: son evidencia advisory de
la refutacion asentada en el roadmap (asiento H-1 + F4B-5) y en
`manifest/controls/experience.profile.json#knownDefects`. Copia ejecutada por
el DT desde `/private/tmp/h1-experience-advisory/` con verificacion hash por
archivo (10/10 MATCH).

| # | Archivo | Origen | SHA-256 recomputado | Estado |
|---|---|---|---|---|
| 1 | `h1-experience-advisory/bithire-editorial.json` | `/private/tmp/h1-experience-advisory/bithire-editorial.json` | `afeaabd27dc6432b857fbaf1c2b400a06d8a8e168642d4ebc50de38efbbdcdb9` | `MATCH` |
| 2 | `h1-experience-advisory/bithire-technical.json` | `/private/tmp/h1-experience-advisory/bithire-technical.json` | `a0650656ce9e72253a9299e314b06bc1d6cab484f0152098a3fabf3a5629ba23` | `MATCH` |
| 3 | `h1-experience-advisory/evnto-editorial.json` | `/private/tmp/h1-experience-advisory/evnto-editorial.json` | `f44a7dd89c1ec058ceac768cd9eaab7e8bae01d5b2350c6f794c5d3057741b7b` | `MATCH` |
| 4 | `h1-experience-advisory/evnto-editorial.json.receipt.json` | `/private/tmp/h1-experience-advisory/evnto-editorial.json.receipt.json` | `db79cf45b07541dc51c5d70cc4234234f7367802ef9abb4412a8faebcd757f65` | `MATCH` |
| 5 | `h1-experience-advisory/evnto-technical.json` | `/private/tmp/h1-experience-advisory/evnto-technical.json` | `dcbd3d1ff20a76f0f5df460bf0a56f3e79eb4f3f6f69f84592f2c669d9b441c3` | `MATCH` |
| 6 | `h1-experience-advisory/evnto-technical.json.receipt.json` | `/private/tmp/h1-experience-advisory/evnto-technical.json.receipt.json` | `7f970539e49a613dcea1ae9ee9ddf054698717711947f1497e385e90eed86384` | `MATCH` |
| 7 | `h1-experience-advisory/rottay-editorial.json` | `/private/tmp/h1-experience-advisory/rottay-editorial.json` | `d5bfb85ae131ad9645d809fb8f61f106984ef9640ea9cea97b9536f9565e3ca8` | `MATCH` |
| 8 | `h1-experience-advisory/rottay-editorial.json.receipt.json` | `/private/tmp/h1-experience-advisory/rottay-editorial.json.receipt.json` | `c38c7f0185a09cadb2d959af18a9bc3a3434eb88e6a551345b61fc9530e7ce69` | `MATCH` |
| 9 | `h1-experience-advisory/rottay-technical.json` | `/private/tmp/h1-experience-advisory/rottay-technical.json` | `6fbcd43e6d468bb2391f33b6463a8fd3f651d7a01f14b043c7be767f3aedc5df` | `MATCH` |
| 10 | `h1-experience-advisory/rottay-technical.json.receipt.json` | `/private/tmp/h1-experience-advisory/rottay-technical.json.receipt.json` | `8e188ad6dba45d5c31258679d1ab62bf5977e1e73a3a932e4fe38e356c2dceaa` | `MATCH` |
