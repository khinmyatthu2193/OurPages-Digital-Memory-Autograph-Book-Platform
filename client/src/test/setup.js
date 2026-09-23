import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

URL.createObjectURL = URL.createObjectURL || (() => 'blob:test-photo');
URL.revokeObjectURL = URL.revokeObjectURL || (() => {});

afterEach(() => cleanup());
