import { CoronerValueType, FilterOperator, QueryRequest } from '../requests/common';
import { FoldCoronerQuery } from './fold';
import { SelectCoronerQuery } from './select';

export interface CommonCoronerQuery<T extends Attribute> {
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
     * Adds or sets a filter in request.
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
    filter<A extends keyof T & string, V extends QueryObjectValue<T, A>>(
        attribute: A,
        operator: FilterOperator<V>,
        value: V
    ): this;

    /**
     * Returns the built request.
     */
    getRequest(): QueryRequest;
}

export interface CoronerQuery<T extends Attribute>
    extends CommonCoronerQuery<T>,
        SelectCoronerQuery<T>,
        FoldCoronerQuery<T> {}

export type Attribute<A extends string = string, V extends CoronerValueType = CoronerValueType> = {
    [key in A]: V;
};

export type JoinAttributes<
    T extends Attribute<string, CoronerValueType>,
    A extends string,
    V extends CoronerValueType
> = [T] extends [never] ? Attribute<A, V> : T & Attribute<A, V>;

export type QueryObjectKey<T extends Attribute> = [T] extends [never] ? string : keyof T & string;

export type QueryObjectValue<T extends Attribute, A extends string> = CoronerValueType;
