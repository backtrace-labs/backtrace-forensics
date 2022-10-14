import { ICoronerQueryExecutor } from '../interfaces/ICoronerQueryExecutor';
import { ICoronerQueryMaker } from '../interfaces/ICoronerQueryMaker';
import { QuerySource } from '../models/QuerySource';
import { QueryRequest } from '../requests/common';
import { RawCoronerResponse, RawQueryResponse } from '../responses/common';

export class CoronerQueryExecutor implements ICoronerQueryExecutor {
    readonly #queryMaker: ICoronerQueryMaker;
    readonly #defaultSource: Partial<QuerySource>;

    constructor(queryMaker: ICoronerQueryMaker, defaultSource?: Partial<QuerySource>) {
        this.#queryMaker = queryMaker;
        this.#defaultSource = defaultSource ?? {};
    }

    public async execute<R extends RawQueryResponse>(
        request: QueryRequest,
        source?: Partial<QuerySource>
    ): Promise<RawCoronerResponse<R>> {
        let { address, token, project, location } = Object.assign({}, this.#defaultSource, source);
        return await this.#queryMaker.query<R>({ address, token, project, location }, request);
    }
}
