import { range } from './rangeFilters';
import { createTimeFluentFiltering } from './timeFilters';

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
    range,
};

export default Filters;
