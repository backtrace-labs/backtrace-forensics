import {
    CoronerQuery,
    FoldCoronerQuery,
    FoldedCoronerQuery,
    SelectCoronerQuery,
    SelectedCoronerQuery,
} from '../coroner';
import { CoronerQueryBuilder } from '../implementation/queries/CoronerQueryBuilder';
import { FoldedCoronerQueryBuilder } from '../implementation/queries/FoldCoronerQueryBuilder';
import { SelectedCoronerQueryBuilder } from '../implementation/queries/SelectCoronerQueryBuilder';

/**
 * Extends default `SelectedCoronerQuery` query builder with provided arguments.
 *
 * Use this to add functionality to already selected queries.
 */
export function extendSelectedCoronerQuery<M extends { [K in keyof M]: (...args: any[]) => any }>(
    obj: M & ThisType<SelectedCoronerQuery>,
) {
    type KeyType = keyof (typeof SelectedCoronerQueryBuilder)['prototype'];

    for (const key in obj) {
        SelectedCoronerQueryBuilder.prototype[key as KeyType] = obj[key];
    }
}

/**
 * Extends default `FoldedCoronerQuery` query builder with provided arguments.
 *
 * Use this to add functionality to already folded queries.
 */
export function extendFoldedCoronerQuery<M extends { [K in keyof M]: (...args: any[]) => any }>(
    obj: M & ThisType<FoldedCoronerQuery>,
) {
    type KeyType = keyof (typeof FoldedCoronerQueryBuilder)['prototype'];

    for (const key in obj) {
        FoldedCoronerQueryBuilder.prototype[key as KeyType] = obj[key];
    }
}

/**
 * Extends default `CoronerQuery` query builder with provided arguments.
 *
 * Use this to add functionality to all queries.
 */
export function extendCoronerQuery<M extends { [K in keyof M]: (...args: any[]) => any }>(
    obj: M & ThisType<CoronerQuery>,
) {
    type KeyType = keyof (typeof CoronerQueryBuilder)['prototype'];

    for (const key in obj) {
        CoronerQueryBuilder.prototype[key as KeyType] = obj[key];
    }

    extendSelectedCoronerQuery(obj);
    extendFoldedCoronerQuery(obj);
}

/**
 * Extends default `SelectCoronerQuery` query builder with provided arguments.
 *
 * Use this to add functionality to base and selected queries.
 */
export function extendSelectCoronerQuery<M extends { [K in keyof M]: (...args: any[]) => any }>(
    obj: M & ThisType<SelectCoronerQuery>,
) {
    extendCoronerQuery(obj);
}

/**
 * Extends default `FoldCoronerQuery` query builder with provided arguments.
 *
 * Use this to add functionality to base and fold queries.
 */
export function extendFoldCoronerQuery<M extends { [K in keyof M]: (...args: any[]) => any }>(
    obj: M & ThisType<FoldCoronerQuery>,
) {
    extendCoronerQuery(obj);
}
