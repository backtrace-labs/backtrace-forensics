import assert from 'assert';
import { FoldCoronerSimpleResponseBuilder } from '../src/implementation/responses/FoldCoronerSimpleResponseBuilder';
import { createFoldRequest, FoldQueryRequest } from '../src/requests/fold';
import { FoldQueryResponse } from '../src/responses/fold';

describe('FoldCoronerSimpleResponseBuilder', () => {
    const testRequest = createFoldRequest({
        fold: {
            randomInt: [['head'], ['tail'], ['head'], ['distribution', 3], ['distribution', 5]],
            randomString: [['range'], ['tail'], ['max'], ['bin', 3]],
        },
        order: [
            {
                name: ';count',
                ordering: 'descending',
            },
        ],
        offset: 0,
        limit: 20,
        filter: [
            {
                _tx: [['at-least', '1']],
            },
        ],
    } as const);

    const testGroupRequest = createFoldRequest({
        fold: {
            randomInt: [['head'], ['tail'], ['head'], ['distribution', 3], ['distribution', 5]],
            randomString: [['range'], ['tail'], ['max'], ['bin', 3]],
        },
        order: [
            {
                name: ';count',
                ordering: 'descending',
            },
        ],
        group: ['fingerprint'],
        offset: 0,
        limit: 20,
        filter: [
            {
                _tx: [['at-least', '1']],
            },
        ],
    } as const);

    const testResponse: FoldQueryResponse<typeof testRequest> = {
        rows: () => {
            throw new Error('not implemented');
        },
        first: () => {
            throw new Error('not implemented');
        },
        version: '1.2.0',
        seq: 31,
        encoding: 'rle',
        columns: [
            ['head(randomInt)', 'none'],
            ['tail(randomInt)', 'none'],
            ['head(randomInt)', 'none'],
            ['distribution(randomInt)', 'none'],
            ['distribution(randomInt)', 'none'],
            ['range(randomString)', 'none'],
            ['tail(randomString)', 'none'],
            ['max(randomString)', 'none'],
            ['bin(randomString)', 'none'],
        ],
        columns_desc: [
            {
                name: 'randomInt',
                format: 'none',
                type: 'uint32',
                op: 'head',
            },
            {
                name: 'randomInt',
                format: 'none',
                type: 'uint32',
                op: 'tail',
            },
            {
                name: 'randomInt',
                format: 'none',
                type: 'uint32',
                op: 'head',
            },
            {
                name: 'randomInt',
                format: 'none',
                type: 'uint32',
                op: 'distribution',
            },
            {
                name: 'randomInt',
                format: 'none',
                type: 'uint32',
                op: 'distribution',
            },
            {
                name: 'randomString',
                format: 'none',
                type: 'dictionary',
                op: 'range',
            },
            {
                name: 'randomString',
                format: 'none',
                type: 'dictionary',
                op: 'tail',
            },
            {
                name: 'randomString',
                format: 'none',
                type: 'dictionary',
                op: 'max',
            },
            {
                name: 'randomString',
                format: 'none',
                type: 'dictionary',
                op: 'bin',
            },
        ],
        pagination: {
            limit: 20,
            offset: 0,
        },
        values: [
            [
                '*',
                [
                    ['1765517764'],
                    ['0'],
                    ['1765517764'],
                    [
                        {
                            keys: 316,
                            tail: 313,
                            vals: [
                                ['0', 56],
                                ['8580858', 1],
                                ['16395388', 1],
                            ],
                        },
                    ],
                    [
                        {
                            keys: 316,
                            tail: 311,
                            vals: [
                                ['0', 56],
                                ['8580858', 1],
                                ['16395388', 1],
                                ['16710727', 1],
                                ['25412139', 1],
                            ],
                        },
                    ],
                    ['0aa7f056deb302321271d4db00f07f567aef7a16', 'fefc0685a6b052624bb448878b4b4cd2e0cd0b86'],
                    [],
                    ['fefc0685a6b052624bb448878b4b4cd2e0cd0b86'],
                    [],
                ],
                371,
            ],
        ],
        cardinalities: {
            initial: {
                rows: 371,
                groups: 1,
            },
            having: {
                rows: 371,
                groups: 1,
            },
            pagination: {
                rows: 371,
                groups: 1,
            },
        },
    };

    const testGroupResponse: FoldQueryResponse<typeof testGroupRequest> = {
        rows: () => {
            throw new Error('not implemented');
        },
        first: () => {
            throw new Error('not implemented');
        },
        version: '1.2.0',
        seq: 1,
        encoding: 'rle',
        columns: [
            ['head(fingerprint)', 'sha256'],
            ['head(randomInt)', 'none'],
            ['tail(randomInt)', 'none'],
            ['head(randomInt)', 'none'],
            ['distribution(randomInt)', 'none'],
            ['distribution(randomInt)', 'none'],
            ['range(randomString)', 'none'],
            ['tail(randomString)', 'none'],
            ['max(randomString)', 'none'],
            ['bin(randomString)', 'none'],
        ],
        factors_desc: [
            {
                name: 'fingerprint',
                format: 'sha256',
                type: 'dictionary',
            },
        ],
        columns_desc: [
            {
                name: 'fingerprint',
                format: 'sha256',
                type: 'dictionary',
                op: 'head',
            },
            {
                name: 'randomInt',
                format: 'none',
                type: 'uint32',
                op: 'head',
            },
            {
                name: 'randomInt',
                format: 'none',
                type: 'uint32',
                op: 'tail',
            },
            {
                name: 'randomInt',
                format: 'none',
                type: 'uint32',
                op: 'head',
            },
            {
                name: 'randomInt',
                format: 'none',
                type: 'uint32',
                op: 'distribution',
            },
            {
                name: 'randomInt',
                format: 'none',
                type: 'uint32',
                op: 'distribution',
            },
            {
                name: 'randomString',
                format: 'none',
                type: 'dictionary',
                op: 'range',
            },
            {
                name: 'randomString',
                format: 'none',
                type: 'dictionary',
                op: 'tail',
            },
            {
                name: 'randomString',
                format: 'none',
                type: 'dictionary',
                op: 'max',
            },
            {
                name: 'randomString',
                format: 'none',
                type: 'dictionary',
                op: 'bin',
            },
        ],
        pagination: {
            limit: 20,
            offset: 0,
        },
        values: [
            [
                'f9be5fab68692b9792f33335798a01e89a7e0b9a42ee75548b4517de9e5da3a0',
                [
                    ['f9be5fab68692b9792f33335798a01e89a7e0b9a42ee75548b4517de9e5da3a0'],
                    ['16395388'],
                    ['732995071'],
                    ['16395388'],
                    [
                        {
                            keys: 204,
                            tail: 201,
                            vals: [
                                ['16395388', 1],
                                ['16710727', 1],
                                ['25412139', 1],
                            ],
                        },
                    ],
                    [
                        {
                            keys: 204,
                            tail: 199,
                            vals: [
                                ['16395388', 1],
                                ['16710727', 1],
                                ['25412139', 1],
                                ['28219319', 1],
                                ['47839469', 1],
                            ],
                        },
                    ],
                    ['0c0621a40ae6170d93791742df171b75c1dd3017', 'fefc0685a6b052624bb448878b4b4cd2e0cd0b86'],
                    ['b32a8560f5be60e4a9569e4851b339a432254df0'],
                    ['fefc0685a6b052624bb448878b4b4cd2e0cd0b86'],
                    [],
                ],
                204,
            ],
        ],
        cardinalities: {
            initial: {
                rows: 371,
                groups: 31,
            },
            having: {
                rows: 371,
                groups: 31,
            },
            pagination: {
                rows: 371,
                groups: 31,
            },
        },
    };

    it('[non-grouped] should return first element from queried elements from first when elements are present', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testResponse);
        expect(element).toMatchObject({
            count: 371,
            attributes: {
                randomInt: {
                    head: [
                        {
                            fold: 'head',
                            rawFold: ['head'],
                            value: '1765517764',
                        },
                        {
                            fold: 'head',
                            rawFold: ['head'],
                            value: '1765517764',
                        },
                    ],
                    tail: [
                        {
                            fold: 'tail',
                            rawFold: ['tail'],
                            value: '0',
                        },
                    ],
                    distribution: [
                        {
                            fold: 'distribution',
                            rawFold: ['distribution'],
                            value: {
                                keys: 316,
                                tail: 313,
                                values: [
                                    {
                                        value: '0',
                                        count: 56,
                                    },
                                    {
                                        value: '8580858',
                                        count: 1,
                                    },
                                    {
                                        value: '16395388',
                                        count: 1,
                                    },
                                ],
                            },
                        },
                        {
                            fold: 'distribution',
                            rawFold: ['distribution'],
                            value: {
                                keys: 316,
                                tail: 311,
                                values: [
                                    { value: '0', count: 56 },
                                    { value: '8580858', count: 1 },
                                    { value: '16395388', count: 1 },
                                    { value: '16710727', count: 1 },
                                    { value: '25412139', count: 1 },
                                ],
                            },
                        },
                    ],
                },
                randomString: {
                    range: [
                        {
                            fold: 'range',
                            rawFold: ['range'],
                            value: {
                                from: '0aa7f056deb302321271d4db00f07f567aef7a16',
                                to: 'fefc0685a6b052624bb448878b4b4cd2e0cd0b86',
                            },
                        },
                    ],
                    tail: [
                        {
                            fold: 'tail',
                            rawFold: ['tail'],
                            value: null,
                        },
                    ],
                    max: [
                        {
                            fold: 'max',
                            rawFold: ['max'],
                            value: 'fefc0685a6b052624bb448878b4b4cd2e0cd0b86',
                        },
                    ],
                    bin: [
                        {
                            fold: 'bin',
                            rawFold: ['bin'],
                            value: [],
                        },
                    ],
                },
            },
        });
    });

    it('[grouped] should return first element from queried elements from first when elements are present', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testGroupResponse);
        expect(element).toMatchObject({
            count: 204,
            attributes: {
                fingerprint: {
                    groupKey: 'f9be5fab68692b9792f33335798a01e89a7e0b9a42ee75548b4517de9e5da3a0',
                    head: [
                        {
                            fold: 'head',
                            rawFold: ['head'],
                            value: 'f9be5fab68692b9792f33335798a01e89a7e0b9a42ee75548b4517de9e5da3a0',
                        },
                    ],
                },
                randomInt: {
                    head: [
                        {
                            fold: 'head',
                            rawFold: ['head'],
                            value: '16395388',
                        },
                        {
                            fold: 'head',
                            rawFold: ['head'],
                            value: '16395388',
                        },
                    ],
                    tail: [
                        {
                            fold: 'tail',
                            rawFold: ['tail'],
                            value: '732995071',
                        },
                    ],
                    distribution: [
                        {
                            fold: 'distribution',
                            rawFold: ['distribution'],
                            value: {
                                keys: 204,
                                tail: 201,
                                values: [
                                    {
                                        value: '16395388',
                                        count: 1,
                                    },
                                    {
                                        value: '16710727',
                                        count: 1,
                                    },
                                    {
                                        value: '25412139',
                                        count: 1,
                                    },
                                ],
                            },
                        },
                        {
                            fold: 'distribution',
                            rawFold: ['distribution'],
                            value: {
                                keys: 204,
                                tail: 199,
                                values: [
                                    { value: '16395388', count: 1 },
                                    { value: '16710727', count: 1 },
                                    { value: '25412139', count: 1 },
                                    { value: '28219319', count: 1 },
                                    { value: '47839469', count: 1 },
                                ],
                            },
                        },
                    ],
                },
                randomString: {
                    range: [
                        {
                            fold: 'range',
                            rawFold: ['range'],
                            value: {
                                from: '0c0621a40ae6170d93791742df171b75c1dd3017',
                                to: 'fefc0685a6b052624bb448878b4b4cd2e0cd0b86',
                            },
                        },
                    ],
                    tail: [
                        {
                            fold: 'tail',
                            rawFold: ['tail'],
                            value: 'b32a8560f5be60e4a9569e4851b339a432254df0',
                        },
                    ],
                    max: [
                        {
                            fold: 'max',
                            rawFold: ['max'],
                            value: 'fefc0685a6b052624bb448878b4b4cd2e0cd0b86',
                        },
                    ],
                    bin: [
                        {
                            fold: 'bin',
                            rawFold: ['bin'],
                            value: [],
                        },
                    ],
                },
            },
        });
    });

    it('[non-grouped] should contain detailed rawFold when request is passed', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testResponse, testRequest);
        expect(element).toMatchObject({
            attributes: {
                randomInt: {
                    head: [{ rawFold: ['head'] }, { rawFold: ['head'] }],
                    tail: [{ rawFold: ['tail'] }],
                    distribution: [{ rawFold: ['distribution', 3] }, { rawFold: ['distribution', 5] }],
                },
                randomString: {
                    range: [{ rawFold: ['range'] }],
                    tail: [{ rawFold: ['tail'] }],
                    max: [{ rawFold: ['max'] }],
                    bin: [{ rawFold: ['bin', 3] }],
                },
            },
        });
    });

    it('[grouped] should contain detailed rawFold when request is passed', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testGroupResponse, testGroupRequest);
        expect(element).toMatchObject({
            attributes: {
                fingerprint: {
                    head: [{ rawFold: ['head'] }],
                },
                randomInt: {
                    head: [{ rawFold: ['head'] }, { rawFold: ['head'] }],
                    tail: [{ rawFold: ['tail'] }],
                    distribution: [{ rawFold: ['distribution', 3] }, { rawFold: ['distribution', 5] }],
                },
                randomString: {
                    range: [{ rawFold: ['range'] }],
                    tail: [{ rawFold: ['tail'] }],
                    max: [{ rawFold: ['max'] }],
                    bin: [{ rawFold: ['bin', 3] }],
                },
            },
        });
    });

    it('[non-grouped] should return a valid value when searching via fold when request is provided', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testResponse, testRequest);
        assert(element);
        const expected = {
            keys: 316,
            tail: 311,
            values: [
                { value: '0', count: 56 },
                { value: '8580858', count: 1 },
                { value: '16395388', count: 1 },
                { value: '16710727', count: 1 },
                { value: '25412139', count: 1 },
            ],
        };

        const actual = element.fold('randomInt', 'distribution', 5);
        expect(actual).toEqual(expected);
    });

    it('[non-grouped] should return valid values when searching via fold when request is provided on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testResponse, testRequest);
        assert(element);
        const expected = [
            {
                keys: 316,
                tail: 311,
                values: [
                    { value: '0', count: 56 },
                    { value: '8580858', count: 1 },
                    { value: '16395388', count: 1 },
                    { value: '16710727', count: 1 },
                    { value: '25412139', count: 1 },
                ],
            },
        ];

        const actual = element.fold('randomInt', 'distribution', 5);
        expect(actual).toEqual(expected);
    });

    it('[non-grouped] should throw on ambiguous value when searching via fold and the value cannot be determined', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testResponse);
        assert(element);
        expect(() => element.fold('randomInt', 'distribution', 5)).toThrowError(/ambiguous/i);
    });

    it('[non-grouped] should throw on ambiguous value when searching via fold and the value cannot be determined', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testResponse, testRequest);
        assert(element);
        expect(() => element.fold('randomInt', 'head')).toThrowError(/ambiguous/i);
    });

    it('[non-grouped] should throw on ambiguous value when searching via fold and the value cannot be determined on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testResponse);
        assert(element);
        expect(() => element.fold('randomInt', 'distribution', 5)).toThrowError(/ambiguous/i);
    });

    it('[non-grouped] should throw on ambiguous value when searching via fold and the value cannot be determined on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testResponse, testRequest);
        assert(element);
        expect(() => element.fold('randomInt', 'head')).toThrowError(/ambiguous/i);
    });

    it('[non-grouped] should throw on non-existing attribute when searching via fold', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testResponse, testRequest);
        assert(element);
        expect(() => element.fold('non_existing_attribute' as 'randomInt', 'head')).toThrowError(/does not exist/i);
    });

    it('[non-grouped] should throw on non-existing attribute when searching via fold on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testResponse, testRequest);
        assert(element);
        expect(() => element.fold('non_existing_attribute' as 'randomInt', 'head')).toThrowError(/does not exist/i);
    });

    it('[non-grouped] should throw on non-existing fold when searching via fold', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testResponse, testRequest);
        assert(element);
        expect(() => element.fold('randomInt', 'max' as 'head')).toThrowError(/does not exist/i);
    });

    it('[non-grouped] should throw on non-existing fold when searching via fold on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testResponse, testRequest);
        assert(element);
        expect(() => element.fold('randomInt', 'max' as 'head')).toThrowError(/does not exist/i);
    });

    it('[non-grouped] should return undefined from non-existing attribute when searching via tryFold', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testResponse, testRequest);
        assert(element);
        const actual = element.tryFold('non_existing_attribute' as 'randomInt', 'head');
        expect(actual).toBeUndefined();
    });

    it('[non-grouped] should return undefined from non-existing attribute when searching via tryFold on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testResponse, testRequest);
        assert(element);
        const actual = element.tryFold('non_existing_attribute' as 'randomInt', 'head');
        expect(actual).toBeUndefined();
    });

    it('[non-grouped] should return undefined from non-existing fold when searching via tryFold', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testResponse, testRequest);
        assert(element);
        const actual = element.tryFold('randomInt', 'max');
        expect(actual).toBeUndefined();
    });

    it('[non-grouped] should return undefined from non-existing fold when searching via tryFold on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testResponse, testRequest);
        assert(element);
        const actual = element.tryFold('randomInt', 'max');
        expect(actual).toBeUndefined();
    });

    it('[non-grouped] should return * from group when searching via group without attribute', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testResponse, testRequest);
        assert(element);
        const actual = element.group();
        expect(actual).toEqual('*');
    });

    it('[non-grouped] should return * from group when searching via group without attribute on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testResponse, testRequest);
        assert(element);
        const actual = element.group();
        expect(actual).toEqual('*');
    });

    it('[grouped] should return group value via group', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testGroupResponse, testGroupRequest);
        assert(element);

        const expected = 'f9be5fab68692b9792f33335798a01e89a7e0b9a42ee75548b4517de9e5da3a0';
        const actual = element.group('fingerprint');
        expect(actual).toEqual(expected);
    });

    it('[grouped] should return group value via group on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testGroupResponse, testGroupRequest);
        assert(element);

        const expected = 'f9be5fab68692b9792f33335798a01e89a7e0b9a42ee75548b4517de9e5da3a0';
        const actual = element.group('fingerprint');
        expect(actual).toEqual(expected);
    });

    it('[grouped] should return group value via group without attribute', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testGroupResponse, testGroupRequest);
        assert(element);

        const expected = 'f9be5fab68692b9792f33335798a01e89a7e0b9a42ee75548b4517de9e5da3a0';
        const actual = element.group();
        expect(actual).toEqual(expected);
    });

    it('[grouped] should return group value via group without attribute on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testGroupResponse, testGroupRequest);
        assert(element);

        const expected = 'f9be5fab68692b9792f33335798a01e89a7e0b9a42ee75548b4517de9e5da3a0';
        const actual = element.group();
        expect(actual).toEqual(expected);
    });

    it('[grouped] should throw on non-existing attribute via group', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testGroupResponse, testGroupRequest);
        assert(element);
        expect(() => element.group('non-existing' as 'fingerprint')).toThrowError(/does not exist/i);
    });

    it('[grouped] should throw on non-existing attribute via group on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testGroupResponse, testGroupRequest);
        assert(element);
        expect(() => element.group('non-existing' as 'fingerprint')).toThrowError(/does not exist/i);
    });

    it('[grouped] should throw on non-grouped attribute via group', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testGroupResponse, testGroupRequest);
        assert(element);
        expect(() => element.group('randomInt' as 'fingerprint')).toThrowError(/does not exist/i);
    });

    it('[grouped] should throw on non-grouped attribute via group on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testGroupResponse, testGroupRequest);
        assert(element);
        expect(() => element.group('randomInt' as 'fingerprint')).toThrowError(/does not exist/i);
    });

    it('[grouped] should return undefined from non-existing attribute via tryGroup', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testGroupResponse, testGroupRequest);
        assert(element);
        const actual = element.tryGroup('non-existing' as 'fingerprint');
        expect(actual).toBeUndefined();
    });

    it('[grouped] should return undefined from non-existing attribute via tryGroup on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testGroupResponse, testGroupRequest);
        assert(element);
        const actual = element.tryGroup('non-existing' as 'fingerprint');
        expect(actual).toBeUndefined();
    });

    it('[grouped] should return undefined from non-grouped attribute via tryGroup', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testGroupResponse, testGroupRequest);
        assert(element);
        const actual = element.tryGroup('randomInt' as 'fingerprint');
        expect(actual).toBeUndefined();
    });

    it('[grouped] should return undefined from non-grouped attribute via tryGroup on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testGroupResponse, testGroupRequest);
        assert(element);
        const actual = element.tryGroup('randomInt' as 'fingerprint');
        expect(actual).toBeUndefined();
    });

    it('should return undefined element from queried elements from first when no elements are present', () => {
        const response: FoldQueryResponse<FoldQueryRequest> = {
            rows: () => {
                throw new Error('not implemented');
            },
            first: () => {
                throw new Error('not implemented');
            },
            columns: [['head(a)', 'string']],
            columns_desc: [{ name: 'a', format: 'string', type: 'string', op: 'head' }],
            values: [],
            version: '0',
            encoding: 'rle',
            seq: 0,
            pagination: { limit: 0, offset: 0 },
            cardinalities: {
                initial: { rows: 0, groups: 0 },
                having: { rows: 0, groups: 0 },
                pagination: { rows: 0, groups: 0 },
            },
        };

        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(response as FoldQueryResponse<FoldQueryRequest>);
        expect(element).toEqual(undefined);
    });
});
