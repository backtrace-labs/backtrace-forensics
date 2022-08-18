import { Attribute } from '../queries/common';
import { QueryRequest } from './common';

export interface SelectQueryRequest<T extends Attribute = Attribute, S extends (keyof T)[] = string[]>
    extends QueryRequest {
    /**
     * Attributes to select.
     * @example
     * request.select = ['timestamp', 'fingerprint'];
     */
    select?: S;
}
