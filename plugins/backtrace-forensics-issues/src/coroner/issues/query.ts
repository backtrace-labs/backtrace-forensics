import { IssueInvariant, QuerySource, TicketState } from '@backtrace/forensics';
import { IssueRequestsResult } from '../../implementation/issues/requests/getRequests';
import { UpdateTicketRequest, UpdateTicketUserRequest } from './requests';
import { IssueResults } from './results';

export interface UpdateIssuesQuery {
    setTags(...tags: string[]): UpdateIssuesQuery;
    addTags(...tags: string[]): UpdateIssuesQuery;
    removeTags(...tags: string[]): UpdateIssuesQuery;

    clearAssignees(): UpdateIssuesQuery;
    setAssignees(...users: UpdateTicketUserRequest[]): UpdateIssuesQuery;
    addAssignees(...users: UpdateTicketUserRequest[]): UpdateIssuesQuery;
    removeAssignees(predicate: (ticket: UpdateTicketUserRequest) => boolean): UpdateIssuesQuery;

    setState(state: TicketState): UpdateIssuesQuery;
    setStateWithInvariants(state: TicketState, invariants: IssueInvariant[]): UpdateIssuesQuery;

    setOpen(): UpdateIssuesQuery;
    setInProgress(): UpdateIssuesQuery;
    setResolved(): UpdateIssuesQuery;
    setMuted(): UpdateIssuesQuery;
    setResolvedUntil(...invariants: IssueInvariant[]): UpdateIssuesQuery;
    setMutedUntil(...invariants: IssueInvariant[]): UpdateIssuesQuery;

    setTickets(...tickets: UpdateTicketRequest[]): UpdateIssuesQuery;
    addTickets(...tickets: UpdateTicketRequest[]): UpdateIssuesQuery;
    removeTickets(predicate: (ticket: UpdateTicketRequest) => boolean): UpdateIssuesQuery;

    json(source?: Partial<QuerySource>): Promise<IssueRequestsResult>;
    post(source?: Partial<QuerySource>): Promise<IssueResults>;
}
