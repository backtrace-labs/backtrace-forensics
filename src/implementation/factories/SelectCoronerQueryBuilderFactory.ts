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

    public create<R extends SelectQueryRequest>(request: R): SelectCoronerQuery<R> {
        return new SelectedCoronerQueryBuilder(request, this.#executor, this.#simpleResponseBuilder);
    }
}
