import { InputValueType } from '../requests';

export type SizeAttributeFormat = 'bytes' | 'kilobytes' | 'gigabytes';
export type TimeAttributeFormat =
    | 'gps_timestamp'
    | 'js_timestamp'
    | 'milliseconds'
    | 'nanoseconds'
    | 'seconds'
    | 'unix_timestamp';
export type MiscAttributeFormat = 'callstack' | 'labels' | 'memory_address' | 'sha256' | 'uuid';
export type NetworkAttributeFormat = 'hostname' | 'ipv4' | 'ipv6';
export type VersionAttributeFormat = 'commit' | 'semver';
export type AttributeFormat =
    | 'none'
    | MiscAttributeFormat
    | SizeAttributeFormat
    | TimeAttributeFormat
    | NetworkAttributeFormat
    | VersionAttributeFormat;

export type UIntAttributeFormat = SizeAttributeFormat | TimeAttributeFormat | 'memory_address';
export type DictionaryAttributeFormat = 'callstack' | 'labels' | 'sha256' | 'commitHash' | 'semver' | 'hostname';
export type UUIDAttributeFormat = 'uuid';

export type BooleanType = 'bitmap';
export type UIntType = 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128';
export type StringType = 'string';
export type DictionaryType = 'dictionary';
export type UUIDType = 'uuid';

export type AttributeType<F extends AttributeFormat = AttributeFormat> = F extends UIntAttributeFormat
    ? UIntType
    : F extends UUIDAttributeFormat
    ? UUIDType
    : F extends DictionaryAttributeFormat
    ? DictionaryType
    : F extends 'none'
    ? UIntType | StringType | UUIDType | BooleanType
    : never;

export type AttributeValueType<T extends AttributeType = AttributeType> =
    | (T extends UIntType
          ? number | `${number}.`
          : T extends UUIDType
          ? string
          : T extends DictionaryType
          ? string
          : T extends BooleanType
          ? boolean
          : T extends StringType
          ? string
          : never)
    | null;

export type ValueAttributeType<V extends InputValueType> = V extends number | `${number}.` | Date
    ? UIntType
    : V extends string
    ? UUIDType | DictionaryType
    : V extends boolean
    ? BooleanType
    : never;

export type Attribute<
    A extends string = string,
    F extends AttributeFormat = AttributeFormat,
    T extends AttributeType<F> = AttributeType<F>
> = readonly [A, F, T];

export type AttributeList = Record<string, Attribute>;

export const CommonAttributes = createAttributeList([
    ['_tx', 'none', 'uint64'],
    ['_rxid', 'uuid', 'uuid'],
    ['application', 'none', 'string'],
    ['callstack', 'callstack', 'dictionary'],
    ['callstack.files', 'callstack', 'dictionary'],
    ['callstack.functions', 'callstack', 'dictionary'],
    ['callstack.modules', 'callstack', 'dictionary'],
    ['classifiers', 'labels', 'dictionary'],
    ['error.message', 'none', 'string'],
    ['fingerprint', 'sha256', 'dictionary'],
    ['guid', 'uuid', 'uuid'],
    ['hostname', 'hostname', 'dictionary'],
    ['object.size', 'bytes', 'uint64'],
    ['process.age', 'seconds', 'uint64'],
    ['timestamp', 'unix_timestamp', 'uint64'],
    ['timestamp.received', 'unix_timestamp', 'uint64'],
] as const);

export function createAttributeList<A extends readonly Attribute[]>(
    attributes: A
): { readonly [I in A[number] as I[0]]: I } {
    return attributes.reduce((list, attr) => {
        list[attr[0]] = attr;
        return list;
    }, {} as Record<string, A[number]>) as { readonly [I in A[number] as I[0]]: I };
}

export function extendAttributeList<AL1 extends AttributeList, AL2 extends AttributeList>(
    attributeList1: AL1,
    attributeList2: AL2
): ExtendAttributeList<AL1, AL2> {
    return {
        ...attributeList1,
        ...attributeList2,
    } as ExtendAttributeList<AL1, AL2>;
}

export type AttributeListFromArray<A extends readonly Attribute[]> = { readonly [I in A[number] as I[0]]: I };

export type ExtendAttributeList<AL1 extends AttributeList, AL2 extends AttributeList> = {
    [K in keyof AL1 | keyof AL2]: K extends keyof AL2 ? AL2[K] : K extends keyof AL1 ? AL1[K] : never;
};

export type CommonAttributes = typeof CommonAttributes;
