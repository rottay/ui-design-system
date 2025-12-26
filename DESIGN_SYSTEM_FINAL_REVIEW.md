# DESIGN SYSTEM - FINAL REVIEW & RECOMMENDATIONS

**Fecha:** 2025-12-24
**Versión Auditada:** 0.2.0
**Estado:** En restructuración activa

---

## 📊 PROGRESO DE IMPLEMENTACIÓN

> **Última actualización:** 2025-12-25

| Wave | Estado | Descripción | Fecha Completado |
|------|--------|-------------|------------------|
| **Wave 0** | ✅ COMPLETO | CSS Tokens, Types, Icons, i18n | 2025-12-24 |
| **Wave 1** | ✅ COMPLETO | Engine Override, Error Boundary, Hooks, ThemeProvider | 2025-12-25 |
| **Wave 2** | ✅ COMPLETO | Avatar Template, Rename composed→custom, Responsive hooks | 2025-12-25 |
| **Wave 3** | ✅ COMPLETO | All Primitives (17 components, 51 engines) | 2025-12-25 |
| **Wave 4** | ⏳ PENDIENTE | Tests, Storybook, Performance, Barrel exports | - |

### Wave 3 - Tareas Completadas:

| Agente | Tarea | Estado | Componentes |
|--------|-------|--------|-------------|
| L | Button | ✅ | Button, Button.Group, Button.Icon |
| M | Badge | ✅ | Badge (3 engines) |
| N | Card | ✅ | Card, Card.Header, Card.Body, Card.Footer, Card.Image |
| O | Input | ✅ | Input, Input.Group, Input.Addon |
| P | Select | ✅ | Select, Select.Option, Select.OptGroup |
| Q | Modal | ✅ | Modal, Modal.Header, Modal.Body, Modal.Footer + Portal, Overlay, FocusTrap |
| R | Toast | ✅ | Toast, Toast.Container + ToastProvider, useToast, animations |
| S | Toggle Group | ✅ | Checkbox, Checkbox.Group, Radio, Radio.Group, Toggle |
| T | Display | ✅ | Tooltip, Tag, Image, Image.Fallback, Image.Skeleton |
| U | Navigation | ✅ | Menu, Menu.Item, Menu.Group, Menu.SubMenu, Menu.Divider, Stepper, Stepper.Step, Stepper.Content |

**Resumen Wave 3:**
- ✅ 17 componentes primitivos creados siguiendo el template de Avatar
- ✅ 51 engine implementations (17 × 3: Titan, Hermes, Apollo)
- ✅ 21 compound components
- ✅ 6 utilities (Portal, Overlay, FocusTrap, ToastProvider, useToast, animations)
- ✅ Todos los componentes con 'use client', forwardRef, displayName
- ✅ CSS variables para theming consistente
- ✅ TypeScript strict mode - 0 errores
- ✅ Build exitoso en 11.24s

---

### Wave 2 - Tareas Completadas:

| Agente | Tarea | Estado | Archivos Clave |
|--------|-------|--------|----------------|
| I | Avatar Complete (Template) | ✅ | `primitives/display/Avatar/{base,engines,compound}/index.tsx` |
| J | Rename composed → custom | ✅ | `components/custom/`, `stories/custom/` |
| K | Responsive Hooks | ✅ | `system/hooks/responsive/{useMediaQuery,useBreakpoints,useResponsiveValue}/index.ts` |

**Resumen Wave 2:**
- ✅ Avatar completo como template (11 archivos, ~1000 líneas)
- ✅ 3 engines implementados: Titan (Ant Design), Hermes (DaisyUI), Apollo (Headless)
- ✅ Compound components: Avatar.Group, Avatar.Badge, Avatar.Fallback
- ✅ Carpeta "composed" renombrada a "custom" con imports actualizados
- ✅ useMediaQuery SSR-safe con soporte legacy browsers
- ✅ useBreakpoints con 7 flags (isMobile, isTablet, isDesktop, etc.)
- ✅ useResponsiveValue genérico para valores por breakpoint
- ✅ Documentación completa (~33KB de docs para responsive hooks)

---

### Wave 1 - Tareas Completadas:

| Agente | Tarea | Estado | Archivos Clave |
|--------|-------|--------|----------------|
| E | Engine Override Fix | ✅ | `system/engines/factory/index.tsx` |
| F | Error Boundary | ✅ | `system/engines/boundary/EngineErrorBoundary.tsx` |
| G | Hooks Reorganization | ✅ | `system/hooks/{engine,theme,features}/index.ts` |
| H | ThemeProvider + Rottay Fallback | ✅ | `system/providers/theme/index.tsx` |

**Resumen Wave 1:**
- ✅ Engine prop override (`<Button engine="hermes" />`) funcionando
- ✅ Error Boundary para lazy loading con fallback engine
- ✅ Hooks `useEngine`, `useTheme`, `useFeatures` con exports correctos
- ✅ ThemeProvider con carga dinámica CSS y fallback a Rottay
- ✅ Tokens de emergencia inline como último recurso

---

## TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Problemas Críticos Identificados](#2-problemas-críticos-identificados)
3. [Restructuración de Carpetas](#3-restructuración-de-carpetas)
4. [Opciones de Arquitectura para Primitivos](#4-opciones-de-arquitectura-para-primitivos)
5. [Sistema Responsive Mobile-First](#5-sistema-responsive-mobile-first)
6. [CSS Tokens Completo](#6-css-tokens-completo)
7. [Engines Detallados (Titan, Hermes, Apollo)](#7-engines-detallados)
8. [Hooks y Contexto](#8-hooks-y-contexto)
9. [Accessibility (A11y)](#9-accessibility-a11y)
10. [Animaciones y Transiciones](#10-animaciones-y-transiciones)
11. [Testing Utilities](#11-testing-utilities)
12. [Storybook Stories](#12-storybook-stories)
13. [Sistema de Theming y Fallback a Rottay](#13-sistema-de-theming-y-fallback-a-rottay)
14. [Especificaciones de Tareas para Agentes](#14-especificaciones-de-tareas-para-agentes)
15. [Checklist de Migración](#15-checklist-de-migración)
16. [Orden de Implementación](#16-orden-de-implementación)
17. [Iconografía y Assets](#17-iconografía-y-assets)
18. [Error Handling Patterns](#18-error-handling-patterns)
19. [Performance](#19-performance)
20. [Barrel Exports Completos](#20-barrel-exports-completos)
21. [Changelog y Versionado](#21-changelog-y-versionado)
22. [Internacionalización (i18n)](#22-internacionalización-i18n)
23. [Mapa de Dependencias y Paralelización](#23-mapa-de-dependencias-y-paralelización)

---

## 0. MAPA DE DEPENDENCIAS Y PARALELIZACIÓN

> **IMPORTANTE**: Esta sección define qué tareas pueden ejecutarse en paralelo y cuáles tienen dependencias bloqueantes. Los agentes deben consultar esta sección ANTES de comenzar cualquier trabajo.

### 0.1 Grafo de Dependencias

```
                           ┌─────────────────────────────────────────────────────────────────┐
                           │                        NIVEL 0 (SIN DEPENDENCIAS)               │
                           │                     Pueden ejecutarse en PARALELO               │
                           └─────────────────────────────────────────────────────────────────┘
                                                          │
        ┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
        │                  │                  │                  │                  │
        ▼                  ▼                  ▼                  ▼                  ▼
   ┌─────────┐       ┌─────────┐       ┌─────────┐       ┌─────────┐       ┌─────────┐
   │ TOKENS  │       │  TYPES  │       │  ICONS  │       │  i18n   │       │  DOCS   │
   │  (CSS)  │       │  (TS)   │       │  (SVG)  │       │ (JSON)  │       │ (Guías) │
   │         │       │         │       │         │       │         │       │         │
   │ Sec. 6  │       │ Sec. 4  │       │ Sec. 17 │       │ Sec. 22 │       │ Sec. 21 │
   └────┬────┘       └────┬────┘       └────┬────┘       └────┬────┘       └─────────┘
        │                  │                  │                  │
        │                  │                  │                  │
        └──────────────────┴─────────┬────────┴──────────────────┘
                                     │
                           ┌─────────▼─────────┐
                           │     NIVEL 1       │
                           │  INFRAESTRUCTURA  │
                           └─────────┬─────────┘
                                     │
        ┌──────────────────┬─────────┴─────────┬──────────────────┐
        │                  │                   │                  │
        ▼                  ▼                   ▼                  ▼
   ┌─────────┐       ┌─────────┐        ┌─────────┐       ┌─────────┐
   │ ENGINE  │       │  ERROR  │        │  HOOKS  │       │ THEME   │
   │OVERRIDE │       │BOUNDARY │        │ REORG   │       │PROVIDER │
   │         │       │         │        │         │       │         │
   │ Tarea 1 │       │ Tarea 2 │        │ Tarea 3 │       │ Sec. 13 │
   └────┬────┘       └────┬────┘        └────┬────┘       └────┬────┘
        │                  │                  │                  │
        └──────────────────┴─────────┬────────┴──────────────────┘
                                     │
                           ┌─────────▼─────────┐
                           │     NIVEL 2       │
                           │  RESTRUCTURACIÓN  │
                           └─────────┬─────────┘
                                     │
        ┌──────────────────┬─────────┴─────────┬──────────────────┐
        │                  │                   │                  │
        ▼                  ▼                   ▼                  ▼
   ┌─────────┐       ┌─────────┐        ┌─────────┐       ┌─────────┐
   │ RENAME  │       │ AVATAR  │        │ ENGINES │       │RESPONSIVE│
   │composed │       │PRIMITIVE│        │titan/   │       │ UTILS   │
   │→custom  │       │         │        │hermes/  │       │         │
   │ Tarea 5 │       │ Tarea 4 │        │apollo   │       │ Sec. 5  │
   └────┬────┘       └────┬────┘        └────┬────┘       └────┬────┘
        │                  │                  │                  │
        └──────────────────┴─────────┬────────┴──────────────────┘
                                     │
                           ┌─────────▼─────────┐
                           │     NIVEL 3       │
                           │   COMPONENTES     │
                           └─────────┬─────────┘
                                     │
   ┌────────────┬────────────┬───────┴───────┬────────────┬────────────┐
   │            │            │               │            │            │
   ▼            ▼            ▼               ▼            ▼            ▼
┌──────┐   ┌──────┐    ┌──────┐        ┌──────┐    ┌──────┐    ┌──────┐
│Button│   │Badge │    │ Card │        │Input │    │Select│    │Modal │
│      │   │      │    │      │        │      │    │      │    │      │
└──┬───┘   └──┬───┘    └──┬───┘        └──┬───┘    └──┬───┘    └──┬───┘
   │          │           │               │           │           │
   └──────────┴───────────┴───────┬───────┴───────────┴───────────┘
                                  │
                        ┌─────────▼─────────┐
                        │     NIVEL 4       │
                        │  TESTING & DOCS   │
                        └─────────┬─────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
   ┌─────────┐             ┌─────────┐              ┌─────────┐
   │  TESTS  │             │STORYBOOK│              │  PERF   │
   │         │             │         │              │METRICS  │
   │ Sec. 11 │             │ Sec. 12 │              │ Sec. 19 │
   └─────────┘             └─────────┘              └─────────┘
```

### 0.2 Grupos de Trabajo Paralelo

```
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                              WAVE 0 - FUNDACIÓN                                      ║
║                        (Sin dependencias - Ejecutar PRIMERO)                         ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                      ║
║  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ ║
║  │   AGENTE A      │  │   AGENTE B      │  │   AGENTE C      │  │   AGENTE D      │ ║
║  │   CSS TOKENS    │  │   TYPES/TS      │  │   ICONS         │  │   i18n          │ ║
║  │                 │  │                 │  │                 │  │                 │ ║
║  │ • colors.css    │  │ • AvatarProps   │  │ • BaseIcon      │  │ • locales/es    │ ║
║  │ • spacing.css   │  │ • ButtonProps   │  │ • UserIcon      │  │ • locales/en    │ ║
║  │ • typography    │  │ • InputProps    │  │ • CheckIcon     │  │ • I18nProvider  │ ║
║  │ • avatar.css    │  │ • ModalProps    │  │ • etc...        │  │ • formatters    │ ║
║  │ • button.css    │  │ • etc...        │  │                 │  │                 │ ║
║  │ • responsive/   │  │                 │  │                 │  │                 │ ║
║  │                 │  │                 │  │                 │  │                 │ ║
║  │ 📍 Sec. 6       │  │ 📍 Sec. 4.4     │  │ 📍 Sec. 17      │  │ 📍 Sec. 22      │ ║
║  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘ ║
║                                                                                      ║
║  BLOQUEA: Wave 1, Wave 2                                                            ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════════════════════════╗
║                              WAVE 1 - INFRAESTRUCTURA                                ║
║                          (Requiere: Wave 0 completado)                               ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                      ║
║  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ ║
║  │   AGENTE E      │  │   AGENTE F      │  │   AGENTE G      │  │   AGENTE H      │ ║
║  │  ENGINE FIX     │  │ ERROR BOUNDARY  │  │ HOOKS REORG     │  │ THEME PROVIDER  │ ║
║  │                 │  │                 │  │                 │  │                 │ ║
║  │ • Tarea 1       │  │ • Tarea 2       │  │ • Tarea 3       │  │ • ThemeProvider │ ║
║  │ • factory fix   │  │ • Boundary impl │  │ • useEngine     │  │ • Rottay theme  │ ║
║  │ • props→engine  │  │ • Fallback UI   │  │ • useTheme      │  │ • Fallback      │ ║
║  │                 │  │ • Error logging │  │ • useFeatures   │  │ • CSS injection │ ║
║  │                 │  │                 │  │                 │  │                 │ ║
║  │ 📍 Sec. 14.1    │  │ 📍 Sec. 14.2    │  │ 📍 Sec. 14.3    │  │ 📍 Sec. 13      │ ║
║  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘ ║
║                                                                                      ║
║  BLOQUEA: Wave 2                                                                     ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════════════════════════╗
║                              WAVE 2 - COMPONENTE TEMPLATE                            ║
║                          (Requiere: Wave 0 + Wave 1 completados)                     ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                      ║
║  ┌───────────────────────────────────────────────────────────────────────────────┐  ║
║  │                           AGENTE I - AVATAR COMPLETO                          │  ║
║  │                    (Este es el TEMPLATE para todos los demás)                 │  ║
║  │                                                                               │  ║
║  │   Crear estructura completa:                                                  │  ║
║  │   /primitives/display/Avatar/                                                 │  ║
║  │   ├── types/index.ts           ← Usar tipos de Wave 0                        │  ║
║  │   ├── base/index.tsx           ← Usar tokens de Wave 0                       │  ║
║  │   ├── compound/                                                               │  ║
║  │   │   ├── Group/index.tsx                                                     │  ║
║  │   │   ├── Badge/index.tsx                                                     │  ║
║  │   │   ├── Fallback/index.tsx                                                  │  ║
║  │   │   └── index.ts                                                            │  ║
║  │   ├── engines/                                                                │  ║
║  │   │   ├── titan/index.tsx                                                     │  ║
║  │   │   ├── hermes/index.tsx                                                    │  ║
║  │   │   ├── apollo/index.tsx                                                    │  ║
║  │   │   └── index.ts                                                            │  ║
║  │   └── index.ts                                                                │  ║
║  │                                                                               │  ║
║  │   📍 Tarea 4 + Sec. 4.4 + Sec. 7 + Sec. 8                                    │  ║
║  └───────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                      ║
║  EN PARALELO:                                                                        ║
║  ┌─────────────────┐  ┌─────────────────┐                                           ║
║  │   AGENTE J      │  │   AGENTE K      │                                           ║
║  │ RENAME composed │  │ RESPONSIVE HOOK │                                           ║
║  │                 │  │                 │                                           ║
║  │ • Tarea 5       │  │ • useMediaQuery │                                           ║
║  │ • Update imports│  │ • useBreakpoint │                                           ║
║  │                 │  │                 │                                           ║
║  │ 📍 Sec. 14.5    │  │ 📍 Sec. 5       │                                           ║
║  └─────────────────┘  └─────────────────┘                                           ║
║                                                                                      ║
║  BLOQUEA: Wave 3                                                                     ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════════════════════════╗
║                              WAVE 3 - COMPONENTES (PARALELO)                         ║
║                          (Requiere: Wave 2 - Avatar como template)                   ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                      ║
║  Todos estos pueden ejecutarse EN PARALELO siguiendo el patrón de Avatar:           ║
║                                                                                      ║
║  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐         ║
║  │ AGENTE L   │ │ AGENTE M   │ │ AGENTE N   │ │ AGENTE O   │ │ AGENTE P   │         ║
║  │ Button     │ │ Badge      │ │ Card       │ │ Input      │ │ Select     │         ║
║  │            │ │            │ │            │ │            │ │            │         ║
║  │ • base/    │ │ • base/    │ │ • base/    │ │ • base/    │ │ • base/    │         ║
║  │ • engines/ │ │ • engines/ │ │ • compound │ │ • engines/ │ │ • engines/ │         ║
║  │            │ │            │ │ • Header   │ │            │ │ • Options  │         ║
║  │            │ │            │ │ • Body     │ │            │ │ • dropdown │         ║
║  │            │ │            │ │ • Footer   │ │            │ │            │         ║
║  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘         ║
║                                                                                      ║
║  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐         ║
║  │ AGENTE Q   │ │ AGENTE R   │ │ AGENTE S   │ │ AGENTE T   │ │ AGENTE U   │         ║
║  │ Modal      │ │ Toast      │ │ Checkbox   │ │ Tooltip    │ │ Menu       │         ║
║  │            │ │            │ │ Radio      │ │ Tag        │ │ Stepper    │         ║
║  │ • Portal   │ │ • Stack    │ │ Toggle     │ │ Image      │ │            │         ║
║  │ • Overlay  │ │ • Anim     │ │            │ │            │ │            │         ║
║  │ • FocusTrap│ │            │ │            │ │            │ │            │         ║
║  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘         ║
║                                                                                      ║
║  BLOQUEA: Wave 4                                                                     ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════════════════════════╗
║                              WAVE 4 - TESTING & DOCS (PARALELO)                      ║
║                          (Requiere: Wave 3 - Componentes completados)                ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                      ║
║  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐          ║
║  │     AGENTE V        │  │     AGENTE W        │  │     AGENTE X        │          ║
║  │    UNIT TESTS       │  │    STORYBOOK        │  │   PERFORMANCE       │          ║
║  │                     │  │                     │  │                     │          ║
║  │ • Avatar.test.tsx   │  │ • Avatar.stories    │  │ • Bundle analysis   │          ║
║  │ • Button.test.tsx   │  │ • Button.stories    │  │ • Render metrics    │          ║
║  │ • Input.test.tsx    │  │ • Input.stories     │  │ • Lazy loading      │          ║
║  │ • a11y tests        │  │ • MDX docs          │  │ • Tree-shaking      │          ║
║  │                     │  │                     │  │                     │          ║
║  │ 📍 Sec. 11          │  │ 📍 Sec. 12          │  │ 📍 Sec. 19          │          ║
║  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘          ║
║                                                                                      ║
║  EN PARALELO (sin dependencias):                                                     ║
║  ┌─────────────────────┐  ┌─────────────────────┐                                   ║
║  │     AGENTE Y        │  │     AGENTE Z        │                                   ║
║  │   ERROR HANDLER     │  │   BARREL EXPORTS    │                                   ║
║  │                     │  │                     │                                   ║
║  │ • Error types       │  │ • primitives/index  │                                   ║
║  │ • ErrorHandler      │  │ • tokens/index.css  │                                   ║
║  │ • useErrorHandler   │  │ • icons/index.ts    │                                   ║
║  │ • Error codes       │  │ • i18n/index.ts     │                                   ║
║  │                     │  │                     │                                   ║
║  │ 📍 Sec. 18          │  │ 📍 Sec. 20          │                                   ║
║  └─────────────────────┘  └─────────────────────┘                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
```

### 0.3 Tabla de Dependencias Detallada

| ID | Tarea | Depende de | Bloquea a | Paralelo con |
|----|-------|------------|-----------|--------------|
| **WAVE 0** |
| W0-A | CSS Tokens | - | W1-*, W2-I | W0-B, W0-C, W0-D |
| W0-B | Types/Interfaces | - | W1-*, W2-I | W0-A, W0-C, W0-D |
| W0-C | Icons (SVG→React) | - | W2-I | W0-A, W0-B, W0-D |
| W0-D | i18n (traducciones) | - | W2-I | W0-A, W0-B, W0-C |
| **WAVE 1** |
| W1-E | Engine Override Fix | W0 | W2-I | W1-F, W1-G, W1-H |
| W1-F | Error Boundary | W0 | W2-I | W1-E, W1-G, W1-H |
| W1-G | Hooks Reorganization | W0 | W2-I | W1-E, W1-F, W1-H |
| W1-H | ThemeProvider | W0-A | W2-I | W1-E, W1-F, W1-G |
| **WAVE 2** |
| W2-I | Avatar (Template) | W0, W1 | W3-* | W2-J, W2-K |
| W2-J | Rename composed→custom | W1 | - | W2-I, W2-K |
| W2-K | Responsive Hooks | W0 | W3-* | W2-I, W2-J |
| **WAVE 3** |
| W3-L | Button | W2-I | W4-V, W4-W | W3-M...W3-U |
| W3-M | Badge | W2-I | W4-V, W4-W | W3-L, W3-N...W3-U |
| W3-N | Card | W2-I | W4-V, W4-W | W3-L...W3-U |
| W3-O | Input | W2-I | W4-V, W4-W | W3-L...W3-U |
| W3-P | Select | W2-I | W4-V, W4-W | W3-L...W3-U |
| W3-Q | Modal | W2-I | W4-V, W4-W | W3-L...W3-U |
| W3-R | Toast | W2-I | W4-V, W4-W | W3-L...W3-U |
| W3-S | Checkbox/Radio/Toggle | W2-I | W4-V, W4-W | W3-L...W3-U |
| W3-T | Tooltip/Tag/Image | W2-I | W4-V, W4-W | W3-L...W3-U |
| W3-U | Menu/Stepper | W2-I | W4-V, W4-W | W3-L...W3-U |
| **WAVE 4** |
| W4-V | Unit Tests | W3-* | - | W4-W, W4-X, W4-Y, W4-Z |
| W4-W | Storybook | W3-* | - | W4-V, W4-X, W4-Y, W4-Z |
| W4-X | Performance | W3-* | - | W4-V, W4-W, W4-Y, W4-Z |
| W4-Y | Error Handler | W0 | - | W4-V, W4-W, W4-X, W4-Z |
| W4-Z | Barrel Exports | W3-* | - | W4-V, W4-W, W4-X, W4-Y |

### 0.4 Tiempo Estimado de Ejecución Paralela

```
SECUENCIAL (1 agente):     ████████████████████████████████████████ ~17 unidades

PARALELO (4 agentes):      Wave 0: ████████ (4u)
                           Wave 1: ████████ (4u)
                           Wave 2: ████████ (4u)
                           Wave 3: ████████ (4u)  ← 10 componentes en paralelo
                           Wave 4: ████████ (4u)
                           ─────────────────────
                           Total:  20u / 4 = ~5 unidades de tiempo

PARALELO (10 agentes):     Wave 0: ████ (1u)
                           Wave 1: ████ (1u)
                           Wave 2: ████ (1u)
                           Wave 3: ████ (1u)  ← Todos los componentes simultáneos
                           Wave 4: ████ (1u)
                           ─────────────────────
                           Total:  ~5 unidades de tiempo (bloqueante: dependencias)
```

### 0.5 Reglas para Agentes

```markdown
## REGLAS DE EJECUCIÓN PARALELA

### ✅ PUEDE hacer un agente:
1. Trabajar en cualquier tarea de su Wave si las Waves anteriores están completas
2. Trabajar en paralelo con otros agentes de la misma Wave
3. Usar artifacts de Waves anteriores (tokens, types, icons, etc.)
4. Crear archivos en su carpeta asignada

### ❌ NO PUEDE hacer un agente:
1. Modificar archivos creados por otro agente activo
2. Empezar una tarea si sus dependencias no están completas
3. Saltar Waves (no puede empezar W3 si W2 no terminó)
4. Asumir que un tipo/token existe sin verificar que W0 lo creó

### 🔄 SINCRONIZACIÓN:
1. Al terminar una Wave, reportar completion status
2. Antes de empezar Wave N+1, verificar que Wave N está 100% completa
3. Si hay conflicto, la tarea con ID menor tiene prioridad
4. Los barrel exports (index.ts) se actualizan al final de cada Wave

### 📋 CHECKLIST POR AGENTE:
- [ ] Verificar Wave anterior completa
- [ ] Leer dependencias de mi tarea
- [ ] Crear estructura de carpetas
- [ ] Implementar código
- [ ] Agregar exports al barrel
- [ ] Marcar tarea como completa
```

### 0.6 Quick Reference: ¿Qué Puedo Hacer Ahora?

```
┌────────────────────────────────────────────────────────────────┐
│ SI NO HAY NADA HECHO, EMPIEZA CON:                             │
│                                                                │
│   → Wave 0 (cualquiera de las 4 tareas en paralelo)           │
│     • CSS Tokens (Sec. 6)                                      │
│     • Types/Interfaces (Sec. 4.4)                              │
│     • Icons (Sec. 17)                                          │
│     • i18n (Sec. 22)                                           │
├────────────────────────────────────────────────────────────────┤
│ SI WAVE 0 ESTÁ COMPLETA, PUEDES:                               │
│                                                                │
│   → Wave 1 (cualquiera de las 4 tareas en paralelo)           │
│     • Engine Override Fix (Tarea 1)                            │
│     • Error Boundary (Tarea 2)                                 │
│     • Hooks Reorg (Tarea 3)                                    │
│     • ThemeProvider (Sec. 13)                                  │
├────────────────────────────────────────────────────────────────┤
│ SI WAVE 0 + WAVE 1 ESTÁN COMPLETAS, PUEDES:                    │
│                                                                │
│   → Wave 2 - CRÍTICO: Avatar primero (es el template)         │
│     • Avatar completo (Tarea 4)                                │
│     • En paralelo: Rename composed (Tarea 5)                   │
│     • En paralelo: Responsive hooks (Sec. 5)                   │
├────────────────────────────────────────────────────────────────┤
│ SI WAVE 2 ESTÁ COMPLETA (Avatar listo), PUEDES:                │
│                                                                │
│   → Wave 3 - TODOS los componentes en paralelo                 │
│     • Button, Badge, Card, Input, Select...                    │
│     • Cada uno sigue el patrón de Avatar                       │
├────────────────────────────────────────────────────────────────┤
│ SI WAVE 3 ESTÁ COMPLETA, PUEDES:                               │
│                                                                │
│   → Wave 4 - Testing y documentación en paralelo               │
│     • Unit tests, Storybook, Performance, Barrel exports       │
└────────────────────────────────────────────────────────────────┘
```

---

## 1. RESUMEN EJECUTIVO

### Estado Actual por Área

| Área | Completitud | Prioridad de Fix |
|------|-------------|------------------|
| Core Types (DS-002) | 87% | 🔴 ALTA |
| Engine System (DS-003/004) | 80% | 🔴 ALTA |
| Providers (DS-005) | 94% | 🟢 BAJA |
| Hooks (DS-006) | 40% | 🔴 ALTA |
| Primitives (DS-007-012) | 35% | 🔴 ALTA |

### Hallazgo Principal

El sistema actual tiene una **desconexión entre los props del usuario y los valores finales**:

```typescript
// ❌ ACTUAL: Valores hardcodeados en SIZE_MAP
export const SIZE_MAP = {
  xs: 24,  // ← Número fijo, no viene del theme
  sm: 32,
  md: 40,
};

// ✅ ESPERADO: CSS Variables desde tenant theme
const avatarStyle = {
  '--avatar-size': `var(--avatar-${size}-size)`,  // ← Valor dinámico del theme
  '--avatar-bg': `var(--avatar-${variant}-bg)`,
};
```

---

## 2. PROBLEMAS CRÍTICOS IDENTIFICADOS

### 2.1 Engine Override via Props - NO FUNCIONA

**Ubicación:** `/packages/core/src/system/engines/factory/index.tsx`

**Problema:**
```typescript
// ❌ ACTUAL (línea 69-78)
const EngineRouter = (props: P) => {
  const { engine } = useEngineContext(); // Solo lee del contexto
  // ...
};

// Esto NO funciona:
<Button engine="hermes">Click</Button>  // ❌ El prop engine se ignora
```

**Solución Requerida:**
```typescript
// ✅ CORRECCIÓN
const EngineRouter = (props: P & { engine?: EngineName }) => {
  const context = useEngineContext();
  const engine = props.engine || context.engine;  // Override via prop
  // ...
};
```

**Archivos a modificar:**
- `/packages/core/src/system/engines/factory/index.tsx` (líneas 69-78)
- `/packages/core/src/types/components/index.ts` (agregar engine prop)

---

### 2.2 Error Boundary - VACÍO

**Ubicación:** `/packages/core/src/system/engines/boundary/index.ts`

**Estado Actual:**
```typescript
// El archivo solo contiene:
export {};
```

**Impacto:** Si un engine falla al cargar, no hay fallback. La app crashea.

**Implementación Requerida:**
- Crear `EngineErrorBoundary` component
- Integrar `fallbackEngine` option en `createEngineComponent`
- Logging de errores con callback `onError`

---

### 2.3 BaseComponentProps - FALTANTE

**Ubicación:** `/packages/core/src/types/components/index.ts`

**Problema:**
```typescript
// ❌ ACTUAL
export interface EngineAwareProps {
  className?: string;
  style?: CSSProperties;
  // FALTA: 'data-testid'?: string;
  // FALTA: engine?: EngineName;
}
```

**Solución:**
```typescript
// ✅ CORRECCIÓN
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export interface EngineAwareProps extends BaseComponentProps {
  engine?: EngineName;
}
```

---

### 2.4 Hooks en Ubicación Incorrecta

**Problema:** Los hooks están dispersos entre `/hooks/` y `/providers/`

| Hook | Ubicación Actual | Ubicación Correcta |
|------|-----------------|-------------------|
| `useEngineContext` | `/providers/engine/` | `/hooks/engine/` |
| `useThemeContext` | `/providers/theme/` | `/hooks/theme/` |
| `useFeatureContext` | `/providers/features/` | `/hooks/features/` |
| `useTenant` | `/hooks/tenant/` ✅ | ✅ Correcto |
| `useTokens` | `/hooks/tokens/` ✅ | ✅ Correcto |

**Archivos vacíos (placeholder):**
- `/hooks/engine/index.ts` → `export {}`
- `/hooks/theme/index.ts` → `export {}`
- `/hooks/features/index.ts` → `export {}`

---

### 2.5 Primitivos Sin CSS Variables

**Problema Principal:** Los valores de los primitivos están hardcodeados, no vienen del theme.

**Ejemplo - Avatar Actual:**
```typescript
// /primitives/display/avatar/core/index.ts
export const SIZE_MAP = {
  xs: 24,  // ← Hardcoded
  sm: 32,
  md: 40,
};

// /primitives/display/avatar/titan/index.tsx
<AntAvatar size={SIZE_MAP[size!]} />  // ← Usa valor fijo
```

**Ejemplo - Avatar Correcto (del design-system de referencia):**
```typescript
// BaseAvatar.tsx
const avatarStyle = {
  '--avatar-size': `var(--avatar-${size}-size)`,
  '--avatar-font-size': `var(--avatar-${size}-font-size)`,
  '--avatar-bg': `var(--avatar-${variant}-bg)`,
  '--avatar-color': `var(--avatar-${variant}-color)`,
  width: 'var(--avatar-size)',
  height: 'var(--avatar-size)',
};
```

**Consecuencia:** El tenant theme NO puede customizar los valores de los componentes.

---

## 3. RESTRUCTURACIÓN DE CARPETAS

### 3.1 Estructura Actual

```
/components/
├── composed/          ← Renombrar a "custom"
├── primitives/
│   └── display/
│       └── avatar/
│           ├── core/
│           │   └── index.ts
│           ├── titan/
│           │   └── index.tsx
│           ├── hermes/
│           │   └── index.tsx
│           ├── apollo/
│           │   └── index.tsx
│           └── index.ts
```

### 3.2 Estructura Propuesta

```
/components/
├── custom/                        ← RENOMBRADO de "composed"
│   ├── factory/
│   │   └── index.ts
│   └── [Component]/
│       └── index.tsx
│
├── primitives/
│   └── display/
│       └── Avatar/
│           ├── types/
│           │   └── index.ts       ← Tipos e interfaces
│           ├── base/
│           │   └── index.tsx      ← Core + CSS Variables
│           ├── compound/
│           │   ├── Group/
│           │   │   └── index.tsx  ← Avatar.Group
│           │   ├── Badge/
│           │   │   └── index.tsx  ← Avatar.Badge
│           │   ├── Fallback/
│           │   │   └── index.tsx  ← Avatar.Fallback
│           │   └── index.ts       ← Barrel export
│           ├── engines/
│           │   ├── titan/
│           │   │   └── index.tsx  ← Adapter Ant Design
│           │   ├── hermes/
│           │   │   └── index.tsx  ← Adapter DaisyUI
│           │   ├── apollo/
│           │   │   └── index.tsx  ← Adapter Vanilla
│           │   └── index.ts       ← Barrel export
│           └── index.ts           ← Barrel principal
```

### 3.3 Cambios de Nomenclatura

| Actual | Nuevo |
|--------|-------|
| `/composed/` | `/custom/` |
| `/avatar/core/index.ts` | `/Avatar/base/index.tsx` |
| `/avatar/titan/index.tsx` | `/Avatar/engines/titan/index.tsx` |
| `/avatar/hermes/index.tsx` | `/Avatar/engines/hermes/index.tsx` |
| `/avatar/apollo/index.tsx` | `/Avatar/engines/apollo/index.tsx` |
| (nuevo) | `/Avatar/types/index.ts` |
| (nuevo) | `/Avatar/compound/index.ts` |

---

## 4. OPCIONES DE ARQUITECTURA PARA PRIMITIVOS

### Comparativa de Patrones

| Aspecto | OPCIÓN A: CSS Variables | OPCIÓN B: Multi-Engine | OPCIÓN C: Híbrido |
|---------|------------------------|----------------------|------------------|
| Theming | ✅ Tenant theme | ⚠️ Hardcoded | ✅ Tenant theme |
| Engines | ❌ Solo 1 (antd) | ✅ 3 engines | ✅ 3 engines |
| Complejidad | Baja | Alta | Media |
| Bundle Size | Pequeño | Grande | Medio |
| Flexibilidad | Media | Alta | Alta |

---

### OPCIÓN A: CSS Variables (Patrón del design-system de referencia)

**Concepto:** Un solo componente que usa CSS Variables para theming. Sin multi-engine.

**Estructura:**
```
/Avatar/
├── BaseAvatar.tsx      ← Único componente, recibe props simples
├── AvatarGroup.tsx
└── index.ts
```

**Implementación:**
```typescript
// BaseAvatar.tsx
export interface BaseAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square' | 'rounded';
  variant?: 'default' | 'primary' | 'secondary';
  status?: 'online' | 'offline' | 'busy';
  src?: string;
  alt?: string;
}

export const BaseAvatar = ({ size = 'md', variant = 'default', ...props }) => {
  // ALL styling through CSS variables from tenant theme
  const avatarStyle = {
    '--avatar-size': `var(--avatar-${size}-size)`,
    '--avatar-font-size': `var(--avatar-${size}-font-size)`,
    '--avatar-radius': `var(--avatar-${shape}-radius)`,
    '--avatar-bg': `var(--avatar-${variant}-bg)`,
    '--avatar-color': `var(--avatar-${variant}-color)`,
    '--avatar-border': `var(--avatar-${variant}-border)`,
    '--avatar-shadow': `var(--avatar-${variant}-shadow)`,
    width: 'var(--avatar-size)',
    height: 'var(--avatar-size)',
    // ... más estilos usando variables
  } as React.CSSProperties;

  return (
    <AntAvatar
      style={avatarStyle}
      className={`primitive-avatar primitive-avatar--${variant}`}
      {...props}
    />
  );
};
```

**CSS Variables en Tenant Theme:**
```css
/* /themes/tenants/rottay/theme.css */
:root {
  --avatar-xs-size: 24px;
  --avatar-sm-size: 32px;
  --avatar-md-size: 40px;
  --avatar-lg-size: 48px;
  --avatar-xl-size: 64px;

  --avatar-default-bg: var(--color-gray-200);
  --avatar-primary-bg: var(--color-primary-100);
  --avatar-secondary-bg: var(--color-secondary-100);

  --avatar-circle-radius: 50%;
  --avatar-square-radius: 0;
  --avatar-rounded-radius: 8px;
}
```

**Ventajas:**
- ✅ Theming completo desde CSS
- ✅ Bundle pequeño (1 implementación)
- ✅ Fácil de mantener
- ✅ Tenant puede customizar todo

**Desventajas:**
- ❌ No hay multi-engine (solo Ant Design)
- ❌ Pierde la capacidad de cambiar entre engines

---

### OPCIÓN B: Multi-Engine Mejorado (Mantener 3 engines, agregar CSS Variables)

**Concepto:** Mantener el patrón multi-engine pero usar CSS Variables en cada implementación.

**Estructura:**
```
/Avatar/
├── BaseAvatar.tsx      ← Interface compartida + CSS variables mapping
├── AvatarGroup.tsx
├── index.ts            ← Router con createEngineComponent
└── engines/
    ├── titan.tsx       ← Usa BaseAvatar + antd
    ├── hermes.tsx      ← Usa BaseAvatar + daisyui
    └── apollo.tsx      ← Usa BaseAvatar + pure html
```

**Implementación:**

```typescript
// BaseAvatar.tsx - Props del usuario + CSS Variables
export interface BaseAvatarProps extends EngineAwareProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square' | 'rounded';
  variant?: 'default' | 'primary' | 'secondary';
  status?: 'online' | 'offline' | 'busy';
  src?: string;
  alt?: string;
  children?: ReactNode;
}

// Shared CSS variable mapping - lo que usa el tenant theme
export function getAvatarStyles(props: BaseAvatarProps): React.CSSProperties {
  const { size = 'md', variant = 'default', shape = 'circle' } = props;

  return {
    '--avatar-size': `var(--avatar-${size}-size)`,
    '--avatar-font-size': `var(--avatar-${size}-font-size)`,
    '--avatar-radius': shape === 'circle' ? '50%' : `var(--avatar-${shape}-radius)`,
    '--avatar-bg': `var(--avatar-${variant}-bg)`,
    '--avatar-color': `var(--avatar-${variant}-color)`,
  } as React.CSSProperties;
}

export function getAvatarClasses(props: BaseAvatarProps): string {
  const { size = 'md', variant = 'default', shape = 'circle' } = props;
  return classNames(
    'primitive-avatar',
    `primitive-avatar--${size}`,
    `primitive-avatar--${variant}`,
    `primitive-avatar--${shape}`
  );
}
```

```typescript
// engines/titan.tsx
import { Avatar as AntAvatar } from 'antd';
import { getAvatarStyles, getAvatarClasses, type BaseAvatarProps } from '../BaseAvatar';

export default function TitanAvatar(props: BaseAvatarProps) {
  const { src, alt, children, className, style, ...rest } = props;

  const cssVarStyles = getAvatarStyles(props);
  const cssClasses = getAvatarClasses(props);

  return (
    <AntAvatar
      src={src}
      alt={alt}
      className={classNames(cssClasses, className)}
      style={{ ...cssVarStyles, ...style }}
    >
      {children}
    </AntAvatar>
  );
}
```

```typescript
// engines/hermes.tsx (DaisyUI)
import { getAvatarStyles, getAvatarClasses, type BaseAvatarProps } from '../BaseAvatar';

export default function HermesAvatar(props: BaseAvatarProps) {
  const { src, alt, children, className, style } = props;

  const cssVarStyles = getAvatarStyles(props);
  const cssClasses = getAvatarClasses(props);

  return (
    <div
      className={classNames('avatar', cssClasses, className)}
      style={{ ...cssVarStyles, ...style }}
    >
      <div className="rounded-full">
        {src ? <img src={src} alt={alt} /> : children}
      </div>
    </div>
  );
}
```

```typescript
// engines/apollo.tsx (Pure HTML)
import { getAvatarStyles, getAvatarClasses, type BaseAvatarProps } from '../BaseAvatar';

export default function ApolloAvatar(props: BaseAvatarProps) {
  const { src, alt, children, className, style } = props;

  const cssVarStyles = getAvatarStyles(props);
  const cssClasses = getAvatarClasses(props);

  return (
    <span
      className={classNames(cssClasses, className)}
      style={{
        ...cssVarStyles,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'var(--avatar-size)',
        height: 'var(--avatar-size)',
        borderRadius: 'var(--avatar-radius)',
        background: 'var(--avatar-bg)',
        color: 'var(--avatar-color)',
        fontSize: 'var(--avatar-font-size)',
        ...style,
      }}
    >
      {src ? <img src={src} alt={alt} style={{ width: '100%', height: '100%' }} /> : children}
    </span>
  );
}
```

**Ventajas:**
- ✅ Multi-engine funcionando
- ✅ CSS Variables para theming
- ✅ Tenant puede customizar valores
- ✅ BaseAvatar centraliza la lógica

**Desventajas:**
- ⚠️ Más archivos por componente
- ⚠️ Bundle más grande

---

### OPCIÓN C: Híbrido Optimizado (Recomendada)

**Concepto:** BaseComponent usa CSS Variables. Los engines solo adaptan a la librería específica sin duplicar lógica.

**Principios de Estructura:**
1. ✅ Todo archivo termina en `index.ts` o `index.tsx`
2. ✅ La carpeta indica dónde estás (base/, compound/, engines/, types/)
3. ✅ Barrel exports en cada nivel
4. ✅ Separación clara: types, base, compound, engines
5. ✅ `compound/` para subcomponentes (patrón compound component explícito)

**Estructura Optimizada de un Componente:**
```
/primitives/
└── display/
    └── Avatar/                     ← Carpeta del componente (PascalCase)
        │
        ├── types/                  ← Tipos TypeScript (reutilizables)
        │   └── index.ts            ← AvatarProps, AvatarSize, AvatarVariant, etc.
        │
        ├── base/                   ← Componente principal
        │   └── index.tsx           ← BaseAvatar con CSS Variables
        │
        ├── compound/               ← Subcomponentes (patrón compound)
        │   ├── Group/              ← Avatar.Group
        │   │   └── index.tsx
        │   ├── Badge/              ← Avatar.Badge
        │   │   └── index.tsx
        │   ├── Fallback/           ← Avatar.Fallback
        │   │   └── index.tsx
        │   └── index.ts            ← Barrel: export { Group, Badge, Fallback }
        │
        ├── engines/                ← Adapters por engine (opcional)
        │   ├── titan/
        │   │   └── index.tsx       ← Adapter para Ant Design
        │   ├── hermes/
        │   │   └── index.tsx       ← Adapter para DaisyUI
        │   ├── apollo/
        │   │   └── index.tsx       ← Adapter para Vanilla HTML
        │   └── index.ts            ← Barrel: export { titan, hermes, apollo }
        │
        └── index.ts                ← Barrel export principal + compound pattern
```

**¿Por qué `compound/` y no carpetas sueltas?**
- ✅ Escala bien (puedes agregar N subcomponentes)
- ✅ La carpeta `compound/` comunica claramente "estos son partes del componente"
- ✅ El barrel export en `compound/index.ts` hace imports limpios
- ✅ Sigue el patrón compound component de React (Avatar.Group, Avatar.Badge)

**Ejemplo de Árbol Completo (Múltiples Componentes):**
```
/primitives/
├── display/
│   ├── Avatar/
│   │   ├── types/
│   │   │   └── index.ts           ← AvatarProps, AvatarGroupProps, AvatarBadgeProps
│   │   ├── base/
│   │   │   └── index.tsx          ← BaseAvatar
│   │   ├── compound/
│   │   │   ├── Group/
│   │   │   │   └── index.tsx      ← Avatar.Group
│   │   │   ├── Badge/
│   │   │   │   └── index.tsx      ← Avatar.Badge
│   │   │   ├── Fallback/
│   │   │   │   └── index.tsx      ← Avatar.Fallback
│   │   │   └── index.ts           ← Barrel de compound/
│   │   ├── engines/
│   │   │   ├── titan/
│   │   │   │   └── index.tsx
│   │   │   ├── hermes/
│   │   │   │   └── index.tsx
│   │   │   ├── apollo/
│   │   │   │   └── index.tsx
│   │   │   └── index.ts           ← Barrel de engines/
│   │   └── index.ts               ← Barrel principal + compound pattern
│   │
│   ├── Badge/
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── base/
│   │   │   └── index.tsx
│   │   ├── engines/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── Tooltip/
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── base/
│   │   │   └── index.tsx
│   │   ├── compound/
│   │   │   ├── Trigger/
│   │   │   │   └── index.tsx      ← Tooltip.Trigger
│   │   │   ├── Content/
│   │   │   │   └── index.tsx      ← Tooltip.Content
│   │   │   └── index.ts
│   │   ├── engines/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── index.ts                    ← Barrel de display/
│
├── inputs/
│   ├── Button/
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── base/
│   │   │   └── index.tsx
│   │   ├── compound/
│   │   │   ├── Group/
│   │   │   │   └── index.tsx      ← Button.Group
│   │   │   ├── Icon/
│   │   │   │   └── index.tsx      ← Button.Icon (IconButton)
│   │   │   └── index.ts
│   │   ├── engines/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── Select/
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── base/
│   │   │   └── index.tsx
│   │   ├── compound/
│   │   │   ├── Option/
│   │   │   │   └── index.tsx      ← Select.Option
│   │   │   ├── OptGroup/
│   │   │   │   └── index.tsx      ← Select.OptGroup
│   │   │   └── index.ts
│   │   ├── engines/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── index.ts                    ← Barrel de inputs/
│
├── layout/
│   ├── Card/
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── base/
│   │   │   └── index.tsx
│   │   ├── compound/
│   │   │   ├── Header/
│   │   │   │   └── index.tsx      ← Card.Header
│   │   │   ├── Body/
│   │   │   │   └── index.tsx      ← Card.Body
│   │   │   ├── Footer/
│   │   │   │   └── index.tsx      ← Card.Footer
│   │   │   └── index.ts
│   │   ├── engines/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── index.ts                    ← Barrel de layout/
│
└── index.ts                        ← Barrel de primitives/
```

**Implementación Detallada por Archivo:**

---

#### 📁 `types/index.ts` - Tipos TypeScript

**Propósito:** Definir todos los tipos del componente. Reutilizables por base, compound y engines.

```typescript
// /primitives/display/Avatar/types/index.ts

/**
 * Tamaños disponibles para Avatar.
 * Cada tamaño mapea a una CSS Variable: --avatar-{size}-size
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

/**
 * Variantes de color para Avatar.
 * Cada variante mapea a CSS Variables: --avatar-{variant}-bg, --avatar-{variant}-color
 */
export type AvatarVariant = 'default' | 'primary' | 'secondary' | 'gradient';

/**
 * Formas del Avatar.
 */
export type AvatarShape = 'circle' | 'square' | 'rounded';

/**
 * Estados de presencia del usuario.
 * Mapea a CSS Variable: --avatar-status-{status}-color
 */
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

/**
 * Props base del componente Avatar.
 * Estas son las props que el usuario final ve en la app Next.js.
 */
export interface AvatarProps {
  /** Tamaño del avatar. Mapea a CSS Variable --avatar-{size}-size */
  size?: AvatarSize;
  /** Forma del avatar */
  shape?: AvatarShape;
  /** Variante de color. Mapea a CSS Variables del tema */
  variant?: AvatarVariant;
  /** Estado de presencia */
  status?: AvatarStatus;
  /** Mostrar borde */
  bordered?: boolean;
  /** URL de la imagen del avatar */
  src?: string;
  /** Texto alternativo para accesibilidad */
  alt?: string;
  /** Nombre del usuario (usado para generar iniciales como fallback) */
  name?: string;
  /** Contenido fallback (iniciales, icono) */
  children?: React.ReactNode;
  /**
   * Estado de carga. Muestra skeleton/placeholder mientras carga.
   * - true: Muestra skeleton animado
   * - false: Renderiza contenido normal
   * - 'eager': Carga imagen inmediatamente (priority)
   * - 'lazy': Carga imagen cuando entra en viewport
   */
  loading?: boolean | 'eager' | 'lazy';
  /** Callback al hacer click */
  onClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;
  /** Callback en caso de error al cargar imagen */
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Callback cuando la imagen carga exitosamente */
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Clase CSS adicional */
  className?: string;
  /** Estilos inline adicionales */
  style?: React.CSSProperties;
  /** Test ID para automated testing */
  'data-testid'?: string;
}

/**
 * Props para Avatar.Group (compound component)
 */
export interface AvatarGroupProps {
  /** Avatares hijos */
  children: React.ReactNode;
  /** Máximo de avatares visibles antes de mostrar "+N" */
  max?: number;
  /** Tamaño aplicado a todos los avatares del grupo */
  size?: AvatarSize;
  /** Espaciado entre avatares (negativo para overlap) */
  spacing?: 'compact' | 'normal' | 'loose';
  /**
   * Función para renderizar el indicador de overflow ("+N").
   * Permite customización completa del surplus indicator.
   * @param surplusCount - Número de avatares ocultos
   * @returns ReactNode para renderizar
   * @example
   * renderSurplus={(count) => (
   *   <Avatar variant="primary">
   *     <span>+{count} más</span>
   *   </Avatar>
   * )}
   */
  renderSurplus?: (surplusCount: number) => React.ReactNode;
  /** Clase CSS adicional */
  className?: string;
  /** Estilos inline adicionales */
  style?: React.CSSProperties;
}

/**
 * Props para Avatar.Badge (compound component)
 */
export interface AvatarBadgeProps {
  /** Contenido del badge (número, icono, etc.) */
  children?: React.ReactNode;
  /** Posición del badge */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Variante de color del badge */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Props para Avatar.Fallback (compound component)
 */
export interface AvatarFallbackProps {
  /** Contenido del fallback (iniciales, icono, etc.) */
  children?: React.ReactNode;
  /** Tiempo de delay antes de mostrar el fallback (ms) */
  delayMs?: number;
  /** Clase CSS adicional */
  className?: string;
}
```

---

#### 📁 `base/index.tsx` - Componente Principal

**Propósito:** Componente principal. Traduce props simples a CSS Variables.

```typescript
// /primitives/display/Avatar/base/index.tsx
'use client';

import { Avatar as AntAvatar } from 'antd';
import * as React from 'react';
import { forwardRef, useState, useCallback, useMemo } from 'react';
import type { AvatarProps } from '../types';

/**
 * BaseAvatar - Componente Avatar con CSS Variables para theming multi-tenant.
 *
 * IMPORTANTE: Este componente NO define valores hardcodeados.
 * Todos los valores visuales vienen de CSS Variables definidas en el tema del tenant.
 *
 * Mapeo de props a CSS Variables:
 * - size="lg"         → var(--avatar-lg-size)
 * - variant="primary" → var(--avatar-primary-bg), var(--avatar-primary-color)
 * - shape="circle"    → var(--avatar-circle-radius)
 * - status="online"   → var(--avatar-status-online-color)
 *
 * @example
 * ```tsx
 * <Avatar
 *   src="/user.jpg"
 *   size="lg"
 *   variant="primary"
 *   status="online"
 * />
 * ```
 */
export const BaseAvatar = forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      size = 'md',
      shape = 'circle',
      variant = 'default',
      status,
      bordered = false,
      src,
      alt,
      name,
      children,
      onClick,
      onError,
      className = '',
      style,
      'data-testid': testId,
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);

    // Generar iniciales desde el nombre
    const initials = useMemo(() => {
      if (!name) return null;
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
      }
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }, [name]);

    // Handler de error de imagen
    const handleImageError = useCallback(
      (event: React.SyntheticEvent<HTMLImageElement>) => {
        setImageError(true);
        onError?.(event);
      },
      [onError]
    );

    // CSS class names para styling hooks
    const avatarClasses = [
      'primitive-avatar',
      `primitive-avatar--${size}`,
      `primitive-avatar--${shape}`,
      `primitive-avatar--${variant}`,
      status && `primitive-avatar--status-${status}`,
      bordered && 'primitive-avatar--bordered',
      onClick && 'primitive-avatar--clickable',
      className,
    ].filter(Boolean).join(' ');

    // CSS Variables dinámicas basadas en props
    // User pasa "size='lg'" → mapeamos a CSS variable → tenant theme define el valor
    const cssVariables = useMemo(
      () =>
        ({
          // Tamaño: mapea size="lg" → var(--avatar-lg-size)
          '--avatar-size': `var(--avatar-${size}-size)`,
          '--avatar-font-size': `var(--avatar-${size}-font-size)`,

          // Forma
          '--avatar-radius':
            shape === 'circle'
              ? '50%'
              : shape === 'square'
                ? '0'
                : `var(--avatar-rounded-radius)`,

          // Colores: mapea variant="primary" → var(--avatar-primary-bg)
          '--avatar-bg': `var(--avatar-${variant}-bg)`,
          '--avatar-color': `var(--avatar-${variant}-color)`,
          '--avatar-border-color': `var(--avatar-${variant}-border-color)`,
          '--avatar-shadow': `var(--avatar-${variant}-shadow)`,

          // Borde
          '--avatar-border-width': bordered ? 'var(--avatar-border-width)' : '0',

          // Status
          '--avatar-status-size': 'var(--avatar-status-size)',
          '--avatar-status-color': status
            ? `var(--avatar-status-${status}-color)`
            : 'transparent',
          '--avatar-status-border': 'var(--avatar-status-border-color)',
        }) as React.CSSProperties,
      [size, shape, variant, bordered, status]
    );

    // Estilos aplicados
    const avatarStyle: React.CSSProperties = {
      ...cssVariables,
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 'var(--avatar-size)',
      height: 'var(--avatar-size)',
      fontSize: 'var(--avatar-font-size)',
      borderRadius: 'var(--avatar-radius)',
      background: 'var(--avatar-bg)',
      color: 'var(--avatar-color)',
      border: 'var(--avatar-border-width) solid var(--avatar-border-color)',
      boxShadow: 'var(--avatar-shadow)',
      cursor: onClick ? 'pointer' : undefined,
      overflow: 'hidden',
      ...style,
    };

    // Status indicator dot
    const statusDotStyle: React.CSSProperties | undefined = status
      ? {
          position: 'absolute',
          bottom: '0',
          right: '0',
          width: 'var(--avatar-status-size)',
          height: 'var(--avatar-status-size)',
          borderRadius: '50%',
          backgroundColor: 'var(--avatar-status-color)',
          border: '2px solid var(--avatar-status-border)',
          zIndex: 1,
        }
      : undefined;

    // Determinar qué renderizar
    const showImage = src && !imageError;
    const showInitials = !showImage && initials;
    const showChildren = !showImage && !showInitials && children;

    return (
      <span
        ref={ref}
        className={avatarClasses}
        style={avatarStyle}
        onClick={onClick}
        data-testid={testId}
        data-size={size}
        data-variant={variant}
        data-shape={shape}
        data-status={status}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {showImage && (
          <AntAvatar
            src={src}
            alt={alt || name}
            onError={handleImageError}
            style={{
              backgroundColor: 'transparent',
              color: 'inherit',
              fontSize: 'inherit',
              lineHeight: 1,
              width: '100%',
              height: '100%',
            }}
          />
        )}
        {showInitials && <span className="primitive-avatar__initials">{initials}</span>}
        {showChildren && children}
        {status && <span className="primitive-avatar__status" style={statusDotStyle} />}
      </span>
    );
  }
);

BaseAvatar.displayName = 'Avatar';

export default BaseAvatar;
```

---

#### 📁 `compound/Group/index.tsx` - Avatar.Group

**Propósito:** Subcomponente para mostrar múltiples avatares apilados.

```typescript
// /primitives/display/Avatar/compound/Group/index.tsx
'use client';

import React, { Children, cloneElement, isValidElement, useMemo } from 'react';
import type { AvatarGroupProps, AvatarSize } from '../../types';

/**
 * Avatar.Group - Agrupa múltiples avatares con overlap.
 *
 * Mapeo de props a CSS Variables:
 * - spacing="compact" → var(--avatar-group-compact-spacing)
 * - spacing="normal"  → var(--avatar-group-normal-spacing)
 * - spacing="loose"   → var(--avatar-group-loose-spacing)
 *
 * @example
 * ```tsx
 * <Avatar.Group max={3} size="md" spacing="compact">
 *   <Avatar src="/user1.jpg" name="Alice" />
 *   <Avatar src="/user2.jpg" name="Bob" />
 *   <Avatar src="/user3.jpg" name="Charlie" />
 *   <Avatar src="/user4.jpg" name="Diana" />
 * </Avatar.Group>
 * // Muestra: [Alice] [Bob] [Charlie] [+1]
 * ```
 */
export const Group: React.FC<AvatarGroupProps> = ({
  children,
  max,
  size,
  spacing = 'normal',
  className = '',
  style,
}) => {
  const childArray = Children.toArray(children).filter(isValidElement);

  const { visibleChildren, overflowCount } = useMemo(() => {
    if (!max || childArray.length <= max) {
      return { visibleChildren: childArray, overflowCount: 0 };
    }
    return {
      visibleChildren: childArray.slice(0, max),
      overflowCount: childArray.length - max,
    };
  }, [childArray, max]);

  // CSS Variables para el grupo
  const cssVariables = useMemo(
    () =>
      ({
        '--avatar-group-spacing': `var(--avatar-group-${spacing}-spacing)`,
        '--avatar-group-size': size ? `var(--avatar-${size}-size)` : undefined,
      }) as React.CSSProperties,
    [spacing, size]
  );

  const groupStyle: React.CSSProperties = {
    ...cssVariables,
    display: 'inline-flex',
    alignItems: 'center',
    ...style,
  };

  const childStyle: React.CSSProperties = {
    marginLeft: 'var(--avatar-group-spacing)',
    border: '2px solid var(--color-background, white)',
    borderRadius: '50%',
  };

  return (
    <div
      className={`primitive-avatar-group ${className}`}
      style={groupStyle}
      role="group"
      aria-label={`Group of ${childArray.length} avatars`}
    >
      {visibleChildren.map((child, index) => {
        if (!isValidElement(child)) return null;

        return cloneElement(child as React.ReactElement<{ size?: AvatarSize; style?: React.CSSProperties }>, {
          key: index,
          size: size || (child.props as { size?: AvatarSize }).size,
          style: {
            ...(child.props as { style?: React.CSSProperties }).style,
            ...(index > 0 ? childStyle : {}),
          },
        });
      })}

      {overflowCount > 0 && (
        <span
          className="primitive-avatar-group__overflow"
          style={{
            ...childStyle,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 'var(--avatar-group-size, var(--avatar-md-size))',
            height: 'var(--avatar-group-size, var(--avatar-md-size))',
            fontSize: 'var(--avatar-md-font-size)',
            backgroundColor: 'var(--avatar-default-bg)',
            color: 'var(--avatar-default-color)',
          }}
          aria-label={`${overflowCount} more avatars`}
        >
          +{overflowCount}
        </span>
      )}
    </div>
  );
};

Group.displayName = 'Avatar.Group';

export default Group;
```

---

#### 📁 `compound/Badge/index.tsx` - Avatar.Badge

**Propósito:** Badge/indicador sobre el avatar.

```typescript
// /primitives/display/Avatar/compound/Badge/index.tsx
'use client';

import React, { useMemo } from 'react';
import type { AvatarBadgeProps } from '../../types';

/**
 * Avatar.Badge - Badge posicionado sobre el avatar.
 *
 * @example
 * ```tsx
 * <Avatar src="/user.jpg">
 *   <Avatar.Badge position="top-right" variant="error">
 *     3
 *   </Avatar.Badge>
 * </Avatar>
 * ```
 */
export const Badge: React.FC<AvatarBadgeProps> = ({
  children,
  position = 'top-right',
  variant = 'primary',
  className = '',
}) => {
  const positionStyles = useMemo(() => {
    const positions: Record<string, React.CSSProperties> = {
      'top-right': { top: 0, right: 0, transform: 'translate(25%, -25%)' },
      'top-left': { top: 0, left: 0, transform: 'translate(-25%, -25%)' },
      'bottom-right': { bottom: 0, right: 0, transform: 'translate(25%, 25%)' },
      'bottom-left': { bottom: 0, left: 0, transform: 'translate(-25%, 25%)' },
    };
    return positions[position] || positions['top-right'];
  }, [position]);

  const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 'var(--avatar-badge-size, 18px)',
    height: 'var(--avatar-badge-size, 18px)',
    padding: '0 4px',
    fontSize: 'var(--avatar-badge-font-size, 10px)',
    fontWeight: 600,
    borderRadius: 'var(--avatar-badge-radius, 9999px)',
    backgroundColor: `var(--avatar-badge-${variant}-bg, var(--color-${variant}-500))`,
    color: `var(--avatar-badge-${variant}-color, white)`,
    border: '2px solid var(--color-background, white)',
    zIndex: 2,
    ...positionStyles,
  };

  return (
    <span
      className={`primitive-avatar-badge primitive-avatar-badge--${variant} ${className}`}
      style={badgeStyle}
    >
      {children}
    </span>
  );
};

Badge.displayName = 'Avatar.Badge';

export default Badge;
```

---

#### 📁 `compound/Fallback/index.tsx` - Avatar.Fallback

**Propósito:** Contenido fallback cuando no hay imagen.

```typescript
// /primitives/display/Avatar/compound/Fallback/index.tsx
'use client';

import React, { useState, useEffect } from 'react';
import type { AvatarFallbackProps } from '../../types';

/**
 * Avatar.Fallback - Contenido mostrado cuando la imagen no está disponible.
 *
 * @example
 * ```tsx
 * <Avatar src="/user.jpg">
 *   <Avatar.Fallback delayMs={600}>
 *     JD
 *   </Avatar.Fallback>
 * </Avatar>
 * ```
 */
export const Fallback: React.FC<AvatarFallbackProps> = ({
  children,
  delayMs = 0,
  className = '',
}) => {
  const [canRender, setCanRender] = useState(delayMs === 0);

  useEffect(() => {
    if (delayMs > 0) {
      const timer = setTimeout(() => setCanRender(true), delayMs);
      return () => clearTimeout(timer);
    }
  }, [delayMs]);

  if (!canRender) return null;

  return (
    <span
      className={`primitive-avatar-fallback ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
};

Fallback.displayName = 'Avatar.Fallback';

export default Fallback;
```

---

#### 📁 `compound/index.ts` - Barrel Export de Compound

**Propósito:** Barrel export de todos los subcomponentes.

```typescript
// /primitives/display/Avatar/compound/index.ts

export { Group } from './Group';
export { Badge } from './Badge';
export { Fallback } from './Fallback';

// Re-export types si es necesario
export type {
  AvatarGroupProps,
  AvatarBadgeProps,
  AvatarFallbackProps,
} from '../types';
```

---

#### 📁 `engines/titan/index.tsx` - Adapter Ant Design

**Propósito:** Adapter que usa Ant Design internamente pero respeta CSS Variables.

```typescript
// /primitives/display/Avatar/engines/titan/index.tsx
'use client';

import React, { forwardRef, useMemo } from 'react';
import { Avatar as AntAvatar } from 'antd';
import type { AvatarProps } from '../../types';

/**
 * Titan Engine - Adapter de Avatar para Ant Design.
 *
 * IMPORTANTE: Este adapter NO define valores visuales propios.
 * Solo traduce las props del sistema a props de Ant Design,
 * mientras las CSS Variables del tema controlan la apariencia.
 */
export const TitanAvatar = forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      src,
      alt,
      name,
      size = 'md',
      variant = 'default',
      shape = 'circle',
      status,
      bordered = false,
      className = '',
      style,
      onClick,
      onError,
      'data-testid': testId,
    },
    ref
  ) => {
    // Generar iniciales
    const initials = useMemo(() => {
      if (!name) return undefined;
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }, [name]);

    // CSS Variables (mismas que base)
    const cssVariables = useMemo(
      () =>
        ({
          '--avatar-size': `var(--avatar-${size}-size)`,
          '--avatar-font-size': `var(--avatar-${size}-font-size)`,
          '--avatar-bg': `var(--avatar-${variant}-bg)`,
          '--avatar-color': `var(--avatar-${variant}-color)`,
          '--avatar-radius':
            shape === 'circle' ? '50%' : shape === 'square' ? '0' : 'var(--avatar-rounded-radius)',
        }) as React.CSSProperties,
      [size, variant, shape]
    );

    const wrapperStyle: React.CSSProperties = {
      ...cssVariables,
      position: 'relative',
      display: 'inline-block',
      ...style,
    };

    // Mapear shape a Ant Design
    const antShape = shape === 'circle' ? 'circle' : 'square';

    return (
      <span
        ref={ref}
        className={`avatar-titan-wrapper ${className}`}
        style={wrapperStyle}
        data-testid={testId}
        data-status={status}
      >
        <AntAvatar
          src={src}
          alt={alt || name}
          shape={antShape}
          onClick={onClick}
          onError={onError}
          style={{
            width: 'var(--avatar-size)',
            height: 'var(--avatar-size)',
            fontSize: 'var(--avatar-font-size)',
            backgroundColor: 'var(--avatar-bg)',
            color: 'var(--avatar-color)',
            borderRadius: 'var(--avatar-radius)',
            border: bordered ? '2px solid var(--avatar-border-color)' : undefined,
            lineHeight: 'var(--avatar-size)',
          }}
        >
          {!src && initials}
        </AntAvatar>

        {status && (
          <span
            className="avatar-titan__status"
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 'var(--avatar-status-size, 10px)',
              height: 'var(--avatar-status-size, 10px)',
              borderRadius: '50%',
              backgroundColor: `var(--avatar-status-${status}-color)`,
              border: '2px solid var(--color-background, white)',
            }}
          />
        )}
      </span>
    );
  }
);

TitanAvatar.displayName = 'Avatar.Titan';

export default TitanAvatar;
```

---

#### 📁 `engines/index.ts` - Barrel Export de Engines

**Propósito:** Barrel export de todos los engines disponibles.

```typescript
// /primitives/display/Avatar/engines/index.ts

export { TitanAvatar, TitanAvatar as titan } from './titan';
export { HermesAvatar, HermesAvatar as hermes } from './hermes';
export { ApolloAvatar, ApolloAvatar as apollo } from './apollo';

// Tipo para selección dinámica de engine
export type AvatarEngine = 'titan' | 'hermes' | 'apollo';

// Map para lazy loading de engines
export const engines = {
  titan: () => import('./titan').then((m) => m.TitanAvatar),
  hermes: () => import('./hermes').then((m) => m.HermesAvatar),
  apollo: () => import('./apollo').then((m) => m.ApolloAvatar),
};

// Default engine
export const defaultEngine = 'titan';
```

---

#### 📁 `index.ts` - Barrel Principal + Compound Pattern

**Propósito:** Export unificado del componente con patrón compound.

```typescript
// /primitives/display/Avatar/index.ts

import { BaseAvatar } from './base';
import { Group, Badge, Fallback } from './compound';

// Exportar tipos
export * from './types';

// Compound component pattern: Avatar.Group, Avatar.Badge, Avatar.Fallback
export const Avatar = Object.assign(BaseAvatar, {
  Group,
  Badge,
  Fallback,
});

// Default export
export default Avatar;

// Named exports individuales (para imports específicos)
export { BaseAvatar } from './base';
export { Group as AvatarGroup } from './compound';
export { Badge as AvatarBadge } from './compound';
export { Fallback as AvatarFallback } from './compound';

// Export engines (para proyectos que necesitan un engine específico)
export * as engines from './engines';
```

---

#### 📄 Uso Final del Componente

```tsx
// ✅ Import del compound component
import { Avatar } from '@design-system/primitives';

// ✅ Uso simple
<Avatar src="/user.jpg" size="lg" variant="primary" status="online" />

// ✅ Uso con compound components
<Avatar.Group max={3} size="md" spacing="compact">
  <Avatar src="/user1.jpg" name="Alice" />
  <Avatar src="/user2.jpg" name="Bob" />
  <Avatar src="/user3.jpg" name="Charlie" />
</Avatar.Group>

// ✅ Avatar con badge
<Avatar src="/user.jpg" size="lg">
  <Avatar.Badge position="top-right" variant="error">3</Avatar.Badge>
</Avatar>

// ✅ Avatar con fallback personalizado
<Avatar size="lg">
  <Avatar.Fallback delayMs={600}>JD</Avatar.Fallback>
</Avatar>
```

**Tenant Theme CSS:**
```css
/* /themes/tenants/rottay/primitives/avatar.css */
:root {
  /* Sizes */
  --avatar-xs-size: 24px;
  --avatar-xs-font-size: 10px;
  --avatar-sm-size: 32px;
  --avatar-sm-font-size: 12px;
  --avatar-md-size: 40px;
  --avatar-md-font-size: 14px;
  --avatar-lg-size: 48px;
  --avatar-lg-font-size: 16px;
  --avatar-xl-size: 64px;
  --avatar-xl-font-size: 20px;
  --avatar-2xl-size: 80px;
  --avatar-2xl-font-size: 24px;
  --avatar-3xl-size: 96px;
  --avatar-3xl-font-size: 28px;

  /* Shapes */
  --avatar-rounded-radius: 8px;

  /* Variants - Default */
  --avatar-default-bg: var(--color-gray-200);
  --avatar-default-color: var(--color-gray-700);
  --avatar-default-border-color: var(--color-gray-300);
  --avatar-default-shadow: none;

  /* Variants - Primary */
  --avatar-primary-bg: var(--color-primary-100);
  --avatar-primary-color: var(--color-primary-700);
  --avatar-primary-border-color: var(--color-primary-300);
  --avatar-primary-shadow: 0 2px 4px var(--color-primary-200);

  /* Variants - Secondary */
  --avatar-secondary-bg: var(--color-secondary-100);
  --avatar-secondary-color: var(--color-secondary-700);
  --avatar-secondary-border-color: var(--color-secondary-300);
  --avatar-secondary-shadow: none;

  /* Variants - Gradient */
  --avatar-gradient-bg: linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500));
  --avatar-gradient-color: white;
  --avatar-gradient-border-color: transparent;
  --avatar-gradient-shadow: 0 4px 12px var(--color-primary-300);

  /* Border */
  --avatar-border-width: 2px;

  /* Status */
  --avatar-status-size: 10px;
  --avatar-status-border-color: white;
  --avatar-status-online-color: var(--color-success-500);
  --avatar-status-offline-color: var(--color-gray-400);
  --avatar-status-busy-color: var(--color-error-500);
  --avatar-status-away-color: var(--color-warning-500);
}
```

**Ventajas:**
- ✅ Usuario usa props simples (`size="lg"`, `variant="primary"`)
- ✅ Theming completo via CSS Variables
- ✅ Tenant puede customizar cualquier valor
- ✅ Un solo componente principal (bundle pequeño)
- ✅ Adapters opcionales para otros engines

**Desventajas:**
- ⚠️ Requiere crear CSS theme files
- ⚠️ Multi-engine es opt-in, no default

---

## 5. SISTEMA RESPONSIVE MOBILE-FIRST

### 5.1 Filosofía Mobile-First

**Principio fundamental:** Todos los componentes primitivos DEBEN funcionar perfectamente en dispositivos móviles primero, y luego escalar hacia arriba para tablets y desktop.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESTRATEGIA RESPONSIVE                        │
├─────────────────────────────────────────────────────────────────┤
│  Mobile (< 640px)  │  Tablet (640-1024px)  │  Desktop (> 1024px) │
│  ─────────────────  │  ───────────────────  │  ─────────────────  │
│  BASE STYLES        │  @media (min-width)   │  @media (min-width) │
│  Touch-first        │  Hover available      │  Full interactions  │
│  Stacked layouts    │  Side-by-side         │  Complex grids      │
│  Larger touch targets│ Standard sizes       │  Compact option     │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Breakpoints del Sistema

```typescript
// /packages/tokens/src/breakpoints/index.ts

/**
 * Breakpoints del Design System Rottay.
 * Mobile-first: los estilos base son para mobile,
 * luego se agregan media queries para pantallas más grandes.
 */
export const breakpoints = {
  /** Teléfonos pequeños (portrait) */
  xs: '320px',
  /** Teléfonos (landscape) */
  sm: '640px',
  /** Tablets (portrait) */
  md: '768px',
  /** Tablets (landscape) / Laptops pequeños */
  lg: '1024px',
  /** Desktop */
  xl: '1280px',
  /** Desktop grande / Monitores */
  '2xl': '1536px',
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Media queries para usar en CSS-in-JS
 */
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  /** Para detectar dispositivos touch */
  touch: '@media (hover: none) and (pointer: coarse)',
  /** Para detectar dispositivos con hover (mouse) */
  hover: '@media (hover: hover) and (pointer: fine)',
} as const;
```

### 5.3 CSS Variables Responsive

```css
/* /packages/tokens/src/responsive/avatar.css */

:root {
  /* ===== MOBILE BASE (< 640px) ===== */
  /* Tamaños más grandes para touch targets */
  --avatar-xs-size: 28px;      /* +4px vs desktop */
  --avatar-sm-size: 36px;      /* +4px vs desktop */
  --avatar-md-size: 44px;      /* +4px vs desktop */
  --avatar-lg-size: 52px;      /* +4px vs desktop */
  --avatar-xl-size: 60px;      /* +4px vs desktop */
  --avatar-2xl-size: 72px;     /* +8px vs desktop */
  --avatar-3xl-size: 96px;

  /* Touch targets mínimos (WCAG 2.1 Level AAA: 44x44px) */
  --avatar-touch-target-min: 44px;

  /* Spacing más generoso en mobile */
  --avatar-group-compact-spacing: -6px;
  --avatar-group-normal-spacing: -2px;
  --avatar-group-loose-spacing: 8px;
}

/* ===== TABLET (>= 640px) ===== */
@media (min-width: 640px) {
  :root {
    --avatar-xs-size: 24px;
    --avatar-sm-size: 32px;
    --avatar-md-size: 40px;
    --avatar-lg-size: 48px;
    --avatar-xl-size: 56px;
    --avatar-2xl-size: 64px;

    --avatar-group-compact-spacing: -8px;
    --avatar-group-normal-spacing: -4px;
    --avatar-group-loose-spacing: 4px;
  }
}

/* ===== DESKTOP (>= 1024px) ===== */
@media (min-width: 1024px) {
  :root {
    /* Desktop puede tener avatares ligeramente más pequeños si se desea */
    /* Por defecto mantenemos los mismos que tablet */

    /* Group spacing más compacto en desktop */
    --avatar-group-compact-spacing: -10px;
    --avatar-group-normal-spacing: -6px;
  }
}

/* ===== TOUCH DEVICES ===== */
@media (hover: none) and (pointer: coarse) {
  :root {
    /* Asegurar touch targets mínimos */
    --avatar-clickable-min-size: 44px;

    /* Feedback visual más prominente para touch */
    --avatar-active-scale: 0.95;
    --avatar-active-opacity: 0.8;
  }
}

/* ===== HOVER DEVICES (mouse) ===== */
@media (hover: hover) and (pointer: fine) {
  :root {
    --avatar-hover-scale: 1.05;
    --avatar-hover-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}
```

### 5.4 Componente Responsive (Implementación)

```typescript
// /primitives/display/Avatar/base/index.tsx

// Hook para detectar breakpoint actual
import { useMediaQuery } from '@/hooks/useMediaQuery';

export const BaseAvatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ size = 'md', ...props }, ref) => {
    // Detectar si es touch device para ajustar interacciones
    const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');

    // Asegurar touch target mínimo en dispositivos touch
    const effectiveSize = isTouchDevice && props.onClick
      ? Math.max(sizeToNumber(size), 44) // Mínimo 44px para touch
      : size;

    const cssVariables = useMemo(() => ({
      '--avatar-size': `var(--avatar-${size}-size)`,
      // ... resto de variables

      // Touch-specific overrides
      ...(isTouchDevice && props.onClick && {
        '--avatar-touch-target': 'var(--avatar-touch-target-min)',
      }),
    }), [size, isTouchDevice, props.onClick]);

    return (
      <span
        ref={ref}
        style={{
          ...cssVariables,
          // Touch target invisible pero clickeable
          ...(isTouchDevice && props.onClick && {
            position: 'relative',
            '::before': {
              content: '""',
              position: 'absolute',
              inset: '-4px', // Expandir área clickeable
              minWidth: 'var(--avatar-touch-target)',
              minHeight: 'var(--avatar-touch-target)',
            },
          }),
        }}
        // ... resto del componente
      />
    );
  }
);
```

### 5.5 Hook useMediaQuery

```typescript
// /packages/core/src/hooks/useMediaQuery/index.ts

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para detectar media queries en React.
 * SSR-safe: retorna false en el servidor.
 *
 * @param query - Media query string (ej: '(min-width: 640px)')
 * @returns boolean - true si la media query coincide
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 639px)');
 * const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 * const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');
 */
export function useMediaQuery(query: string): boolean {
  // SSR-safe: default to false
  const [matches, setMatches] = useState(false);

  const handleChange = useCallback((event: MediaQueryListEvent | MediaQueryList) => {
    setMatches(event.matches);
  }, []);

  useEffect(() => {
    // Solo ejecutar en cliente
    if (typeof window === 'undefined') return;

    const mediaQueryList = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQueryList.matches);

    // Modern browsers
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
      return () => mediaQueryList.removeEventListener('change', handleChange);
    }
    // Legacy browsers (Safari < 14)
    else {
      mediaQueryList.addListener(handleChange);
      return () => mediaQueryList.removeListener(handleChange);
    }
  }, [query, handleChange]);

  return matches;
}

/**
 * Hook con breakpoints predefinidos del sistema.
 *
 * @returns Objeto con booleans para cada breakpoint
 *
 * @example
 * const { isMobile, isTablet, isDesktop, isTouchDevice } = useBreakpoints();
 */
export function useBreakpoints() {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    prefersReducedMotion,
    // Helpers combinados
    isMobileOrTablet: isMobile || isTablet,
    isTabletOrDesktop: isTablet || isDesktop,
  };
}
```

### 5.6 Consideraciones por Componente

| Componente | Mobile Considerations | Implementación |
|------------|----------------------|----------------|
| **Avatar** | Touch target mínimo 44px, feedback visual en tap | `--avatar-touch-target-min` |
| **Button** | Altura mínima 44px, full-width en mobile | `--button-mobile-full-width: true` |
| **Input** | Font-size mínimo 16px (evita zoom en iOS), altura 48px | `--input-mobile-height` |
| **Select** | Native select en mobile, custom en desktop | `useNativeSelect` prop |
| **Modal** | Fullscreen en mobile, centered en desktop | `--modal-mobile-fullscreen: true` |
| **Dropdown** | Bottom sheet en mobile, dropdown en desktop | Detectar con `useBreakpoints()` |
| **Tooltip** | Deshabilitado en touch, solo en hover devices | `@media (hover: hover)` |
| **Card** | Stack vertical en mobile, horizontal en desktop | Flexbox con `flex-direction` |

---

## 6. CSS TOKENS COMPLETO

### 6.1 Estructura de Tokens

```
/packages/tokens/
├── src/
│   ├── base/                      ← Tokens base del sistema
│   │   ├── colors.css             ← Paleta de colores
│   │   ├── spacing.css            ← Espaciado (4px grid)
│   │   ├── typography.css         ← Fuentes, tamaños, line-height
│   │   ├── shadows.css            ← Sombras
│   │   ├── borders.css            ← Bordes, radios
│   │   ├── z-index.css            ← Capas
│   │   └── index.css              ← Barrel import
│   │
│   ├── components/                ← Tokens por componente
│   │   ├── avatar.css
│   │   ├── button.css
│   │   ├── input.css
│   │   ├── card.css
│   │   ├── modal.css
│   │   └── index.css
│   │
│   ├── responsive/                ← Overrides responsive
│   │   ├── avatar.css
│   │   ├── button.css
│   │   └── index.css
│   │
│   ├── animations/                ← Tokens de animación
│   │   ├── transitions.css
│   │   ├── keyframes.css
│   │   └── index.css
│   │
│   └── tenants/                   ← Overrides por tenant
│       ├── rottay/                ← TEMA BASE (fallback)
│       │   ├── colors.css
│       │   ├── components.css
│       │   └── index.css
│       │
│       ├── tenant-example/
│       │   └── index.css
│       │
│       └── index.css
```

### 6.2 Avatar Tokens Completo

```css
/* /packages/tokens/src/components/avatar.css */

:root {
  /* ═══════════════════════════════════════════════════════════════
     AVATAR - DESIGN TOKENS
     Tenant: Rottay (Base)
     Última actualización: 2025-12-24
     ═══════════════════════════════════════════════════════════════ */

  /* ───────────────────────────────────────────────────────────────
     TAMAÑOS
     Nota: En mobile estos valores son overrideados en responsive/avatar.css
     ─────────────────────────────────────────────────────────────── */
  --avatar-xs-size: 24px;
  --avatar-xs-font-size: 10px;
  --avatar-xs-status-size: 6px;
  --avatar-xs-border-width: 1px;

  --avatar-sm-size: 32px;
  --avatar-sm-font-size: 12px;
  --avatar-sm-status-size: 8px;
  --avatar-sm-border-width: 1.5px;

  --avatar-md-size: 40px;
  --avatar-md-font-size: 14px;
  --avatar-md-status-size: 10px;
  --avatar-md-border-width: 2px;

  --avatar-lg-size: 48px;
  --avatar-lg-font-size: 16px;
  --avatar-lg-status-size: 12px;
  --avatar-lg-border-width: 2px;

  --avatar-xl-size: 56px;
  --avatar-xl-font-size: 18px;
  --avatar-xl-status-size: 14px;
  --avatar-xl-border-width: 2.5px;

  --avatar-2xl-size: 64px;
  --avatar-2xl-font-size: 20px;
  --avatar-2xl-status-size: 16px;
  --avatar-2xl-border-width: 3px;

  --avatar-3xl-size: 96px;
  --avatar-3xl-font-size: 28px;
  --avatar-3xl-status-size: 20px;
  --avatar-3xl-border-width: 4px;

  /* ───────────────────────────────────────────────────────────────
     FORMAS (Border Radius)
     ─────────────────────────────────────────────────────────────── */
  --avatar-circle-radius: 50%;
  --avatar-square-radius: 0;
  --avatar-rounded-radius: var(--radius-md, 8px);

  /* ───────────────────────────────────────────────────────────────
     VARIANTES - Default
     ─────────────────────────────────────────────────────────────── */
  --avatar-default-bg: var(--color-neutral-100, #f5f5f5);
  --avatar-default-color: var(--color-neutral-600, #525252);
  --avatar-default-border-color: var(--color-neutral-200, #e5e5e5);
  --avatar-default-shadow: none;

  /* ───────────────────────────────────────────────────────────────
     VARIANTES - Primary (Rottay Brand)
     ─────────────────────────────────────────────────────────────── */
  --avatar-primary-bg: var(--color-primary-100, #E8F4FF);
  --avatar-primary-color: var(--color-primary-700, #0047AB);
  --avatar-primary-border-color: var(--color-primary-200, #B8DBFF);
  --avatar-primary-shadow: 0 2px 8px var(--color-primary-200, rgba(0, 71, 171, 0.15));

  /* ───────────────────────────────────────────────────────────────
     VARIANTES - Secondary
     ─────────────────────────────────────────────────────────────── */
  --avatar-secondary-bg: var(--color-secondary-100, #F0F0FF);
  --avatar-secondary-color: var(--color-secondary-700, #4B4B9E);
  --avatar-secondary-border-color: var(--color-secondary-200, #D4D4FF);
  --avatar-secondary-shadow: none;

  /* ───────────────────────────────────────────────────────────────
     VARIANTES - Success
     ─────────────────────────────────────────────────────────────── */
  --avatar-success-bg: var(--color-success-100, #DCFCE7);
  --avatar-success-color: var(--color-success-700, #15803D);
  --avatar-success-border-color: var(--color-success-200, #BBF7D0);
  --avatar-success-shadow: none;

  /* ───────────────────────────────────────────────────────────────
     VARIANTES - Warning
     ─────────────────────────────────────────────────────────────── */
  --avatar-warning-bg: var(--color-warning-100, #FEF3C7);
  --avatar-warning-color: var(--color-warning-700, #B45309);
  --avatar-warning-border-color: var(--color-warning-200, #FDE68A);
  --avatar-warning-shadow: none;

  /* ───────────────────────────────────────────────────────────────
     VARIANTES - Error
     ─────────────────────────────────────────────────────────────── */
  --avatar-error-bg: var(--color-error-100, #FEE2E2);
  --avatar-error-color: var(--color-error-700, #B91C1C);
  --avatar-error-border-color: var(--color-error-200, #FECACA);
  --avatar-error-shadow: none;

  /* ───────────────────────────────────────────────────────────────
     VARIANTES - Gradient (Premium/Featured)
     ─────────────────────────────────────────────────────────────── */
  --avatar-gradient-bg: linear-gradient(
    135deg,
    var(--color-primary-500, #0066CC) 0%,
    var(--color-secondary-500, #6B6BD4) 100%
  );
  --avatar-gradient-color: white;
  --avatar-gradient-border-color: transparent;
  --avatar-gradient-shadow: 0 4px 16px rgba(102, 102, 212, 0.3);

  /* ───────────────────────────────────────────────────────────────
     STATUS INDICATORS
     ─────────────────────────────────────────────────────────────── */
  --avatar-status-size: 10px;
  --avatar-status-border-width: 2px;
  --avatar-status-border-color: var(--color-background, white);

  --avatar-status-online-color: var(--color-success-500, #22C55E);
  --avatar-status-offline-color: var(--color-neutral-400, #A3A3A3);
  --avatar-status-away-color: var(--color-warning-500, #F59E0B);
  --avatar-status-busy-color: var(--color-error-500, #EF4444);

  /* Status con animación pulse para "online" */
  --avatar-status-online-pulse: true;
  --avatar-status-pulse-duration: 2s;

  /* ───────────────────────────────────────────────────────────────
     BORDES
     ─────────────────────────────────────────────────────────────── */
  --avatar-border-width: 2px;
  --avatar-border-style: solid;

  /* ───────────────────────────────────────────────────────────────
     AVATAR GROUP
     ─────────────────────────────────────────────────────────────── */
  --avatar-group-compact-spacing: -8px;
  --avatar-group-normal-spacing: -4px;
  --avatar-group-loose-spacing: 4px;

  /* Borde entre avatares en grupo */
  --avatar-group-ring-width: 2px;
  --avatar-group-ring-color: var(--color-background, white);

  /* Overflow indicator (+N) */
  --avatar-group-overflow-bg: var(--color-neutral-200, #E5E5E5);
  --avatar-group-overflow-color: var(--color-neutral-700, #404040);
  --avatar-group-overflow-font-weight: 600;

  /* ───────────────────────────────────────────────────────────────
     AVATAR BADGE
     ─────────────────────────────────────────────────────────────── */
  --avatar-badge-size: 18px;
  --avatar-badge-font-size: 10px;
  --avatar-badge-font-weight: 600;
  --avatar-badge-radius: 9999px;
  --avatar-badge-border-width: 2px;
  --avatar-badge-border-color: var(--color-background, white);

  /* Badge variants */
  --avatar-badge-primary-bg: var(--color-primary-500, #0066CC);
  --avatar-badge-primary-color: white;
  --avatar-badge-secondary-bg: var(--color-secondary-500, #6B6BD4);
  --avatar-badge-secondary-color: white;
  --avatar-badge-success-bg: var(--color-success-500, #22C55E);
  --avatar-badge-success-color: white;
  --avatar-badge-warning-bg: var(--color-warning-500, #F59E0B);
  --avatar-badge-warning-color: white;
  --avatar-badge-error-bg: var(--color-error-500, #EF4444);
  --avatar-badge-error-color: white;

  /* ───────────────────────────────────────────────────────────────
     SKELETON / LOADING STATE
     ─────────────────────────────────────────────────────────────── */
  --avatar-skeleton-bg: var(--color-neutral-200, #E5E5E5);
  --avatar-skeleton-shimmer-color: var(--color-neutral-100, #F5F5F5);
  --avatar-skeleton-animation-duration: 1.5s;

  /* ───────────────────────────────────────────────────────────────
     INTERACCIONES
     ─────────────────────────────────────────────────────────────── */
  /* Hover (solo dispositivos con mouse) */
  --avatar-hover-scale: 1.05;
  --avatar-hover-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --avatar-hover-transition-duration: 150ms;

  /* Active/Press */
  --avatar-active-scale: 0.95;
  --avatar-active-opacity: 0.9;

  /* Focus (accesibilidad) */
  --avatar-focus-ring-width: 2px;
  --avatar-focus-ring-offset: 2px;
  --avatar-focus-ring-color: var(--color-primary-500, #0066CC);

  /* ───────────────────────────────────────────────────────────────
     TOUCH DEVICES
     ─────────────────────────────────────────────────────────────── */
  --avatar-touch-target-min: 44px;
  --avatar-touch-feedback-duration: 100ms;

  /* ───────────────────────────────────────────────────────────────
     FUENTE
     ─────────────────────────────────────────────────────────────── */
  --avatar-font-family: var(--font-family-sans, system-ui, sans-serif);
  --avatar-font-weight: 600;
  --avatar-letter-spacing: 0.025em;

  /* ───────────────────────────────────────────────────────────────
     PLACEHOLDER ICON
     ─────────────────────────────────────────────────────────────── */
  --avatar-placeholder-icon-color: currentColor;
  --avatar-placeholder-icon-opacity: 0.5;
}
```

### 6.3 Tokens Base del Sistema

```css
/* /packages/tokens/src/base/colors.css */

:root {
  /* ═══════════════════════════════════════════════════════════════
     ROTTAY - PALETA DE COLORES BASE
     ═══════════════════════════════════════════════════════════════ */

  /* ───────────────────────────────────────────────────────────────
     PRIMARY - Rottay Brand Blue
     ─────────────────────────────────────────────────────────────── */
  --color-primary-50: #E8F4FF;
  --color-primary-100: #C8E2FF;
  --color-primary-200: #A1CBFF;
  --color-primary-300: #73AEFF;
  --color-primary-400: #4A91FF;
  --color-primary-500: #0066CC;   /* Brand primary */
  --color-primary-600: #0055AA;
  --color-primary-700: #0047AB;
  --color-primary-800: #003380;
  --color-primary-900: #002255;

  /* ───────────────────────────────────────────────────────────────
     SECONDARY - Rottay Accent Purple
     ─────────────────────────────────────────────────────────────── */
  --color-secondary-50: #F5F5FF;
  --color-secondary-100: #EBEBFF;
  --color-secondary-200: #D4D4FF;
  --color-secondary-300: #B0B0F0;
  --color-secondary-400: #8F8FE0;
  --color-secondary-500: #6B6BD4;
  --color-secondary-600: #5555BB;
  --color-secondary-700: #4B4B9E;
  --color-secondary-800: #3A3A7A;
  --color-secondary-900: #2A2A5A;

  /* ───────────────────────────────────────────────────────────────
     NEUTRAL - Grays
     ─────────────────────────────────────────────────────────────── */
  --color-neutral-50: #FAFAFA;
  --color-neutral-100: #F5F5F5;
  --color-neutral-200: #E5E5E5;
  --color-neutral-300: #D4D4D4;
  --color-neutral-400: #A3A3A3;
  --color-neutral-500: #737373;
  --color-neutral-600: #525252;
  --color-neutral-700: #404040;
  --color-neutral-800: #262626;
  --color-neutral-900: #171717;

  /* ───────────────────────────────────────────────────────────────
     SEMANTIC - Success, Warning, Error
     ─────────────────────────────────────────────────────────────── */
  /* Success - Green */
  --color-success-50: #F0FDF4;
  --color-success-100: #DCFCE7;
  --color-success-200: #BBF7D0;
  --color-success-300: #86EFAC;
  --color-success-400: #4ADE80;
  --color-success-500: #22C55E;
  --color-success-600: #16A34A;
  --color-success-700: #15803D;
  --color-success-800: #166534;
  --color-success-900: #14532D;

  /* Warning - Amber */
  --color-warning-50: #FFFBEB;
  --color-warning-100: #FEF3C7;
  --color-warning-200: #FDE68A;
  --color-warning-300: #FCD34D;
  --color-warning-400: #FBBF24;
  --color-warning-500: #F59E0B;
  --color-warning-600: #D97706;
  --color-warning-700: #B45309;
  --color-warning-800: #92400E;
  --color-warning-900: #78350F;

  /* Error - Red */
  --color-error-50: #FEF2F2;
  --color-error-100: #FEE2E2;
  --color-error-200: #FECACA;
  --color-error-300: #FCA5A5;
  --color-error-400: #F87171;
  --color-error-500: #EF4444;
  --color-error-600: #DC2626;
  --color-error-700: #B91C1C;
  --color-error-800: #991B1B;
  --color-error-900: #7F1D1D;

  /* ───────────────────────────────────────────────────────────────
     SURFACE COLORS
     ─────────────────────────────────────────────────────────────── */
  --color-background: #FFFFFF;
  --color-surface: #FFFFFF;
  --color-surface-raised: #FAFAFA;
  --color-surface-overlay: rgba(0, 0, 0, 0.5);

  /* ───────────────────────────────────────────────────────────────
     TEXT COLORS
     ─────────────────────────────────────────────────────────────── */
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-600);
  --color-text-muted: var(--color-neutral-400);
  --color-text-inverted: #FFFFFF;
}
```

---

## 7. ENGINES DETALLADOS

### 7.1 Engine Titan (Ant Design)

Ver implementación detallada en **Sección 4.4 - OPCIÓN C DETALLADA** (línea ~355).
El engine Titan usa componentes de Ant Design como base y aplica CSS Variables del tema Rottay.

### 7.2 Engine Hermes (DaisyUI/Tailwind)

```typescript
// /primitives/display/Avatar/engines/hermes/index.tsx
'use client';

import React, { forwardRef, useMemo, useState, useCallback } from 'react';
import type { AvatarProps } from '../../types';

/**
 * Hermes Engine - Adapter de Avatar para DaisyUI/Tailwind.
 *
 * Este engine usa clases de DaisyUI y Tailwind CSS.
 * Las CSS Variables del tema Rottay controlan la apariencia final.
 *
 * Dependencias:
 * - daisyui (plugin de Tailwind)
 * - tailwindcss
 */
export const HermesAvatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      name,
      size = 'md',
      variant = 'default',
      shape = 'circle',
      status,
      bordered = false,
      loading = false,
      className = '',
      style,
      onClick,
      onError,
      onLoad,
      'data-testid': testId,
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Generar iniciales
    const initials = useMemo(() => {
      if (!name) return null;
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }, [name]);

    const handleImageError = useCallback(
      (event: React.SyntheticEvent<HTMLImageElement>) => {
        setImageError(true);
        onError?.(event);
      },
      [onError]
    );

    const handleImageLoad = useCallback(
      (event: React.SyntheticEvent<HTMLImageElement>) => {
        setImageLoaded(true);
        onLoad?.(event);
      },
      [onLoad]
    );

    // CSS Variables (mismas que base)
    const cssVariables = useMemo(
      () =>
        ({
          '--avatar-size': `var(--avatar-${size}-size)`,
          '--avatar-font-size': `var(--avatar-${size}-font-size)`,
          '--avatar-bg': `var(--avatar-${variant}-bg)`,
          '--avatar-color': `var(--avatar-${variant}-color)`,
          '--avatar-radius':
            shape === 'circle' ? '50%' : shape === 'square' ? '0' : 'var(--avatar-rounded-radius)',
          '--avatar-border-color': `var(--avatar-${variant}-border-color)`,
        }) as React.CSSProperties,
      [size, variant, shape]
    );

    // Mapeo de size a clases de DaisyUI
    const sizeClasses: Record<string, string> = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-14 h-14',
      '2xl': 'w-16 h-16',
      '3xl': 'w-24 h-24',
    };

    // Clases de Tailwind/DaisyUI
    const avatarClasses = [
      'avatar',
      status && 'avatar-indicator',
      status === 'online' && 'online',
      status === 'offline' && 'offline',
      className,
    ].filter(Boolean).join(' ');

    const placeholderClasses = [
      'avatar placeholder',
      sizeClasses[size] || sizeClasses.md,
      shape === 'circle' && 'rounded-full',
      shape === 'rounded' && 'rounded-lg',
      shape === 'square' && 'rounded-none',
      bordered && 'ring ring-offset-2',
    ].filter(Boolean).join(' ');

    const showImage = src && !imageError;
    const showSkeleton = loading === true || (loading !== false && !imageLoaded && src);

    return (
      <div
        ref={ref}
        className={avatarClasses}
        style={{ ...cssVariables, ...style }}
        data-testid={testId}
        data-size={size}
        data-variant={variant}
      >
        <div
          className={placeholderClasses}
          style={{
            backgroundColor: 'var(--avatar-bg)',
            color: 'var(--avatar-color)',
            width: 'var(--avatar-size)',
            height: 'var(--avatar-size)',
            borderRadius: 'var(--avatar-radius)',
          }}
          onClick={onClick}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
        >
          {showSkeleton && (
            <div
              className="animate-pulse bg-neutral-200"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 'inherit',
              }}
            />
          )}

          {showImage && !showSkeleton && (
            <img
              src={src}
              alt={alt || name || 'Avatar'}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading={loading === 'lazy' ? 'lazy' : loading === 'eager' ? 'eager' : undefined}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 'inherit',
              }}
            />
          )}

          {!showImage && !showSkeleton && initials && (
            <span
              style={{
                fontSize: 'var(--avatar-font-size)',
                fontWeight: 'var(--avatar-font-weight, 600)',
              }}
            >
              {initials}
            </span>
          )}

          {!showImage && !showSkeleton && !initials && (
            <svg
              className="text-current opacity-50"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{
                width: '60%',
                height: '60%',
              }}
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
        </div>

        {/* Status indicator */}
        {status && (
          <span
            className="absolute bottom-0 right-0 block rounded-full ring-2 ring-white"
            style={{
              width: `var(--avatar-${size}-status-size, 10px)`,
              height: `var(--avatar-${size}-status-size, 10px)`,
              backgroundColor: `var(--avatar-status-${status}-color)`,
            }}
          />
        )}
      </div>
    );
  }
);

HermesAvatar.displayName = 'Avatar.Hermes';

export default HermesAvatar;
```

### 7.3 Engine Apollo (Vanilla HTML/CSS)

```typescript
// /primitives/display/Avatar/engines/apollo/index.tsx
'use client';

import React, { forwardRef, useMemo, useState, useCallback, useEffect } from 'react';
import type { AvatarProps } from '../../types';

/**
 * Apollo Engine - Avatar en Vanilla HTML/CSS puro.
 *
 * Este engine NO tiene dependencias externas (ni Ant Design ni DaisyUI).
 * Usa solo CSS Variables y HTML semántico.
 *
 * Ideal para:
 * - Proyectos que quieren bundle mínimo
 * - SSR sin hidratación compleja
 * - Máxima customización sin conflictos de estilos
 */
export const ApolloAvatar = forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      src,
      alt,
      name,
      size = 'md',
      variant = 'default',
      shape = 'circle',
      status,
      bordered = false,
      loading = false,
      className = '',
      style,
      onClick,
      onError,
      onLoad,
      children,
      'data-testid': testId,
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(loading === true);

    // Generar iniciales
    const initials = useMemo(() => {
      if (!name) return null;
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }, [name]);

    // Manejar skeleton para lazy loading
    useEffect(() => {
      if (loading === true) {
        setShowSkeleton(true);
      } else if (src && !imageLoaded && loading !== false) {
        setShowSkeleton(true);
      } else {
        setShowSkeleton(false);
      }
    }, [loading, src, imageLoaded]);

    const handleImageError = useCallback(
      (event: React.SyntheticEvent<HTMLImageElement>) => {
        setImageError(true);
        setShowSkeleton(false);
        onError?.(event);
      },
      [onError]
    );

    const handleImageLoad = useCallback(
      (event: React.SyntheticEvent<HTMLImageElement>) => {
        setImageLoaded(true);
        setShowSkeleton(false);
        onLoad?.(event);
      },
      [onLoad]
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick(event as unknown as React.MouseEvent<HTMLSpanElement>);
        }
      },
      [onClick]
    );

    // CSS Variables
    const cssVariables = useMemo(
      () =>
        ({
          '--avatar-size': `var(--avatar-${size}-size)`,
          '--avatar-font-size': `var(--avatar-${size}-font-size)`,
          '--avatar-status-size': `var(--avatar-${size}-status-size, var(--avatar-status-size))`,
          '--avatar-bg': `var(--avatar-${variant}-bg)`,
          '--avatar-color': `var(--avatar-${variant}-color)`,
          '--avatar-border-color': `var(--avatar-${variant}-border-color)`,
          '--avatar-shadow': `var(--avatar-${variant}-shadow)`,
          '--avatar-radius':
            shape === 'circle'
              ? '50%'
              : shape === 'square'
                ? '0'
                : 'var(--avatar-rounded-radius, 8px)',
        }) as React.CSSProperties,
      [size, variant, shape]
    );

    // Estilos del contenedor principal
    const containerStyle: React.CSSProperties = {
      ...cssVariables,
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 'var(--avatar-size)',
      height: 'var(--avatar-size)',
      fontSize: 'var(--avatar-font-size)',
      fontWeight: 'var(--avatar-font-weight, 600)',
      fontFamily: 'var(--avatar-font-family, inherit)',
      letterSpacing: 'var(--avatar-letter-spacing, 0.025em)',
      backgroundColor: 'var(--avatar-bg)',
      color: 'var(--avatar-color)',
      borderRadius: 'var(--avatar-radius)',
      border: bordered
        ? 'var(--avatar-border-width, 2px) solid var(--avatar-border-color)'
        : 'none',
      boxShadow: 'var(--avatar-shadow)',
      overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      userSelect: 'none',
      flexShrink: 0,
      // Transiciones para interacciones
      transition: `
        transform var(--avatar-hover-transition-duration, 150ms) ease,
        box-shadow var(--avatar-hover-transition-duration, 150ms) ease
      `,
      ...style,
    };

    // Estilos de la imagen
    const imageStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: 'inherit',
    };

    // Estilos del skeleton
    const skeletonStyle: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      backgroundColor: 'var(--avatar-skeleton-bg, #E5E5E5)',
      borderRadius: 'inherit',
      animation: `avatar-skeleton-shimmer var(--avatar-skeleton-animation-duration, 1.5s) infinite`,
    };

    // Estilos del status indicator
    const statusStyle: React.CSSProperties = {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 'var(--avatar-status-size)',
      height: 'var(--avatar-status-size)',
      backgroundColor: `var(--avatar-status-${status}-color)`,
      borderRadius: '50%',
      border: `var(--avatar-status-border-width, 2px) solid var(--avatar-status-border-color, white)`,
      zIndex: 1,
    };

    // Clases CSS
    const avatarClasses = [
      'primitive-avatar',
      'primitive-avatar--apollo',
      `primitive-avatar--${size}`,
      `primitive-avatar--${variant}`,
      `primitive-avatar--${shape}`,
      status && `primitive-avatar--status-${status}`,
      bordered && 'primitive-avatar--bordered',
      onClick && 'primitive-avatar--clickable',
      showSkeleton && 'primitive-avatar--loading',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const showImage = src && !imageError && !showSkeleton;
    const showInitials = !src || imageError;
    const showPlaceholder = showInitials && !initials && !children;

    return (
      <>
        {/* Inyectar keyframes para skeleton animation */}
        <style>{`
          @keyframes avatar-skeleton-shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          .primitive-avatar--apollo.primitive-avatar--loading::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(
              90deg,
              var(--avatar-skeleton-bg) 0%,
              var(--avatar-skeleton-shimmer-color, #F5F5F5) 50%,
              var(--avatar-skeleton-bg) 100%
            );
            background-size: 200% 100%;
            animation: avatar-skeleton-shimmer 1.5s infinite;
            border-radius: inherit;
          }
          .primitive-avatar--apollo.primitive-avatar--clickable:hover {
            transform: scale(var(--avatar-hover-scale, 1.05));
            box-shadow: var(--avatar-hover-shadow, 0 4px 12px rgba(0,0,0,0.1));
          }
          .primitive-avatar--apollo.primitive-avatar--clickable:active {
            transform: scale(var(--avatar-active-scale, 0.95));
            opacity: var(--avatar-active-opacity, 0.9);
          }
          .primitive-avatar--apollo:focus-visible {
            outline: var(--avatar-focus-ring-width, 2px) solid var(--avatar-focus-ring-color, #0066CC);
            outline-offset: var(--avatar-focus-ring-offset, 2px);
          }
        `}</style>

        <span
          ref={ref}
          className={avatarClasses}
          style={containerStyle}
          onClick={onClick}
          onKeyDown={handleKeyDown}
          role={onClick ? 'button' : 'img'}
          tabIndex={onClick ? 0 : undefined}
          aria-label={alt || name || 'Avatar'}
          data-testid={testId}
          data-size={size}
          data-variant={variant}
          data-shape={shape}
          data-status={status}
        >
          {/* Imagen */}
          {showImage && (
            <img
              src={src}
              alt={alt || name || 'Avatar'}
              style={imageStyle}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading={loading === 'lazy' ? 'lazy' : loading === 'eager' ? 'eager' : undefined}
              draggable={false}
            />
          )}

          {/* Iniciales */}
          {showInitials && initials && !showSkeleton && (
            <span aria-hidden="true">{initials}</span>
          )}

          {/* Children (custom content) */}
          {showInitials && !initials && children && !showSkeleton && children}

          {/* Placeholder icon */}
          {showPlaceholder && !showSkeleton && (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              style={{
                width: '60%',
                height: '60%',
                opacity: 'var(--avatar-placeholder-icon-opacity, 0.5)',
              }}
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}

          {/* Status indicator */}
          {status && <span style={statusStyle} aria-label={`Status: ${status}`} />}
        </span>
      </>
    );
  }
);

ApolloAvatar.displayName = 'Avatar.Apollo';

export default ApolloAvatar;
```

---

## 8. HOOKS Y CONTEXTO

### 8.1 useAvatarContext

```typescript
// /primitives/display/Avatar/hooks/index.ts

import { createContext, useContext, useMemo } from 'react';
import type { AvatarSize, AvatarVariant, AvatarShape } from '../types';

/**
 * Contexto para compartir props entre Avatar y sus compound components.
 *
 * Permite que Avatar.Badge, Avatar.Fallback, etc. accedan a las props
 * del Avatar padre sin prop drilling.
 */
export interface AvatarContextValue {
  /** Tamaño del avatar padre */
  size: AvatarSize;
  /** Variante del avatar padre */
  variant: AvatarVariant;
  /** Forma del avatar padre */
  shape: AvatarShape;
  /** Si el avatar tiene imagen cargada */
  hasImage: boolean;
  /** Si la imagen está cargando */
  isLoading: boolean;
  /** Si hubo error al cargar la imagen */
  hasError: boolean;
}

const AvatarContext = createContext<AvatarContextValue | null>(null);

/**
 * Hook para acceder al contexto del Avatar padre.
 *
 * @throws Error si se usa fuera de un Avatar
 *
 * @example
 * // Dentro de Avatar.Badge
 * const { size, variant } = useAvatarContext();
 */
export function useAvatarContext(): AvatarContextValue {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error(
      'useAvatarContext must be used within an Avatar component. ' +
      'Make sure Avatar.Badge, Avatar.Fallback, etc. are children of Avatar.'
    );
  }
  return context;
}

/**
 * Hook opcional que no lanza error si está fuera de contexto.
 * Útil para componentes que pueden usarse dentro o fuera de Avatar.
 */
export function useOptionalAvatarContext(): AvatarContextValue | null {
  return useContext(AvatarContext);
}

export { AvatarContext };
export type { AvatarContextValue as AvatarContext };
```

### 8.2 Provider en Base Avatar

```typescript
// Actualización de /primitives/display/Avatar/base/index.tsx

import { AvatarContext, type AvatarContextValue } from '../hooks';

export const BaseAvatar = forwardRef<HTMLSpanElement, AvatarProps>(
  (props, ref) => {
    const {
      size = 'md',
      variant = 'default',
      shape = 'circle',
      src,
      loading,
      children,
      // ... resto de props
    } = props;

    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Contexto para compound components
    const contextValue = useMemo<AvatarContextValue>(
      () => ({
        size,
        variant,
        shape,
        hasImage: !!src && !imageError,
        isLoading: loading === true || (!imageLoaded && !!src),
        hasError: imageError,
      }),
      [size, variant, shape, src, imageError, imageLoaded, loading]
    );

    return (
      <AvatarContext.Provider value={contextValue}>
        <span ref={ref} /* ... resto del JSX */>
          {/* ... contenido ... */}
          {children}
        </span>
      </AvatarContext.Provider>
    );
  }
);
```

---

## 9. ACCESSIBILITY (A11y)

### 9.1 Checklist de Accesibilidad para Avatar

| Requisito | Implementación | Estado |
|-----------|----------------|--------|
| **Rol ARIA correcto** | `role="img"` para avatar decorativo, `role="button"` si es clickeable | ✅ Implementado |
| **aria-label** | Siempre presente con nombre o alt text | ✅ Implementado |
| **Keyboard navigation** | `tabIndex={0}` + handler de Enter/Space para avatares clickeables | ✅ Implementado |
| **Focus visible** | Focus ring de 2px con offset, color primario | ✅ Implementado |
| **Touch target mínimo** | 44x44px en dispositivos touch (WCAG 2.1 AAA) | ✅ Implementado |
| **Contraste de color** | Ratio mínimo 4.5:1 para iniciales sobre fondo | 🔲 Verificar por variante |
| **Status announcement** | `aria-label="Status: online"` en el indicador | ✅ Implementado |
| **Reduced motion** | Respetar `prefers-reduced-motion` | 🔲 Pendiente |
| **Screen reader** | Texto alternativo descriptivo | ✅ Implementado |
| **High contrast mode** | Bordes visibles en Windows High Contrast | 🔲 Pendiente |

### 9.2 Implementación de Reduced Motion

```css
/* /packages/tokens/src/animations/reduced-motion.css */

@media (prefers-reduced-motion: reduce) {
  :root {
    /* Desactivar todas las animaciones */
    --avatar-hover-transition-duration: 0ms;
    --avatar-skeleton-animation-duration: 0ms;
    --avatar-status-pulse-duration: 0ms;

    /* Desactivar transformaciones */
    --avatar-hover-scale: 1;
    --avatar-active-scale: 1;
  }

  .primitive-avatar,
  .primitive-avatar * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 9.3 Ejemplo de Avatar Accesible

```tsx
// ✅ Avatar accesible correctamente
<Avatar
  src="/user.jpg"
  alt="Foto de perfil de María García"
  name="María García"
  size="lg"
  status="online"
  onClick={handleProfileClick}
/>
// Genera:
// <span role="button" aria-label="Foto de perfil de María García" tabIndex="0">
//   <img alt="Foto de perfil de María García" />
//   <span aria-label="Status: online" />
// </span>

// ❌ Avatar NO accesible
<Avatar
  src="/user.jpg"
  onClick={handleClick}
/>
// Sin alt, sin name, sin aria-label = NO accesible
```

---

## 10. ANIMACIONES Y TRANSICIONES

### 10.1 Tokens de Animación

```css
/* /packages/tokens/src/animations/transitions.css */

:root {
  /* ═══════════════════════════════════════════════════════════════
     ROTTAY - ANIMATION TOKENS
     ═══════════════════════════════════════════════════════════════ */

  /* ───────────────────────────────────────────────────────────────
     DURACIONES
     ─────────────────────────────────────────────────────────────── */
  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;

  /* ───────────────────────────────────────────────────────────────
     EASING FUNCTIONS
     ─────────────────────────────────────────────────────────────── */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);

  /* ───────────────────────────────────────────────────────────────
     AVATAR ESPECÍFICO
     ─────────────────────────────────────────────────────────────── */
  /* Hover */
  --avatar-transition-property: transform, box-shadow, opacity;
  --avatar-transition-duration: var(--duration-fast);
  --avatar-transition-timing: var(--ease-out);

  /* Skeleton shimmer */
  --avatar-skeleton-animation: avatar-shimmer 1.5s ease-in-out infinite;

  /* Status pulse (online indicator) */
  --avatar-status-pulse-animation: avatar-pulse 2s ease-in-out infinite;

  /* Loading spinner */
  --avatar-loading-animation: avatar-spin 1s linear infinite;
}
```

### 10.2 Keyframes

```css
/* /packages/tokens/src/animations/keyframes.css */

/* Shimmer effect para skeleton loading */
@keyframes avatar-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Pulse para status "online" */
@keyframes avatar-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

/* Spin para loading indicator */
@keyframes avatar-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Fade in para imagen cargada */
@keyframes avatar-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Scale in para aparecer */
@keyframes avatar-scale-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## 11. TESTING UTILITIES

### 11.1 Helpers de Testing

```typescript
// /primitives/display/Avatar/__tests__/utils.tsx

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Avatar } from '../index';
import type { AvatarProps } from '../types';

/**
 * Props por defecto para tests.
 * Usar como base y override lo necesario.
 */
export const defaultAvatarProps: AvatarProps = {
  size: 'md',
  variant: 'default',
  shape: 'circle',
  alt: 'Test Avatar',
};

/**
 * Renderiza Avatar con configuración de testing.
 *
 * @example
 * const { getByRole, user } = renderAvatar({ onClick: jest.fn() });
 * await user.click(getByRole('button'));
 */
export function renderAvatar(
  props: Partial<AvatarProps> = {},
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const mergedProps = { ...defaultAvatarProps, ...props };
  const user = userEvent.setup();

  const result = render(<Avatar {...mergedProps} />, options);

  return {
    ...result,
    user,
    // Helpers específicos
    getAvatar: () => result.getByTestId(props['data-testid'] || 'avatar'),
    getImage: () => result.queryByRole('img'),
    getInitials: () => result.queryByText(/^[A-Z]{1,2}$/),
    getStatus: () => result.queryByLabelText(/Status:/),
  };
}

/**
 * Mock de imagen que carga exitosamente.
 */
export function mockImageLoad() {
  const originalImage = window.Image;

  beforeAll(() => {
    (window as any).Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src: string = '';

      constructor() {
        setTimeout(() => {
          this.onload?.();
        }, 0);
      }
    };
  });

  afterAll(() => {
    window.Image = originalImage;
  });
}

/**
 * Mock de imagen que falla al cargar.
 */
export function mockImageError() {
  const originalImage = window.Image;

  beforeAll(() => {
    (window as any).Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src: string = '';

      constructor() {
        setTimeout(() => {
          this.onerror?.();
        }, 0);
      }
    };
  });

  afterAll(() => {
    window.Image = originalImage;
  });
}

/**
 * Genera props de Avatar aleatorios para property-based testing.
 */
export function generateRandomAvatarProps(): AvatarProps {
  const sizes: AvatarProps['size'][] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
  const variants: AvatarProps['variant'][] = ['default', 'primary', 'secondary', 'gradient'];
  const shapes: AvatarProps['shape'][] = ['circle', 'square', 'rounded'];
  const statuses: AvatarProps['status'][] = ['online', 'offline', 'away', 'busy', undefined];

  return {
    size: sizes[Math.floor(Math.random() * sizes.length)],
    variant: variants[Math.floor(Math.random() * variants.length)],
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    bordered: Math.random() > 0.5,
    src: Math.random() > 0.5 ? 'https://example.com/avatar.jpg' : undefined,
    name: Math.random() > 0.5 ? 'Test User' : undefined,
  };
}
```

### 11.2 Tests de Ejemplo

```typescript
// /primitives/display/Avatar/__tests__/Avatar.test.tsx

import { screen, waitFor } from '@testing-library/react';
import { renderAvatar, mockImageLoad, mockImageError } from './utils';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Avatar', () => {
  describe('Rendering', () => {
    it('renderiza con props por defecto', () => {
      renderAvatar({ 'data-testid': 'test-avatar' });

      const avatar = screen.getByTestId('test-avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('data-size', 'md');
      expect(avatar).toHaveAttribute('data-variant', 'default');
    });

    it('renderiza imagen cuando src es proporcionado', async () => {
      mockImageLoad();

      renderAvatar({ src: '/user.jpg', alt: 'User photo' });

      await waitFor(() => {
        expect(screen.getByRole('img')).toHaveAttribute('src', '/user.jpg');
      });
    });

    it('renderiza iniciales cuando name es proporcionado sin src', () => {
      renderAvatar({ name: 'John Doe' });

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renderiza placeholder cuando no hay src ni name', () => {
      renderAvatar({});

      // Debería renderizar el SVG placeholder
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });
  });

  describe('Interacciones', () => {
    it('llama onClick cuando se hace click', async () => {
      const handleClick = jest.fn();
      const { user } = renderAvatar({ onClick: handleClick });

      const avatar = screen.getByRole('button');
      await user.click(avatar);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('es navegable por teclado cuando es clickeable', async () => {
      const handleClick = jest.fn();
      const { user } = renderAvatar({ onClick: handleClick });

      const avatar = screen.getByRole('button');
      avatar.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('muestra fallback cuando la imagen falla al cargar', async () => {
      mockImageError();

      renderAvatar({ src: '/broken.jpg', name: 'Jane Doe' });

      await waitFor(() => {
        expect(screen.getByText('JD')).toBeInTheDocument();
      });
    });

    it('llama onError cuando la imagen falla', async () => {
      mockImageError();
      const handleError = jest.fn();

      renderAvatar({ src: '/broken.jpg', onError: handleError });

      await waitFor(() => {
        expect(handleError).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('no tiene violaciones de accesibilidad', async () => {
      const { container } = renderAvatar({
        src: '/user.jpg',
        alt: 'Profile photo',
        name: 'John Doe',
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('tiene aria-label correcto', () => {
      renderAvatar({ alt: 'User Avatar', name: 'John' });

      expect(screen.getByLabelText('User Avatar')).toBeInTheDocument();
    });

    it('anuncia el status correctamente', () => {
      renderAvatar({ status: 'online', name: 'John' });

      expect(screen.getByLabelText('Status: online')).toBeInTheDocument();
    });
  });

  describe('Responsive', () => {
    it('aplica clases responsive correctas', () => {
      renderAvatar({ size: 'lg', 'data-testid': 'responsive-avatar' });

      const avatar = screen.getByTestId('responsive-avatar');
      expect(avatar).toHaveClass('primitive-avatar--lg');
    });
  });
});
```

---

## 12. STORYBOOK STORIES

### 12.1 Avatar.stories.tsx

```typescript
// /primitives/display/Avatar/Avatar.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './index';

const meta: Meta<typeof Avatar> = {
  title: 'Primitives/Display/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Avatar muestra una imagen de perfil de usuario, iniciales, o un placeholder.
Soporta múltiples tamaños, variantes, formas y estados de presencia.

**Características:**
- CSS Variables para theming multi-tenant
- Responsive: tamaños adaptativos en mobile
- Accesible: WCAG 2.1 AAA compliant
- Compound components: Avatar.Group, Avatar.Badge, Avatar.Fallback
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
      description: 'Tamaño del avatar. Responsive: más grande en mobile.',
    },
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'gradient'],
      description: 'Variante de color. Define bg, color y shadow.',
    },
    shape: {
      control: 'select',
      options: ['circle', 'square', 'rounded'],
      description: 'Forma del avatar.',
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'offline', 'away', 'busy'],
      description: 'Indicador de estado de presencia.',
    },
    bordered: {
      control: 'boolean',
      description: 'Mostrar borde alrededor del avatar.',
    },
    loading: {
      control: 'select',
      options: [false, true, 'lazy', 'eager'],
      description: 'Estado de carga. true = skeleton, lazy/eager = loading strategy.',
    },
    src: {
      control: 'text',
      description: 'URL de la imagen.',
    },
    name: {
      control: 'text',
      description: 'Nombre del usuario (genera iniciales como fallback).',
    },
    alt: {
      control: 'text',
      description: 'Texto alternativo para accesibilidad.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

// ─────────────────────────────────────────────────────────────────
// STORIES BÁSICAS
// ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    alt: 'Avatar de usuario',
    size: 'md',
  },
};

export const WithInitials: Story = {
  args: {
    name: 'María García',
    size: 'lg',
    variant: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Cuando no hay imagen, se muestran las iniciales del nombre.',
      },
    },
  },
};

export const WithStatus: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=2',
    name: 'Carlos López',
    status: 'online',
    size: 'lg',
  },
};

export const Placeholder: Story = {
  args: {
    size: 'xl',
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Sin imagen ni nombre, muestra un icono placeholder.',
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────────
// TAMAÑOS
// ─────────────────────────────────────────────────────────────────

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Avatar size="xs" name="A" />
      <Avatar size="sm" name="B" />
      <Avatar size="md" name="C" />
      <Avatar size="lg" name="D" />
      <Avatar size="xl" name="E" />
      <Avatar size="2xl" name="F" />
      <Avatar size="3xl" name="G" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Todos los tamaños disponibles. En mobile son +4px más grandes.',
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────────
// VARIANTES
// ─────────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Avatar name="Default" variant="default" size="lg" />
      <Avatar name="Primary" variant="primary" size="lg" />
      <Avatar name="Secondary" variant="secondary" size="lg" />
      <Avatar name="Success" variant="success" size="lg" />
      <Avatar name="Warning" variant="warning" size="lg" />
      <Avatar name="Error" variant="error" size="lg" />
      <Avatar name="Gradient" variant="gradient" size="lg" />
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────
// FORMAS
// ─────────────────────────────────────────────────────────────────

export const AllShapes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <Avatar name="Circle" shape="circle" size="xl" />
      <Avatar name="Rounded" shape="rounded" size="xl" />
      <Avatar name="Square" shape="square" size="xl" />
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────
// STATUS
// ─────────────────────────────────────────────────────────────────

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Avatar src="https://i.pravatar.cc/150?img=3" status="online" size="lg" />
      <Avatar src="https://i.pravatar.cc/150?img=4" status="away" size="lg" />
      <Avatar src="https://i.pravatar.cc/150?img=5" status="busy" size="lg" />
      <Avatar src="https://i.pravatar.cc/150?img=6" status="offline" size="lg" />
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────
// LOADING STATES
// ─────────────────────────────────────────────────────────────────

export const Loading: Story = {
  args: {
    loading: true,
    size: 'xl',
  },
  parameters: {
    docs: {
      description: {
        story: 'Estado de carga con skeleton shimmer animation.',
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────────
// COMPOUND COMPONENTS
// ─────────────────────────────────────────────────────────────────

export const Group: Story = {
  render: () => (
    <Avatar.Group max={4} spacing="compact" size="md">
      <Avatar src="https://i.pravatar.cc/150?img=10" name="User 1" />
      <Avatar src="https://i.pravatar.cc/150?img=11" name="User 2" />
      <Avatar src="https://i.pravatar.cc/150?img=12" name="User 3" />
      <Avatar src="https://i.pravatar.cc/150?img=13" name="User 4" />
      <Avatar src="https://i.pravatar.cc/150?img=14" name="User 5" />
      <Avatar src="https://i.pravatar.cc/150?img=15" name="User 6" />
    </Avatar.Group>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar.Group muestra múltiples avatares con overlap y contador de overflow.',
      },
    },
  },
};

export const WithBadge: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Avatar src="https://i.pravatar.cc/150?img=20" size="xl">
        <Avatar.Badge position="top-right" variant="error">3</Avatar.Badge>
      </Avatar>
      <Avatar src="https://i.pravatar.cc/150?img=21" size="xl">
        <Avatar.Badge position="bottom-right" variant="success">✓</Avatar.Badge>
      </Avatar>
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────
// INTERACTIVO
// ─────────────────────────────────────────────────────────────────

export const Clickable: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=30',
    size: 'lg',
    onClick: () => alert('Avatar clicked!'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Avatar clickeable con hover effect y focus ring.',
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────────
// RESPONSIVE
// ─────────────────────────────────────────────────────────────────

export const Responsive: Story = {
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', color: '#666' }}>
        Redimensiona la ventana para ver cómo cambian los tamaños en mobile vs desktop.
      </p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Avatar name="Mobile First" size="lg" variant="primary" />
        <Avatar name="Responsive" size="xl" variant="secondary" />
      </div>
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
```

---

## 13. SISTEMA DE THEMING Y FALLBACK A ROTTAY

### 13.1 Arquitectura de Theming

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE CARGA DE TEMA                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. App inicia                                                  │
│     │                                                           │
│     ▼                                                           │
│  2. ThemeProvider detecta tenant (URL, cookie, config)          │
│     │                                                           │
│     ▼                                                           │
│  3. Intenta cargar /themes/tenants/{tenant}/index.css           │
│     │                                                           │
│     ├──── ✅ Éxito ──► Aplica tema del tenant                   │
│     │                                                           │
│     └──── ❌ Error ──► 4. Fallback a tema Rottay                │
│                           │                                     │
│                           ▼                                     │
│                        5. Carga /themes/tenants/rottay/index.css│
│                           │                                     │
│                           ├──── ✅ Aplica tema Rottay           │
│                           │                                     │
│                           └──── ❌ Usa tokens inline hardcoded  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 13.2 ThemeProvider con Fallback

```typescript
// /packages/core/src/providers/theme/index.tsx

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

// ─────────────────────────────────────────────────────────────────
// CONFIGURACIÓN
// ─────────────────────────────────────────────────────────────────

/**
 * IMPORTANTE: Rottay es el tenant base y fallback.
 * Si cualquier otro tema falla al cargar, se usa Rottay.
 */
const DEFAULT_TENANT = 'rottay';
const THEME_LOAD_TIMEOUT = 5000; // 5 segundos máximo para cargar tema

// Tokens inline de Rottay para emergencia (si hasta el CSS de Rottay falla)
const ROTTAY_EMERGENCY_TOKENS = `
  :root {
    --color-primary-500: #0066CC;
    --color-secondary-500: #6B6BD4;
    --color-background: #FFFFFF;
    --color-text-primary: #171717;
    /* ... tokens mínimos para que la app funcione */
  }
`;

// ─────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────

export interface ThemeConfig {
  tenant: string;
  cssUrl: string;
  isLoaded: boolean;
  isError: boolean;
  isFallback: boolean;
}

export interface ThemeContextValue {
  /** Tenant actual */
  tenant: string;
  /** Cambiar tenant */
  setTenant: (tenant: string) => void;
  /** Configuración completa del tema */
  config: ThemeConfig;
  /** Si el tema está cargando */
  isLoading: boolean;
  /** Si hubo error y se está usando fallback */
  isFallback: boolean;
}

// ─────────────────────────────────────────────────────────────────
// CONTEXTO
// ─────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Hook para acceder al contexto del tema.
 *
 * @throws Error si se usa fuera de ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// ─────────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────────

export interface ThemeProviderProps {
  /** Tenant inicial */
  tenant?: string;
  /** Children */
  children: React.ReactNode;
  /**
   * Callback cuando hay error al cargar tema.
   * Permite logging/analytics.
   */
  onError?: (error: Error, tenant: string) => void;
  /**
   * Callback cuando se activa el fallback a Rottay.
   */
  onFallback?: (originalTenant: string) => void;
}

export function ThemeProvider({
  tenant: initialTenant = DEFAULT_TENANT,
  children,
  onError,
  onFallback,
}: ThemeProviderProps) {
  const [tenant, setTenantState] = useState(initialTenant);
  const [config, setConfig] = useState<ThemeConfig>({
    tenant: initialTenant,
    cssUrl: '',
    isLoaded: false,
    isError: false,
    isFallback: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Función para cargar CSS de un tenant
  const loadTenantCSS = useCallback(
    async (tenantName: string): Promise<boolean> => {
      const cssUrl = `/themes/tenants/${tenantName}/index.css`;

      return new Promise((resolve) => {
        // Timeout para evitar espera infinita
        const timeout = setTimeout(() => {
          console.warn(`[ThemeProvider] Timeout loading theme for ${tenantName}`);
          resolve(false);
        }, THEME_LOAD_TIMEOUT);

        // Crear link element
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssUrl;
        link.id = `theme-${tenantName}`;

        link.onload = () => {
          clearTimeout(timeout);
          console.log(`[ThemeProvider] Theme loaded for ${tenantName}`);
          resolve(true);
        };

        link.onerror = () => {
          clearTimeout(timeout);
          console.error(`[ThemeProvider] Failed to load theme for ${tenantName}`);
          resolve(false);
        };

        // Remover tema anterior si existe
        const existingLink = document.getElementById(`theme-${tenant}`);
        if (existingLink && existingLink !== link) {
          existingLink.remove();
        }

        document.head.appendChild(link);
      });
    },
    [tenant]
  );

  // Función para inyectar tokens de emergencia
  const injectEmergencyTokens = useCallback(() => {
    const styleId = 'rottay-emergency-tokens';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = ROTTAY_EMERGENCY_TOKENS;
      document.head.appendChild(style);
      console.warn('[ThemeProvider] Emergency tokens injected');
    }
  }, []);

  // Efecto para cargar tema
  useEffect(() => {
    let isMounted = true;

    async function loadTheme() {
      setIsLoading(true);

      // 1. Intentar cargar tema del tenant solicitado
      const tenantLoaded = await loadTenantCSS(tenant);

      if (!isMounted) return;

      if (tenantLoaded) {
        // Éxito: tema del tenant cargado
        setConfig({
          tenant,
          cssUrl: `/themes/tenants/${tenant}/index.css`,
          isLoaded: true,
          isError: false,
          isFallback: false,
        });
        setIsLoading(false);
        return;
      }

      // 2. Error: intentar fallback a Rottay
      if (tenant !== DEFAULT_TENANT) {
        console.warn(`[ThemeProvider] Falling back to ${DEFAULT_TENANT} theme`);
        onFallback?.(tenant);

        const rottayLoaded = await loadTenantCSS(DEFAULT_TENANT);

        if (!isMounted) return;

        if (rottayLoaded) {
          // Fallback exitoso
          setConfig({
            tenant: DEFAULT_TENANT,
            cssUrl: `/themes/tenants/${DEFAULT_TENANT}/index.css`,
            isLoaded: true,
            isError: true,
            isFallback: true,
          });
          setIsLoading(false);
          return;
        }
      }

      // 3. Todo falló: inyectar tokens de emergencia
      console.error('[ThemeProvider] All theme loading failed, using emergency tokens');
      injectEmergencyTokens();

      setConfig({
        tenant: DEFAULT_TENANT,
        cssUrl: '',
        isLoaded: false,
        isError: true,
        isFallback: true,
      });
      setIsLoading(false);

      onError?.(new Error('Failed to load any theme'), tenant);
    }

    loadTheme();

    return () => {
      isMounted = false;
    };
  }, [tenant, loadTenantCSS, injectEmergencyTokens, onError, onFallback]);

  // Función para cambiar tenant
  const setTenant = useCallback((newTenant: string) => {
    setTenantState(newTenant);
  }, []);

  // Valor del contexto
  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      tenant: config.tenant,
      setTenant,
      config,
      isLoading,
      isFallback: config.isFallback,
    }),
    [config, setTenant, isLoading]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 13.3 Tema Base de Rottay

```css
/* /packages/tokens/src/tenants/rottay/index.css */

/**
 * ═══════════════════════════════════════════════════════════════════
 * ROTTAY - TEMA BASE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Este es el tema por defecto del Design System.
 * TODOS los demás tenants heredan de este tema.
 * Si un tenant no define una variable, se usa el valor de Rottay.
 *
 * IMPORTANTE: Este tema SIEMPRE debe estar disponible como fallback.
 */

/* Importar tokens base */
@import '../../base/colors.css';
@import '../../base/spacing.css';
@import '../../base/typography.css';
@import '../../base/shadows.css';
@import '../../base/borders.css';
@import '../../base/z-index.css';

/* Importar tokens de componentes */
@import '../../components/avatar.css';
@import '../../components/button.css';
@import '../../components/input.css';
@import '../../components/card.css';
@import '../../components/modal.css';

/* Importar tokens responsive */
@import '../../responsive/avatar.css';
@import '../../responsive/button.css';

/* Importar animaciones */
@import '../../animations/transitions.css';
@import '../../animations/keyframes.css';
@import '../../animations/reduced-motion.css';

/* ─────────────────────────────────────────────────────────────────
   ROTTAY BRAND OVERRIDES
   Estos valores son específicos de la marca Rottay
   ─────────────────────────────────────────────────────────────────── */

:root {
  /* Rottay Brand Colors */
  --rottay-brand-primary: #0066CC;
  --rottay-brand-secondary: #6B6BD4;
  --rottay-brand-accent: #00CC99;

  /* Override primary con brand colors */
  --color-primary-500: var(--rottay-brand-primary);
  --color-secondary-500: var(--rottay-brand-secondary);

  /* Rottay específico: avatares con gradiente de marca */
  --avatar-gradient-bg: linear-gradient(
    135deg,
    var(--rottay-brand-primary) 0%,
    var(--rottay-brand-secondary) 50%,
    var(--rottay-brand-accent) 100%
  );
}
```

---

## 14. ESPECIFICACIONES DE TAREAS PARA AGENTES

### TAREA 1: Fix Engine Override

**Objetivo:** Permitir `<Button engine="hermes" />` para override de engine por componente.

**Archivos a modificar:**
1. `/packages/core/src/types/components/index.ts`
2. `/packages/core/src/system/engines/factory/index.tsx`

**Especificación detallada:**

```markdown
## TAREA: ENGINE-OVERRIDE-001

### Contexto
Actualmente el prop `engine` en componentes se ignora. Solo se lee del contexto global.

### Archivos a modificar

#### 1. `/packages/core/src/types/components/index.ts`

ANTES:
```typescript
export interface EngineAwareProps {
  className?: string;
  style?: CSSProperties;
}
```

DESPUÉS:
```typescript
import type { EngineName } from '../engines';

export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export interface EngineAwareProps extends BaseComponentProps {
  /** Override the engine for this component instance */
  engine?: EngineName;
}
```

#### 2. `/packages/core/src/system/engines/factory/index.tsx`

ANTES (líneas 69-78):
```typescript
const EngineRouter = (props: P) => {
  const { engine } = useEngineContext();
  const Component = components[engine];
  // ...
};
```

DESPUÉS:
```typescript
const EngineRouter = (props: P & { engine?: EngineName }) => {
  const context = useEngineContext();
  const activeEngine = props.engine || context.engine;  // Override via prop
  const Component = components[activeEngine];
  // ...
};
```

### Tests requeridos
- [ ] Test: `<Button engine="hermes" />` usa engine hermes aunque contexto sea titan
- [ ] Test: Sin prop engine, usa engine del contexto
- [ ] Test: Engine inválido en prop muestra warning y usa contexto
```

---

### TAREA 2: Implementar Error Boundary

**Objetivo:** Crear manejo de errores para carga de engines fallida.

**Archivos a crear/modificar:**
1. `/packages/core/src/system/engines/boundary/EngineErrorBoundary.tsx` (CREAR)
2. `/packages/core/src/system/engines/boundary/index.ts` (MODIFICAR)
3. `/packages/core/src/system/engines/factory/index.tsx` (MODIFICAR)

**Especificación detallada:**

```markdown
## TAREA: ERROR-BOUNDARY-001

### Archivos a crear

#### 1. `/packages/core/src/system/engines/boundary/EngineErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import type { EngineName } from '../../../types';

export interface EngineErrorBoundaryProps {
  children: ReactNode;
  fallbackEngine?: EngineName;
  fallbackRender?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class EngineErrorBoundary extends Component<EngineErrorBoundaryProps, State> {
  constructor(props: EngineErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[EngineErrorBoundary] Engine loading failed:', error);
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackRender && this.state.error) {
        return this.props.fallbackRender(this.state.error, this.reset);
      }
      return (
        <div
          style={{
            padding: '16px',
            color: '#dc2626',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '4px',
          }}
        >
          <strong>Engine Error:</strong> Failed to load component.
          {this.props.fallbackEngine && (
            <span> Attempting fallback to {this.props.fallbackEngine}...</span>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### 2. Actualizar `/packages/core/src/system/engines/boundary/index.ts`

```typescript
export { EngineErrorBoundary } from './EngineErrorBoundary';
export type { EngineErrorBoundaryProps } from './EngineErrorBoundary';
```

#### 3. Actualizar factory para usar error boundary

En `/packages/core/src/system/engines/factory/index.tsx`:

```typescript
import { EngineErrorBoundary } from '../boundary';

// En CreateEngineComponentOptions agregar:
export interface CreateEngineComponentOptions {
  fallback?: React.ReactNode;
  athenaEnabled?: boolean;
  fallbackEngine?: EngineName;  // NUEVO
  onError?: (error: Error) => void;  // NUEVO
}

// En EngineRouter envolver con error boundary:
return (
  <EngineErrorBoundary
    fallbackEngine={options.fallbackEngine}
    onError={options.onError}
  >
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  </EngineErrorBoundary>
);
```

### Tests requeridos
- [ ] Test: Componente renderiza normalmente sin error
- [ ] Test: Error en lazy load muestra fallback UI
- [ ] Test: onError callback se llama con el error
- [ ] Test: fallbackEngine intenta cargar engine alternativo
```

---

### TAREA 3: Reorganizar Hooks

**Objetivo:** Mover hooks de `/providers/` a `/hooks/` con naming correcto.

**Archivos a modificar:**
1. `/packages/core/src/system/hooks/engine/index.ts`
2. `/packages/core/src/system/hooks/theme/index.ts`
3. `/packages/core/src/system/hooks/features/index.ts`
4. `/packages/core/src/system/hooks/index.ts`

**Especificación detallada:**

```markdown
## TAREA: HOOKS-REORGANIZE-001

### Archivos a modificar

#### 1. `/packages/core/src/system/hooks/engine/index.ts`

ANTES:
```typescript
export {};
```

DESPUÉS:
```typescript
/**
 * Engine hook - Access and control the current UI engine
 */
import { useContext } from 'react';
import { EngineContext } from '../../providers/engine';
import type { EngineContextValue } from '../../../types';

/**
 * Hook to access the current engine context
 * @throws Error if used outside EngineProvider
 * @returns { engine: EngineName, setEngine: (engine) => void }
 */
export function useEngine(): EngineContextValue {
  const context = useContext(EngineContext);
  if (!context) {
    throw new Error('useEngine must be used within EngineProvider');
  }
  return context;
}

// Re-export for backwards compatibility
export { useEngine as useEngineContext };
```

#### 2. `/packages/core/src/system/hooks/theme/index.ts`

ANTES:
```typescript
export {};
```

DESPUÉS:
```typescript
/**
 * Theme hook - Access and control the current theme
 */
import { useContext } from 'react';
import { ThemeContext } from '../../providers/theme';
import type { ThemeContextValue } from '../../../types';

/**
 * Hook to access the current theme context
 * @throws Error if used outside ThemeProvider
 * @returns { theme: string, setTheme: (theme) => void, config: ThemeConfig | null }
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Re-export for backwards compatibility
export { useTheme as useThemeContext };
```

#### 3. `/packages/core/src/system/hooks/features/index.ts`

ANTES:
```typescript
export {};
```

DESPUÉS:
```typescript
/**
 * Feature hooks - Access feature flags and permissions
 */
import { useContext } from 'react';
import { FeatureContext } from '../../providers/features';

interface FeatureContextValue {
  features: string[];
  hasFeature: (feature: string) => boolean;
}

/**
 * Hook to access feature context
 * @throws Error if used outside FeatureProvider
 */
export function useFeatures(): FeatureContextValue {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeatures must be used within FeatureProvider');
  }
  return context;
}

/**
 * Ergonomic hook to check if a feature is enabled
 * @param feature - Feature name to check
 * @returns boolean - Whether the feature is enabled
 *
 * @example
 * if (useHasFeature('advanced-analytics')) {
 *   // Show advanced analytics
 * }
 */
export function useHasFeature(feature: string): boolean {
  const { hasFeature } = useFeatures();
  return hasFeature(feature);
}

// Re-export for backwards compatibility
export { useFeatures as useFeatureContext };
```

#### 4. `/packages/core/src/system/hooks/index.ts`

ANTES:
```typescript
export { useTenant } from './tenant';
export { useTokens } from './tokens';
```

DESPUÉS:
```typescript
/**
 * System hooks - All hooks for accessing design system state
 */

// Engine hooks
export { useEngine, useEngineContext } from './engine';

// Theme hooks
export { useTheme, useThemeContext } from './theme';

// Tenant hooks
export { useTenant } from './tenant';

// Token hooks
export { useTokens } from './tokens';

// Feature hooks
export { useFeatures, useHasFeature, useFeatureContext } from './features';
```

### Tests requeridos
- [ ] Test: useEngine retorna { engine, setEngine }
- [ ] Test: useEngine fuera de provider lanza error
- [ ] Test: useTheme retorna { theme, setTheme, config }
- [ ] Test: useHasFeature('feature') retorna boolean
- [ ] Test: useHasFeature con wildcard '*' retorna true
```

---

### TAREA 4: Restructurar Primitivos (Opción C con compound/)

**Objetivo:** Convertir primitivos al patrón CSS Variables con estructura `types/`, `base/`, `compound/`, `engines/`.

**Componente ejemplo: Avatar**

```markdown
## TAREA: PRIMITIVE-AVATAR-001

### Estructura final (con compound/)

```
/packages/core/src/components/primitives/display/Avatar/
├── types/
│   └── index.ts           ← AvatarProps, AvatarGroupProps, AvatarBadgeProps, etc.
├── base/
│   └── index.tsx          ← BaseAvatar con CSS Variables
├── compound/
│   ├── Group/
│   │   └── index.tsx      ← Avatar.Group
│   ├── Badge/
│   │   └── index.tsx      ← Avatar.Badge
│   ├── Fallback/
│   │   └── index.tsx      ← Avatar.Fallback
│   └── index.ts           ← Barrel export de compound/
├── engines/
│   ├── titan/
│   │   └── index.tsx      ← Adapter Ant Design
│   ├── hermes/
│   │   └── index.tsx      ← Adapter DaisyUI
│   ├── apollo/
│   │   └── index.tsx      ← Adapter Vanilla
│   └── index.ts           ← Barrel export de engines/
└── index.ts               ← Barrel principal + compound pattern
```

### Principios de implementación

1. ✅ Todo archivo termina en `index.ts` o `index.tsx`
2. ✅ La carpeta indica ubicación: `types/`, `base/`, `compound/`, `engines/`
3. ✅ Barrel exports en cada nivel
4. ✅ `compound/` contiene todos los subcomponentes
5. ✅ Cada subcomponente en su propia carpeta con `index.tsx`

### Archivos a crear (en orden)

1. `types/index.ts` - Todos los tipos TypeScript
2. `base/index.tsx` - Componente principal con CSS Variables
3. `compound/Group/index.tsx` - Avatar.Group
4. `compound/Badge/index.tsx` - Avatar.Badge
5. `compound/Fallback/index.tsx` - Avatar.Fallback
6. `compound/index.ts` - Barrel de compound
7. `engines/titan/index.tsx` - Adapter Ant Design
8. `engines/hermes/index.tsx` - Adapter DaisyUI
9. `engines/apollo/index.tsx` - Adapter Vanilla
10. `engines/index.ts` - Barrel de engines
11. `index.ts` - Barrel principal con compound pattern

### Ver implementación completa

Referencia: Sección "Implementación Detallada por Archivo" en Opción C arriba.

### Theme CSS requerido

Crear `/packages/tokens/src/components/avatar.css` con:
- Variables de tamaño: `--avatar-{size}-size`, `--avatar-{size}-font-size`
- Variables de forma: `--avatar-{shape}-radius`
- Variables de variante: `--avatar-{variant}-bg`, `--avatar-{variant}-color`
- Variables de status: `--avatar-status-{status}-color`
- Variables de grupo: `--avatar-group-{spacing}-spacing`
- Variables de badge: `--avatar-badge-*`

### Tests requeridos
- [ ] Test: Avatar renderiza con src
- [ ] Test: Avatar renderiza con name (genera iniciales)
- [ ] Test: Avatar size="lg" aplica clase primitive-avatar--lg
- [ ] Test: Avatar variant="primary" aplica CSS Variable --avatar-primary-bg
- [ ] Test: Avatar status="online" muestra indicador con color correcto
- [ ] Test: Avatar onClick dispara callback
- [ ] Test: Avatar data-testid se aplica correctamente
- [ ] Test: Avatar.Group muestra max avatares + overflow count
- [ ] Test: Avatar.Group aplica size a todos los hijos
- [ ] Test: Avatar.Badge renderiza en posición correcta
- [ ] Test: Avatar.Fallback respeta delayMs
- [ ] Test: Compound pattern funciona: Avatar.Group, Avatar.Badge, Avatar.Fallback
```

---

### TAREA 5: Renombrar composed → custom

**Objetivo:** Cambiar el nombre del directorio y todas las referencias.

```markdown
## TAREA: RENAME-COMPOSED-001

### Archivos a modificar

1. Renombrar directorio:
   - `/packages/core/src/components/composed/` → `/packages/core/src/components/custom/`

2. Actualizar imports en:
   - `/packages/core/src/components/index.ts`
   - `/packages/core/src/index.ts`
   - Cualquier archivo que importe de `composed/`

3. Actualizar barrel exports:

   `/packages/core/src/components/index.ts`:
   ```typescript
   // ANTES
   export * from './composed';

   // DESPUÉS
   export * from './custom';
   ```

4. Verificar que no hay referencias hardcodeadas a "composed" en:
   - Storybook configs
   - Test files
   - Documentation

### Comandos de verificación
```bash
# Buscar referencias a "composed"
grep -r "composed" packages/core/src/
grep -r "composed" packages/core/*.json
```

### Tests requeridos
- [ ] Build compila sin errores
- [ ] Imports funcionan: `import { X } from '@rottay/custom'`
```

---

## 15. CHECKLIST DE MIGRACIÓN

### 15.1 Pre-Migración

```markdown
## Checklist Pre-Migración

### Análisis del Componente Existente
- [ ] Identificar todas las props actuales del componente
- [ ] Documentar variantes existentes (size, variant, etc.)
- [ ] Listar todos los lugares donde se usa el componente
- [ ] Revisar tests existentes que cubren el componente
- [ ] Identificar dependencias externas (Ant Design, DaisyUI, etc.)
- [ ] Documentar comportamientos edge case

### Diseño de la Migración
- [ ] Mapear props existentes a nueva interfaz de tipos
- [ ] Definir qué props son nuevas vs heredadas
- [ ] Identificar breaking changes potenciales
- [ ] Planificar estrategia de backwards compatibility (si aplica)
- [ ] Diseñar CSS tokens necesarios para el componente
```

### 15.2 Durante la Migración

```markdown
## Checklist Durante Migración

### Estructura de Archivos
- [ ] Crear carpeta del componente en /primitives/{category}/
- [ ] Crear subcarpeta types/ con index.ts
- [ ] Crear subcarpeta base/ con index.tsx
- [ ] Crear subcarpeta engines/ con index.ts barrel
- [ ] Crear engines/titan/index.tsx
- [ ] Crear engines/hermes/index.tsx
- [ ] Crear engines/apollo/index.tsx
- [ ] Crear index.ts barrel principal
- [ ] (Si aplica) Crear carpeta compound/ para subcomponentes

### Tipos (types/index.ts)
- [ ] Exportar interfaz {Component}Props
- [ ] Exportar interfaz {Component}Ref
- [ ] Exportar tipos de variantes (size, variant, shape, etc.)
- [ ] Incluir props de accesibilidad (aria-*, role, etc.)
- [ ] Incluir props responsive (breakpointProps)
- [ ] Documentar cada prop con JSDoc

### Base Component (base/index.tsx)
- [ ] Implementar con forwardRef
- [ ] Usar CSS Variables para estilos
- [ ] Implementar lógica compartida entre engines
- [ ] Manejar estados (loading, error, disabled)
- [ ] Implementar responsive behavior
- [ ] Agregar data-testid para testing
- [ ] Agregar manejo de className para extensibilidad

### Engines
- [ ] Titan: Usar componentes de Ant Design
- [ ] Titan: Mapear props a API de Ant Design
- [ ] Hermes: Usar clases de DaisyUI/Tailwind
- [ ] Hermes: Asegurar que CSS Variables overridean estilos
- [ ] Apollo: Implementar con HTML semántico puro
- [ ] Apollo: Usar solo CSS Variables para estilos
- [ ] Todos: Mismo comportamiento, diferente implementación

### CSS Tokens
- [ ] Agregar tokens en /packages/tokens/src/components/{component}.css
- [ ] Definir tokens para cada tamaño
- [ ] Definir tokens para cada variante
- [ ] Definir tokens para estados (hover, active, focus, disabled)
- [ ] Agregar tokens responsive en /packages/tokens/src/responsive/
- [ ] Documentar cada token con comentarios

### Compound Components (si aplica)
- [ ] Crear Context para comunicación padre-hijo
- [ ] Implementar hook use{Component}Context
- [ ] Cada subcomponente en compound/{SubComponent}/index.tsx
- [ ] Barrel export en compound/index.ts
- [ ] Attachear subcomponentes al componente principal
```

### 15.3 Post-Migración

```markdown
## Checklist Post-Migración

### Testing
- [ ] Unit tests para base component
- [ ] Unit tests para cada engine
- [ ] Unit tests para compound components
- [ ] Tests de accesibilidad (jest-axe)
- [ ] Tests de responsive behavior
- [ ] Tests de integración con ThemeProvider
- [ ] Tests de snapshot (opcional)

### Storybook
- [ ] Story para cada variante
- [ ] Story para cada tamaño
- [ ] Story para estados (loading, error, disabled)
- [ ] Story de accesibilidad
- [ ] Story responsive/mobile
- [ ] Args controls funcionando
- [ ] Documentación MDX

### Documentación
- [ ] JSDoc completo en tipos
- [ ] Ejemplos de uso en cada engine
- [ ] Guía de migración si hay breaking changes
- [ ] Actualizar README del paquete

### Integración
- [ ] Actualizar barrel exports del paquete
- [ ] Verificar tree-shaking funciona
- [ ] Verificar imports funcionan: import { X } from '@rottay/primitives'
- [ ] Probar con tema Rottay
- [ ] Probar fallback de tema
- [ ] Build compila sin errores
- [ ] No hay TypeScript errors
```

### 15.4 Template de Migración

```markdown
## Migración de {ComponentName}

**Fecha inicio:** ____
**Responsable:** ____
**Complejidad:** [ ] Baja  [ ] Media  [ ] Alta

### Estado

| Paso | Estado | Notas |
|------|--------|-------|
| Pre-migración | ⬜ | |
| Estructura archivos | ⬜ | |
| types/index.ts | ⬜ | |
| base/index.tsx | ⬜ | |
| engines/titan | ⬜ | |
| engines/hermes | ⬜ | |
| engines/apollo | ⬜ | |
| CSS tokens | ⬜ | |
| compound/ (si aplica) | ⬜ | |
| Unit tests | ⬜ | |
| Storybook | ⬜ | |
| Documentación | ⬜ | |
| Review | ⬜ | |

### Notas de Migración
<!-- Agregar cualquier decisión o problema encontrado -->

### Breaking Changes
<!-- Listar cambios que rompen compatibilidad -->

### Dependencias Nuevas
<!-- Listar si se agregaron dependencias -->
```

---

## 16. ORDEN DE IMPLEMENTACIÓN

### Leyenda de Complejidad
- 🟢 **Baja**: Cambios menores, poco riesgo, pocas dependencias
- 🟡 **Media**: Requiere atención, algunas dependencias, testing necesario
- 🔴 **Alta**: Cambios significativos, muchas dependencias, requiere review

### Fase 1: Fixes Críticos

| # | Tarea | Dependencias | Complejidad |
|---|-------|--------------|-------------|
| 1 | ENGINE-OVERRIDE-001 | Ninguna | 🟢 Baja |
| 2 | ERROR-BOUNDARY-001 | Ninguna | 🟡 Media |
| 3 | HOOKS-REORGANIZE-001 | Ninguna | 🟢 Baja |
| 4 | BaseComponentProps fix | Ninguna | 🟢 Baja |

### Fase 2: Restructuración

| # | Tarea | Dependencias | Complejidad |
|---|-------|--------------|-------------|
| 5 | RENAME-COMPOSED-001 | Fase 1 | 🟢 Baja |
| 6 | PRIMITIVE-AVATAR-001 | Fase 1 | 🟡 Media |
| 7 | Crear theme CSS base (Rottay) | Fase 1 | 🟡 Media |
| 8 | Migrar Button al nuevo patrón | 6, 7 | 🟡 Media |
| 9 | Migrar Badge, Card | 6, 7 | 🟡 Media |

### Fase 3: Completar Primitivos

| # | Tarea | Dependencias | Complejidad |
|---|-------|--------------|-------------|
| 10 | Inputs: TextField, Select | Fase 2 | 🔴 Alta |
| 11 | Inputs: Checkbox, Radio, Toggle | Fase 2 | 🟡 Media |
| 12 | Feedback: Dialog, Toast, Skeleton | Fase 2 | 🔴 Alta |
| 13 | Display: Image, Tag, Tooltip | Fase 2 | 🟡 Media |
| 14 | Navigation: Menu, Stepper | Fase 2 | 🟡 Media |

### Fase 4: Testing & Docs

| # | Tarea | Dependencias | Complejidad |
|---|-------|--------------|-------------|
| 15 | Tests para todos los primitivos | Fase 3 | 🔴 Alta |
| 16 | Storybook stories | Fase 3 | 🟡 Media |
| 17 | Documentación final | Todo | 🟡 Media |

### Priorización por Impacto

```
┌─────────────────────────────────────────────────────────────┐
│  IMPACTO ALTO                                               │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ Avatar (Template)   │  │ Button              │          │
│  │ Complejidad: Media  │  │ Complejidad: Media  │          │
│  │ Uso: Muy frecuente  │  │ Uso: Muy frecuente  │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                             │
│  IMPACTO MEDIO                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Input    │  │ Select   │  │ Card     │  │ Badge    │   │
│  │ 🔴 Alta  │  │ 🔴 Alta  │  │ 🟡 Media │  │ 🟢 Baja  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
│  IMPACTO BAJO (pero necesarios)                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ Tooltip  │  │ Tag      │  │ Divider  │                 │
│  │ 🟢 Baja  │  │ 🟢 Baja  │  │ 🟢 Baja  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### Orden Recomendado de Migración

1. **Avatar** - Sirve como template/ejemplo para los demás
2. **Button** - Muy usado, valida el patrón con otro componente
3. **Badge** - Simple, refuerza el patrón
4. **Card** - Contenedor común, compound component
5. **Input/TextField** - Complejo, muchos estados
6. **Select** - Muy complejo, requiere dropdown behavior
7. **Modal/Dialog** - Portal, overlay, trap focus
8. **Toast** - Notificaciones, animaciones
9. **Resto** - Según necesidad del proyecto

---

## 17. ICONOGRAFÍA Y ASSETS

### 17.1 Sistema de Iconos

```
/packages/icons/
├── src/
│   ├── svg/                        ← SVGs originales
│   │   ├── user.svg
│   │   ├── users.svg
│   │   ├── camera.svg
│   │   ├── check.svg
│   │   ├── x.svg
│   │   └── ...
│   │
│   ├── components/                 ← Componentes React generados
│   │   ├── UserIcon/
│   │   │   └── index.tsx
│   │   ├── UsersIcon/
│   │   │   └── index.tsx
│   │   └── index.ts               ← Barrel export
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   └── index.ts                   ← Export principal
│
├── scripts/
│   └── generate-icons.ts          ← Script para generar componentes desde SVG
│
└── package.json
```

### 17.2 Tipos de Iconos

```typescript
// /packages/icons/src/types/index.ts

import type { SVGProps, ForwardRefExoticComponent, RefAttributes } from 'react';

/**
 * Props base para todos los iconos del sistema Rottay.
 */
export interface IconProps extends SVGProps<SVGSVGElement> {
  /**
   * Tamaño del icono. Puede ser un valor predefinido o un número en pixels.
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

  /**
   * Color del icono. Usa 'currentColor' para heredar del padre.
   * @default 'currentColor'
   */
  color?: string;

  /**
   * Título para accesibilidad. Si se proporciona, el icono será visible para screen readers.
   */
  title?: string;

  /**
   * Si el icono es puramente decorativo (no necesita ser anunciado por screen readers).
   * @default true
   */
  decorative?: boolean;
}

/**
 * Tipo para un componente de icono del sistema.
 */
export type IconComponent = ForwardRefExoticComponent<
  IconProps & RefAttributes<SVGSVGElement>
>;

/**
 * Mapeo de tamaños a pixels.
 */
export const ICON_SIZE_MAP: Record<string, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};
```

### 17.3 Componente Base de Icono

```typescript
// /packages/icons/src/components/BaseIcon/index.tsx
'use client';

import React, { forwardRef } from 'react';
import type { IconProps } from '../../types';
import { ICON_SIZE_MAP } from '../../types';

/**
 * Componente base para crear iconos del sistema Rottay.
 * Todos los iconos generados extienden este componente.
 */
export const BaseIcon = forwardRef<SVGSVGElement, IconProps & { children: React.ReactNode }>(
  (
    {
      size = 'md',
      color = 'currentColor',
      title,
      decorative = true,
      className = '',
      style,
      children,
      ...props
    },
    ref
  ) => {
    const sizeValue = typeof size === 'number' ? size : ICON_SIZE_MAP[size] || 20;

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={sizeValue}
        height={sizeValue}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`rottay-icon ${className}`}
        style={style}
        aria-hidden={decorative && !title}
        aria-label={title}
        role={title ? 'img' : undefined}
        {...props}
      >
        {title && <title>{title}</title>}
        {children}
      </svg>
    );
  }
);

BaseIcon.displayName = 'BaseIcon';
```

### 17.4 Ejemplo de Icono Generado

```typescript
// /packages/icons/src/components/UserIcon/index.tsx
'use client';

import React, { forwardRef } from 'react';
import { BaseIcon } from '../BaseIcon';
import type { IconProps } from '../../types';

/**
 * Icono de usuario - usado como fallback en Avatar.
 */
export const UserIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </BaseIcon>
));

UserIcon.displayName = 'UserIcon';
```

### 17.5 Uso en Avatar

```typescript
// Dentro de Avatar/base/index.tsx
import { UserIcon } from '@rottay/icons';

// Fallback cuando no hay imagen ni iniciales
const renderFallback = () => (
  <UserIcon
    size={size}
    color="var(--avatar-placeholder-icon-color)"
    decorative
    style={{ opacity: 'var(--avatar-placeholder-icon-opacity)' }}
  />
);
```

---

## 18. ERROR HANDLING PATTERNS

### 18.1 Tipos de Errores

```typescript
// /packages/core/src/errors/types/index.ts

/**
 * Categorías de errores en el Design System Rottay.
 */
export enum ErrorCategory {
  /** Error al cargar assets (imágenes, fuentes, etc.) */
  ASSET_LOAD = 'ASSET_LOAD',
  /** Error al cargar o aplicar tema */
  THEME = 'THEME',
  /** Error en engine de UI */
  ENGINE = 'ENGINE',
  /** Error de validación de props */
  VALIDATION = 'VALIDATION',
  /** Error de red */
  NETWORK = 'NETWORK',
  /** Error desconocido */
  UNKNOWN = 'UNKNOWN',
}

/**
 * Niveles de severidad.
 */
export enum ErrorSeverity {
  /** Información, no afecta funcionalidad */
  INFO = 'INFO',
  /** Advertencia, funcionalidad degradada pero usable */
  WARNING = 'WARNING',
  /** Error, funcionalidad no disponible pero app funciona */
  ERROR = 'ERROR',
  /** Crítico, app no puede continuar */
  CRITICAL = 'CRITICAL',
}

/**
 * Estructura base de error del Design System.
 */
export interface DSError {
  /** Código único del error */
  code: string;
  /** Mensaje legible para usuarios */
  message: string;
  /** Mensaje técnico para debugging */
  technicalMessage?: string;
  /** Categoría del error */
  category: ErrorCategory;
  /** Severidad */
  severity: ErrorSeverity;
  /** Componente donde ocurrió */
  component?: string;
  /** Metadata adicional */
  metadata?: Record<string, unknown>;
  /** Timestamp */
  timestamp: Date;
  /** Error original si existe */
  originalError?: Error;
}
```

### 18.2 Error Handler Central

```typescript
// /packages/core/src/errors/handler/index.ts

import type { DSError, ErrorCategory, ErrorSeverity } from '../types';

type ErrorCallback = (error: DSError) => void;

/**
 * Handler central de errores del Design System Rottay.
 * Permite registrar callbacks para diferentes tipos de errores.
 */
class ErrorHandler {
  private callbacks: Map<ErrorCategory | 'all', Set<ErrorCallback>> = new Map();
  private errorLog: DSError[] = [];
  private maxLogSize = 100;

  /**
   * Registra un callback para un tipo de error específico o todos.
   */
  subscribe(category: ErrorCategory | 'all', callback: ErrorCallback): () => void {
    if (!this.callbacks.has(category)) {
      this.callbacks.set(category, new Set());
    }
    this.callbacks.get(category)!.add(callback);

    // Retorna función para unsubscribe
    return () => {
      this.callbacks.get(category)?.delete(callback);
    };
  }

  /**
   * Reporta un error al sistema.
   */
  report(error: Omit<DSError, 'timestamp'>): void {
    const fullError: DSError = {
      ...error,
      timestamp: new Date(),
    };

    // Agregar al log
    this.errorLog.push(fullError);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Notificar callbacks específicos
    this.callbacks.get(error.category)?.forEach((cb) => cb(fullError));

    // Notificar callbacks globales
    this.callbacks.get('all')?.forEach((cb) => cb(fullError));

    // Log a consola en desarrollo
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(fullError);
    }
  }

  /**
   * Obtiene el log de errores recientes.
   */
  getErrorLog(): readonly DSError[] {
    return Object.freeze([...this.errorLog]);
  }

  /**
   * Limpia el log de errores.
   */
  clearLog(): void {
    this.errorLog = [];
  }

  private logToConsole(error: DSError): void {
    const prefix = `[Rottay DS] [${error.category}]`;

    switch (error.severity) {
      case 'CRITICAL':
      case 'ERROR':
        console.error(prefix, error.message, error);
        break;
      case 'WARNING':
        console.warn(prefix, error.message, error);
        break;
      default:
        console.info(prefix, error.message, error);
    }
  }
}

// Singleton
export const errorHandler = new ErrorHandler();
```

### 18.3 Hook useErrorHandler

```typescript
// /packages/core/src/errors/hooks/index.ts
'use client';

import { useEffect, useCallback } from 'react';
import { errorHandler } from '../handler';
import type { DSError, ErrorCategory } from '../types';

/**
 * Hook para manejar errores del Design System.
 *
 * @example
 * const { reportError, errors } = useErrorHandler({
 *   category: 'ASSET_LOAD',
 *   onError: (error) => console.log('Asset error:', error),
 * });
 */
export function useErrorHandler(options?: {
  category?: ErrorCategory | 'all';
  onError?: (error: DSError) => void;
}) {
  const { category = 'all', onError } = options || {};

  useEffect(() => {
    if (onError) {
      return errorHandler.subscribe(category, onError);
    }
  }, [category, onError]);

  const reportError = useCallback(
    (error: Omit<DSError, 'timestamp' | 'category'> & { category?: ErrorCategory }) => {
      errorHandler.report({
        category: error.category || 'UNKNOWN',
        ...error,
      } as Omit<DSError, 'timestamp'>);
    },
    []
  );

  return {
    reportError,
    getErrorLog: errorHandler.getErrorLog.bind(errorHandler),
    clearLog: errorHandler.clearLog.bind(errorHandler),
  };
}
```

### 18.4 Ejemplo: Manejo de Error en Avatar

```typescript
// Dentro de Avatar/base/index.tsx
import { useErrorHandler } from '@rottay/core/errors';
import { ErrorCategory, ErrorSeverity } from '@rottay/core/errors/types';

export const BaseAvatar = forwardRef<HTMLDivElement, AvatarProps>((props, ref) => {
  const { src, alt, name, onError } = props;
  const [imageError, setImageError] = useState(false);
  const { reportError } = useErrorHandler();

  const handleImageError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      setImageError(true);

      // Reportar al sistema de errores
      reportError({
        code: 'AVATAR_IMAGE_LOAD_FAILED',
        message: `Failed to load avatar image for ${name || 'unknown user'}`,
        technicalMessage: `Image src: ${src}`,
        category: ErrorCategory.ASSET_LOAD,
        severity: ErrorSeverity.WARNING,
        component: 'Avatar',
        metadata: { src, alt, name },
      });

      // Llamar callback del usuario
      onError?.(event);
    },
    [src, alt, name, onError, reportError]
  );

  // ... resto del componente
});
```

### 18.5 Códigos de Error Estándar

```typescript
// /packages/core/src/errors/codes/index.ts

/**
 * Códigos de error estándar del Design System Rottay.
 */
export const ERROR_CODES = {
  // Asset Loading
  AVATAR_IMAGE_LOAD_FAILED: 'AVATAR_IMAGE_LOAD_FAILED',
  ICON_LOAD_FAILED: 'ICON_LOAD_FAILED',
  FONT_LOAD_FAILED: 'FONT_LOAD_FAILED',

  // Theme
  THEME_LOAD_FAILED: 'THEME_LOAD_FAILED',
  THEME_INVALID_FORMAT: 'THEME_INVALID_FORMAT',
  THEME_FALLBACK_USED: 'THEME_FALLBACK_USED',

  // Engine
  ENGINE_NOT_FOUND: 'ENGINE_NOT_FOUND',
  ENGINE_RENDER_FAILED: 'ENGINE_RENDER_FAILED',
  ENGINE_FALLBACK_USED: 'ENGINE_FALLBACK_USED',

  // Validation
  INVALID_PROP_VALUE: 'INVALID_PROP_VALUE',
  REQUIRED_PROP_MISSING: 'REQUIRED_PROP_MISSING',
  DEPRECATED_PROP_USED: 'DEPRECATED_PROP_USED',

  // Network
  API_REQUEST_FAILED: 'API_REQUEST_FAILED',
  TIMEOUT: 'TIMEOUT',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
```

---

## 19. PERFORMANCE

### 19.1 Memoization Patterns

```typescript
// /packages/core/src/utils/memoization/index.ts

import { useMemo, useCallback, memo, useRef, useEffect } from 'react';

/**
 * Comparador profundo para props de componentes.
 * Evita re-renders innecesarios en componentes con objetos como props.
 */
export function arePropsEqual<P extends object>(
  prevProps: Readonly<P>,
  nextProps: Readonly<P>
): boolean {
  const prevKeys = Object.keys(prevProps) as (keyof P)[];
  const nextKeys = Object.keys(nextProps) as (keyof P)[];

  if (prevKeys.length !== nextKeys.length) return false;

  return prevKeys.every((key) => {
    const prevValue = prevProps[key];
    const nextValue = nextProps[key];

    // Comparación directa para primitivos
    if (prevValue === nextValue) return true;

    // Para funciones, comparar por referencia (ya deberían estar memoizadas)
    if (typeof prevValue === 'function' && typeof nextValue === 'function') {
      return prevValue === nextValue;
    }

    // Para objetos y arrays, comparación superficial
    if (typeof prevValue === 'object' && typeof nextValue === 'object') {
      if (prevValue === null || nextValue === null) return prevValue === nextValue;
      return JSON.stringify(prevValue) === JSON.stringify(nextValue);
    }

    return false;
  });
}

/**
 * Hook para crear estilos memoizados basados en props.
 */
export function useMemoizedStyles<T extends Record<string, unknown>>(
  styleFactory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(styleFactory, deps);
}

/**
 * Hook para throttle de callbacks (útil para resize, scroll).
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);
  const lastArgs = useRef<Parameters<T>>();

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      lastArgs.current = args;

      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callback(...args);
      }
    }) as T,
    [callback, delay]
  );
}
```

### 19.2 Lazy Loading de Engines

```typescript
// /packages/core/src/system/engines/lazy/index.ts
'use client';

import React, { lazy, Suspense, ComponentType } from 'react';

/**
 * Mapa de engines lazy-loaded.
 * Los engines se cargan solo cuando son necesarios.
 */
const engineLoaders = {
  titan: () => import('../titan').then((m) => ({ default: m.TitanEngine })),
  hermes: () => import('../hermes').then((m) => ({ default: m.HermesEngine })),
  apollo: () => import('../apollo').then((m) => ({ default: m.ApolloEngine })),
} as const;

type EngineName = keyof typeof engineLoaders;

/**
 * Caché de engines ya cargados.
 */
const engineCache = new Map<EngineName, ComponentType<unknown>>();

/**
 * Obtiene un engine de forma lazy.
 * Usa caché para evitar múltiples imports del mismo engine.
 */
export function getLazyEngine<P>(engineName: EngineName): React.LazyExoticComponent<ComponentType<P>> {
  if (!engineCache.has(engineName)) {
    const LazyEngine = lazy(engineLoaders[engineName] as () => Promise<{ default: ComponentType<P> }>);
    engineCache.set(engineName, LazyEngine as ComponentType<unknown>);
  }
  return engineCache.get(engineName) as React.LazyExoticComponent<ComponentType<P>>;
}

/**
 * Skeleton de carga para engines.
 */
export const EngineSkeleton: React.FC<{ width?: number; height?: number }> = ({
  width = 40,
  height = 40,
}) => (
  <div
    className="rottay-engine-skeleton"
    style={{
      width,
      height,
      backgroundColor: 'var(--avatar-skeleton-bg)',
      borderRadius: 'var(--avatar-circle-radius)',
      animation: 'pulse var(--avatar-skeleton-animation-duration) infinite',
    }}
  />
);

/**
 * Wrapper para engines con Suspense.
 */
export function withLazyEngine<P extends object>(
  engineName: EngineName,
  fallback?: React.ReactNode
): React.FC<P> {
  const LazyEngine = getLazyEngine<P>(engineName);

  return function LazyEngineWrapper(props: P) {
    return (
      <Suspense fallback={fallback || <EngineSkeleton />}>
        <LazyEngine {...props} />
      </Suspense>
    );
  };
}
```

### 19.3 Bundle Size Guidelines

```markdown
## Guías de Tamaño de Bundle

### Presupuestos por Paquete

| Paquete | Tamaño Max (gzip) | Notas |
|---------|-------------------|-------|
| @rottay/primitives | 50KB | Core primitives |
| @rottay/tokens | 10KB | CSS Variables |
| @rottay/icons | 20KB (tree-shakeable) | Solo iconos usados |
| @rottay/core | 15KB | Utils, hooks, types |

### Reglas para Mantener Bundle Pequeño

1. **Tree-shaking**: Todos los exports deben ser named exports
   ```typescript
   // ✅ Correcto
   export { Avatar } from './Avatar';
   export { Button } from './Button';

   // ❌ Incorrecto
   export default { Avatar, Button };
   ```

2. **Lazy Loading**: Engines deben cargarse solo cuando se usan
   ```typescript
   // El engine hermes solo se carga si el tenant usa DaisyUI
   const HermesAvatar = withLazyEngine('hermes');
   ```

3. **Evitar dependencias grandes**:
   - ❌ No importar lodash completo
   - ✅ Usar `lodash-es/debounce` o implementar manualmente

4. **CSS-in-JS vs CSS Variables**:
   - Preferir CSS Variables (0 runtime)
   - Evitar styled-components/emotion si es posible

5. **Iconos**:
   - Cada icono debe ser un módulo separado
   - Usar SVGR para generar componentes optimizados
```

### 19.4 Métricas de Performance

```typescript
// /packages/core/src/utils/performance/index.ts
'use client';

/**
 * Mide el tiempo de render de un componente.
 * Solo activo en desarrollo.
 */
export function measureRender(componentName: string): () => void {
  if (process.env.NODE_ENV !== 'development') {
    return () => {};
  }

  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 16) {
      // Más de 1 frame a 60fps
      console.warn(
        `[Rottay Performance] ${componentName} took ${duration.toFixed(2)}ms to render`
      );
    }
  };
}

/**
 * Hook para medir re-renders.
 */
export function useRenderCount(componentName: string): void {
  const renderCount = React.useRef(0);

  React.useEffect(() => {
    renderCount.current += 1;

    if (process.env.NODE_ENV === 'development' && renderCount.current > 10) {
      console.warn(
        `[Rottay Performance] ${componentName} has rendered ${renderCount.current} times`
      );
    }
  });
}
```

---

## 20. BARREL EXPORTS COMPLETOS

### 20.1 Tokens Barrel

```css
/* /packages/tokens/src/index.css */

/**
 * ROTTAY DESIGN SYSTEM - TOKENS
 *
 * Este archivo importa todos los tokens del sistema.
 * Importar este archivo aplica todos los estilos base.
 *
 * Uso:
 * @import '@rottay/tokens';
 */

/* ═══════════════════════════════════════════════════════════════
   BASE TOKENS
   ═══════════════════════════════════════════════════════════════ */
@import './base/colors.css';
@import './base/spacing.css';
@import './base/typography.css';
@import './base/shadows.css';
@import './base/borders.css';
@import './base/z-index.css';

/* ═══════════════════════════════════════════════════════════════
   COMPONENT TOKENS
   ═══════════════════════════════════════════════════════════════ */
@import './components/avatar.css';
@import './components/button.css';
@import './components/input.css';
@import './components/card.css';
@import './components/modal.css';
@import './components/badge.css';
@import './components/tooltip.css';
@import './components/select.css';

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE OVERRIDES
   ═══════════════════════════════════════════════════════════════ */
@import './responsive/avatar.css';
@import './responsive/button.css';
@import './responsive/input.css';
@import './responsive/modal.css';

/* ═══════════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */
@import './animations/transitions.css';
@import './animations/keyframes.css';

/* ═══════════════════════════════════════════════════════════════
   TENANT: ROTTAY (BASE)
   Este tema se carga siempre como fallback.
   ═══════════════════════════════════════════════════════════════ */
@import './tenants/rottay/index.css';
```

### 20.2 Primitives Barrel

```typescript
// /packages/primitives/src/index.ts

/**
 * ROTTAY DESIGN SYSTEM - PRIMITIVES
 *
 * Exports principales de todos los primitivos del sistema.
 *
 * Uso:
 * import { Avatar, Button, Card } from '@rottay/primitives';
 */

// ═══════════════════════════════════════════════════════════════
// DISPLAY
// ═══════════════════════════════════════════════════════════════
export { Avatar } from './display/Avatar';
export type { AvatarProps, AvatarGroupProps, AvatarBadgeProps } from './display/Avatar/types';

export { Badge } from './display/Badge';
export type { BadgeProps } from './display/Badge/types';

export { Image } from './display/Image';
export type { ImageProps } from './display/Image/types';

export { Tag } from './display/Tag';
export type { TagProps } from './display/Tag/types';

// ═══════════════════════════════════════════════════════════════
// INPUTS
// ═══════════════════════════════════════════════════════════════
export { Button } from './inputs/Button';
export type { ButtonProps } from './inputs/Button/types';

export { TextField } from './inputs/TextField';
export type { TextFieldProps } from './inputs/TextField/types';

export { Select } from './inputs/Select';
export type { SelectProps, SelectOptionProps } from './inputs/Select/types';

export { Checkbox } from './inputs/Checkbox';
export type { CheckboxProps } from './inputs/Checkbox/types';

export { Radio } from './inputs/Radio';
export type { RadioProps, RadioGroupProps } from './inputs/Radio/types';

export { Toggle } from './inputs/Toggle';
export type { ToggleProps } from './inputs/Toggle/types';

// ═══════════════════════════════════════════════════════════════
// FEEDBACK
// ═══════════════════════════════════════════════════════════════
export { Modal } from './feedback/Modal';
export type { ModalProps } from './feedback/Modal/types';

export { Toast } from './feedback/Toast';
export type { ToastProps } from './feedback/Toast/types';

export { Skeleton } from './feedback/Skeleton';
export type { SkeletonProps } from './feedback/Skeleton/types';

export { Spinner } from './feedback/Spinner';
export type { SpinnerProps } from './feedback/Spinner/types';

// ═══════════════════════════════════════════════════════════════
// LAYOUT
// ═══════════════════════════════════════════════════════════════
export { Card } from './layout/Card';
export type { CardProps } from './layout/Card/types';

export { Divider } from './layout/Divider';
export type { DividerProps } from './layout/Divider/types';

// ═══════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════
export { Menu } from './navigation/Menu';
export type { MenuProps, MenuItemProps } from './navigation/Menu/types';

export { Stepper } from './navigation/Stepper';
export type { StepperProps, StepProps } from './navigation/Stepper/types';

// ═══════════════════════════════════════════════════════════════
// OVERLAY
// ═══════════════════════════════════════════════════════════════
export { Tooltip } from './overlay/Tooltip';
export type { TooltipProps } from './overlay/Tooltip/types';

export { Dropdown } from './overlay/Dropdown';
export type { DropdownProps } from './overlay/Dropdown/types';
```

### 20.3 Icons Barrel

```typescript
// /packages/icons/src/index.ts

/**
 * ROTTAY DESIGN SYSTEM - ICONS
 *
 * Exports de todos los iconos del sistema.
 * Cada icono es tree-shakeable.
 *
 * Uso:
 * import { UserIcon, CheckIcon } from '@rottay/icons';
 */

// Types
export type { IconProps, IconComponent } from './types';
export { ICON_SIZE_MAP } from './types';

// Base
export { BaseIcon } from './components/BaseIcon';

// User & People
export { UserIcon } from './components/UserIcon';
export { UsersIcon } from './components/UsersIcon';

// Actions
export { CheckIcon } from './components/CheckIcon';
export { XIcon } from './components/XIcon';
export { PlusIcon } from './components/PlusIcon';
export { MinusIcon } from './components/MinusIcon';
export { EditIcon } from './components/EditIcon';
export { TrashIcon } from './components/TrashIcon';

// Navigation
export { ChevronDownIcon } from './components/ChevronDownIcon';
export { ChevronUpIcon } from './components/ChevronUpIcon';
export { ChevronLeftIcon } from './components/ChevronLeftIcon';
export { ChevronRightIcon } from './components/ChevronRightIcon';
export { MenuIcon } from './components/MenuIcon';

// Status
export { AlertCircleIcon } from './components/AlertCircleIcon';
export { CheckCircleIcon } from './components/CheckCircleIcon';
export { InfoIcon } from './components/InfoIcon';
export { WarningIcon } from './components/WarningIcon';

// Media
export { CameraIcon } from './components/CameraIcon';
export { ImageIcon } from './components/ImageIcon';
export { UploadIcon } from './components/UploadIcon';

// Communication
export { MailIcon } from './components/MailIcon';
export { PhoneIcon } from './components/PhoneIcon';
export { MessageIcon } from './components/MessageIcon';

// Misc
export { SearchIcon } from './components/SearchIcon';
export { SettingsIcon } from './components/SettingsIcon';
export { LoaderIcon } from './components/LoaderIcon';
export { ExternalLinkIcon } from './components/ExternalLinkIcon';
```

---

## 21. CHANGELOG Y VERSIONADO

### 21.1 Template de Changelog

```markdown
# Changelog

Todos los cambios notables en el Rottay Design System serán documentados aquí.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Added
-

### Changed
-

### Deprecated
-

### Removed
-

### Fixed
-

### Security
-

---

## [0.3.0] - YYYY-MM-DD

### Added
- Sistema de CSS Variables para theming (#123)
- Soporte para múltiples engines (Titan, Hermes, Apollo)
- Componente Avatar con compound components (Group, Badge, Fallback)
- Sistema de tokens responsive mobile-first
- ThemeProvider con fallback a tema Rottay
- Error handling centralizado
- Lazy loading de engines

### Changed
- Renombrado `/composed/` a `/custom/`
- Estructura de archivos: todos los componentes usan `index.tsx`
- Props de Avatar: agregado `loading`, `onLoad`
- AvatarGroup: agregado `renderSurplus`

### Fixed
- Engine override via props ahora funciona correctamente
- Error boundary vacío implementado
- BaseComponentProps ahora incluye todos los tipos necesarios

---

## [0.2.0] - 2025-12-01

### Added
- Implementación inicial de primitivos
- Sistema de engines básico
- Providers de tenant y engine

### Known Issues
- Engine override via props no funciona
- Error boundary vacío
- Hooks en ubicación incorrecta
```

### 21.2 Template de Migration Guide

```markdown
# Guía de Migración: v0.2.x → v0.3.x

## Resumen de Cambios Breaking

| Cambio | Impacto | Acción Requerida |
|--------|---------|------------------|
| Renombrado `/composed/` → `/custom/` | Alto | Actualizar imports |
| Nueva estructura de archivos | Medio | Actualizar imports |
| Props deprecadas en Avatar | Bajo | Usar nuevas props |

---

## 1. Actualizar Imports

### Antes (v0.2.x)
```typescript
import { ComposedButton } from '@rottay/composed/Button';
import { Avatar } from '@rottay/primitives/avatar/core';
```

### Después (v0.3.x)
```typescript
import { CustomButton } from '@rottay/custom/Button';
import { Avatar } from '@rottay/primitives';
```

---

## 2. Actualizar Props de Avatar

### Antes (v0.2.x)
```tsx
<Avatar
  imageUrl="https://..."
  fallbackText="JD"
/>
```

### Después (v0.3.x)
```tsx
<Avatar
  src="https://..."
  name="John Doe"  // Se generan iniciales automáticamente
/>
```

### Mapeo de Props

| v0.2.x | v0.3.x | Notas |
|--------|--------|-------|
| `imageUrl` | `src` | Renombrado para consistencia con HTML |
| `fallbackText` | `name` | Ahora genera iniciales automáticamente |
| `avatarSize` | `size` | Simplificado |
| N/A | `loading` | Nueva prop para skeleton |
| N/A | `onLoad` | Nueva callback |

---

## 3. Actualizar AvatarGroup

### Antes (v0.2.x)
```tsx
<AvatarGroup max={3}>
  {avatars}
</AvatarGroup>
```

### Después (v0.3.x)
```tsx
<Avatar.Group
  max={3}
  renderSurplus={(count) => <span>+{count} más</span>}
>
  {avatars}
</Avatar.Group>
```

---

## 4. Migrar Theming

### Antes (v0.2.x)
```typescript
// Hardcoded en componente
const SIZE_MAP = { sm: 32, md: 40 };
```

### Después (v0.3.x)
```css
/* En CSS tokens */
:root {
  --avatar-sm-size: 32px;
  --avatar-md-size: 40px;
}
```

```typescript
// En componente
style={{
  '--avatar-size': `var(--avatar-${size}-size)`
}}
```

---

## 5. Checklist de Migración

- [ ] Actualizar dependencias a v0.3.x
- [ ] Buscar y reemplazar imports de `/composed/` a `/custom/`
- [ ] Actualizar imports de primitivos
- [ ] Actualizar props de Avatar
- [ ] Actualizar uso de AvatarGroup
- [ ] Importar CSS tokens: `@import '@rottay/tokens'`
- [ ] Envolver app en ThemeProvider
- [ ] Verificar que build compila sin errores
- [ ] Ejecutar tests
- [ ] Verificar visualmente cada componente migrado

---

## Soporte

Si encuentras problemas durante la migración:
1. Revisa los [Issues en GitHub](https://github.com/rottay/design-system/issues)
2. Busca errores comunes en la [FAQ](#faq)
3. Abre un nuevo issue con el tag `migration`
```

### 21.3 Actualización del Índice

Actualizar la tabla de contenidos del documento principal para incluir las nuevas secciones:

```markdown
17. [Iconografía y Assets](#17-iconografía-y-assets)
18. [Error Handling Patterns](#18-error-handling-patterns)
19. [Performance](#19-performance)
20. [Barrel Exports Completos](#20-barrel-exports-completos)
21. [Changelog y Versionado](#21-changelog-y-versionado)
22. [Internacionalización (i18n)](#22-internacionalización-i18n)
```

---

## 22. INTERNACIONALIZACIÓN (i18n)

### 22.1 Filosofía de i18n en el Design System

```markdown
## Principios de Internacionalización

1. **Componentes agnósticos al idioma**: Los primitivos NO contienen strings
2. **Strings externalizados**: Todo texto visible viene de props o context
3. **RTL-ready**: Soporte para idiomas right-to-left (árabe, hebreo)
4. **Formateo delegado**: Fechas, números, monedas se formatean externamente
5. **Fallbacks explícitos**: Siempre hay un valor por defecto en español/inglés
```

### 22.2 Estructura de Traducciones

```
/packages/i18n/
├── src/
│   ├── locales/
│   │   ├── es/                    ← Español (base)
│   │   │   ├── common.json        ← Strings comunes
│   │   │   ├── components.json    ← Strings de componentes
│   │   │   ├── errors.json        ← Mensajes de error
│   │   │   ├── validation.json    ← Mensajes de validación
│   │   │   └── index.ts           ← Barrel export
│   │   │
│   │   ├── en/                    ← English
│   │   │   └── ...
│   │   │
│   │   └── index.ts               ← Export de todos los locales
│   │
│   ├── hooks/
│   │   ├── useTranslation/
│   │   │   └── index.ts
│   │   ├── useLocale/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── context/
│   │   ├── I18nProvider/
│   │   │   └── index.tsx
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── formatters/
│   │   │   └── index.ts           ← Fecha, número, moneda
│   │   └── index.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   └── index.ts
│
└── package.json
```

### 22.3 Tipos de i18n

```typescript
// /packages/i18n/src/types/index.ts

/**
 * Locales soportados por el Design System Rottay.
 */
export type SupportedLocale = 'es' | 'en' | 'pt' | 'fr';

/**
 * Dirección del texto.
 */
export type TextDirection = 'ltr' | 'rtl';

/**
 * Configuración de locale.
 */
export interface LocaleConfig {
  /** Código del locale (es, en, etc.) */
  code: SupportedLocale;
  /** Nombre del idioma en ese idioma */
  name: string;
  /** Dirección del texto */
  direction: TextDirection;
  /** Locale para formateo de fechas (Intl) */
  dateLocale: string;
  /** Locale para formateo de números (Intl) */
  numberLocale: string;
}

/**
 * Namespace de traducciones.
 */
export type TranslationNamespace = 'common' | 'components' | 'errors' | 'validation';

/**
 * Función de traducción.
 */
export type TranslateFunction = (
  key: string,
  params?: Record<string, string | number>
) => string;

/**
 * Configuración del proveedor i18n.
 */
export interface I18nProviderProps {
  /** Locale inicial */
  locale: SupportedLocale;
  /** Locale de fallback si falta una traducción */
  fallbackLocale?: SupportedLocale;
  /** Traducciones personalizadas del tenant */
  customTranslations?: Record<string, Record<string, string>>;
  /** Callback cuando cambia el locale */
  onLocaleChange?: (locale: SupportedLocale) => void;
  children: React.ReactNode;
}

/**
 * Configuración de locales soportados.
 */
export const LOCALE_CONFIGS: Record<SupportedLocale, LocaleConfig> = {
  es: {
    code: 'es',
    name: 'Español',
    direction: 'ltr',
    dateLocale: 'es-ES',
    numberLocale: 'es-ES',
  },
  en: {
    code: 'en',
    name: 'English',
    direction: 'ltr',
    dateLocale: 'en-US',
    numberLocale: 'en-US',
  },
  pt: {
    code: 'pt',
    name: 'Português',
    direction: 'ltr',
    dateLocale: 'pt-BR',
    numberLocale: 'pt-BR',
  },
  fr: {
    code: 'fr',
    name: 'Français',
    direction: 'ltr',
    dateLocale: 'fr-FR',
    numberLocale: 'fr-FR',
  },
};
```

### 22.4 Archivo de Traducciones (Ejemplo)

```json
// /packages/i18n/src/locales/es/components.json
{
  "avatar": {
    "loading": "Cargando avatar...",
    "error": "Error al cargar imagen",
    "fallback": "Sin imagen",
    "group": {
      "surplus": "+{count} más",
      "empty": "Sin usuarios"
    },
    "status": {
      "online": "En línea",
      "offline": "Desconectado",
      "away": "Ausente",
      "busy": "Ocupado"
    }
  },
  "button": {
    "loading": "Cargando...",
    "submit": "Enviar",
    "cancel": "Cancelar",
    "confirm": "Confirmar",
    "delete": "Eliminar",
    "edit": "Editar",
    "save": "Guardar"
  },
  "input": {
    "placeholder": "Escribe aquí...",
    "required": "Este campo es requerido",
    "optional": "(opcional)",
    "clear": "Limpiar",
    "show_password": "Mostrar contraseña",
    "hide_password": "Ocultar contraseña"
  },
  "select": {
    "placeholder": "Selecciona una opción",
    "no_options": "Sin opciones disponibles",
    "loading": "Cargando opciones...",
    "search": "Buscar...",
    "clear": "Limpiar selección"
  },
  "modal": {
    "close": "Cerrar",
    "confirm": "Confirmar",
    "cancel": "Cancelar"
  },
  "pagination": {
    "previous": "Anterior",
    "next": "Siguiente",
    "page": "Página {current} de {total}",
    "go_to": "Ir a página"
  },
  "table": {
    "empty": "Sin datos",
    "loading": "Cargando datos...",
    "sort_asc": "Ordenar ascendente",
    "sort_desc": "Ordenar descendente",
    "filter": "Filtrar",
    "clear_filters": "Limpiar filtros"
  },
  "upload": {
    "drag_drop": "Arrastra archivos aquí o haz clic para seleccionar",
    "uploading": "Subiendo...",
    "success": "Archivo subido correctamente",
    "error": "Error al subir archivo",
    "remove": "Eliminar archivo"
  }
}
```

```json
// /packages/i18n/src/locales/en/components.json
{
  "avatar": {
    "loading": "Loading avatar...",
    "error": "Error loading image",
    "fallback": "No image",
    "group": {
      "surplus": "+{count} more",
      "empty": "No users"
    },
    "status": {
      "online": "Online",
      "offline": "Offline",
      "away": "Away",
      "busy": "Busy"
    }
  },
  "button": {
    "loading": "Loading...",
    "submit": "Submit",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "delete": "Delete",
    "edit": "Edit",
    "save": "Save"
  },
  "input": {
    "placeholder": "Type here...",
    "required": "This field is required",
    "optional": "(optional)",
    "clear": "Clear",
    "show_password": "Show password",
    "hide_password": "Hide password"
  },
  "select": {
    "placeholder": "Select an option",
    "no_options": "No options available",
    "loading": "Loading options...",
    "search": "Search...",
    "clear": "Clear selection"
  },
  "modal": {
    "close": "Close",
    "confirm": "Confirm",
    "cancel": "Cancel"
  },
  "pagination": {
    "previous": "Previous",
    "next": "Next",
    "page": "Page {current} of {total}",
    "go_to": "Go to page"
  },
  "table": {
    "empty": "No data",
    "loading": "Loading data...",
    "sort_asc": "Sort ascending",
    "sort_desc": "Sort descending",
    "filter": "Filter",
    "clear_filters": "Clear filters"
  },
  "upload": {
    "drag_drop": "Drag files here or click to select",
    "uploading": "Uploading...",
    "success": "File uploaded successfully",
    "error": "Error uploading file",
    "remove": "Remove file"
  }
}
```

### 22.5 I18nProvider

```typescript
// /packages/i18n/src/context/I18nProvider/index.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type {
  SupportedLocale,
  I18nProviderProps,
  TranslateFunction,
  LocaleConfig,
} from '../../types';
import { LOCALE_CONFIGS } from '../../types';

// Importar traducciones
import esCommon from '../../locales/es/common.json';
import esComponents from '../../locales/es/components.json';
import esErrors from '../../locales/es/errors.json';
import enCommon from '../../locales/en/common.json';
import enComponents from '../../locales/en/components.json';
import enErrors from '../../locales/en/errors.json';

interface I18nContextValue {
  /** Locale actual */
  locale: SupportedLocale;
  /** Configuración del locale actual */
  localeConfig: LocaleConfig;
  /** Función para traducir */
  t: TranslateFunction;
  /** Cambiar locale */
  setLocale: (locale: SupportedLocale) => void;
  /** Todos los locales disponibles */
  availableLocales: SupportedLocale[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Traducciones por locale.
 */
const translations: Record<SupportedLocale, Record<string, unknown>> = {
  es: { common: esCommon, components: esComponents, errors: esErrors },
  en: { common: enCommon, components: enComponents, errors: enErrors },
  pt: {}, // TODO: Agregar traducciones
  fr: {}, // TODO: Agregar traducciones
};

/**
 * Obtiene un valor anidado de un objeto usando notación de punto.
 */
function getNestedValue(obj: unknown, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Reemplaza parámetros en una string.
 * Ejemplo: "{count} items" con { count: 5 } → "5 items"
 */
function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

/**
 * Proveedor de internacionalización para el Design System Rottay.
 *
 * @example
 * <I18nProvider locale="es">
 *   <App />
 * </I18nProvider>
 */
export function I18nProvider({
  locale: initialLocale,
  fallbackLocale = 'es',
  customTranslations = {},
  onLocaleChange,
  children,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(initialLocale);

  const setLocale = useCallback(
    (newLocale: SupportedLocale) => {
      setLocaleState(newLocale);
      onLocaleChange?.(newLocale);

      // Actualizar atributo lang del documento
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLocale;
        document.documentElement.dir = LOCALE_CONFIGS[newLocale].direction;
      }
    },
    [onLocaleChange]
  );

  const t: TranslateFunction = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      // Buscar en traducciones custom del tenant primero
      const customValue = getNestedValue(customTranslations[locale], key);
      if (customValue) return interpolate(customValue, params);

      // Buscar en traducciones del locale actual
      const value = getNestedValue(translations[locale], key);
      if (value) return interpolate(value, params);

      // Fallback al locale por defecto
      const fallbackValue = getNestedValue(translations[fallbackLocale], key);
      if (fallbackValue) return interpolate(fallbackValue, params);

      // Si no se encuentra, devolver la key
      console.warn(`[Rottay i18n] Missing translation for key: ${key}`);
      return key;
    },
    [locale, fallbackLocale, customTranslations]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      localeConfig: LOCALE_CONFIGS[locale],
      t,
      setLocale,
      availableLocales: Object.keys(LOCALE_CONFIGS) as SupportedLocale[],
    }),
    [locale, t, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Hook para acceder al contexto de i18n.
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

/**
 * Hook simplificado para solo obtener la función de traducción.
 */
export function useTranslation(namespace?: string): { t: TranslateFunction } {
  const { t } = useI18n();

  const namespacedT: TranslateFunction = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      return t(fullKey, params);
    },
    [t, namespace]
  );

  return { t: namespacedT };
}
```

### 22.6 Hook useLocale

```typescript
// /packages/i18n/src/hooks/useLocale/index.ts
'use client';

import { useI18n } from '../../context/I18nProvider';
import type { SupportedLocale, LocaleConfig } from '../../types';

interface UseLocaleReturn {
  /** Locale actual */
  locale: SupportedLocale;
  /** Configuración completa del locale */
  config: LocaleConfig;
  /** Cambiar locale */
  setLocale: (locale: SupportedLocale) => void;
  /** Verificar si es RTL */
  isRTL: boolean;
  /** Lista de locales disponibles */
  availableLocales: SupportedLocale[];
}

/**
 * Hook para acceder y cambiar el locale actual.
 *
 * @example
 * const { locale, setLocale, isRTL } = useLocale();
 *
 * return (
 *   <select value={locale} onChange={(e) => setLocale(e.target.value)}>
 *     {availableLocales.map((loc) => (
 *       <option key={loc} value={loc}>{loc}</option>
 *     ))}
 *   </select>
 * );
 */
export function useLocale(): UseLocaleReturn {
  const { locale, localeConfig, setLocale, availableLocales } = useI18n();

  return {
    locale,
    config: localeConfig,
    setLocale,
    isRTL: localeConfig.direction === 'rtl',
    availableLocales,
  };
}
```

### 22.7 Formatters

```typescript
// /packages/i18n/src/utils/formatters/index.ts

import type { SupportedLocale } from '../../types';
import { LOCALE_CONFIGS } from '../../types';

/**
 * Formatea una fecha según el locale.
 */
export function formatDate(
  date: Date | string | number,
  locale: SupportedLocale,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const localeConfig = LOCALE_CONFIGS[locale];

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat(
    localeConfig.dateLocale,
    options || defaultOptions
  ).format(dateObj);
}

/**
 * Formatea un número según el locale.
 */
export function formatNumber(
  value: number,
  locale: SupportedLocale,
  options?: Intl.NumberFormatOptions
): string {
  const localeConfig = LOCALE_CONFIGS[locale];

  return new Intl.NumberFormat(localeConfig.numberLocale, options).format(value);
}

/**
 * Formatea una moneda según el locale.
 */
export function formatCurrency(
  value: number,
  locale: SupportedLocale,
  currency: string = 'USD'
): string {
  const localeConfig = LOCALE_CONFIGS[locale];

  return new Intl.NumberFormat(localeConfig.numberLocale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Formatea un tiempo relativo (hace 5 minutos, en 2 días, etc.)
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: SupportedLocale
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  const localeConfig = LOCALE_CONFIGS[locale];
  const rtf = new Intl.RelativeTimeFormat(localeConfig.dateLocale, {
    numeric: 'auto',
  });

  if (Math.abs(diffSeconds) < 60) {
    return rtf.format(diffSeconds, 'second');
  } else if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minute');
  } else if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour');
  } else {
    return rtf.format(diffDays, 'day');
  }
}

/**
 * Hook para formateo con el locale actual.
 */
export function useFormatters(locale: SupportedLocale) {
  return {
    formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      formatDate(date, locale, options),
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
      formatNumber(value, locale, options),
    formatCurrency: (value: number, currency?: string) =>
      formatCurrency(value, locale, currency),
    formatRelativeTime: (date: Date | string | number) =>
      formatRelativeTime(date, locale),
  };
}
```

### 22.8 Uso en Componentes

```typescript
// Ejemplo: Avatar con soporte i18n
// /primitives/display/Avatar/base/index.tsx

import { useTranslation } from '@rottay/i18n';

export const BaseAvatar = forwardRef<HTMLDivElement, AvatarProps>((props, ref) => {
  const { src, name, status, loading } = props;
  const { t } = useTranslation('components.avatar');

  // Obtener texto localizado para el status
  const statusLabel = status ? t(`status.${status}`) : undefined;

  // Texto para loading
  const loadingText = t('loading');

  // Texto para error de imagen
  const handleImageError = () => {
    console.warn(t('error'));
    // ...
  };

  return (
    <div
      ref={ref}
      role="img"
      aria-label={name || t('fallback')}
      aria-busy={loading}
      // ...
    >
      {/* ... */}
    </div>
  );
});
```

```typescript
// Ejemplo: AvatarGroup con surplus localizado
// /primitives/display/Avatar/compound/Group/index.tsx

import { useTranslation } from '@rottay/i18n';

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max = 5,
  renderSurplus,
}) => {
  const { t } = useTranslation('components.avatar.group');
  const childArray = React.Children.toArray(children);
  const surplus = childArray.length - max;

  const defaultRenderSurplus = (count: number) => (
    <span className="avatar-surplus">
      {t('surplus', { count })} {/* "+3 más" o "+3 more" */}
    </span>
  );

  return (
    <div className="avatar-group">
      {childArray.slice(0, max)}
      {surplus > 0 && (renderSurplus || defaultRenderSurplus)(surplus)}
    </div>
  );
};
```

### 22.9 Soporte RTL (Right-to-Left)

```css
/* /packages/tokens/src/base/rtl.css */

/**
 * Estilos RTL para idiomas como árabe y hebreo.
 * Se activan automáticamente cuando dir="rtl" en el html.
 */

[dir='rtl'] {
  /* ═══════════════════════════════════════════════════════════════
     AVATAR GROUP - Invertir dirección de stack
     ═══════════════════════════════════════════════════════════════ */
  .avatar-group {
    flex-direction: row-reverse;
  }

  .avatar-group > * + * {
    margin-right: var(--avatar-group-spacing);
    margin-left: 0;
  }

  /* ═══════════════════════════════════════════════════════════════
     STATUS INDICATOR - Posición invertida
     ═══════════════════════════════════════════════════════════════ */
  .avatar-status {
    right: auto;
    left: 0;
  }

  /* ═══════════════════════════════════════════════════════════════
     BADGE - Posición invertida
     ═══════════════════════════════════════════════════════════════ */
  .avatar-badge {
    right: auto;
    left: -4px;
  }

  /* ═══════════════════════════════════════════════════════════════
     INPUTS - Padding invertido
     ═══════════════════════════════════════════════════════════════ */
  .input-with-icon {
    padding-left: var(--input-padding-x);
    padding-right: calc(var(--input-padding-x) + var(--icon-size) + 8px);
  }

  .input-icon {
    left: auto;
    right: var(--input-padding-x);
  }

  /* ═══════════════════════════════════════════════════════════════
     BUTTONS - Orden de icono invertido
     ═══════════════════════════════════════════════════════════════ */
  .button-icon-left {
    margin-right: 0;
    margin-left: 8px;
  }

  .button-icon-right {
    margin-left: 0;
    margin-right: 8px;
  }

  /* ═══════════════════════════════════════════════════════════════
     MODALS & DROPDOWNS - Posiciones invertidas
     ═══════════════════════════════════════════════════════════════ */
  .modal-close-button {
    right: auto;
    left: 16px;
  }

  .dropdown-menu {
    left: auto;
    right: 0;
  }
}
```

### 22.10 Barrel Export

```typescript
// /packages/i18n/src/index.ts

/**
 * ROTTAY DESIGN SYSTEM - INTERNACIONALIZACIÓN
 *
 * Paquete de internacionalización para el Design System.
 *
 * Uso:
 * import { I18nProvider, useTranslation, useLocale } from '@rottay/i18n';
 */

// Context & Provider
export { I18nProvider, useI18n, useTranslation } from './context/I18nProvider';

// Hooks
export { useLocale } from './hooks/useLocale';

// Formatters
export {
  formatDate,
  formatNumber,
  formatCurrency,
  formatRelativeTime,
  useFormatters,
} from './utils/formatters';

// Types
export type {
  SupportedLocale,
  TextDirection,
  LocaleConfig,
  TranslationNamespace,
  TranslateFunction,
  I18nProviderProps,
} from './types';

export { LOCALE_CONFIGS } from './types';
```

---

## ARQUITECTURA SELECCIONADA

> **Nota**: Este documento asume la implementación de **OPCIÓN C: Híbrido** con BaseComponent + CSS Variables + Engines como adapters opcionales. Esta arquitectura fue seleccionada por ofrecer el mejor balance entre flexibilidad de theming y soporte para múltiples frameworks de UI.

### Resumen de la Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROTTAY DESIGN SYSTEM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   TOKENS    │    │ PRIMITIVES  │    │    ICONS    │        │
│  │  (CSS Vars) │    │ (React)     │    │   (SVG)     │        │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘        │
│         │                  │                  │                │
│         └──────────────────┼──────────────────┘                │
│                            │                                    │
│                    ┌───────▼───────┐                           │
│                    │  THEME        │                           │
│                    │  PROVIDER     │                           │
│                    │  (Rottay)     │                           │
│                    └───────┬───────┘                           │
│                            │                                    │
│         ┌──────────────────┼──────────────────┐                │
│         │                  │                  │                │
│  ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐         │
│  │   TITAN     │   │   HERMES    │   │   APOLLO    │         │
│  │ (Ant Design)│   │  (DaisyUI)  │   │  (Vanilla)  │         │
│  └─────────────┘   └─────────────┘   └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

**Documento generado para: Rottay Design System**
**Versión del documento: 1.0.0**
**Última actualización: 2025-12-24**
