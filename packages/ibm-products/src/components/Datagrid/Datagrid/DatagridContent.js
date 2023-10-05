/**
 * Copyright IBM Corp. 2022, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { FilterContext, FilterPanel } from './addons/Filtering';
import React, { useContext, useEffect, useRef } from 'react';
import { Table, TableContainer } from '@carbon/react';
import { carbon, pkg } from '../../../settings';

import { CLEAR_FILTERS } from './addons/Filtering/constants';
import DatagridBody from './DatagridBody';
import DatagridHead from './DatagridHead';
import DatagridToolbar from './DatagridToolbar';
import { FilterSummary } from '../../FilterSummary';
import { InlineEditContext } from './addons/InlineEdit/InlineEditContext';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { handleGridFocus } from './addons/InlineEdit/handleGridFocus';
import { handleGridKeyPress } from './addons/InlineEdit/handleGridKeyPress';
import { px } from '@carbon/layout';
import { useClickOutside } from '../../../global/js/hooks';
import { useMultipleKeyTracking } from '../../DataSpreadsheet/hooks';

const blockClass = `${pkg.prefix}--datagrid`;

export const DatagridContent = ({ datagridState, title }) => {
  const { state: inlineEditState, dispatch } = useContext(InlineEditContext);
  const { filterTags, EventEmitter, panelOpen } = useContext(FilterContext);
  const { activeCellId, gridActive, editId } = inlineEditState;
  const {
    getTableProps = () => {},
    getFilterFlyoutProps,
    withVirtualScroll,
    DatagridPagination,
    isFetching,
    CustomizeColumnsTearsheet,
    filterProps,
    fullHeightDatagrid,
    verticalAlign = 'center',
    variableRowHeight,
    gridTitle,
    gridDescription,
    useDenseHeader,
    withInlineEdit,
    tableId,
    DatagridActions,
    totalColumnsWidth,
    gridRef,
    state,
    page,
    rows,
    columns,
    aiGenerated
  } = datagridState;

  const contentRows = (DatagridPagination && page) || rows;
  const gridAreaRef = useRef();
  const multiKeyTrackingRef = useRef();

  useClickOutside(gridAreaRef, (target) => {
    if (!withInlineEdit) {
      return;
    }
    // We return from here if we find a parent element with the selector below
    // because that element was initially part of the grid area but was removed
    // and swapped out with an input, i.e. text, number, selection, or date picker
    if (
      target.closest(`.${blockClass}__inline-edit-button`) ||
      target.closest(`.${blockClass}__inline-edit--select`)
    ) {
      return;
    }
    dispatch({ type: 'REMOVE_GRID_ACTIVE_FOCUS', payload: activeCellId });
  });

  const renderTable = () => {
    return (
      <Table
        {...getTableProps()}
        className={cx(
          withVirtualScroll ? '' : `${blockClass}__table-simple`,
          `${blockClass}__vertical-align-${verticalAlign}`,
          { [`${blockClass}__variable-row-height`]: variableRowHeight },
          { [`${blockClass}__table-with-inline-edit`]: withInlineEdit },
          { [`${blockClass}__table-grid-active`]: gridActive },
          getTableProps()?.className
        )}
        role={withInlineEdit ? 'grid' : undefined}
        tabIndex={withInlineEdit ? 0 : -1}
        onKeyDown={
          withInlineEdit
            ? (event) =>
                handleGridKeyPress({
                  event,
                  dispatch,
                  instance: datagridState,
                  keysPressedList,
                  state: inlineEditState,
                  usingMac,
                })
            : null
        }
        onFocus={
          withInlineEdit
            ? () => handleGridFocus(inlineEditState, dispatch)
            : null
        }
        title={title}
      >
        {containsAIGeneratedColumns()
          ? <div className={`${blockClass}__inner-table-scroll-wrapper`}>
            {!withVirtualScroll && <DatagridHead {...datagridState} />}
            <DatagridBody {...datagridState} rows={contentRows} />
          </div>
          : <>
          {!withVirtualScroll && <DatagridHead {...datagridState} />}
          <DatagridBody {...datagridState} rows={contentRows} />
          </>
        }
      </Table>
    );
  };

  const { keysPressedList, usingMac } = useMultipleKeyTracking({
    ref: withInlineEdit ? multiKeyTrackingRef : null,
    containerHasFocus: gridActive,
    isEditing: !!editId,
  });

  // Provides a width for the region outline for useInlineEdit
  useEffect(() => {
    if (!withInlineEdit) {
      return;
    }
    const gridElement = document.querySelector(`#${tableId}`);
    const tableHeader = gridElement?.querySelector(
      `.${carbon.prefix}--data-table-header`
    );
    gridElement.style.setProperty(
      `--${blockClass}--grid-width`,
      px(totalColumnsWidth + 32)
    );
    if (gridActive) {
      gridElement.style.setProperty(
        `--${blockClass}--grid-header-height`,
        px(tableHeader?.clientHeight || 0)
      );
    }
  }, [withInlineEdit, tableId, totalColumnsWidth, datagridState, gridActive]);

  const renderFilterSummary = () =>
    state.filters.length > 0 && (
      <FilterSummary
        className={`${blockClass}__filter-summary`}
        filters={filterTags}
        clearFilters={() => EventEmitter.dispatch(CLEAR_FILTERS)}
        renderLabel={filterProps.renderLabel}
      />
    );

  const containsAIGeneratedColumns = () => {
    if (columns.filter(col => col.aiGenerated && col.aiGenerated.length)) {
      return true;
    }
    return false;
  }

  return (
    <>
      <TableContainer
        className={cx(
          `${blockClass}__grid-container`,
          withVirtualScroll || fullHeightDatagrid
            ? `${blockClass}__full-height`
            : '',
          DatagridPagination ? `${blockClass}__with-pagination` : '',
          useDenseHeader ? `${blockClass}__dense-header` : '',
          {
            [`${blockClass}__grid-container-grid-active`]: gridActive,
            [`${blockClass}__grid-container-inline-edit`]: withInlineEdit,
            [`${blockClass}__grid-container-with-ai-generated-cols`]: containsAIGeneratedColumns(),
            [`${blockClass}__grid-container-grid-active--without-toolbar`]:
              withInlineEdit && !DatagridActions,
          }
        )}
        title={gridTitle}
        description={gridDescription}
      >
        <DatagridToolbar {...datagridState} />
        <div
          className={cx(`${blockClass}__table-container`, {
            [`${blockClass}__table-container--filter-open`]: panelOpen,
          })}
          ref={gridAreaRef}
        >
          {filterProps?.variation === 'panel' && (
            <FilterPanel
              updateMethod="batch"
              {...getFilterFlyoutProps()}
              title={filterProps.panelTitle}
              filterSections={filterProps.sections}
            />
          )}
          <div className={`${blockClass}__table-container-inner`}>
            {renderFilterSummary()}
            {withInlineEdit ? (
              <div ref={multiKeyTrackingRef}>{renderTable()}</div>
            ) : withVirtualScroll ? (
              <div
                className={`${blockClass}__virtualScrollContainer`}
                ref={gridRef}
              >
                {renderTable()}
              </div>
            ) : (
              renderTable()
            )}
          </div>
        </div>
      </TableContainer>
      {contentRows?.length > 0 && !isFetching && DatagridPagination && (
        <DatagridPagination {...datagridState} />
      )}
      {CustomizeColumnsTearsheet && (
        <CustomizeColumnsTearsheet instance={datagridState} />
      )}
    </>
  );
};

DatagridContent.propTypes = {
  datagridState: PropTypes.shape({
    getTableProps: PropTypes.func,
    getFilterFlyoutProps: PropTypes.func,
    withVirtualScroll: PropTypes.bool,
    DatagridActions: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    DatagridPagination: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.func,
    ]),
    CustomizeColumnsTearsheet: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.func,
    ]),
    isFetching: PropTypes.bool,
    fullHeightDatagrid: PropTypes.bool,
    filterProps: PropTypes.object,
    variableRowHeight: PropTypes.bool,
    useDenseHeader: PropTypes.bool,
    withInlineEdit: PropTypes.bool,
    verticalAlign: PropTypes.string,
    gridTitle: PropTypes.node,
    gridDescription: PropTypes.node,
    page: PropTypes.arrayOf(PropTypes.object),
    rows: PropTypes.arrayOf(PropTypes.object),
    columns: PropTypes.arrayOf(PropTypes.object),
    tableId: PropTypes.string,
    totalColumnsWidth: PropTypes.number,
    gridRef: PropTypes.object,
    setAllFilters: PropTypes.func,
    getFilterProps: PropTypes.func,
    state: PropTypes.object,
  }),
  title: PropTypes.string,
};
