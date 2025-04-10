import { Result } from '@backtrace/utils';

export interface ICoronerApiCaller {
    post<R>(url: string | URL, body?: string, headers?: Record<string, string>): Promise<Result<R, Error>>;
}
