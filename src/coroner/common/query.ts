import { QuerySource } from '../../models';
import { FoldCoronerQuery } from '../fold';
import { SelectCoronerQuery } from '../select';
import { AttributeType, AttributeValueType } from './attributes';
import { FilterOperator, QueryAttributeFilter, QueryFilter, QueryRequest } from './requests';
import { QueryResponse } from './responses';

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
    filter<V extends AttributeType>(attribute: string, operator: FilterOperator<V>, value: AttributeValueType<V>): this;

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
    filter(attribute: string, filters: readonly QueryAttributeFilter[]): this;

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
    filter(...filters: QueryFilter[]): this;

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

    /**
     * Makes a POST call to Coroner with the built request.
     * @param source Where to make the request. If not specified, will supply data from default source.
     * @example
     * const response = await query.post();
     * if (!response.error) {
     *     // use the response
     * }
     */
    post(source?: Partial<QuerySource>): Promise<QueryResponse>;
}

export interface CoronerQuery extends CommonCoronerQuery, SelectCoronerQuery, FoldCoronerQuery {}
