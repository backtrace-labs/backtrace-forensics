import { IssueInvariant, TicketState } from '@backtrace/forensics';
import { DeferredUpdateIssuesRequest } from '../../coroner/issues/deferredRequests';
import { UpdateTicketRequest, UpdateTicketUserRequest } from '../../coroner/issues/requests';

export const DEFAULT_TICKET_WATCHER = '_backtrace';

export function updateTags(fn: (existing: string[]) => string[]) {
    return function updateTags(request: DeferredUpdateIssuesRequest): DeferredUpdateIssuesRequest {
        return {
            ...request,
            tags: {
                action: 'set',
                value: (existing) =>
                    [
                        ...new Set(
                            fn((request.tags ? request.tags.value(existing) : existing).split(' ')).flatMap((e) =>
                                e.split(' '),
                            ),
                        ),
                    ]
                        .filter((t) => !!t)
                        .join(' '),
            },
        };
    };
}

export function setTags(...tags: string[]) {
    return updateTags(() => tags);
}

export function addTags(...tags: string[]) {
    return updateTags((existing) => [...existing, ...tags]);
}

export function removeTags(...tags: string[]) {
    return updateTags((existing) => existing.filter((t) => !tags.flatMap((t) => t.split(' ')).includes(t)));
}

export function updateAssignees(fn: (existing: UpdateTicketUserRequest[] | undefined) => UpdateTicketUserRequest[]) {
    return updateTickets((existing) => {
        return existing.map((ticket) => ({
            ...ticket,
            assignees: fn(ticket.assignees),
        }));
    });
}

export const clearAssignees = updateAssignees(() => []);

export function setAssignees(...users: UpdateTicketUserRequest[]) {
    return updateAssignees(() => users);
}

export function addAssignees(...users: UpdateTicketUserRequest[]) {
    return updateAssignees((existing) => {
        const addedUids = users.map((u) => u.id);
        return [...(existing?.filter((e) => !addedUids.includes(e.id)) ?? []), ...users];
    });
}

export function removeAssignees(predicate: (ticket: UpdateTicketUserRequest) => boolean) {
    return updateAssignees((existing) => (existing ? existing.filter((user) => !predicate(user)) : []));
}

export const setOpen = setState('open');
export const setInProgress = setState('in-progress');
export const setResolved = setState('resolved');
export const setMuted = setState('muted');

export const setResolvedUntil = setStateWithInvariants('resolved');
export const setMutedUntil = setStateWithInvariants('muted');

export function setStateWithInvariants(state: TicketState) {
    return function setStateWithInvariants(...invariants: IssueInvariant[]) {
        return function setStateWithInvariants(request: DeferredUpdateIssuesRequest): DeferredUpdateIssuesRequest {
            return pipeRequest(request, setState(state), setInvariants(...invariants));
        };
    };
}

export function setState(state: TicketState) {
    return function setState(request: DeferredUpdateIssuesRequest): DeferredUpdateIssuesRequest {
        return {
            ...request,
            state,
        };
    };
}

export function setInvariants(...invariants: IssueInvariant[]) {
    return function setInvariants(request: DeferredUpdateIssuesRequest): DeferredUpdateIssuesRequest {
        return {
            ...request,
            invariants: {
                action: 'set',
                value: invariants,
            },
        };
    };
}

export function updateTickets(fn: (existing: readonly UpdateTicketRequest[]) => readonly UpdateTicketRequest[]) {
    return function updateTickets(request: DeferredUpdateIssuesRequest): DeferredUpdateIssuesRequest {
        const defaultTicket: UpdateTicketRequest = {
            watcher: DEFAULT_TICKET_WATCHER,
        };

        return {
            ...request,
            ticket: {
                action: 'set',
                assignee: 'set',
                value: (existing) => {
                    const current = request.ticket ? request.ticket.value(existing) : existing;
                    const currentWithDefault = !current.some((c) => c.watcher === DEFAULT_TICKET_WATCHER)
                        ? [defaultTicket, ...current]
                        : current;

                    const newTickets = fn(currentWithDefault);
                    const newDefaultTicket = newTickets.reduce(
                        (result, ticket) => (ticket.watcher === DEFAULT_TICKET_WATCHER ? ticket : result),
                        defaultTicket,
                    );

                    return [newDefaultTicket, ...newTickets.filter((t) => t.watcher !== DEFAULT_TICKET_WATCHER)];
                },
            },
        };
    };
}

export function setTickets(...tickets: UpdateTicketRequest[]) {
    return updateTickets(() => tickets);
}

export function addTickets(...tickets: UpdateTicketRequest[]) {
    return updateTickets((existing) => [...existing, ...tickets]);
}

export function removeTickets(predicate: (ticket: UpdateTicketRequest) => boolean) {
    // Do not remove the default ticket
    const newPredicate = (ticket: UpdateTicketRequest) => {
        if (ticket.watcher === DEFAULT_TICKET_WATCHER) {
            return false;
        }

        return predicate(ticket);
    };

    return updateTickets((existing) => existing.filter((e) => !newPredicate(e)));
}

export function pipeRequest(
    initial: DeferredUpdateIssuesRequest,
    ...fns: Array<(t: DeferredUpdateIssuesRequest) => DeferredUpdateIssuesRequest>
): DeferredUpdateIssuesRequest {
    return fns.reduce((value, fn) => fn(value), initial);
}
