import { CoronerValueType, SelectQueryRequest } from '../requests';
import { FailedQueryResponse, RawQueryResponse, SuccessfulQueryResponse } from './common';
import { SimpleSelectRow, SimpleSelectRows } from './simple/select';

export type SelectQueryObject = ['*', ([number] | [number, number])[]];

export interface QueryOrder {
    name: string;
    order: string;
}

type SelectQueryRowValues<S extends readonly string[]> = {
    [I in keyof S]: ['*', ...[CoronerValueType, number][]];
} & Array<{}>;

export interface RawSelectQueryResponse<R extends SelectQueryRequest> extends RawQueryResponse {
    readonly objects: SelectQueryObject[];
    readonly values: SelectQueryRowValues<NonNullable<R['select']>>;
    readonly order?: QueryOrder[];
}

export interface SuccessfulSelectQueryResponse<R extends SelectQueryRequest>
    extends SuccessfulQueryResponse<RawSelectQueryResponse<R>> {
    all(): SimpleSelectRows<R>;
    first(): SimpleSelectRow<R> | undefined;
}

export type SelectQueryResponse<R extends SelectQueryRequest> = SuccessfulSelectQueryResponse<R> | FailedQueryResponse;
