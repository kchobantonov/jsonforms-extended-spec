/** Portable JSON leaves. Functions belong only to the explicitly trusted profile. */
export type DynamicJson =
  | null
  | boolean
  | number
  | string
  | readonly DynamicJson[]
  | { readonly [key: string]: DynamicJson };

export type DynamicDescriptor<T = DynamicJson> =
  | { readonly bind: string }
  | { readonly expression: string }
  | (string extends T ? { readonly template: string } : never)
  | { readonly literal: T };

/** Extension values remain portable; unknown keys do not admit executable code. */
export type DynamicExtension =
  | DynamicJson
  | undefined
  | { readonly [key: string]: DynamicExtension }
  | readonly DynamicExtension[];

/** Array replacements contain complete entries, not partial object patches. */
export type DynamicArrayEntry<T> =
  | DynamicDescriptor<T>
  | (T extends readonly (infer Item)[]
      ? readonly DynamicArrayEntry<Item>[]
      : T extends object
      ? { readonly [K in keyof T]: DynamicArrayEntry<T[K]> }
      : T);

export type DynamicValue<T> =
  | T
  | DynamicDescriptor<T>
  | (T extends readonly (infer Item)[]
      ? readonly DynamicArrayEntry<Item>[]
      : T extends object
      ? { readonly [K in keyof T]?: DynamicValue<T[K]> } & { readonly [extension: string]: DynamicExtension }
      : never);

/** Known fields retain their types; adapters may forward unknown extension fields. */
export type DynamicOverlay<T> = {
  readonly [K in keyof T as K extends '$dynamic' ? never : K]?: DynamicValue<T[K]>;
} & { readonly $dynamic?: never; readonly [extension: string]: DynamicExtension };

export type DynamicRule<T> = {
  readonly when?: boolean | { readonly expression: string };
  readonly overlay: DynamicOverlay<T>;
};

export type DynamicSpec<T> = DynamicOverlay<T> | readonly DynamicRule<T>[];

/** Type and scope may select a different renderer, so overlays may change them. */
export type DynamicTarget<T> = Omit<T, 'type' | 'scope' | '$dynamic'> & {
  type: string;
  scope?: string;
};

export type TrustedDynamicFunction<T> = (environment: Readonly<Record<string, unknown>>) => T;
export type TrustedDynamicArrayEntry<T> =
  | DynamicDescriptor<T>
  | TrustedDynamicFunction<T>
  | (T extends readonly (infer Item)[]
      ? readonly TrustedDynamicArrayEntry<Item>[]
      : T extends object
      ? { readonly [K in keyof T]: TrustedDynamicArrayEntry<T[K]> }
      : T);
export type TrustedDynamicValue<T> =
  | DynamicValue<T>
  | TrustedDynamicFunction<T>
  | (T extends readonly (infer Item)[]
      ? readonly TrustedDynamicArrayEntry<Item>[]
      : T extends object
      ? { readonly [K in keyof T]?: TrustedDynamicValue<T[K]> } & { readonly [extension: string]: unknown }
      : never);

export type TrustedDynamicOverlay<T> = {
  readonly [K in keyof T as K extends '$dynamic' ? never : K]?: TrustedDynamicValue<T[K]>;
} & { readonly $dynamic?: never; readonly [extension: string]: unknown };

export type TrustedDynamicRule<T> = {
  readonly when?: boolean | { readonly expression: string } | TrustedDynamicFunction<boolean>;
  readonly overlay: TrustedDynamicOverlay<T>;
};

export type TrustedDynamicSpec<T> =
  | TrustedDynamicOverlay<T>
  | readonly TrustedDynamicRule<T>[];

/** Opt into trusted authoring explicitly without weakening portable form helpers. */
export function withTrustedDynamic<T extends { type: string }>(
  element: T,
  dynamic: TrustedDynamicSpec<DynamicTarget<T>>,
): Omit<T, '$dynamic'> & { $dynamic: TrustedDynamicSpec<DynamicTarget<T>> } {
  return { ...element, $dynamic: dynamic };
}
