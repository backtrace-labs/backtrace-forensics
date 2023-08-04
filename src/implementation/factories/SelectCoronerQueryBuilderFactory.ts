import { Extension, Plugins } from '../../common';
import {
    FailedSelectQueryResponse,
    SelectCoronerQuery,
    SelectQueryRequest,
    SuccessfulSelectQueryResponse,
} from '../../coroner/select';
import { ISelectCoronerQueryBuilderFactory } from '../../interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { ISelectCoronerSimpleResponseBuilder } from '../../interfaces/responses/ISelectCoronerSimpleResponseBuilder';
import { SelectedCoronerQueryBuilder } from '../queries/SelectCoronerQueryBuilder';

export class SelectCoronerQueryBuilderFactory implements ISelectCoronerQueryBuilderFactory {
    readonly #executor: ICoronerQueryExecutor;
    readonly #simpleResponseBuilder: ISelectCoronerSimpleResponseBuilder;
    readonly #queryBuilderExtensions?: Extension<SelectedCoronerQueryBuilder>[];
    readonly #failedResponseExtensions?: Extension<FailedSelectQueryResponse>[];
    readonly #successfulSelectResponseExtensions?: Extension<SuccessfulSelectQueryResponse>[];

    constructor(
        executor: ICoronerQueryExecutor,
        builder: ISelectCoronerSimpleResponseBuilder,
        queryBuilderExtensions?: Extension<SelectedCoronerQueryBuilder>[],
        failedResponseExtensions?: Extension<FailedSelectQueryResponse>[],
        successfulSelectResponseExtensions?: Extension<SuccessfulSelectQueryResponse>[],
    ) {
        this.#executor = executor;
        this.#simpleResponseBuilder = builder;
        this.#queryBuilderExtensions = queryBuilderExtensions;
        this.#failedResponseExtensions = failedResponseExtensions;
        this.#successfulSelectResponseExtensions = successfulSelectResponseExtensions;
    }

    public create(request: SelectQueryRequest): SelectCoronerQuery {
        const buildSelf = (req: SelectQueryRequest): SelectedCoronerQueryBuilder => {
            const builder = new SelectedCoronerQueryBuilder(
                req,
                this.#executor,
                buildSelf,
                this.#simpleResponseBuilder,
                this.#failedResponseExtensions,
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
