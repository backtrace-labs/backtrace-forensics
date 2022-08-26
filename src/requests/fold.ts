import { CoronerValueType, QueryRequest } from './common';

export type DistributionFoldOperator = readonly ['distribution', number];
export type BinFoldOperator = readonly ['bin', ...number[]];
export type CommonFoldOperator =
    | DistributionFoldOperator
    | readonly ['head']
    | readonly ['tail']
    | readonly ['unique']
    | readonly ['range']
    | readonly ['max']
    | readonly ['min'];

export type UnaryFoldOperator =
    | readonly ['head']
    | readonly ['tail']
    | readonly ['unique']
    | readonly ['max']
    | readonly ['min']
    | readonly ['mean']
    | readonly ['sum'];

export type NumberFoldOperator = CommonFoldOperator | BinFoldOperator | readonly ['mean'] | readonly ['sum'];
export type StringFoldOperator = CommonFoldOperator;
export type BooleanFoldOperator = CommonFoldOperator | BinFoldOperator | readonly ['mean'] | readonly ['sum'];

export type FoldOperator<T extends CoronerValueType = CoronerValueType> = T extends string
    ? StringFoldOperator
    : T extends number
    ? NumberFoldOperator
    : T extends boolean
    ? BooleanFoldOperator
    : never;

export type Folds<
    A extends string = string,
    O extends readonly FoldOperator<CoronerValueType>[] = readonly FoldOperator<CoronerValueType>[]
> = Record<A, O>;

export interface FoldQueryRequest<F extends Folds = Folds, G extends readonly string[] = readonly string[]>
    extends QueryRequest {
    /**
     * Attribute to group on.
     * @example
     * request.group = ['a'];
     */
    group?: G;

    /**
     * Attributes to fold on.
     * @example
     * request.fold = {
     *     timestamp: [['head'], ['distribution', 3]],
     *     fingerprint: [['tail']]
     * };
     */
    fold?: F;
}

export type InferFoldQueryRequest<T> = T extends FoldQueryRequest<infer F, infer G> ? FoldQueryRequest<F, G> : never;

export function createFoldRequest<T extends FoldQueryRequest>(request: T): InferFoldQueryRequest<T> {
    return request as unknown as InferFoldQueryRequest<T>;
}
