import { User } from './User';

export type TicketState = 'open' | 'muted' | 'resolved' | 'in-progress';

export interface Ticket {
    watcher: string;
    assignees?: User[];
    state: string;
    short: string;
    url: string;
}
