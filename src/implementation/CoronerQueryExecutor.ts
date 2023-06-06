import { QueryRequest, RawCoronerResponse, RawQueryResponse } from '../coroner/common';
import { ICoronerQueryExecutor } from '../interfaces/ICoronerQueryExecutor';
import { ICoronerApiCallerFactory } from '../interfaces/factories/ICoronerQueryMakerFactory';
import { QuerySource } from '../models/QuerySource';
import { createRequestData } from './helpers/createRequestData';

export class CoronerQueryExecutor implements ICoronerQueryExecutor {
    readonly #queryMakerFactory: ICoronerApiCallerFactory;
    readonly #defaultSource: Partial<QuerySource>;

    constructor(queryMakerFactory: ICoronerApiCallerFactory, defaultSource?: Partial<QuerySource>) {
        this.#queryMakerFactory = queryMakerFactory;
        this.#defaultSource = defaultSource ?? {};
    }

    public async execute<R extends RawQueryResponse>(
        request: QueryRequest,
        source?: Partial<QuerySource>,
    ): Promise<RawCoronerResponse<R>> {
        const querySource = Object.assign({}, this.#defaultSource, source);
        if (!querySource.project) {
            throw new Error('Coroner project is not available.');
        }

        const { url, headers } = createRequestData(querySource, '/api/query');
        const queryMaker = await this.#queryMakerFactory.create();
        return await queryMaker.post<RawCoronerResponse<R>>(url, JSON.stringify(request), headers);
    }
}
