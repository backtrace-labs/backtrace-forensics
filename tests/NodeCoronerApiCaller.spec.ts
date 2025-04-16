import nock from 'nock';
import { QuerySource, RawCoronerResponse } from '../src';
import { NodeCoronerApiCaller } from '../src/implementation/NodeCoronerApiCaller';
import { Result } from '@backtrace/utils';

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
        const response = Result.unwrap(await maker.post(url, '{}'));

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
        const response = Result.unwrap(await maker.post(url, '{}'));

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
        const response = Result.unwrap(await maker.post(httpUrl, '{}'));

        expect(response).toEqual(expectedResponse);
        httpScope.done();
        httpsScope.done();
    });

    it('should pass provided headers', async () => {
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
                'X-Coroner-Token': source.token,
            },
        })
            .post(url.pathname + url.search)
            .reply(200, expectedResponse);

        const maker = new NodeCoronerApiCaller();
        const response = Result.unwrap(
            await maker.post(url, '{}', {
                'X-Coroner-Location': source.address,
                'X-Coroner-Token': source.token,
            }),
        );

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
        await expect(async () => Result.unwrap(await maker.post(url, '{}'))).rejects.toThrow(
            /Coroner did not reply with a JSON message./,
        );
        scope.done();
    });
});
