import { Result } from '@backtrace/utils';
import { ICoronerApiCaller } from '../interfaces/ICoronerApiCaller';

export class FetchCoronerApiCaller implements ICoronerApiCaller {
    public async post<R>(
        url: string | URL,
        body?: string,
        customHeaders?: Record<string, string>,
    ): Promise<Result<R, Error>> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        Object.assign(headers, customHeaders);

        const response = await fetch(url, {
            method: 'post',
            body,
            headers,
        });

        return Result.ok(await response.json());
    }
}
