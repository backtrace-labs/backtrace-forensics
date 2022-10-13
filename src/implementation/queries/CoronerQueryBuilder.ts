import { AttributeList } from '../../common/attributes';
import { IFoldCoronerQueryBuilderFactory } from '../../interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ISelectCoronerQueryBuilderFactory } from '../../interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { CoronerQuery } from '../../queries/common';
import { AddFold, FoldedCoronerQuery, SetFoldGroup } from '../../queries/fold';
import { AddSelect, SelectedCoronerQuery } from '../../queries/select';
import { SelectQueryRequest } from '../../requests';
import { QueryRequest } from '../../requests/common';
import { FoldOperator, FoldQueryRequest, Folds } from '../../requests/fold';
import { CommonCoronerQueryBuilder } from './CommonCoronerQueryBuilder';

export class CoronerQueryBuilder<AL extends AttributeList, R extends QueryRequest>
    extends CommonCoronerQueryBuilder<AL>
    implements CoronerQuery<AL, R>
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

    public select(...attributes: string[]): SelectedCoronerQuery<AL, AddSelect<R, string[]>> {
        const query = this.#selectQueryFactory.create(this.#request, this.#attributeList);
        return query.select(...attributes) as SelectedCoronerQuery<AL, AddSelect<R, string[]>>;
    }

    public dynamicSelect(): SelectedCoronerQuery<AL, SelectQueryRequest<string[]>> {
        const query = this.#selectQueryFactory.create(this.#request, this.#attributeList);
        return query.dynamicSelect();
    }

    public fold(attribute: string, ...fold: any): any {
        const query = this.#foldQueryFactory.create(this.#request as FoldQueryRequest, this.#attributeList);
        return query.fold(attribute, ...fold) as unknown as FoldedCoronerQuery<AL, AddFold<R, string, FoldOperator>>;
    }

    public dynamicFold(): FoldedCoronerQuery<AL, FoldQueryRequest<Folds>> {
        const query = this.#foldQueryFactory.create(this.#request as FoldQueryRequest, this.#attributeList);
        return query.dynamicFold();
    }

    public group<A extends string>(
        attribute: A
    ): FoldedCoronerQuery<AL, SetFoldGroup<FoldQueryRequest<never, ['*']>, A>> {
        const query = this.#foldQueryFactory.create(this.#request as FoldQueryRequest, this.#attributeList);
        return query.group(attribute) as FoldedCoronerQuery<AL, SetFoldGroup<FoldQueryRequest<never, ['*']>, A>>;
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
