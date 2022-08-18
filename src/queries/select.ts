import { QuerySource } from '../models/QuerySource';
import { CoronerValueType } from '../requests/common';
import { SelectQueryRequest } from '../requests/select';
import { CoronerResponse } from '../responses/common';
import { SelectQueryResponse } from '../responses/select';
import { Attribute, CommonCoronerQuery, JoinAttributes } from './common';

export interface SelectCoronerQuery<T extends Attribute, S extends string[] = []> extends CommonCoronerQuery<T> {
    /**
     * Returns the query as dynamic select. Use this to assign select attributes in runtime, without knowing the types.
     * @example
     * let query = query.select();
     * query = query.select('a');
     * query = query.select('b');
     */
    select<A extends string>(): SelectedCoronerQuery<T, A[]>;

    /**
     * Adds provided attributes to the select request. You can add multiple attributes at once, or chain `select` calls.
     *
     * Request mutation: `request.select += [...attributes]`
     * @param attributes Attributes to select.
     * @example
     * query.select('a').select('b').select('c');
     * query.select('a', 'b', 'c');
     */
    select<V extends CoronerValueType, A extends string>(
        ...attributes: A[]
    ): SelectedCoronerQuery<JoinAttributes<T, A, V>, [...S, A]>;
}

export interface SelectedCoronerQuery<T extends Attribute, S extends string[] = []> extends SelectCoronerQuery<T, S> {
    /**
     * Returns the built request.
     */
    getRequest(): SelectQueryRequest<T, S>;

    /**
     * Makes a POST call to Coroner with the built request.
     * @param source Where to make the request. If not specified, will supply data from default source.
     */
    getResponse(source?: Partial<QuerySource>): Promise<CoronerResponse<SelectQueryResponse<T, S>>>;
}
