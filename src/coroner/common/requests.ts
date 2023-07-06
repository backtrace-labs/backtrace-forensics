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
    AttributeValueType<T>,
];

export type QueryFilter<A extends string = string> = {
    [K in A]: readonly QueryAttributeFilter[];
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
