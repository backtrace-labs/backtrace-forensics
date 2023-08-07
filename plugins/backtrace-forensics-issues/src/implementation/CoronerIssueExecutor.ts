import { ICoronerApiCallerFactory, QuerySource, createRequestData } from '@backtrace/forensics';
import { UpdateIssuesRequest } from '../coroner/issues/requests';
import { CoronerIssuesResponse } from '../coroner/issues/responses';
import { IssueRequestResponse } from '../coroner/issues/results';
import { ICoronerIssueExecutor } from '../interfaces/ICoronerIssueExecutor';

export class CoronerIssueExecutor implements ICoronerIssueExecutor {
    readonly #queryMakerFactory: ICoronerApiCallerFactory;
    readonly #defaultSource: Partial<QuerySource>;

    constructor(queryMakerFactory: ICoronerApiCallerFactory, defaultSource?: Partial<QuerySource>) {
        this.#queryMakerFactory = queryMakerFactory;
        this.#defaultSource = defaultSource ?? {};
    }

    public async execute(
        request: UpdateIssuesRequest[],
        source?: Partial<QuerySource>,
    ): Promise<IssueRequestResponse[]> {
        const querySource = Object.assign({}, this.#defaultSource, source);

        const { url, headers } = createRequestData(querySource, '/api/issue');
        const queryMaker = await this.#queryMakerFactory.create();

        return await Promise.all(
            request.map<Promise<IssueRequestResponse>>(async (request) => ({
                request,
                response: await queryMaker.post<CoronerIssuesResponse>(url, JSON.stringify(request), headers),
            })),
        );
    }
}
