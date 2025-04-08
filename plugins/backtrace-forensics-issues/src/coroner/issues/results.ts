import { FoldQueryResponse, IssueInvariant, Ticket, TicketAssignee, TicketState } from '@backtrace/forensics';
import { UpdateIssuesRequest } from './requests';
import {
    CoronerIssuesResponse,
    ErrorCoronerIssueResponse,
    ErrorCoronerIssuesResponse,
    OkCoronerIssueResponse,
    OkCoronerIssuesResponse,
} from './responses';

export interface OkIssueResult {
    readonly id: number;
    readonly error?: never;
    readonly fingerprint: string;
    readonly state: TicketState;
    readonly invariants?: IssueInvariant[];
    readonly invariant_reopen_count: number;
    readonly invariant_reopen_last_time?: Date;
    readonly assignees?: TicketAssignee[];
    readonly tags: string[];
    readonly tickets: Ticket[];
    readonly blame_last_modified?: Date;
    readonly blame?: string;
}

export interface ErrorIssueResult {
    readonly fingerprint: string;
    readonly error: string;
}

export type IssueResult = OkIssueResult | ErrorIssueResult;

export interface IssueRequestResponse {
    readonly request: UpdateIssuesRequest;
    readonly response: CoronerIssuesResponse;
}

export interface OkFingerprintIssueResult {
    readonly success: true;
    readonly fingerprint: string;
    readonly issue: OkIssueResult;
    readonly json: OkCoronerIssueResponse;
    readonly responseJson: OkCoronerIssuesResponse;
}

export interface FailedFingerprintIssueResult {
    readonly success: false;
    readonly fingerprint: string;
    readonly error: string;
    readonly errorCause: 'fingerprint-failed';
    readonly issue: ErrorIssueResult;
    readonly json: ErrorCoronerIssueResponse;
    readonly responseJson: OkCoronerIssuesResponse;
}

export interface FailedRequestFingerprintIssueResult {
    readonly success: false;
    readonly fingerprint: string;
    readonly error: string;
    readonly errorCause: 'request-failed';
    readonly responseJson: ErrorCoronerIssuesResponse;
}

export type FingerprintIssueResult =
    | OkFingerprintIssueResult
    | FailedFingerprintIssueResult
    | FailedRequestFingerprintIssueResult;

export interface IssueResults {
    readonly queryResponse: FoldQueryResponse;
    readonly json: CoronerIssuesResponse[];
    failed(): Array<FailedFingerprintIssueResult | FailedRequestFingerprintIssueResult>;
    all(): FingerprintIssueResult[];
    first(): FingerprintIssueResult | undefined;
    fingerprint(fingerprint: string): FingerprintIssueResult | undefined;
}
