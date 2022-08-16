import { SelectQueryResponse } from '../responses/select';
import {
    CoronerValueType,
    DynamicCommonCoronerQuery,
    DynamicQueryObject,
    ExecutableCoronerQuery,
    JoinDynamicQueryObject,
    QueryObject,
    StaticCommonCoronerQuery,
} from './common';

export interface SelectCoronerQuery<T extends QueryObject<T>, S extends (keyof T)[] = []>
    extends StaticCommonCoronerQuery<T> {
    select<A extends keyof T & string>(): SelectedCoronerQuery<T, A[]>;
    select<A extends keyof T & string>(attribute: A): SelectedCoronerQuery<T, [...S, A]>;
}

export interface SelectedCoronerQuery<T extends QueryObject<T>, S extends (keyof T)[]>
    extends SelectCoronerQuery<T, S>,
        ExecutableCoronerQuery<SelectQueryResponse<T, S>> {}

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
> extends DynamicSelectCoronerQuery<T, S>,
        ExecutableCoronerQuery<SelectQueryResponse<T, S>> {}
