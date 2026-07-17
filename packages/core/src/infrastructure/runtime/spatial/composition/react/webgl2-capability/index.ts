'use client';

import { useEffect, useState } from 'react';

import {
  probeWebGL2Capability,
  type WebGL2Capability,
} from '../../../runtime/browser/capability/webgl2';

/** Probe only after every cheaper policy gate has admitted the experience. */
export function useWebGL2Capability(enabled: boolean, probeKey = 0): WebGL2Capability {
  const [capability, setCapability] = useState<WebGL2Capability>('unknown');

  useEffect(() => {
    if (!enabled) {
      setCapability('unknown');
      return;
    }
    setCapability(probeWebGL2Capability());
  }, [enabled, probeKey]);

  return capability;
}
