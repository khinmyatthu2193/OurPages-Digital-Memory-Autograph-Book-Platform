import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MemoryForm from './MemoryForm.jsx';

const submitMemory = vi.hoisted(() => vi.fn());
vi.mock('../../services/publicBookService.js', () => ({
  publicBookService: { submitMemory },
}));

const props = {
  username: 'khin',
  prompts: [],
  onSuccess: vi.fn(),
  onClose: vi.fn(),
};

beforeEach(() => {
  submitMemory.mockReset();
});
afterEach(() => {
  props.onSuccess.mockReset();
  props.onClose.mockReset();
});

function openForm() {
  render(<MemoryForm {...props} />);
  return screen.getByRole('dialog', { name: 'Leave a memory' });
}

describe('guest memory form', () => {
  it('requires a message and a name unless anonymous', () => {
    const dialog = openForm();
    fireEvent.submit(dialog.querySelector('form'));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Please write a memory',
    );
    fireEvent.change(screen.getByLabelText('Your memory'), {
      target: { value: 'A good day' },
    });
    fireEvent.submit(dialog.querySelector('form'));
    expect(screen.getByRole('alert')).toHaveTextContent('Please add your name');
    expect(submitMemory).not.toHaveBeenCalled();
  });

  it('shows a saving state and sends only the guest fields', async () => {
    let finish;
    submitMemory.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const dialog = openForm();
    fireEvent.change(screen.getByLabelText('Your name'), {
      target: { value: 'Su Su' },
    });
    fireEvent.change(screen.getByLabelText('Your memory'), {
      target: { value: 'Remember the library?' },
    });
    fireEvent.submit(dialog.querySelector('form'));
    expect(
      screen.getByRole('button', { name: 'Saving your memory...' }),
    ).toBeDisabled();
    expect(submitMemory).toHaveBeenCalledWith('khin', {
      authorName: 'Su Su',
      message: 'Remember the library?',
      isAnonymous: false,
      website: '',
    });
    finish();
    await waitFor(() => expect(props.onSuccess).toHaveBeenCalledOnce());
  });

  it('offers a retry after a failed submission', async () => {
    submitMemory.mockRejectedValueOnce(new Error('Please try again.'));
    const dialog = openForm();
    fireEvent.click(screen.getByLabelText('Post anonymously'));
    fireEvent.change(screen.getByLabelText('Your memory'), {
      target: { value: 'A good day' },
    });
    fireEvent.submit(dialog.querySelector('form'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please try again.',
    );
    expect(
      screen.getByRole('button', { name: 'Save this memory' }),
    ).toBeEnabled();
  });

  it('focuses the dialog and closes on Escape', () => {
    const dialog = openForm();
    expect(
      screen.getByRole('button', { name: 'Close memory form' }),
    ).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(props.onClose).toHaveBeenCalledOnce();
  });
});
