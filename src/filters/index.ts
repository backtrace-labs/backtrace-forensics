import { range } from './rangeFilters';
import { createTicketFluentFiltering } from './ticketFilters';
import { createTimeFluentFiltering } from './timeFilters';
export * from './rangeFilters';
export * from './ticketFilters';
export * from './timeFilters';

export const Filters = {
    /**
     * Will create a range filter using `at-least` and `at-most`, based on values provided.
     */
    get time() {
        return createTimeFluentFiltering();
    },

    /**
     * Will create a range filter using `at-least` and `at-most`, based on values provided.
     */
    get range() {
        return range;
    },

    get ticket() {
        return createTicketFluentFiltering();
    },
};

export default Filters;
