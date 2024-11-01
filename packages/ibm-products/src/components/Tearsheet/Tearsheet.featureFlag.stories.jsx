/**
 * Copyright IBM Corp. 2020, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState } from 'react';

import { action } from '@storybook/addon-actions';

import { pkg } from '../../settings';

import {
  Button,
  ButtonSet,
  Dropdown,
  Tab,
  TabList,
  TextInput,
  ProgressIndicator,
  ProgressStep,
  CodeSnippet,
} from '@carbon/react';

import { Tearsheet, deprecatedProps } from './Tearsheet';
import {
  actionsOptions,
  actionsLabels,
  actionsMapping,
} from '../ActionSet/actions.js';

import { getDeprecatedArgTypes } from '../../global/js/utils/props-helper';
import styles from './_storybook-styles.scss?inline';
import { WithFeatureFlags } from '../../../../core/.storybook/WithFeatureFlags';
import { useStepContext, StepGroup, StepActions } from '../StepFlow';
import { useIsomorphicEffect } from '../../global/js/hooks';

// import mdx from './Tearsheet.mdx';

export default {
  title: 'IBM Products/Components/Tearsheet/Feature Flag',
  component: Tearsheet,
  tags: ['autodocs'],
  excludeStories: ['useStepFocus'],
  decorators: [
    (Story) => (
      <WithFeatureFlags
        flags={{
          'enable-v3-tearsheet': true,
        }}
      >
        <Story />
      </WithFeatureFlags>
    ),
  ],
  parameters: { styles /* docs: { page: mdx } */, layout: 'fullscreen' },
  argTypes: {
    ...getDeprecatedArgTypes(deprecatedProps),
    actions: {
      control: { type: 'select', labels: actionsLabels },
      options: actionsOptions,
      mapping: actionsMapping(
        {
          primary: 'Replace',
          danger: 'Delete',
          secondary: 'Back',
          secondary2: 'Keep Both',
          dangerGhost: 'Abort',
          ghost: 'Cancel',
        },
        action
      ),
    },
    description: { control: { type: 'text' } },
    headerActions: {
      control: {
        type: 'select',
        labels: {
          0: 'none',
          1: 'drop-down',
          2: 'buttons',
        },
      },
      options: [0, 1, 2],
      mapping: {
        0: null,
        1: (
          <Dropdown
            id="tss-had"
            label="Choose an option"
            titleText="Choose an option"
            items={['option 1', 'option 2', 'option 3', 'option 4']}
          />
        ),
        2: (
          <ButtonSet>
            <Button kind="secondary" size="sm" style={{ width: 'initial' }}>
              Secondary
            </Button>
            <Button kind="primary" size="sm" style={{ width: 'initial' }}>
              Primary
            </Button>
          </ButtonSet>
        ),
      },
    },
    label: { control: { type: 'text' } },
    title: { control: { type: 'text' } },
    influencer: { control: { disable: true } },
    onClose: { control: { disable: true } },
    navigation: { control: { disable: true } },
    open: { control: { disable: true } },
    portalTarget: { control: { disable: true } },
    aiLabel: {
      control: {
        type: 'select',
        labels: {
          0: 'No AI Label',
          1: 'with AI Label',
        },
        default: 0,
      },
      description:
        'Optional prop that is intended for any scenario where something is being generated by AI to reinforce AI transparency, accountability, and explainability at the UI level.',
      options: [0, 1],
    },
    slug: {
      control: {
        type: 'select',
        labels: {
          0: 'No AI Slug',
          1: 'with AI Slug',
        },
        default: 0,
      },
      description: 'Deprecated: Property replaced by "aiLabel"',
      options: [0, 1],
    },
  },
};

// Test values for props.

const closeIconDescription = 'Close the tearsheet';

const description =
  'This is a description for the tearsheet, providing an opportunity to \
  describe the flow over a couple of lines in the header of the tearsheet.';

const title = 'Title of the tearsheet';

export const useStepFocus = (stepPrimaryFocus) => {
  useIsomorphicEffect(() => {
    const stepFocusElement = document?.querySelector(stepPrimaryFocus);
    stepFocusElement?.focus();
  }, []);
};

function Step1() {
  const { setFormState, formState } = useStepContext();
  const { email } = formState || {};
  return (
    <div className="step-container">
      <h4>Step 1</h4>
      <TextInput
        id="email"
        onChange={(e) => {
          setFormState((prev) => ({
            ...prev,
            email: e.target.value,
          }));
        }}
        labelText="Email"
        value={email ?? ''}
      />
    </div>
  );
}

function Step2() {
  const { setFormState, formState } = useStepContext();
  const { city } = formState || {};
  const stepPrimaryFocus = 'city';
  useStepFocus(`#${stepPrimaryFocus}`);
  return (
    <div className="step-container">
      <h4>Step 2</h4>
      <TextInput
        id={stepPrimaryFocus}
        onChange={(e) => {
          setFormState((prev) => ({
            ...prev,
            city: e.target.value,
          }));
        }}
        labelText="City"
        value={city ?? ''}
      />
    </div>
  );
}

function Step3() {
  // Example showing how to get step state via hook
  const { formState } = useStepContext();
  return (
    <div className="step-container">
      <h4>Step 3</h4>
      <div>
        Form state
        <CodeSnippet type="multi">{JSON.stringify(formState)}</CodeSnippet>
      </div>
    </div>
  );
}

const className = 'client-class-1 client-class-2';

// Template.
// eslint-disable-next-line react/prop-types
const Template = ({ actions, aiLabel, influencer, slug, ...args }) => {
  const [open, setOpen] = useState(false);

  const wiredActions =
    actions &&
    Array.prototype.map.call(actions, (action) => {
      if (action.label === 'Cancel') {
        const previousClick = action.onClick;
        return {
          ...action,
          onClick: (evt) => {
            setOpen(false);
            previousClick(evt);
          },
        };
      }
      return action;
    });

  const ref = useRef(undefined);

  const handleNextDisabledState = (formState, currentStep) => {
    if (!formState?.email && currentStep === 1) {
      return true;
    }
    if (!formState?.city && currentStep === 2) {
      return true;
    }
    return false;
  };

  const handleBackDisabledState = (currentStep) => {
    if (currentStep === 1) {
      return true;
    }
    return false;
  };

  return (
    <>
      <style>{`.${pkg.prefix}--tearsheet { opacity: 0 }`};</style>
      <Button onClick={() => setOpen(true)}>Open Tearsheet</Button>
      <div ref={ref}>
        <Tearsheet
          className={className}
          {...args}
          influencer={influencer}
          open={open}
          onClose={() => setOpen(false)}
          title={'Tearsheet title'}
          hasCloseIcon={false}
          preventCloseOnClickOutside
          selectorPrimaryFocus="#email"
        >
          {/* Steps */}
          <StepGroup>
            <Step1 />
            <Step2 />
            <Step3 />
          </StepGroup>

          {/* Step actions */}
          <StepActions
            className={'my-custom-action-set'}
            buttonRenderer={({
              currentStep,
              handleNext,
              numSteps,
              handleGoToStep,
              setFormState,
              handlePrevious,
              formState,
            }) => (
              <>
                <Button
                  className="step-action-button step-action-button__cancel"
                  kind="ghost"
                  onClick={() => {
                    setOpen(false);
                  }}
                  size="xl"
                >
                  Cancel
                </Button>
                <Button
                  className="step-action-button"
                  kind="secondary"
                  onClick={() => handlePrevious()}
                  disabled={handleBackDisabledState(currentStep)}
                  size="xl"
                >
                  Back
                </Button>
                <Button
                  disabled={handleNextDisabledState(formState, currentStep)}
                  size="xl"
                  className="step-action-button"
                  onClick={() => {
                    if (currentStep === numSteps) {
                      // submit
                      setOpen(false);
                      handleGoToStep(1);
                      setFormState({});
                    } else {
                      handleNext();
                    }
                  }}
                >
                  {currentStep === numSteps ? 'Submit' : 'Next'}
                </Button>
              </>
            )}
          />
        </Tearsheet>
      </div>
    </>
  );
};

const tabs = (
  <div className="tearsheet-stories__tabs">
    <TabList aria-label="Tab list">
      <Tab>Tab 1</Tab>
      <Tab>Tab 2</Tab>
      <Tab>Tab 3</Tab>
      <Tab>Tab 4</Tab>
    </TabList>
  </div>
);

// Stories
export const tearsheet = Template.bind({});
tearsheet.storyName = 'With steps';
tearsheet.args = {
  closeIconDescription,
  description,
  onClose: action('onClose called'),
  title,
  actions: 7,
  selectorPrimaryFocus: '#tss-ft1',
  influencer: ({ currentStep, handleGoToStep }) => (
    <div className="tearsheet-stories__dummy-content-block">
      <ProgressIndicator
        vertical
        onChange={(stepIndex) => handleGoToStep(stepIndex + 1)}
      >
        <ProgressStep
          complete={currentStep > 1}
          current={currentStep === 1}
          label="Step 1"
          secondaryLabel="Optional label"
        />
        <ProgressStep
          complete={currentStep > 2}
          current={currentStep === 2}
          label="Step 2"
        />
        <ProgressStep
          current={currentStep === 3}
          label="Step 3"
          complete={currentStep > 3}
        />
      </ProgressIndicator>
    </div>
  ),
};
