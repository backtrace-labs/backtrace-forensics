import {
    AttributeType,
    AttributeValueType,
    BooleanType,
    DictionaryType,
    StringType,
    UIntType,
    UUIDType,
} from '../common/attributes';
import { OrderDirection, QueryRequest } from './common';

export type DistributionFoldOperator = readonly ['distribution', number];
export type BinFoldOperator = readonly ['bin', ...number[]];

export type UIntFoldOperator =
    | DistributionFoldOperator
    | BinFoldOperator
    | readonly ['histogram']
    | readonly ['head']
    | readonly ['max']
    | readonly ['mean']
    | readonly ['min']
    | readonly ['range']
    | readonly ['sum']
    | readonly ['tail']
    | readonly ['unique'];

export type BooleanFoldOperator = UIntFoldOperator;
export type UUIDFoldOperator = UIntFoldOperator;
export type StringFoldOperator =
    | DistributionFoldOperator
    | readonly ['head']
    | readonly ['histogram']
    | readonly ['max']
    | readonly ['min']
    | readonly ['range']
    | readonly ['tail']
    | readonly ['unique'];
export type DictionaryFoldOperator = StringFoldOperator;

export type FoldFilterParamOperator = '==' | '!=' | '<' | '>' | '>=' | '<=';

export type FoldOperator<T extends AttributeType = AttributeType> = T extends StringType
    ? StringFoldOperator
    : T extends UIntType
    ? UIntFoldOperator
    : T extends BooleanType
    ? BooleanFoldOperator
    : T extends DictionaryType
    ? DictionaryFoldOperator
    : T extends UUIDType
    ? UUIDFoldOperator
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

export type FoldParamFilter = {
    op: FoldFilterParamOperator;
    params: [AttributeValueType];
    property: [`${string};${number};${number}`];
};

export type FoldBooleanFilter = {
    op: 'boolean';
    params: ['and'];
};

export type FoldFilter = FoldParamFilter | FoldBooleanFilter;

export type GroupFoldOrder = {
    name: `;group`;
    ordering: OrderDirection;
};

export type Folds<A extends string = string, O extends readonly FoldOperator[] = readonly FoldOperator[]> = Record<
    A,
    O
>;

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
     * }, {
     *     name: ';group',
     *     ordering: 'ascending'
     * }]
     */
    order?: readonly (FoldOrder | CountFoldOrder | GroupFoldOrder)[];

    /**
     * Post-aggregation filters.
     * @example
     * request.having = [{
     *     params: ['value'],
     *     op: '>=',
     *     property: ['attribute;0;0']
     * }]
     */
    having?: readonly FoldFilter[];
}

export type InferFoldQueryRequest<T> = T extends FoldQueryRequest<infer F, infer G> ? FoldQueryRequest<F, G> : never;

export type GetRequestFold<R extends FoldQueryRequest> = R extends FoldQueryRequest<infer F, infer _> ? F : never;
export type GetRequestGroup<R extends FoldQueryRequest> = R extends FoldQueryRequest<infer _, infer G> ? G : never;

export function createFoldRequest<T extends FoldQueryRequest>(request: T): InferFoldQueryRequest<T> {
    return request as unknown as InferFoldQueryRequest<T>;
}

export function isFoldRequest(request: QueryRequest): boolean {
    return request && ('fold' in request || 'group' in request);
}
