'use client';

/**
 * PricingTable - Modern Engine (DaisyUI/Tailwind)
 */

import React from 'react';
import type { PricingTableProps, PricingPlan, PricingFeature } from '../../types';

function renderFeatureValue(value: boolean | string | undefined): React.ReactNode {
  if (value === true) return <span className="text-success text-lg">{'\u2713'}</span>;
  if (value === false || value === undefined) return <span className="text-base-300 text-lg">{'\u2717'}</span>;
  return <span className="text-sm">{value}</span>;
}

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

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className ?? ''}`} style={style}>
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  return (
    <div className={`ds-pattern-pricing-table ds-engine-modern ${className ?? ''}`} style={style}>
      {/* Billing toggle */}
      {onBillingCycleChange && (
        <div className="flex justify-center items-center gap-3 mb-8">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'font-bold' : 'opacity-50'}`}>Monthly</span>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={billingCycle === 'yearly'}
            onChange={(e) => onBillingCycleChange(e.target.checked ? 'yearly' : 'monthly')}
          />
          <span className={`text-sm ${billingCycle === 'yearly' ? 'font-bold' : 'opacity-50'}`}>
            Yearly
            <span className="badge badge-success badge-sm ml-1">Save 20%</span>
          </span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table">
          {/* Plan headers */}
          <thead>
            <tr>
              <th className="w-48 text-sm font-semibold opacity-50 align-bottom">Features</th>
              {plans.map(plan => {
                const isHighlighted = plan.id === highlightedPlan || plan.popular;
                return (
                  <th key={plan.id} className="text-center align-top">
                    {renderPlanHeader ? renderPlanHeader(plan) : (
                      <div className={`card ${isHighlighted ? 'bg-primary/5 border-2 border-primary' : 'bg-base-100 border border-base-300'} p-4`}>
                        {plan.popular && (
                          <span className="badge badge-primary badge-sm mb-2">Most Popular</span>
                        )}
                        <div className="font-bold text-lg">{plan.name}</div>
                        <div className="text-3xl font-extrabold mt-1">
                          {typeof plan.price === 'number' ? `${currency}${plan.price}` : plan.price}
                        </div>
                        {plan.priceNote && (
                          <div className="text-xs opacity-50">{plan.priceNote}</div>
                        )}
                        {plan.description && (
                          <div className="text-xs opacity-50 mt-1">{plan.description}</div>
                        )}
                        <button
                          className={`btn btn-sm w-full mt-3 ${isHighlighted ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => onSelectPlan?.(plan.id)}
                        >
                          {plan.cta}
                        </button>
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Feature rows */}
          <tbody>
            {features.map((feature, index) => {
              const isCategory = feature.category && (index === 0 || features[index - 1].category !== feature.category);
              return (
                <React.Fragment key={feature.key}>
                  {isCategory && (
                    <tr>
                      <td
                        colSpan={plans.length + 1}
                        className="font-bold text-xs uppercase opacity-40 pt-6 pb-2 border-t border-base-300"
                      >
                        {feature.category}
                      </td>
                    </tr>
                  )}
                  <tr className="hover">
                    <td className="text-sm">
                      {feature.description ? (
                        <span className="tooltip tooltip-right" data-tip={feature.description}>
                          {feature.label}
                        </span>
                      ) : (
                        feature.label
                      )}
                    </td>
                    {plans.map(plan => (
                      <td key={plan.id} className="text-center">
                        {renderFeatureValue(plan.features[feature.key])}
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
