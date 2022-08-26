import { QueryRequest } from './common';

export interface SelectQueryRequest<S extends readonly string[] = readonly string[]> extends QueryRequest {
    /**
     * Attributes to select.
     * @example
     * request.select = ['timestamp', 'fingerprint'];
     */
    select?: S;
}

export type InferSelectQueryRequest<T> = T extends SelectQueryRequest<infer S> ? SelectQueryRequest<S> : never;

export function createSelectRequest<T extends SelectQueryRequest>(request: T): InferSelectQueryRequest<T> {
    return request as unknown as InferSelectQueryRequest<T>;
}
