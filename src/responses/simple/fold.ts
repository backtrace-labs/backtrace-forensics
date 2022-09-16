import { DefaultGroup, FoldOfRequest } from '../../queries';
import { CoronerValueType } from '../../requests/common';
import { BinFoldOperator, DistributionFoldOperator, FoldOperator, FoldQueryRequest, Folds } from '../../requests/fold';

export interface SimpleFoldDistributionValue<V extends CoronerValueType = CoronerValueType> {
    value: V;
    count: number;
}

export interface SimpleFoldDistributionValues<V extends CoronerValueType = CoronerValueType> {
    keys: number;
    tail: number;
    values: SimpleFoldDistributionValue<V>[];
}

export interface SimpleFoldRangeValue<V extends CoronerValueType = CoronerValueType> {
    from: V;
    to: V;
}

export interface SimpleFoldBinValue<V extends CoronerValueType = CoronerValueType> {
    from: V;
    to: V;
    count: number;
}

export interface SimpleFoldHistogramValue<V extends CoronerValueType = CoronerValueType> {
    value: V;
    count: number;
}

export type SimpleFoldValue<
    F extends FoldOperator[0] = FoldOperator[0],
    V extends CoronerValueType = CoronerValueType
> = F extends DistributionFoldOperator[0]
    ? SimpleFoldDistributionValues<V>
    : F extends BinFoldOperator[0]
    ? SimpleFoldBinValue<V>[]
    : F extends 'range'
    ? SimpleFoldRangeValue<V>
    : F extends 'histogram'
    ? SimpleFoldHistogramValue<V>[]
    : F extends 'unique'
    ? number
    : V;

export type SimpleFoldGroup<A extends string, G extends readonly string[]> = A extends G[0]
    ? {
          groupKey: CoronerValueType;
      }
    : {};

export type SimpleFold<O extends readonly FoldOperator[], F extends FoldOperator = FoldOperator> = {
    [I in keyof O]: {
        fold: F[0];
        rawFold: F;
        value: SimpleFoldValue<F[0]>;
    };
};

export type SimpleFoldAttribute<O extends readonly FoldOperator[]> = {
    [I in O[number] as I[0]]: SimpleFold<FilterArray<O, [I[0], ...any[]]>, I>;
};

export type SimpleFoldAttributes<F extends Folds, G extends readonly string[]> = {
    [A in (keyof F & string) | (G[number] & string)]: (F extends Record<A, infer O extends readonly FoldOperator[]>
        ? SimpleFoldAttribute<O>
        : {}) &
        SimpleFoldGroup<A, G>;
};

export interface SimpleFoldRow<R extends FoldQueryRequest> {
    attributes: SimpleFoldAttributes<FoldOfRequest<R>, NonNullable<R['group']>>;
    count: number;

    fold<A extends keyof FoldOfRequest<R>, O extends FoldOfRequest<R>[A][number]>(
        attribute: A,
        ...fold: O
    ): SimpleFoldValue<O[0]>;
    tryFold<A extends keyof FoldOfRequest<R>, O extends FoldOfRequest<R>[A][number]>(
        attribute: A,
        ...fold: O
    ): SimpleFoldValue<O[0]> | undefined;
    tryFold<O extends FoldOperator>(attribute: string, ...fold: O): SimpleFoldValue<O[0]> | undefined;

    group<A extends NonNullable<R['group']>[number]>(attribute?: A): CoronerValueType | DefaultGroup;
    tryGroup<A extends NonNullable<R['group']>[number]>(attribute?: A): CoronerValueType | DefaultGroup | undefined;
    tryGroup(attribute?: string): CoronerValueType | DefaultGroup | undefined;
}

export interface SimpleFoldRows<R extends FoldQueryRequest> {
    rows: SimpleFoldRow<R>[];

    fold<A extends keyof FoldOfRequest<R>, O extends FoldOfRequest<R>[A][number]>(
        attribute: A,
        ...fold: O
    ): SimpleFoldValue<O[0]>[];
    tryFold<A extends keyof FoldOfRequest<R>, O extends FoldOfRequest<R>[A][number]>(
        attribute: A,
        ...fold: O
    ): SimpleFoldValue<O[0]>[] | undefined;
    tryFold<O extends FoldOperator>(attribute: string, ...fold: O): SimpleFoldValue<O[0]>[] | undefined;

    group<A extends NonNullable<R['group']>[number]>(attribute?: A): CoronerValueType | DefaultGroup;
    tryGroup<A extends NonNullable<R['group']>[number]>(attribute?: A): CoronerValueType | DefaultGroup | undefined;
    tryGroup(attribute?: string): CoronerValueType | DefaultGroup | undefined;
}

type FilterArray<T extends readonly any[], V> = T extends readonly [infer L, ...infer R]
    ? L extends V
        ? [L, ...FilterArray<R, V>]
        : [...FilterArray<R, V>]
    : T;
