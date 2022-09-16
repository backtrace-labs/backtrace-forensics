import { AttributeList } from '../../common/attributes';
import { SelectCoronerQuery } from '../../queries/select';
import { SelectQueryRequest } from '../../requests/select';

export interface ISelectCoronerQueryBuilderFactory {
    create<AL extends AttributeList, R extends SelectQueryRequest>(
        request: R,
        attributeList: AL
    ): SelectCoronerQuery<AL, R>;
}
