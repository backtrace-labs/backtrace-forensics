import { Attribute, QueryObjectKey } from '../queries/common';
import { QueryResponse } from './common';
import { SimpleSelectRow } from './simple/select';

export type SelectQueryObject = ['*', ([number] | [number, number])[]];
export type SelectQueryRowValue<T extends Attribute, A extends keyof T> = ['*', ...[T[A], number][]];

export interface QueryOrder {
    name: string;
    order: string;
}

type SelectQueryRowValues<T extends Attribute, S extends (keyof T)[]> = {
    [I in keyof S]: SelectQueryRowValue<T, S[I]>;
};

export interface SelectQueryResponse<T extends Attribute, S extends QueryObjectKey<T>[]> extends QueryResponse {
    readonly objects: SelectQueryObject[];
    readonly values: SelectQueryRowValues<T, S>;
    readonly order?: QueryOrder[];

    toArray(): SimpleSelectRow<T, S>[];
    first(): SimpleSelectRow<T, S> | undefined;
}
