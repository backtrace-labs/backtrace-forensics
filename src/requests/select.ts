import { Attribute } from '../queries/common';
import { CommonQueryRequest } from './common';

export interface SelectQueryRequest<T extends Attribute, S extends (keyof T)[]> extends CommonQueryRequest {
    select?: S;
}
