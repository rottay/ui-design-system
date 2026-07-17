/**
 * Canonical contracts shared by task-level pattern implementations and the
 * higher-level surfaces that compose them.
 *
 * Runtime pattern components remain under `ui/patterns`;
 * their dependency-free data shapes live here so foundation contracts never
 * import a rendered implementation tier.
 */

export * from './core';
export * from './communication';
export * from './data';
export * from './forms';
export * from './visualization';
