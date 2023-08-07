import {
    CoronerQuery,
    FailedQueryResponse,
    FoldCoronerQuery,
    QuerySource,
    SuccessfulFoldQueryResponse,
    Ticket,
    ValueConverter,
} from '@backtrace/forensics';

export interface CoronerIssueInfo {
    readonly fingerprint: string;
    readonly project: string;
    readonly tickets?: readonly Ticket[];
    readonly tags?: string;
}

export interface OkCoronerIssueInfoResult {
    readonly success: true;
    readonly issueInfo: CoronerIssueInfo[];
    readonly queryResult: SuccessfulFoldQueryResponse;
}

export interface FailedCoronerIssueInfoResult {
    readonly success: false;
    readonly queryResult: FailedQueryResponse;
}

export type CoronerIssueInfoResult = OkCoronerIssueInfoResult | FailedCoronerIssueInfoResult;

export function getIssueInformation(query: CoronerQuery | FoldCoronerQuery) {
    return async function getIssueInformation(source?: Partial<QuerySource>): Promise<CoronerIssueInfoResult> {
        const currentTable = query.json().table;
        const prefix = currentTable === 'issues' ? '' : 'fingerprint;issues;';

        // make sure that we have fingerprint group and issue data here
        const queryResult = await query
            .group('fingerprint')
            .fold(`${prefix}tags`, 'head')
            .fold(`${prefix}ticket`, 'head')
            .post(source);

        if (!queryResult.success) {
            return {
                success: false,
                queryResult,
            };
        }

        const project = queryResult.json()._.project;

        const issueInfo = queryResult.all().rows.map((row) => ({
            fingerprint: row.group() as string,
            project,
            tags: row.fold(`${prefix}tags`, 'head') as string,
            tickets: ValueConverter.toTickets(row.fold(`${prefix}ticket`, 'head')),
        }));

        return { success: true, issueInfo, queryResult };
    };
}
