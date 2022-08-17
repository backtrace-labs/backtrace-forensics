import { QuerySource } from '../models/QuerySource';
import { QueryRequest } from '../requests/common';
import { CoronerResponse, QueryResponse } from '../responses/common';

export interface ICoronerQueryMaker {
    query<R extends QueryResponse>(source: QuerySource, request: QueryRequest): Promise<CoronerResponse<R>>;
}
