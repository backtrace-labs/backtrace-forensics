import { QueryRequest } from '../../coroner/common';
import { IFoldCoronerQueryBuilderFactory } from '../../interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ISelectCoronerQueryBuilderFactory } from '../../interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { CoronerQueryBuilder } from '../queries/CoronerQueryBuilder';

export class CoronerQueryBuilderFactory {
    readonly #foldQueryFactory: IFoldCoronerQueryBuilderFactory;
    readonly #selectQueryFactory: ISelectCoronerQueryBuilderFactory;

    constructor(
        foldQueryFactory: IFoldCoronerQueryBuilderFactory,
        selectQueryFactory: ISelectCoronerQueryBuilderFactory
    ) {
        this.#foldQueryFactory = foldQueryFactory;
        this.#selectQueryFactory = selectQueryFactory;
    }

    public create(request: QueryRequest) {
        return new CoronerQueryBuilder(request, this.#foldQueryFactory, this.#selectQueryFactory);
    }
}
