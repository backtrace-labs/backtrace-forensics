import { QueryRequest } from '../../requests/common';
import {
    FoldBooleanFilter,
    FoldFilter,
    FoldOperator,
    FoldParamFilter,
    FoldQueryRequest,
    Folds,
} from '../../requests/fold';
import { SelectQueryRequest } from '../../requests/select';

function cloneFold(fold?: Folds) {
    if (!fold) {
        return undefined;
    }

    const result: typeof fold = {};
    for (const key in fold) {
        const operators = fold[key];
        if (!operators) {
            continue;
        }

        const resultOperators: FoldOperator[] = [];
        for (const operator of operators) {
            resultOperators.push([...operator]);
        }
        result[key] = resultOperators;
    }

    return result;
}

function cloneGroup(group?: readonly string[]) {
    if (!group) {
        return undefined;
    }

    return [...group];
}

function cloneSelect(select?: readonly string[]) {
    if (!select) {
        return undefined;
    }

    return [...select];
}

function cloneHaving(having?: readonly FoldFilter[]) {
    if (!having) {
        return undefined;
    }

    return [
        ...having.map((h) => {
            if (h.op !== 'boolean') {
                const filter: FoldParamFilter = {
                    op: h.op,
                    params: [...h.params],
                    property: [...h.property],
                } as FoldParamFilter;
                return filter;
            } else {
                const filter: FoldBooleanFilter = {
                    op: h.op,
                    params: [...h.params],
                };
                return filter;
            }
        }),
    ];
}

export function cloneRequest(request: QueryRequest): QueryRequest {
    if ('fold' in request || 'group' in request) {
        const foldRequest = request as FoldQueryRequest;
        const result: FoldQueryRequest = {
            ...foldRequest,
            fold: cloneFold(foldRequest.fold),
            group: cloneGroup(foldRequest.group) as typeof foldRequest.group,
            having: cloneHaving(foldRequest.having),
        };
        return result;
    } else if ('select' in request) {
        const selectRequest = request as SelectQueryRequest;
        const result: SelectQueryRequest = {
            ...selectRequest,
            select: cloneSelect(selectRequest.select) as typeof selectRequest.select,
        };
        return result;
    } else {
        return {
            ...request,
        };
    }
}

export function cloneFoldRequest<R extends FoldQueryRequest>(request: R): R {
    return cloneRequest(request) as R;
}

export function cloneSelectRequest<R extends SelectQueryRequest>(request: R): R {
    return cloneRequest(request) as R;
}
