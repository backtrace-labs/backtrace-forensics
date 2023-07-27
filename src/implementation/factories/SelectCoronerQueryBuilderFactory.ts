import { Extension, Plugins } from '../../common';
import { SelectCoronerQuery, SelectQueryRequest } from '../../coroner/select';
import { ISelectCoronerQueryBuilderFactory } from '../../interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { ISelectCoronerSimpleResponseBuilder } from '../../interfaces/responses/ISelectCoronerSimpleResponseBuilder';
import { SelectedCoronerQueryBuilder } from '../queries/SelectCoronerQueryBuilder';

export class SelectCoronerQueryBuilderFactory implements ISelectCoronerQueryBuilderFactory {
    readonly #executor: ICoronerQueryExecutor;
    readonly #simpleResponseBuilder: ISelectCoronerSimpleResponseBuilder;
    readonly #extensions?: Extension<SelectedCoronerQueryBuilder>[];

    constructor(
        executor: ICoronerQueryExecutor,
        builder: ISelectCoronerSimpleResponseBuilder,
        extensions?: Extension<SelectedCoronerQueryBuilder>[],
    ) {
        this.#executor = executor;
        this.#simpleResponseBuilder = builder;
        this.#extensions = extensions;
    }

    public create(request: SelectQueryRequest): SelectCoronerQuery {
        const buildSelf = (req: SelectQueryRequest): SelectedCoronerQueryBuilder => {
            const builder = new SelectedCoronerQueryBuilder(
                req,
                this.#executor,
                buildSelf,
                this.#simpleResponseBuilder,
            );

            if (this.#extensions) {
                return Plugins.extend(builder, this.#extensions);
            }
            return builder;
        };

        return buildSelf(request);
    }
}
