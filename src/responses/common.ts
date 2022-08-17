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

export interface QueryResponse {
    readonly version: string;
    readonly encoding: string;
    readonly seq: number;
    readonly pagination: QueryPagination;
    readonly columns: QueryColumn[];
    readonly columns_desc: QueryColumnDescription[];
}

export interface SuccessfulCoronerResponse<R extends QueryResponse> {
    response: R;
    error: undefined;
}

export interface FailedCoronerResponse {
    error: {
        message: string;
        code: number;
    };
}

export type CoronerResponse<R extends QueryResponse> = SuccessfulCoronerResponse<R> | FailedCoronerResponse;
