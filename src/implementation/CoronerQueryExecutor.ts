import { ICoronerQueryExecutor } from '../interfaces/ICoronerQueryExecutor';
import { ICoronerQueryMaker } from '../interfaces/ICoronerQueryMaker';
import { QuerySource } from '../models/QuerySource';
import { QueryRequest } from '../requests/common';
import { CoronerResponse, QueryResponse } from '../responses/common';

export class CoronerQueryExecutor implements ICoronerQueryExecutor {
    readonly #queryMaker: ICoronerQueryMaker;
    readonly #defaultSource: Partial<QuerySource>;

    constructor(queryMaker: ICoronerQueryMaker, defaultSource?: Partial<QuerySource>) {
        this.#queryMaker = queryMaker;
        this.#defaultSource = defaultSource ?? {};
    }

    public execute<R extends QueryResponse>(
        request: QueryRequest,
        source?: Partial<QuerySource>
    ): Promise<CoronerResponse<R>> {
        let { address, token, project } = Object.assign({}, this.#defaultSource, source);
        if (!address) {
            throw new Error('Coroner address is not available.');
        }

        if (!token) {
            throw new Error('Coroner token is not available.');
        }

        if (!project) {
            throw new Error('Coroner project is not available.');
        }

        return this.#queryMaker.query<R>({ address, token, project }, request);
    }
}
