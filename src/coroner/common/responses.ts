import { FoldOperator } from '../fold';
import { AttributeFormat, AttributeType } from './attributes';
import { CommonCoronerQuery } from './query';
import { FilterOperator } from './requests';

export type QueryColumn = [string, string];

export interface QueryColumnDescription {
    readonly name: string;
    readonly format: string;
    readonly type: string;
    readonly op?: string;
}

export interface QueryPagination {
    readonly limit: number;
    readonly offset: number;
}

export interface RawQueryResponse {
    readonly version: string;
    readonly encoding: string;
    readonly seq: number;
    readonly pagination: QueryPagination;
    readonly columns: QueryColumn[];
    readonly columns_desc: QueryColumnDescription[];
}

export interface DescribeAttribute {
    name: string;
    description: string;
    format: AttributeFormat;
    custom: boolean;
    state: string;
    type: AttributeType;
    filter: FilterOperator[];
    aggregate: FoldOperator[0][];
    group: boolean;
    statistics: {
        used: boolean;
    };
}

export interface CoronerError {
    message: string;
    code: number;
}

export interface SuccessfulQueryResponse<
    R extends RawQueryResponse = RawQueryResponse,
    Q extends CommonCoronerQuery = CommonCoronerQuery
> {
    success: true;
    json(): SuccessfulRawCoronerResponse<R>;
    nextPage(): Q;
}

export interface FailedQueryResponse {
    success: false;
    json(): FailedRawCoronerResponse;
}

export type RawCoronerResponse<R extends RawQueryResponse = RawQueryResponse> =
    | SuccessfulRawCoronerResponse<R>
    | FailedRawCoronerResponse;

export interface SuccessfulRawCoronerResponse<R extends RawQueryResponse = RawQueryResponse> {
    readonly response: R;
    readonly error: undefined;
    readonly _: {
        readonly tx: number;
        readonly universe: string;
        readonly project: string;
        readonly user: string;
        readonly latency: string;
        readonly runtime: {
            readonly filter: {
                readonly rows: number;
            };
        };
    };
}

export interface FailedRawCoronerResponse {
    response: unknown;
    error: CoronerError;
}

export type QueryResponse<
    R extends RawQueryResponse = RawQueryResponse,
    Q extends CommonCoronerQuery = CommonCoronerQuery
> = SuccessfulQueryResponse<R, Q> | FailedQueryResponse;

export type DescribeResponse = SuccessfulDescribeResponse | FailedDescribeResponse;

export interface SuccessfulDescribeResponse {
    describe: DescribeAttribute[];
    error: undefined;
}
export interface FailedDescribeResponse {
    error: CoronerError;
}
