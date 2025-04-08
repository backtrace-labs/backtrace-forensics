import { CoronerError, CoronerQuery, FoldCoronerQuery, FoldQueryResponse, QuerySource } from '@backtrace/forensics';
import { DeferredUpdateIssuesRequest, UpdateIssuesRequest } from '../../../coroner';
import { getIssueInformation } from './getIssueInformation';
import { reduceRequests } from './reduceRequests';
import { undeferRequestForRow } from './undeferRequests';
import { Result } from '@backtrace/utils';

export interface IssueRequestsResult {
    readonly requests: UpdateIssuesRequest[];
    readonly queryResult: FoldQueryResponse;
}

export type GetRequests = typeof getRequests;

export async function getRequests(
    deferredRequest: DeferredUpdateIssuesRequest,
    query: CoronerQuery | FoldCoronerQuery,
    source?: Partial<QuerySource>,
): Promise<Result<IssueRequestsResult, CoronerError>> {
    const issueInformation = await getIssueInformation(query)(source);
    if (Result.isErr(issueInformation)) {
        return issueInformation;
    }

    const requests = issueInformation.data.issueInfo.map(undeferRequestForRow(deferredRequest));
    return Result.ok({
        success: true,
        requests: reduceRequests(requests),
        queryResult: issueInformation.data.queryResult,
    });
}
