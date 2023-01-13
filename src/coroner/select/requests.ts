import { OrderDirection, QueryRequest } from '../common';

export type SelectOrder = {
    name: string;
    ordering: OrderDirection;
};

export interface SelectQueryRequest extends QueryRequest {
    /**
     * Attributes to select.
     * @example
     * request.select = ['timestamp', 'fingerprint'];
     */
    select?: readonly string[];

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
