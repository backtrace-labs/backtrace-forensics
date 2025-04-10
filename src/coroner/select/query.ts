import { Result } from '@backtrace/utils';
import { QuerySource } from '../../models';
import { CommonCoronerQuery, OrderDirection } from '../common';
import { CoronerError } from '../common/errors';
import { SelectQueryRequest, SelectWildcard } from './requests';
import { SelectQueryResponse } from './responses';

export interface SelectCoronerQuery extends CommonCoronerQuery {
    /**
     * Returns this query as select coroner query.
     *
     * Useful if you want to start selecting dynamically.
     * @example
     * const selectQuery = query.select();
     */
    select(): SelectedCoronerQuery;

    /**
     * Adds provided attributes to the select request. You can add multiple attributes at once, or chain `select` calls.
     *
     * Request mutation: `request.select += [...attributes]`
     * @param attributes Attributes to select.
     * @example
     * query.select('a').select('b').select('c');
     * query.select('a', 'b', 'c');
     */
    select(...attributes: string[]): SelectedCoronerQuery;

    /**
     * Selects all available indexed attributes.
     *
     * Request mutation: `request.select_wildcard = { physical: true, virtual: true, derived: true }`
     * @example
     * query.selectAll();
     */
    selectAll(): SelectedCoronerQuery;

    /**
     * Selects all available indexed attributes, physical, virtual, derived, or a combination of these.
     *
     * Request mutation: `request.select_wildcard = options`
     * @param options Which attribute types to select.
     * @example
     * query.selectAll({ physical: true, virtual: false });
     */
    selectAll(options?: SelectWildcard): SelectedCoronerQuery;
}

export interface SelectedCoronerQuery extends SelectCoronerQuery {
    /**
     * Adds order on attribute with direction specified.
     * @param attribute Attribute to order by.
     * @param direction Order direction. Attribute must be selected, else the query will fail.
     * @example
     * // This will order descending on attribute 'a', then ascending on attribute 'b'
     * query.select('a').select('b').order('a', 'descending').order('b', 'ascending')
     */
    order(attribute: string, direction: OrderDirection): this;

    /**
     * Returns the built request.
     */
    json(): SelectQueryRequest;

    /**
     * Makes a POST call to Coroner with the built request.
     * @param source Where to make the request. If not specified, will supply data from default source.
     */
    post(source?: Partial<QuerySource>): Promise<Result<SelectQueryResponse, Error>>;
}
