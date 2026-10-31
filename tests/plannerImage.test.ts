import { test, expect } from 'vitest';
import { renderPlannerImageView } from '../src/features/plannerImage/plannerImageModal';

test('Planner Image View contains 1248x1248 canvas elements and 3 views', () => {
  const html = renderPlannerImageView();
  expect(html).toContain('id="pie-pcv"');
  expect(html).toContain('id="pie-ecv"');
  expect(html).toContain('width="1248"');
  expect(html).toContain('height="1248"');
  expect(html).toContain('id="pie-v-gallery"');
  expect(html).toContain('id="pie-v-fill"');
  expect(html).toContain('id="pie-v-editor"');
  expect(html).toContain('id="pie-member-chips"');
  expect(html).toContain('id="pie-ready-chips"');
  expect(html).toContain('id="pie-theme-palette"');
});