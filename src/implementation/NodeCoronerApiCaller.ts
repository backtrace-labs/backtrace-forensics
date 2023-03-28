import http from 'http';
import https from 'https';
import { ICoronerApiCaller } from '../interfaces/ICoronerApiCaller';
import { QuerySource } from '../models/QuerySource';

export class NodeCoronerApiCaller implements ICoronerApiCaller {
    public async post<R>(resource: string, source: Partial<QuerySource>, body?: string): Promise<R> {
        let { address, token, location } = source;
        if (!address) {
            throw new Error('Coroner address is not available.');
        }

        if (!token) {
            throw new Error('Coroner token is not available.');
        }

        const url = new URL(resource, address);
        const protocol = url.protocol.startsWith('https') ? https : http;

        return new Promise<R>((resolve, reject) => {
            const headers: http.OutgoingHttpHeaders = {
                'Content-Type': 'application/json',
                'X-Coroner-Location': location ?? address,
                'X-Coroner-Token': token,
            };

            if (body) {
                headers['Content-Length'] = body.length;
            }

            const req = protocol.request(
                {
                    hostname: url.hostname,
                    port: url.port,
                    path: url.pathname + url.search,
                    method: 'POST',
                    headers,
                },
                (res) => {
                    switch (res.statusCode) {
                        case 200:
                        case 403: // we want to return the error from data
                            break;
                        case 301:
                        case 302:
                            if (res.headers.location) {
                                return this.post<R>(
                                    resource,
                                    {
                                        ...source,
                                        address: res.headers.location,
                                    },
                                    body,
                                )
                                    .then(resolve)
                                    .catch(reject);
                            }
                        default:
                            reject(new Error(`Invalid coroner status code: ${res.statusCode}.`));
                    }

                    let result: Buffer | undefined;
                    res.on('data', (data: Buffer) => {
                        result = result ? Buffer.concat([result, data]) : data;
                    });

                    res.on('close', () => {
                        if (!result) {
                            return reject(new Error('No response has been returned.'));
                        }

                        resolve(JSON.parse(result.toString('utf-8')));
                    });
                },
            );

            req.on('error', (error) => {
                reject(error);
            });

            if (body) {
                req.write(body);
            }

            req.end();
        });
    }
}
