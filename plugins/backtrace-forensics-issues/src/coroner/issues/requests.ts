import { IssueInvariant, TicketState } from '@backtrace/forensics';

export interface UpdateTagsRequest {
    readonly action: 'set';
    readonly value: string;
}

export interface UpdateTicketUserRequest {
    readonly id: number;
    readonly username?: string;
    readonly email?: string;
}

export interface UpdateTicketRequest {
    readonly watcher: string;
    readonly assignees?: UpdateTicketUserRequest[];
    readonly state?: TicketState;
    readonly short?: string;
    readonly url?: string;
}

export interface UpdateTicketsRequest {
    readonly action: 'set';
    readonly assignee?: 'set';
    readonly value?: readonly UpdateTicketRequest[];
}

export interface UpdateInvariantsRequest {
    readonly action: 'set';
    readonly value: readonly IssueInvariant[];
}

export interface UpdateIssuesRequest extends IssuesRequest {
    readonly ticket?: UpdateTicketsRequest;
    readonly tags?: UpdateTagsRequest;
    readonly state?: TicketState;
    readonly invariants?: UpdateInvariantsRequest;
}

export interface IssuesRequest {
    readonly fingerprint: readonly string[];
    readonly project: string;
}
