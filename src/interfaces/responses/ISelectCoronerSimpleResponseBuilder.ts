import { Attribute } from '../../queries/common';
import { SelectQueryResponse } from '../../responses/select';
import { SimpleSelectRow } from '../../responses/simple/select';

export interface ISelectCoronerSimpleResponseBuilder {
    first<T extends Attribute, S extends string[] = []>(
        response: SelectQueryResponse<T, S>
    ): SimpleSelectRow<T, S> | undefined;

    toArray<T extends Attribute, S extends string[] = []>(response: SelectQueryResponse<T, S>): SimpleSelectRow<T, S>[];
}
