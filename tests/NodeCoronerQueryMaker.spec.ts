import nock from 'nock';
import { NodeCoronerQueryMaker } from '../src/implementation/NodeCoronerQueryMaker';
import { QuerySource } from '../src/models/QuerySource';
import { RawCoronerResponse } from '../src/responses/common';

describe('NodeCoronerQueryMaker', () => {
    it('should return a response from https server', async () => {
        const source: QuerySource = {
            address: 'https://sample.sp.backtrace.io',
            project: 'project',
            token: 'token',
        };

        const expectedResponse: Partial<RawCoronerResponse<never>> = {
            error: undefined,
            response: undefined,
        };

        const scope = nock(source.address).post(`/api/query?project=${source.project}`).reply(200, expectedResponse);

        const maker = new NodeCoronerQueryMaker();
        const response = await maker.query(source, {});

        expect(response).toEqual(expectedResponse);
        scope.done();
    });

    it('should return a response from http server', async () => {
        const source: QuerySource = {
            address: 'http://sample.sp.backtrace.io',
            project: 'project',
            token: 'token',
        };

        const expectedResponse: Partial<RawCoronerResponse<never>> = {
            error: undefined,
            response: undefined,
        };

        const scope = nock(source.address).post(`/api/query?project=${source.project}`).reply(200, expectedResponse);

        const maker = new NodeCoronerQueryMaker();
        const response = await maker.query(source, {});

        expect(response).toEqual(expectedResponse);
        scope.done();
    });

    it('should follow redirects', async () => {
        const httpSource: QuerySource = {
            address: 'http://sample.sp.backtrace.io',
            project: 'project',
            token: 'token',
        };

        const httpsSource: QuerySource = {
            ...httpSource,
            address: 'http://sample.sp.backtrace.io',
        };

        const expectedResponse: Partial<RawCoronerResponse<never>> = {
            error: undefined,
            response: undefined,
        };

        const httpScope = nock(httpSource.address)
            .post(`/api/query?project=${httpSource.project}`)
            .reply(301, undefined, {
                location: httpsSource.address,
            });

        const httpsScope = nock(httpsSource.address)
            .post(`/api/query?project=${httpsSource.project}`)
            .reply(200, expectedResponse);

        const maker = new NodeCoronerQueryMaker();
        const response = await maker.query(httpSource, {});

        expect(response).toEqual(expectedResponse);
        httpScope.done();
        httpsScope.done();
    });

    it('should pass coroner token header', async () => {
        const source: QuerySource = {
            address: 'https://sample.sp.backtrace.io',
            project: 'project',
            token: 'token',
        };

        const expectedResponse: Partial<RawCoronerResponse<never>> = {
            error: undefined,
            response: undefined,
        };

        const scope = nock(source.address, {
            reqheaders: {
                'X-Coroner-Token': source.token,
            },
        })
            .post(`/api/query?project=${source.project}`)
            .reply(200, expectedResponse);

        const maker = new NodeCoronerQueryMaker();
        const response = await maker.query(source, {});

        expect(response).toEqual(expectedResponse);
        scope.done();
    });

    it('should pass coroner location header from address', async () => {
        const source: QuerySource = {
            address: 'https://sample.sp.backtrace.io',
            project: 'project',
            token: 'token',
        };

        const expectedResponse: Partial<RawCoronerResponse<never>> = {
            error: undefined,
            response: undefined,
        };

        const scope = nock(source.address, {
            reqheaders: {
                'X-Coroner-Location': source.address,
            },
        })
            .post(`/api/query?project=${source.project}`)
            .reply(200, expectedResponse);

        const maker = new NodeCoronerQueryMaker();
        const response = await maker.query(source, {});

        expect(response).toEqual(expectedResponse);
        scope.done();
    });

    it('should pass coroner location header from location if specified', async () => {
        const source: QuerySource = {
            address: 'https://sample.sp.backtrace.io',
            project: 'project',
            token: 'token',
            location: 'https://yolo.sp.backtrace.io',
        };

        const expectedResponse: Partial<RawCoronerResponse<never>> = {
            error: undefined,
            response: undefined,
        };

        const scope = nock(source.address, {
            reqheaders: {
                'X-Coroner-Location': source.location!,
            },
        })
            .post(`/api/query?project=${source.project}`)
            .reply(200, expectedResponse);

        const maker = new NodeCoronerQueryMaker();
        const response = await maker.query(source, {});

        expect(response).toEqual(expectedResponse);
        scope.done();
    });

    it('should throw on error response', async () => {
        const source: QuerySource = {
            address: 'https://sample.sp.backtrace.io',
            project: 'project',
            token: 'token',
        };

        const scope = nock(source.address).post(`/api/query?project=${source.project}`).reply(500);

        const maker = new NodeCoronerQueryMaker();
        await expect(maker.query(source, {})).rejects.toThrow(/Invalid coroner status code/);
        scope.done();
    });
});
