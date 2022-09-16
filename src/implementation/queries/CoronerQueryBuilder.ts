import { AttributeList } from '../../common/attributes';
import { IFoldCoronerQueryBuilderFactory } from '../../interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ISelectCoronerQueryBuilderFactory } from '../../interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { CoronerQuery } from '../../queries/common';
import { FoldedCoronerQuery, SetFoldGroup } from '../../queries/fold';
import { AddSelect, SelectedCoronerQuery } from '../../queries/select';
import { SelectQueryRequest } from '../../requests';
import { CoronerValueType, QueryRequest } from '../../requests/common';
import { FoldOperator, FoldQueryRequest, Folds } from '../../requests/fold';
import { CommonCoronerQueryBuilder } from './CommonCoronerQueryBuilder';

export class CoronerQueryBuilder<AL extends AttributeList>
    extends CommonCoronerQueryBuilder<AL>
    implements CoronerQuery<AL>
{
    readonly #request: QueryRequest;
    readonly #attributeList: AL;
    readonly #foldQueryFactory: IFoldCoronerQueryBuilderFactory;
    readonly #selectQueryFactory: ISelectCoronerQueryBuilderFactory;

    constructor(
        request: QueryRequest,
        attributeList: AL,
        foldQueryFactory: IFoldCoronerQueryBuilderFactory,
        selectQueryFactory: ISelectCoronerQueryBuilderFactory
    ) {
        super(request);
        this.#request = request;
        this.#attributeList = attributeList;
        this.#foldQueryFactory = foldQueryFactory;
        this.#selectQueryFactory = selectQueryFactory;
    }

    public select<A extends string[]>(
        ...attributes: A
    ): SelectedCoronerQuery<AL, AddSelect<SelectQueryRequest<[]>, A>> {
        const query = this.#selectQueryFactory.create(this.#request, this.#attributeList);
        return query.select(...attributes) as SelectedCoronerQuery<AL, AddSelect<SelectQueryRequest<[]>, A>>;
    }

    public dynamicSelect(): SelectedCoronerQuery<AL, SelectQueryRequest<string[]>> {
        const query = this.#selectQueryFactory.create(this.#request, this.#attributeList);
        return query.dynamicSelect();
    }

    public fold<A extends string, V extends CoronerValueType, O extends FoldOperator<V>>(
        attribute: A,
        ...fold: O
    ): FoldedCoronerQuery<AL, FoldQueryRequest<Folds<A, [O]>, ['*']>> {
        const query = this.#foldQueryFactory.create(this.#request as FoldQueryRequest, this.#attributeList);
        return query.fold(attribute, ...fold) as unknown as FoldedCoronerQuery<
            AL,
            FoldQueryRequest<Folds<A, [O]>, ['*']>
        >;
    }

    public dynamicFold(): FoldedCoronerQuery<AL, FoldQueryRequest<Folds>> {
        const query = this.#foldQueryFactory.create(this.#request as FoldQueryRequest, this.#attributeList);
        return query.dynamicFold();
    }

    public group<A extends string>(attribute: A): FoldedCoronerQuery<AL, SetFoldGroup<FoldQueryRequest<never>, A>> {
        const query = this.#foldQueryFactory.create(this.#request as FoldQueryRequest, this.#attributeList);
        return query.group(attribute) as unknown as FoldedCoronerQuery<AL, SetFoldGroup<FoldQueryRequest<never>, A>>;
    }

    protected createInstance(request: QueryRequest): this {
        return new CoronerQueryBuilder(
            request,
            this.#attributeList,
            this.#foldQueryFactory,
            this.#selectQueryFactory
        ) as this;
    }
}
