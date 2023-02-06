import { CoronerValueType } from '../common';
import { BinFoldOperator, DefaultGroup, DistributionFoldOperator, FoldOperator } from './requests';
import {
    BinQueryColumnValue,
    DistributionQueryColumnValue,
    HistogramQueryColumnValue,
    RangeQueryColumnValue,
} from './responses';

export interface SimpleFoldDistributionValue {
    value: CoronerValueType;
    count: number;
    raw: [CoronerValueType, number];
}

export interface SimpleFoldDistributionValues {
    keys: number;
    tail: number;
    values: SimpleFoldDistributionValue[];
    raw: DistributionQueryColumnValue;
}

export interface SimpleFoldRangeValue {
    from: CoronerValueType;
    to: CoronerValueType;
    raw: RangeQueryColumnValue;
}

export interface SimpleFoldBinValue {
    from: CoronerValueType;
    to: CoronerValueType;
    count: number;
    raw: BinQueryColumnValue[number];
}

export interface SimpleFoldBinValues {
    values: SimpleFoldBinValue[];
    raw: BinQueryColumnValue;
}

export interface SimpleFoldHistogramValue {
    value: CoronerValueType;
    count: number;
    raw: HistogramQueryColumnValue[number];
}

export interface SimpleFoldHistogramValues {
    values: SimpleFoldHistogramValue[];
    raw: HistogramQueryColumnValue;
}

export type SimpleFoldValue<F extends FoldOperator[0] = FoldOperator[0]> = F extends DistributionFoldOperator[0]
    ? SimpleFoldDistributionValues
    : F extends BinFoldOperator[0]
    ? SimpleFoldBinValues
    : F extends 'range'
    ? SimpleFoldRangeValue
    : F extends 'histogram'
    ? SimpleFoldHistogramValues
    : F extends 'unique'
    ? number
    : CoronerValueType;

export type SimpleFold<O extends FoldOperator = FoldOperator> = {
    fold: O[0];
    rawFold: O;
    value: SimpleFoldValue<O[0]>;
};

export interface SimpleFoldAttributes {
    [key: string]: {
        [O in FoldOperator as O[0]]?: SimpleFold<O>[];
    } & {
        groupKey?: CoronerValueType;
    };
}

export interface SimpleFoldRow {
    readonly attributes: SimpleFoldAttributes;
    readonly count: number;

    fold<O extends FoldOperator>(attribute: string, ...fold: O): SimpleFoldValue<O[0]>;
    tryFold<O extends FoldOperator>(attribute: string, ...fold: O): SimpleFoldValue<O[0]> | undefined;

    group(attribute?: string): CoronerValueType | DefaultGroup;
    tryGroup(attribute?: string): CoronerValueType | DefaultGroup | undefined;
}

export interface SimpleFoldRows {
    readonly total: number;
    readonly rows: SimpleFoldRow[];

    fold<O extends FoldOperator>(attribute: string, ...fold: O): SimpleFoldValue<O[0]>[];
    tryFold<O extends FoldOperator>(attribute: string, ...fold: O): SimpleFoldValue<O[0]>[] | undefined;

    group(attribute?: string): CoronerValueType[] | DefaultGroup[];
    tryGroup(attribute?: string): CoronerValueType[] | DefaultGroup[] | undefined;
}

type FilterArray<T extends readonly any[], V> = T extends readonly [infer L, ...infer R]
    ? L extends V
        ? [L, ...FilterArray<R, V>]
        : [...FilterArray<R, V>]
    : T;
