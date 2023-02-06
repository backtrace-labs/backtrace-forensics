import { CoronerValueType, SuccessfulRawCoronerResponse } from '../../coroner/common';
import { RawSelectQueryResponse, SimpleSelectRow, SimpleSelectRows } from '../../coroner/select';
import { ISelectCoronerSimpleResponseBuilder } from '../../interfaces/responses/ISelectCoronerSimpleResponseBuilder';

export class SelectCoronerSimpleResponseBuilder implements ISelectCoronerSimpleResponseBuilder {
    public first(response: SuccessfulRawCoronerResponse<RawSelectQueryResponse>): SimpleSelectRow | undefined {
        return this.buildRows(response, 1).rows[0];
    }

    public rows(response: SuccessfulRawCoronerResponse<RawSelectQueryResponse>): SimpleSelectRows {
        return this.buildRows(response);
    }

    private buildRows(
        rawResponse: SuccessfulRawCoronerResponse<RawSelectQueryResponse>,
        limit?: number
    ): SimpleSelectRows {
        const response = rawResponse.response;
        const rows: SimpleSelectRow[] = [];
        const total = rawResponse._.runtime.filter.rows;
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
                    const row: SimpleSelectRow =
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

        const result: SimpleSelectRows = {
            rows,
            total,
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
