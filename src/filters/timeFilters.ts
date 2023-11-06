import { QueryAttributeFilter } from '../coroner/common';
import { AttributeValueType, UIntType } from '../coroner/common/attributes';
import { convertInputValue } from '../implementation/helpers/convertInputValue';

export interface TimeFluentFiltering extends LastTimeFluentFiltering {
    readonly from: FromTimeFluentFiltering;
}

export interface LastTimeFluentFiltering<RT = QueryAttributeFilter<UIntType>[]>
    extends Omit<RangeTimeFluentFiltering<RT>, 'now' | 'date'> {}

export interface FromTimeFluentFiltering<RT = QueryAttributeFilter<UIntType>[]>
    extends RangeTimeFluentFiltering<{ readonly to: ToTimeFluentFiltering<RT> }> {}

export interface ToTimeFluentFiltering<RT = QueryAttributeFilter<UIntType>[]> extends RangeTimeFluentFiltering<RT> {}

export interface RangeTimeFluentFiltering<RT> {
    /**
     * Exactly now.
     * @param notEqual If `true`, will use `less-than`/`greater-than`, else will use `at-least`/`at-most`.
     */
    now(notEqual?: boolean): RT;

    readonly last: {
        /**
         * 1 hour ago (now - 1 hour).
         * @param notEqual If `true`, will use `less-than`/`greater-than`, else will use `at-least`/`at-most`.
         */
        hour(notEqual?: boolean): RT;

        /**
         * _count_ hours ago (now - _count_ hours).
         * @param count Specifies the number of hours.
         * @param notEqual If `true`, will use `less-than`/`greater-than`, else will use `at-least`/`at-most`.
         */
        hours(count: number, notEqual?: boolean): RT;

        /**
         * 1 day ago (now - 1 day).
         * @param notEqual If `true`, will use `less-than`/`greater-than`, else will use `at-least`/`at-most`.
         */
        day(notEqual?: boolean): RT;

        /**
         * _count_ days ago (now - _count_ days).
         * @param count Specifies the number of days.
         * @param notEqual If `true`, will use `less-than`/`greater-than`, else will use `at-least`/`at-most`.
         */
        days(count: number, notEqual?: boolean): RT;

        /**
         * 1 year ago (now - 1 year).
         * @param notEqual If `true`, will use `less-than`/`greater-than`, else will use `at-least`/`at-most`.
         */
        year(notEqual?: boolean): RT;

        /**
         * _count_ years ago (now - _count_ years).
         * @param count Specifies the number of years.
         * @param notEqual If `true`, will use `less-than`/`greater-than`, else will use `at-least`/`at-most`.
         */
        years(count: number, notEqual?: boolean): RT;
    };

    readonly next: {
        /**
         * 1 hour from now (now + 1 hour).
         * @param notEqual If `true`, will use `less-than`/`greater-than`, else will use `at-least`/`at-most`.
         */
        hour(notEqual?: boolean): RT;

        /**
         * _count_ hours from now (now + _count_ hours).
         * @param count Specifies the number of hours.
         * @param notEqual If `true`, will use `less-than`/`greater-than`, else will use `at-least`/`at-most`.
         */
        hours(count: number, notEqual?: boolean): RT;

        /**
         * 1 day from now (now + 1 day).
         */
        day(notEqual?: boolean): RT;

        /**
         * _count_ days from now (now + _count_ days).
         * @param count Specifies the number of days.
         * @param notEqual If `true`, will use `less-than`/`greater-than`, else will use `at-least`/`at-most`.
         */
        days(count: number, notEqual?: boolean): RT;

        /**
         * 1 year from now (now + 1 year).
         * @param notEqual If `true`, will use `less-than`/`greater-than`, else will use `at-least`/`at-most`.
         */
        year(notEqual?: boolean): RT;

        /**
         * _count_ years from now (now + _count_ years).
         * @param count Specifies the number of years.
         * @param notEqual If `true`, will use `less-than`/`greater-than`, else will use `at-least`/`at-most`.
         */
        years(count: number, notEqual?: boolean): RT;
    };

    /**
     * A specific date.
     * @param date Date to use.
     * @param notEqual If `true`, will use `less-than`/`greater-than`, else will use `at-least`/`at-most`.
     */
    date(date: Date, notEqual?: boolean): RT;
}

export interface TimeFluentFilteringContext {
    from?: Date;
    to?: Date;
    fromNotEqual?: boolean;
    toNotEqual?: boolean;
    now: () => Date;
}

function getFilters({
    from,
    to,
    fromNotEqual,
    toNotEqual,
}: TimeFluentFilteringContext): QueryAttributeFilter<UIntType>[] {
    const filters: QueryAttributeFilter<UIntType>[] = [];
    if (from) {
        filters.push([
            fromNotEqual ? 'greater-than' : 'at-least',
            convertInputValue(from) as AttributeValueType<UIntType>,
        ]);
    }
    if (to) {
        filters.push([toNotEqual ? 'less-than' : 'at-most', convertInputValue(to) as AttributeValueType<UIntType>]);
    }
    return filters;
}

function createRange<RT>(
    context: TimeFluentFilteringContext,
    setter: (date: Date, notEqual?: boolean) => any,
    returnValue: (context: TimeFluentFilteringContext) => RT,
): RangeTimeFluentFiltering<RT> {
    return {
        date(date: Date, notEqual?: boolean) {
            setter(date, notEqual);
            return returnValue(context);
        },
        now(notEqual?: boolean) {
            setter(context.now(), notEqual);
            return returnValue(context);
        },
        last: {
            hour(notEqual?: boolean) {
                const date = context.now();
                date.setHours(date.getHours() - 1);
                setter(date, notEqual);
                return returnValue(context);
            },
            hours(count: number, notEqual?: boolean) {
                const date = context.now();
                date.setHours(date.getHours() - count);
                setter(date, notEqual);
                return returnValue(context);
            },
            day(notEqual?: boolean) {
                const date = context.now();
                date.setDate(date.getDate() - 1);
                setter(date, notEqual);
                return returnValue(context);
            },
            days(count: number, notEqual?: boolean) {
                const date = context.now();
                date.setDate(date.getDate() - count);
                setter(date, notEqual);
                return returnValue(context);
            },
            year(notEqual?: boolean) {
                const date = context.now();
                date.setFullYear(date.getFullYear() - 1);
                setter(date, notEqual);
                return returnValue(context);
            },
            years(count: number, notEqual?: boolean) {
                const date = context.now();
                date.setFullYear(date.getFullYear() - count);
                setter(date, notEqual);
                return returnValue(context);
            },
        },
        next: {
            hour(notEqual?: boolean) {
                const date = context.now();
                date.setHours(date.getHours() + 1);
                setter(date, notEqual);
                return returnValue(context);
            },
            hours(count: number, notEqual?: boolean) {
                const date = context.now();
                date.setHours(date.getHours() + count);
                setter(date, notEqual);
                return returnValue(context);
            },
            day(notEqual?: boolean) {
                const date = context.now();
                date.setDate(date.getDate() + 1);
                setter(date, notEqual);
                return returnValue(context);
            },
            days(count: number, notEqual?: boolean) {
                const date = context.now();
                date.setDate(date.getDate() + count);
                setter(date, notEqual);
                return returnValue(context);
            },
            year(notEqual?: boolean) {
                const date = context.now();
                date.setFullYear(date.getFullYear() + 1);
                setter(date, notEqual);
                return returnValue(context);
            },
            years(count: number, notEqual?: boolean) {
                const date = context.now();
                date.setFullYear(date.getFullYear() + count);
                setter(date, notEqual);
                return returnValue(context);
            },
        },
    };
}

export function createTimeFluentFiltering(): TimeFluentFiltering {
    const context: TimeFluentFilteringContext = {
        now: () => new Date(),
    };

    const range = createRange(
        context,
        (d, notEqual) => {
            context.from = d;
            context.fromNotEqual = notEqual;
        },
        (context) => getFilters(context),
    );

    return {
        ...range,
        from: createRange(
            context,
            (d) => (context.from = d),
            (context) => ({
                to: createRange(
                    context,
                    (d, notEqual) => {
                        context.to = d;
                        context.toNotEqual = notEqual;
                    },
                    (context) => getFilters(context),
                ),
            }),
        ),
    };
}
