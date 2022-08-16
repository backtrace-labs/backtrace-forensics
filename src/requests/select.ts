import { CommonQueryRequest, CoronerValueType } from './common';

export interface SelectQueryRequest extends CommonQueryRequest {
    select?: CoronerValueType[];
}
