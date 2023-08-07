import {
    CoronerQuery,
    FailedQueryResponse,
    FoldCoronerQuery,
    QuerySource,
    SuccessfulFoldQueryResponse,
} from '@backtrace/forensics';
import { DeferredUpdateIssuesRequest, UpdateIssuesRequest } from '../../../coroner';
import { getIssueInformation } from './getIssueInformation';
import { reduceRequests } from './reduceRequests';
import { undeferRequestForRow } from './undeferRequests';

export interface OkIssueRequestsResult {
    readonly success: true;
    readonly requests: UpdateIssuesRequest[];
    readonly queryResult: SuccessfulFoldQueryResponse;
}

export interface FailedIssueRequestsResult {
    readonly success: false;
    readonly queryResult: FailedQueryResponse;
}

export type IssueRequestsResult = OkIssueRequestsResult | FailedIssueRequestsResult;

export type GetRequests = typeof getRequests;

export async function getRequests(
    deferredRequest: DeferredUpdateIssuesRequest,
    query: CoronerQuery | FoldCoronerQuery,
    source?: Partial<QuerySource>,
): Promise<IssueRequestsResult> {
    const issueInformation = await getIssueInformation(query)(source);
    if (!issueInformation.success) {
        return issueInformation;
    }

    const requests = issueInformation.issueInfo.map(undeferRequestForRow(deferredRequest));
    return {
        success: true,
        requests: reduceRequests(requests),
        queryResult: issueInformation.queryResult,
    };
}
