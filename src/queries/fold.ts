import { CoronerResponse } from '../responses/common';
import { FoldQueryResponse } from '../responses/fold';
import {
    CoronerValueType,
    DynamicCommonCoronerQuery,
    DynamicQueryObject,
    DynamicQueryObjectValue,
    JoinDynamicQueryObject,
    QueryObject,
    StaticCommonCoronerQuery,
} from './common';

export type DistributionFoldOperator = ['distribution', number];
export type BinFoldOperator = ['bin', ...number[]];
export type CommonFoldOperator = ['head'] | ['tail'] | ['unique'] | ['range'] | ['max'] | ['min'];

export type NumberFoldOperator = BinFoldOperator | DistributionFoldOperator | CommonFoldOperator | ['mean'] | ['sum'];
export type StringFoldOperator = CommonFoldOperator | DistributionFoldOperator;
export type BooleanFoldOperator = BinFoldOperator | DistributionFoldOperator | CommonFoldOperator | ['mean'] | ['sum'];

export type FoldOperator<T extends CoronerValueType> = T extends string
    ? StringFoldOperator
    : T extends number
    ? NumberFoldOperator
    : T extends boolean
    ? BooleanFoldOperator
    : never;

export interface StaticFoldCoronerQuery<
    T extends QueryObject<T>,
    F extends Folds = never,
    G extends (keyof T & string) | DefaultGroup = '*'
> extends StaticCommonCoronerQuery<T> {
    fold(): StaticFoldedCoronerQuery<T, F, G>;
    fold<A extends keyof T & string, O extends FoldOperator<T[A]>>(
        attribute: A,
        ...fold: O
    ): StaticFoldedCoronerQuery<T, JoinFolds<F, A, O>, G>;
    group<A extends keyof T & string>(attribute: A): StaticFoldedCoronerQuery<T, F, A>;
}

export interface StaticFoldedCoronerQuery<
    T extends QueryObject<T>,
    F extends Folds,
    G extends (keyof T & string) | DefaultGroup
> extends StaticFoldCoronerQuery<T, F, G> {}

export interface DynamicFoldCoronerQuery<
    T extends DynamicQueryObject,
    F extends Folds = never,
    G extends (keyof T & string) | DefaultGroup = '*'
> extends DynamicCommonCoronerQuery<T> {
    fold(): DynamicFoldedCoronerQuery<T, F, G>;
    fold<A extends string, V extends DynamicQueryObjectValue<T, A>, O extends FoldOperator<V>>(
        attribute: A,
        ...fold: O
    ): DynamicFoldedCoronerQuery<JoinDynamicQueryObject<T, A, V>, JoinFolds<F, A, O>, G>;
    group<A extends keyof T & string>(attribute: A): DynamicFoldedCoronerQuery<T, F, A>;
}

export interface DynamicFoldedCoronerQuery<
    T extends DynamicQueryObject,
    F extends Folds,
    G extends (keyof T & string) | DefaultGroup
> extends DynamicFoldCoronerQuery<T, F, G> {}

export interface FoldedCoronerQueryExecutor {
    execute<Q extends StaticFoldedCoronerQuery<never, never, never>>(
        query: Q
    ): Promise<
        Q extends StaticFoldedCoronerQuery<infer T, infer F, infer G>
            ? CoronerResponse<FoldQueryResponse<T, F, G>>
            : never
    >;
    execute<Q extends DynamicFoldedCoronerQuery<never, never, never>>(
        query: Q
    ): Promise<
        Q extends DynamicFoldedCoronerQuery<infer T, infer F, infer G>
            ? CoronerResponse<FoldQueryResponse<T, F, G>>
            : never
    >;
}

export type Fold<A extends string, F extends FoldOperator<CoronerValueType>[]> = [A, F];

export type Folds = {
    [A in string]: Fold<A, FoldOperator<CoronerValueType>[]>;
};

export type JoinFolds<F extends Folds, A extends string, O extends FoldOperator<CoronerValueType>> = [F] extends [never]
    ? { [K in A]: Fold<K, [O]> }
    : F extends { [K in A]: Fold<A, infer AF> }
    ? { [K in A]: Fold<A, [...AF, O]> } & Pick<F, Exclude<keyof F, A>>
    : F & { [K in A]: Fold<K, [O]> };

export type DefaultGroup = '*';
