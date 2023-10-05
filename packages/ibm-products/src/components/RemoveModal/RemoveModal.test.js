//
// Copyright IBM Corp. 2020, 2021
//
// This source code is licensed under the Apache-2.0 license found in the
// LICENSE file in the root directory of this source tree.
//

import { fireEvent, render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { RemoveModal } from '.';

const componentName = RemoveModal.displayName;
const resourceName = 'bx1001';
const defaultProps = {
  body: 'test body',
  className: 'test-class',
  iconDescription: 'test icon description',
  inputInvalidText: 'invalid input',
  inputLabelText: `type ${resourceName} to confirm`,
  inputPlaceholderText: 'name of resourceName',
  label: 'test label',
  open: true,
  primaryButtonDisabled: false,
  primaryButtonText: 'primary button text',
  resourceName,
  secondaryButtonText: 'secondary button text',
  textConfirmation: false,
  title: 'test title',
};

describe(componentName, () => {
  it('renders title', async () => {
    render(<RemoveModal {...defaultProps} />);
    screen.getByText(defaultProps.title);
  });

  it('renders body', async () => {
    render(<RemoveModal {...defaultProps} />);
    screen.getByText(defaultProps.body);
  });

  it('renders label', async () => {
    render(<RemoveModal {...defaultProps} />);
    screen.getByText(defaultProps.label);
  });

  it('renders icon description', async () => {
    render(<RemoveModal {...defaultProps} />);
    screen.getByRole('button', { name: defaultProps.iconDescription });
  });

  it('renders text input', async () => {
    render(<RemoveModal {...defaultProps} textConfirmation />);
    screen.getByText(defaultProps.inputLabelText);
    const textInput = screen.getByRole('textbox');
    expect(textInput).toHaveAttribute(
      'placeholder',
      defaultProps.inputPlaceholderText
    );
  });

  it('renders without text confirmation functionality', async () => {
    const { click } = userEvent;
    const { fn } = jest;
    const onRequestSubmit = fn();
    const onClose = fn();
    const props = {
      ...defaultProps,
      onClose,
      onRequestSubmit,
    };

    render(<RemoveModal {...props} />);
    await act(() => click(screen.getByText(props.primaryButtonText)));

    expect(onRequestSubmit).toBeCalled();
    await act(() => click(screen.getByText(props.secondaryButtonText)));
    expect(onClose).toBeCalled();
  });

  it('renders with text confirmation functionality', async () => {
    const { change } = fireEvent;
    const { click } = userEvent;
    const { fn } = jest;
    const onRequestSubmit = fn();
    const props = {
      ...defaultProps,
      textConfirmation: true,
      onRequestSubmit,
    };

    render(<RemoveModal {...props} />);

    await act(() => click(screen.getByText(props.primaryButtonText)));
    expect(onRequestSubmit).not.toBeCalled();

    const textInput = screen.getByRole('textbox');
    change(textInput, {
      target: { value: 'bx1002' },
    });
    await act(() => click(screen.getByText(props.primaryButtonText)));
    expect(onRequestSubmit).not.toBeCalled();

    change(textInput, {
      target: { value: 'bx1001' },
    });
    await act(() => click(screen.getByText(props.primaryButtonText)));
    expect(onRequestSubmit).toBeCalled();
  });

  it('disables the primary button when primaryButtonDisabled is used', async () => {
    render(<RemoveModal {...defaultProps} primaryButtonDisabled />);
    const primaryButton = screen.getByText(defaultProps.primaryButtonText);
    expect(primaryButton).toHaveAttribute('disabled');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RemoveModal {...defaultProps} />);
    expect(container).toBeAccessible(componentName);
    expect(container).toHaveNoAxeViolations();
  });

  it('applies className to the containing node', async () => {
    render(<RemoveModal {...defaultProps} />);

    expect(screen.getByRole('presentation')).toHaveClass(
      defaultProps.className
    );
  });

  const dataTestId = 'data-testid';

  it('adds additional properties to the containing node', async () => {
    render(<RemoveModal {...defaultProps} data-testid={dataTestId} />);
    screen.getByTestId(dataTestId);
  });

  it('forwards a ref to an appropriate node', async () => {
    const ref = React.createRef();
    render(<RemoveModal {...defaultProps} ref={ref} />);
    expect(ref.current).not.toBeNull();
  });

  it('adds the Devtools attribute to the containing node', async () => {
    render(<RemoveModal {...defaultProps} data-testid={dataTestId} />);

    expect(screen.getByTestId(dataTestId)).toHaveDevtoolsAttribute(
      componentName
    );
  });
});
