import { QueryFilter, TicketState } from '../coroner';

export interface TicketFluentFiltering {
    readonly state: TicketStateFluentFiltering;
}

export interface TicketStateFluentFiltering {
    attribute(attribute: string): TicketStateFluentFiltering;
    isResolved(): QueryFilter;
    isMuted(): QueryFilter;
    isOpen(): QueryFilter;
    isInProgress(): QueryFilter;
    isNotResolved(): QueryFilter;
    isNotMuted(): QueryFilter;
    isNotOpen(): QueryFilter;
    isNotInProgress(): QueryFilter;
    is(state: TicketState): QueryFilter;
}

function createStateFiltering(attribute: string): TicketStateFluentFiltering {
    return {
        attribute(value: string) {
            return createStateFiltering(value);
        },
        isResolved() {
            return { [attribute]: [['equal', 'resolved']] };
        },
        isMuted() {
            return { [attribute]: [['equal', 'muted']] };
        },
        isOpen() {
            return { [attribute]: [['equal', 'open']] };
        },
        isInProgress() {
            return { [attribute]: [['equal', 'in-progress']] };
        },
        isNotResolved() {
            return { [attribute]: [['not-equal', 'resolved']] };
        },
        isNotMuted() {
            return { [attribute]: [['not-equal', 'muted']] };
        },
        isNotOpen() {
            return { [attribute]: [['not-equal', 'open']] };
        },
        isNotInProgress() {
            return { [attribute]: [['not-equal', 'in-progress']] };
        },
        is(state: TicketState) {
            return { [attribute]: [['equal', state]] };
        },
    };
}

export function createTicketFluentFiltering(): TicketFluentFiltering {
    return {
        state: createStateFiltering('fingerprint;issues;state'),
    };
}
