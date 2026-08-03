'use client';

/**
 * @fileoverview Modern engine for the PricingTable pattern.
 *
 * A feature-comparison grid: plans are columns, features are rows, and every
 * control COMPOSES a certified primitive -- Button (per-plan CTA), Checkbox
 * (billing-cycle toggle, see the role note below), Tag (recommended-plan
 * badge), Tooltip (feature descriptions) and Empty (no plans). The engine
 * stamps only anatomy (`data-part` / `data-highlighted` / `data-feature-state`
 * / `data-cycle`) plus private BEM classes; every visual decision lives in the
 * modern skin (`runtime/engines/modern/skin/pricing-table.css`).
 *
 * ROLE PIN: the family tests resolve the billing toggle via `getByRole(
 * 'checkbox')` for every non-classic engine, so the toggle composes Checkbox
 * (native checkbox role). A Segmented/Switch composition would flip the role
 * to 'switch' and break the pin -- documented here, tests untouched.
 *
 * Copy: the only owned strings are control chrome (toggle labels, column
 * heading, badge, loading and feature-state names). They run through the
 * guarded i18n channel with documented English floors; plans, prices, CTAs
 * and feature labels are always caller DATA, never copy.
 *
 * @module Patterns/PricingTable/Engines/Modern
 * @category Patterns
 * @package @rottay/design-system
 */

import React from 'react';

import Button from '../../../../../primitives/inputs/Button/engines/modern';
import Checkbox from '../../../../../primitives/inputs/Checkbox/engines/modern';
import Empty from '../../../../../primitives/display/Empty/engines/modern';
import Tag from '../../../../../primitives/display/Tag/engines/modern';
import Tooltip from '../../../../../primitives/display/Tooltip/engines/modern';
import { CheckIcon, XIcon } from '../../../../../../graphics/icons';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

import type { PricingTableProps } from '../../contracts';

/**
 * Tri-state feature indicator. Included/excluded are governed icons read by
 * shape (check vs cross) with ink as reinforcement -- never hue alone -- and
 * announced via `role="img"` + `aria-label`; custom values render as text.
 */
function FeatureValue({
  value,
  labels,
}: {
  value: boolean | string | undefined;
  labels: Record<string, string>;
}) {
  if (value === true) {
    return (
      <span
        data-part="feature-value"
        data-feature-state="included"
        className="ds-pricing-table__feature-value"
        role="img"
        aria-label={labels.included}
      >
        <CheckIcon size={14} />
      </span>
    );
  }
  if (value === false || value === undefined) {
    return (
      <span
        data-part="feature-value"
        data-feature-state="excluded"
        className="ds-pricing-table__feature-value"
        role="img"
        aria-label={labels.excluded}
      >
        <XIcon size={14} />
      </span>
    );
  }
  return (
    <span
      data-part="feature-value"
      data-feature-state="custom"
      className="ds-pricing-table__feature-value"
    >
      {value}
    </span>
  );
}

/**
 * Modern engine implementation of the PricingTable pattern.
 *
 * Renders the comparison grid with an opt-in billing-cycle toggle, plan
 * headers with price hierarchy (currency / amount / period), tri-state
 * feature cells and per-plan CTA Buttons. Composes Button, Checkbox, Tag,
 * Tooltip and Empty; owns no paint.
 */
export default function ModernPricingTable(props: PricingTableProps) {
  const {
    plans,
    features,
    highlightedPlan,
    onSelectPlan,
    billingCycle,
    onBillingCycleChange,
    currency = '$',
    renderPlanHeader,
    loading,
    className,
    style,
  } = props;

  // Guarded i18n channel: a missing catalog key echoes the full key back,
  // which the endsWith guard swaps for the documented English floor.
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, fallback: string): string => {
    const translated = i18n?.t(key);
    return translated && !translated.endsWith(key) ? translated : fallback;
  };
  const labels: Record<string, string> = {
    monthly: tOr('pricingTable.monthly', 'Monthly'),
    yearly: tOr('pricingTable.yearly', 'Yearly'),
    features: tOr('pricingTable.features', 'Features'),
    mostPopular: tOr('pricingTable.mostPopular', 'Most Popular'),
    savings: tOr('pricingTable.savings', 'Save 20%'),
    loading: tOr('pricingTable.loading', 'Loading'),
    included: tOr('pricingTable.included', 'Included'),
    excluded: tOr('pricingTable.excluded', 'Not included'),
    empty: tOr('pricingTable.empty', 'No plans available'),
  };

  const rootClass = `ds-pattern-pricing-table ds-engine-modern ${className ?? ''}`;
  const cycle = billingCycle ?? 'monthly';

  /* Loading: shaped skeleton mirror that conserves the loaded footprint
     (contract: "displays a loading skeleton instead of content") -- the
     opt-in toggle pill, one card per plan column and one line per feature
     row, so the swap to real content never reflows the page. The `spinner`
     part stays as the accessible status announcement (its presence is a
     test pin); the skin hides it visually while the skeleton carries the
     loading cue. Skeleton geometry is chrome, so it is `aria-hidden`. */
  if (loading) {
    return (
      <div
        className={rootClass}
        data-part="root"
        data-loading={true}
        data-cycle={cycle}
        style={style}
      >
        <span
          data-part="spinner"
          className="ds-pricing-table__spinner"
          role="status"
          aria-label={labels.loading}
        />
        {onBillingCycleChange && (
          <div
            data-part="skeleton-toggle"
            className="ds-pricing-table__skeleton-toggle"
            aria-hidden="true"
          />
        )}
        <div
          data-part="skeleton-plans"
          className="ds-pricing-table__skeleton-plans"
          aria-hidden="true"
        >
          {plans.map((plan) => (
            <div
              key={plan.id}
              data-part="skeleton-plan"
              className="ds-pricing-table__skeleton-plan"
            />
          ))}
        </div>
        <div
          data-part="skeleton-rows"
          className="ds-pricing-table__skeleton-rows"
          aria-hidden="true"
        >
          {features.map((feature) => (
            <div
              key={feature.key}
              data-part="skeleton-row"
              className="ds-pricing-table__skeleton-row"
            />
          ))}
        </div>
      </div>
    );
  }

  /* No plans: composed Empty, never an orphaned grid. */
  if (plans.length === 0) {
    return (
      <div
        className={rootClass}
        data-part="root"
        data-loading={false}
        data-cycle={cycle}
        style={style}
      >
        <div data-part="empty" className="ds-pricing-table__empty">
          <Empty image="simple" description={labels.empty} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={rootClass}
      data-part="root"
      data-loading={false}
      data-cycle={cycle}
      style={style}
    >
      {/* Billing toggle -- opt-in: only rendered when the consumer provides a
          billing-cycle change handler. Composes the certified Checkbox (role
          pin documented above). */}
      {onBillingCycleChange && (
        <div
          data-part="toggle"
          data-cycle={cycle}
          className="ds-pricing-table__toggle"
        >
          <span
            data-part="toggle-label"
            data-active={cycle === 'monthly' ? 'true' : 'false'}
            className="ds-pricing-table__toggle-label"
          >
            {labels.monthly}
          </span>
          <span
            data-part="toggle-control"
            className="ds-pricing-table__toggle-control"
          >
            <Checkbox
              size="sm"
              checked={cycle === 'yearly'}
              onChange={(checked) =>
                onBillingCycleChange(checked ? 'yearly' : 'monthly')
              }
            />
          </span>
          <span
            data-part="toggle-label"
            data-active={cycle === 'yearly' ? 'true' : 'false'}
            className="ds-pricing-table__toggle-label"
          >
            {labels.yearly}
          </span>
          <span data-part="plan-badge" data-variant="savings">
            <Tag tone="success" size="sm">
              {labels.savings}
            </Tag>
          </span>
        </div>
      )}

      {/* Comparison grid: semantic table, caller data only. */}
      <div data-part="scroll" className="ds-pricing-table__scroll">
        <table className="ds-pricing-table__table">
          <thead>
            <tr>
              <th
                data-part="features-head"
                className="ds-pricing-table__features-head"
              >
                {labels.features}
              </th>
              {plans.map((plan) => {
                const isHighlighted = plan.id === highlightedPlan || plan.popular;
                return (
                  <th
                    key={plan.id}
                    data-part="plan-head"
                    className="ds-pricing-table__plan-head"
                  >
                    {/* renderPlanHeader lets consumers fully replace the card
                        content (and with it the recommended-plan badge). */}
                    {renderPlanHeader ? (
                      renderPlanHeader(plan)
                    ) : (
                      <div
                        data-part="plan-card"
                        data-highlighted={isHighlighted}
                        className="ds-pricing-table__plan-card"
                      >
                        {plan.popular && (
                          <span data-part="plan-badge" data-variant="popular">
                            <Tag
                              tone="primary"
                              size="sm"
                              className="ds-pricing-table__plan-badge"
                            >
                              {labels.mostPopular}
                            </Tag>
                          </span>
                        )}
                        <div
                          data-part="plan-name"
                          className="ds-pricing-table__plan-name"
                        >
                          {plan.name}
                        </div>
                        {/* Price hierarchy: currency / amount / period. Amount
                            is numeric data -- the skin owns tabular-nums and
                            bidi isolation so RTL never reorders the pair. */}
                        <div data-part="price" className="ds-pricing-table__price">
                          {typeof plan.price === 'number' ? (
                            <>
                              <span
                                data-part="price-currency"
                                className="ds-pricing-table__price-currency"
                              >
                                {currency}
                              </span>
                              <span
                                data-part="price-amount"
                                className="ds-pricing-table__price-amount"
                              >
                                {plan.price}
                              </span>
                            </>
                          ) : (
                            <span
                              data-part="price-amount"
                              className="ds-pricing-table__price-amount"
                            >
                              {plan.price}
                            </span>
                          )}
                        </div>
                        {plan.priceNote && (
                          <div
                            data-part="price-period"
                            className="ds-pricing-table__price-period"
                          >
                            {plan.priceNote}
                          </div>
                        )}
                        {plan.description && (
                          <div
                            data-part="plan-description"
                            className="ds-pricing-table__plan-description"
                          >
                            {plan.description}
                          </div>
                        )}
                        {/* CTA: certified Button, primary only on the
                            highlighted plan (variant coherence with the
                            recommended frame), full-width via `block`. */}
                        <div
                          data-part="cta"
                          data-highlighted={isHighlighted}
                          className="ds-pricing-table__cta"
                        >
                          <Button
                            block
                            variant={isHighlighted ? 'primary' : 'outline'}
                            onClick={() => onSelectPlan?.(plan.id)}
                          >
                            {plan.cta}
                          </Button>
                        </div>
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {features.map((feature, index) => {
              const isCategory =
                feature.category &&
                (index === 0 || features[index - 1].category !== feature.category);
              return (
                <React.Fragment key={feature.key}>
                  {isCategory && (
                    <tr>
                      <td
                        data-part="category-header"
                        className="ds-pricing-table__category-header"
                        colSpan={plans.length + 1}
                      >
                        {feature.category}
                      </td>
                    </tr>
                  )}
                  <tr
                    data-part="feature-row"
                    className="ds-pricing-table__feature-row"
                  >
                    <td
                      data-part="feature-cell"
                      className="ds-pricing-table__feature-cell"
                    >
                      {/* Feature description: certified Tooltip, focusable
                          trigger so keyboard users reach it. */}
                      {feature.description ? (
                        <Tooltip content={feature.description}>
                          <span
                            data-part="feature-label"
                            className="ds-pricing-table__feature-label"
                            tabIndex={0}
                          >
                            {feature.label}
                          </span>
                        </Tooltip>
                      ) : (
                        feature.label
                      )}
                    </td>
                    {plans.map((plan) => (
                      <td
                        key={plan.id}
                        data-part="value-cell"
                        className="ds-pricing-table__value-cell"
                      >
                        <FeatureValue
                          value={plan.features[feature.key]}
                          labels={labels}
                        />
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
