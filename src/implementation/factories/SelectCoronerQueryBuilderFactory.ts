import { Extension, Plugins } from '../../common';
import { SelectCoronerQuery, SelectQueryRequest, SelectQueryResponse } from '../../coroner/select';
import { ISelectCoronerQueryBuilderFactory } from '../../interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { ISelectCoronerSimpleResponseBuilder } from '../../interfaces/responses/ISelectCoronerSimpleResponseBuilder';
import { SelectedCoronerQueryBuilder } from '../queries/SelectCoronerQueryBuilder';

export class SelectCoronerQueryBuilderFactory implements ISelectCoronerQueryBuilderFactory {
    readonly #executor: ICoronerQueryExecutor;
    readonly #simpleResponseBuilder: ISelectCoronerSimpleResponseBuilder;
    readonly #queryBuilderExtensions?: Extension<SelectedCoronerQueryBuilder>[];
    readonly #successfulSelectResponseExtensions?: Extension<SelectQueryResponse>[];

    constructor(
        executor: ICoronerQueryExecutor,
        builder: ISelectCoronerSimpleResponseBuilder,
        queryBuilderExtensions?: Extension<SelectedCoronerQueryBuilder>[],
        successfulSelectResponseExtensions?: Extension<SelectQueryResponse>[],
    ) {
        this.#executor = executor;
        this.#simpleResponseBuilder = builder;
        this.#queryBuilderExtensions = queryBuilderExtensions;
        this.#successfulSelectResponseExtensions = successfulSelectResponseExtensions;
    }

    public create(request: SelectQueryRequest): SelectCoronerQuery {
        const buildSelf = (req: SelectQueryRequest): SelectedCoronerQueryBuilder => {
            const builder = new SelectedCoronerQueryBuilder(
                req,
                this.#executor,
                buildSelf,
                this.#simpleResponseBuilder,
                this.#successfulSelectResponseExtensions,
            );

            if (this.#queryBuilderExtensions) {
                return Plugins.extend(builder, this.#queryBuilderExtensions);
            }
            return builder;
        };

        return buildSelf(request);
    }
}
