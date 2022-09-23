import { inspect } from 'util';
import { IFoldCoronerSimpleResponseBuilder } from '../../interfaces/responses/IFoldCoronerSimpleResponseBuilder';
import { FoldOperator, FoldQueryRequest, Folds } from '../../requests/fold';
import {
    BinQueryColumnValue,
    DistributionQueryColumnValue,
    HistogramQueryColumnValue,
    RangeQueryColumnValue,
    RawFoldQueryResponse,
} from '../../responses/fold';
import {
    SimpleFold,
    SimpleFoldAttributes,
    SimpleFoldBinValue,
    SimpleFoldDistributionValue,
    SimpleFoldDistributionValues,
    SimpleFoldGroup,
    SimpleFoldHistogramValue,
    SimpleFoldRangeValue,
    SimpleFoldRow,
    SimpleFoldRows,
    SimpleFoldValue,
} from '../../responses/simple/fold';

export class FoldCoronerSimpleResponseBuilder implements IFoldCoronerSimpleResponseBuilder {
    public first<R extends FoldQueryRequest>(
        response: RawFoldQueryResponse<R>,
        request?: R,
    ): SimpleFoldRow<R> | undefined {
        return this.buildRows<R>(response, request, 1).rows[0];
    }

    public rows<R extends FoldQueryRequest>(response: RawFoldQueryResponse<R>, request?: R): SimpleFoldRows<R> {
        return this.buildRows<R>(response, request);
    }

    private buildRows<R extends FoldQueryRequest>(
        response: RawFoldQueryResponse<R>,
        request?: R,
        limit?: number,
    ): SimpleFoldRows<R> {
        const keyDescription = response.factors_desc ? response.factors_desc[0] : null;
        const rows: SimpleFoldRow<FoldQueryRequest>[] = [];

        for (let i = 0; i < response.values.length && (limit == null || i < limit); i++) {
            const group = response.values[i];
            const groupKey = group[0];
            const groupColumns = group[1];
            const groupCount = group[2];

            const attributes = {} as SimpleFoldAttributes<Folds, string[]>;

            if (keyDescription) {
                const key = keyDescription.name as keyof typeof attributes;
                if (!attributes[key]) {
                    (attributes[key] as SimpleFoldGroup<string, string[]>) = {
                        groupKey,
                    };
                } else {
                    (attributes[key] as SimpleFoldGroup<string, string[]>).groupKey = groupKey;
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

                const key = columnDesc.name as keyof typeof attributes;
                const op = columnDesc.op as FoldOperator[0];

                let attribute = attributes[key];
                if (!attribute) {
                    attribute = attributes[key] = {} as typeof attribute;
                }

                const rawFold = request ? this.getRawFold(request, response, key, op, cIndex) : undefined;

                const fold: SimpleFold<FoldOperator[]>[number] = {
                    fold: op,
                    rawFold: rawFold ?? ([op] as any),
                    value: columnValue,
                };

                let attributeFold = attribute[op];
                if (!attributeFold) {
                    attribute[op] = [fold] as typeof attributeFold;
                } else {
                    attribute[op] = [...attributeFold, fold] as any;
                }
            }

            const row: SimpleFoldRow<FoldQueryRequest> = {
                attributes,
                count: groupCount,
                fold(attribute, ...search) {
                    const result = row.tryFold(attribute, ...search);
                    if (result === undefined) {
                        throw new Error(`Attribute "${attribute}" or fold ${inspect(search)} does not exist.`);
                    }
                    return result;
                },
                tryFold: (attribute: string, ...search: FoldOperator) => {
                    const result = this.filterFolds(row, attribute, ...search);
                    if (result.length > 1) {
                        throw new Error(
                            'Ambiguous results found. This can happen when there are two columns with the same fold operator. ' +
                                'Try providing the built request to the simple response builder.',
                        );
                    }

                    return result[0];
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

        const result: SimpleFoldRows<FoldQueryRequest> = {
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

        return result as unknown as SimpleFoldRows<R>;
    }

    private filterFolds(row: SimpleFoldRow<FoldQueryRequest>, attribute: string, ...search: FoldOperator) {
        const result: SimpleFoldValue[] = [];
        if (!row.attributes[attribute] || !row.attributes[attribute][search[0]]) {
            return result;
        }

        const searchKey = search.join(';');
        const folds = row.attributes[attribute][search[0]];
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

        // const foldValues: Record<string, SimpleFoldValue> = {};
        // for (const fold of folds) {
        //     for (let i = 0; i < fold.rawFold.length; i++) {
        //         // As Coroner doesn't return provided arguments for specific folds,
        //         // we have to pull these from the request. If the request is not provided though,
        //         // we have no method of resolving this. So, if the first argument is equal,
        //         // and the second is undefined, we still return this value.
        //         const currentFold = fold.rawFold[i];
        //         if (i > 0 && !currentFold) {
        //             result.push(fold.value);
        //             break;
        //         }

        //         const searchedFold = search[i];
        //         if (currentFold !== searchedFold) {
        //             break;
        //         }

        //         // If we're at the last element, and we got here, this means we found the value
        //         if (i === fold.rawFold.length - 1) {
        //             result.push(fold.value);
        //         }
        //     }
        // }

        // return result;
    }

    private getRawFold<R extends FoldQueryRequest>(
        request: R,
        response: RawFoldQueryResponse<R>,
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

    private getColumnValue(op: string, columnValue: unknown[]): SimpleFoldValue<FoldOperator[0]> | undefined {
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
                        });
                        return c;
                    }, [] as SimpleFoldDistributionValue[]),
                };
                return result;
            }
            case 'bin': {
                const bin = columnValue as BinQueryColumnValue;
                const result: SimpleFoldBinValue[] = bin.map((m) => ({
                    from: m[0],
                    to: m[1],
                    count: m[2],
                }));
                return result;
            }
            case 'range': {
                const range = columnValue as RangeQueryColumnValue;
                const result: SimpleFoldRangeValue = {
                    from: range[0],
                    to: range[1],
                };
                return result;
            }
            case 'histogram': {
                const histogram = columnValue as HistogramQueryColumnValue;
                const result: SimpleFoldHistogramValue[] = histogram.map((h) => ({
                    value: h[0],
                    count: h[1],
                }));
                return result;
            }
            case 'unique':
            default:
                return (columnValue[0] ?? null) as SimpleFoldValue;
        }
    }
}
