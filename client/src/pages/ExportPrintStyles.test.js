import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const styles = readFileSync(resolve('src/index.css'), 'utf8');

describe('memory book print styles', () => {
  it('targets A4 and hides export controls while preserving document layout', () => {
    const printStyles = styles.slice(styles.indexOf('@media print'));

    expect(printStyles).toContain('size: A4');
    expect(printStyles).toMatch(/\.export-toolbar\s*{[^}]*display: none/s);
    expect(printStyles).toMatch(/\.export-cover\s*{[^}]*break-after: page/s);
    expect(printStyles).toMatch(
      /\.export-memory\s*{[^}]*break-inside: avoid-page/s,
    );
  });
});
