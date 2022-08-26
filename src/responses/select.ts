import { CoronerValueType, SelectQueryRequest } from '../requests';
import { QueryResponse } from './common';
import { SimpleSelectRow, SimpleSelectRows } from './simple/select';

export type SelectQueryObject = ['*', ([number] | [number, number])[]];

export interface QueryOrder {
    name: string;
    order: string;
}

type SelectQueryRowValues<S extends readonly string[]> = {
    [I in keyof S]: ['*', ...[CoronerValueType, number][]];
} & Array<{}>;

export interface SelectQueryResponse<R extends SelectQueryRequest> extends QueryResponse {
    readonly objects: SelectQueryObject[];
    readonly values: SelectQueryRowValues<NonNullable<R['select']>>;
    readonly order?: QueryOrder[];

    rows(): SimpleSelectRows<R>;
    first(): SimpleSelectRow<R> | undefined;
}
