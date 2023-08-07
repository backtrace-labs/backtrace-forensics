import { QuerySource } from '@backtrace/forensics';
import { UpdateIssuesRequest } from '../../coroner';
import { ICoronerIssueExecutor } from '../../interfaces/ICoronerIssueExecutor';

export type PostRequests = ReturnType<typeof postRequests>;

export function postRequests(issueExecutor: ICoronerIssueExecutor) {
    return async function post(requests: UpdateIssuesRequest[], source?: Partial<QuerySource>) {
        return await issueExecutor.execute(requests, source);
    };
}
