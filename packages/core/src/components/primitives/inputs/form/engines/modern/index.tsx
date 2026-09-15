'use client';

/**
 * @fileoverview The Modern Form: markup and anatomy over the shared form
 * runtime, painted by the form skin.
 */

import React, { useImperativeHandle } from 'react';
import type { FormProps, FormItemProps, FormErrorListProps, FormInstance } from '../../contracts';
import { FORM_DEFAULTS } from '../../contracts';
import { toCanonicalSize } from '../../../../../../foundation/contracts/kernel/common';
import type { ResolvedFormAdaptation } from '../../../../../../foundation/contracts/kernel/adaptation';
import { partAttributes, useInteractionState } from '@/foundation/behavior';
import { useAdaptation } from '@/infrastructure/runtime/adaptation';
import { useTranslation } from '@/infrastructure/runtime/i18n';
import { FeedbackHelpIcon } from '@/graphics/icons/semantic/generated/roles/feedback-help';
import { StatusErrorIcon } from '@/graphics/icons/semantic/generated/roles/status-error';
import { StatusLoadingIcon } from '@/graphics/icons/semantic/generated/roles/status-loading';
import { StatusSuccessIcon } from '@/graphics/icons/semantic/generated/roles/status-success';
import { StatusWarningIcon } from '@/graphics/icons/semantic/generated/roles/status-warning';
import { FormContext, bindFormItemControls, composeForm, useForm, useFormErrors, useFormItem, useFormRoot } from '../../runtime/state';

export { useForm };

/**
 * Renders a semantic DS icon corresponding to the current validation status.
 */
const FeedbackIcon: React.FC<{ status: 'success' | 'error' | 'warning' | 'validating' }> = ({ status }) => {
  const { t } = useTranslation('validation');
  const Icon = status === 'success'
    ? StatusSuccessIcon
    : status === 'error'
      ? StatusErrorIcon
      : status === 'warning'
        ? StatusWarningIcon
        : StatusLoadingIcon;
  const labelKey = status === 'success'
    ? 'passed'
    : status === 'error'
      ? 'failed'
      : status === 'warning'
        ? 'warning_state'
        : 'validating';

  // Announcement de-duplication (a11y law: no duplicated status announcements):
  // in the error posture the message's own `role="alert"` already announces
  // the failure WITH its text, so the icon bows out (decorative). For
  // success/warning/validating there is no alert anywhere, so the icon keeps
  // the `role="status"` channel as the only announcement.
  const announcementOwnedByAlert = status === 'error';

  return (
    <span
      data-part="feedback-icon"
      data-status={status}
      role={announcementOwnedByAlert ? undefined : 'status'}
      aria-label={announcementOwnedByAlert ? undefined : t(labelKey)}
      aria-hidden={announcementOwnedByAlert || undefined}
    >
      <Icon decorative size={15} />
    </span>
  );
};

const FormBase = React.forwardRef<FormInstance, FormProps>((props, ref) => {
  const { layout = FORM_DEFAULTS.layout, adapt, size = 'default', disabled = false, name, children, className = '', style, autoComplete = 'on' } = props;
  const [formElement, setFormElement] = React.useState<HTMLFormElement | null>(null);
  const containerRef = React.useMemo(() => ({ current: formElement }), [formElement]);
  const base = React.useMemo<ResolvedFormAdaptation>(() => ({ layout }), [layout]);
  const { adaptation, postureAttribute } = useAdaptation(adapt, { base, containerRef });
  const { resolvedForm, formRef, contextValue, handleSubmit } = useFormRoot(props, adaptation.layout);

  const attachForm = React.useCallback((element: HTMLFormElement | null) => {
    formRef.current = element;
    setFormElement(element);
  }, [formRef]);

  useImperativeHandle(ref, () => resolvedForm as FormInstance, [resolvedForm]);

  return (
    <FormContext.Provider value={contextValue}>
      <form
        ref={attachForm}
        name={name}
        role="form"
        className={`ds-form ds-form--modern ${className}`.trim()}
        data-part="root"
        data-layout={adaptation.layout}
        data-posture={postureAttribute}
        data-size={toCanonicalSize(size)}
        data-disabled={disabled || undefined}
        style={style}
        onSubmit={handleSubmit}
        autoComplete={autoComplete}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
});

FormBase.displayName = 'Form.Modern';

/** The tooltip affordance beside a label; its hover and press are decided by the interaction kernel. */
const FormItemTooltip: React.FC<{ tooltip: FormItemProps['tooltip'] }> = ({ tooltip }) => {
  const { state, handlers } = useInteractionState();
  return (
    <span
      {...partAttributes('tooltip-icon', state)}
      {...handlers}
      title={typeof tooltip === 'string' ? tooltip : undefined}
    >
      <FeedbackHelpIcon decorative size={13} />
    </span>
  );
};

const FormItem: React.FC<FormItemProps> = (props) => {
  const { t } = useTranslation('common');
  const { label, extra, help, hidden, tooltip, children, className = '', style } = props;
  const item = useFormItem(props);
  const { layout, requiredMark, labelAlign } = item.context;
  const { fieldErrors, fieldWarnings, hasError, isWarning, isRequired, showColon, showFeedback, feedbackStatus } = item;
  // The label's htmlFor must track the control the item ACTUALLY points at:
  // a child with its own `id` wins over the generated one.
  const firstChildProvidedId = React.Children.toArray(children).reduce<string | undefined>(
    (found, child) => found ?? (React.isValidElement<{ id?: string }>(child) ? child.props.id : undefined),
    undefined,
  );
  const resolvedControlId = firstChildProvidedId ?? item.generatedControlId;
  const messageId = item.generatedControlId ? `${item.generatedControlId}-message` : undefined;

  if (hidden) return null;

  const message = help || fieldErrors[0] || fieldWarnings[0];
  const childrenWithProps = bindFormItemControls(children, item, {
    describedBy: message || extra ? messageId : undefined,
  });

  // Layout (horizontal label split, label/field geometry, message rhythm) is
  // owned by the form.css skin, keyed on `data-layout` here and `data-size`
  // on the form root -- moving it out of inline styles also revives the
  // skin's `@container` collapse for horizontal items on narrow containers,
  // which an inline `flexDirection` previously overrode.
  return (
    <div
      className={`ds-form-item ds-form-item--modern ${className || ''}`}
      data-part="item"
      data-layout={layout}
      data-validation={feedbackStatus ?? 'neutral'}
      data-required={isRequired || undefined}
      style={style}
    >
      {label && (
        <label
          htmlFor={resolvedControlId}
          data-part="label"
          data-label-align={layout === 'horizontal' ? labelAlign : undefined}
        >
          <span data-part="label-text">
            {label}
            {isRequired && requiredMark && (
              <span data-part="required-mark" data-kind="required">*</span>
            )}
            {showColon && ':'}
          </span>
          {!isRequired && requiredMark === 'optional' && (
            <span data-part="required-mark" data-kind="optional">{t('optional')}</span>
          )}
          {tooltip && <FormItemTooltip tooltip={tooltip} />}
        </label>
      )}
      <div data-part="field">
        <div data-part="control-row">
          <div data-part="control">{childrenWithProps}</div>
          {showFeedback && feedbackStatus && (
            <FeedbackIcon status={feedbackStatus} />
          )}
        </div>
        {message && (
          <div data-part="message" id={messageId} role={hasError ? 'alert' : undefined}>
            {/* Error posture rides shape + live announcement, never hue alone:
                same governed status.error idiom as FormField's error-icon. */}
            {hasError && (
              <StatusErrorIcon decorative size={13} data-part="error-icon" />
            )}
            <span data-part="help-text" data-error={hasError ? 'true' : 'false'} data-tone={isWarning && !hasError ? 'warning' : undefined}>
              {message}
            </span>
          </div>
        )}
        {extra && (
          <div data-part="message" id={!message ? messageId : undefined}>
            <span data-part="extra-text">{extra}</span>
          </div>
        )}
      </div>
    </div>
  );
};

FormItem.displayName = 'Form.Item.Modern';

const FormErrorList: React.FC<FormErrorListProps> = (props) => {
  const { fieldName, className = '', style } = props;
  const errors = useFormErrors(fieldName);

  if (!errors || errors.length === 0) return null;

  return (
    <ul data-part="error-list" role="alert" className={`ds-form-error-list ds-form-error-list--modern ${className}`} style={{ ...style }}>
      {errors.map((error, index) => (
        <li key={index} data-part="error-item">
          <StatusErrorIcon decorative size={14} />
          <span>{error}</span>
        </li>
      ))}
    </ul>
  );
};

FormErrorList.displayName = 'Form.ErrorList.Modern';

export const Form = composeForm(FormBase, { Item: FormItem, ErrorList: FormErrorList });

export default Form;
