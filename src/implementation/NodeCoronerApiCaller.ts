import http from 'http';
import https from 'https';
import { ICoronerApiCaller } from '../interfaces/ICoronerApiCaller';

export class NodeCoronerApiCaller implements ICoronerApiCaller {
    public async post<R>(url: string | URL, body?: string, customHeaders?: Record<string, string>): Promise<R> {
        const urlObj = url instanceof URL ? url : new URL(url);
        const protocol = urlObj.protocol.startsWith('https') ? https : http;

        return new Promise<R>((resolve, reject) => {
            const headers: http.OutgoingHttpHeaders = {
                'Content-Type': 'application/json',
            };

            if (body) {
                headers['Content-Length'] = body.length;
            }

            Object.assign(headers, customHeaders);

            const req = protocol.request(
                {
                    hostname: urlObj.hostname,
                    port: urlObj.port,
                    path: urlObj.pathname + urlObj.search,
                    method: 'POST',
                    headers,
                },
                (res) => {
                    switch (res.statusCode) {
                        case 200:
                        case 400:
                        case 403: // we want to return the error from data
                            break;
                        case 301:
                        case 302:
                            if (res.headers.location) {
                                return this.post<R>(url, body, customHeaders).then(resolve).catch(reject);
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
