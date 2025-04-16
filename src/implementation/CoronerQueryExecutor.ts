import { Result } from '@backtrace/utils';
import { QueryRequest, RawCoronerResponse, RawQueryResponse } from '../coroner/common';
import { ICoronerQueryExecutor } from '../interfaces/ICoronerQueryExecutor';
import { ICoronerApiCallerFactory } from '../interfaces/factories/ICoronerQueryMakerFactory';
import { QuerySource } from '../models/QuerySource';
import { createRequestData } from './helpers/createRequestData';
import { MissingProjectError } from '../common/errors';

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
    ): Promise<Result<RawCoronerResponse<R>, Error>> {
        const querySource = Object.assign({}, this.#defaultSource, source);
        if (!querySource.project) {
            return Result.err(new MissingProjectError());
        }

        const requestDataResult = createRequestData(querySource, '/api/query');
        if (Result.isErr(requestDataResult)) {
            return requestDataResult;
        }

        const { url, headers } = requestDataResult.data;

        const queryMaker = await this.#queryMakerFactory.create();
        return await queryMaker.post<RawCoronerResponse<R>>(url, JSON.stringify(request), headers);
    }
}
