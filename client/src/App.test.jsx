import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App.jsx';

describe('application routes', () => {
  it.each([
    ['/', 'Memories worth keeping'],
    ['/login', 'Log in'],
    ['/register', 'Register'],
    ['/dashboard', 'Dashboard'],
    ['/u/khin', '@khin'],
  ])('renders %s', (path, heading) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: heading }),
    ).toBeInTheDocument();
  });
});
