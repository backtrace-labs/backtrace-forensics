import { Attribute, JoinAttributes, QueryObjectValue } from '../../queries/common';
import { DefaultGroup, FoldedCoronerQuery, JoinFolds } from '../../queries/fold';
import { CommonQueryRequest, CoronerValueType } from '../../requests/common';
import { FoldOperator, FoldQueryRequest, Folds } from '../../requests/fold';
import { CoronerResponse } from '../../responses/common';
import { FoldQueryResponse } from '../../responses/fold';
import { CoronerQueryExecutor } from '../CoronerQueryExecutor';
import { cloneFoldRequest } from './cloneRequest';
import { CommonCoronerQueryBuilder } from './CommonCoronerQueryBuilder';

export class FoldedCoronerQueryBuilder<
        T extends Attribute,
        F extends Folds = never,
        G extends string | DefaultGroup = '*'
    >
    extends CommonCoronerQueryBuilder<T>
    implements FoldedCoronerQuery<T, F, G>
{
    readonly #request: FoldQueryRequest<T, F, G>;
    readonly #executor: CoronerQueryExecutor;

    constructor(request: FoldQueryRequest<T, F, G>, executor: CoronerQueryExecutor) {
        super(request);
        this.#request = request;
        this.#executor = executor;
    }

    public fold<A extends string>(): FoldedCoronerQuery<T, [F] extends [never] ? Folds<A> : F, string>;
    public fold<A extends string, G extends string>(): FoldedCoronerQuery<T, [F] extends [never] ? Folds<A> : F, G>;
    public fold<A extends string, V extends QueryObjectValue<T, A>, O extends FoldOperator<V>>(
        attribute: A,
        ...fold: O
    ): FoldedCoronerQuery<JoinAttributes<T, A, V>, JoinFolds<F, A, O>, G>;
    public fold<A extends string, V extends QueryObjectValue<T, A>, O extends FoldOperator<V>>(
        attribute?: A,
        ...foldOrUndefined: O | undefined[]
    ):
        | FoldedCoronerQuery<T, [F] extends [never] ? Folds<A> : F, string>
        | FoldedCoronerQuery<T, [F] extends [never] ? Folds<A> : F, G>
        | FoldedCoronerQuery<JoinAttributes<T, A, V>, JoinFolds<F, A, O>, G> {
        if (!attribute) {
            return this as FoldedCoronerQuery<T, [F] extends [never] ? Folds<A> : F, string>;
        }

        const request = cloneFoldRequest<JoinAttributes<T, A, V>, JoinFolds<F, A, O>, G>(this.#request);
        const fold = foldOrUndefined as FoldOperator<CoronerValueType>;

        if (!request.fold) {
            request.fold = {};
        }

        if (request.fold[attribute]) {
            request.fold[attribute]!.push(fold);
        } else {
            request.fold[attribute] = [fold];
        }

        return this.createInstance(request) as FoldedCoronerQuery<JoinAttributes<T, A, V>, JoinFolds<F, A, O>, G>;
    }

    public group<A extends string>(attribute: A): FoldedCoronerQuery<T, F, A> {
        const request = cloneFoldRequest<T, F, A>(this.#request);
        if (attribute === '*') {
            request.group = undefined;
        } else {
            request.group = [attribute];
        }

        return this.createInstance(request) as FoldedCoronerQuery<T, F, A>;
    }

    public getRequest(): FoldQueryRequest<T, F, G> {
        return this.#request;
    }

    public getResponse(): Promise<CoronerResponse<FoldQueryResponse<T, F, G>>> {
        return this.#executor.execute(this.#request);
    }

    protected createInstance(request: CommonQueryRequest): this {
        return new FoldedCoronerQueryBuilder<T, F, G>(request, this.#executor) as this;
    }
}
