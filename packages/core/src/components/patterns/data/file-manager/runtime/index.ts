'use client';

/**
 * @fileoverview Breadcrumb path admission for the FileManager pattern.
 *
 * `currentPath` accepts deprecated strings and {@link FileManagerPathSegment}
 * objects. Only the Modern implementation renders segments. This owner decides,
 * in development and production alike, what happens when a segment would reach
 * an implementation that cannot honor it: a named refusal thrown as an `Error`
 * under the component name, exactly like the factory's own refusals. A segment
 * is never projected to its name, its id is never guessed or looked up, and no
 * other engine is substituted.
 *
 * - {@link refuseInvalidPath}: the Modern engine's validation (empty or
 *   malformed segments) before any crumb exists.
 * - {@link admitStringPathOnly}: the loader adapter for the frozen Classic and
 *   Rustic engines; it refuses inside the factory's per-instance error boundary.
 * - {@link guardCustomObjectPath}: the guard in front of the router for the
 *   custom engine, whose component pack is resolved inside the factory where no
 *   loader adapter can reach it.
 */

import { createElement, forwardRef, type ComponentType } from 'react';
import type { EngineName } from '@/foundation/contracts';
import { EXTENSION_ENGINE } from '@/foundation/contracts/kernel/engine-identity';
import { useDeclaredEngine } from '@/infrastructure/runtime/engines/composition/react/provider';
import type { createEngineComponent } from '@/infrastructure/runtime/engines/presentation/component-factory';
import type {
  FileManagerPathSegment,
  FileManagerProps,
  PatternFileManagerProps,
} from '../contracts';

/** The display name every refusal is thrown under, matching the factory's `${displayName}: …` form. */
const COMPONENT_NAME = 'PatternFileManager';

/** The router `createEngineComponent` returns for the public props. */
type PatternFileManagerRouter = ReturnType<typeof createEngineComponent<PatternFileManagerProps>>;

/** Props the router accepts: the public props plus the per-instance engine override. */
type PatternFileManagerRouterProps = PatternFileManagerProps & { engine?: EngineName };

function isPathSegment(value: unknown): value is FileManagerPathSegment {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    typeof value.id === 'string' &&
    typeof value.name === 'string'
  );
}

/** Whether the path holds anything but strings: object-path input for an engine without segment support. */
export function hasNonStringSegment(path: ReadonlyArray<unknown> | undefined): boolean {
  return path?.some((segment) => typeof segment !== 'string') ?? false;
}

/** The value an ancestor crumb hands to `onNavigate`: a deprecated string verbatim, or the segment's supplied id. */
export function pathSegmentTarget(segment: string | FileManagerPathSegment): string {
  return typeof segment === 'string' ? segment : segment.id;
}

/** The visible crumb label: a deprecated string verbatim, or the segment's name. */
export function pathSegmentLabel(segment: string | FileManagerPathSegment): string {
  return typeof segment === 'string' ? segment : segment.name;
}

/**
 * Returns why a path cannot be rendered on the Modern engine, or `undefined`.
 *
 * Strings pass untouched, including `''`, so a deprecated string path behaves
 * as before. A segment needs a string `id` and a string `name`, and its `id`
 * may not be `''`: an empty id is refused, never read as Root and never
 * replaced by the name. The whole path is checked, the current (last) element
 * included, so a crumb that could hand `''` to `onNavigate` never renders.
 * Whitespace-only ids are not refused; an id is opaque to the pattern.
 */
export function refuseInvalidPath(path: ReadonlyArray<unknown> | undefined): string | undefined {
  if (!path) return undefined;
  for (let index = 0; index < path.length; index += 1) {
    const segment = path[index];
    if (typeof segment === 'string') continue;
    if (!isPathSegment(segment)) {
      return (
        `currentPath[${index}] is neither a string nor a FileManagerPathSegment with a string ` +
        '`id` and a string `name`. Pass the folder segment the host resolved; this refusal ' +
        'applies in development and production.'
      );
    }
    if (segment.id === '') {
      return (
        `currentPath[${index}] is a FileManagerPathSegment with an empty \`id\`. A segment id is ` +
        'the stable folder id onNavigate receives; it is never empty, never taken from the name ' +
        'and never read as Root, which is onNavigate(null). Pass the folder\'s stable id; this ' +
        'refusal applies in development and production.'
      );
    }
  }
  return undefined;
}

function frozenEngineRefusal(engine: EngineName): string {
  return (
    `the frozen "${engine}" engine renders string breadcrumb paths only and cannot honor a ` +
    'FileManagerPathSegment. The segment is refused rather than rendered by its name, which ' +
    'would hand a folder name to onNavigate. Render PatternFileManager on the modern engine, or ' +
    'pass a string-only path. This refusal applies in development and production.'
  );
}

function customEngineRefusal(): string {
  return (
    'the custom engine renders a registered component pack, and no pack can prove that it ' +
    'honors a FileManagerPathSegment, so a path containing one is refused before the pack is ' +
    'resolved. Render PatternFileManager on the modern engine for segment paths, or pass a ' +
    'string-only path. This refusal applies in development and production.'
  );
}

/**
 * Loader adapter for an implementation authored against the string-path
 * {@link FileManagerProps} (the frozen Classic and Rustic engines), used as
 * `() => import('./engines/classic').then(admitStringPathOnly('classic'))`.
 *
 * A string-only path reaches the engine as the same strings in a fresh array
 * and every other prop is forwarded unchanged. Any other element throws the
 * named refusal while rendering, so the factory's per-instance error boundary
 * replaces the FileManager with its `role="alert"` fallback and no crumb can
 * fire `onNavigate`.
 *
 * @param engine - The engine the adapted module implements, named in the refusal.
 */
export function admitStringPathOnly(engine: EngineName) {
  return ({ default: Engine }: { default: ComponentType<FileManagerProps> }): {
    default: ComponentType<PatternFileManagerProps>;
  } => {
    function StringPathOnly({ currentPath, ...rest }: PatternFileManagerProps) {
      if (currentPath === undefined) return createElement(Engine, rest);
      const strings = currentPath.filter((segment): segment is string => typeof segment === 'string');
      if (strings.length !== currentPath.length) {
        throw new Error(`${COMPONENT_NAME}: ${frozenEngineRefusal(engine)}`);
      }
      return createElement(Engine, { ...rest, currentPath: strings });
    }
    StringPathOnly.displayName = `${COMPONENT_NAME}(${engine})`;
    return { default: StringPathOnly };
  };
}

/**
 * Guards the router against a segment path on the custom engine.
 *
 * The factory resolves a custom component pack inside the router, so no loader
 * adapter sits on that route. The engine is resolved the way the router
 * resolves it (`engine` prop, then the declared provider engine); on `custom`,
 * a path containing any non-string element throws the named refusal before the
 * router renders, in development and production. It reaches the nearest
 * ancestor error boundary, as the factory's own pre-render refusals do. String
 * paths and every other engine pass through untouched; an undeclared engine is
 * left to the router's own refusal.
 *
 * @param Router - The `createEngineComponent` router for the public props.
 * @returns A component with the router's props, ref and display name.
 */
export function guardCustomObjectPath(Router: PatternFileManagerRouter): PatternFileManagerRouter {
  const Guarded = forwardRef<unknown, PatternFileManagerRouterProps>(function PatternFileManager(props, ref) {
    const declaredEngine = useDeclaredEngine();
    const engine = props.engine ?? declaredEngine;
    const refusesSegments = engine === EXTENSION_ENGINE && hasNonStringSegment(props.currentPath);
    if (refusesSegments) throw new Error(`${COMPONENT_NAME}: ${customEngineRefusal()}`);
    return createElement(Router, { ...props, ref });
  });
  Guarded.displayName = COMPONENT_NAME;
  return Guarded;
}
