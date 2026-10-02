import type { JsonSchema, UISchemaElement, JsonFormsUISchemaRegistryEntry } from '@jsonforms/core';
export interface SpecExample {
  id: string;
  title: string;
  schema?: JsonSchema;
  uischema?: UISchemaElement;
  data?: unknown;
  config?: Record<string, unknown>;
  translations?: Record<string, Record<string, string>>;
  uischemas?: JsonFormsUISchemaRegistryEntry[];
  hostRequirements: string[];
}
export declare const examples: SpecExample[];
