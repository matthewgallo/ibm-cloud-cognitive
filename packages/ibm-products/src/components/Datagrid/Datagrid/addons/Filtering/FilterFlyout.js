/**
 * Copyright IBM Corp. 2022, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'carbon-components-react';
import { Filter16 } from '@carbon/icons-react';
import { px, breakpoints } from '@carbon/layout';
import cx from 'classnames';
import PropTypes from 'prop-types';
import {
  useClickOutside,
  useWindowResize,
} from '../../../../../global/js/hooks';
import { pkg } from '../../../../../settings';
import { ActionSet } from '../../../../ActionSet';
import { BATCH, CLEAR_FILTERS, FLYOUT, INSTANT } from './constants';
import {
  useSubscribeToEventEmitter,
  useFilters,
  useShouldDisableButtons,
} from './hooks';
import { carbon } from '../../../../../settings';

const blockClass = `${pkg.prefix}--datagrid`;
const componentClass = `${blockClass}-filter-flyout`;

const defaults = {
  flyoutIconDescription: 'Open filters',
  title: 'Filter',
  primaryActionLabel: 'Apply',
  secondaryActionLabel: 'Cancel',
};

const FilterFlyout = ({
  updateMethod,
  flyoutIconDescription = defaults.flyoutIconDescription,
  filters = [],
  title = defaults.title,
  primaryActionLabel = defaults.primaryActionLabel,
  onFlyoutOpen = () => {},
  onFlyoutClose = () => {},
  onApply = () => {},
  onCancel = () => {},
  secondaryActionLabel = defaults.secondaryActionLabel,
  setAllFilters,
  data = [],
  reactTableFiltersState = [],
}) => {
  /** State */
  const [open, setOpen] = useState(false);
  const [stackedLayout, setStackedLayout] = useState(false);

  const {
    filtersState,
    prevFiltersObjectArrayRef,
    prevFiltersRef,
    cancel,
    reset,
    renderFilter,
    filtersObjectArray,
    lastAppliedFilters,
  } = useFilters({
    updateMethod,
    filters,
    setAllFilters,
    variation: FLYOUT,
    reactTableFiltersState,
    onCancel,
  });

  const { width } = breakpoints.md;
  const mdPxWidth = parseInt(width) * 16;

  /** Refs */
  const filterFlyoutRef = useRef(null);
  const flyoutInnerRef = useRef(null);
  const flyoutFiltersContainerRef = useRef(null);

  const [shouldDisableButtons, setShouldDisableButtons] =
    useShouldDisableButtons({
      initialValue: true,
      filtersState,
      prevFiltersRef,
    });

  // Skip resize testing
  /* istanbul ignore next */
  const handleResize = (current) => {
    const filterFlyoutRefPosition =
      flyoutInnerRef?.current.getBoundingClientRect();
    const originalFlyoutWidth = parseInt(
      window.getComputedStyle(flyoutInnerRef?.current).getPropertyValue('width')
    );
    // Check to see if left value from flyout getBoundingClientRect is a negative number
    // If it is, that is the amount we need to subtract from the flyout width
    if (Math.sign(filterFlyoutRefPosition.left) === -1) {
      const newFlyoutWidth =
        originalFlyoutWidth - Math.abs(filterFlyoutRefPosition.left);
      flyoutInnerRef.current.style.width = px(newFlyoutWidth);
    }
    // Check to see if left value from flyout getBoundingClientRect is a positive number or 0
    // If it is, that is the amount we need to add to the flyout width until we reach the
    // max-width of the flyout (642)
    if (
      (originalFlyoutWidth < 642 &&
        Math.sign(filterFlyoutRefPosition.left) === 1) ||
      Math.sign(filterFlyoutRefPosition.left).toString() === '0'
    ) {
      const newFlyoutWidth =
        originalFlyoutWidth + Math.abs(filterFlyoutRefPosition.left);
      flyoutInnerRef.current.style.width = px(newFlyoutWidth);
    }
    // Begin stacking filters at this specific point
    if (current?.innerWidth <= mdPxWidth + 254) {
      setStackedLayout(true);
    } else {
      setStackedLayout(false);
    }
  };

  useWindowResize(({ current }) => {
    handleResize(current);
  });

  /** Memos */
  const showActionSet = updateMethod === BATCH;

  /** Methods */
  const openFlyout = () => {
    setOpen(true);
    onFlyoutOpen();
  };

  const closeFlyout = () => {
    setOpen(false);
    onFlyoutClose();
    flyoutInnerRef.current.style.width = px(642);
  };

  useEffect(() => {
    // Initialize flyout width
    flyoutInnerRef.current.style.width = px(642);
  }, []);

  const apply = () => {
    setAllFilters(filtersObjectArray);
    closeFlyout();
    // From the user
    onApply();

    // When the user clicks apply, the action set buttons should be disabled again
    setShouldDisableButtons(true);

    // updates the ref so next time the flyout opens we have records of the previous filters
    prevFiltersRef.current = JSON.stringify(filtersState);
    prevFiltersObjectArrayRef.current = JSON.stringify(filtersObjectArray);

    // Update the last applied filters
    lastAppliedFilters.current = JSON.stringify(filtersObjectArray);
  };

  /** Renders all filters */
  const renderFilters = () => filters.map(renderFilter);

  const renderActionSet = () => {
    return (
      showActionSet && (
        <ActionSet
          actions={[
            {
              key: 1,
              kind: 'primary',
              label: primaryActionLabel,
              onClick: apply,
              isExpressive: false,
              disabled: shouldDisableButtons,
            },
            {
              key: 2,
              kind: 'secondary',
              label: secondaryActionLabel,
              onClick: cancel,
              isExpressive: false,
              disabled: shouldDisableButtons,
            },
          ]}
          size="md"
          buttonSize="md"
        />
      )
    );
  };

  /** Effects */
  // Close flyout when clicking outside
  useClickOutside(filterFlyoutRef, (target) => {
    const hasClickedOnDatePicker = target.closest('.flatpickr-calendar');
    const hasClickedOnDropdown =
      target.className === `${carbon.prefix}--list-box__menu-item__option`;

    // Do not do anything if flyout is closed or if clicking on anything
    // rendered via a portal
    if (!open || hasClickedOnDatePicker || hasClickedOnDropdown) {
      return;
    }

    closeFlyout();
    cancel();
  });

  useSubscribeToEventEmitter(CLEAR_FILTERS, reset);

  useEffect(
    function reflectLastAppliedFiltersWhenReactTableUpdates() {
      lastAppliedFilters.current = JSON.stringify(reactTableFiltersState);
    },
    [reactTableFiltersState, lastAppliedFilters]
  );

  return (
    <div className={`${componentClass}__container`} ref={filterFlyoutRef}>
      <Button
        kind="ghost"
        hasIconOnly
        tooltipPosition="bottom"
        renderIcon={Filter16}
        iconDescription={flyoutIconDescription}
        onClick={open ? closeFlyout : openFlyout}
        className={cx(`${componentClass}__trigger`, {
          [`${componentClass}__trigger--open`]: open,
        })}
        disabled={data.length === 0}
      />
      <div
        ref={flyoutInnerRef}
        className={cx(componentClass, {
          [`${componentClass}--open`]: open,
          [`${componentClass}--batch`]: showActionSet,
          [`${componentClass}--instant`]: !showActionSet,
        })}
      >
        <div className={`${componentClass}__inner-container`}>
          <span className={`${componentClass}__title`}>{title}</span>
          <div
            className={cx(`${componentClass}__filters`, {
              [`${componentClass}__stacked`]: stackedLayout,
            })}
            ref={flyoutFiltersContainerRef}
          >
            {renderFilters()}
          </div>
        </div>
        {renderActionSet()}
      </div>
    </div>
  );
};

FilterFlyout.propTypes = {
  /**
   * All data rows in the table
   */
  data: PropTypes.array.isRequired,

  /**
   * Array of filters to render
   */
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      column: PropTypes.string.isRequired,
      props: PropTypes.object.isRequired,
    })
  ),

  /**
   * Icon description for the filter flyout button
   */
  flyoutIconDescription: PropTypes.string,

  /**
   * Callback when the apply button is clicked
   */
  onApply: PropTypes.func,

  /**
   * Callback when the cancel button is clicked
   */
  onCancel: PropTypes.func,

  /**
   * Callback when the flyout closes
   */
  onFlyoutClose: PropTypes.func,

  /**
   * Callback when the flyout opens
   */
  onFlyoutOpen: PropTypes.func,

  /**
   * Label text of the primary action in the flyout
   */
  primaryActionLabel: PropTypes.string,

  /**
   * Filters from react table's state
   */
  reactTableFiltersState: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired,
    })
  ),

  /**
   * Label text of the secondary action in the flyout
   */
  secondaryActionLabel: PropTypes.string,

  /**
   * Function that sets all the filters, this comes from the datagridState
   */
  setAllFilters: PropTypes.func.isRequired,

  /**
   * Title of the filter flyout
   */
  title: PropTypes.string,

  /**
   * The update method used to apply the filters
   */
  updateMethod: PropTypes.oneOf([BATCH, INSTANT]).isRequired,
};

export default FilterFlyout;
