import { QuerySource } from './QuerySource';

export interface DescribeSource extends QuerySource {
    /**
     * Table to use for describe.
     */
    table?: string;
}
