import { RawSelectQueryResponse, SimpleSelectRow, SimpleSelectRows } from '../../coroner/select';

export interface ISelectCoronerSimpleResponseBuilder {
    first(response: RawSelectQueryResponse): SimpleSelectRow | undefined;
    rows(response: RawSelectQueryResponse): SimpleSelectRows;
}
