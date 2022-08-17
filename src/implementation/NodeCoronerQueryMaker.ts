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

        return new Promise((resolve, reject) => {
            const req = https.request(
                {
                    hostname: url.hostname,
                    path: `/api/query?project=${source.project}`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': data.length,
                        'X-Coroner-Location': source.address,
                        'X-Coroner-Token': source.token,
                    },
                },
                (res) => {
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
