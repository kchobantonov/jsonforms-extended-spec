import { expect, it } from 'vitest';
import { forSchema } from '../src/authoring/forSchema';
import type { DynamicDescriptor, DynamicSpec, TrustedDynamicSpec } from '../src/authoring/dynamic';
import { withTrustedDynamic } from '../src/authoring/dynamic';

const form = forSchema({
  type: 'object',
  properties: { plan: { type: 'string' } },
} as const);

it('authors portable overlays on typed controls without losing static scope checking', () => {
  const control = form.control('plan', {
    $dynamic: [
      { overlay: { label: { bind: 'external.settings.label' } } },
      {
        when: { expression: "external.settings.presentation == 'radio'" },
        overlay: { options: { format: 'radio', readonly: { bind: 'external.readonly' } } },
      },
    ],
  });
  expect(control.$dynamic).toHaveLength(2);
  // @ts-expect-error portable conditions require boolean or an expression descriptor
  const invalidCondition: DynamicSpec<{ label: string }> = [{ when: 'yes', overlay: {} }];
  // @ts-expect-error known option values retain their declared types
  form.control('plan', { $dynamic: { options: { readonly: 'yes' } } });
  expect(invalidCondition).toBeDefined();
});

it('checks metadata, extension values, complete array entries and template targets', () => {
  form.control('plan', { $dynamic: { options: { customExtension: { nested: { bind: 'external.value' } } } } });
  // @ts-expect-error the current element cannot overwrite its own resolver metadata
  const metadata: DynamicSpec<{ label: string }> = { $dynamic: {} };
  // @ts-expect-error unknown portable extension keys cannot contain functions
  const executable: DynamicSpec<{ label: string }> = { customExtension: () => 'unsafe' };
  // @ts-expect-error templates return strings, not numeric targets
  const numeric: DynamicSpec<{ count: number }> = { count: { template: '{data.count}' } };
  // @ts-expect-error replacement array entries need the required type discriminator
  const incomplete: DynamicSpec<{ elements: { type: 'Control'; scope: string }[] }> = { elements: [{ scope: '#' }] };
  expect([metadata, executable, numeric, incomplete]).toHaveLength(4);
});

it('attaches trusted overlays to an otherwise checked authored element', () => {
  const control = withTrustedDynamic(form.control('plan'), {
    label: (environment: Readonly<Record<string, unknown>>) => String(environment.locale),
  });
  expect(control.scope).toBe('#/properties/plan');
  expect(control.$dynamic).toHaveProperty('label');
});

it('keeps trusted function authoring separate from portable JSON', () => {
  const trusted: TrustedDynamicSpec<{ label: string }> = {
    label: (environment) => String(environment.locale),
  };
  // @ts-expect-error executable functions are not portable descriptor leaves
  const portable: DynamicSpec<{ label: string }> = trusted;
  expect(trusted).toBeDefined();
  expect(portable).toBeDefined();
});

it('checks complete literal descriptor values', () => {
  const valid: DynamicSpec<{ detail: { type: string; scope: string } }> = {
    detail: { literal: { type: 'Control', scope: '#/properties/name' } },
  };
  // @ts-expect-error atomic replacement requires a complete target
  const incomplete: DynamicDescriptor<{ type: string; scope: string }> = { literal: { type: 'Control' } };
  expect(valid.detail).toBeDefined();
  expect(incomplete).toBeDefined();
});

it('permits a real literal field when another target key makes the object ordinary data', () => {
  type Target = { custom: { literal: string; other: number } };
  const portable: DynamicSpec<Target> = { custom: { literal: 'data', other: 1 } };
  const trusted: TrustedDynamicSpec<Target> = { custom: { literal: 'data', other: () => 2 } };
  // @ts-expect-error the real literal field retains its declared type
  const wrong: DynamicSpec<Target> = { custom: { literal: 3, other: 1 } };
  // Broad patches cannot prove the key-count distinction; explicit descriptors can.
  // @ts-expect-error a complete object cannot be replaced with a string
  const ambiguous: DynamicDescriptor<Target['custom']> = { literal: 'data' };
  expect([portable, trusted, wrong, ambiguous]).toHaveLength(4);
});

it('allows literal-named data beside unknown extension keys', () => {
  type Target = { custom: { literal: string; known?: boolean }; options: { readonly?: boolean } };
  const first: DynamicSpec<Target> = { custom: { literal: 'data', extra: 1 } };
  const second: DynamicSpec<Target> = { options: { literal: 'data', theme: 'x' } };
  const trusted: TrustedDynamicSpec<Target> = { options: { literal: 'data', theme: 'x' } };
  expect([first, second, trusted]).toHaveLength(3);
});
