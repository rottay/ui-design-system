/**
 * The `chrome` node of the TenantThemeConfig v1 schema, composed in the
 * published field order: frame, controls, containers, families.
 */

import { object } from "../spec";
import { chromeContainerFields } from "./containers";
import { controls } from "./controls";
import { chromeFamilyFields } from "./families";
import { chromeFrameFields } from "./frame";

const chrome = object({
  ...chromeFrameFields,
  controls,
  ...chromeContainerFields,
  ...chromeFamilyFields,
});

export { chrome };
