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
 * - **Multi-engine support**: Titan (Ant Design), Hermes (DaisyUI), Apollo (Vanilla)
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
 * // Titan engine (Ant Design - default)
 * <Mentions engine="titan" options={users} autoSize />
 *
 * // Hermes engine (DaisyUI/Tailwind)
 * <Mentions engine="hermes" options={users} rows={5} />
 *
 * // Apollo engine (Pure HTML/CSS)
 * <Mentions engine="apollo" options={users} />
 * ```
 *
 * @see {@link MentionsProps} for component props
 * @see {@link MentionsOption} for option structure
 * @module Mentions
 * @category Inputs
 * @package @rottay/design-system
 */
import { createEngineComponent } from '../../../../core/engines/factory';
import type { MentionsProps } from './types';

// Export types
export {
  type MentionsProps,
  type MentionsOption,
  type MentionsPlacement,
  type MentionsStatus,
  MENTIONS_DEFAULTS,
} from './types';

/**
 * Create engine-aware Mentions component.
 *
 * The Mentions component automatically selects the appropriate rendering engine
 * based on the current context or explicit engine prop.
 *
 * Engines:
 * - **titan**: Full-featured implementation using Ant Design (default)
 * - **hermes**: Lightweight implementation using DaisyUI/Tailwind
 * - **apollo**: Headless implementation using vanilla HTML/CSS
 */
export const Mentions = createEngineComponent<MentionsProps>('Mentions', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Mentions;
