import { IFoldCoronerQueryBuilderFactory } from '../../interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ISelectCoronerQueryBuilderFactory } from '../../interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { Attribute } from '../../queries/common';
import { QueryRequest } from '../../requests/common';
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

    public create<T extends Attribute = never>(request?: QueryRequest) {
        return new CoronerQueryBuilder<T>(request ?? {}, this.#foldQueryFactory, this.#selectQueryFactory);
    }
}
