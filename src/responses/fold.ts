import { Attribute } from '../queries/common';
import { DefaultGroup } from '../queries/fold';
import { CoronerValueType } from '../requests/common';
import {
    BinFoldOperator,
    DistributionFoldOperator,
    Fold,
    FoldOperator,
    Folds,
    UnaryFoldOperator,
} from '../requests/fold';
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

export type SingleQueryColumnValue<V extends CoronerValueType> = [V?];
export type BinQueryColumnValue = [number, number, number][];
export type RangeQueryColumnValue<V extends CoronerValueType> = [V, V];

export type DistributionQueryColumnValue<V extends CoronerValueType> = [
    {
        keys: number;
        tail?: number;
        vals: [V, number][];
    }
];

export type FoldQueryColumnValue<
    T extends Attribute,
    A extends keyof T & string,
    F extends Fold<A, FoldOperator<T[A]>[]>
> = F extends DistributionFoldOperator
    ? DistributionQueryColumnValue<T[A]>
    : F extends BinFoldOperator
    ? BinQueryColumnValue
    : F extends ['range']
    ? RangeQueryColumnValue<T[A]>
    : F extends UnaryFoldOperator
    ? SingleQueryColumnValue<T[A]>
    :
          | DistributionQueryColumnValue<T[A]>
          | BinQueryColumnValue
          | RangeQueryColumnValue<T[A]>
          | SingleQueryColumnValue<T[A]>;

export type FoldQueryRowValue<
    T extends Attribute,
    A extends keyof T & string,
    F extends Fold<A, FoldOperator<T[A]>[]>,
    G extends keyof T | DefaultGroup
> = [G, FoldQueryColumnValue<T, A, F>[], number];

export interface FoldQueryResponse<T extends Attribute, F extends Folds, G extends keyof T | DefaultGroup>
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
