import nock from 'nock';
import { QuerySource, RawCoronerResponse } from '../src';
import { NodeCoronerApiCaller } from '../src/implementation/NodeCoronerApiCaller';

describe('NodeCoronerApiCaller', () => {
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

        const url = new URL(`/api/query?project=${source.project}`, source.address);
        const scope = nock(url.origin)
            .post(url.pathname + url.search)
            .reply(200, expectedResponse);

        const maker = new NodeCoronerApiCaller();
        const response = await maker.post(url, source, '{}');

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

        const url = new URL(`/api/query?project=${source.project}`, source.address);
        const scope = nock(url.origin)
            .post(url.pathname + url.search)
            .reply(200, expectedResponse);

        const maker = new NodeCoronerApiCaller();
        const response = await maker.post(url, source, '{}');

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

        const httpUrl = new URL(`/api/query?project=${httpSource.project}`, httpSource.address);
        const httpsUrl = new URL(`/api/query?project=${httpsSource.project}`, httpsSource.address);

        const httpScope = nock(httpUrl.origin)
            .post(httpUrl.pathname + httpUrl.search)
            .reply(301, undefined, {
                location: httpsUrl.href,
            });

        const httpsScope = nock(httpsUrl.origin)
            .post(httpsUrl.pathname + httpsUrl.search)
            .reply(200, expectedResponse);

        const maker = new NodeCoronerApiCaller();
        const response = await maker.post(httpUrl, httpSource, '{}');

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

        const url = new URL(`/api/query?project=${source.project}`, source.address);
        const scope = nock(url.origin, {
            reqheaders: {
                'X-Coroner-Token': source.token,
            },
        })
            .post(url.pathname + url.search)
            .reply(200, expectedResponse);

        const maker = new NodeCoronerApiCaller();
        const response = await maker.post(url, source, '{}');

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

        const url = new URL(`/api/query?project=${source.project}`, source.address);
        const scope = nock(url.origin, {
            reqheaders: {
                'X-Coroner-Location': source.address,
            },
        })
            .post(url.pathname + url.search)
            .reply(200, expectedResponse);

        const maker = new NodeCoronerApiCaller();
        const response = await maker.post(url, source, '{}');

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

        const url = new URL(`/api/query?project=${source.project}`, source.address);
        const scope = nock(url.origin, {
            reqheaders: {
                'X-Coroner-Location': source.location!,
            },
        })
            .post(url.pathname + url.search)
            .reply(200, expectedResponse);

        const maker = new NodeCoronerApiCaller();
        const response = await maker.post(url, source, '{}');

        expect(response).toEqual(expectedResponse);
        scope.done();
    });

    it('should throw on error response', async () => {
        const source: QuerySource = {
            address: 'https://sample.sp.backtrace.io',
            project: 'project',
            token: 'token',
        };

        const url = new URL(`/api/query?project=${source.project}`, source.address);
        const scope = nock(url.origin)
            .post(url.pathname + url.search)
            .reply(500);

        const maker = new NodeCoronerApiCaller();
        await expect(maker.post(url, source, '{}')).rejects.toThrow(/Invalid coroner status code/);
        scope.done();
    });
});
