import { QueryRequest } from '../../coroner/common';
import { ICoronerQueryExecutor } from '../../interfaces';
import { IFoldCoronerQueryBuilderFactory } from '../../interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ISelectCoronerQueryBuilderFactory } from '../../interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { CoronerQueryBuilder } from '../queries/CoronerQueryBuilder';

export class CoronerQueryBuilderFactory {
    readonly #executor: ICoronerQueryExecutor;
    readonly #foldQueryFactory: IFoldCoronerQueryBuilderFactory;
    readonly #selectQueryFactory: ISelectCoronerQueryBuilderFactory;

    constructor(
        executor: ICoronerQueryExecutor,
        foldQueryFactory: IFoldCoronerQueryBuilderFactory,
        selectQueryFactory: ISelectCoronerQueryBuilderFactory
    ) {
        this.#executor = executor;
        this.#foldQueryFactory = foldQueryFactory;
        this.#selectQueryFactory = selectQueryFactory;
    }

    public create(request: QueryRequest) {
        return new CoronerQueryBuilder(request, this.#executor, this.#foldQueryFactory, this.#selectQueryFactory);
    }
}
