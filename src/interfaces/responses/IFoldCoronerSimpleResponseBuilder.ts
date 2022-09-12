import { FoldQueryRequest } from '../../requests/fold';
import { RawFoldQueryResponse } from '../../responses/fold';
import { SimpleFoldRow, SimpleFoldRows } from '../../responses/simple/fold';

export interface IFoldCoronerSimpleResponseBuilder {
    first<R extends FoldQueryRequest>(response: RawFoldQueryResponse<R>, request?: R): SimpleFoldRow<R> | undefined;
    rows<R extends FoldQueryRequest>(response: RawFoldQueryResponse<R>, request?: R): SimpleFoldRows<R>;
}
