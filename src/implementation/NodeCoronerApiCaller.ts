import http from 'http';
import https from 'https';
import { ICoronerApiCaller } from '../interfaces/ICoronerApiCaller';

export interface NodeCoronerApiCallerOptions {
    readonly disableSslVerification?: boolean;
}

export class NodeCoronerApiCaller implements ICoronerApiCaller {
    constructor(private readonly options?: NodeCoronerApiCallerOptions) {}

    public async post<R>(url: string | URL, body?: string, customHeaders?: Record<string, string>): Promise<R> {
        const urlObj = url instanceof URL ? url : new URL(url);
        const protocol = urlObj.protocol.startsWith('https') ? https : http;

        const agent = this.options?.disableSslVerification
            ? new protocol.Agent({
                  rejectUnauthorized: false,
              })
            : undefined;

        return new Promise<R>((resolve, reject) => {
            const headers: http.OutgoingHttpHeaders = {
                'Content-Type': 'application/json',
            };

            Object.assign(headers, customHeaders);

            const req = protocol.request(
                {
                    hostname: urlObj.hostname,
                    port: urlObj.port,
                    path: urlObj.pathname + urlObj.search,
                    method: 'POST',
                    headers,
                    agent,
                },
                (res) => {
                    switch (res.statusCode) {
                        case 301:
                        case 302:
                            if (res.headers.location) {
                                return this.post<R>(url, body, customHeaders).then(resolve).catch(reject);
                            }
                    }

                    if (res.headers['content-type'] !== 'application/json') {
                        return reject(new Error('Coroner did not reply with a JSON message.'));
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
