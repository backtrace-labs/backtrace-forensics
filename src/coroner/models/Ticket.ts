import { User } from './User';

export interface Ticket {
    watcher: string;
    assignees?: User[];
    state: string;
    short: string;
    url: string;
}
