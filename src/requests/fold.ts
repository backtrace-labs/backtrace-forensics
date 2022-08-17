import { Attribute } from '../queries/common';
import { DefaultGroup } from '../queries/fold';
import { CoronerValueType, QueryRequest } from './common';

export type DistributionFoldOperator = ['distribution', number];
export type BinFoldOperator = ['bin', ...number[]];
export type CommonFoldOperator = ['head'] | ['tail'] | ['unique'] | ['range'] | ['max'] | ['min'];
export type UnaryFoldOperator = ['head'] | ['tail'] | ['unique'] | ['max'] | ['min'] | ['mean'] | ['sum'];

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

export type Fold<A extends string, F extends FoldOperator<CoronerValueType>[]> = [A, F];

export type Folds<K extends string = never> = {
    [A in [K] extends [never] ? string : K]: Fold<A, FoldOperator<CoronerValueType>[]>;
};

export type QueryFold<T extends Attribute, F extends Folds> = {
    [A in keyof T & keyof F & string]: FoldOperator<CoronerValueType>[];
};

export interface FoldQueryRequest<T extends Attribute, F extends Folds, G extends keyof T | DefaultGroup>
    extends QueryRequest {
    group?: [G];
    fold?: Partial<QueryFold<T, F>>;
}
