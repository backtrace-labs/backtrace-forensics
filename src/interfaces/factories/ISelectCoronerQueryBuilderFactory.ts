import { SelectCoronerQuery, SelectQueryRequest } from '../../coroner/select';

export interface ISelectCoronerQueryBuilderFactory {
    create(request: SelectQueryRequest): SelectCoronerQuery;
}
