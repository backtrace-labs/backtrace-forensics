import { DescribeResponse } from '../coroner/common';
import { QuerySource } from '../models';

export interface ICoronerDescribeExecutor {
    execute(source?: Partial<QuerySource>): Promise<DescribeResponse>;
}
