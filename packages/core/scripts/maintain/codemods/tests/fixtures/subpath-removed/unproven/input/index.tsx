import * as ButtonDoor from '@rottay/design-system/primitives/button';
import { Button, ButtonGroupLegacy } from '@rottay/design-system/primitives/button';
import { resolveSpatialPolicy } from '@rottay/design-system/spatial/spec';
import { Reveal } from '@rottay/design-system/effects';
import { Thing } from '@rottay/design-system/never-published';
import '@rottay/design-system/commercial.css';
import { AsciiFrame, ProductWindow, TreeView } from '@rottay/design-system/commercial';

export * from '@rottay/design-system/primitives/tabs';

export async function load() {
  const door = await import('@rottay/design-system/primitives/select');
  return [door, AsciiFrame, ProductWindow, TreeView, ButtonDoor, Button, ButtonGroupLegacy, resolveSpatialPolicy, Reveal, Thing];
}

export type Late = import('@rottay/design-system/primitives/card').CardProps;
