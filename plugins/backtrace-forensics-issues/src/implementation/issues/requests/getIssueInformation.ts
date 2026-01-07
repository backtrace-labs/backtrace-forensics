import {
    CoronerQuery,
    FoldCoronerQuery,
    FoldQueryResponse,
    QuerySource,
    Ticket,
    ValueConverter,
} from '@backtrace/forensics';
import { Result, pipe } from '@backtrace/utils';

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
    ): Promise<Result<CoronerIssueInfoResult, Error>> {
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

        return pipe(
            queryResult.data.all().rows.map((row) =>
                pipe(
                    ValueConverter.toTickets(row.fold(`${prefix}ticket`, 'head')),
                    Result.map((tickets) => ({
                        fingerprint: row.group() as string,
                        project,
                        tags: row.fold(`${prefix}tags`, 'head') as string,
                        tickets,
                    })),
                ),
            ),
            Result.flat,
            Result.map((issueInfo) => ({ issueInfo, queryResult: queryResult.data })),
        );
    };
}
