'use client';

/**
 * Transfer - Titan Engine (Ant Design)
 */
import React from 'react';
import { Transfer as AntTransfer } from 'antd';
import type { TransferProps } from '../../types';

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

Transfer.displayName = 'Transfer.Titan';

export default Transfer;
