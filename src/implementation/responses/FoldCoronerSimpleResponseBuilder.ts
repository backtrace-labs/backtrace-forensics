import {
    BinQueryColumnValue,
    DistributionQueryColumnValue,
    FoldOperator,
    FoldQueryRequest,
    HistogramQueryColumnValue,
    RangeQueryColumnValue,
    RawFoldQueryResponse,
    SimpleFold,
    SimpleFoldAttributes,
    SimpleFoldBinValue,
    SimpleFoldBinValues,
    SimpleFoldDistributionValue,
    SimpleFoldDistributionValues,
    SimpleFoldHistogramValue,
    SimpleFoldHistogramValues,
    SimpleFoldRangeValue,
    SimpleFoldRow,
    SimpleFoldRows,
    SimpleFoldValue,
} from '../../coroner/fold';
import { IFoldCoronerSimpleResponseBuilder } from '../../interfaces/responses/IFoldCoronerSimpleResponseBuilder';
import { SimpleFoldRowsObj } from './SImpleFoldRowsObj';
import { SimpleFoldRowObj } from './SimpleFoldRowObj';

export class FoldCoronerSimpleResponseBuilder implements IFoldCoronerSimpleResponseBuilder {
    public first(response: RawFoldQueryResponse, request?: FoldQueryRequest): SimpleFoldRow | undefined {
        return this.buildRows(response, request, 1).rows[0];
    }

    public rows(response: RawFoldQueryResponse, request?: FoldQueryRequest): SimpleFoldRows {
        return this.buildRows(response, request);
    }

    private buildRows(response: RawFoldQueryResponse, request?: FoldQueryRequest, limit?: number): SimpleFoldRows {
        const keyDescription = response.factors_desc ? response.factors_desc[0] : null;
        const rows: SimpleFoldRow[] = [];
        const total = response.cardinalities?.pagination.groups ?? 0;

        for (let i = 0; i < response.values.length && (limit == null || i < limit); i++) {
            const group = response.values[i];
            const groupKey = group[0];
            const groupColumns = group[1];
            const groupCount = group[2];

            const attributes = {} as SimpleFoldAttributes;

            if (keyDescription) {
                const key = keyDescription.name as keyof typeof attributes;
                if (!attributes[key]) {
                    attributes[key] = { groupKey };
                } else {
                    attributes[key].groupKey = groupKey;
                }
            }

            for (let cIndex = 0; cIndex < response.columns_desc.length; cIndex++) {
                const columnDesc = response.columns_desc[cIndex];
                if (!columnDesc.op) {
                    throw new Error(`Expected 'op' property in column_desc.`);
                }

                const columnValue = this.getColumnValue(columnDesc.op, groupColumns[cIndex]);
                if (columnValue === undefined) {
                    continue;
                }

                const key = columnDesc.name;
                const op = columnDesc.op as FoldOperator[0];

                let attribute = attributes[key];
                if (!attribute) {
                    attribute = attributes[key] = {} as typeof attribute;
                }

                const rawFold = request ? this.getRawFold(request, response, key, op, cIndex) : undefined;

                const fold: SimpleFold = {
                    fold: op,
                    rawFold: rawFold ?? ([op] as any),
                    value: columnValue,
                };

                let attributeFold = attribute[op];
                if (!attributeFold) {
                    attribute[op] = [fold] as any;
                } else {
                    attribute[op] = [...attributeFold, fold] as any;
                }
            }

            rows.push(new SimpleFoldRowObj(attributes, groupCount));
        }

        return new SimpleFoldRowsObj(rows, total);
    }

    private getRawFold(
        request: FoldQueryRequest,
        response: RawFoldQueryResponse,
        attribute: string,
        operator: FoldOperator[0],
        columnIndex: number,
    ) {
        const folds = request.fold && request.fold[attribute];
        if (!folds) {
            return undefined;
        }

        let foldCount = 0;
        for (let i = 0; i < columnIndex + 1; i++) {
            const { name, op } = response.columns_desc[i];
            if (name === attribute && op === operator) {
                foldCount++;
            }
        }

        for (let i = 0; i < folds.length; i++) {
            const op = folds[i][0];
            if (op === operator) {
                foldCount--;
            }

            if (foldCount === 0) {
                return folds[i];
            }
        }

        return undefined;
    }

    private getColumnValue(op: string, columnValue: unknown[]): SimpleFoldValue | undefined {
        if (!columnValue) {
            return undefined;
        }

        switch (op) {
            case 'distribution': {
                const distribution = columnValue[0] as DistributionQueryColumnValue[0];
                const result: SimpleFoldDistributionValues = {
                    keys: distribution.keys,
                    tail: distribution.tail ?? 0,
                    values: distribution.vals.reduce((c, v) => {
                        c.push({
                            value: v[0],
                            count: v[1],
                            raw: v,
                        });
                        return c;
                    }, [] as SimpleFoldDistributionValue[]),
                    raw: [distribution],
                };
                return result;
            }
            case 'bin': {
                const bin = columnValue as BinQueryColumnValue;
                const values: SimpleFoldBinValue[] = bin.map((m) => ({
                    from: m[0],
                    to: m[1],
                    count: m[2],
                    raw: m,
                }));
                const result: SimpleFoldBinValues = {
                    values,
                    raw: bin,
                };
                return result;
            }
            case 'range': {
                const range = columnValue as RangeQueryColumnValue;
                const result: SimpleFoldRangeValue = {
                    from: range[0],
                    to: range[1],
                    raw: range,
                };
                return result;
            }
            case 'histogram': {
                const histogram = columnValue as HistogramQueryColumnValue;
                const values: SimpleFoldHistogramValue[] = histogram.map((h) => ({
                    value: h[0],
                    count: h[1],
                    raw: h,
                }));

                const result: SimpleFoldHistogramValues = {
                    values,
                    raw: histogram,
                };
                return result;
            }
            case 'unique':
            default:
                return (columnValue[0] ?? null) as SimpleFoldValue;
        }
    }
}
