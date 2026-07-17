import {
  SPATIAL_SCENE_MODULE_VERSION,
  type SpatialSceneModuleContract,
} from '../../../../../foundation/contracts/kernel/spatial';

type SpatialSceneFunction = (...args: never[]) => unknown;

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
  return (typeof value === 'object' || typeof value === 'function')
    && value !== null
    && !Array.isArray(value);
}

function hasOwn(value: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

/**
 * Validate an app-loaded scene module at the supplier-neutral boundary.
 * Getters/proxies are untrusted and every exception fails closed.
 */
export function isSpatialSceneModule(
  value: unknown,
): value is SpatialSceneModuleContract<SpatialSceneFunction> {
  try {
    if (!isRecord(value)) return false;
    if (!hasOwn(value, 'version') || !hasOwn(value, 'backend') || !hasOwn(value, 'Scene')) {
      return false;
    }

    return Reflect.get(value, 'version') === SPATIAL_SCENE_MODULE_VERSION
      && Reflect.get(value, 'backend') === 'webgl2'
      && typeof Reflect.get(value, 'Scene') === 'function';
  } catch {
    return false;
  }
}
