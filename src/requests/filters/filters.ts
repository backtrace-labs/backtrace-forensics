import { createTimeFluentFiltering } from './timeFilters';

export const Filters = {
    get time() {
        return createTimeFluentFiltering();
    },
};

export default Filters;
