import { AttributeList } from '../common/attributes';
import { SelectedCoronerQuery, SelectOfRequest } from '../queries/select';
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
    readonly values: SelectQueryRowValues<SelectOfRequest<R>>;
    readonly order?: QueryOrder[];
}

export interface SuccessfulSelectQueryResponse<
    R extends SelectQueryRequest,
    Q extends SelectedCoronerQuery<AttributeList, R>
> extends SuccessfulQueryResponse<RawSelectQueryResponse<R>, Q> {
    all(): SimpleSelectRows<R>;
    first(): SimpleSelectRow<R> | undefined;
}

export type SelectQueryResponse<R extends SelectQueryRequest, Q extends SelectedCoronerQuery<AttributeList, R>> =
    | SuccessfulSelectQueryResponse<R, Q>
    | FailedQueryResponse;
