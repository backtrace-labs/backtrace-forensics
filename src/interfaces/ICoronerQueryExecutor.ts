import { QuerySource } from '../models/QuerySource';
import { QueryRequest } from '../requests/common';
import { RawCoronerResponse, RawQueryResponse } from '../responses/common';

export interface ICoronerQueryExecutor {
    execute<R extends RawQueryResponse>(
        request: QueryRequest,
        source?: Partial<QuerySource>
    ): Promise<RawCoronerResponse<R>>;
}
