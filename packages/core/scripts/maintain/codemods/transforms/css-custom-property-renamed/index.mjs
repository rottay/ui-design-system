import { tokenReporter } from '../css-class-renamed/index.mjs';

/**
 * A `--ds-*` custom property the package stopped emitting. Consumers read and declare channels in the same
 * namespace, so the class is report-only: each exact name is reported with its recorded successor, if any.
 */
export const transform = tokenReporter({
  className: 'css-custom-property-renamed',
  tableOf: (entry) => entry.properties,
  prefixesOf: (entry) => entry.prefixes,
  why: 'a custom property name is not resolvable through an import; move the read by hand',
});
