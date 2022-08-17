import { IFoldCoronerQueryBuilderFactory } from '../../interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { IFoldCoronerSimpleResponseBuilder } from '../../interfaces/responses/IFoldCoronerSimpleResponseBuilder';
import { Attribute } from '../../queries/common';
import { DefaultGroup, FoldedCoronerQuery } from '../../queries/fold';
import { FoldQueryRequest, Folds } from '../../requests/fold';
import { FoldedCoronerQueryBuilder } from '../queries/FoldCoronerQueryBuilder';

export class FoldCoronerQueryBuilderFactory implements IFoldCoronerQueryBuilderFactory {
    readonly #executor: ICoronerQueryExecutor;
    readonly #simpleResponseBuilder: IFoldCoronerSimpleResponseBuilder;

    constructor(executor: ICoronerQueryExecutor, builder: IFoldCoronerSimpleResponseBuilder) {
        this.#executor = executor;
        this.#simpleResponseBuilder = builder;
    }

    public create<T extends Attribute, F extends Folds = never, G extends string | DefaultGroup = '*'>(
        request: FoldQueryRequest<T, F, G>
    ): FoldedCoronerQuery<T, F, G> {
        return new FoldedCoronerQueryBuilder(request, this.#executor, this.#simpleResponseBuilder);
    }
}
