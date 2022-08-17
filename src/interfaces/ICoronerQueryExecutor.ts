import { QuerySource } from '../models/QuerySource';
import { QueryRequest } from '../requests/common';
import { CoronerResponse, QueryResponse } from '../responses/common';

export interface ICoronerQueryExecutor {
    execute<R extends QueryResponse>(request: QueryRequest, source?: Partial<QuerySource>): Promise<CoronerResponse<R>>;
}
