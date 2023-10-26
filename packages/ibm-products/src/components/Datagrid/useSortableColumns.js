/**
 * Copyright IBM Corp. 2020, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import cx from 'classnames';
import { pkg, carbon } from '../../settings';
import { Button } from 'carbon-components-react';
import { ArrowUp16, Arrows16 } from '@carbon/icons-react';
import { SelectAll } from './Datagrid/DatagridSelectAll';

const blockClass = `${pkg.prefix}--datagrid`;

const ordering = {
  ASC: 'ASC',
  DESC: 'DESC',
  NONE: 'NONE',
};

const getAriaSortValue = (
  col,
  {
    ascendingSortableLabelText,
    descendingSortableLabelText,
    defaultSortableLabelText,
  }
) => {
  if (!col) {
    return;
  }
  const { isSorted, isSortedDesc } = col || {};
  if (!isSorted) {
    return defaultSortableLabelText;
  }
  if (isSorted && !isSortedDesc) {
    return ascendingSortableLabelText;
  }
  if (isSorted && isSortedDesc) {
    return descendingSortableLabelText;
  }
};

const useSortableColumns = (hooks) => {
  const sortableVisibleColumns = (visibleColumns, { instance }) => {
    const {
      onSort,
      ascendingSortableLabelText,
      descendingSortableLabelText,
      defaultSortableLabelText,
    } = instance;
    const onSortClick = (column) => {
      const key = column.id;
      const sortDesc = column.isSortedDesc;
      const { newSortDesc, newOrder } = getNewSortOrder(sortDesc);
      if (onSort) {
        onSort(key, newOrder);
      }
      instance.toggleSortBy(key, newSortDesc, false);
    };
    const sortableColumns = visibleColumns.map((column) => {
      const icon = (col) => {
        if (col?.isSorted) {
          switch (col.isSortedDesc) {
            case false:
              return () => (
                <ArrowUp16
                  className={`${blockClass}__sortable-icon ${carbon.prefix}--btn__icon`}
                />
              );
            case true:
              return () => (
                <ArrowUp16
                  className={`${blockClass}__sortable-icon ${carbon.prefix}--btn__icon`}
                />
              );
            default:
              return () => (
                <Arrows16
                  className={`${blockClass}__sortable-icon ${carbon.prefix}--btn__icon`}
                />
              );
          }
        }
        return () => (
          <Arrows16
            className={`${blockClass}__sortable-icon ${carbon.prefix}--btn__icon`}
          />
        );
      };
      const Header = (headerProp) =>
        column.disableSortBy === true || column.id === 'datagridSelection' ? (
          column.disableSortBy ? (
            column.Header
          ) : (
            <SelectAll {...instance} />
          )
        ) : (
          <Button
            aria-sort={getAriaSortValue(headerProp?.column, {
              ascendingSortableLabelText,
              descendingSortableLabelText,
              defaultSortableLabelText,
            })}
            onClick={() => onSortClick(headerProp?.column)}
            kind="ghost"
            renderIcon={icon(headerProp?.column)}
            className={cx(
              `${carbon.prefix}--table-sort ${blockClass}--table-sort`,
              {
                [`${blockClass}--table-sort--desc`]:
                  headerProp?.column.isSortedDesc,
                [`${blockClass}--table-sort--asc`]:
                  headerProp?.column.isSortedDesc === false,
              }
            )}
          >
            {column.Header}
          </Button>
        );
      return {
        ...column,
        Header,
        minWidth:
          column.disableSortBy === true
            ? 0
            : column.minWidth
            ? column.minWidth
            : 90,
      };
    });
    return instance.customizeColumnsProps?.isTearsheetOpen
      ? visibleColumns
      : [...sortableColumns];
  };

  const sortInstanceProps = (instance) => {
    const { onSort } = instance;
    Object.assign(instance, { manualSortBy: !!onSort, isTableSortable: true });
  };

  const getNewSortOrder = (sortOrder) => {
    const order = {
      newSortDesc: undefined,
      newOrder: ordering.NONE,
    };
    if (sortOrder === false) {
      order.newOrder = ordering.DESC;
      order.newSortDesc = true;
    }
    if (sortOrder === undefined) {
      order.newOrder = ordering.ASC;
      order.newSortDesc = false;
    }
    return order;
  };
  hooks.visibleColumns.push(sortableVisibleColumns);
  hooks.useInstance.push(sortInstanceProps);
};

export default useSortableColumns;
