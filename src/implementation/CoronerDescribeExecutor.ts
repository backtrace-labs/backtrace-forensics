import { DescribeResponse } from '../coroner/common';
import { ICoronerApiCallerFactory } from '../interfaces/factories/ICoronerQueryMakerFactory';
import { ICoronerDescribeExecutor } from '../interfaces/ICoronerDescribeExecutor';
import { DescribeSource } from '../models/DescribeSource';
import { QuerySource } from '../models/QuerySource';

export class CoronerDescribeExecutor implements ICoronerDescribeExecutor {
    readonly #queryMakerFactory: ICoronerApiCallerFactory;
    readonly #defaultSource: Partial<QuerySource>;

    constructor(queryMakerFactory: ICoronerApiCallerFactory, defaultSource?: Partial<DescribeSource>) {
        this.#queryMakerFactory = queryMakerFactory;
        this.#defaultSource = defaultSource ?? {};
    }

    public async execute(source?: Partial<DescribeSource>): Promise<DescribeResponse> {
        let { address, token, project, location, table } = Object.assign({}, this.#defaultSource, source);
        if (!project) {
            throw new Error('Coroner project is not available.');
        }

        const qs = new URLSearchParams();
        qs.set('action', 'describe');
        qs.set('project', project);
        if (table) {
            qs.set('table', table);
        }

        const queryMaker = await this.#queryMakerFactory.create();
        return await queryMaker.post<DescribeResponse>(
            `/api/query?${qs.toString()}`,
            { address, token, project, location },
            '{"action": "describe"}',
        );
    }
}
