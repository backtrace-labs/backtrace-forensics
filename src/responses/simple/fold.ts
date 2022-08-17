import { Attribute } from '../../queries/common';
import { DefaultGroup } from '../../queries/fold';
import { CoronerValueType } from '../../requests/common';
import { BinFoldOperator, DistributionFoldOperator, FoldOperator, Folds } from '../../requests/fold';

export interface SimpleFoldDistributionValue<V extends CoronerValueType> {
    value: V;
    count: number;
}

export interface SimpleFoldDistributionValues<V extends CoronerValueType> {
    keys: number;
    tail: number;
    values: SimpleFoldDistributionValue<V>[];
}

export interface SimpleFoldRangeValue<V extends CoronerValueType> {
    from: V;
    to: V;
}

export interface SimpleFoldBinValue<V extends CoronerValueType> {
    from: V;
    to: V;
    count: number;
}

export type SimpleFoldValue<T extends Attribute, A extends keyof T & string, F extends FoldOperator<T[A]>> = {
    [K in F[0]]: F extends DistributionFoldOperator
        ? SimpleFoldDistributionValues<T[A]>
        : F extends BinFoldOperator
        ? SimpleFoldBinValue<T[A]>
        : F extends ['range']
        ? SimpleFoldRangeValue<T[A]>
        : F extends ['unique']
        ? number
        : T[A];
};

export type SimpleFoldGroup<T extends Attribute, A extends keyof T, G extends keyof T | DefaultGroup> = A extends G
    ? {
          groupKey: T[A];
      }
    : {};

export type SimpleFoldAttributes<T extends Attribute, F extends Folds, G extends keyof T | DefaultGroup> = {
    [A in keyof T & keyof F & string]: SimpleFoldValue<
        T,
        A,
        // @ts-ignore - TS gives here an error, despite everything working correctly.
        F[A][1][number]
    > &
        SimpleFoldGroup<T, A, G>;
};

export interface SimpleFoldRow<T extends Attribute, F extends Folds, G extends keyof T | DefaultGroup> {
    attributes: SimpleFoldAttributes<T, F, G>;
    count: number;
}
