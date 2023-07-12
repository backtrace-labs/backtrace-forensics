export type TicketState = 'open' | 'muted' | 'resolved' | 'in-progress';

export interface TicketAssignee {
    id: number;
    username: string;
    email: string;
}

export interface Ticket {
    watcher: string;
    assignees?: TicketAssignee[];
    state: TicketState;
    short: string;
    url: string;
}
