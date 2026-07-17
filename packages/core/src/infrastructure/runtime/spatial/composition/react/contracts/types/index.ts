import type {
  ComponentType,
  CSSProperties,
  ReactNode,
} from 'react';

import type {
  SpatialBackend,
  SpatialInteraction,
  SpatialLiveMode,
  SpatialMode,
  SpatialPurpose,
  SpatialQuality,
  SpatialQualityBudget,
  SpatialResolutionReason,
} from '../../../../../../../foundation/contracts/kernel/spatial';

export interface SpatialPerformanceSample {
  /** Main render cost for one scene frame, in milliseconds. */
  readonly frameTimeMs: number;
}

export interface SpatialSceneRuntimeProps {
  readonly id: string;
  readonly mode: SpatialLiveMode;
  readonly backend: Exclude<SpatialBackend, 'none'>;
  readonly active: true;
  readonly quality: SpatialQualityBudget;
  readonly interaction: SpatialInteraction;
  /**
   * Register the real renderer canvas so the host can enforce context-loss,
   * accessibility and teardown policy. The returned cleanup is idempotent.
   */
  registerCanvas(canvas: HTMLCanvasElement, dispose?: () => void): () => void;
  reportReady(): void;
  reportError(error: unknown): void;
  reportPerformance(sample: SpatialPerformanceSample): void;
}

export interface SpatialSceneModule {
  readonly version: 1;
  readonly backend: 'webgl2';
  readonly Scene: ComponentType<SpatialSceneRuntimeProps>;
}

export type SpatialSceneLoader = () => Promise<SpatialSceneModule>;

export interface SpatialExperienceLabels {
  /** Accessible label for the app-owned control group. */
  readonly controls?: string;
  /** Summary copy that exposes the equivalent non-spatial representation. */
  readonly alternative?: string;
  /** Optional retry copy after load/render/context failure. */
  readonly retry?: string;
  /** Optional user override for a scene that can continue changing. */
  readonly pause?: string;
  readonly resume?: string;
}

export type SpatialExperienceEvent =
  | {
    readonly type: 'mode';
    readonly id: string;
    readonly mode: SpatialMode;
    readonly backend: SpatialBackend;
    readonly reason: SpatialResolutionReason;
  }
  | { readonly type: 'load-start' | 'ready' | 'retry'; readonly id: string }
  | {
    readonly type: 'error';
    readonly id: string;
    readonly phase: 'load' | 'module' | 'render' | 'scene' | 'context';
  }
  | {
    readonly type: 'quality';
    readonly id: string;
    readonly mode: SpatialLiveMode;
  };

export interface SpatialExperienceProps {
  readonly id: string;
  readonly label: string;
  readonly purpose: SpatialPurpose;
  readonly description: string;
  readonly poster: ReactNode;
  readonly reduced: ReactNode;
  /** Equivalent app-owned 2D/list representation, exposed alongside live work. */
  readonly alternative?: ReactNode;
  /** App-owned keyboard/domain controls for interactive scenes. */
  readonly controls?: ReactNode;
  readonly labels?: SpatialExperienceLabels;
  readonly loadScene: SpatialSceneLoader;
  readonly quality?: SpatialQuality;
  readonly interaction?: SpatialInteraction;
  readonly enabled?: boolean;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly onEvent?: (event: SpatialExperienceEvent) => void;
}
