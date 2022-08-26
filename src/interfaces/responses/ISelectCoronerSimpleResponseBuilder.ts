import { SelectQueryRequest } from '../../requests';
import { SelectQueryResponse } from '../../responses/select';
import { SimpleSelectRow, SimpleSelectRows } from '../../responses/simple/select';

export interface ISelectCoronerSimpleResponseBuilder {
    first<R extends SelectQueryRequest>(response: SelectQueryResponse<R>): SimpleSelectRow<R> | undefined;
    rows<R extends SelectQueryRequest>(response: SelectQueryResponse<R>): SimpleSelectRows<R>;
}
