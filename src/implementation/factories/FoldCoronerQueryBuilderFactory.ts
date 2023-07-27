import { Extension, Plugins } from '../../common';
import { FoldedCoronerQuery, FoldQueryRequest } from '../../coroner/fold';
import { IFoldCoronerQueryBuilderFactory } from '../../interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { IFoldCoronerSimpleResponseBuilder } from '../../interfaces/responses/IFoldCoronerSimpleResponseBuilder';
import { FoldedCoronerQueryBuilder } from '../queries/FoldCoronerQueryBuilder';

export class FoldCoronerQueryBuilderFactory implements IFoldCoronerQueryBuilderFactory {
    readonly #executor: ICoronerQueryExecutor;
    readonly #simpleResponseBuilder: IFoldCoronerSimpleResponseBuilder;
    readonly #extensions?: Extension<FoldedCoronerQueryBuilder>[];

    constructor(
        executor: ICoronerQueryExecutor,
        builder: IFoldCoronerSimpleResponseBuilder,
        extensions?: Extension<FoldedCoronerQueryBuilder>[],
    ) {
        this.#executor = executor;
        this.#simpleResponseBuilder = builder;
        this.#extensions = extensions;
    }

    public create(request: FoldQueryRequest): FoldedCoronerQuery {
        const buildSelf = (req: FoldQueryRequest): FoldedCoronerQueryBuilder => {
            const builder = new FoldedCoronerQueryBuilder(req, this.#executor, buildSelf, this.#simpleResponseBuilder);

            if (this.#extensions) {
                return Plugins.extend(builder, this.#extensions);
            }
            return builder;
        };

        return buildSelf(request);
    }
}
