import { FoldOfRequest } from '../queries';
import { CoronerValueType } from '../requests/common';
import {
    BinFoldOperator,
    BooleanFoldOperator,
    DictionaryFoldOperator,
    DistributionFoldOperator,
    FoldOperator,
    FoldQueryRequest,
    StringFoldOperator,
    UIntFoldOperator,
} from '../requests/fold';
import { FailedQueryResponse, RawQueryResponse, SuccessfulQueryResponse } from './common';
import { SimpleFoldRow, SimpleFoldRows } from './simple/fold';

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

export type SingleQueryColumnValue<V extends CoronerValueType = CoronerValueType> = [V?];
export type BinQueryColumnValue = [number, number, number][];
export type RangeQueryColumnValue<V extends CoronerValueType = CoronerValueType> = [V, V];
export type HistogramQueryColumnValue<V extends CoronerValueType = CoronerValueType> = [V, number][];

export type DistributionQueryColumnValue<V extends CoronerValueType = CoronerValueType> = [
    {
        keys: number;
        tail?: number;
        vals: [V, number][];
    }
];

export type FoldQueryColumnValue<
    F extends FoldOperator,
    V extends CoronerValueType = CoronerValueType
> = F extends DistributionFoldOperator
    ? DistributionQueryColumnValue<V>
    : F extends BinFoldOperator
    ? BinQueryColumnValue
    : F extends ['range']
    ? RangeQueryColumnValue<V>
    : F extends ['histogram']
    ? HistogramQueryColumnValue<V>
    : F extends UIntFoldOperator | BooleanFoldOperator | StringFoldOperator | DictionaryFoldOperator
    ? SingleQueryColumnValue<V>
    :
          | DistributionQueryColumnValue<V>
          | BinQueryColumnValue
          | RangeQueryColumnValue<V>
          | SingleQueryColumnValue<V>
          | HistogramQueryColumnValue<V>;

export type FoldQueryRowValue<F extends readonly FoldOperator[]> = [
    CoronerValueType,
    FoldQueryColumnValue<F[number]>[],
    number
];

export interface RawFoldQueryResponse<R extends FoldQueryRequest> extends RawQueryResponse {
    readonly cardinalities: QueryCardinalities;
    readonly factors_desc?: QueryFactorDescription[];
    readonly values: FoldQueryRowValue<FoldOfRequest<R>[string]>[];
}

export interface SuccessfulFoldQueryResponse<R extends FoldQueryRequest>
    extends SuccessfulQueryResponse<RawFoldQueryResponse<R>> {
    all(): SimpleFoldRows<R>;
    first(): SimpleFoldRow<R> | undefined;
}

export type FoldQueryResponse<R extends FoldQueryRequest> = SuccessfulFoldQueryResponse<R> | FailedQueryResponse;
