import { createContext, useContext } from 'react';

export const DashboardContext = createContext(null);

export function useDashboard() {
  const value = useContext(DashboardContext);
  if (!value)
    throw new Error('useDashboard must be used inside DashboardLayout');
  return value;
}
