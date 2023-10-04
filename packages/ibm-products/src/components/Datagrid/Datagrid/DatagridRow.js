/**
 * Copyright IBM Corp. 2020, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { TableRow, TableCell, SkeletonText } from '@carbon/react';
import { px } from '@carbon/layout';
import { selectionColumnId } from '../common-column-ids';
import cx from 'classnames';
import { pkg, carbon } from '../../../settings';
import { AICellIndicator } from './addons/AICellIndicator/AICellIndicator';
import { AISlug } from './addons/AISlug/AISlug';

const blockClass = `${pkg.prefix}--datagrid`;

const rowHeights = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

// eslint-disable-next-line react/prop-types
const DatagridRow = (datagridState) => {
  const { row, rowSize, withNestedRows, prepareRow } = datagridState;

  const getVisibleNestedRowCount = ({ isExpanded, subRows }) => {
    let size = 0;
    if (isExpanded && subRows) {
      size += subRows.length;
      subRows.forEach((child) => {
        size += getVisibleNestedRowCount(child);
      });
    }
    return size;
  };

  const hoverHandler = (event) => {
    if (!withNestedRows) {
      return;
    }
    const subRowCount = getVisibleNestedRowCount(row);
    const totalNestedRowIndicatorHeight = px(subRowCount * rowHeights[rowSize]);
    const hoverRow = event.target.closest(
      `.${blockClass}__carbon-row-expanded`
    );
    hoverRow?.classList.add(`${blockClass}__carbon-row-expanded-hover-active`);
    const rowExpanderButton = hoverRow?.querySelector(
      `.${blockClass}__row-expander`
    );
    const rowSizeValue = rowSize || 'lg';
    hoverRow?.style?.setProperty(
      `--${blockClass}--indicator-height`,
      totalNestedRowIndicatorHeight
    );
    hoverRow?.style?.setProperty(
      `--${blockClass}--row-height`,
      px(rowHeights[rowSizeValue])
    );
    hoverRow?.style?.setProperty(
      `--${blockClass}--indicator-offset-amount`,
      px(rowExpanderButton?.offsetLeft || 0)
    );
  };

  const focusRemover = () => {
    const elements = document.querySelectorAll(
      `.${blockClass}__carbon-row-expanded`
    );
    elements.forEach((el) => {
      el.classList.remove(`${blockClass}__carbon-row-expanded-hover-active`);
    });
  };

  const renderExpandedRow = () => {
    if (row.isExpanded) {
      prepareRow(row);
      return row?.RowExpansionRenderer?.({ ...datagridState, row });
    }
    return null;
  };

  const handleMouseLeave = (event) => {
    const hoverRow = event.target.closest(
      `.${blockClass}__carbon-row-expanded`
    );
    hoverRow?.classList.remove(
      `${blockClass}__carbon-row-expanded-hover-active`
    );
  };

  const handleOnKeyUp = (event) => {
    if (!withNestedRows) {
      return;
    }
    if (event.key === 'Enter' || event.key === 'Space') {
      focusRemover();
      hoverHandler(event);
    }
  };

  const rowClassNames = cx(`${blockClass}__carbon-row`, {
    [`${blockClass}__carbon-row-expanded`]: row.isExpanded,
    [`${blockClass}__carbon-row-expandable`]: row.canExpand,
    [`${carbon.prefix}--data-table--selected`]: row.isSelected,
    [`${blockClass}__ai-generated--row`]: row.original.ai_generated_row,
  });

  console.log(row);

  return (
    <>
      <TableRow
        className={rowClassNames}
        {...row.getRowProps({ role: false })}
        key={row.id}
        onMouseEnter={hoverHandler}
        onMouseLeave={handleMouseLeave}
        onFocus={hoverHandler}
        onBlur={focusRemover}
        onKeyUp={handleOnKeyUp}
      >
        {row.original.ai_generated_row && <AISlug />}
        {row.cells.map((cell, index) => {
          const cellProps = cell.getCellProps({ role: false });
          const { ai_generated_cols: aiGeneratedCols  } = row.original || {};
          const { children, ...restProps } = cellProps;
          const content = children || (
            <>
              {!row.isSkeleton && cell.render('Cell')}
              {row.isSkeleton && <SkeletonText />}
            </>
          );
          if (cell?.column?.id === selectionColumnId) {
            // directly render component without the wrapping TableCell
            return cell.render('Cell', { key: cell.column.id });
          }
          return (
            <TableCell
              className={cx(`${blockClass}__cell`, {
                [`${blockClass}__expandable-row-cell`]:
                  row.canExpand && index === 0,
                [`${blockClass}__ai-generated-cell`]: aiGeneratedCols.includes(cell.column.id),
              })}
              {...restProps}
              key={cell.column.id}
            >
              {content}
              {aiGeneratedCols.includes(cell.column.id) && <AICellIndicator />}
            </TableCell>
          );
        })}
      </TableRow>
      {renderExpandedRow()}
    </>
  );
};

export default DatagridRow;
