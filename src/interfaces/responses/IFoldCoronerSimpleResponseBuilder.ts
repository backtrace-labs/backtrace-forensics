import { FoldQueryRequest } from '../../requests/fold';
import { FoldQueryResponse } from '../../responses/fold';
import { SimpleFoldRow, SimpleFoldRows } from '../../responses/simple/fold';

export interface IFoldCoronerSimpleResponseBuilder {
    first<R extends FoldQueryRequest>(response: FoldQueryResponse<R>, request?: R): SimpleFoldRow<R> | undefined;
    rows<R extends FoldQueryRequest>(response: FoldQueryResponse<R>, request?: R): SimpleFoldRows<R>;
}
