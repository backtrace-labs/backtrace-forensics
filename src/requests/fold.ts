import { CoronerValueType, OrderDirection, QueryRequest } from './common';

export type DistributionFoldOperator = readonly ['distribution', number];
export type BinFoldOperator = readonly ['bin', ...number[]];
export type CommonFoldOperator =
    | DistributionFoldOperator
    | readonly ['head']
    | readonly ['tail']
    | readonly ['unique']
    | readonly ['range']
    | readonly ['max']
    | readonly ['min']
    | readonly ['histogram'];

export type UnaryFoldOperator =
    | readonly ['head']
    | readonly ['tail']
    | readonly ['unique']
    | readonly ['max']
    | readonly ['min']
    | readonly ['mean']
    | readonly ['sum']
    | readonly ['histogram'];

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

export type FoldOrder<A extends string = string, I extends number = number> = {
    /**
     * Name and index of attribute to order by.
     * Name defines the attribute name. Index defines the index of fold that was made on the attribute.
     */
    name: `${A};${I}`;
    ordering: OrderDirection;
};

export type CountFoldOrder = {
    name: `;count`;
    ordering: OrderDirection;
};

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

    /**
     * Attributes to order on.
     * @example
     * request.order = [{
     *     name: 'timestamp;0',
     *     ordering: 'descending'
     * }, {
     *     name: ';count',
     *     ordering: 'ascending'
     * }]
     */
    order?: readonly (FoldOrder | CountFoldOrder)[];
}

export type InferFoldQueryRequest<T> = T extends FoldQueryRequest<infer F, infer G> ? FoldQueryRequest<F, G> : never;

export type GetRequestFold<R extends FoldQueryRequest> = R extends FoldQueryRequest<infer F, infer _> ? F : never;
export type GetRequestGroup<R extends FoldQueryRequest> = R extends FoldQueryRequest<infer _, infer G> ? G : never;

export function createFoldRequest<T extends FoldQueryRequest>(request: T): InferFoldQueryRequest<T> {
    return request as unknown as InferFoldQueryRequest<T>;
}

export function isFoldRequest(request: QueryRequest): boolean {
    return 'fold' in request || 'group' in request;
}
