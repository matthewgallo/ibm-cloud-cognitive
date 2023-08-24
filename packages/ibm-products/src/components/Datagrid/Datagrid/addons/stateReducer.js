/**
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { getLocalStorageItem } from '../../../../global/js/utils/getLocalStorageItem';
import { setLocalStorageItem } from '../../../../global/js/utils/setLocalStorageItem';
import { pkg } from '../../../../settings';

const COLUMN_RESIZE_START = 'columnStartResizing';
const COLUMN_RESIZING = 'columnResizing';
const COLUMN_RESIZE_END = 'columnDoneResizing';
const INIT = 'init';

export const handleColumnResizeStartEvent = (dispatch) => {
  dispatch({ type: COLUMN_RESIZE_START });
};

export const handleColumnResizeEndEvent = (dispatch) => {
  dispatch({ type: COLUMN_RESIZE_END });
};

export const handleColumnResizingEvent = (
  dispatch,
  header,
  newWidth,
  isKeyEvent
) => {
  if (isKeyEvent) {
    dispatch({
      type: COLUMN_RESIZE_START,
      payload: {
        newWidth,
        headerId: header.id,
        defaultWidth: header.originalWidth,
      },
    });
  }
  dispatch({
    type: COLUMN_RESIZING,
    payload: {
      newWidth,
      headerId: header.id,
      defaultWidth: header.originalWidth,
    },
  });
};

export const stateReducer = (newState, action) => {
  switch (action.type) {
    case INIT: {
      const localStorageColSizes = getLocalStorageItem(
        `${pkg.prefix}--datagrid-col-sizing`
      );
      Object.keys(localStorageColSizes.columnResizing.columnWidths).forEach(
        (key) => {
          if (localStorageColSizes.columnResizing.columnWidths[key] === null) {
            delete localStorageColSizes.columnResizing.columnWidths[key];
          }
        }
      );
      return {
        ...newState,
        ...localStorageColSizes,
        isResizing: false,
      };
    }
    case COLUMN_RESIZE_START: {
      return {
        ...newState,
        isResizing: true,
      };
    }
    case COLUMN_RESIZING: {
      const { headerId, newWidth, defaultWidth } = action.payload || {};
      const newColumnWidth = {};
      if (typeof headerId === 'undefined') {
        return {
          ...newState,
        };
      }
      newColumnWidth[headerId] = newWidth;
      return {
        ...newState,
        isResizing: true,
        columnResizing: {
          ...newState.columnResizing,
          columnWidth: defaultWidth,
          columnWidths: {
            ...newState.columnResizing.columnWidths,
            ...newColumnWidth,
          },
          headerIdWidths: [headerId, newWidth],
        },
      };
    }
    case COLUMN_RESIZE_END: {
      const localStorageColSizes = getLocalStorageItem(
        `${pkg.prefix}--datagrid-col-sizing`
      );
      setLocalStorageItem(
        `${pkg.prefix}--datagrid-col-sizing`,
        localStorageColSizes,
        { ...newState, isResizing: false }
      );
      return {
        ...newState,
        isResizing: false,
      };
    }
  }
};
