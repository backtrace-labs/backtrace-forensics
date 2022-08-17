import { Attribute, CoronerQuery, JoinAttributes, QueryObjectValue } from '../../queries/common';
import { DefaultGroup, FoldedCoronerQuery, JoinFolds } from '../../queries/fold';
import { SelectedCoronerQuery } from '../../queries/select';
import { CommonQueryRequest, CoronerValueType } from '../../requests/common';
import { FoldOperator, Folds } from '../../requests/fold';
import { CoronerQueryExecutor } from '../CoronerQueryExecutor';
import { CommonCoronerQueryBuilder } from './CommonCoronerQueryBuilder';
import { FoldedCoronerQueryBuilder } from './FoldCoronerQueryBuilder';
import { SelectedCoronerQueryBuilder } from './SelectCoronerQueryBuilder';

export class CoronerQueryBuilder<T extends Attribute> extends CommonCoronerQueryBuilder<T> implements CoronerQuery<T> {
    readonly #request: CommonQueryRequest;
    readonly #executor: CoronerQueryExecutor;

    constructor(request: CommonQueryRequest, executor: CoronerQueryExecutor) {
        super(request);
        this.#request = request;
        this.#executor = executor;
    }

    public select<A extends string>(): SelectedCoronerQuery<T, A[]>;
    public select<V extends CoronerValueType, A extends string>(
        attribute: A
    ): SelectedCoronerQuery<JoinAttributes<T, A, V>, [A]>;
    public select(attribute?: string) {
        const query = new SelectedCoronerQueryBuilder<T>(this.#request, this.#executor);
        if (!attribute) {
            return query.select();
        }

        return query.select(attribute);
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
        const query = new FoldedCoronerQueryBuilder<T>(this.#request, this.#executor);
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
        const query = new FoldedCoronerQueryBuilder<T>(this.#request, this.#executor);
        return query.group(attribute);
    }

    protected createInstance(request: CommonQueryRequest): this {
        return new CoronerQueryBuilder(request, this.#executor) as this;
    }
}
