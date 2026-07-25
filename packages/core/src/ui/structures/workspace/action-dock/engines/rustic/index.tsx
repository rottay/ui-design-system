/**
 * @fileoverview Rustic engine for ActionDock.
 *
 * ActionDock is engine-agnostic (uses DS primitives Box/Flex/Button/Dropdown
 * which resolve through engines themselves), so all three engine entry points
 * delegate to the shared implementation.
 */

export { default } from '../../runtime/rendering';
