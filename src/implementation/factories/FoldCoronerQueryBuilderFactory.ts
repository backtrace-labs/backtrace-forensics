import { Extension, Plugins } from '../../common';
import {
    FailedFoldQueryResponse,
    FoldedCoronerQuery,
    FoldQueryRequest,
    SuccessfulFoldQueryResponse,
} from '../../coroner/fold';
import { IFoldCoronerQueryBuilderFactory } from '../../interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { IFoldCoronerSimpleResponseBuilder } from '../../interfaces/responses/IFoldCoronerSimpleResponseBuilder';
import { FoldedCoronerQueryBuilder } from '../queries/FoldCoronerQueryBuilder';

export class FoldCoronerQueryBuilderFactory implements IFoldCoronerQueryBuilderFactory {
    readonly #executor: ICoronerQueryExecutor;
    readonly #simpleResponseBuilder: IFoldCoronerSimpleResponseBuilder;
    readonly #queryBuilderExtensions?: Extension<FoldedCoronerQueryBuilder>[];
    readonly #failedResponseExtensions?: Extension<FailedFoldQueryResponse>[];
    readonly #successfulFoldResponseExtensions?: Extension<SuccessfulFoldQueryResponse>[];

    constructor(
        executor: ICoronerQueryExecutor,
        builder: IFoldCoronerSimpleResponseBuilder,
        queryBuilderExtensions?: Extension<FoldedCoronerQueryBuilder>[],
        failedResponseExtensions?: Extension<FailedFoldQueryResponse>[],
        successfulFoldResponseExtensions?: Extension<SuccessfulFoldQueryResponse>[],
    ) {
        this.#executor = executor;
        this.#simpleResponseBuilder = builder;
        this.#queryBuilderExtensions = queryBuilderExtensions;
        this.#failedResponseExtensions = failedResponseExtensions;
        this.#successfulFoldResponseExtensions = successfulFoldResponseExtensions;
    }

    public create(request: FoldQueryRequest): FoldedCoronerQuery {
        const buildSelf = (req: FoldQueryRequest): FoldedCoronerQueryBuilder => {
            const builder = new FoldedCoronerQueryBuilder(
                req,
                this.#executor,
                buildSelf,
                this.#simpleResponseBuilder,
                this.#failedResponseExtensions,
                this.#successfulFoldResponseExtensions,
            );

            if (this.#queryBuilderExtensions) {
                return Plugins.extend(builder, this.#queryBuilderExtensions);
            }
            return builder;
        };

        return buildSelf(request);
    }
}
