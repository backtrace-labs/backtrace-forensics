import { ICoronerApiCallerFactory, QuerySource, createRequestData } from '@backtrace/forensics';
import { UpdateIssuesRequest } from '../coroner/issues/requests';
import { CoronerIssuesResponse } from '../coroner/issues/responses';
import { IssueRequestResponse } from '../coroner/issues/results';
import { ICoronerIssueExecutor } from '../interfaces/ICoronerIssueExecutor';
import { Result } from '@backtrace/utils'; // Ensure Result is imported

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

        const requestDataResult = createRequestData(querySource, '/api/issue');
        if (Result.isErr(requestDataResult)) {
            throw new Error(requestDataResult.data.message);
        }
        const { url, headers } = requestDataResult.data;
        const queryMaker = await this.#queryMakerFactory.create();

        return await Promise.all(
            request.map<Promise<IssueRequestResponse>>(async (request) => {
                const postResult = await queryMaker.post<CoronerIssuesResponse>(url, JSON.stringify(request), headers);

                if (Result.isErr(postResult)) {
                    throw new Error(postResult.data.message);
                }

                return {
                    request,
                    response: postResult.data,
                };
            }),
        );
    }
}
