import { AttributeValueType } from '../common/attributes';
import { FoldFilterParamOperator, FoldOperator } from './requests';

export type RangeFoldFilterInput<VT extends AttributeValueType> = {
    from?: VT;
    to?: VT;
};

export type DistributionFoldFilterInput = {
    keys?: number;
    tail?: number;
};

export type UnaryFoldFilterInput<VT extends AttributeValueType> = VT;

export type SupportedFoldFilterFolds =
    | 'head'
    | 'max'
    | 'mean'
    | 'min'
    | 'range'
    | 'sum'
    | 'tail'
    | 'unique'
    | 'distribution';

export type FoldFilterInput<O extends FoldOperator = FoldOperator> = O extends FoldOperator<infer T>
    ? O[0] extends 'distribution'
        ? DistributionFoldFilterInput
        : O[0] extends 'range'
        ? RangeFoldFilterInput<AttributeValueType<T>>
        : O[0] extends SupportedFoldFilterFolds
        ? UnaryFoldFilterInput<AttributeValueType<T>>
        : never
    : never;

export type FoldFilterIndexInput<
    O extends FoldOperator = FoldOperator,
    I extends number = number
> = O extends FoldOperator<infer T>
    ? O[0] extends 'distribution'
        ? I extends 0 | 1
            ? number
            : never
        : O[0] extends 'range'
        ? I extends 0 | 1
            ? AttributeValueType<T>
            : never
        : O[0] extends SupportedFoldFilterFolds
        ? I extends 0
            ? AttributeValueType<T>
            : never
        : never
    : never;

export type FoldFilterValueIndex<O extends FoldOperator = FoldOperator> = O[0] extends 'distribution'
    ? 0 | 1
    : O[0] extends 'range'
    ? 0 | 1
    : O[0] extends SupportedFoldFilterFolds
    ? 0
    : never;

export type FoldFilterOperatorInput =
    | FoldFilterParamOperator
    | 'equal'
    | 'not-equal'
    | 'at-least'
    | 'at-most'
    | 'greater-than'
    | 'less-than';
