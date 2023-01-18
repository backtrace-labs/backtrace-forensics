import { FoldedCoronerQuery, FoldQueryRequest } from '../../coroner/fold';

export interface IFoldCoronerQueryBuilderFactory {
    create(request: FoldQueryRequest): FoldedCoronerQuery;
}
