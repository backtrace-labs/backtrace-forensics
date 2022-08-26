import { ISelectCoronerSimpleResponseBuilder } from '../../interfaces/responses/ISelectCoronerSimpleResponseBuilder';
import { CoronerValueType } from '../../requests';
import { SelectQueryRequest } from '../../requests/select';
import { SelectQueryResponse } from '../../responses/select';
import { SimpleSelectRow, SimpleSelectRows } from '../../responses/simple/select';

export class SelectCoronerSimpleResponseBuilder implements ISelectCoronerSimpleResponseBuilder {
    public first<R extends SelectQueryRequest>(response: SelectQueryResponse<R>): SimpleSelectRow<R> | undefined {
        return this.buildRows<R>(response, 1).rows[0];
    }

    public rows<R extends SelectQueryRequest>(response: SelectQueryResponse<R>): SimpleSelectRows<R> {
        return this.buildRows<R>(response);
    }

    private buildRows<R extends SelectQueryRequest>(
        response: SelectQueryResponse<R>,
        limit?: number
    ): SimpleSelectRows<R> {
        const rows: SimpleSelectRow<R>[] = [];
        for (let cIndex = 0; cIndex < response.columns_desc.length; cIndex++) {
            const columnDesc = response.columns_desc[cIndex];
            const columnValues = response.values[cIndex];
            if (!columnValues) {
                continue;
            }

            let rIndex = 0;
            for (let i = 1; i < columnValues.length && (limit == null || i < limit + 1); i++) {
                const columnValue = columnValues[i][0];
                const columnCount = columnValues[i][1] as number;

                for (let j = 0; j < columnCount; j++, rIndex++) {
                    const row: SimpleSelectRow<R> =
                        rows[rIndex] ??
                        (rows[rIndex] = {
                            values: {} as never,
                            select(attribute: string) {
                                if (!(attribute in row.values)) {
                                    throw new Error(`Attribute "${attribute}" does not exist.`);
                                }

                                const value = row.trySelect(attribute);
                                if (value === undefined) {
                                    throw new Error(`Value for attribute "${attribute} does not exist.`);
                                }

                                return value;
                            },
                            trySelect(attribute) {
                                return row.values[attribute as keyof typeof row.values];
                            },
                        });

                    row.values[columnDesc.name as keyof typeof row.values] = columnValue;
                }
            }
        }

        const result: SimpleSelectRows<R> = {
            rows,
            select(attribute: string) {
                return rows.map((r) => r.select(attribute));
            },
            trySelect(attribute: string) {
                const result = rows.map((r) => r.trySelect(attribute));
                if (result.some((r) => r === undefined)) {
                    return undefined as any;
                }
                return result as CoronerValueType[];
            },
        };

        return result;
    }
}
