import { CoronerResponse } from '../responses/common';
import { SelectQueryResponse } from '../responses/select';
import {
    CoronerValueType,
    DynamicCommonCoronerQuery,
    DynamicQueryObject,
    JoinDynamicQueryObject,
    QueryObject,
    StaticCommonCoronerQuery,
} from './common';

export interface StaticSelectCoronerQuery<T extends QueryObject<T>, S extends (keyof T)[] = []>
    extends StaticCommonCoronerQuery<T> {
    select<A extends keyof T & string>(): StaticSelectedCoronerQuery<T, A[]>;
    select<A extends keyof T & string>(attribute: A): StaticSelectedCoronerQuery<T, [...S, A]>;
}

export interface StaticSelectedCoronerQuery<T extends QueryObject<T>, S extends (keyof T)[]>
    extends StaticSelectCoronerQuery<T, S> {}

export interface DynamicSelectCoronerQuery<
    T extends DynamicQueryObject<string, CoronerValueType>,
    S extends (keyof T)[] = []
> extends DynamicCommonCoronerQuery<T> {
    select<A extends string>(): DynamicSelectedCoronerQuery<T, A[]>;
    select<A extends string, V extends CoronerValueType>(
        attribute: A
    ): DynamicSelectedCoronerQuery<JoinDynamicQueryObject<T, A, V>, [...S, A]>;
}

export interface DynamicSelectedCoronerQuery<
    T extends DynamicQueryObject<string, CoronerValueType>,
    S extends (keyof T)[]
> extends DynamicSelectCoronerQuery<T, S> {}

export interface SelectedCoronerQueryExecutor {
    execute<Q extends StaticSelectedCoronerQuery<never, never>>(
        query: Q
    ): Promise<
        Q extends StaticSelectedCoronerQuery<infer T, infer S> ? CoronerResponse<SelectQueryResponse<T, S>> : never
    >;
    execute<Q extends DynamicSelectedCoronerQuery<never, never>>(
        query: Q
    ): Promise<
        Q extends DynamicSelectedCoronerQuery<infer T, infer S> ? CoronerResponse<SelectQueryResponse<T, S>> : never
    >;
}
