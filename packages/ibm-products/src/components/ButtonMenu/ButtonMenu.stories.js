/**
 * Copyright IBM Corp. 2021, 2021
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { action } from '@storybook/addon-actions';

import {
  getStoryTitle,
  prepareStory,
} from '../../global/js/utils/story-helper';
import { ActionableNotification } from '@carbon/react';

import { ButtonMenu, ButtonMenuItem } from '.';
// import mdx from './ButtonMenu.mdx';

// import styles from './_storybook-styles.scss';

import { Add } from '@carbon/react/icons';

export default {
  title: getStoryTitle(ButtonMenu.displayName),
  component: ButtonMenu,
  tags: ['autodocs'],
  // TODO: Define argTypes for props not represented by standard JS types.
  // argTypes: {
  //   egProp: { control: 'color' },
  // },
  parameters: {
    // styles,
    /*
docs: {
      page: mdx,
    },
*/
  },
};

const Template = (args) => {
  return (
    <>
      <ActionableNotification
        title="Deprecation notice"
        subtitle="This component is deprecated and will be removed in the next major version. Please migrate to Carbon’s MenuButton."
        inline
        kind="warning"
        lowContrast
        hideCloseButton
        actionButtonLabel="See MenuButton"
        statusIconDescription="deprecation notification"
        onActionButtonClick={() => {
          window.open(
            'https://react.carbondesignsystem.com/?path=/docs/components-menubutton--overview'
          );
        }}
        style={{ marginBottom: '1rem' }}
      />
      <ButtonMenu
        label="Primary button"
        menuAriaLabel="Primary button"
        renderIcon={(props) => <Add size={16} {...props} />}
        {...args}
      >
        <ButtonMenuItem
          itemText="Option 1a"
          onClick={action(`Click on Option 1`)}
        />
        <ButtonMenuItem
          itemText="Option 2"
          onClick={action(`Click on Option 2`)}
        />
        <ButtonMenuItem
          itemText="Option 3"
          onClick={action(`Click on Option 3`)}
        />
        <ButtonMenuItem
          itemText="Option 4"
          onClick={action(`Click on Option 4`)}
          hasDivider
        />
      </ButtonMenu>
    </>
  );
};

export const buttonMenu = prepareStory(Template, {
  storyName: 'Button menu',
  args: {},
});
