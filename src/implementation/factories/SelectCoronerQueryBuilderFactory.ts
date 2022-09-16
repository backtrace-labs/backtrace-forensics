import { AttributeList } from '../../common/attributes';
import { ISelectCoronerQueryBuilderFactory } from '../../interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { ISelectCoronerSimpleResponseBuilder } from '../../interfaces/responses/ISelectCoronerSimpleResponseBuilder';
import { SelectCoronerQuery } from '../../queries/select';
import { SelectQueryRequest } from '../../requests/select';
import { SelectedCoronerQueryBuilder } from '../queries/SelectCoronerQueryBuilder';

export class SelectCoronerQueryBuilderFactory implements ISelectCoronerQueryBuilderFactory {
    readonly #executor: ICoronerQueryExecutor;
    readonly #simpleResponseBuilder: ISelectCoronerSimpleResponseBuilder;

    constructor(executor: ICoronerQueryExecutor, builder: ISelectCoronerSimpleResponseBuilder) {
        this.#executor = executor;
        this.#simpleResponseBuilder = builder;
    }

    public create<AL extends AttributeList, R extends SelectQueryRequest>(
        request: R,
        attributeList: AL
    ): SelectCoronerQuery<AL, R> {
        return new SelectedCoronerQueryBuilder(request, attributeList, this.#executor, this.#simpleResponseBuilder);
    }
}
