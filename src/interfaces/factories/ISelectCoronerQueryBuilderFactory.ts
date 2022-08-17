import { Attribute } from '../../queries/common';
import { SelectCoronerQuery } from '../../queries/select';
import { SelectQueryRequest } from '../../requests/select';

export interface ISelectCoronerQueryBuilderFactory {
    create<T extends Attribute, S extends string[] = []>(request: SelectQueryRequest<T, S>): SelectCoronerQuery<T, S>;
}
