import { QuerySource } from '../models/QuerySource';
import { SelectQueryRequest } from '../requests/select';
import { CoronerResponse } from '../responses/common';
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
     * Returns the built request.
     */
    getRequest(): R;

    /**
     * Makes a POST call to Coroner with the built request.
     * @param source Where to make the request. If not specified, will supply data from default source.
     */
    getResponse(source?: Partial<QuerySource>): Promise<CoronerResponse<SelectQueryResponse<R>>>;
}

export type AddSelect<R extends SelectQueryRequest, S extends string[]> = SelectQueryRequest<
    [...NonNullable<R['select']>, ...S]
>;
