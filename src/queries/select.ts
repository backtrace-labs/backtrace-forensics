import { QuerySource } from '../models/QuerySource';
import { CoronerValueType } from '../requests/common';
import { SelectQueryRequest } from '../requests/select';
import { CoronerResponse } from '../responses/common';
import { SelectQueryResponse } from '../responses/select';
import { Attribute, CommonCoronerQuery, JoinAttributes } from './common';
export interface SelectCoronerQuery<T extends Attribute, S extends string[] = []> extends CommonCoronerQuery<T> {
    select<A extends string>(): SelectedCoronerQuery<T, A[]>;
    select<V extends CoronerValueType, A extends string>(
        ...attributes: A[]
    ): SelectedCoronerQuery<JoinAttributes<T, A, V>, [...S, A]>;
}

export interface SelectedCoronerQuery<T extends Attribute, S extends string[] = []> extends SelectCoronerQuery<T, S> {
    getRequest(): SelectQueryRequest<T, S>;
    getResponse(source?: Partial<QuerySource>): Promise<CoronerResponse<SelectQueryResponse<T, S>>>;
}
