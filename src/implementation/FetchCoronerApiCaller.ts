import { ICoronerApiCaller } from '../interfaces/ICoronerApiCaller';
import { QuerySource } from '../models/QuerySource';

export class FetchCoronerApiCaller implements ICoronerApiCaller {
    public async post<R>(resource: string, source: Partial<QuerySource>, body?: string): Promise<R> {
        let { address, token, location } = source;
        if (!address) {
            throw new Error('Coroner address is not available.');
        }

        if (!token) {
            throw new Error('Coroner token is not available.');
        }

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'X-Coroner-Location': location ?? address,
            'X-Coroner-Token': token,
        };

        if (body) {
            headers['Content-Length'] = body.length.toString();
        }

        const url = new URL(resource, address);
        const response = await fetch(url.href, {
            method: 'post',
            body,
            headers,
        });

        return await response.json();
    }
}
