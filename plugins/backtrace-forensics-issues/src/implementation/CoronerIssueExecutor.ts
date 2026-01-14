import { ICoronerApiCallerFactory, QuerySource, createRequestData } from '@backtrace/forensics';
import { UpdateIssuesRequest } from '../coroner/issues/requests';
import { CoronerIssuesResponse } from '../coroner/issues/responses';
import { IssueRequestResponse } from '../coroner/issues/results';
import { ICoronerIssueExecutor } from '../interfaces/ICoronerIssueExecutor';
import { Result } from '@backtrace/utils';

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
    ): Promise<Result<IssueRequestResponse[], Error>> {
        const querySource = Object.assign({}, this.#defaultSource, source);

        const requestDataResult = createRequestData(querySource, '/api/issue');
        if (Result.isErr(requestDataResult)) {
            return requestDataResult;
        }
        const { url, headers } = requestDataResult.data;
        const queryMaker = await this.#queryMakerFactory.create();

        const results = await Promise.all(
            request.map(async (request) => {
                const postResult = await queryMaker.post<CoronerIssuesResponse>(url, JSON.stringify(request), headers);

                if (Result.isErr(postResult)) {
                    return Result.ok({
                        request,
                        response: {
                            error: {
                                message: postResult.data.message,
                                code: -1,
                            },
                        },
                    });
                }

                return Result.ok({
                    request,
                    response: postResult.data,
                });
            }),
        );
        return Result.flat(results);
    }
}
