/**
 * @fileoverview InputPassword - Rottay Design System
 * @description Compound component providing a password input with an integrated
 * visibility toggle button for showing or hiding the entered text.
 *
 * @remarks
 * InputPassword wraps the BaseInput component, toggling between `type="password"`
 * and `type="text"` based on user interaction. The visibility affordance uses
 * the governed `action.reveal` / `action.conceal` semantic icon roles; custom
 * icons remain supported via `visibleIcon` and `hiddenIcon` props.
 *
 * **Key Features:**
 * - Toggleable password visibility via suffix button
 * - Governed semantic reveal/conceal icons (tenant icon profile applies)
 * - Custom icon override support
 * - Inherits all BaseInput props (size, variant, status, etc.)
 * - Pointer activation preserves input focus; keyboard users can still reach
 *   and operate the toggle as a real button
 *
 * **Accessibility:**
 * - Toggle button includes `aria-label` ("Show password" / "Hide password")
 * - Toggle button exposes `aria-pressed` and localized labels, with a safe
 *   English fallback when rendered before an i18n provider mounts
 *
 * @example Basic Usage
 * ```tsx
 * import { Input } from '@rottay/design-system';
 *
 * <Input.Password placeholder="Enter your password" />
 * ```
 *
 * @example Without Visibility Toggle
 * ```tsx
 * <Input.Password
 *   placeholder="Enter your password"
 *   visibilityToggle={false}
 * />
 * ```
 *
 * @example Custom Toggle Icons
 * ```tsx
 * <Input.Password
 *   placeholder="Password"
 *   visibleIcon={<UnlockIcon />}
 *   hiddenIcon={<LockIcon />}
 * />
 * ```
 *
 * @see {@link Input} for the main input component
 * @see {@link BaseInput} for the underlying input implementation
 * @module InputPassword
 * @category Inputs
 * @package @rottay/design-system
 */

"use client";

import { useState } from "react";
import type { InputPasswordProps } from "../../contracts";
import { BaseInput } from "../../engines";
import { ActionRevealIcon } from "@/graphics/icons/presentation/semantic/generated/roles/action-reveal";
import { ActionConcealIcon } from "@/graphics/icons/presentation/semantic/generated/roles/action-conceal";
import { useOptionalTranslation } from "@/infrastructure/runtime/i18n";

/**
 * Password input with integrated visibility toggle.
 *
 * @description
 * Renders a BaseInput that switches between `type="password"` and `type="text"`
 * when the user clicks the visibility toggle button in the suffix slot.
 *
 * @param props - {@link InputPasswordProps} extending all standard input props
 * @returns A password input element with optional visibility toggle suffix
 *
 * @example
 * ```tsx
 * <InputPassword
 *   placeholder="Enter password"
 *   visibilityToggle
 *   onChange={(val) => setPassword(val)}
 * />
 * ```
 */
export const InputPassword = (props: InputPasswordProps) => {
  const translation = useOptionalTranslation("common");
  const {
    visibilityToggle = true,
    visibleIcon,
    hiddenIcon,
    ...inputProps
  } = props;

  const [visible, setVisible] = useState(false);

  const toggleButton = visibilityToggle ? (
    <button
      type="button"
      data-part="visibility-toggle"
      onClick={() => setVisible((current) => !current)}
      onPointerDown={(event) => event.preventDefault()}
      disabled={Boolean(inputProps.disabled || inputProps.loading)}
      aria-label={
        visible
          ? translation?.t("hide_password") ?? "Hide password"
          : translation?.t("show_password") ?? "Show password"
      }
      aria-pressed={visible}
    >
      {visible
        ? hiddenIcon || <ActionConcealIcon decorative size="sm" />
        : visibleIcon || <ActionRevealIcon decorative size="sm" />}
    </button>
  ) : null;

  return (
    <BaseInput
      {...inputProps}
      type={visible ? "text" : "password"}
      suffix={toggleButton}
    />
  );
};

InputPassword.displayName = "Input.Password";
