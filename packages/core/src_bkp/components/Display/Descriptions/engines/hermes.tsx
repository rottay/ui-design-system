'use client';

/**
 * Hermes Descriptions Engine
 *
 * DaisyUI implementation with unified props interface.
 */

import { useMemo, Children, isValidElement, type ReactNode } from 'react';
import type { DescriptionsProps, DescriptionsItem, DescriptionsItemProps } from '../types';
import { distributeItemsIntoRows, getSizeClasses } from '../../../../types/components/descriptions';

/**
 * Descriptions Item Component
 */
function DescriptionsItemComponent(props: DescriptionsItemProps) {
  return null; // Used only for extracting props
}

/**
 * Hermes Descriptions Component
 *
 * DaisyUI-styled descriptions display.
 */
function HermesDescriptions(props: DescriptionsProps) {
  const {
    title,
    extra,
    bordered = false,
    layout = 'horizontal',
    column = 3,
    size = 'default',
    colon = true,
    labelStyle,
    contentStyle,
    items: propItems,
    children,
    className = '',
    style,
  } = props;

  // Extract items from children or use items prop
  const items = useMemo<DescriptionsItem[]>(() => {
    if (propItems) return propItems;

    const extractedItems: DescriptionsItem[] = [];
    Children.forEach(children, (child, index) => {
      if (isValidElement(child) && child.type === DescriptionsItemComponent) {
        extractedItems.push({
          key: child.key ?? index,
          ...child.props,
        });
      }
    });
    return extractedItems;
  }, [propItems, children]);

  // Get column count (simplified - use first value if responsive)
  const columnCount = typeof column === 'number' ? column : (column.md ?? 3);

  // Distribute items into rows
  const rows = useMemo(() => distributeItemsIntoRows(items, columnCount), [items, columnCount]);

  // Size classes
  const sizeClasses = getSizeClasses(size);

  return (
    <div className={`${className}`} style={style}>
      {/* Header */}
      {(title || extra) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-base-content">{title}</h3>
          )}
          {extra && <div>{extra}</div>}
        </div>
      )}

      {/* Content */}
      <div className={`${bordered ? 'border border-base-300 rounded-lg overflow-hidden' : ''}`}>
        {layout === 'horizontal' ? (
          // Horizontal layout - label and value side by side
          <table className="w-full">
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={bordered ? 'border-b border-base-300 last:border-0' : ''}>
                  {row.map((item, itemIndex) => (
                    <>
                      <th
                        key={`${item.key}-label`}
                        className={`
                          text-left font-medium text-base-content/70
                          ${sizeClasses.padding} ${sizeClasses.text}
                          ${bordered ? 'bg-base-200/50 border-r border-base-300' : ''}
                        `}
                        style={{ ...labelStyle, ...item.labelStyle }}
                        colSpan={1}
                      >
                        {item.label}{colon ? ':' : ''}
                      </th>
                      <td
                        key={`${item.key}-content`}
                        className={`
                          text-base-content
                          ${sizeClasses.padding} ${sizeClasses.text}
                          ${bordered && itemIndex < row.length - 1 ? 'border-r border-base-300' : ''}
                        `}
                        style={{ ...contentStyle, ...item.contentStyle }}
                        colSpan={(item.span ?? 1) * 2 - 1}
                      >
                        {item.children}
                      </td>
                    </>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // Vertical layout - label above value
          <div className="grid" style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
            {items.map((item) => (
              <div
                key={item.key}
                className={`
                  ${bordered ? 'border-b border-r border-base-300' : 'mb-4'}
                  ${sizeClasses.padding}
                `}
                style={{ gridColumn: `span ${item.span ?? 1}`, ...item.style }}
              >
                <div
                  className={`font-medium text-base-content/70 ${sizeClasses.text} mb-1`}
                  style={{ ...labelStyle, ...item.labelStyle }}
                >
                  {item.label}{colon ? ':' : ''}
                </div>
                <div
                  className={`text-base-content ${sizeClasses.text}`}
                  style={{ ...contentStyle, ...item.contentStyle }}
                >
                  {item.children}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Attach Item compound component
HermesDescriptions.Item = DescriptionsItemComponent;

export default HermesDescriptions;
