import { AttributeList } from '../../common/attributes';
import { IFoldCoronerQueryBuilderFactory } from '../../interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ISelectCoronerQueryBuilderFactory } from '../../interfaces/factories/ISelectCoronerQueryBuilderFactory';
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

    public create<AL extends AttributeList>(request: QueryRequest, attributeList: AL) {
        return new CoronerQueryBuilder(request, attributeList, this.#foldQueryFactory, this.#selectQueryFactory);
    }
}
