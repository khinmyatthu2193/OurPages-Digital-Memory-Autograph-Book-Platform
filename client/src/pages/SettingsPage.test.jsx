import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardContext } from '../components/dashboard/dashboard-context.js';
import SettingsPage from './SettingsPage.jsx';

const profile = {
  display_name: 'Khin',
  username: 'khin',
  bio: '',
  memory_book_mode: 'standard',
  graduation_title: null,
  graduation_class: null,
  graduation_year: null,
  graduation_message: null,
};

describe('graduation settings', () => {
  it('enables, edits, and disables the optional graduation mode', async () => {
    const updateProfile = vi.fn().mockResolvedValue(profile);
    render(
      <DashboardContext.Provider value={{ profile, updateProfile }}>
        <SettingsPage />
      </DashboardContext.Provider>,
    );

    expect(screen.queryByLabelText('Title')).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('radio', { name: /^Graduation \/ Farewell/ }),
    );
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Final Year Farewell' },
    });
    fireEvent.change(screen.getByLabelText('Class / group'), {
      target: { value: 'Class A' },
    });
    fireEvent.change(screen.getByLabelText('Year'), {
      target: { value: '2026' },
    });
    fireEvent.change(screen.getByLabelText('Farewell message'), {
      target: { value: 'Thank you for this chapter.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save profile' }));
    await waitFor(() =>
      expect(updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          memory_book_mode: 'graduation',
          graduation_title: 'Final Year Farewell',
          graduation_class: 'Class A',
          graduation_year: 2026,
          graduation_message: 'Thank you for this chapter.',
        }),
      ),
    );

    fireEvent.click(screen.getByRole('radio', { name: /^Standard/ }));
    expect(screen.queryByLabelText('Title')).not.toBeInTheDocument();
  });
});
