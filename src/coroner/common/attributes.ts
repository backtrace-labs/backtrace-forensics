import { InputValueType } from './requests';

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
