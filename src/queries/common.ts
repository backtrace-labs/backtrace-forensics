import { AttributeList, AttributeType, AttributeValueType } from '../common/attributes';
import { FilterOperator, QueryAttributeFilter, QueryFilter, QueryRequest } from '../requests/common';
import { FoldCoronerQuery } from './fold';
import { SelectCoronerQuery } from './select';

export interface CommonCoronerQuery<AL extends AttributeList> {
    /**
     * Sets limit of rows in response.
     *
     * Request mutation: `request.limit = count`
     * @param count Maximum elements to receive in response.
     * @example
     * // set request.limit to 20
     * query.limit(20)
     */
    limit(count: number | null | undefined): this;

    /**
     * Sets how much rows to skip for response.
     *
     * Request mutation: `request.offset = count`
     * @param count How many elements to skip in response.
     * @example
     * // set query offset to 20
     * query.offset(20)
     */
    offset(count: number | null | undefined): this;

    /**
     * Sets template in request. May determine which attributes are returned.
     *
     * Request mutation: `request.template = template`
     * @param template Template to set.
     * @example
     * // set query template to "workflow"
     * query.template('workflow')
     */
    template(template: string): this;

    /**
     * Adds a filter to request.
     *
     * Request mutation: `request.filter[attribute] += [operator, value]`
     * @param attribute Attribute to filter on.
     * @param operator Operator to use. You can only use filters that match the value.
     * @param value Value to use in filter.
     * @example
     * // filter by attribute A and timestamp
     * query.filter('a', 'equal', 'xyz')
     *      .filter('timestamp', 'at-least', 1660000000)
     *      .filter('timestamp', 'at-most', 1660747935)
     */
    filter<A extends keyof AL, V extends AL[A][2]>(
        attribute: A,
        operator: FilterOperator<V>,
        value: AttributeValueType<V>
    ): this;
    filter<A extends string, V extends A extends keyof AL ? AL[A][2] : AttributeType>(
        attribute: A,
        operator: FilterOperator<V>,
        value: AttributeValueType<V>
    ): this;

    /**
     * Adds filters to request.
     * You can use this requests with `Filters` helper.
     *
     * Request mutation: `request.filter[attribute] += filters`
     * @param attribute Attribute to filter on.
     * @param filters Filters to add.
     * @example
     * // filter by timestamp
     * query.filter('timestamp', [['at-least', 1660000000], ['at-most', 1660747935]])
     *
     * // filter with Filters
     * query.filter('timestamp', Filters.time.from.last.hours(2).to.now())
     */
    filter<A extends keyof AL, V extends AL[A][2]>(attribute: A, filters: readonly QueryAttributeFilter<V>[]): this;
    filter<A extends string, V extends A extends keyof AL ? AL[A][2] : AttributeType>(
        attribute: A,
        filters: readonly QueryAttributeFilter<V>[]
    ): this;

    /**
     * Adds filters to request.
     * You can use this requests with `Filters` helper.
     *
     * Request mutation: `request.filter[attribute] += filters`
     * @param attribute Attribute to filter on.
     * @param filters Filters to add.
     * @example
     * // filter by timestamp
     * query.filter({ timestamp: [['at-least', 1660000000], ['at-most', 1660747935]] })
     *
     * // filter with Filters
     * query.filter({ timestamp: Filters.time.from.last.hours(2).to.now() })
     */
    filter<A extends keyof AL & string>(filters: QueryFilter<A>): this;
    filter<A extends string>(filters: QueryFilter<A>): this;

    /**
     * Sets the table name.
     *
     * Request mutation: `request.table = table`
     * @param name Table to use.
     * @example
     * // use 'metrics' table
     *
     * query.table('metrics')
     */
    table(name: string): this;

    /**
     * Returns the built request.
     */
    json(): QueryRequest;
}

export interface CoronerQuery<AL extends AttributeList>
    extends CommonCoronerQuery<AL>,
        SelectCoronerQuery<AL>,
        FoldCoronerQuery<AL> {}
