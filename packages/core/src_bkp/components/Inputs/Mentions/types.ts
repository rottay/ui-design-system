/**
 * Mentions Component Types
 *
 * Re-exports unified mentions types from /types/components/mentions
 */

export type {
  MentionOption,
  MentionsSize,
  MentionsStatus,
  MentionsPlacement,
  MentionsBaseProps,
  MentionsProps,
} from '../../../types/components/mentions';

export {
  defaultMentionFilter,
  extractMentionText,
  insertMention,
  getMentions,
} from '../../../types/components/mentions';
