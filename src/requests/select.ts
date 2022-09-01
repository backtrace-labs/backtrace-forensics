import { OrderDirection, QueryRequest } from './common';

export type SelectOrder<A extends string = string> = {
    name: A;
    ordering: OrderDirection;
};

export interface SelectQueryRequest<S extends readonly string[] = readonly string[]> extends QueryRequest {
    /**
     * Attributes to select.
     * @example
     * request.select = ['timestamp', 'fingerprint'];
     */
    select?: S;

    order?: readonly SelectOrder[];
}

export type InferSelectQueryRequest<T> = T extends SelectQueryRequest<infer S> ? SelectQueryRequest<S> : never;

export function createSelectRequest<T extends SelectQueryRequest>(request: T): InferSelectQueryRequest<T> {
    return request as unknown as InferSelectQueryRequest<T>;
}
