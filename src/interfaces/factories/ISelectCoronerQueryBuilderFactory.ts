import { SelectCoronerQuery } from '../../queries/select';
import { SelectQueryRequest } from '../../requests/select';

export interface ISelectCoronerQueryBuilderFactory {
    create<R extends SelectQueryRequest>(request: R): SelectCoronerQuery<R>;
}
