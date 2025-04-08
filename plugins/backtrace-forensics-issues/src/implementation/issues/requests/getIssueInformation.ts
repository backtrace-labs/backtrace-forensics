import {
    CoronerError,
    CoronerQuery,
    FoldCoronerQuery,
    FoldQueryResponse,
    QuerySource,
    Ticket,
    ValueConverter,
} from '@backtrace/forensics';
import { Result } from '@backtrace/utils';

export interface CoronerIssueInfo {
    readonly fingerprint: string;
    readonly project: string;
    readonly tickets?: readonly Ticket[];
    readonly tags?: string;
}

export interface CoronerIssueInfoResult {
    readonly issueInfo: CoronerIssueInfo[];
    readonly queryResult: FoldQueryResponse;
}

export function getIssueInformation(query: CoronerQuery | FoldCoronerQuery) {
    return async function getIssueInformation(
        source?: Partial<QuerySource>,
    ): Promise<Result<CoronerIssueInfoResult, CoronerError>> {
        const currentTable = query.json().table;
        const prefix = currentTable === 'issues' ? '' : 'fingerprint;issues;';

        // make sure that we have fingerprint group and issue data here
        const queryResult = await query
            .group('fingerprint')
            .fold(`${prefix}tags`, 'head')
            .fold(`${prefix}ticket`, 'head')
            .post(source);

        if (Result.isErr(queryResult)) {
            return queryResult;
        }

        const project = queryResult.data.json()._.project;

        const issueInfo = queryResult.data.all().rows.map((row) => ({
            fingerprint: row.group() as string,
            project,
            tags: row.fold(`${prefix}tags`, 'head') as string,
            tickets: ValueConverter.toTickets(row.fold(`${prefix}ticket`, 'head')),
        }));

        return Result.ok({ issueInfo, queryResult: queryResult.data });
    };
}
