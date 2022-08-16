import { QueryObject } from '../queries/common';
import { QueryResponse } from './common';
import { SimpleSelectRow } from './simple/select';

export type SelectQueryObject = ['*', ([number] | [number, number])[]];
export type SelectQueryRowValue<T extends QueryObject<T>, A extends keyof T> = ['*', ...[T[A], number][]];

export interface QueryOrder {
    name: string;
    order: string;
}

type SelectQueryRowValues<T extends QueryObject<T>, S extends (keyof T)[]> = {
    [I in keyof S]: SelectQueryRowValue<T, S[I]>;
};

export interface SelectQueryResponse<T extends QueryObject<T>, S extends (keyof T)[]> extends QueryResponse {
    readonly objects: SelectQueryObject[];
    readonly values: SelectQueryRowValues<T, S>;
    readonly order?: QueryOrder[];

    toArray(): SimpleSelectRow<T, S>[];
    first(): SimpleSelectRow<T, S> | undefined;
}
