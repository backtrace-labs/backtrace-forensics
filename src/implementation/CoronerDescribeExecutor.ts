import { DescribeResponse } from '../coroner/common';
import { ICoronerApiCallerFactory } from '../interfaces/factories/ICoronerQueryMakerFactory';
import { ICoronerDescribeExecutor } from '../interfaces/ICoronerDescribeExecutor';
import { QuerySource } from '../models/QuerySource';

export class CoronerDescribeExecutor implements ICoronerDescribeExecutor {
    readonly #queryMakerFactory: ICoronerApiCallerFactory;
    readonly #defaultSource: Partial<QuerySource>;

    constructor(queryMakerFactory: ICoronerApiCallerFactory, defaultSource?: Partial<QuerySource>) {
        this.#queryMakerFactory = queryMakerFactory;
        this.#defaultSource = defaultSource ?? {};
    }

    public async execute(source?: Partial<QuerySource>): Promise<DescribeResponse> {
        let { address, token, project, location } = Object.assign({}, this.#defaultSource, source);
        if (!project) {
            throw new Error('Coroner project is not available.');
        }

        const queryMaker = await this.#queryMakerFactory.create();
        const url = new URL(`/api/query?action=describe&project=${project}`, address);
        return await queryMaker.post<DescribeResponse>(
            url,
            { address, token, project, location },
            '{"action": "describe"}'
        );
    }
}
