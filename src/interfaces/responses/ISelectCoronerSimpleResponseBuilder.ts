import { SuccessfulRawCoronerResponse } from '../../coroner';
import { RawSelectQueryResponse, SimpleSelectRow, SimpleSelectRows } from '../../coroner/select';

export interface ISelectCoronerSimpleResponseBuilder {
    first(response: SuccessfulRawCoronerResponse<RawSelectQueryResponse>): SimpleSelectRow | undefined;
    rows(response: SuccessfulRawCoronerResponse<RawSelectQueryResponse>): SimpleSelectRows;
}
