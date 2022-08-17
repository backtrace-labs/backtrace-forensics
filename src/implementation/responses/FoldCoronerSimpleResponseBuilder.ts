import { IFoldCoronerSimpleResponseBuilder } from '../../interfaces/responses/IFoldCoronerSimpleResponseBuilder';
import { Attribute } from '../../queries/common';
import { DefaultGroup } from '../../queries/fold';
import { CoronerValueType } from '../../requests/common';
import { FoldOperator, Folds } from '../../requests/fold';
import {
    BinQueryColumnValue,
    DistributionQueryColumnValue,
    FoldQueryResponse,
    RangeQueryColumnValue,
} from '../../responses/fold';
import {
    SimpleFoldAttributes,
    SimpleFoldBinValue,
    SimpleFoldDistributionValue,
    SimpleFoldDistributionValues,
    SimpleFoldGroup,
    SimpleFoldRangeValue,
    SimpleFoldRow,
    SimpleFoldValue,
} from '../../responses/simple/fold';

export class FoldCoronerSimpleResponseBuilder implements IFoldCoronerSimpleResponseBuilder {
    public first<T extends Attribute, F extends Folds = never, G extends string | DefaultGroup = '*'>(
        response: FoldQueryResponse<T, F, G>
    ): SimpleFoldRow<T, F, G> | undefined {
        return this.buildRows<T, F, G>(response, 1)[0];
    }

    public toArray<T extends Attribute, F extends Folds = never, G extends string | DefaultGroup = '*'>(
        response: FoldQueryResponse<T, F, G>
    ): SimpleFoldRow<T, F, G>[] {
        return this.buildRows<T, F, G>(response);
    }

    private buildRows<T extends Attribute, F extends Folds = never, G extends string | DefaultGroup = '*'>(
        response: FoldQueryResponse<T, F, G>,
        limit?: number
    ): SimpleFoldRow<T, F, G>[] {
        const keyDescription = response.factors_desc ? response.factors_desc[0] : null;
        const results: SimpleFoldRow<T, F, G>[] = [];

        for (let i = 0; i < response.values.length && (limit == null || i < limit); i++) {
            const group = response.values[i];
            const groupKey = group[0];
            const groupColumns = group[1];
            const groupCount = group[2];

            const attributes = {} as SimpleFoldAttributes<T, F, G>;

            if (keyDescription) {
                const key = keyDescription.name as keyof typeof attributes;
                if (!attributes[key]) {
                    (attributes[key] as unknown as SimpleFoldGroup<T, string, string>) = {
                        groupKey: groupKey as unknown as T[string],
                    };
                } else {
                    (attributes[key] as unknown as SimpleFoldGroup<T, string, string>).groupKey =
                        groupKey as unknown as T[string];
                }
            }

            for (let cIndex = 0; cIndex < response.columns_desc.length; cIndex++) {
                const columnDesc = response.columns_desc[cIndex];
                if (!columnDesc.op) {
                    throw new Error(`Expected 'op' property in column_desc.`);
                }

                const columnValue = this.getColumnValue(columnDesc.op, groupColumns[cIndex]);
                const key = columnDesc.name as keyof typeof attributes;
                const op = columnDesc.op as keyof typeof attributes[typeof key];
                if (!attributes[key]) {
                    attributes[key] = { [op]: columnValue } as typeof attributes[typeof key];
                } else if (!attributes[key][op]) {
                    attributes[key][op] = columnValue as typeof attributes[typeof key][typeof op];
                }
            }

            const row: SimpleFoldRow<T, F, G> = {
                attributes,
                count: groupCount,
            };

            results.push(row);
        }

        return results;
    }

    private getColumnValue<V extends CoronerValueType, F extends FoldOperator<V>>(
        op: string,
        columnValue: unknown[]
    ): SimpleFoldValue<V, F> | undefined {
        if (!columnValue) {
            return undefined;
        }

        switch (op) {
            case 'distribution': {
                const distribution = columnValue[0] as DistributionQueryColumnValue<V>[0];
                const result: SimpleFoldDistributionValues<V> = {
                    keys: distribution.keys,
                    tail: distribution.tail ?? 0,
                    values: distribution.vals.reduce((c, v) => {
                        c.push({
                            value: v[0],
                            count: v[1],
                        });
                        return c;
                    }, [] as SimpleFoldDistributionValue<V>[]),
                };
                return result as SimpleFoldValue<V, F>;
            }
            case 'bin': {
                const bin = columnValue as BinQueryColumnValue;
                const result: SimpleFoldBinValue<CoronerValueType>[] = bin.map((m) => ({
                    from: m[0],
                    to: m[1],
                    count: m[2],
                }));
                return result as SimpleFoldValue<V, F>;
            }
            case 'range': {
                const range = columnValue as RangeQueryColumnValue<CoronerValueType>;
                const result: SimpleFoldRangeValue<CoronerValueType> = {
                    from: range[0],
                    to: range[1],
                };
                return result as SimpleFoldValue<V, F>;
            }
            case 'unique':
            default:
                return (columnValue[0] as SimpleFoldValue<V, F>) ?? undefined;
        }
    }
}
