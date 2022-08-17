import { Attribute } from '../../queries/common';
import { DefaultGroup } from '../../queries/fold';
import { Folds } from '../../requests/fold';
import { FoldQueryResponse } from '../../responses/fold';
import { SimpleFoldRow } from '../../responses/simple/fold';

export interface IFoldCoronerSimpleResponseBuilder {
    first<T extends Attribute, F extends Folds = never, G extends string | DefaultGroup = '*'>(
        response: FoldQueryResponse<T, F, G>
    ): SimpleFoldRow<T, F, G> | undefined;
    toArray<T extends Attribute, F extends Folds = never, G extends string | DefaultGroup = '*'>(
        response: FoldQueryResponse<T, F, G>
    ): SimpleFoldRow<T, F, G>[];
}
