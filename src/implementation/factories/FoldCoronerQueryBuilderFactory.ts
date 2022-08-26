import { IFoldCoronerQueryBuilderFactory } from '../../interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { IFoldCoronerSimpleResponseBuilder } from '../../interfaces/responses/IFoldCoronerSimpleResponseBuilder';
import { FoldedCoronerQuery } from '../../queries/fold';
import { FoldQueryRequest } from '../../requests/fold';
import { FoldedCoronerQueryBuilder } from '../queries/FoldCoronerQueryBuilder';

export class FoldCoronerQueryBuilderFactory implements IFoldCoronerQueryBuilderFactory {
    readonly #executor: ICoronerQueryExecutor;
    readonly #simpleResponseBuilder: IFoldCoronerSimpleResponseBuilder;

    constructor(executor: ICoronerQueryExecutor, builder: IFoldCoronerSimpleResponseBuilder) {
        this.#executor = executor;
        this.#simpleResponseBuilder = builder;
    }

    public create<R extends FoldQueryRequest>(request: R): FoldedCoronerQuery<R> {
        return new FoldedCoronerQueryBuilder(request, this.#executor, this.#simpleResponseBuilder);
    }
}
