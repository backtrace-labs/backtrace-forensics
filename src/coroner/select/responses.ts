import { CoronerValueType, FailedQueryResponse, RawQueryResponse, SuccessfulQueryResponse } from '../common';
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

export interface SuccessfulSelectQueryResponse
    extends SuccessfulQueryResponse<RawSelectQueryResponse, SelectedCoronerQuery> {
    all(): SimpleSelectRows;
    first(): SimpleSelectRow | undefined;
}

export type SelectQueryResponse = SuccessfulSelectQueryResponse | FailedQueryResponse;
