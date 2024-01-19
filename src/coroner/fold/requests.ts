import { OrderDirection, QueryRequest } from '../common';
import {
    AttributeType,
    AttributeValueType,
    BooleanType,
    DictionaryType,
    StringType,
    UIntType,
    UUIDType,
} from '../common/attributes';

export type QuantizeUintFoldVirtualColumn<A extends string = string, BC extends string = string> = {
    name: A;
    type: 'quantize_uint';
    quantize_uint: {
        backing_column: BC;
        size: number;
        offset: number;
    };
};

export type TruncateTimestampFoldVirtualColumn<A extends string = string, BC extends string = string> = {
    name: A;
    type: 'truncate_timestamp';
    truncate_timestamp: {
        backing_column: BC;
        granularity: 'day' | 'month' | 'quarter' | 'year';
    };
};

export type BackingColumnFoldVirtualColumnTypes<A extends string = string, BC extends string = string> = {
    quantize_uint: [QuantizeUintFoldVirtualColumn<A, BC>, QuantizeUintFoldVirtualColumn<A, BC>['quantize_uint']];
    truncate_timestamp: [
        TruncateTimestampFoldVirtualColumn<A, BC>,
        TruncateTimestampFoldVirtualColumn<A, BC>['truncate_timestamp'],
    ];
};

export type FoldVirtualColumnTypes<A extends string = string> = BackingColumnFoldVirtualColumnTypes<A>;

export type FoldVirtualColumnType = keyof BackingColumnFoldVirtualColumnTypes<string>;

export type BackingColumnFoldVirtualColumn<
    A extends string = string,
    T extends FoldVirtualColumnType = FoldVirtualColumnType,
    BC extends string = string,
> = BackingColumnFoldVirtualColumnTypes<A, BC>[T][0];

export type FoldVirtualColumn<
    A extends string = string,
    T extends FoldVirtualColumnType = FoldVirtualColumnType,
> = BackingColumnFoldVirtualColumn<A, T>;

export type DistributionFoldOperator = readonly ['distribution', number?];
export type BinFoldOperator = readonly ['bin', ...number[]];

export type UIntFoldOperator =
    | DistributionFoldOperator
    | BinFoldOperator
    | readonly ['histogram']
    | readonly ['head']
    | readonly ['first']
    | readonly ['max']
    | readonly ['mean']
    | readonly ['min']
    | readonly ['range']
    | readonly ['sum']
    | readonly ['tail']
    | readonly ['last']
    | readonly ['unique']
    | readonly ['object'];

export type BooleanFoldOperator = UIntFoldOperator;
export type UUIDFoldOperator = UIntFoldOperator;
export type StringFoldOperator =
    | DistributionFoldOperator
    | readonly ['head']
    | readonly ['first']
    | readonly ['histogram']
    | readonly ['max']
    | readonly ['min']
    | readonly ['range']
    | readonly ['tail']
    | readonly ['last']
    | readonly ['unique']
    | readonly ['object'];

export type DictionaryFoldOperator = StringFoldOperator;

export type FoldFilterParamOperator = '==' | '!=' | '<' | '>' | '>=' | '<=';

export type DefaultGroup = '*';

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

export type FoldCountFilter = {
    op: FoldFilterParamOperator;
    params: [AttributeValueType<UIntType>];
    property: [';count'];
};

export type FoldFilter = FoldParamFilter | FoldBooleanFilter | FoldCountFilter;

export type GroupFoldOrder = {
    name: `;group`;
    ordering: OrderDirection;
};

export type Folds = Record<string, readonly FoldOperator[]>;

export interface FoldQueryRequest extends QueryRequest {
    /**
     * Attribute to group on.
     * @example
     * request.group = ['a'];
     */
    group?: readonly string[];

    /**
     * Attributes to fold on.
     * @example
     * request.fold = {
     *     timestamp: [['head'], ['distribution', 3]],
     *     fingerprint: [['tail']]
     * };
     */
    fold?: Folds;

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
     * Virtual columns to use.
     * @example
     * request.virtual_columns = [{
     *     name: 'a',
     *     type: 'quantize_uint',
     *     quantize_uint: {
     *         ...
     *     }
     * }]
     */
    virtual_columns?: readonly FoldVirtualColumn[];

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

export function isFoldRequest(request: QueryRequest): boolean {
    return request && ('fold' in request || 'group' in request);
}
