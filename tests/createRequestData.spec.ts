import { QuerySource } from '../src';
import { createRequestData } from '../src/implementation/helpers/createRequestData';
import { Result } from '@backtrace/utils';

describe('createRequestData', () => {
    it('should return URL with provided address as origin', () => {
        const querySource: QuerySource = {
            address: 'https://sample.sp.backtrace.io',
            project: 'projectName',
            token: 'token',
        };

        const { url } = Result.unwrap(createRequestData(querySource, '/api/query'));
        expect(url.origin).toEqual(querySource.address);
    });

    it('should return URL with provided resource as path', () => {
        const querySource: QuerySource = {
            address: 'https://sample.sp.backtrace.io',
            project: 'projectName',
            token: 'token',
        };

        const { url } = Result.unwrap(createRequestData(querySource, '/api/query'));
        expect(url.pathname).toEqual('/api/query');
    });

    it('should append project as query parameter', () => {
        const querySource: QuerySource = {
            address: 'https://sample.sp.backtrace.io',
            project: 'projectName',
            token: 'token',
        };

        const { url } = Result.unwrap(createRequestData(querySource, '/api/query'));
        expect([...url.searchParams.entries()]).toContainEqual(['project', querySource.project]);
    });

    it('should append project as query parameter when other parameters are passed', () => {
        const querySource: QuerySource = {
            address: 'https://sample.sp.backtrace.io',
            project: 'projectName',
            universe: 'universeName',
            token: 'token',
            params: {
                param1: 'a',
                param2: ['b', 'c'],
            },
        };

        const { url } = Result.unwrap(createRequestData(querySource, '/api/query'));
        expect([...url.searchParams.entries()]).toContainEqual(['project', querySource.project]);
    });

    it('should append universe as query parameter if available', () => {
        const querySource: QuerySource = {
            address: 'https://sample.sp.backtrace.io',
            project: 'projectName',
            universe: 'universeName',
            token: 'token',
        };

        const { url } = Result.unwrap(createRequestData(querySource, '/api/query'));
        expect([...url.searchParams.entries()]).toContainEqual(['universe', querySource.universe]);
    });

    it('should append other parameters to query parameters if available', () => {
        const querySource: QuerySource = {
            address: 'https://sample.sp.backtrace.io',
            project: 'projectName',
            universe: 'universeName',
            token: 'token',
            params: {
                param1: 'a',
                param2: ['b', 'c'],
            },
        };

        const { url } = Result.unwrap(createRequestData(querySource, '/api/query'));
        expect([...url.searchParams.entries()]).toContainEqual(['param1', 'a']);
        expect([...url.searchParams.entries()]).toContainEqual(['param2', 'b']);
        expect([...url.searchParams.entries()]).toContainEqual(['param2', 'c']);
    });

    it('should not remove original query parameters from the resource', () => {
        const querySource: QuerySource = {
            address: 'https://sample.sp.backtrace.io',
            project: 'projectName',
            universe: 'universeName',
            token: 'token',
            params: {
                param1: 'a',
                param2: ['b', 'c'],
            },
        };

        const { url } = Result.unwrap(createRequestData(querySource, '/api/query?param2=x'));
        expect([...url.searchParams.entries()]).toContainEqual(['param1', 'a']);
        expect([...url.searchParams.entries()]).toContainEqual(['param2', 'b']);
        expect([...url.searchParams.entries()]).toContainEqual(['param2', 'c']);
        expect([...url.searchParams.entries()]).toContainEqual(['param2', 'x']);
    });

    it('should add X-Coroner-Location header with address', () => {
        const querySource: QuerySource = {
            address: 'https://sample.sp.backtrace.io',
            project: 'projectName',
            token: 'token',
        };

        const { headers } = Result.unwrap(createRequestData(querySource, '/api/query'));
        expect(headers).toMatchObject({ 'X-Coroner-Location': querySource.address });
    });

    it('should add X-Coroner-Location header with location if available', () => {
        const querySource: QuerySource = {
            address: 'https://sample.sp.backtrace.io',
            location: 'https://other.sp.backtrace.io',
            project: 'projectName',
            token: 'token',
        };

        const { headers } = Result.unwrap(createRequestData(querySource, '/api/query'));
        expect(headers).toMatchObject({ 'X-Coroner-Location': querySource.location });
    });

    it('should add X-Coroner-Token header with token if available', () => {
        const querySource: QuerySource = {
            address: 'https://sample.sp.backtrace.io',
            project: 'projectName',
            token: 'token',
        };

        const { headers } = Result.unwrap(createRequestData(querySource, '/api/query'));
        expect(headers).toMatchObject({ 'X-Coroner-Token': querySource.token });
    });
});
