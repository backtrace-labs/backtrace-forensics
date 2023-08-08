import { cloneRequest } from '../../implementation/requests/cloneRequest';
import {
    AttributeType,
    AttributeValueType,
    BooleanType,
    DictionaryType,
    StringType,
    UIntType,
    UUIDType,
} from './attributes';
import { RawCoronerResponse } from './responses';

export type CoronerValueType = string | number | boolean | null;

export type InputValueType<T extends AttributeType = AttributeType> =
    | (T extends UIntType
          ? number | `${number}.` | Date
          : T extends UUIDType
          ? string
          : T extends DictionaryType
          ? string
          : T extends BooleanType
          ? boolean
          : never)
    | null;

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

type StringFilterOptions = { case_insensitive?: boolean };

type AtLeastFilterOperator<T extends AttributeType> = readonly [operator: 'at-least', value: AttributeValueType<T>];
type AtMostFilterOperator<T extends AttributeType> = readonly [operator: 'at-most', value: AttributeValueType<T>];
type EqualFilterOperator<T extends AttributeType> = readonly [
    operator: 'equal',
    value: AttributeValueType<T>,
    // Query docs suggest that more values are accepted for multiple comparisons,
    // but this does not work at this time
    // ...value: AttributeValueType<T>[],
];
type NotEqualFilterOperator<T extends AttributeType> = readonly [
    operator: 'not-equal',
    value: AttributeValueType<T>,
    // Query docs suggest that more values are accepted for multiple comparisons,
    // but this does not work at this time
    // ...value: AttributeValueType<T>[],
];
type GreaterThanFilterOperator<T extends AttributeType> = readonly [
    operator: 'greater-than',
    value: AttributeValueType<T>,
];
type LessThanFilterOperator<T extends AttributeType> = readonly [operator: 'less-than', value: AttributeValueType<T>];
type ContainsFilterOperator<T extends AttributeType> = readonly [
    operator: 'contains',
    value: AttributeValueType<T>,
    options?: StringFilterOptions,
];
type NotContainsFilterOperator<T extends AttributeType> = readonly [
    operator: 'not-contains',
    value: AttributeValueType<T>,
    options?: StringFilterOptions,
];
type RegularExpressionFilterOperator<T extends AttributeType> = readonly [
    operator: 'regular-expression',
    value: AttributeValueType<T>,
    options?: StringFilterOptions,
];
type InverseRegularExpressionFilterOperator<T extends AttributeType> = readonly [
    operator: 'inverse-regular-expression',
    value: AttributeValueType<T>,
    options?: StringFilterOptions,
];

export type UIntFilterOperator =
    | AtLeastFilterOperator<UIntType>
    | AtMostFilterOperator<UIntType>
    | EqualFilterOperator<UIntType>
    | NotEqualFilterOperator<UIntType>
    | GreaterThanFilterOperator<UIntType>
    | LessThanFilterOperator<UIntType>;

export type BooleanFilterOperator = EqualFilterOperator<BooleanType> | NotEqualFilterOperator<BooleanType>;

export type UUIDFilterOperator =
    | AtLeastFilterOperator<UUIDType>
    | AtMostFilterOperator<UUIDType>
    | EqualFilterOperator<UUIDType>
    | NotEqualFilterOperator<UUIDType>
    | GreaterThanFilterOperator<UUIDType>
    | LessThanFilterOperator<UUIDType>;

export type DictionaryFilterOperator =
    | AtLeastFilterOperator<DictionaryType>
    | AtMostFilterOperator<DictionaryType>
    | EqualFilterOperator<DictionaryType>
    | NotEqualFilterOperator<DictionaryType>
    | GreaterThanFilterOperator<DictionaryType>
    | LessThanFilterOperator<DictionaryType>
    | ContainsFilterOperator<DictionaryType>
    | NotContainsFilterOperator<DictionaryType>
    | RegularExpressionFilterOperator<DictionaryType>
    | InverseRegularExpressionFilterOperator<DictionaryType>;

export type StringFilterOperator =
    | AtLeastFilterOperator<StringType>
    | AtMostFilterOperator<StringType>
    | EqualFilterOperator<StringType>
    | NotEqualFilterOperator<StringType>
    | GreaterThanFilterOperator<StringType>
    | LessThanFilterOperator<StringType>
    | ContainsFilterOperator<StringType>
    | NotContainsFilterOperator<StringType>
    | RegularExpressionFilterOperator<StringType>
    | InverseRegularExpressionFilterOperator<StringType>;

export type QueryAttributeFilter<T extends AttributeType = AttributeType> = FilterOperator<T>;

export type QueryFilter<A extends string = string> = {
    [K in A]: readonly FilterOperator[];
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

    /**
     * Table to use for response.
     * @example
     * request.table = 'metrics';
     */
    table?: string;
}

export const defaultRequest: QueryRequest = {
    offset: 0,
};

export function nextPage<R extends QueryRequest>(request: R, response: RawCoronerResponse<any>): R {
    if (response.error) {
        throw new Error('Response has errors.');
    }

    const newRequest = cloneRequest(request);
    if (newRequest.limit == null) {
        throw new Error('Limit is not defined.');
    }

    if (newRequest.offset == null) {
        newRequest.offset = newRequest.limit;
    } else {
        newRequest.offset += newRequest.limit;
    }

    if (!newRequest.filter) {
        newRequest.filter = [{}];
    }

    for (const filter of newRequest.filter) {
        if ('_tx' in filter) {
            const atMost = filter['_tx'].find((t) => t[0] === 'at-most');
            if (!atMost) {
                filter['_tx'] = [...filter['_tx'], ['at-most', response._.tx]];
            }
        } else {
            filter['_tx'] = [['at-most', response._.tx]];
        }
    }

    return newRequest as R;
}
