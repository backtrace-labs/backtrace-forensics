import {
    AttributeType,
    AttributeValueType,
    BooleanType,
    DictionaryType,
    StringType,
    UIntType,
    UUIDType,
} from '../common/attributes';

export type CoronerValueType = string | number | boolean | null;
export type InputValueType = CoronerValueType | Date;

export type FilterOperator<T extends AttributeType = AttributeType> = T extends StringType
    ? StringFilterOperator
    : T extends UIntType
    ? UIntFilterOperator
    : T extends BooleanType
    ? BooleanFilterOperator
    : T extends DictionaryType
    ? DictionaryFilterOperator
    : T extends UUIDType
    ? UUIDFilterOperator
    : never;

export type UIntFilterOperator = 'at-least' | 'at-most' | 'equal' | 'not-equal' | 'greater-than' | 'less-than';
export type BooleanFilterOperator = 'equal' | 'not-equal';
export type UUIDFilterOperator = UIntFilterOperator;
export type DictionaryFilterOperator = StringFilterOperator;
export type StringFilterOperator =
    | 'at-least'
    | 'at-most'
    | 'contains'
    | 'not-contains'
    | 'equal'
    | 'not-equal'
    | 'greater-than'
    | 'less-than'
    | 'regular-expression'
    | 'inverse-regular-expression';

export type QueryAttributeFilter<T extends AttributeType = AttributeType> = readonly [
    FilterOperator<T>,
    AttributeValueType<T>
];

export type QueryFilter = {
    [attribute: string]: readonly QueryAttributeFilter[];
};

export type OrderDirection = 'descending' | 'ascending';

export interface QueryRequest {
    /**
     * Attributes to filter on.
     * @example
     * request.filter = {
     *     timestamp: [['at-least', 123], ['at-most', 456]],
     *     fingerprint: [['equal', 'xyz']]
     * };
     */
    filter?: readonly QueryFilter[];

    /**
     * Limits the number of rows in response.
     * @example
     * request.limit = 20;
     */
    limit?: number;

    /**
     * How much rows to skip for response.
     * @example
     * request.offset = 20;
     */
    offset?: number;

    /**
     * Template for the response. May determine which attributes are returned.
     * @example
     * request.template = 'workflow';
     */
    template?: string;
}
