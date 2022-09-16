import { QuerySource } from '../models/QuerySource';
import { OrderDirection } from '../requests';
import { SelectQueryRequest } from '../requests/select';
import { SelectQueryResponse } from '../responses/select';
import { CommonCoronerQuery } from './common';

export interface SelectCoronerQuery<R extends SelectQueryRequest = SelectQueryRequest<[]>> extends CommonCoronerQuery {
    /**
     * Returns the query as dynamic select. Use this to assign select attributes in runtime, without knowing the types.
     * @example
     * let query = query.select();
     * query = query.select('a');
     * query = query.select('b');
     */
    dynamicSelect(): SelectedCoronerQuery<SelectQueryRequest<string[]>>;

    /**
     * Adds provided attributes to the select request. You can add multiple attributes at once, or chain `select` calls.
     *
     * Request mutation: `request.select += [...attributes]`
     * @param attributes Attributes to select.
     * @example
     * query.select('a').select('b').select('c');
     * query.select('a', 'b', 'c');
     */
    select<A extends string[]>(...attributes: A): SelectedCoronerQuery<AddSelect<R, A>>;
}

export interface SelectedCoronerQuery<R extends SelectQueryRequest> extends SelectCoronerQuery<R> {
    /**
     * Adds order on attribute with direction specified.
     * @param attribute Attribute to order by.
     * @param direction Order direction. Attribute must be selected, else the query will fail.
     * @example
     * // This will order descending on attribute 'a', then ascending on attribute 'b'
     * query.select('a').select('b').order('a', 'descending').order('b', 'ascending')
     */
    order<A extends string>(attribute: A, direction: OrderDirection): SelectedCoronerQuery<R>;

    /**
     * Returns the built request.
     */
    json(): R;

    /**
     * Makes a POST call to Coroner with the built request.
     * @param source Where to make the request. If not specified, will supply data from default source.
     */
    post(source?: Partial<QuerySource>): Promise<SelectQueryResponse<R>>;
}

export type SelectOfRequest<R extends SelectQueryRequest> = NonNullable<R['select']>;

export type AddSelect<R extends SelectQueryRequest, A extends string[]> = R extends SelectQueryRequest<infer S>
    ? SelectQueryRequest<[...S, ...A]>
    : never;
