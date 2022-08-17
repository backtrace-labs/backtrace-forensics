import { CommonQueryRequest, CoronerValueType, FilterOperator } from '../requests/common';
import { FoldCoronerQuery } from './fold';
import { SelectCoronerQuery } from './select';

export interface CommonCoronerQuery<T extends Attribute> {
    limit(count: number): this;
    offset(count: number): this;
    template(template: string): this;
    filter<A extends keyof T & string, V extends QueryObjectValue<T, A>>(
        attribute: A,
        operator: FilterOperator<V>,
        value: V
    ): this;
    getRequest(): CommonQueryRequest;
}

export interface CoronerQuery<T extends Attribute>
    extends CommonCoronerQuery<T>,
        SelectCoronerQuery<T>,
        FoldCoronerQuery<T> {}

export type Attribute<A extends string = string, V extends CoronerValueType = CoronerValueType> = {
    [key in A]: V;
};

export type JoinAttributes<
    T extends Attribute<string, CoronerValueType>,
    A extends string,
    V extends CoronerValueType
> = [T] extends [never] ? Attribute<A, V> : T & Attribute<A, V>;

export type QueryObjectKey<T extends Attribute> = [T] extends [never] ? string : keyof T & string;

export type QueryObjectValue<T extends Attribute, A extends string> = CoronerValueType;
