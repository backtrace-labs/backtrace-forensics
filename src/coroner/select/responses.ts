import { CoronerValueType, RawQueryResponse, QueryResponse } from '../common';
import { SelectedCoronerQuery } from './query';
import { SimpleSelectRow, SimpleSelectRows } from './simpleResponses';

export type SelectQueryObject = ['*', ([number] | [number, number])[]];

export interface QueryOrder {
    name: string;
    order: string;
}

type SelectQueryRowValues = ['*', ...[CoronerValueType, number][]][];

export interface RawSelectQueryResponse extends RawQueryResponse {
    readonly objects: SelectQueryObject[];
    readonly values: SelectQueryRowValues;
    readonly order?: QueryOrder[];
}

export interface SelectQueryResponse extends QueryResponse<RawSelectQueryResponse, SelectedCoronerQuery> {
    readonly total: number;
    all(): SimpleSelectRows;
    first(): SimpleSelectRow | undefined;
}
