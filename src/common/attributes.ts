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
          : never)
    | null;

type test = AttributeValueType<AttributeType>;

export type Attribute<
    A extends string = string,
    F extends AttributeFormat = AttributeFormat,
    T extends AttributeType<F> = AttributeType<F>
> = readonly [A, F, T];

function getAttribute<
    A extends string = string,
    F extends AttributeFormat = AttributeFormat,
    T extends AttributeType<F> = AttributeType<F>
>(attribute: [A, F, T]): Attribute<A, F, T> {
    return attribute;
}

export type AttributeList = Record<string, Attribute>;

export const CommonAttributes = {
    _tx: getAttribute(['_tx', 'none', 'uint64']),
    _rxid: getAttribute(['_rxid', 'uuid', 'uuid']),
    application: getAttribute(['application', 'none', 'string']),
    callstack: getAttribute(['callstack', 'callstack', 'dictionary']),
    'callstack.files': getAttribute(['callstack.files', 'callstack', 'dictionary']),
    'callstack.functions': getAttribute(['callstack.functions', 'callstack', 'dictionary']),
    'callstack.modules': getAttribute(['callstack.modules', 'callstack', 'dictionary']),
    classifiers: getAttribute(['classifiers', 'labels', 'dictionary']),
    'error.message': getAttribute(['error.message', 'none', 'string']),
    fingerprint: getAttribute(['fingerprint', 'sha256', 'dictionary']),
    guid: getAttribute(['guid', 'uuid', 'uuid']),
    hostname: getAttribute(['hostname', 'hostname', 'dictionary']),
    'object.size': getAttribute(['object.size', 'bytes', 'uint64']),
    'process.age': getAttribute(['process.age', 'seconds', 'uint64']),
    timestamp: getAttribute(['timestamp', 'unix_timestamp', 'uint64']),
    'timestamp.received': getAttribute(['timestamp.received', 'unix_timestamp', 'uint64']),
} as const;

export type CommonAttributes = typeof CommonAttributes;
