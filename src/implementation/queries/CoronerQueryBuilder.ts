import { IFoldCoronerQueryBuilderFactory } from '../../interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ISelectCoronerQueryBuilderFactory } from '../../interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { CoronerQuery } from '../../queries/common';
import { FoldedCoronerQuery, SetFoldGroup } from '../../queries/fold';
import { SelectedCoronerQuery } from '../../queries/select';
import { SelectQueryRequest } from '../../requests';
import { CoronerValueType, QueryRequest } from '../../requests/common';
import { FoldOperator, FoldQueryRequest, Folds } from '../../requests/fold';
import { CommonCoronerQueryBuilder } from './CommonCoronerQueryBuilder';

export class CoronerQueryBuilder extends CommonCoronerQueryBuilder implements CoronerQuery {
    readonly #request: QueryRequest;
    readonly #foldQueryFactory: IFoldCoronerQueryBuilderFactory;
    readonly #selectQueryFactory: ISelectCoronerQueryBuilderFactory;

    constructor(
        request: QueryRequest,
        foldQueryFactory: IFoldCoronerQueryBuilderFactory,
        selectQueryFactory: ISelectCoronerQueryBuilderFactory
    ) {
        super(request);
        this.#request = request;
        this.#foldQueryFactory = foldQueryFactory;
        this.#selectQueryFactory = selectQueryFactory;
    }

    public select(): SelectedCoronerQuery<SelectQueryRequest<string[]>>;
    public select<A extends string[]>(...attributes: A): SelectedCoronerQuery<SelectQueryRequest<A>>;
    public select<A extends string[]>(
        ...attributes: A
    ): SelectedCoronerQuery<SelectQueryRequest<string[]>> | SelectedCoronerQuery<SelectQueryRequest<A>> {
        const query = this.#selectQueryFactory.create(this.#request);
        if (!attributes || !attributes.length) {
            return query.select();
        }

        return query.select(...attributes) as unknown as SelectedCoronerQuery<SelectQueryRequest<A>>;
    }

    public fold(): FoldedCoronerQuery<FoldQueryRequest<Folds>>;
    public fold<A extends string, V extends CoronerValueType, O extends FoldOperator<V>>(
        attribute: A,
        ...fold: O
    ): FoldedCoronerQuery<FoldQueryRequest<Folds<A, [O]>, ['*']>>;
    public fold<A extends string, V extends CoronerValueType, O extends FoldOperator<V>>(
        attribute?: A,
        ...fold: O
    ): FoldedCoronerQuery<FoldQueryRequest<Folds>> | FoldedCoronerQuery<FoldQueryRequest<Folds<A, [O]>, ['*']>> {
        const query = this.#foldQueryFactory.create(this.#request as FoldQueryRequest);
        if (!attribute) {
            return query.fold();
        }

        return query.fold(attribute, ...fold) as unknown as FoldedCoronerQuery<FoldQueryRequest<Folds<A, [O]>, ['*']>>;
    }

    public group<A extends string>(attribute: A): FoldedCoronerQuery<SetFoldGroup<FoldQueryRequest<never>, A>> {
        const query = this.#foldQueryFactory.create(this.#request as FoldQueryRequest);
        return query.group(attribute) as unknown as FoldedCoronerQuery<SetFoldGroup<FoldQueryRequest<never>, A>>;
    }

    protected createInstance(request: QueryRequest): this {
        return new CoronerQueryBuilder(request, this.#foldQueryFactory, this.#selectQueryFactory) as this;
    }
}
