import { ICoronerApiCaller } from '../interfaces/ICoronerApiCaller';

export class FetchCoronerApiCaller implements ICoronerApiCaller {
    public async post<R>(url: string | URL, body?: string, customHeaders?: Record<string, string>): Promise<R> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        Object.assign(headers, customHeaders);

        const response = await fetch(url, {
            method: 'post',
            body,
            headers,
        });

        return await response.json();
    }
}
