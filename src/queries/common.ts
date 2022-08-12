import { CoronerResponse, QueryResponse } from '../responses/common';
import { FoldCoronerQuery } from './fold';
import { SelectCoronerQuery } from './select';

export type CoronerValueType = string | number | boolean | null;

export type StringFilterOperator =
    | 'at-least'
    | 'at-most'
    | 'contains'
    | 'not-contains'
    | 'equal'
    | 'not-equal'
    | 'greater-than'
    | 'less-than'
    | 'regular-expression'
    | 'inverse-regular-expression';

export type NumberFilterOperator = 'at-least' | 'at-most' | 'equal' | 'not-equal' | 'greater-than' | 'less-than';

export type BooleanFilterOperator = 'equal' | 'not-equal';

export type FilterOperator<T extends CoronerValueType = CoronerValueType> = T extends string
    ? StringFilterOperator
    : T extends number
    ? NumberFilterOperator
    : T extends boolean
    ? BooleanFilterOperator
    : never;

export interface CommonCoronerQuery {
    limit(count: number): this;
    offset(count: number): this;
    filter<V extends CoronerValueType, O extends FilterOperator<V>>(attribute: string, operator: O, value: V): this;
    template(template: string): this;
}

export interface ExecutableCoronerQuery<R extends QueryResponse> {
    execute(): Promise<CoronerResponse<R>>;
}

export interface CoronerQuery extends CommonCoronerQuery, SelectCoronerQuery, FoldCoronerQuery {}

// TESTING STUFF
(async () => {
    const a = {} as CoronerQuery;
    const fold = await a.filter('dupa', 'contains', 'true').fold('abc', 'head').execute();
    const select = await a.filter('dupa', 'contains', 'true').select('abc', 'def').execute();
    if (!fold.error) {
        const response = fold.response;
    }

    if (!select.error) {
        const response = select.response;
    }
})();
