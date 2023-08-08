import { CoronerValueType, FailedQueryResponse, RawQueryResponse, SuccessfulQueryResponse } from '../common';
import { FoldedCoronerQuery } from './query';

import {
    BinFoldOperator,
    BooleanFoldOperator,
    DictionaryFoldOperator,
    DistributionFoldOperator,
    FoldOperator,
    StringFoldOperator,
    UIntFoldOperator,
} from './requests';
import { SimpleFoldRow, SimpleFoldRows } from './simpleResponses';

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

export type SingleQueryColumnValue = [CoronerValueType?];
export type BinQueryColumnValue = [number, number, number][];
export type RangeQueryColumnValue = [CoronerValueType, CoronerValueType];
export type HistogramQueryColumnValue = [CoronerValueType, number][];
export type ObjectQueryColumnValue = [string];

export type DistributionQueryColumnValue = [
    {
        keys: number;
        tail?: number;
        vals: [CoronerValueType, number][];
    },
];

export type FoldQueryColumnValue<F extends FoldOperator = FoldOperator> = F extends DistributionFoldOperator
    ? DistributionQueryColumnValue
    : F extends BinFoldOperator
    ? BinQueryColumnValue
    : F extends readonly ['range']
    ? RangeQueryColumnValue
    : F extends readonly ['histogram']
    ? HistogramQueryColumnValue
    : F extends readonly ['object']
    ? ObjectQueryColumnValue
    : F extends UIntFoldOperator | BooleanFoldOperator | StringFoldOperator | DictionaryFoldOperator
    ? SingleQueryColumnValue
    :
          | DistributionQueryColumnValue
          | BinQueryColumnValue
          | RangeQueryColumnValue
          | SingleQueryColumnValue
          | HistogramQueryColumnValue;

export type FoldQueryRowValue = [CoronerValueType, FoldQueryColumnValue[], number];

export interface RawFoldQueryResponse extends RawQueryResponse {
    readonly cardinalities?: QueryCardinalities;
    readonly factors_desc?: QueryFactorDescription[];
    readonly values: FoldQueryRowValue[];
}

export interface SuccessfulFoldQueryResponse extends SuccessfulQueryResponse<RawFoldQueryResponse, FoldedCoronerQuery> {
    readonly total: number;
    all(): SimpleFoldRows;
    first(): SimpleFoldRow | undefined;
}

export type FailedFoldQueryResponse = FailedQueryResponse<FoldedCoronerQuery>;

export type FoldQueryResponse = SuccessfulFoldQueryResponse | FailedFoldQueryResponse;
