/**
 * Copyright IBM Corp. 2020, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Import portions of React that are needed.
import React, {
  useState,
  useRef,
  useEffect,
  PropsWithChildren,
  ReactNode,
  ForwardedRef,
  MutableRefObject,
  RefObject,
  useCallback,
  Dispatch,
  SetStateAction,
} from 'react';

// Other standard imports.
import PropTypes from 'prop-types';
import cx from 'classnames';
import { pkg } from '../../settings';
import { getNodeTextContent } from '../../global/js/utils/getNodeTextContent';
// Carbon and package components we use.
import {
  Button,
  ComposedModal,
  Layer,
  ModalHeader,
  usePrefix,
  type ButtonProps,
  unstable_FeatureFlags as FeatureFlags,
} from '@carbon/react';

import { ActionSet } from '../ActionSet';
import { Wrap } from '../../global/js/utils/Wrap';
import { usePortalTarget } from '../../global/js/hooks/usePortalTarget';
import { StepContext } from '../StepFlow/stepContext';
import { usePreviousValue } from '../../global/js/hooks';

// The block part of our conventional BEM class names (bc__E--M).
const bc = `${pkg.prefix}--tearsheet`;
const componentName = 'TearsheetShell';

interface TearsheetShellProps extends PropsWithChildren {
  actions?: ButtonProps<'button'>[];

  /**
   * Optional prop that is intended for any scenario where something is being generated by AI to reinforce AI transparency,
   * accountability, and explainability at the UI level.
   */
  aiLabel?: ReactNode;

  ariaLabel?: string;

  /**
   * An optional class or classes to be added to the outermost element.
   */
  className?: string;

  /**
   * A description of the flow, displayed in the header area of the tearsheet.
   */
  description?: ReactNode;

  /**
   * Enable a close icon ('x') in the header area of the tearsheet. By default,
   * (when this prop is omitted, or undefined or null) a tearsheet does not
   * display a close icon if there are navigation actions ("transactional
   * tearsheet") and displays one if there are no navigation actions ("passive
   * tearsheet"), and that behavior can be overridden if required by setting
   * this prop to either true or false.
   */
  hasCloseIcon?: boolean;

  /**
   * The content for the header actions area, displayed alongside the title in
   * the header area of the tearsheet. This is typically a drop-down, or a set
   * of small buttons, or similar. NB the headerActions is only applicable for
   * wide tearsheets.
   */
  headerActions?: ReactNode;

  /**
   * The content for the influencer section of the tearsheet, displayed
   * alongside the main content. This is typically a menu, or filter, or
   * progress indicator, or similar. NB the influencer is only applicable for
   * wide tearsheets.
   */
  influencer?: ((step: StepContextType) => void) | ReactNode;

  /**
   * The position of the influencer section, 'left' or 'right'.
   */
  influencerPosition?: 'left' | 'right';

  /**
   * The width of the influencer: 'narrow' (the default) is 256px, and 'wide'
   * is 320px.
   */
  influencerWidth?: 'narrow' | 'wide';

  /**
   * A label for the tearsheet, displayed in the header area of the tearsheet
   * to maintain context for the tearsheet (e.g. as the title changes from page
   * to page of a multi-page task).
   */
  label?: ReactNode;

  /**
   * Provide a ref to return focus to once the tearsheet is closed.
   */
  launcherButtonRef?: RefObject<any>;

  /**
   * Navigation content, such as a set of tabs, to be displayed at the bottom
   * of the header area of the tearsheet. NB the navigation is only applicable
   * for wide tearsheets.
   */
  navigation?: ReactNode;

  /**
   * An optional handler that is called when the user closes the tearsheet (by
   * clicking the close button, if enabled, or clicking outside, if enabled).
   * Returning `false` here prevents the modal from closing.
   */
  // onClose?: () => (React.MouseEventHandler<HTMLButtonElement>, {});
  onClose?: (event: MouseEvent, step: StepContextType) => void;

  /**
   * Specifies whether the tearsheet is currently open.
   */
  open?: boolean;

  /**
   * The DOM element that the tearsheet should be rendered within. Defaults to document.body.
   */
  portalTarget?: ReactNode;

  /**
   * Specify a CSS selector that matches the DOM element that should be
   * focused when the Modal opens.
   */
  selectorPrimaryFocus?: string;

  /**
   * Specify the CSS selectors that match the floating menus.
   *
   * See https://react.carbondesignsystem.com/?path=/docs/components-composedmodal--overview#focus-management
   */
  selectorsFloatingMenus?: string[];

  /**
   * Specifies the width of the tearsheet, 'narrow' or 'wide'.
   */
  size: 'narrow' | 'wide';

  /**
   * The main title of the tearsheet, displayed in the header area.
   */
  title?: ReactNode;

  verticalPosition?: 'normal' | 'lower';

  // Deprecated props
  /**
   * @deprecated Property replaced by `aiLabel`
   */
  slug?: ReactNode;
}

export type CloseIconDescriptionTypes =
  | {
      hasCloseIcon?: false;
      closeIconDescription?: string;
    }
  | {
      hasCloseIcon: true;
      closeIconDescription: string;
    };

// NOTE: the component SCSS is not imported here: it is rolled up separately.

// these props are only applicable when size='wide'
export const tearsheetShellWideProps = [
  'headerActions',
  'influencer',
  'influencerPosition',
  'influencerWidth',
  'navigation',
];

// export const tearsheetIsPassive = (actions) => !actions || !actions?.length;
// export const tearsheetHasCloseIcon = (actions, hasCloseIcon) =>
//   hasCloseIcon ?? tearsheetIsPassive(actions);

export interface StepContextType {
  formState: object;
  setFormState: Dispatch<SetStateAction<object>>;
  numSteps: number | undefined;
  setNumSteps: Dispatch<SetStateAction<number | undefined>>;
  currentStep: number;
  handleGoToStep: (a: number) => void;
  handleNext: () => void;
  handlePrev: () => void;
}

/**
 *  TearSheetShell is used internally by TearSheet and TearSheetNarrow
 *
 * The component is not public.
 *
 * See the canvas tab for the component API details.
 * */
export const TearsheetShellV2 = React.forwardRef(
  (
    {
      // The component props, in alphabetical order (for consistency).
      actions,
      aiLabel,
      ariaLabel,
      children,
      className,
      closeIconDescription,
      description,
      hasCloseIcon,
      headerActions,
      influencer,
      influencerPosition = 'left',
      influencerWidth,
      label,
      navigation,
      onClose,
      open,
      portalTarget: portalTargetIn,
      selectorPrimaryFocus,
      selectorsFloatingMenus = [],
      size = 'wide',
      title,
      launcherButtonRef,
      // Collect any other property values passed in.
      ...rest
    }: TearsheetShellProps & CloseIconDescriptionTypes,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const carbonPrefix = usePrefix();
    const bcModalHeader = `${carbonPrefix}--modal-header`;
    const renderPortalUse = usePortalTarget(portalTargetIn);
    const localRef = useRef(undefined);
    const modalBodyRef = useRef(null);
    const modalRef = (ref || localRef) as MutableRefObject<HTMLDivElement>;
    const prevOpen = usePreviousValue(open);

    const [numSteps, setNumSteps] = useState<number>();
    const [currentStep, setCurrentStep] = useState(1);
    const [formState, setFormState] = useState({});

    const context: StepContextType = {
      formState,
      setFormState,
      numSteps,
      setNumSteps,
      currentStep,
      handleGoToStep: (step) => setCurrentStep(step),
      handleNext: () => setCurrentStep((step) => step + 1),
      handlePrev: () => setCurrentStep((step) => step - 1),
    };

    useEffect(() => {
      if (prevOpen && !open && launcherButtonRef) {
        setTimeout(() => {
          launcherButtonRef.current.focus();
        }, 0);
      }
    }, [launcherButtonRef, open, prevOpen]);

    // Function to strip html tags out of a string.
    const stripTags = useCallback(
      (input) => input.replace(/<\/?[^>]+(>|$)/g, ''),
      []
    );

    const titleText = stripTags(String(description));
    const wide = size === 'wide';

    // A "passive" tearsheet is one with no navigation actions.
    // const isPassive = tearsheetIsPassive(actions);
    const effectiveHasCloseIcon = hasCloseIcon;

    // Include a modal header if and only if one or more of these is given.
    // We can't use a Wrap for the ModalHeader because ComposedModal requires
    // the direct child to be the ModalHeader instance.
    const includeHeader =
      label || title || description || headerActions || navigation;

    // Include an ActionSet if and only if one or more actions is given.
    const includeActions = actions && actions?.length > 0;

    return renderPortalUse(
      <FeatureFlags
        flags={{
          'enable-experimental-focus-wrap-without-sentinels': true,
        }}
      >
        <StepContext.Provider value={context}>
          <ComposedModal
            {
              // Pass through any other property values.
              ...rest
            }
            aria-label={ariaLabel || getNodeTextContent(title)}
            className={cx(bc, className, {
              [`${bc}--wide`]: wide,
              [`${bc}--narrow`]: !wide,
              [`${bc}--has-ai-label`]: aiLabel,
              [`${bc}--has-close`]: effectiveHasCloseIcon,
              [`${bc}--has-influencer`]: influencer,
              [`${bc}--has-influencer__right`]: influencerPosition === 'right',
              [`${bc}--has-influencer__left`]: influencerPosition === 'left',
            })}
            slug={aiLabel}
            onClose={(e) => onClose?.(e, context)}
            {...{ open, selectorPrimaryFocus }}
            containerClassName={cx(`${bc}__container`)}
            ref={modalRef}
            selectorsFloatingMenus={[
              `.${carbonPrefix}--overflow-menu-options`,
              `.${carbonPrefix}--tooltip`,
              '.flatpickr-calendar',
              `.${bc}__container`,
              ...selectorsFloatingMenus,
            ]}
            size="sm"
          >
            {includeHeader && (
              <ModalHeader
                className={cx(`${bc}__header`, {
                  [`${bc}__header--with-close-icon`]: effectiveHasCloseIcon,
                  [`${bc}__header--with-nav`]: navigation,
                })}
                closeClassName={cx({
                  [`${bc}__header--no-close-icon`]: !effectiveHasCloseIcon,
                })}
                closeModal={onClose}
                iconDescription={closeIconDescription}
              >
                <Wrap
                  className={`${bc}__header-content`}
                  element={wide ? Layer : undefined}
                >
                  <Wrap className={`${bc}__header-fields`}>
                    {/* we create the label and title here instead of passing them
                      as modal header props so we can wrap them in layout divs */}
                    <Wrap element="h2" className={`${bcModalHeader}__label`}>
                      {label}
                    </Wrap>
                    <Wrap
                      element="h3"
                      className={cx(
                        `${bcModalHeader}__heading`,
                        `${bc}__heading`
                      )}
                    >
                      {title}
                    </Wrap>
                    <Wrap
                      className={`${bc}__header-description`}
                      title={titleText}
                    >
                      {description}
                    </Wrap>
                  </Wrap>
                  <Wrap className={`${bc}__header-actions`}>
                    {headerActions}
                  </Wrap>
                </Wrap>
                <Wrap className={`${bc}__header-navigation`}>{navigation}</Wrap>
              </ModalHeader>
            )}
            <Wrap
              ref={modalBodyRef}
              className={`${carbonPrefix}--modal-content ${bc}__body`}
            >
              <Wrap
                className={cx({
                  [`${bc}__influencer`]: true,
                  [`${bc}__influencer--wide`]: influencerWidth === 'wide',
                })}
                neverRender={influencerPosition === 'right'}
              >
                {typeof influencer === 'function' ? (
                  <>{influencer(context)}</>
                ) : (
                  influencer
                )}
              </Wrap>
              <Wrap className={`${bc}__right`}>
                <Wrap className={`${bc}__main`} alwaysRender={includeActions}>
                  <Wrap
                    className={`${bc}__content ${bc}__content__v2`}
                    alwaysRender={
                      !!(influencer && influencerPosition === 'right')
                    }
                    tabIndex={-1}
                  >
                    {children}
                  </Wrap>
                  <Wrap
                    className={cx({
                      [`${bc}__influencer`]: true,
                      [`${bc}__influencer--wide`]: influencerWidth === 'wide',
                    })}
                    neverRender={influencerPosition !== 'right'}
                  >
                    {typeof influencer === 'function' ? (
                      <>{influencer(context)}</>
                    ) : (
                      influencer
                    )}
                  </Wrap>
                </Wrap>
                {includeActions && (
                  <Wrap className={`${bc}__button-container`}>
                    <ActionSet
                      actions={actions}
                      buttonSize={wide ? '2xl' : undefined}
                      className={`${bc}__buttons`}
                      size={wide ? '2xl' : 'lg'}
                      aria-hidden={!open}
                    />
                  </Wrap>
                )}
              </Wrap>
            </Wrap>
          </ComposedModal>
        </StepContext.Provider>
      </FeatureFlags>
    );
  }
);

// The display name of the component, used by React. Note that displayName
// is used in preference to relying on function.name.
TearsheetShellV2.displayName = componentName;

export const portalType =
  typeof Element === 'undefined'
    ? PropTypes.object
    : // eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
      PropTypes.instanceOf(Element);

// The types and DocGen commentary for the component props,
// in alphabetical order (for consistency).
// See https://www.npmjs.com/package/prop-types#usage.

// Note that the descriptions here should be kept in sync with those for the
// corresponding props for Tearsheet and TearsheetNarrow components.
TearsheetShellV2.propTypes = {
  /**
   * The actions to be shown as buttons in the action area at the bottom of the
   * tearsheet. Each action is specified as an object with optional fields
   * 'label' to supply the button label, 'kind' to select the button kind (must
   * be 'primary', 'secondary' or 'ghost'), 'loading' to display a loading
   * indicator, and 'onClick' to receive notifications when the button is
   * clicked. Additional fields in the object will be passed to the Button
   * component, and these can include 'disabled', 'ref', 'className', and any
   * other Button props. Any other fields in the object will be passed through
   * to the button element as HTML attributes.
   *
   * See https://react.carbondesignsystem.com/?path=/docs/components-button--default#component-api
   */
  /**@ts-ignore*/
  actions: PropTypes.arrayOf(
    // NB we don't include the validator here, as the component wrapping this
    // one should ensure appropriate validation is done.
    PropTypes.shape({
      /**@ts-ignore*/
      ...Button.propTypes,
      kind: PropTypes.oneOf([
        'ghost',
        'danger--ghost',
        'secondary',
        'danger',
        'primary',
      ]),
      label: PropTypes.string,
      loading: PropTypes.bool,
      // we duplicate this Button prop to improve the DocGen here
      /**@ts-ignore*/
      onClick: Button.propTypes.onClick,
    })
  ),

  /**
   * Optional prop that is intended for any scenario where something is being generated by AI to reinforce AI transparency,
   * accountability, and explainability at the UI level.
   */
  aiLabel: PropTypes.oneOfType([PropTypes.node, PropTypes.bool]),

  ariaLabel: PropTypes.string,

  /**
   * The main content of the tearsheet.
   */
  children: PropTypes.node,

  /**
   * An optional class or classes to be added to the outermost element.
   */
  className: PropTypes.string,

  /**
   * The accessibility title for the close icon (if shown).
   *
   * **Note:** This prop is only required if a close icon is shown, i.e. if
   * there are a no navigation actions and/or hasCloseIcon is true.
   */
  /**@ts-ignore*/
  closeIconDescription: PropTypes.string.isRequired.if(
    ({ hasCloseIcon }) => !!hasCloseIcon
  ),

  /**
   * A description of the flow, displayed in the header area of the tearsheet.
   */
  description: PropTypes.node,

  /**
   * Enable a close icon ('x') in the header area of the tearsheet. By default,
   * (when this prop is omitted, or undefined or null) a tearsheet does not
   * display a close icon if there are navigation actions ("transactional
   * tearsheet") and displays one if there are no navigation actions ("passive
   * tearsheet"), and that behavior can be overridden if required by setting
   * this prop to either true or false.
   */
  /**@ts-ignore*/
  hasCloseIcon: PropTypes.bool,

  /**
   * The content for the header actions area, displayed alongside the title in
   * the header area of the tearsheet. This is typically a drop-down, or a set
   * of small buttons, or similar. NB the headerActions is only applicable for
   * wide tearsheets.
   */
  headerActions: PropTypes.element,

  /**
   * The content for the influencer section of the tearsheet, displayed
   * alongside the main content. This is typically a menu, or filter, or
   * progress indicator, or similar. NB the influencer is only applicable for
   * wide tearsheets.
   */
  influencer: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),

  /**
   * The position of the influencer section, 'left' or 'right'.
   */
  influencerPosition: PropTypes.oneOf(['left', 'right']),

  /**
   * The width of the influencer: 'narrow' (the default) is 256px, and 'wide'
   * is 320px.
   */
  influencerWidth: PropTypes.oneOf(['narrow', 'wide']),

  /**
   * A label for the tearsheet, displayed in the header area of the tearsheet
   * to maintain context for the tearsheet (e.g. as the title changes from page
   * to page of a multi-page task).
   */
  label: PropTypes.node,

  /**
   * Provide a ref to return focus to once the tearsheet is closed.
   */
  /**@ts-ignore */
  launcherButtonRef: PropTypes.any,

  /**
   * Navigation content, such as a set of tabs, to be displayed at the bottom
   * of the header area of the tearsheet. NB the navigation is only applicable
   * for wide tearsheets.
   */
  navigation: PropTypes.element,

  /**
   * An optional handler that is called when the user closes the tearsheet (by
   * clicking the close button, if enabled, or clicking outside, if enabled).
   * Returning `false` here prevents the modal from closing.
   */
  onClose: PropTypes.func,

  /**
   * Specifies whether the tearsheet is currently open.
   */
  open: PropTypes.bool,

  /**
   * The DOM element that the tearsheet should be rendered within. Defaults to document.body.
   */
  /**@ts-ignore*/
  portalTarget: portalType,

  /**
   * Specify a CSS selector that matches the DOM element that should be
   * focused when the Modal opens.
   */
  selectorPrimaryFocus: PropTypes.string,

  /**
   * Specify the CSS selectors that match the floating menus.
   *
   * See https://react.carbondesignsystem.com/?path=/docs/components-composedmodal--overview#focus-management
   */
  /**@ts-ignore*/
  selectorsFloatingMenus: PropTypes.arrayOf(PropTypes.string),

  /**
   * Specifies the width of the tearsheet, 'narrow' or 'wide'.
   */
  /**@ts-ignore*/
  size: PropTypes.oneOf(['narrow', 'wide']).isRequired,
  /**
   * The main title of the tearsheet, displayed in the header area.
   */
  title: PropTypes.node,
};
