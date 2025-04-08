import { RawDescribeResponse } from '../coroner/common';
import { DescribeSource } from '../models/DescribeSource';

export interface ICoronerDescribeExecutor {
    execute(source?: Partial<DescribeSource>): Promise<RawDescribeResponse>;
}
