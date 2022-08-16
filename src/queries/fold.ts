import { FoldQueryResponse } from '../responses/fold';
import {
    CoronerValueType,
    DynamicCommonCoronerQuery,
    DynamicQueryObject,
    DynamicQueryObjectValue,
    ExecutableCoronerQuery,
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

export interface FoldCoronerQuery<
    T extends QueryObject<T>,
    F extends Folds = never,
    G extends (keyof T & string) | DefaultGroup = '*'
> extends StaticCommonCoronerQuery<T> {
    fold(): FoldedCoronerQuery<T, F, G>;
    fold<A extends keyof T & string, O extends FoldOperator<T[A]>>(
        attribute: A,
        ...fold: O
    ): FoldedCoronerQuery<T, JoinFolds<F, A, O>, G>;
    group<A extends keyof T & string>(attribute: A): FoldedCoronerQuery<T, F, A>;
}

export interface FoldedCoronerQuery<
    T extends QueryObject<T>,
    F extends Folds,
    G extends (keyof T & string) | DefaultGroup
> extends FoldCoronerQuery<T, F, G>,
        ExecutableCoronerQuery<FoldQueryResponse<T, F, G>> {}

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
> extends DynamicFoldCoronerQuery<T, F, G>,
        ExecutableCoronerQuery<FoldQueryResponse<T, F, G>> {}

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
