import { inspect } from 'util';
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

            const row: SimpleFoldRow = {
                attributes,
                count: groupCount,
                fold(attribute, ...search) {
                    const result = row.tryFold(attribute, ...search);
                    if (result === undefined) {
                        throw new Error(`Attribute "${attribute}" or fold ${JSON.stringify(search)} does not exist.`);
                    }
                    return result;
                },
                tryFold: <O extends FoldOperator>(
                    attribute: string,
                    ...search: O
                ): SimpleFoldValue<O[0]> | undefined => {
                    const result = this.filterFolds(row, attribute, ...search);
                    if (result.length > 1) {
                        throw new Error(
                            'Ambiguous results found. This can happen when there are two columns with the same fold operator. ' +
                                'Try providing the built request to the simple response builder.'
                        );
                    }

                    return result[0] as SimpleFoldValue<O[0]> | undefined;
                },
                group(attribute) {
                    const result = row.tryGroup(attribute);
                    if (result === undefined) {
                        throw new Error(`Attribute "${attribute}" does not exist or wasn't grouped on.`);
                    }
                    return result;
                },
                tryGroup(attribute?: string) {
                    if (attribute === '*') {
                        attribute = undefined;
                    }

                    for (const key in row.attributes) {
                        if (attribute != null && key !== attribute) {
                            continue;
                        }

                        const attributeValues = row.attributes[key];
                        if ('groupKey' in attributeValues) {
                            return attributeValues.groupKey;
                        }
                    }

                    if (!attribute) {
                        return '*';
                    }

                    return undefined;
                },
            };

            rows.push(row);
        }

        const result: SimpleFoldRows = {
            rows,
            fold(attribute, ...search) {
                return rows.map((r) => r.fold(attribute, ...search));
            },
            tryFold(attribute: string, ...search: FoldOperator) {
                const result = rows.map((r) => r.tryFold(attribute, ...search));
                if (result.some((r) => r === undefined)) {
                    // all overloads accept undefined as return param, but TS fails for some reason
                    return undefined as any;
                }
                return result;
            },
            group(attribute) {
                const group = result.tryGroup(attribute);
                if (!group) {
                    throw new Error(`Attribute "${attribute}" does not exist or wasn't grouped on.`);
                }
                return group;
            },
            tryGroup(attribute?: string) {
                const result = rows.map((r) => r.tryGroup(attribute));
                if (result.some((r) => r === undefined)) {
                    // all overloads accept undefined as return param, but TS fails for some reason
                    return undefined as any;
                }
                return result;
            },
        };

        return result as unknown as SimpleFoldRows;
    }

    private filterFolds(row: SimpleFoldRow, attribute: string, ...search: FoldOperator): SimpleFoldValue[] {
        const result: SimpleFoldValue[] = [];
        if (!row.attributes[attribute] || !row.attributes[attribute][search[0]]) {
            return result;
        }

        const searchKey = search.join(';');
        const folds = row.attributes[attribute][search[0]];
        if (!folds) {
            return [];
        }

        for (const fold of folds) {
            const foldKey = fold.rawFold.join(';');

            // Exact match, return the value
            if (searchKey === foldKey) {
                return [fold.value];
            }

            // Partial match, add and continue
            if (searchKey.startsWith(foldKey)) {
                result.push(fold.value);
            }
        }

        return result;
    }

    private getRawFold(
        request: FoldQueryRequest,
        response: RawFoldQueryResponse,
        attribute: string,
        operator: FoldOperator[0],
        columnIndex: number
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
