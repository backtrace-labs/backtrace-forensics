import { Attribute } from '../../queries/common';
import { DefaultGroup } from '../../queries/fold';
import { CommonQueryRequest, CoronerValueType } from '../../requests/common';
import { FoldOperator, FoldQueryRequest, Folds, QueryFold } from '../../requests/fold';
import { SelectQueryRequest } from '../../requests/select';

function cloneFold(fold?: Partial<QueryFold<Attribute, Folds>>) {
    if (!fold) {
        return undefined;
    }

    const result: typeof fold = {};
    for (const key in fold) {
        const operators = fold[key];
        if (!operators) {
            result[key] = undefined;
            continue;
        }

        const resultOperators: FoldOperator<CoronerValueType>[] = [];
        for (const operator of operators) {
            resultOperators.push([...operator]);
        }
        result[key] = resultOperators;
    }

    return result;
}

function cloneGroup(group?: [string]) {
    if (!group) {
        return undefined;
    }

    return [group];
}

function cloneSelect(select?: string[]) {
    if (!select) {
        return undefined;
    }

    return [...select];
}

export function cloneRequest(request: CommonQueryRequest): CommonQueryRequest {
    if ('fold' in request || 'group' in request) {
        const foldRequest = request as FoldQueryRequest<Attribute, Folds, DefaultGroup>;
        const result: FoldQueryRequest<Attribute, Folds, DefaultGroup> = {
            ...foldRequest,
            fold: cloneFold(foldRequest.fold),
            group: cloneGroup(foldRequest.group) as typeof foldRequest.group,
        };
        return result;
    } else if ('select' in request) {
        const selectRequest = request as SelectQueryRequest<Attribute, []>;
        const result: SelectQueryRequest<Attribute, []> = {
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

export function cloneFoldRequest<T extends Attribute, F extends Folds = never, G extends string | DefaultGroup = '*'>(
    request: FoldQueryRequest<Attribute, Folds, string>
): FoldQueryRequest<T, F, G> {
    return cloneRequest(request);
}

export function cloneSelectRequest<T extends Attribute<string, CoronerValueType>, S extends string[] = []>(
    request: SelectQueryRequest<Attribute, string[]>
): SelectQueryRequest<T, S> {
    return cloneRequest(request);
}
