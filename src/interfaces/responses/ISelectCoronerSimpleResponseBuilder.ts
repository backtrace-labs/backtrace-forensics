import { SelectQueryRequest } from '../../requests';
import { RawSelectQueryResponse } from '../../responses/select';
import { SimpleSelectRow, SimpleSelectRows } from '../../responses/simple/select';

export interface ISelectCoronerSimpleResponseBuilder {
    first<R extends SelectQueryRequest>(response: RawSelectQueryResponse<R>): SimpleSelectRow<R> | undefined;
    rows<R extends SelectQueryRequest>(response: RawSelectQueryResponse<R>): SimpleSelectRows<R>;
}
