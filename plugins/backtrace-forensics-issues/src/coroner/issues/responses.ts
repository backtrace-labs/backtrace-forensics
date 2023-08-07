import { TicketState } from '@backtrace/forensics';

export interface OkCoronerIssueResponse {
    readonly id: number;
    readonly error?: undefined;
    readonly fingerprint: string;
    readonly state: TicketState;
    readonly invariants?: string;
    readonly invariant_reopen_count: number;
    readonly invariant_reopen_last_time: number;
    readonly tags: string;
    readonly ticket: string;
    readonly blame_last_modified: number;
    readonly blame: string;
}

export interface ErrorCoronerIssueResponse {
    readonly fingerprint: string;
    readonly error: string;
}

export interface OkCoronerIssuesResponse {
    readonly results: CoronerIssueResponse[];
    readonly error: undefined;
}

export interface ErrorCoronerIssuesResponse {
    readonly error: {
        readonly code: number;
        readonly message: string;
    };
}

export type CoronerIssueResponse = OkCoronerIssueResponse | ErrorCoronerIssueResponse;
export type CoronerIssuesResponse = OkCoronerIssuesResponse | ErrorCoronerIssuesResponse;
