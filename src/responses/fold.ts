import { CoronerValueType } from '../queries/common';
import { QueryResponse } from './common';

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

export type SingleQueryColumnValue = [CoronerValueType];
export type BinQueryColumnValue = [number, number, number];
export type RangeQueryColumnValue = [CoronerValueType, CoronerValueType];

export type DistributionQueryColumnValue = {
    keys: number;
    tail?: number;
    vals: [CoronerValueType, number][];
};

export type FoldQueryColumnValue =
    | SingleQueryColumnValue
    | BinQueryColumnValue[]
    | RangeQueryColumnValue
    | DistributionQueryColumnValue[]
    | [];

export type FoldQueryRowValue = [string, FoldQueryColumnValue[], number];

export interface FoldQueryResponse extends QueryResponse {
    readonly cardinalities: QueryCardinalities;
    readonly factors_desc?: QueryFactorDescription[];
    readonly values: FoldQueryRowValue[];
}
