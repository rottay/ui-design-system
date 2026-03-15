import type { ComponentType, CSSProperties } from 'react';
import type { ComponentExtensions } from '../extensions';

/**
 * Nombres de engines disponibles en el sistema Rottay.
 * - classic: Ant Design (enterprise, structured, corporate)
 * - modern: DaisyUI/Tailwind (contemporary, rounded, glassmorphism)
 * - rustic: Vanilla HTML/CSS (minimal, spacious, understated)
 * - athena: Pluggable custom implementations
 */
export type EngineName = 'classic' | 'modern' | 'rustic' | 'athena';

/**
 * Props que permiten seleccionar el engine de renderizado.
 */
export interface EngineAwareProps {
  /**
   * Engine de UI a usar para este componente.
   * Si no se especifica, usa el engine del EngineProvider más cercano.
   * @default 'classic'
   */
  engine?: EngineName;
  /**
   * Additional CSS class name(s) for the component.
   */
  className?: string;
  /**
   * Inline CSS styles for the component.
   */
  style?: CSSProperties;
  /**
   * Extension points for customizing component rendering.
   * Allows apps to inject columns, actions, filters, slots, and more
   * without modifying the design system presets.
   */
  extensions?: ComponentExtensions;
}

/**
 * Configuración de engine por componente.
 */
export interface EngineComponentConfig<P = unknown> {
  /** Nombre del engine */
  name: EngineName;
  /** Componente React para este engine */
  component: ComponentType<P>;
  /** Si está disponible (puede no estar instalada la dependencia) */
  available: boolean;
}

/**
 * Configuración de engine para el registry.
 */
export interface EngineConfig {
  /** Nombre del engine */
  name: EngineName;
  /** Nombre de display para UI */
  displayName: string;
  /** Librería subyacente */
  library: string;
  /** Estado de estabilidad */
  status: 'stable' | 'beta' | 'experimental' | 'deprecated';
}

/**
 * Metadata de capacidades de un engine.
 */
export interface EngineCapabilities {
  /** Si soporta temas */
  theming: boolean;
  /** Si soporta animaciones */
  animations: boolean;
  /** Si soporta accesibilidad avanzada */
  accessibility: boolean;
  /** Si tiene bundle size optimizado */
  lightweight: boolean;
  /** Lista de componentes soportados */
  supportedComponents: string[];
}

/**
 * Metadata de un engine.
 */
export interface EngineMetadata {
  /** Nombre del engine */
  name: EngineName;
  /** Nombre completo/display */
  displayName: string;
  /** Descripción del engine */
  description: string;
  /** Versión del engine */
  version: string;
  /** Capacidades del engine */
  capabilities: EngineCapabilities;
}

/**
 * Contexto del EngineProvider.
 */
export interface EngineContextValue {
  /** Engine activo actual */
  engine: EngineName;
  /** Función para cambiar el engine */
  setEngine: (engine: EngineName) => void;
  /** Metadata del engine activo */
  metadata?: EngineMetadata;
}

/**
 * Props del EngineProvider.
 */
export interface EngineProviderProps {
  /** Engine por defecto */
  defaultEngine?: EngineName;
  /** Children */
  children: React.ReactNode;
  /** Si permitir cambio de engine en runtime */
  allowEngineSwitch?: boolean;
}

/**
 * Registro de engines disponibles.
 */
export type EngineRegistry = Record<EngineName, EngineMetadata>;

/**
 * Configuración de fallback cuando un engine no está disponible.
 */
export interface EngineFallbackConfig {
  /** Engine a usar si el primario no está disponible */
  fallbackEngine: EngineName;
  /** Si mostrar warning en consola cuando ocurre fallback */
  warnOnFallback?: boolean;
}
