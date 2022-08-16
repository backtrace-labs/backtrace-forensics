import { CommonQueryRequest, CoronerValueType, FilterOperator } from '../requests/common';
import { DynamicFoldCoronerQuery, StaticFoldCoronerQuery } from './fold';
import { DynamicSelectCoronerQuery, StaticSelectCoronerQuery } from './select';

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

export interface StaticCoronerQuery<T extends QueryObject<T>>
    extends StaticCommonCoronerQuery<T>,
        StaticSelectCoronerQuery<T>,
        StaticFoldCoronerQuery<T> {}

export interface DynamicCoronerQuery<
    T extends DynamicQueryObject<string, CoronerValueType> = DynamicQueryObject<string, CoronerValueType>
> extends DynamicCommonCoronerQuery<T>,
        DynamicSelectCoronerQuery<T>,
        DynamicFoldCoronerQuery<T> {
    getRequest(): CommonQueryRequest;
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
