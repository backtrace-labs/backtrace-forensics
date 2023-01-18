import { QueryRequest, RawCoronerResponse, RawQueryResponse } from '../coroner/common';
import { QuerySource } from '../models/QuerySource';

export interface ICoronerQueryMaker {
    query<R extends RawQueryResponse>(
        source: Partial<QuerySource>,
        request: QueryRequest
    ): Promise<RawCoronerResponse<R>>;
}
