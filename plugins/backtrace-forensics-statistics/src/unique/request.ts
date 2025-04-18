import { CoronerQuery } from '@backtrace/forensics';

export interface UniqueEventsRequest {
    readonly query: CoronerQuery;
    readonly uniqueAttribute?: string | undefined;
}
