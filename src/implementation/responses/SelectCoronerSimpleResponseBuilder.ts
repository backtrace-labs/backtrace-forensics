import { ISelectCoronerSimpleResponseBuilder } from '../../interfaces/responses/ISelectCoronerSimpleResponseBuilder';
import { Attribute } from '../../queries/common';
import { SelectQueryResponse } from '../../responses/select';
import { SimpleSelectRow } from '../../responses/simple/select';

export class SelectCoronerSimpleResponseBuilder implements ISelectCoronerSimpleResponseBuilder {
    public first<T extends Attribute, S extends string[] = []>(
        response: SelectQueryResponse<T, S>
    ): SimpleSelectRow<T, S> | undefined {
        return this.buildRows<T, S>(response, 1)[0];
    }

    public toArray<T extends Attribute, S extends string[] = []>(
        response: SelectQueryResponse<T, S>
    ): SimpleSelectRow<T, S>[] {
        return this.buildRows<T, S>(response);
    }

    private buildRows<T extends Attribute, S extends string[] = []>(
        response: SelectQueryResponse<T, S>,
        limit?: number
    ): SimpleSelectRow<T, S>[] {
        const results: SimpleSelectRow<T, string[]>[] = [];
        for (let cIndex = 0; cIndex < response.columns_desc.length; cIndex++) {
            const columnDesc = response.columns_desc[cIndex];
            const columnValues = response.values[cIndex];
            if (!columnValues) {
                continue;
            }

            let rIndex = 0;
            for (let i = 1; i < columnValues.length && (limit == null || i < limit + 1); i++) {
                const columnValue = columnValues[i][0] as T[string];
                const columnCount = columnValues[i][1] as number;

                for (let j = 0; j < columnCount; j++, rIndex++) {
                    const result = results[rIndex] ?? (results[rIndex] = {});
                    result[columnDesc.name] = columnValue;
                }
            }
        }
        return results;
    }
}
