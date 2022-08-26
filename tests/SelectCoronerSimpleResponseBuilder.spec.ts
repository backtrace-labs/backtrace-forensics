import assert from 'assert';
import { SelectCoronerSimpleResponseBuilder } from '../src/implementation/responses/SelectCoronerSimpleResponseBuilder';
import { createSelectRequest, SelectQueryRequest } from '../src/requests';
import { SelectQueryResponse } from '../src/responses/select';

describe('SelectCoronerSimpleResponseBuilder', () => {
    const testRequest = createSelectRequest({
        select: ['fingerprint', 'randomInt'],
        offset: 0,
        limit: 20,
        filter: [
            {
                _tx: [['at-least', '1']],
            },
        ],
    } as const);

    const testResponse: SelectQueryResponse<typeof testRequest> = {
        rows: () => {
            throw new Error('not implemented');
        },
        first: () => {
            throw new Error('not implemented');
        },
        version: '1.2.0',
        seq: 2,
        encoding: 'rle',
        columns: [
            ['fingerprint', 'sha256'],
            ['randomInt', 'none'],
        ],
        columns_desc: [
            {
                name: 'fingerprint',
                format: 'sha256',
                type: 'dictionary',
            },
            {
                name: 'randomInt',
                format: 'none',
                type: 'uint32',
            },
        ],
        pagination: {
            limit: 20,
            offset: 0,
        },
        objects: [['*', [[1, 19]]]],
        values: [
            [
                '*',
                ['407c0e05304c264fb48a4f74003e8fd608ad69507608197e86bdd544ae4fad4f', 1],
                ['f9be5fab68692b9792f33335798a01e89a7e0b9a42ee75548b4517de9e5da3a0', 4],
            ],
            ['*', [1765517764, 1], [16395388, 1], [2554929328, 1], [4108795268, 1], [651545726, 1]],
        ],
    };

    it('should return first element from queried elements from first when elements are present', async () => {
        const builder = new SelectCoronerSimpleResponseBuilder();
        const element = builder.first(testResponse);
        expect(element).toMatchObject({
            values: {
                fingerprint: '407c0e05304c264fb48a4f74003e8fd608ad69507608197e86bdd544ae4fad4f',
                randomInt: 1765517764,
            },
        });
    });

    it('should return value via select', () => {
        const builder = new SelectCoronerSimpleResponseBuilder();
        const element = builder.rows(testResponse).rows[4];
        assert(element);
        const expected = 'f9be5fab68692b9792f33335798a01e89a7e0b9a42ee75548b4517de9e5da3a0';
        const actual = element.select('fingerprint');
        expect(actual).toEqual(expected);
    });

    it('should throw on non-existing attribute via select', () => {
        const builder = new SelectCoronerSimpleResponseBuilder();
        const element = builder.rows(testResponse).rows[4];
        assert(element);
        expect(() => element.select('not-existing' as 'fingerprint')).toThrowError(/does not exist/i);
    });

    it('should return undefined on non-existing attribute via trySelect', () => {
        const builder = new SelectCoronerSimpleResponseBuilder();
        const element = builder.rows(testResponse).rows[4];
        assert(element);
        const actual = element.trySelect('non-existing');
        expect(actual).toBeUndefined();
    });

    it('should return values via select on rows', () => {
        const builder = new SelectCoronerSimpleResponseBuilder();
        const element = builder.rows(testResponse);
        assert(element);
        const expected = [
            '407c0e05304c264fb48a4f74003e8fd608ad69507608197e86bdd544ae4fad4f',
            'f9be5fab68692b9792f33335798a01e89a7e0b9a42ee75548b4517de9e5da3a0',
            'f9be5fab68692b9792f33335798a01e89a7e0b9a42ee75548b4517de9e5da3a0',
            'f9be5fab68692b9792f33335798a01e89a7e0b9a42ee75548b4517de9e5da3a0',
            'f9be5fab68692b9792f33335798a01e89a7e0b9a42ee75548b4517de9e5da3a0',
        ];
        const actual = element.select('fingerprint');
        expect(actual).toEqual(expected);
    });

    it('should throw on non-existing attribute via select', () => {
        const builder = new SelectCoronerSimpleResponseBuilder();
        const element = builder.rows(testResponse).rows[4];
        assert(element);
        expect(() => element.select('not-existing' as 'fingerprint')).toThrowError(/does not exist/i);
    });

    it('should return undefined on non-existing attribute via trySelect', () => {
        const builder = new SelectCoronerSimpleResponseBuilder();
        const element = builder.rows(testResponse).rows[4];
        assert(element);
        const actual = element.trySelect('non-existing');
        expect(actual).toBeUndefined();
    });

    it('should throw on non-existing attribute via select on rows', () => {
        const builder = new SelectCoronerSimpleResponseBuilder();
        const element = builder.rows(testResponse);
        assert(element);
        expect(() => element.select('not-existing' as 'fingerprint')).toThrowError(/does not exist/i);
    });

    it('should return undefined on non-existing attribute via trySelect on rows', () => {
        const builder = new SelectCoronerSimpleResponseBuilder();
        const element = builder.rows(testResponse);
        assert(element);
        const actual = element.trySelect('non-existing');
        expect(actual).toBeUndefined();
    });

    it('should return undefined element from queried elements from first when no elements are present', async () => {
        const response: SelectQueryResponse<SelectQueryRequest> = {
            rows: () => {
                throw new Error('not implemented');
            },
            first: () => {
                throw new Error('not implemented');
            },
            columns: [
                ['fingerprint', 'sha256'],
                ['randomInt', 'none'],
            ],
            columns_desc: [
                { name: 'fingerprint', format: 'sha256', type: 'dictionary' },
                { name: 'randomInt', format: 'none', type: 'uint32' },
            ],
            objects: [],
            values: [],
            version: '0',
            encoding: 'rle',
            seq: 0,
            pagination: { limit: 0, offset: 0 },
        };

        const builder = new SelectCoronerSimpleResponseBuilder();
        const element = builder.first(response);
        expect(element).toEqual(undefined);
    });
});
