import { describe, expect, it } from 'vitest';

import {
  SPATIAL_SCENE_MODULE_VERSION,
  isSpatialSceneModule,
} from '../../../../../../entrypoints/graphics/spatial/spec';

function Scene(): null {
  return null;
}

describe('isSpatialSceneModule', () => {
  it('accepts only the exact supplier-neutral v1 WebGL2 shape', () => {
    const module = Object.freeze({
      version: SPATIAL_SCENE_MODULE_VERSION,
      backend: 'webgl2',
      Scene,
    });

    expect(isSpatialSceneModule(module)).toBe(true);
    expect(isSpatialSceneModule({ ...module, version: 2 })).toBe(false);
    expect(isSpatialSceneModule({ ...module, backend: 'none' })).toBe(false);
    expect(isSpatialSceneModule({ ...module, backend: 'webgpu' })).toBe(false);
    expect(isSpatialSceneModule({ ...module, Scene: {} })).toBe(false);
  });

  it('rejects arrays, inherited fields, missing fields and null', () => {
    expect(isSpatialSceneModule(null)).toBe(false);
    expect(isSpatialSceneModule([])).toBe(false);
    expect(isSpatialSceneModule({ version: 1, backend: 'webgl2' })).toBe(false);
    expect(isSpatialSceneModule(Object.create({
      version: 1,
      backend: 'webgl2',
      Scene,
    }))).toBe(false);
  });

  it('fails closed on throwing getters and hostile proxy traps', () => {
    const throwingGetter = {
      version: 1,
      backend: 'webgl2',
      get Scene(): never {
        throw new Error('hostile Scene getter');
      },
    };
    expect(isSpatialSceneModule(throwingGetter)).toBe(false);

    const hostileProxy = new Proxy({}, {
      getOwnPropertyDescriptor() {
        throw new Error('hostile descriptor trap');
      },
    });
    expect(isSpatialSceneModule(hostileProxy)).toBe(false);
  });
});
