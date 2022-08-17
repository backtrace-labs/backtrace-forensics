import { ISelectCoronerQueryBuilderFactory } from '../../interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { ISelectCoronerSimpleResponseBuilder } from '../../interfaces/responses/ISelectCoronerSimpleResponseBuilder';
import { Attribute } from '../../queries/common';
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

    public create<T extends Attribute, S extends string[] = []>(
        request: SelectQueryRequest<T, S>
    ): SelectCoronerQuery<T, S> {
        return new SelectedCoronerQueryBuilder(request, this.#executor, this.#simpleResponseBuilder);
    }
}
