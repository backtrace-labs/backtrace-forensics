import { Result } from '@backtrace/utils';
import { RawDescribeResponse } from '../coroner/common';
import { ICoronerApiCallerFactory } from '../interfaces/factories/ICoronerQueryMakerFactory';
import { ICoronerDescribeExecutor } from '../interfaces/ICoronerDescribeExecutor';
import { DescribeSource } from '../models/DescribeSource';
import { QuerySource } from '../models/QuerySource';
import { createRequestData } from './helpers/createRequestData';

export class CoronerDescribeExecutor implements ICoronerDescribeExecutor {
    readonly #queryMakerFactory: ICoronerApiCallerFactory;
    readonly #defaultSource: Partial<QuerySource>;

    constructor(queryMakerFactory: ICoronerApiCallerFactory, defaultSource?: Partial<DescribeSource>) {
        this.#queryMakerFactory = queryMakerFactory;
        this.#defaultSource = defaultSource ?? {};
    }

    public async execute(source?: Partial<DescribeSource>): Promise<Result<RawDescribeResponse, Error>> {
        const querySource = Object.assign({}, this.#defaultSource, source);
        if (!querySource.project) {
            return Result.err(new Error('Coroner project is not available.'));
        }

        const requestDataResult = createRequestData(querySource, '/api/query?action=describe');
        if (Result.isErr(requestDataResult)) {
            return requestDataResult;
        }

        const { url, headers } = requestDataResult.data;

        if (querySource.table) {
            url.searchParams.set('table', querySource.table);
        }

        const queryMaker = await this.#queryMakerFactory.create();
        return await queryMaker.post<RawDescribeResponse>(url, '{"action": "describe"}', headers);
    }
}
