import { AttributeList } from '../common/attributes';
import { CommonCoronerQuery, CoronerQuery } from '../queries';

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

export interface SuccessfulQueryResponse<R extends RawQueryResponse, Q extends CommonCoronerQuery<AttributeList>> {
    success: true;
    json(): {
        response: R;
        error: undefined;
        _: {
            tx: number;
        };
    };
    nextPage(): Q;
}

export interface FailedQueryResponse {
    success: false;
    json(): {
        response: unknown;
        error: {
            message: string;
            code: number;
        };
    };
}

export type RawCoronerResponse<R extends RawQueryResponse = RawQueryResponse> = ReturnType<QueryResponse<R>['json']>;

export type QueryResponse<
    R extends RawQueryResponse = RawQueryResponse,
    Q extends CoronerQuery<AttributeList> = CoronerQuery<AttributeList>
> = SuccessfulQueryResponse<R, Q> | FailedQueryResponse;
