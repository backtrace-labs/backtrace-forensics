import { CoronerValueType } from '../requests/common';
import { SelectQueryRequest } from '../requests/select';
import { CoronerResponse } from '../responses/common';
import { SelectQueryResponse } from '../responses/select';
import { Attribute, CommonCoronerQuery, JoinAttributes } from './common';
export interface SelectCoronerQuery<T extends Attribute, S extends string[] = []> extends CommonCoronerQuery<T> {
    select<A extends string>(): SelectedCoronerQuery<T, A[]>;
    select<V extends CoronerValueType, A extends string>(
        attribute: A
    ): SelectedCoronerQuery<JoinAttributes<T, A, V>, [...S, A]>;
}

export interface SelectedCoronerQuery<T extends Attribute, S extends string[] = []> extends SelectCoronerQuery<T, S> {
    getRequest(): SelectQueryRequest<T, S>;
    getResponse(): Promise<CoronerResponse<SelectQueryResponse<T, S>>>;
}

export interface SelectedCoronerQueryResponseProvider {
    getResponse<Q extends SelectedCoronerQuery<never, never>>(
        query: Q
    ): Promise<Q extends SelectedCoronerQuery<infer T, infer S> ? CoronerResponse<SelectQueryResponse<T, S>> : never>;
}
