import { deepClone } from '../../common/deepClone';
import { QueryRequest } from '../../coroner/common';
import { FoldQueryRequest } from '../../coroner/fold';
import { SelectQueryRequest } from '../../coroner/select';

export const cloneRequest = deepClone<QueryRequest>;

export function cloneFoldRequest<R extends FoldQueryRequest>(request: R): R {
    return cloneRequest(request) as R;
}

export function cloneSelectRequest<R extends SelectQueryRequest>(request: R): R {
    return cloneRequest(request) as R;
}
