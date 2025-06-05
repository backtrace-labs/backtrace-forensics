import { Result } from '@backtrace/utils';
import { IssueInvariant } from '../../coroner/models/IssueInvariant';
import { Ticket } from '../../coroner/models/Ticket';

export class ValueConverter {
    public static toLabels(value: unknown): Result<string[], Error> {
        if (!value) {
            return Result.ok([]);
        }

        if (typeof value !== 'string') {
            return Result.err(new TypeError('Invalid value type, expected string.'));
        }

        return Result.ok(value.split(' ').filter((s) => s));
    }

    public static toLabelsUnsafe(value: unknown): string[] {
        return Result.unwrap(ValueConverter.toLabels(value));
    }

    public static toCallstack(value: unknown): Result<string[], Error> {
        if (!value || value === '*') {
            return Result.ok([]);
        }

        if (typeof value !== 'string') {
            return Result.err(new TypeError('Invalid value type, expected string.'));
        }

        const parseResult = ValueConverter.safeParse(value);
        if (Result.isErr(parseResult)) {
            return parseResult;
        }

        const obj = parseResult.data;
        const frames = obj.frame;
        if (!frames) {
            return Result.ok([]);
        }

        if (!Array.isArray(frames)) {
            return Result.err(new TypeError('Invalid JSON, expected "frame" to be an array.'));
        }

        if (frames.some((f) => typeof f !== 'string')) {
            return Result.err(new TypeError('Invalid JSON, expected all "frame" elements to be of string type.'));
        }

        return Result.ok(frames);
    }

    public static toCallstackUnsafe(value: unknown): string[] {
        return Result.unwrap(ValueConverter.toCallstack(value));
    }

    public static toTickets(value: unknown): Result<Ticket[], Error> {
        if (!value) {
            return Result.ok([]);
        }

        if (typeof value !== 'string') {
            return Result.err(new TypeError('Invalid value type, expected string.'));
        }

        const parseResult = ValueConverter.safeParse(value);
        if (Result.isErr(parseResult)) {
            return parseResult;
        }

        const obj = parseResult.data;

        // TODO: Further checks?

        return Result.ok(obj);
    }

    public static toTicketsUnsafe(value: unknown): Ticket[] {
        return Result.unwrap(ValueConverter.toTickets(value));
    }

    public static toIssueInvariants(value: unknown): Result<IssueInvariant[], Error> {
        if (!value) {
            return Result.ok([]);
        }

        if (typeof value !== 'string') {
            return Result.err(new TypeError('Invalid value type, expected string.'));
        }

        const parseResult = ValueConverter.safeParse(value);
        if (Result.isErr(parseResult)) {
            return parseResult;
        }

        const obj = parseResult.data;

        // TODO: Further checks?

        return Result.ok(obj);
    }

    public static toIssueInvariantsUnsafe(value: unknown): IssueInvariant[] {
        return Result.unwrap(ValueConverter.toIssueInvariants(value));
    }

    private static safeParse<T = any>(json: string): Result<T, Error> {
        return Result.tryCatch(() => JSON.parse(json));
    }
}
