import { FoldQueryResponse } from '../responses/fold';
import { CommonCoronerQuery, CoronerValueType, ExecutableCoronerQuery } from './common';

type DistributionFoldOperator = ['distribution', number];
type BinFoldOperator = ['bin', ...number[]];

type CommonFoldOperator = ['head'] | ['tail'] | ['unique'] | ['range'] | ['max'] | ['min'];

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

export interface FoldCoronerQuery extends CommonCoronerQuery {
    fold<V extends CoronerValueType, O extends FoldOperator<V>>(attribute: string, ...fold: O): FoldedCoronerQuery;
    group(attribute: string): FoldedCoronerQuery;
}

export interface FoldedCoronerQuery extends FoldCoronerQuery, ExecutableCoronerQuery<FoldQueryResponse> {}
