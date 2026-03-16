'use client';

/**
 * @fileoverview Transfer Classic Engine -- Ant Design adapter for the Rottay
 * Design System. Wraps `antd/Transfer` with the DS-neutral TransferProps,
 * providing enterprise-grade dual-panel list transfer out of the box.
 *
 * @example
 * ```tsx
 * <Transfer engine="classic" dataSource={items} targetKeys={selected} showSearch />
 * ```
 *
 * @module ClassicTransfer
 * @category Inputs
 * @package @rottay/design-system
 */
import React from 'react';
import { Transfer as AntTransfer } from 'antd';
import type { TransferProps } from '../Transfer.types';

/**
 * Classic (Ant Design) engine for the Transfer component.
 *
 * Thin pass-through wrapper that maps every DS TransferProp to the
 * corresponding `antd/Transfer` prop. Type casts bridge minor contract
 * differences between the DS interface and Ant Design's generics.
 *
 * @param props - Standardized TransferProps from the design system contract.
 * @param ref   - Forwarded ref attached to the outer `<div>` wrapper.
 * @returns The rendered Ant Design Transfer inside a ref-able container.
 */
export const Transfer = React.forwardRef<HTMLDivElement, TransferProps>(
  (props, ref) => {
    const {
      dataSource,
      targetKeys,
      defaultTargetKeys,
      onChange,
      onSelectChange,
      onSearch,
      titles,
      operations,
      showSearch,
      filterOption,
      render,
      disabled,
      listStyle,
      locale,
      showSelectAll,
      oneWay,
      pagination,
      className,
      style,
    } = props;

    return (
      <div ref={ref} className={className} style={style}>
        <AntTransfer
          dataSource={dataSource}
          targetKeys={targetKeys}
          selectedKeys={defaultTargetKeys}
          onChange={onChange as any}
          onSelectChange={onSelectChange as any}
          onSearch={onSearch}
          titles={titles}
          operations={operations}
          showSearch={showSearch}
          filterOption={filterOption}
          render={render as any}
          disabled={disabled}
          listStyle={listStyle}
          locale={locale}
          showSelectAll={showSelectAll}
          oneWay={oneWay}
          pagination={pagination}
        />
      </div>
    );
  }
);

Transfer.displayName = 'Transfer.Classic';

export default Transfer;
