import { FilterOperator, InputValueType, QueryAttributeFilter, QueryRequest } from '../requests/common';
import { FoldCoronerQuery } from './fold';
import { SelectCoronerQuery } from './select';

export interface CommonCoronerQuery {
    /**
     * Sets limit of rows in response.
     *
     * Request mutation: `request.limit = count`
     * @param count Maximum elements to receive in response.
     * @example
     * // set request.limit to 20
     * query.limit(20)
     */
    limit(count: number): this;

    /**
     * Sets how much rows to skip for response.
     *
     * Request mutation: `request.offset = count`
     * @param count How many elements to skip in response.
     * @example
     * // set query offset to 20
     * query.offset(20)
     */
    offset(count: number): this;

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
    filter<A extends string, V extends InputValueType>(attribute: A, operator: FilterOperator<V>, value: V): this;

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
    filter<A extends string>(attribute: A, filters: readonly QueryAttributeFilter[]): this;

    /**
     * Returns the built request.
     */
    json(): QueryRequest;
}

export interface CoronerQuery extends CommonCoronerQuery, SelectCoronerQuery, FoldCoronerQuery {}
