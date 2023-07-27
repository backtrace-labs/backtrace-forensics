import { Extension, Plugins } from '../../common';
import { QueryRequest } from '../../coroner/common';
import { ICoronerQueryExecutor } from '../../interfaces';
import { IFoldCoronerQueryBuilderFactory } from '../../interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ISelectCoronerQueryBuilderFactory } from '../../interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { CoronerQueryBuilder } from '../queries/CoronerQueryBuilder';

export class CoronerQueryBuilderFactory {
    readonly #executor: ICoronerQueryExecutor;
    readonly #foldQueryFactory: IFoldCoronerQueryBuilderFactory;
    readonly #selectQueryFactory: ISelectCoronerQueryBuilderFactory;
    readonly #extensions?: Extension<CoronerQueryBuilder>[];

    constructor(
        executor: ICoronerQueryExecutor,
        foldQueryFactory: IFoldCoronerQueryBuilderFactory,
        selectQueryFactory: ISelectCoronerQueryBuilderFactory,
        extensions?: Extension<CoronerQueryBuilder>[],
    ) {
        this.#executor = executor;
        this.#foldQueryFactory = foldQueryFactory;
        this.#selectQueryFactory = selectQueryFactory;
        this.#extensions = extensions;
    }

    public create(request: QueryRequest) {
        const buildSelf = (req: QueryRequest): CoronerQueryBuilder => {
            const builder = new CoronerQueryBuilder(
                req,
                this.#executor,
                buildSelf,
                this.#foldQueryFactory,
                this.#selectQueryFactory,
            );

            if (this.#extensions) {
                return Plugins.extend(builder, this.#extensions);
            }
            return builder;
        };

        return buildSelf(request);
    }
}
