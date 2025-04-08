import { Extension, Plugins } from '../../common';
import { FoldedCoronerQuery, FoldQueryRequest, FoldQueryResponse } from '../../coroner/fold';
import { IFoldCoronerQueryBuilderFactory } from '../../interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { IFoldCoronerSimpleResponseBuilder } from '../../interfaces/responses/IFoldCoronerSimpleResponseBuilder';
import { FoldedCoronerQueryBuilder } from '../queries/FoldCoronerQueryBuilder';

export class FoldCoronerQueryBuilderFactory implements IFoldCoronerQueryBuilderFactory {
    readonly #executor: ICoronerQueryExecutor;
    readonly #simpleResponseBuilder: IFoldCoronerSimpleResponseBuilder;
    readonly #queryBuilderExtensions?: Extension<FoldedCoronerQueryBuilder>[];
    readonly #successfulFoldResponseExtensions?: Extension<FoldQueryResponse>[];

    constructor(
        executor: ICoronerQueryExecutor,
        builder: IFoldCoronerSimpleResponseBuilder,
        queryBuilderExtensions?: Extension<FoldedCoronerQueryBuilder>[],
        successfulFoldResponseExtensions?: Extension<FoldQueryResponse>[],
    ) {
        this.#executor = executor;
        this.#simpleResponseBuilder = builder;
        this.#queryBuilderExtensions = queryBuilderExtensions;
        this.#successfulFoldResponseExtensions = successfulFoldResponseExtensions;
    }

    public create(request: FoldQueryRequest): FoldedCoronerQuery {
        const buildSelf = (req: FoldQueryRequest): FoldedCoronerQueryBuilder => {
            const builder = new FoldedCoronerQueryBuilder(
                req,
                this.#executor,
                buildSelf,
                this.#simpleResponseBuilder,
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
