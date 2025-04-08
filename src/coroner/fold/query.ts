import { Result } from '@backtrace/utils';
import { QuerySource } from '../../models/QuerySource';
import { CommonCoronerQuery, OrderDirection } from '../common';
import { AttributeValueType } from '../common/attributes';
import { CoronerError } from '../common/errors';
import { FoldFilterInput, FoldFilterOperatorInput, FoldFilterValueIndex, SupportedFoldFilterFolds } from './inputs';
import { BackingColumnFoldVirtualColumnTypes, FoldOperator, FoldQueryRequest, FoldVirtualColumnType } from './requests';
import { FoldQueryResponse } from './responses';

export interface FoldCoronerQuery extends CommonCoronerQuery {
    /**
     * Returns this query as fold coroner query.
     *
     * Useful if you want to start folding dynamically.
     * @example
     * const foldQuery = query.fold();
     */
    fold(): FoldedCoronerQuery;

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
    fold(attribute: string, ...fold: FoldOperator): FoldedCoronerQuery;

    /**
     * Sets the request group-by attribute. The attribute grouped by will be visible as `groupKey` in simple response.
     *
     * Request mutation: `request.group = [attribute]`
     * @param attribute Attribute to group by.
     * @example
     * query.group('fingerprint')
     */
    group(attribute: string): FoldedCoronerQuery;

    /**
     * Adds a virtual column. The virtual column behaves like any other column.
     *
     * Request mutation: `request.virtual_columns += { name, type, [type]: params }`
     * @param name Name of the virtual column.
     * @param type Type of the virtual column.
     * @param params Params for the specified type.
     * @example
     * // Adds a virtual column with name 'a'
     * query.virtualColumn('a', 'quantized_uint', { backing_column: 'timestamp', size: 3600, offset: 86400 })
     */
    virtualColumn<A extends string, T extends FoldVirtualColumnType, BC extends string>(
        name: A,
        type: T,
        params: BackingColumnFoldVirtualColumnTypes<A, BC>[T][1],
    ): FoldedCoronerQuery;
}

export interface FoldedCoronerQuery extends FoldCoronerQuery {
    /**
     * Removes all previously added matching folds in request.
     *
     * @param attribute Attribute to remove fold from.
     * @param fold Folds to remove.
     * @example
     * // Adds and removes fold
     * query.fold('a', 'head').removeFold('a', 'head')
     */
    removeFold(attribute: string, ...fold: Partial<FoldOperator>): this;

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
    order(attribute: string, direction: OrderDirection, index: number): this;

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
    order(attribute: string, direction: OrderDirection, ...fold: FoldOperator): this;

    /**
     * Adds order on count with direction specified.
     * @param direction Order direction.
     * @example
     * // This will order descending on count
     * query.fold('a', 'head').fold('a', 'tail').orderByCount('descending')
     */
    orderByCount(direction: OrderDirection): this;

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
    having(attribute: string, index: number, operator: FoldFilterOperatorInput, value: FoldFilterInput): this;

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
    having<FF extends FoldOperator & [SupportedFoldFilterFolds, ...unknown[]]>(
        attribute: string,
        fold: FF,
        operator: FoldFilterOperatorInput,
        value: FoldFilterInput<FF>,
    ): this;

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
    having(
        attribute: string,
        index: number,
        operator: FoldFilterOperatorInput,
        valueIndex: number,
        value: AttributeValueType,
    ): this;

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
    having<FF extends FoldOperator & [SupportedFoldFilterFolds, ...unknown[]]>(
        attribute: string,
        fold: FF,
        operator: FoldFilterOperatorInput,
        valueIndex: FoldFilterValueIndex<FF>,
        value: FoldFilterInput<FF>,
    ): this;

    /**
     * Adds a post-aggregation filter on count.
     * @param operator Operator to use.
     * @param value Value to filter by.
     * @example
     * // Filters on 'count'
     * query.havingCount('greater-than', 10)
     */
    havingCount<O extends FoldFilterOperatorInput>(operator: O, value: number): this;

    /**
     * Adds order on group with direction specified.
     * @param direction Order direction.
     * @example
     * // This will order descending on group
     * query.fold('a', 'head').fold('a', 'tail').groupBy('fingerprint').orderByGroup('descending')
     */
    orderByGroup(direction: OrderDirection): this;

    /**
     * Returns the built request.
     */
    json(): FoldQueryRequest;

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
    post(source?: Partial<QuerySource>): Promise<Result<FoldQueryResponse, CoronerError>>;
}
