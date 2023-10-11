import { OrderDirection, QueryRequest } from '../common';

export interface SelectOrder {
    readonly name: string;
    readonly ordering: OrderDirection;
}

export interface SelectWildcard {
    readonly physical?: boolean;
    readonly virtual?: boolean;
    readonly derived?: boolean;
}

export interface SelectQueryRequest extends QueryRequest {
    /**
     * Attributes to select.
     * @example
     * request.select = ['timestamp', 'fingerprint'];
     */
    select?: readonly string[];

    /**
     * Attribute types to select.
     * @example
     * request.select_wildcard = { physical: true, derived: true, virtual: false };
     */
    select_wildcard?: SelectWildcard;

    /**
     * Attributes to order on.
     * @example
     * request.order = [{
     *     name: 'timestamp',
     *     ordering: 'descending'
     * }, {
     *     name: 'fingerprint',
     *     ordering: 'ascending'
     * }]
     */
    order?: readonly SelectOrder[];
}

export function isSelectRequest(request: QueryRequest): boolean {
    return request && 'select' in request;
}
