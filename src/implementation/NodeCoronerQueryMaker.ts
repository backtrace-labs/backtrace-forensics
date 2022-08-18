import http from 'http';
import https from 'https';
import { ICoronerQueryMaker } from '../interfaces/ICoronerQueryMaker';
import { QuerySource } from '../models/QuerySource';
import { QueryRequest } from '../requests/common';
import { CoronerResponse, QueryResponse } from '../responses/common';

export class NodeCoronerQueryMaker implements ICoronerQueryMaker {
    public async query<R extends QueryResponse>(
        source: QuerySource,
        request: QueryRequest
    ): Promise<CoronerResponse<R>> {
        const data = JSON.stringify(request);

        const url = new URL(source.address);
        const protocol = url.protocol.startsWith('https') ? https : http;

        return new Promise<CoronerResponse<R>>((resolve, reject) => {
            const req = protocol.request(
                {
                    hostname: url.hostname,
                    path: `/api/query?project=${source.project}`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': data.length,
                        'X-Coroner-Location': source.location ?? source.address,
                        'X-Coroner-Token': source.token,
                    },
                },
                (res) => {
                    switch (res.statusCode) {
                        case 200:
                        case 403: // we want to return the error from data
                            break;
                        case 301:
                        case 302:
                            if (res.headers.location) {
                                return this.query<R>(
                                    {
                                        ...source,
                                        address: res.headers.location,
                                    },
                                    request
                                )
                                    .then(resolve)
                                    .catch(reject);
                            }
                        default:
                            reject(new Error(`Invalid coroner status code: ${res.statusCode}.`));
                    }

                    res.on('data', (d: string) => {
                        resolve(JSON.parse(d));
                    });
                }
            );

            req.on('error', (error) => {
                reject(error);
            });

            req.write(data);
            req.end();
        });
    }
}
