import { QuerySource } from '../models/QuerySource';
import { CoronerValueType } from '../requests/common';
import { Fold, FoldOperator, FoldQueryRequest, Folds } from '../requests/fold';
import { CoronerResponse } from '../responses/common';
import { FoldQueryResponse } from '../responses/fold';
import { Attribute, CommonCoronerQuery, JoinAttributes, QueryObjectValue } from './common';

export interface FoldCoronerQuery<T extends Attribute, F extends Folds = never, G extends string | DefaultGroup = '*'>
    extends CommonCoronerQuery<T> {
    fold<A extends string>(): FoldedCoronerQuery<T, [F] extends [never] ? Folds<A> : F, string>;
    fold<A extends string, G extends string>(): FoldedCoronerQuery<T, [F] extends [never] ? Folds<A> : F, G>;
    fold<A extends string, V extends QueryObjectValue<T, A>, O extends FoldOperator<V>>(
        attribute: A,
        ...fold: O
    ): FoldedCoronerQuery<JoinAttributes<T, A, V>, JoinFolds<F, A, O>, G>;
    group<A extends string>(attribute: A): FoldedCoronerQuery<T, F, A>;
}

export interface FoldedCoronerQuery<T extends Attribute, F extends Folds, G extends string | DefaultGroup>
    extends FoldCoronerQuery<T, F, G> {
    getRequest(): FoldQueryRequest<T, F, G>;
    getResponse(source?: Partial<QuerySource>): Promise<CoronerResponse<FoldQueryResponse<T, F, G>>>;
}

export type JoinFolds<F extends Folds, A extends string, O extends FoldOperator<CoronerValueType>> = [F] extends [never]
    ? { [K in A]: Fold<K, [O]> }
    : F extends { [K in A]: Fold<A, infer AF> }
    ? { [K in A]: Fold<A, [...AF, O]> } & Pick<F, Exclude<keyof F, A>>
    : F & { [K in A]: Fold<K, [O]> };

export type DefaultGroup = '*';
