import { QuerySource } from '@backtrace/forensics';
import { Result } from '@backtrace/utils';
import { UniqueCounts } from './models';

export interface UniqueMetricsQuery {
    uniqueAttribute(name: string): UniqueMetricsQuery;

    getCountInEvents(source?: QuerySource): Promise<Result<number, Error>>;
    getCountInReports(source?: QuerySource): Promise<Result<number, Error>>;
    getCounts(source?: QuerySource): Promise<Result<UniqueCounts, Error>>;
}
