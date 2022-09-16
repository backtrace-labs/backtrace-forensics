import { AttributeList } from '../../common/attributes';
import { FoldedCoronerQuery } from '../../queries/fold';
import { FoldQueryRequest } from '../../requests/fold';

export interface IFoldCoronerQueryBuilderFactory {
    create<AL extends AttributeList, R extends FoldQueryRequest>(
        request: R,
        attributeList: AL
    ): FoldedCoronerQuery<AL, R>;
}
