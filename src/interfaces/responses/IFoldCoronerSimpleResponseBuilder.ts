import { FoldQueryRequest, RawFoldQueryResponse, SimpleFoldRow, SimpleFoldRows } from '../../coroner/fold';

export interface IFoldCoronerSimpleResponseBuilder {
    first(response: RawFoldQueryResponse, request?: FoldQueryRequest): SimpleFoldRow | undefined;
    rows(response: RawFoldQueryResponse, request?: FoldQueryRequest): SimpleFoldRows;
}
