'use client';

/**
 * @fileoverview AutoComplete Component - Rottay Design System
 * @description An input component with dropdown suggestions that provides
 * type-ahead search functionality with customizable filtering and selection.
 *
 * @remarks
 * The AutoComplete component provides intelligent input suggestions for:
 * - **Search boxes**: Type-ahead search with dynamic suggestions
 * - **Form inputs**: Autocomplete for addresses, names, emails
 * - **Command palettes**: Quick action search interfaces
 * - **Tag entry**: Suggesting existing tags while typing
 *
 * Key features:
 * - **Multi-engine support**: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla)
 * - **Custom filtering**: Built-in or custom filter functions
 * - **Async search**: Fetch suggestions dynamically via onSearch
 * - **Custom rendering**: Custom option labels and content
 * - **Keyboard navigation**: Full keyboard accessibility
 * - **Controlled/uncontrolled**: Full state management flexibility
 *
 * @example Basic autocomplete
 * ```tsx
 * import { AutoComplete } from '@rottay/design-system';
 *
 * <AutoComplete
 *   options={[
 *     { value: 'React' },
 *     { value: 'Vue' },
 *     { value: 'Angular' },
 *   ]}
 *   placeholder="Search frameworks"
 * />
 * ```
 *
 * @example Async search with API
 * ```tsx
 * const [options, setOptions] = useState([]);
 *
 * <AutoComplete
 *   options={options}
 *   onSearch={async (text) => {
 *     const results = await fetchSuggestions(text);
 *     setOptions(results.map(r => ({ value: r.name })));
 *   }}
 *   onChange={(value) => setValue(value)}
 *   placeholder="Search users..."
 * />
 * ```
 *
 * @example Custom filter function
 * ```tsx
 * <AutoComplete
 *   options={options}
 *   filterOption={(input, option) =>
 *     option.value.toLowerCase().includes(input.toLowerCase())
 *   }
 * />
 * ```
 *
 * @example With custom option labels
 * ```tsx
 * <AutoComplete
 *   options={[
 *     { value: 'react', label: <span>⚛️ React</span> },
 *     { value: 'vue', label: <span>💚 Vue</span> },
 *   ]}
 *   onSelect={(value, option) => console.log('Selected:', value)}
 * />
 * ```
 *
 * @example Multi-engine usage
 * ```tsx
 * // Classic engine (Ant Design - default)
 * <AutoComplete engine="classic" options={options} allowClear />
 *
 * // Modern engine (DaisyUI/Tailwind)
 * <AutoComplete engine="modern" options={options} size="large" />
 *
 * // Rustic engine (Pure HTML/CSS)
 * <AutoComplete engine="rustic" options={options} />
 * ```
 *
 * @see {@link AutoCompleteProps} for component props
 * @see {@link AutoCompleteOption} for option structure
 * @module AutoComplete
 * @category Inputs
 * @package @rottay/design-system
 */
import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { AutoCompleteProps } from './AutoComplete.types';

// Export types
export {
  type AutoCompleteProps,
  type AutoCompleteOption,
  type AutoCompleteSize,
  AUTOCOMPLETE_DEFAULTS,
} from './AutoComplete.types';

/**
 * Create engine-aware AutoComplete component.
 *
 * The AutoComplete component automatically selects the appropriate rendering engine
 * based on the current context or explicit engine prop.
 *
 * Engines:
 * - **classic**: Full-featured implementation using Ant Design (default)
 * - **modern**: Lightweight implementation using DaisyUI/Tailwind
 * - **rustic**: Headless implementation using vanilla HTML/CSS
 */
export const AutoComplete = createEngineComponent<AutoCompleteProps>('AutoComplete', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

export default AutoComplete;
