import type { ReactNode } from 'react';
import type { BaseComponentProps, Size, WithChildren } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * Orientación del Stepper.
 */
export type StepperOrientation = 'horizontal' | 'vertical';

/**
 * Estado de un Step.
 */
export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

/**
 * Item del Stepper.
 */
export interface StepItem {
  /** Título del step */
  title: ReactNode;
  /** Descripción del step */
  description?: ReactNode;
  /** Icono del step */
  icon?: ReactNode;
  /** Estado del step */
  status?: StepStatus;
  /** Si el step está deshabilitado */
  disabled?: boolean;
  /** Contenido del step (para stepper con contenido) */
  content?: ReactNode;
}

/**
 * Props del componente Stepper.
 */
export interface StepperProps extends BaseComponentProps, EngineAwareProps {
  /**
   * Tamaño del stepper.
   * @default 'md'
   */
  size?: Size;

  /**
   * Orientación del stepper.
   * @default 'horizontal'
   */
  orientation?: StepperOrientation;

  /**
   * Steps del stepper.
   */
  steps?: StepItem[];

  /**
   * Índice del step actual.
   */
  current?: number;

  /**
   * Índice del step actual por defecto.
   */
  defaultCurrent?: number;

  /**
   * Callback cuando cambia el step actual.
   */
  onChange?: (current: number) => void;

  /**
   * Si mostrar números en vez de iconos.
   * @default true
   */
  numbered?: boolean;

  /**
   * Si los steps son clickeables.
   * @default false
   */
  clickable?: boolean;

  /**
   * Callback cuando se hace click en un step.
   */
  onStepClick?: (index: number) => void;

  /**
   * Si mostrar barra de progreso.
   * @default false
   */
  showProgress?: boolean;

  /**
   * Posición del label.
   * @default 'bottom'
   */
  labelPlacement?: 'bottom' | 'right';

  /**
   * Tipo de conector entre steps.
   * @default 'line'
   */
  connectorType?: 'line' | 'dashed' | 'dotted';

  /**
   * Si mostrar contenido del step.
   * @default false
   */
  showContent?: boolean;

  /**
   * Contenido de los steps (como children).
   */
  children?: ReactNode;
}

/**
 * Props del componente Stepper.Step.
 */
export interface StepperStepProps extends BaseComponentProps, WithChildren {
  /**
   * Título del step.
   */
  title: ReactNode;

  /**
   * Descripción del step.
   */
  description?: ReactNode;

  /**
   * Icono del step.
   */
  icon?: ReactNode;

  /**
   * Estado del step.
   */
  status?: StepStatus;

  /**
   * Si el step está deshabilitado.
   */
  disabled?: boolean;
}

/**
 * Props del componente Stepper.Actions (acciones de navegación).
 */
export interface StepperActionsProps extends BaseComponentProps {
  /**
   * Si mostrar el botón "Anterior".
   * @default true
   */
  showPrevious?: boolean;

  /**
   * Si mostrar el botón "Siguiente".
   * @default true
   */
  showNext?: boolean;

  /**
   * Texto del botón "Anterior".
   * @default 'Anterior'
   */
  previousText?: ReactNode;

  /**
   * Texto del botón "Siguiente".
   * @default 'Siguiente'
   */
  nextText?: ReactNode;

  /**
   * Texto del botón "Finalizar" (último step).
   * @default 'Finalizar'
   */
  finishText?: ReactNode;

  /**
   * Callback cuando se hace click en "Anterior".
   */
  onPrevious?: () => void;

  /**
   * Callback cuando se hace click en "Siguiente".
   */
  onNext?: () => void;

  /**
   * Callback cuando se hace click en "Finalizar".
   */
  onFinish?: () => void;

  /**
   * Si el botón de siguiente está deshabilitado.
   */
  nextDisabled?: boolean;

  /**
   * Si el botón de anterior está deshabilitado.
   */
  previousDisabled?: boolean;

  /**
   * Si el botón de siguiente está en loading.
   */
  nextLoading?: boolean;
}

/**
 * Estado del Stepper.
 */
export interface StepperState {
  /** Índice del step actual */
  current: number;
  /** Total de steps */
  total: number;
  /** Si es el primer step */
  isFirst: boolean;
  /** Si es el último step */
  isLast: boolean;
  /** Porcentaje de progreso */
  progress: number;
}
