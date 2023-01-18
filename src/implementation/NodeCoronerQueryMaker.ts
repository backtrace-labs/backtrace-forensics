import http from 'http';
import https from 'https';
import { QueryRequest, RawCoronerResponse, RawQueryResponse } from '../coroner/common';
import { ICoronerQueryMaker } from '../interfaces/ICoronerQueryMaker';
import { QuerySource } from '../models/QuerySource';

export class NodeCoronerQueryMaker implements ICoronerQueryMaker {
    public async query<R extends RawQueryResponse>(
        source: Partial<QuerySource>,
        request: QueryRequest
    ): Promise<RawCoronerResponse<R>> {
        const data = JSON.stringify(request);
        let { address, token, project, location } = source;
        if (!address) {
            throw new Error('Coroner address is not available.');
        }

        if (!token) {
            throw new Error('Coroner token is not available.');
        }

        if (!project) {
            throw new Error('Coroner project is not available.');
        }

        const url = new URL(address);
        const protocol = url.protocol.startsWith('https') ? https : http;

        return new Promise<RawCoronerResponse<R>>((resolve, reject) => {
            const req = protocol.request(
                {
                    hostname: url.hostname,
                    path: `/api/query?project=${project}`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': data.length,
                        'X-Coroner-Location': location ?? address,
                        'X-Coroner-Token': token,
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
