import { CoronerValueType } from '../requests/common';
import {
    BinFoldOperator,
    DistributionFoldOperator,
    FoldOperator,
    FoldQueryRequest,
    UnaryFoldOperator,
} from '../requests/fold';
import { QueryResponse } from './common';
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
    : F extends UnaryFoldOperator
    ? SingleQueryColumnValue<V>
    : DistributionQueryColumnValue<V> | BinQueryColumnValue | RangeQueryColumnValue<V> | SingleQueryColumnValue<V>;

export type FoldQueryRowValue<F extends readonly FoldOperator[]> = [
    CoronerValueType,
    FoldQueryColumnValue<F[number]>[],
    number
];

export interface FoldQueryResponse<R extends FoldQueryRequest> extends QueryResponse {
    readonly cardinalities: QueryCardinalities;
    readonly factors_desc?: QueryFactorDescription[];
    readonly values: FoldQueryRowValue<NonNullable<R['fold']>[string]>[];

    rows(): SimpleFoldRows<R>;
    first(): SimpleFoldRow<R> | undefined;
}
