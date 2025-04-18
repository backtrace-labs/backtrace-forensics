import { NoUniqueAttributeError } from '../errors';
import { UniqueEventsRequest } from '../request';
import { Result } from '@backtrace/utils';

export type GetUniqueCountInReportsQuery = ReturnType<typeof uniqueCountInReportsQuery>;

export function uniqueCountInReportsQuery() {
    return function uniqueCountInReports(request: UniqueEventsRequest) {
        if (!request.uniqueAttribute) {
            return Result.err(new NoUniqueAttributeError());
        }

        return Result.ok(request.query.group('*').fold(request.uniqueAttribute, 'unique').limit(1));
    };
}
