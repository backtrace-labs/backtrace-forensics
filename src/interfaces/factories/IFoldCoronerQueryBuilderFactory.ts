import { FoldedCoronerQuery } from '../../queries/fold';
import { FoldQueryRequest } from '../../requests/fold';

export interface IFoldCoronerQueryBuilderFactory {
    create<R extends FoldQueryRequest>(request: R): FoldedCoronerQuery<R>;
}
