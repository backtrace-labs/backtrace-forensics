import { Attribute } from '../queries/common';
import { DefaultGroup } from '../queries/fold';
import { CoronerValueType, QueryRequest } from './common';

export type DistributionFoldOperator = ['distribution', number];
export type BinFoldOperator = ['bin', ...number[]];
export type CommonFoldOperator =
    | DistributionFoldOperator
    | ['head']
    | ['tail']
    | ['unique']
    | ['range']
    | ['max']
    | ['min'];

export type UnaryFoldOperator = ['head'] | ['tail'] | ['unique'] | ['max'] | ['min'] | ['mean'] | ['sum'];

export type NumberFoldOperator = CommonFoldOperator | BinFoldOperator | ['mean'] | ['sum'];
export type StringFoldOperator = CommonFoldOperator;
export type BooleanFoldOperator = CommonFoldOperator | BinFoldOperator | ['mean'] | ['sum'];

export type FoldOperator<T extends CoronerValueType> = T extends string
    ? StringFoldOperator
    : T extends number
    ? NumberFoldOperator
    : T extends boolean
    ? BooleanFoldOperator
    : never;

export type Fold<A extends string, F extends FoldOperator<CoronerValueType>[]> = [A, F];

export type Folds<K extends string = never> = {
    [A in [K] extends [never] ? string : K]: Fold<A, FoldOperator<CoronerValueType>[]>;
};

export type QueryFold<T extends Attribute, F extends Folds> = {
    [A in keyof T & keyof F & string]: FoldOperator<CoronerValueType>[];
};

export interface FoldQueryRequest<
    T extends Attribute = Attribute,
    F extends Folds = Folds,
    G extends keyof T | DefaultGroup = string
> extends QueryRequest {
    /**
     * Attribute to group on.
     * @example
     * request.group = ['a'];
     */
    group?: [G];

    /**
     * Attributes to fold on.
     * @example
     * request.fold = {
     *     timestamp: [['head'], ['distribution', 3]],
     *     fingerprint: [['tail']]
     * };
     */
    fold?: Partial<QueryFold<T, F>>;
}
