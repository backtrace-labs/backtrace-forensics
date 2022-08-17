import { Attribute } from '../queries/common';
import { QueryRequest } from './common';

export interface SelectQueryRequest<T extends Attribute, S extends (keyof T)[]> extends QueryRequest {
    select?: S;
}
