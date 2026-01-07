import { QuerySource } from '@backtrace/forensics';
import { IssueRequestResponse } from '../coroner';
import { UpdateIssuesRequest } from '../coroner/issues/requests';
import { Result } from '@backtrace/utils';
export interface ICoronerIssueExecutor {
    execute(
        request: UpdateIssuesRequest[],
        source?: Partial<QuerySource>,
    ): Promise<Result<IssueRequestResponse[], Error>>;
}
