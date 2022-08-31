import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { IFoldCoronerSimpleResponseBuilder } from '../../interfaces/responses/IFoldCoronerSimpleResponseBuilder';
import { QuerySource } from '../../models/QuerySource';
import { AddFold, FoldedCoronerQuery, SetFoldGroup } from '../../queries/fold';
import { CoronerValueType } from '../../requests/common';
import { FoldOperator, FoldQueryRequest, Folds } from '../../requests/fold';
import { CoronerResponse } from '../../responses/common';
import { FoldQueryResponse } from '../../responses/fold';
import { cloneFoldRequest } from '../requests/cloneRequest';
import { CommonCoronerQueryBuilder } from './CommonCoronerQueryBuilder';

export class FoldedCoronerQueryBuilder<R extends FoldQueryRequest = FoldQueryRequest<never, ['*']>>
    extends CommonCoronerQueryBuilder
    implements FoldedCoronerQuery<R>
{
    readonly #request: R;
    readonly #executor: ICoronerQueryExecutor;
    readonly #simpleResponseBuilder: IFoldCoronerSimpleResponseBuilder;

    constructor(request: R, executor: ICoronerQueryExecutor, builder: IFoldCoronerSimpleResponseBuilder) {
        super(request);
        this.#request = request;
        this.#executor = executor;
        this.#simpleResponseBuilder = builder;
    }

    public fold<A extends string, V extends CoronerValueType, O extends FoldOperator<V>>(
        attribute: A,
        ...fold: O
    ): FoldedCoronerQuery<AddFold<R, A, O>> {
        const request = cloneFoldRequest(this.#request);

        if (!request.fold) {
            request.fold = {};
        }

        if (request.fold[attribute]) {
            request.fold[attribute] = [...request.fold[attribute], fold];
        } else {
            request.fold[attribute] = [fold];
        }

        return this.createInstance(request) as unknown as FoldedCoronerQuery<AddFold<R, A, O>>;
    }

    public dynamicFold(): FoldedCoronerQuery<FoldQueryRequest<Folds>> {
        return this as FoldedCoronerQuery<FoldQueryRequest<Folds>>;
    }

    public group<A extends string>(attribute: A): FoldedCoronerQuery<SetFoldGroup<R, A>> {
        const request = cloneFoldRequest(this.#request);
        if (attribute === '*') {
            request.group = undefined;
        } else {
            request.group = [attribute];
        }

        return this.createInstance(request) as unknown as FoldedCoronerQuery<SetFoldGroup<R, A>>;
    }

    public getRequest(): R {
        return this.#request;
    }

    public async getResponse(source?: Partial<QuerySource>): Promise<CoronerResponse<FoldQueryResponse<R>>> {
        if (!this.#request.fold || !this.#request.group) {
            throw new Error('Fold or group query expected.');
        }

        const response = await this.#executor.execute<FoldQueryResponse<R>>(this.#request, source);
        if (!response.error) {
            response.response.first = () => this.#simpleResponseBuilder.first(response.response, this.#request);
            response.response.rows = () => this.#simpleResponseBuilder.rows(response.response, this.#request);
        }
        return response;
    }

    protected createInstance(request: R): this {
        return new FoldedCoronerQueryBuilder<R>(request, this.#executor, this.#simpleResponseBuilder) as this;
    }
}
