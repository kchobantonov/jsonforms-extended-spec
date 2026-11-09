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
  /** Optional companion form assets; the example host wires its changes to the preview. */
  configuration?: { schema: JsonSchema; data: unknown; uischema: UISchemaElement };
  /** Optional $dynamic preview UI schema for adapters supporting dynamic overlays. */
  'dynamic-uischema'?: UISchemaElement;
  hostRequirements: string[];
}
export declare const examples: SpecExample[];
