/**
 * @fileoverview InputSearch - Rottay Design System
 * @description Compound component providing a search input with an integrated
 * search button/icon and an `onSearch` callback triggered on Enter or click.
 *
 * @remarks
 * InputSearch wraps the BaseInput component, adding a search action button
 * in the suffix slot. The search callback fires when the user presses Enter
 * or clicks the search icon/button.
 *
 * **Key Features:**
 * - Built-in governed search icon (semantic `action.search` role)
 * - `onSearch` callback triggered on Enter key or button click
 * - Optional custom search button text via `searchButtonText`
 * - Toggleable search button visibility via `showSearchButton`
 * - Inherits all BaseInput props (size, variant, status, etc.)
 *
 * **Keyboard Interaction:**
 * - Enter key triggers `onSearch` with the current input value
 * - Other key events are forwarded to `onKeyDown` if provided
 *
 * @example Basic Search
 * ```tsx
 * import { Input } from '@rottay/design-system';
 *
 * <Input.Search
 *   placeholder="Search..."
 *   onSearch={(value) => handleSearch(value)}
 * />
 * ```
 *
 * @example With Custom Button Text
 * ```tsx
 * <Input.Search
 *   placeholder="Search users..."
 *   onSearch={handleSearch}
 *   searchButtonText="Go"
 * />
 * ```
 *
 * @see {@link Input} for the main input component
 * @see {@link BaseInput} for the underlying input implementation
 * @module InputSearch
 * @category Inputs
 * @package @rottay/design-system
 */

"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import type { InputSearchProps } from "../../contracts";
import { BaseInput } from "../../engines";
import { ActionSearchIcon } from "@/graphics/icons/presentation/semantic/generated/roles/action-search";
import { useOptionalTranslation } from "@/infrastructure/runtime/i18n";

/**
 * Search input with integrated search action button.
 *
 * @description
 * Renders a BaseInput with a search icon/button in the suffix slot.
 * The `onSearch` callback is invoked when the user presses Enter or
 * clicks the search button.
 *
 * @param props - {@link InputSearchProps} extending all standard input props
 * @returns A text input element with a search button suffix
 *
 * @example
 * ```tsx
 * <InputSearch
 *   placeholder="Search products..."
 *   onSearch={(value) => fetchResults(value)}
 *   showSearchButton
 * />
 * ```
 */
export const InputSearch = (props: InputSearchProps) => {
  const translation = useOptionalTranslation("common");
  const {
    onSearch,
    loading = false,
    showSearchButton = true,
    searchButtonText,
    ...inputProps
  } = props;
  const queryRef = useRef(
    String(inputProps.value ?? inputProps.defaultValue ?? "")
  );

  useEffect(() => {
    if (inputProps.value !== undefined)
      queryRef.current = String(inputProps.value);
  }, [inputProps.value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      onSearch?.(e.currentTarget.value);
    }
    inputProps.onKeyDown?.(e);
  };

  const handleChange: InputSearchProps["onChange"] = (value, event) => {
    queryRef.current = value;
    inputProps.onChange?.(value, event);
  };

  const searchButton = showSearchButton ? (
    <button
      type="button"
      data-part="search-button"
      onClick={() => onSearch?.(queryRef.current)}
      onPointerDown={(event) => event.preventDefault()}
      aria-label={translation?.t("search") ?? "Search"}
      disabled={Boolean(loading || inputProps.disabled)}
    >
      {searchButtonText || <ActionSearchIcon decorative size="sm" />}
    </button>
  ) : null;

  return (
    <BaseInput
      {...inputProps}
      type="text"
      loading={loading || undefined}
      suffix={searchButton}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
};

InputSearch.displayName = "Input.Search";
