export type CoronerValueType = string | number | boolean | null;

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

export type NumberFilterOperator = 'at-least' | 'at-most' | 'equal' | 'not-equal' | 'greater-than' | 'less-than';

export type BooleanFilterOperator = 'equal' | 'not-equal';

export type FilterOperator<T extends CoronerValueType = CoronerValueType> = T extends string
    ? StringFilterOperator
    : T extends number
    ? NumberFilterOperator
    : T extends boolean
    ? BooleanFilterOperator
    : never;

export type QueryAttributeFilter = readonly [FilterOperator, CoronerValueType];

export type QueryFilter = {
    [attribute: string]: readonly QueryAttributeFilter[];
};

export type QueryOrder = {
    name: string;
    ordering: 'descending' | 'ascending';
};

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
     * Attributes to order on.
     * @example
     * request.order = [{
     *     name: 'timestamp',
     *     ordering: 'descending'
     * }];
     */
    order?: readonly QueryOrder[];

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
