import { QueryRequest, RawCoronerResponse, RawQueryResponse } from '../coroner/common';
import { QuerySource } from '../models/QuerySource';

export interface ICoronerQueryExecutor {
    execute<R extends RawQueryResponse>(
        request: QueryRequest,
        source?: Partial<QuerySource>
    ): Promise<RawCoronerResponse<R>>;
}
