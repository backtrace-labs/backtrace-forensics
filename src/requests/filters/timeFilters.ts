import { QueryAttributeFilter } from '..';
import { AttributeValueType, UIntType } from '../../common/attributes';
import { convertInputValue } from '../../implementation/helpers/convertInputValue';

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
     */
    now(): RT;

    readonly last: {
        /**
         * 1 hour ago (now - 1 hour).
         */
        hour(): RT;

        /**
         * _count_ hours ago (now - _count_ hours).
         * @param count Specifies the number of hours.
         */
        hours(count: number): RT;

        /**
         * 1 day ago (now - 1 day).
         */
        day(): RT;

        /**
         * _count_ days ago (now - _count_ days).
         * @param count Specifies the number of days.
         */
        days(count: number): RT;

        /**
         * 1 year ago (now - 1 year).
         */
        year(): RT;

        /**
         * _count_ years ago (now - _count_ years).
         * @param count Specifies the number of years.
         */
        years(count: number): RT;
    };

    readonly next: {
        /**
         * 1 hour from now (now + 1 hour).
         */
        hour(): RT;

        /**
         * _count_ hours from now (now + _count_ hours).
         * @param count Specifies the number of hours.
         */
        hours(count: number): RT;

        /**
         * 1 day from now (now + 1 day).
         */
        day(): RT;

        /**
         * _count_ days from now (now + _count_ days).
         * @param count Specifies the number of days.
         */
        days(count: number): RT;

        /**
         * 1 year from now (now + 1 year).
         */
        year(): RT;

        /**
         * _count_ years from now (now + _count_ years).
         * @param count Specifies the number of years.
         */
        years(count: number): RT;
    };

    /**
     * A specific date.
     * @param date Date to use.
     */
    date(date: Date): RT;
}

export interface TimeFluentFilteringContext {
    from?: Date;
    to?: Date;
    now: () => Date;
}

function getFilters(context: TimeFluentFilteringContext): QueryAttributeFilter<UIntType>[] {
    const filters: QueryAttributeFilter<UIntType>[] = [];
    if (context.from) {
        filters.push(['at-least', convertInputValue(context.from) as AttributeValueType<UIntType>]);
    }
    if (context.to) {
        filters.push(['at-most', convertInputValue(context.to) as AttributeValueType<UIntType>]);
    }
    return filters;
}

function createRange<RT>(
    context: TimeFluentFilteringContext,
    setter: (date: Date) => any,
    returnValue: (context: TimeFluentFilteringContext) => RT
): RangeTimeFluentFiltering<RT> {
    return {
        date(date: Date) {
            setter(date);
            return returnValue(context);
        },
        now() {
            setter(context.now());
            return returnValue(context);
        },
        last: {
            hour() {
                const date = context.now();
                date.setHours(date.getHours() - 1);
                setter(date);
                return returnValue(context);
            },
            hours(count: number) {
                const date = context.now();
                date.setHours(date.getHours() - count);
                setter(date);
                return returnValue(context);
            },
            day() {
                const date = context.now();
                date.setDate(date.getDate() - 1);
                setter(date);
                return returnValue(context);
            },
            days(count: number) {
                const date = context.now();
                date.setDate(date.getDate() - count);
                setter(date);
                return returnValue(context);
            },
            year() {
                const date = context.now();
                date.setFullYear(date.getFullYear() - 1);
                setter(date);
                return returnValue(context);
            },
            years(count: number) {
                const date = context.now();
                date.setFullYear(date.getFullYear() - count);
                setter(date);
                return returnValue(context);
            },
        },
        next: {
            hour() {
                const date = context.now();
                date.setHours(date.getHours() + 1);
                setter(date);
                return returnValue(context);
            },
            hours(count: number) {
                const date = context.now();
                date.setHours(date.getHours() + count);
                setter(date);
                return returnValue(context);
            },
            day() {
                const date = context.now();
                date.setDate(date.getDate() + 1);
                setter(date);
                return returnValue(context);
            },
            days(count: number) {
                const date = context.now();
                date.setDate(date.getDate() + count);
                setter(date);
                return returnValue(context);
            },
            year() {
                const date = context.now();
                date.setFullYear(date.getFullYear() + 1);
                setter(date);
                return returnValue(context);
            },
            years(count: number) {
                const date = context.now();
                date.setFullYear(date.getFullYear() + count);
                setter(date);
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
        (d) => {
            context.from = d;
        },
        (context) => getFilters(context)
    );

    return {
        ...range,
        from: createRange(
            context,
            (d) => (context.from = d),
            (context) => ({
                to: createRange(
                    context,
                    (d) => (context.to = d),
                    (context) => getFilters(context)
                ),
            })
        ),
    };
}
