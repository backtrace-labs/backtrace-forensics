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

export type Extension<T> = { [K: string]: (...args: any[]) => any } & ThisType<T>;

/**
 * Extends default `SelectedCoronerQuery` query builder with provided arguments.
 *
 * Use this to add functionality to already selected queries.
 */
export function extendSelectedCoronerQuery(extension: Extension<SelectedCoronerQuery>) {
    type KeyType = keyof (typeof SelectedCoronerQueryBuilder)['prototype'];

    for (const key in extension) {
        SelectedCoronerQueryBuilder.prototype[key as KeyType] = extension[key];
    }
}

/**
 * Extends default `FoldedCoronerQuery` query builder with provided arguments.
 *
 * Use this to add functionality to already folded queries.
 */
export function extendFoldedCoronerQuery(extension: Extension<FoldedCoronerQuery>) {
    type KeyType = keyof (typeof FoldedCoronerQueryBuilder)['prototype'];

    for (const key in extension) {
        FoldedCoronerQueryBuilder.prototype[key as KeyType] = extension[key];
    }
}

/**
 * Extends default `CoronerQuery` query builder with provided arguments.
 *
 * Use this to add functionality to all queries.
 */
export function extendCoronerQuery(extension: Extension<CoronerQuery>) {
    type KeyType = keyof (typeof CoronerQueryBuilder)['prototype'];

    for (const key in extension) {
        CoronerQueryBuilder.prototype[key as KeyType] = extension[key];
    }

    extendSelectedCoronerQuery(extension);
    extendFoldedCoronerQuery(extension);
}

/**
 * Extends default `SelectCoronerQuery` query builder with provided arguments.
 *
 * Use this to add functionality to base and selected queries.
 */
export function extendSelectCoronerQuery(extension: Extension<SelectCoronerQuery>) {
    extendCoronerQuery(extension);
}

/**
 * Extends default `FoldCoronerQuery` query builder with provided arguments.
 *
 * Use this to add functionality to base and fold queries.
 */
export function extendFoldCoronerQuery(extension: Extension<FoldCoronerQuery>) {
    extendCoronerQuery(extension);
}
