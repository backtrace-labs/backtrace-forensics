import { AttributeType, AttributeValueType } from '../../common/attributes';
import { DefaultGroup, FoldOfRequest } from '../../queries';
import { CoronerValueType } from '../../requests/common';
import { BinFoldOperator, DistributionFoldOperator, FoldOperator, FoldQueryRequest, Folds } from '../../requests/fold';

export interface SimpleFoldDistributionValue<T extends AttributeType = AttributeType> {
    value: AttributeValueType<T>;
    count: number;
}

export interface SimpleFoldDistributionValues<T extends AttributeType = AttributeType> {
    keys: number;
    tail: number;
    values: SimpleFoldDistributionValue<T>[];
}

export interface SimpleFoldRangeValue<T extends AttributeType = AttributeType> {
    from: AttributeValueType<T>;
    to: AttributeValueType<T>;
}

export interface SimpleFoldBinValue<T extends AttributeType = AttributeType> {
    from: AttributeValueType<T>;
    to: AttributeValueType<T>;
    count: number;
}

export interface SimpleFoldHistogramValue<T extends AttributeType = AttributeType> {
    value: AttributeValueType<T>;
    count: number;
}

export type SimpleFoldValue<
    F extends FoldOperator[0] = FoldOperator[0],
    T extends AttributeType = AttributeType
> = F extends DistributionFoldOperator[0]
    ? SimpleFoldDistributionValues<T>
    : F extends BinFoldOperator[0]
    ? SimpleFoldBinValue<T>[]
    : F extends 'range'
    ? SimpleFoldRangeValue<T>
    : F extends 'histogram'
    ? SimpleFoldHistogramValue<T>[]
    : F extends 'unique'
    ? number
    : T;

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
