import { QueryObject } from '../queries/common';
import { BinFoldOperator, DefaultGroup, DistributionFoldOperator, Fold, FoldOperator, Folds } from '../queries/fold';
import { QueryResponse } from './common';
import { SimpleFoldRow } from './simple/fold';

export interface QueryFactorDescription {
    readonly name: string;
    readonly format: string;
    readonly type: string;
}

export interface QueryCardinality {
    readonly rows: number;
    readonly groups: number;
}

export interface QueryCardinalities {
    readonly initial: QueryCardinality;
    readonly having: QueryCardinality;
    readonly pagination: QueryCardinality;
}

export type SingleQueryColumnValue<T extends QueryObject<T>, A extends keyof T> = [T[A]];
export type BinQueryColumnValue = [number, number, number];
export type RangeQueryColumnValue<T extends QueryObject<T>, A extends keyof T> = [T[A], T[A]];

export type DistributionQueryColumnValue<T extends QueryObject<T>, A extends keyof T> = {
    keys: number;
    tail?: number;
    vals: [T[A], number][];
};

export type FoldQueryColumnValue<
    T extends QueryObject<T>,
    A extends keyof T & string,
    F extends Fold<A, FoldOperator<T[A]>[]>
> = F extends DistributionFoldOperator
    ? DistributionQueryColumnValue<T, A>
    : F extends BinFoldOperator
    ? BinQueryColumnValue
    : F extends ['range']
    ? RangeQueryColumnValue<T, A>
    : SingleQueryColumnValue<T, A>;

export type FoldQueryRowValue<
    T extends QueryObject<T>,
    A extends keyof T & string,
    F extends Fold<A, FoldOperator<T[A]>[]>,
    G extends keyof T | DefaultGroup
> = [G, FoldQueryColumnValue<T, A, F>[], number];

export interface FoldQueryResponse<T extends QueryObject<T>, F extends Folds, G extends keyof T | DefaultGroup>
    extends QueryResponse {
    readonly cardinalities: QueryCardinalities;
    readonly factors_desc?: QueryFactorDescription[];
    readonly values: FoldQueryRowValue<
        T,
        keyof T & string,
        // @ts-ignore - TS gives here an error, despite everything working correctly.
        F[keyof T & string],
        G
    >[];

    toArray(): SimpleFoldRow<T, F, G>[];
    first(): SimpleFoldRow<T, F, G> | undefined;
}
