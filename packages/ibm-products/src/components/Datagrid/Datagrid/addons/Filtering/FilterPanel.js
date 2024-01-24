/* eslint-disable react/jsx-key */
/**
 * Copyright IBM Corp. 2022, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useMemo, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Accordion,
  AccordionItem,
  Button,
  Search,
} from 'carbon-components-react';
import { rem } from '@carbon/layout';
import { pkg } from '../../../../../settings';
import { BATCH, CLEAR_FILTERS, INSTANT, PANEL } from './constants';
import cx from 'classnames';
import { motion, useReducedMotion } from 'framer-motion';
import {
  panelVariants,
  innerContainerVariants,
  actionSetVariants,
} from './motion/variants';
import { Close32 } from '@carbon/icons-react';
import { ActionSet } from '../../../../ActionSet';
import { FilterContext } from '.';
import {
  useFilters,
  useSubscribeToEventEmitter,
  useShouldDisableButtons,
} from './hooks';

const blockClass = `${pkg.prefix}--datagrid`;
const componentClass = `${blockClass}-filter-panel`;

const MotionActionSet = motion(ActionSet);

const FilterPanel = ({
  title = 'Filter',
  closeIconDescription = 'Close filter panel',
  updateMethod = BATCH,
  filterSections,
  setAllFilters,
  onApply = () => {},
  onCancel = () => {},
  onPanelOpen = () => {},
  onPanelClose = () => {},
  showFilterSearch = false,
  filterPanelMinHeight = 600,
  primaryActionLabel = 'Apply',
  secondaryActionLabel = 'Cancel',
  searchLabelText = 'Filter search',
  searchPlaceholder = 'Find filters',
  reactTableFiltersState = [],
  isFetching = false,
}) => {
  /** State */
  const [showDividerLine, setShowDividerLine] = useState(false);

  /** Context */
  const { panelOpen, setPanelOpen } = useContext(FilterContext);

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
    filters: filterSections,
    setAllFilters,
    variation: PANEL,
    reactTableFiltersState,
    onCancel,
    panelOpen,
    isFetching,
  });

  /** Refs */
  const filterPanelRef = useRef();
  const filterHeadingRef = useRef();
  const filterSearchRef = useRef();
  const actionSetRef = useRef();

  /** State from hooks */
  const [shouldDisableButtons, setShouldDisableButtons] =
    useShouldDisableButtons({
      initialValue: true,
      filtersState,
      prevFiltersRef,
    });

  const shouldReduceMotion = useReducedMotion();

  /** Memos */
  const showActionSet = useMemo(() => updateMethod === BATCH, [updateMethod]);

  /** Methods */
  const closePanel = () => {
    cancel();
    setPanelOpen(false);
  };

  const apply = () => {
    setAllFilters(filtersObjectArray);

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

  const renderActionSet = () => {
    return (
      showActionSet && (
        <MotionActionSet
          actions={[
            {
              key: 1,
              kind: 'primary',
              label: primaryActionLabel,
              onClick: apply,
              disabled: shouldDisableButtons,
            },
            {
              key: 2,
              kind: 'secondary',
              label: secondaryActionLabel,
              onClick: cancel,
              disabled: shouldDisableButtons,
            },
          ]}
          className={`${componentClass}__action-set`}
          ref={actionSetRef}
          custom={shouldReduceMotion}
          variants={actionSetVariants}
        />
      )
    );
  };

  const onInnerContainerScroll = (event) => {
    if (event.target.scrollTop > 0) {
      setShowDividerLine(true);
    } else {
      setShowDividerLine(false);
    }
  };

  /** Effects */
  useEffect(
    function liftOpenStateToParent() {
      if (panelOpen) {
        onPanelOpen(panelOpen);
      } else {
        onPanelClose(panelOpen);
      }
    },
    [panelOpen, onPanelClose, onPanelOpen]
  );

  useEffect(
    function setPanelMinimumHeight() {
      filterPanelRef.current?.style.setProperty(
        '--filter-panel-min-height',
        rem(filterPanelMinHeight)
      );
    },
    [filterPanelMinHeight]
  );

  useSubscribeToEventEmitter(CLEAR_FILTERS, reset);

  const getScrollableContainerHeight = () => {
    const filterHeadingHeight =
      filterHeadingRef.current?.getBoundingClientRect().height;
    const filterSearchHeight =
      filterSearchRef.current?.getBoundingClientRect().height;
    const actionSetHeight =
      actionSetRef.current?.getBoundingClientRect().height;

    const height = panelOpen
      ? `calc(100vh - ${filterHeadingHeight}px - ${
          /* istanbul ignore next */
          showFilterSearch ? filterSearchHeight : 0
        }px - ${updateMethod === BATCH ? actionSetHeight : 0}px)`
      : 0;

    return height;
  };

  return (
    <motion.div
      ref={filterPanelRef}
      className={cx(componentClass, `${componentClass}__container`, {
        [`${componentClass}--open`]: panelOpen,
        [`${componentClass}--batch`]: showActionSet,
        [`${componentClass}--instant`]: !showActionSet,
      })}
      initial={false}
      animate={panelOpen ? 'visible' : 'hidden'}
      custom={shouldReduceMotion}
      variants={panelVariants}
    >
      <motion.div custom={shouldReduceMotion} variants={innerContainerVariants}>
        <header
          ref={filterHeadingRef}
          className={cx(`${componentClass}__heading`, {
            [`${componentClass}__heading--with-divider`]: showDividerLine,
          })}
        >
          <div className={`${componentClass}__title`}>{title}</div>
          <Button
            hasIconOnly
            renderIcon={Close32}
            iconDescription={closeIconDescription}
            kind="ghost"
            tooltipPosition="bottom"
            tooltipAlignment="end"
            onClick={closePanel}
          />
          {showFilterSearch && (
            <div ref={filterSearchRef} className={`${componentClass}__search`}>
              <Search
                labelText={searchLabelText}
                placeHolderText={searchPlaceholder}
                light={true}
                size="sm"
              />
            </div>
          )}
        </header>

        <div
          className={`${componentClass}__inner-container`}
          style={{ height: getScrollableContainerHeight() }}
          onScroll={onInnerContainerScroll}
        >
          {filterSections.map(
            ({ categoryTitle = null, filters = [], hasAccordion }, index) => {
              return (
                <div key={index} className={`${componentClass}__category`}>
                  {categoryTitle && (
                    <div className={`${componentClass}__category-title`}>
                      {categoryTitle}
                    </div>
                  )}

                  {hasAccordion ? (
                    <Accordion>
                      {filters.map(({ filterLabel, filter }) => {
                        return (
                          <AccordionItem title={filterLabel} key={filterLabel}>
                            {renderFilter(filter)}
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  ) : (
                    filters.map(({ filter }) => renderFilter(filter))
                  )}
                </div>
              );
            }
          )}
        </div>
        {renderActionSet()}
      </motion.div>
    </motion.div>
  );
};

FilterPanel.propTypes = {
  closeIconDescription: PropTypes.string,
  filterPanelMinHeight: PropTypes.number,
  filterSections: PropTypes.array,
  isFetching: PropTypes.bool,
  onApply: PropTypes.func,
  onCancel: PropTypes.func,
  onPanelClose: PropTypes.func,
  onPanelOpen: PropTypes.func,
  open: PropTypes.bool,
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
  searchLabelText: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  secondaryActionLabel: PropTypes.string,
  setAllFilters: PropTypes.func.isRequired,
  showFilterSearch: PropTypes.bool,
  title: PropTypes.string,
  updateMethod: PropTypes.oneOf([BATCH, INSTANT]),
};

export default FilterPanel;
