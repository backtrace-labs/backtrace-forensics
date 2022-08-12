import { SelectQueryResponse } from '../responses/select';
import { CommonCoronerQuery, ExecutableCoronerQuery } from './common';

export interface SelectCoronerQuery extends CommonCoronerQuery {
    select(attribute: string, ...attributes: string[]): SelectedCoronerQuery;
}

export interface SelectedCoronerQuery extends SelectCoronerQuery, ExecutableCoronerQuery<SelectQueryResponse> {}
