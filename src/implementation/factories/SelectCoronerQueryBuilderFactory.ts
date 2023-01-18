import { SelectCoronerQuery, SelectQueryRequest } from '../../coroner/select';
import { ISelectCoronerQueryBuilderFactory } from '../../interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { ISelectCoronerSimpleResponseBuilder } from '../../interfaces/responses/ISelectCoronerSimpleResponseBuilder';
import { SelectedCoronerQueryBuilder } from '../queries/SelectCoronerQueryBuilder';

export class SelectCoronerQueryBuilderFactory implements ISelectCoronerQueryBuilderFactory {
    readonly #executor: ICoronerQueryExecutor;
    readonly #simpleResponseBuilder: ISelectCoronerSimpleResponseBuilder;

    constructor(executor: ICoronerQueryExecutor, builder: ISelectCoronerSimpleResponseBuilder) {
        this.#executor = executor;
        this.#simpleResponseBuilder = builder;
    }

    public create(request: SelectQueryRequest): SelectCoronerQuery {
        return new SelectedCoronerQueryBuilder(request, this.#executor, this.#simpleResponseBuilder);
    }
}
