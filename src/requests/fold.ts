import { CommonQueryRequest, CoronerValueType } from './common';

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

export type QueryFold = { [attribute: string]: (NumberFoldOperator | StringFoldOperator | BooleanFoldOperator)[] };

export interface FoldQueryRequest extends CommonQueryRequest {
    group?: CoronerValueType[];
    fold?: QueryFold;
}
