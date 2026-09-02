# Nota de honestidad de modelo + resumen de revisiones previas al cierre F4C

Regla del owner (2026-08-30): ninguna revisión puede llevar nombre de asiento
Claude si fue ejecutada por un subagente interno Kimi K3. Registro fiel:

## Lo que SÍ corrió y con qué modelo real

| Revisión | Modelo real | Forma | Resultado |
|---|---|---|---|
| Auditoría harness F4C (DEFECTS-5, todos remediados) | Kimi K3 (subagente interno) | lectura completa del harness + fuentes | 5 defectos concretos; 1-3 y 5 remediados, 4 declarado |
| Revisión estructural de receipts + guards + reproducibilidad de scouts | Kimi K3 (subagente interno) | re-ejecución de comandos del censo y `--check` en vivo | ACCEPT estructural; OBS-1/2/3 no bloqueantes (asentadas en F4C/README §7) |
| Revisión arquitectónica ClientOnly + digest D | Kimi K3 (subagente interno) | verificación de mecanismo en admission/provider/compiler | ACCEPT de ambas decisiones; elevó DEFECT-1 (ssrReceipt inalcanzable en topología RSC→cliente) a deuda del programa con 4 condiciones de registro |
| Fórmula COH-1 | Claude Opus REAL (`claude -p --model opus`, tmux `mr-opus-coh1`, desde ui-design-system) | revisión del paquete COH-1 | en curso al momento del cierre F4C; alimenta la implementación COH-1 |
| Prep COH-1 en worktree aislado | Claude Sonnet REAL (`claude -p --model sonnet`, tmux `mr-sonnet-coh1`, worktree `ui-design-system-coh-1`) | medición baseline + sitios de edición + tests draft | en curso al momento del cierre F4C |
| Auditoría de cierre F4C | Fable REAL (`claude -p --model fable`, tmux `mr-fable-f4c-close`) | post-audit de bytes finales | la que manda para el commit |

## Condiciones de registro de la deuda DEFECT-1 (ssrReceipt)

(i) el contrato `ssrReceipt` excluye la topología RSC canónica (acuñar en Server
Component, auditar en Client Component): la WeakSet de
`MINTED_SSR_RECEIPTS` no puede sobrevivir ni la doble instancia de módulo ni la
serialización flight;
(ii) el canary F4C ya no ejerce la admisión SSR por receipt end-to-end (queda
cubierta por tests de una sola instancia,
`visual-authority/tests/ssr-emission-receipt.test.ts`);
(iii) antes de que app-bithire adopte el contrato actual, decidir entre
documentar/forzar el sobre viable (acuñado en capa cliente, como hacen las
superficies `showroom-tenant`/`torture-surface`/`visual-authority-probe`) o
evolucionar el receipt a una prueba por valor;
(iv) migración pendiente de los atributos del `<style>` de producto
(`app-bithire/src/app/layout.tsx:248-256`, `id="ds-runtime-tenant-theme"`) al
esquema de prueba actual.
