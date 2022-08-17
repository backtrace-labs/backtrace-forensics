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

export type SimpleFoldValue<V extends CoronerValueType, F extends FoldOperator<V>> = F extends DistributionFoldOperator
    ? SimpleFoldDistributionValues<V>
    : F extends BinFoldOperator
    ? SimpleFoldBinValue<V>[]
    : F extends ['range']
    ? SimpleFoldRangeValue<V>
    : F extends ['unique']
    ? number
    : V;

export type SimpleFoldValues<V extends CoronerValueType, F extends FoldOperator<V>> = {
    [K in F[0]]: SimpleFoldValue<V, F>;
};

export type SimpleFoldGroup<T extends Attribute, A extends keyof T, G extends keyof T | DefaultGroup> = A extends G
    ? {
          groupKey: T[A];
      }
    : {};

export type SimpleFoldAttributes<T extends Attribute, F extends Folds, G extends keyof T | DefaultGroup> = {
    [A in keyof T & keyof F & string]: SimpleFoldValues<
        T[A],
        // @ts-ignore - TS gives here an error, despite everything working correctly.
        F[A][1][number]
    > &
        SimpleFoldGroup<T, A, G>;
};

export interface SimpleFoldRow<T extends Attribute, F extends Folds, G extends keyof T | DefaultGroup> {
    attributes: SimpleFoldAttributes<T, F, G>;
    count: number;
}
