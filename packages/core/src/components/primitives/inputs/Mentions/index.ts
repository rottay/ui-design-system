'use client';

/**
 * @fileoverview Mentions Component - Rottay Design System
 * @description A textarea input with @mention functionality that provides dropdown
 * suggestions when typing trigger characters like @ or #.
 *
 * @remarks
 * The Mentions component provides @mention functionality for:
 * - **Social features**: @mentioning users in comments, posts
 * - **Collaboration tools**: Tagging team members in discussions
 * - **Issue tracking**: Referencing users, issues, or PRs
 * - **Tagging systems**: #hashtags, #topics, #categories
 *
 * Key features:
 * - **Multi-engine support**: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla)
 * - **Custom prefixes**: Support for @, #, or any custom trigger
 * - **Multiple prefixes**: Different suggestions for different triggers
 * - **Async search**: Fetch suggestions dynamically
 * - **Auto-sizing**: Textarea grows with content
 * - **Controlled/uncontrolled**: Full state management flexibility
 *
 * @example Basic @mentions
 * ```tsx
 * import { Mentions } from '@rottay/design-system';
 *
 * <Mentions
 *   options={[
 *     { value: 'john', label: 'John Doe' },
 *     { value: 'jane', label: 'Jane Smith' },
 *   ]}
 *   placeholder="Type @ to mention someone"
 * />
 * ```
 *
 * @example Async search for users
 * ```tsx
 * const [options, setOptions] = useState([]);
 *
 * <Mentions
 *   options={options}
 *   onSearch={async (text, prefix) => {
 *     const users = await searchUsers(text);
 *     setOptions(users.map(u => ({ value: u.id, label: u.name })));
 *   }}
 *   placeholder="Type @ to search users"
 * />
 * ```
 *
 * @example Hashtag support
 * ```tsx
 * <Mentions
 *   options={tags}
 *   prefix="#"
 *   placeholder="Type # to add a tag"
 * />
 * ```
 *
 * @example Multiple prefixes
 * ```tsx
 * <Mentions
 *   options={options}
 *   prefix={['@', '#']}
 *   onSearch={(text, prefix) => {
 *     if (prefix === '@') fetchUsers(text);
 *     if (prefix === '#') fetchTags(text);
 *   }}
 * />
 * ```
 *
 * @example Multi-engine usage
 * ```tsx
 * // Classic engine (Ant Design - default)
 * <Mentions engine="classic" options={users} autoSize />
 *
 * // Modern engine (DaisyUI/Tailwind)
 * <Mentions engine="modern" options={users} rows={5} />
 *
 * // Rustic engine (Pure HTML/CSS)
 * <Mentions engine="rustic" options={users} />
 * ```
 *
 * @see {@link MentionsProps} for component props
 * @see {@link MentionsOption} for option structure
 * @module Mentions
 * @category Inputs
 * @package @rottay/design-system
 */
import { createEngineComponent } from '../../../../engines/factory';
import type { MentionsProps } from './Mentions.types';

// Export types
export {
  type MentionsProps,
  type MentionsOption,
  type MentionsPlacement,
  type MentionsStatus,
  MENTIONS_DEFAULTS,
} from './Mentions.types';

/**
 * Create engine-aware Mentions component.
 *
 * The Mentions component automatically selects the appropriate rendering engine
 * based on the current context or explicit engine prop.
 *
 * Engines:
 * - **classic**: Full-featured implementation using Ant Design (default)
 * - **modern**: Lightweight implementation using DaisyUI/Tailwind
 * - **rustic**: Headless implementation using vanilla HTML/CSS
 */
export const Mentions = createEngineComponent<MentionsProps>('Mentions', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

export default Mentions;
