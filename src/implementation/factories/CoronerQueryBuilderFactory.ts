import { Extension, Plugins } from '../../common';
import { FailedQueryResponse, QueryRequest, SuccessfulQueryResponse } from '../../coroner/common';
import { ICoronerQueryExecutor } from '../../interfaces';
import { IFoldCoronerQueryBuilderFactory } from '../../interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ISelectCoronerQueryBuilderFactory } from '../../interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { CoronerQueryBuilder } from '../queries/CoronerQueryBuilder';

export class CoronerQueryBuilderFactory {
    readonly #executor: ICoronerQueryExecutor;
    readonly #foldQueryFactory: IFoldCoronerQueryBuilderFactory;
    readonly #selectQueryFactory: ISelectCoronerQueryBuilderFactory;
    readonly #extensions?: Extension<CoronerQueryBuilder>[];
    readonly #failedResponseExtensions?: Extension<FailedQueryResponse>[];
    readonly #successfulResponseExtensions?: Extension<SuccessfulQueryResponse>[];

    constructor(
        executor: ICoronerQueryExecutor,
        foldQueryFactory: IFoldCoronerQueryBuilderFactory,
        selectQueryFactory: ISelectCoronerQueryBuilderFactory,
        extensions?: Extension<CoronerQueryBuilder>[],
        failedResponseExtensions?: Extension<FailedQueryResponse>[],
        successfulResponseExtensions?: Extension<SuccessfulQueryResponse>[],
    ) {
        this.#executor = executor;
        this.#foldQueryFactory = foldQueryFactory;
        this.#selectQueryFactory = selectQueryFactory;
        this.#extensions = extensions;
        this.#failedResponseExtensions = failedResponseExtensions;
        this.#successfulResponseExtensions = successfulResponseExtensions;
    }

    public create(request: QueryRequest) {
        const buildSelf = (req: QueryRequest): CoronerQueryBuilder => {
            const builder = new CoronerQueryBuilder(
                req,
                this.#executor,
                buildSelf,
                this.#foldQueryFactory,
                this.#selectQueryFactory,
                this.#failedResponseExtensions,
                this.#successfulResponseExtensions,
            );

            if (this.#extensions) {
                return Plugins.extend(builder, this.#extensions);
            }
            return builder;
        };

        return buildSelf(request);
    }
}
