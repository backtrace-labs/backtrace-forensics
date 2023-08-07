import { QuerySource } from '@backtrace/forensics';
import { IssueRequestResponse } from '../coroner';
import { IssuesRequest } from '../coroner/issues/requests';

export interface ICoronerIssueExecutor {
    execute(request: IssuesRequest[], source?: Partial<QuerySource>): Promise<IssueRequestResponse[]>;
}
