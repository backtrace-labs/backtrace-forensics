import {
    AttributeList,
    AttributeListFromArray,
    AttributeType,
    AttributeValueType,
    ExtendAttributeList,
} from '../common/attributes';
import { QuerySource } from '../models/QuerySource';
import { OrderDirection, QueryRequest } from '../requests';
import {
    BackingColumnFoldVirtualColumn,
    BackingColumnFoldVirtualColumnTypes,
    FoldFilterParamOperator,
    FoldOperator,
    FoldQueryRequest,
    Folds,
    FoldVirtualColumn,
    FoldVirtualColumnType,
    GetRequestFold,
} from '../requests/fold';
import { FoldQueryResponse } from '../responses/fold';
import { CommonCoronerQuery } from './common';

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

export type FoldFilterIndexInput<O extends FoldOperator, I extends number> = O extends FoldOperator<infer T>
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

export type FoldFilterValueIndex<O extends FoldOperator> = O[0] extends 'distribution'
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

export interface FoldCoronerQuery<
    AL extends AttributeList = AttributeList,
    R extends FoldQueryRequest = FoldQueryRequest<never, ['*'], []>
> extends CommonCoronerQuery<AL, R> {
    /**
     * Returns the query as dynamic fold. Use this to assign folds in runtime, without knowing the types.
     *
     * @example
     * let query = query.fold()
     * query = query.fold('fingerprint', 'head');
     * query = query.fold('timestamp', 'tail');
     */
    dynamicFold(): DynamicFoldedCoronerQuery<AL>;

    /**
     * Adds provided fold to the request.
     *
     * Request mutation: `request.fold[attribute] += [...fold]`
     * @param attribute Attribute to fold on.
     * @param fold Fold to use. Number of arguments may vary on used fold.
     * @example
     * query.fold('fingerprint', 'head')
     *      .fold('fingerprint', 'tail')
     *      .fold('timestamp', 'distribution', 3)
     */
    fold<
        A extends keyof AttributeListWithVirtualColumns<AL, R> & string,
        V extends AttributeListWithVirtualColumns<AL, R>[A][2],
        O extends FoldOperator<V>
    >(
        attribute: A,
        ...fold: O
    ): FoldedCoronerQuery<AL, AddFold<R, A, O>>;
    fold<A extends string, V extends AttributeListWithVirtualColumns<AL, R>[A][2], O extends FoldOperator<V>>(
        attribute: A,
        ...fold: O
    ): FoldedCoronerQuery<AL, AddFold<R, A, O>>;
    fold<A extends string, V extends AttributeType, O extends FoldOperator<V>>(
        attribute: A,
        ...fold: O
    ): FoldedCoronerQuery<AL, AddFold<R, A, O>>;

    /**
     * Sets the request group-by attribute. The attribute grouped by will be visible as `groupKey` in simple response.
     *
     * Request mutation: `request.group = [attribute]`
     * @param attribute Attribute to group by.
     * @example
     * query.group('fingerprint')
     */
    group<A extends keyof AttributeListWithVirtualColumns<AL, R> & string>(
        attribute: A
    ): FoldedCoronerQuery<AL, SetFoldGroup<R, A>>;
    group<A extends string>(attribute: A): FoldedCoronerQuery<AL, SetFoldGroup<R, A>>;

    /**
     * Adds a virtual column. The virtual column can be then filtered,
     *
     * Request mutation: `request.virtual_columns += { name, type, [type]: params }`
     * @param name Name of the virtual column.
     * @param type Type of the virtual column.
     * @param params Params for the specified type.
     * @example
     * // Adds a virtual column with name 'a'
     * query.virtualColumn('a', 'quantized_uint', { backing_column: 'timestamp', size: 3600, offset: 86400 })
     */
    virtualColumn<
        A extends string,
        T extends FoldVirtualColumnType,
        BC extends keyof AttributeListWithVirtualColumns<AL, R> & string,
        FVC extends BackingColumnFoldVirtualColumn<A, T, BC>
    >(
        name: A,
        type: T,
        params: BackingColumnFoldVirtualColumnTypes<A, BC>[T][1]
    ): FoldedCoronerQuery<AL, AddVirtualColumn<R, FVC>>;
    virtualColumn<
        A extends string,
        T extends FoldVirtualColumnType,
        BC extends string,
        FVC extends BackingColumnFoldVirtualColumn<A, T, BC>
    >(
        name: A,
        type: T,
        params: BackingColumnFoldVirtualColumnTypes<A, BC>[T][1]
    ): FoldedCoronerQuery<AL, AddVirtualColumn<R, FVC>>;
}

export interface FoldedCoronerQuery<
    AL extends AttributeList = AttributeList,
    R extends FoldQueryRequest = FoldQueryRequest<never, ['*'], []>
> extends FoldCoronerQuery<AL, R> {
    /**
     * Adds order on attribute fold with index and direction specified.
     * @param attribute Attribute to order by.
     * @param direction Order direction.
     * @param index Index of fold to fold upon.
     * Index must be less than number of folds made on this attribute, else the query will fail.
     * @example
     * // This will order descending on attribute 'a', fold 'head', then ascending on attribute 'a', fold 'tail'
     * query.fold('a', 'head').fold('a', 'tail').order('a', 'descending', 0).order('a', 'ascending', 1)
     */
    order<F extends GetRequestFold<R>, A extends keyof F & string, I extends number>(
        attribute: A,
        direction: OrderDirection,
        index: I
    ): FoldedCoronerQuery<AL, R>;

    /**
     * Adds order on attribute fold with direction specified.
     * @param attribute Attribute to order by.
     * @param direction Order direction.
     * @param fold Fold to order by. Number of arguments may vary on used fold.
     * Attribute must be folded on this fold, else the query will fail.
     * @example
     * // This will order descending on attribute 'a', fold 'head', then ascending on attribute 'a', fold 'tail'
     * query.fold('a', 'head').fold('a', 'tail').order('a', 'descending', 'head').order('a', 'ascending', 'tail')
     */
    order<F extends GetRequestFold<R>, A extends keyof F & string, O extends F[A][number]>(
        attribute: A,
        direction: OrderDirection,
        ...fold: O
    ): FoldedCoronerQuery<AL, R>;

    /**
     * Adds order on count with direction specified.
     * @param direction Order direction.
     * @example
     * // This will order descending on count
     * query.fold('a', 'head').fold('a', 'tail').orderByCount('descending')
     */
    orderByCount(direction: OrderDirection): FoldedCoronerQuery<AL, R>;

    /**
     * Adds a post-aggregation filter on params specified.
     * @param attribute Attribute to add filter on.
     * @param index Index of fold to filter on.
     * @param operator Operator to use.
     * @param value Value to filter by.
     * @example
     * // Filters on 'head' fold
     * query.fold('a', 'head').having('a', 0, 'less-than', 123)
     *
     * // Filters on 'range' fold
     * query.fold('a', 'head').fold('a', 'range').having('b', 1, 'less-than', { from: 123 })
     */
    having<
        F extends GetRequestFold<R>,
        A extends keyof AL & string,
        O extends FoldFilterOperatorInput,
        I extends number
    >(
        attribute: A,
        index: I,
        operator: O,
        value: FoldFilterInput<F[A][I]>
    ): FoldedCoronerQuery<AL, R>;

    /**
     * Adds a post-aggregation filter on params specified.
     * @param attribute Attribute to add filter on.
     * @param index Index of fold to filter on.
     * @param operator Operator to use.
     * @param value Value to filter by.
     * @example
     * // Filters on 'head' fold
     * query.fold('a', 'head').having('a', 0, 'less-than', 123)
     *
     * // Filters on 'range' fold
     * query.fold('a', 'head').fold('a', 'range').having('b', 1, 'less-than', { from: 123 })
     */
    having<
        F extends GetRequestFold<R>,
        A extends keyof F & string,
        O extends FoldFilterOperatorInput,
        I extends number
    >(
        attribute: A,
        index: I,
        operator: O,
        value: FoldFilterInput<F[A][I]>
    ): FoldedCoronerQuery<AL, R>;

    /**
     * Adds a post-aggregation filter on params specified.
     * @param attribute Attribute to add filter on.
     * @param fold Fold to filter on.
     * @param operator Operator to use.
     * @param value Value to filter by.
     * @example
     * // Filters on 'head' fold
     * query.fold('a', 'head').having('a', ['head'], 'less-than', 123)
     *
     * // Filters on 'distribution, 3' fold
     * query.fold('a', 'distribution', 3).having('a', ['distribution', 3], 'less-than', { keys: 123 })
     */
    having<
        F extends GetRequestFold<R>,
        A extends keyof AL & string,
        O extends FoldFilterOperatorInput,
        FF extends F[A][number] & [SupportedFoldFilterFolds, ...unknown[]]
    >(
        attribute: A,
        fold: FF,
        operator: O,
        value: FoldFilterInput<FF>
    ): FoldedCoronerQuery<AL, R>;

    /**
     * Adds a post-aggregation filter on params specified.
     * @param attribute Attribute to add filter on.
     * @param fold Fold to filter on.
     * @param operator Operator to use.
     * @param value Value to filter by.
     * @example
     * // Filters on 'head' fold
     * query.fold('a', 'head').having('a', ['head'], 'less-than', 123)
     *
     * // Filters on 'distribution, 3' fold
     * query.fold('a', 'distribution', 3).having('a', ['distribution', 3], 'less-than', { keys: 123 })
     */
    having<
        F extends GetRequestFold<R>,
        A extends keyof F & string,
        O extends FoldFilterOperatorInput,
        FF extends F[A][number] & [SupportedFoldFilterFolds, ...unknown[]]
    >(
        attribute: A,
        fold: FF,
        operator: O,
        value: FoldFilterInput<FF>
    ): FoldedCoronerQuery<AL, R>;

    /**
     * Adds a post-aggregation filter on params specified.
     * @param attribute Attribute to add filter on.
     * @param index Index of fold to filter on.
     * @param operator Operator to use.
     * @param valueIndex Index of value to filter on. For example, to filter by range "to" value, use index 1.
     * @param value Value to filter by.
     * @example
     * // Filters on 'head' fold
     * query.fold('a', 'head').having('a', 0, 'less-than', 0, 123)
     *
     * // Filters on 'range' fold, value 'from'
     * query.fold('a', 'range').having('a', 0, 'less-than', 0, 123)
     *
     * // Filters on 'range' fold, value 'to'
     * query.fold('a', 'range').having('a', 0, 'less-than', 1, 123)
     */
    having<
        F extends GetRequestFold<R>,
        A extends keyof AL & string,
        O extends FoldFilterOperatorInput,
        I extends number,
        VI extends FoldFilterValueIndex<F[A][I]>
    >(
        attribute: A,
        index: I,
        operator: O,
        valueIndex: VI,
        value: FoldFilterIndexInput<F[A][I], VI>
    ): FoldedCoronerQuery<AL, R>;

    /**
     * Adds a post-aggregation filter on params specified.
     * @param attribute Attribute to add filter on.
     * @param index Index of fold to filter on.
     * @param operator Operator to use.
     * @param valueIndex Index of value to filter on. For example, to filter by range "to" value, use index 1.
     * @param value Value to filter by.
     * @example
     * // Filters on 'head' fold
     * query.fold('a', 'head').having('a', 0, 'less-than', 0, 123)
     *
     * // Filters on 'range' fold, value 'from'
     * query.fold('a', 'range').having('a', 0, 'less-than', 0, 123)
     *
     * // Filters on 'range' fold, value 'to'
     * query.fold('a', 'range').having('a', 0, 'less-than', 1, 123)
     */
    having<
        F extends GetRequestFold<R>,
        A extends keyof F & string,
        O extends FoldFilterOperatorInput,
        I extends number,
        VI extends FoldFilterValueIndex<F[A][I]>
    >(
        attribute: A,
        index: I,
        operator: O,
        valueIndex: VI,
        value: FoldFilterIndexInput<F[A][I], VI>
    ): FoldedCoronerQuery<AL, R>;

    /**
     * Adds a post-aggregation filter on params specified.
     * @param attribute Attribute to add filter on.
     * @param fold Fold to filter on.
     * @param operator Operator to use.
     * @param valueIndex Index of value to filter on. For example, to filter by range "to" value, use index 1.
     * @param value Value to filter by.
     * @example
     * // Filters on 'head' fold
     * query.fold('a', 'head').having('a', ['head'], 'less-than', 0, 123)
     *
     * // Filters on 'range' fold, value 'from'
     * query.fold('a', 'range').having('a', ['range'], 'less-than', 0, 123)
     *
     * // Filters on 'range' fold, value 'to'
     * query.fold('a', 'range').having('a', ['range'], 'less-than', 1, 123)
     */
    having<
        F extends GetRequestFold<R>,
        A extends keyof AL & string,
        O extends FoldFilterOperatorInput,
        FF extends F[A][number] & [SupportedFoldFilterFolds, ...unknown[]],
        VI extends FoldFilterValueIndex<FF>
    >(
        attribute: A,
        fold: FF,
        operator: O,
        valueIndex: VI,
        value: FoldFilterInput<FF>
    ): FoldedCoronerQuery<AL, R>;

    /**
     * Adds a post-aggregation filter on params specified.
     * @param attribute Attribute to add filter on.
     * @param fold Fold to filter on.
     * @param operator Operator to use.
     * @param valueIndex Index of value to filter on. For example, to filter by range "to" value, use index 1.
     * @param value Value to filter by.
     * @example
     * // Filters on 'head' fold
     * query.fold('a', 'head').having('a', ['head'], 'less-than', 0, 123)
     *
     * // Filters on 'range' fold, value 'from'
     * query.fold('a', 'range').having('a', ['range'], 'less-than', 0, 123)
     *
     * // Filters on 'range' fold, value 'to'
     * query.fold('a', 'range').having('a', ['range'], 'less-than', 1, 123)
     */
    having<
        F extends GetRequestFold<R>,
        A extends keyof F & string,
        O extends FoldFilterOperatorInput,
        FF extends F[A][number] & [SupportedFoldFilterFolds, ...unknown[]],
        VI extends FoldFilterValueIndex<FF>
    >(
        attribute: A,
        fold: FF,
        operator: O,
        valueIndex: VI,
        value: FoldFilterInput<FF>
    ): FoldedCoronerQuery<AL, R>;

    /**
     * Adds order on group with direction specified.
     * @param direction Order direction.
     * @example
     * // This will order descending on group
     * query.fold('a', 'head').fold('a', 'tail').groupBy('fingerprint').orderByGroup('descending')
     */
    orderByGroup(direction: OrderDirection): FoldedCoronerQuery<AL, R>;

    /**
     * Returns the built request.
     */
    json(): R;

    /**
     * Makes a POST call to Coroner with the built request. You need to make at least a single fold or group.
     * @param source Where to make the request. If not specified, will supply data from default source.
     * @example
     * const response = await query.filter('fingerprint', '...').fold('a', 'head').group('b').post();
     * if (!response.error) {
     *     const row = response.response.first();
     *     const a = row.attributes.a.head;
     *     const b = row.attributes.b.groupKey;
     * }
     */
    post(source?: Partial<QuerySource>): Promise<FoldQueryResponse<R, this>>;
}

export type AddFold<R extends FoldQueryRequest, A extends string, O extends FoldOperator> = R extends FoldQueryRequest<
    infer F,
    infer G,
    infer VC
>
    ? [F] extends [never]
        ? FoldQueryRequest<Folds<A, readonly [O]>, G, VC>
        : A extends keyof F
        ? FoldQueryRequest<Omit<F, A> & Folds<A, [...F[A], O]>, G, VC>
        : FoldQueryRequest<F & Folds<A, readonly [O]>, G, VC>
    : never;

export type AddVirtualColumn<R extends FoldQueryRequest, NVC extends FoldVirtualColumn> = R extends FoldQueryRequest<
    infer F,
    infer G,
    infer VC
>
    ? FoldQueryRequest<F, G, [...VC, NVC]>
    : never;

export type SetFoldGroup<R extends FoldQueryRequest, A extends string> = R extends FoldQueryRequest<
    infer F,
    infer _,
    infer VC
>
    ? FoldQueryRequest<F, [A], VC>
    : never;

export type FoldOfRequest<R extends FoldQueryRequest> = NonNullable<R['fold']>;

export type DefaultGroup = '*';

export type DynamicFoldedCoronerQuery<AL extends AttributeList = AttributeList> = FoldedCoronerQuery<
    AL,
    FoldQueryRequest<Folds>
>;

export type AttributeListWithVirtualColumns<
    AL extends AttributeList,
    R extends QueryRequest
> = R extends FoldQueryRequest<infer _, infer __, infer VC>
    ? ExtendAttributeList<
          AL,
          AttributeListFromArray<{
              [I in keyof VC]: [
                  VC[I]['name'],
                  VC[I] extends BackingColumnFoldVirtualColumn<infer ___, infer ____, infer BC>
                      ? BC extends keyof AL
                          ? AL[BC][1]
                          : 'none'
                      : 'none',
                  'uint64'
              ];
          }>
      >
    : AL;
