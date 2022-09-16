import { AttributeList } from '../../common/attributes';
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

    public create<AL extends AttributeList, R extends FoldQueryRequest>(
        request: R,
        attributeList: AL
    ): FoldedCoronerQuery<AL, R> {
        return new FoldedCoronerQueryBuilder(request, attributeList, this.#executor, this.#simpleResponseBuilder);
    }
}
