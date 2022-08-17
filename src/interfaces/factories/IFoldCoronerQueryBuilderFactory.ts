import { Attribute } from '../../queries/common';
import { DefaultGroup, FoldedCoronerQuery } from '../../queries/fold';
import { FoldQueryRequest, Folds } from '../../requests/fold';

export interface IFoldCoronerQueryBuilderFactory {
    create<T extends Attribute, F extends Folds = never, G extends string | DefaultGroup = '*'>(
        request: FoldQueryRequest<T, F, G>
    ): FoldedCoronerQuery<T, F, G>;
}
