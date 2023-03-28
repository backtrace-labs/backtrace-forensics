import { QueryRequest, RawCoronerResponse, RawQueryResponse } from '../coroner/common';
import { ICoronerApiCallerFactory } from '../interfaces/factories/ICoronerQueryMakerFactory';
import { ICoronerQueryExecutor } from '../interfaces/ICoronerQueryExecutor';
import { QuerySource } from '../models/QuerySource';

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
        const { address, token, project, location } = Object.assign({}, this.#defaultSource, source);
        if (!project) {
            throw new Error('Coroner project is not available.');
        }

        const queryMaker = await this.#queryMakerFactory.create();
        return await queryMaker.post<RawCoronerResponse<R>>(
            `/api/query?project=${project}`,
            { address, token, project, location },
            JSON.stringify(request),
        );
    }
}
