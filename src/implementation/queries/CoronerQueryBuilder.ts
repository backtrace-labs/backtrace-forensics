import { IFoldCoronerQueryBuilderFactory } from '../../interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ISelectCoronerQueryBuilderFactory } from '../../interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { Attribute, CoronerQuery, JoinAttributes, QueryObjectValue } from '../../queries/common';
import { DefaultGroup, FoldedCoronerQuery, JoinFolds } from '../../queries/fold';
import { SelectedCoronerQuery } from '../../queries/select';
import { CoronerValueType, QueryRequest } from '../../requests/common';
import { FoldOperator, Folds } from '../../requests/fold';
import { CommonCoronerQueryBuilder } from './CommonCoronerQueryBuilder';

export class CoronerQueryBuilder<T extends Attribute> extends CommonCoronerQueryBuilder<T> implements CoronerQuery<T> {
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

    public select<A extends string>(): SelectedCoronerQuery<T, A[]>;
    public select<V extends CoronerValueType, A extends string>(
        ...attributes: A[]
    ): SelectedCoronerQuery<JoinAttributes<T, A, V>, [A]>;
    public select(...attributes: string[]) {
        const query = this.#selectQueryFactory.create(this.#request);
        if (!attributes || !attributes.length) {
            return query.select();
        }

        return query.select(...attributes);
    }

    public fold<A extends string>(): FoldedCoronerQuery<T, Folds<A>, string>;
    public fold<A extends string, G extends string>(): FoldedCoronerQuery<T, Folds<A>, G>;
    public fold<A extends string, V extends QueryObjectValue<T, A>, O extends FoldOperator<V>>(
        attribute: A,
        ...fold: O
    ): FoldedCoronerQuery<JoinAttributes<T, A, V>, JoinFolds<Folds, A, O>, DefaultGroup>;
    public fold<A extends string, V extends QueryObjectValue<T, A>, O extends FoldOperator<V>>(
        attribute?: A,
        ...foldOrUndefined: O | undefined[]
    ):
        | FoldedCoronerQuery<T, Folds<A>, string>
        | FoldedCoronerQuery<JoinAttributes<T, A, V>, JoinFolds<Folds, A, O>, DefaultGroup> {
        const query = this.#foldQueryFactory.create<T>(this.#request);
        if (!attribute) {
            return query.fold();
        }

        const fold = foldOrUndefined as FoldOperator<V>;

        return query.fold(attribute, ...fold) as FoldedCoronerQuery<
            JoinAttributes<T, A, V>,
            JoinFolds<Folds, A, O>,
            DefaultGroup
        >;
    }

    public group<A extends keyof T & string>(attribute: A) {
        const query = this.#foldQueryFactory.create<T>(this.#request);
        return query.group(attribute);
    }

    protected createInstance(request: QueryRequest): this {
        return new CoronerQueryBuilder(request, this.#foldQueryFactory, this.#selectQueryFactory) as this;
    }
}
