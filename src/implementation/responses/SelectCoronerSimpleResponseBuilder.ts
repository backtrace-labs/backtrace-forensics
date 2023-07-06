import { CoronerValueType, SuccessfulRawCoronerResponse } from '../../coroner/common';
import { RawSelectQueryResponse, SimpleSelectRow, SimpleSelectRows } from '../../coroner/select';
import { ISelectCoronerSimpleResponseBuilder } from '../../interfaces/responses/ISelectCoronerSimpleResponseBuilder';
import { SimpleSelectRowObj } from './SimpleSelectRowObj';
import { SimpleSelectRowsObj } from './SimpleSelectRowsObj';

export class SelectCoronerSimpleResponseBuilder implements ISelectCoronerSimpleResponseBuilder {
    public first(response: SuccessfulRawCoronerResponse<RawSelectQueryResponse>): SimpleSelectRow | undefined {
        return this.buildRows(response, 1).rows[0];
    }

    public rows(response: SuccessfulRawCoronerResponse<RawSelectQueryResponse>): SimpleSelectRows {
        return this.buildRows(response);
    }

    private buildRows(
        rawResponse: SuccessfulRawCoronerResponse<RawSelectQueryResponse>,
        limit?: number,
    ): SimpleSelectRows {
        const response = rawResponse.response;
        const rowValues: Record<string, CoronerValueType>[] = [];
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
                    const row = rowValues[rIndex] ?? (rowValues[rIndex] = {});
                    row[columnDesc.name as keyof typeof row.values] = columnValue;
                }
            }
        }

        const rows = rowValues.map((r) => new SimpleSelectRowObj(r));
        return new SimpleSelectRowsObj(rows, total);
    }
}
