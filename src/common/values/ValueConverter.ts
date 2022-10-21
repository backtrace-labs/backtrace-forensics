import { IssueInvariant } from './models/IssueInvariant';
import { Ticket } from './models/Ticket';

export class ValueConverter {
    public static toLabels(value: unknown): string[] {
        if (typeof value !== 'string') {
            throw new TypeError('Invalid value type, expected string.');
        }

        return value.split(' ').filter((s) => s);
    }

    public static toCallstack(value: unknown): string[] {
        if (typeof value !== 'string') {
            throw new TypeError('Invalid value type, expected string.');
        }

        const obj = JSON.parse(value);
        const frames = obj.frame;
        if (!frames) {
            return [];
        }

        if (!Array.isArray(frames)) {
            throw new TypeError('Invalid JSON, expected "frame" to be an array.');
        }

        if (frames.some((f) => typeof f !== 'string')) {
            throw new TypeError('Invalid JSON, expected all "frame" elements to be of string type.');
        }

        return frames;
    }

    public static toTickets(value: unknown): Ticket[] {
        if (typeof value !== 'string') {
            throw new TypeError('Invalid value type, expected string.');
        }

        const obj = JSON.parse(value);

        // TODO: Further checks?

        return obj;
    }

    public static toIssueInvariants(value: unknown): IssueInvariant[] {
        if (typeof value !== 'string') {
            throw new TypeError('Invalid value type, expected string.');
        }

        const obj = JSON.parse(value);

        // TODO: Further checks?

        return obj;
    }
}
