import { Result } from '@backtrace/utils';
import { RawDescribeResponse } from '../coroner/common';
import { DescribeSource } from '../models/DescribeSource';

export interface ICoronerDescribeExecutor {
    execute(source?: Partial<DescribeSource>): Promise<Result<RawDescribeResponse, Error>>;
}
