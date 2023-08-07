import { TicketState } from '@backtrace/forensics';
import { UpdateInvariantsRequest, UpdateTicketRequest } from './requests';

export interface DeferredUpdateTagsRequest {
    readonly action: 'set';
    readonly value: (tags: string) => string;
}

export interface DeferredUpdateTicketsRequest {
    readonly action: 'set';
    readonly assignee?: 'set';
    readonly value: (tickets: readonly UpdateTicketRequest[]) => readonly UpdateTicketRequest[];
}

export interface DeferredUpdateIssuesRequest {
    readonly ticket?: DeferredUpdateTicketsRequest;
    readonly tags?: DeferredUpdateTagsRequest;
    readonly state?: TicketState;
    readonly invariants?: UpdateInvariantsRequest;
}
