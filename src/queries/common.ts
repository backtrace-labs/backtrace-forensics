import { CoronerResponse, QueryResponse } from '../responses/common';
import { DynamicFoldCoronerQuery, FoldCoronerQuery } from './fold';
import { DynamicSelectCoronerQuery, SelectCoronerQuery } from './select';

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
    template(template: string): this;
}
export interface StaticCommonCoronerQuery<T extends QueryObject<T>> extends CommonCoronerQuery {
    filter<A extends keyof T>(attribute: A, operator: FilterOperator<T[A]>, value: T[A]): this;
}

export interface DynamicCommonCoronerQuery<T extends DynamicQueryObject<string, CoronerValueType>>
    extends CommonCoronerQuery {
    filter<A extends string, V extends DynamicQueryObjectValue<T, A>>(
        attribute: A,
        operator: FilterOperator<V>,
        value: V
    ): DynamicCoronerQuery<JoinDynamicQueryObject<T, A, V>>;
}

export interface ExecutableCoronerQuery<R extends QueryResponse> {
    execute(): Promise<CoronerResponse<any>>;
}

export interface StaticCoronerQuery<T extends QueryObject<T>>
    extends StaticCommonCoronerQuery<T>,
        SelectCoronerQuery<T>,
        FoldCoronerQuery<T> {}

export interface DynamicCoronerQuery<
    T extends DynamicQueryObject<string, CoronerValueType> = DynamicQueryObject<string, CoronerValueType>
> extends DynamicCommonCoronerQuery<T>,
        DynamicSelectCoronerQuery<T>,
        DynamicFoldCoronerQuery<T> {}
{
}

export type QueryObject<T> = {
    [A in keyof T]: CoronerValueType;
};

export type DynamicQueryObject<A extends string = string, V extends CoronerValueType = CoronerValueType> = {
    [key in A]: V;
};

export type JoinDynamicQueryObject<
    T extends DynamicQueryObject<string, CoronerValueType>,
    A extends string,
    V extends CoronerValueType
> = T extends DynamicQueryObject<A, V> ? T : T & DynamicQueryObject<A, V>;

export type DynamicQueryObjectValue<T, A extends string> = T extends DynamicQueryObject<A, infer R>
    ? R
    : CoronerValueType;
