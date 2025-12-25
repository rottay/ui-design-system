/**
 * Result Component Types
 *
 * Re-exports from central type definitions to maintain backwards compatibility
 * and provide a single import point for consumers.
 */

export type {
  ResultStatus,
  ResultBaseProps,
  ResultProps,
  StatusConfig,
} from '../../../types/components/result';

export {
  getStatusIcon,
  getStatusColor,
  getStatusBgColor,
  isHttpErrorStatus,
  isStandardStatus,
} from '../../../types/components/result';
