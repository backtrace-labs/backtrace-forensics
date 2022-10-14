import { QuerySource } from '../models/QuerySource';
import { QueryRequest } from '../requests/common';
import { RawCoronerResponse, RawQueryResponse } from '../responses/common';

export interface ICoronerQueryMaker {
    query<R extends RawQueryResponse>(
        source: Partial<QuerySource>,
        request: QueryRequest
    ): Promise<RawCoronerResponse<R>>;
}
