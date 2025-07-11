import assert from 'assert';
import { FoldQueryRequest, RawFoldQueryResponse } from '../src';
import { FoldCoronerSimpleResponseBuilder } from '../src/implementation/responses/FoldCoronerSimpleResponseBuilder';
import { Result, ResultErr } from '@backtrace/utils';

describe('FoldCoronerSimpleResponseBuilder', () => {
    const testRequest: FoldQueryRequest = {
        fold: {
            randomInt: [['head'], ['tail'], ['head'], ['distribution', 3], ['distribution', 5]],
            randomString: [['range'], ['tail'], ['max'], ['bin', 3], ['histogram']],
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
    } as const;

    const testGroupRequest: FoldQueryRequest = {
        fold: {
            randomInt: [['head'], ['tail'], ['head'], ['distribution', 3], ['distribution', 5]],
            randomString: [['range'], ['tail'], ['max'], ['bin', 3], ['histogram']],
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
    } as const;

    const testResponse: RawFoldQueryResponse = {
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
            ['histogram(randomString)', 'none'],
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
            {
                name: 'randomString',
                format: 'none',
                type: 'dictionary',
                op: 'histogram',
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
                    [
                        ['0aa7f056deb302321271d4db00f07f567aef7a16', 1],
                        ['fefc0685a6b052624bb448878b4b4cd2e0cd0b86', 3],
                    ],
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

    const testGroupResponse: RawFoldQueryResponse = {
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
            ['histogram(randomString)', 'none'],
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
            {
                name: 'randomString',
                format: 'none',
                type: 'dictionary',
                op: 'histogram',
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
                    [
                        ['0c0621a40ae6170d93791742df171b75c1dd3017', 1],
                        ['fefc0685a6b052624bb448878b4b4cd2e0cd0b86', 3],
                        ['b32a8560f5be60e4a9569e4851b339a432254df0', 2],
                    ],
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
                                        raw: ['0', 56],
                                    },
                                    {
                                        value: '8580858',
                                        count: 1,
                                        raw: ['8580858', 1],
                                    },
                                    {
                                        value: '16395388',
                                        count: 1,
                                        raw: ['16395388', 1],
                                    },
                                ],
                                raw: [
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
                            },
                        },
                        {
                            fold: 'distribution',
                            rawFold: ['distribution'],
                            value: {
                                keys: 316,
                                tail: 311,
                                values: [
                                    { value: '0', count: 56, raw: ['0', 56] },
                                    { value: '8580858', count: 1, raw: ['8580858', 1] },
                                    { value: '16395388', count: 1, raw: ['16395388', 1] },
                                    { value: '16710727', count: 1, raw: ['16710727', 1] },
                                    { value: '25412139', count: 1, raw: ['25412139', 1] },
                                ],
                                raw: [
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
                            value: {
                                values: [],
                                raw: [],
                            },
                        },
                    ],
                    histogram: [
                        {
                            fold: 'histogram',
                            rawFold: ['histogram'],
                            value: {
                                values: [
                                    {
                                        value: '0aa7f056deb302321271d4db00f07f567aef7a16',
                                        count: 1,
                                        raw: ['0aa7f056deb302321271d4db00f07f567aef7a16', 1],
                                    },
                                    {
                                        value: 'fefc0685a6b052624bb448878b4b4cd2e0cd0b86',
                                        count: 3,
                                        raw: ['fefc0685a6b052624bb448878b4b4cd2e0cd0b86', 3],
                                    },
                                ],
                                raw: [
                                    ['0aa7f056deb302321271d4db00f07f567aef7a16', 1],
                                    ['fefc0685a6b052624bb448878b4b4cd2e0cd0b86', 3],
                                ],
                            },
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
                                        raw: ['16395388', 1],
                                    },
                                    {
                                        value: '16710727',
                                        count: 1,
                                        raw: ['16710727', 1],
                                    },
                                    {
                                        value: '25412139',
                                        count: 1,
                                        raw: ['25412139', 1],
                                    },
                                ],
                                raw: [
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
                            },
                        },
                        {
                            fold: 'distribution',
                            rawFold: ['distribution'],
                            value: {
                                keys: 204,
                                tail: 199,
                                values: [
                                    { value: '16395388', count: 1, raw: ['16395388', 1] },
                                    { value: '16710727', count: 1, raw: ['16710727', 1] },
                                    { value: '25412139', count: 1, raw: ['25412139', 1] },
                                    { value: '28219319', count: 1, raw: ['28219319', 1] },
                                    { value: '47839469', count: 1, raw: ['47839469', 1] },
                                ],
                                raw: [
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
                            value: {
                                values: [],
                                raw: [],
                            },
                        },
                    ],
                    histogram: [
                        {
                            fold: 'histogram',
                            rawFold: ['histogram'],
                            value: {
                                values: [
                                    {
                                        value: '0c0621a40ae6170d93791742df171b75c1dd3017',
                                        count: 1,
                                        raw: ['0c0621a40ae6170d93791742df171b75c1dd3017', 1],
                                    },
                                    {
                                        value: 'fefc0685a6b052624bb448878b4b4cd2e0cd0b86',
                                        count: 3,
                                        raw: ['fefc0685a6b052624bb448878b4b4cd2e0cd0b86', 3],
                                    },
                                    {
                                        value: 'b32a8560f5be60e4a9569e4851b339a432254df0',
                                        count: 2,
                                        raw: ['b32a8560f5be60e4a9569e4851b339a432254df0', 2],
                                    },
                                ],
                                raw: [
                                    ['0c0621a40ae6170d93791742df171b75c1dd3017', 1],
                                    ['fefc0685a6b052624bb448878b4b4cd2e0cd0b86', 3],
                                    ['b32a8560f5be60e4a9569e4851b339a432254df0', 2],
                                ],
                            },
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
                    histogram: [{ rawFold: ['histogram'] }],
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
                { value: '0', count: 56, raw: ['0', 56] },
                { value: '8580858', count: 1, raw: ['8580858', 1] },
                { value: '16395388', count: 1, raw: ['16395388', 1] },
                { value: '16710727', count: 1, raw: ['16710727', 1] },
                { value: '25412139', count: 1, raw: ['25412139', 1] },
            ],
            raw: [
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
                    { value: '0', count: 56, raw: ['0', 56] },
                    { value: '8580858', count: 1, raw: ['8580858', 1] },
                    { value: '16395388', count: 1, raw: ['16395388', 1] },
                    { value: '16710727', count: 1, raw: ['16710727', 1] },
                    { value: '25412139', count: 1, raw: ['25412139', 1] },
                ],
                raw: [
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

    it('[non-grouped] should return value when searching via fold and multiple values with same folds are present', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testResponse, testRequest);
        assert(element);

        const expected = '1765517764';
        const actual = element.fold('randomInt', 'head');
        expect(actual).toEqual(expected);
    });

    it('[non-grouped] should throw on ambiguous value when searching via fold and the value cannot be determined on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testResponse);
        assert(element);
        expect(() => element.fold('randomInt', 'distribution', 5)).toThrowError(/ambiguous/i);
    });

    it('[non-grouped] should return value when searching via fold and multiple values with same folds are present on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const rows = queryable.rows(testResponse, testRequest);
        assert(rows);

        const expected = ['1765517764'];
        const actual = rows.fold('randomInt', 'head');
        expect(actual).toEqual(expected);
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

    it('[non-grouped] should return Error from non-existing attribute when searching via tryFold', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testResponse, testRequest);
        assert(element);
        const actual = element.tryFold('non_existing_attribute' as 'randomInt', 'head');
        expect(Result.isErr(actual)).toEqual(true);
    });

    it('[non-grouped] should return Error from non-existing attribute when searching via tryFold on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testResponse, testRequest);
        assert(element);
        const actual = element.tryFold('non_existing_attribute' as 'randomInt', 'head');
        expect(Result.isErr(actual)).toEqual(true);
    });

    it('[non-grouped] should return Error from non-existing fold when searching via tryFold', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testResponse, testRequest);
        assert(element);
        const actual = element.tryFold('randomInt', 'max');
        expect(Result.isErr(actual)).toEqual(true);
    });

    it('[non-grouped] should return Error from non-existing fold when searching via tryFold on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testResponse, testRequest);
        assert(element);
        const actual = element.tryFold('randomInt', 'max');
        expect(Result.isErr(actual)).toEqual(true);
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
        expect(actual).toEqual(['*']);
    });

    it('[non-grouped] should return * from group when searching via group with *', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testResponse, testRequest);
        assert(element);
        const actual = element.group('*');
        expect(actual).toEqual('*');
    });

    it('[non-grouped] should return * from group when searching via group with *', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testResponse, testRequest);
        assert(element);
        const actual = element.group('*');
        expect(actual).toEqual(['*']);
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

        const expected = ['f9be5fab68692b9792f33335798a01e89a7e0b9a42ee75548b4517de9e5da3a0'];
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

        const expected = ['f9be5fab68692b9792f33335798a01e89a7e0b9a42ee75548b4517de9e5da3a0'];
        const actual = element.group();
        expect(actual).toEqual(expected);
    });

    it('[grouped] should return group value via group with * value', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testGroupResponse, testGroupRequest);
        assert(element);

        const expected = 'f9be5fab68692b9792f33335798a01e89a7e0b9a42ee75548b4517de9e5da3a0';
        const actual = element.group('*' as 'fingerprint');
        expect(actual).toEqual(expected);
    });

    it('[grouped] should return group value via group with * value on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testGroupResponse, testGroupRequest);
        assert(element);

        const expected = ['f9be5fab68692b9792f33335798a01e89a7e0b9a42ee75548b4517de9e5da3a0'];
        const actual = element.group('*' as 'fingerprint');
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

    it('[grouped] should return Error from non-existing attribute via tryGroup', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testGroupResponse, testGroupRequest);
        assert(element);
        const actual = element.tryGroup('non-existing' as 'fingerprint');
        expect(Result.isErr(actual)).toEqual(true);
    });

    it('[grouped] should return Error from non-existing attribute via tryGroup on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testGroupResponse, testGroupRequest);
        assert(element);
        const actual = element.tryGroup('non-existing' as 'fingerprint');
        expect(Result.isErr(actual)).toEqual(true);
    });

    it('[grouped] should return Error from non-grouped attribute via tryGroup', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.first(testGroupResponse, testGroupRequest);
        assert(element);
        const actual = element.tryGroup('randomInt' as 'fingerprint');
        expect(Result.isErr(actual)).toEqual(true);
    });

    it('[grouped] should return Error from non-grouped attribute via tryGroup on rows', () => {
        const queryable = new FoldCoronerSimpleResponseBuilder();
        const element = queryable.rows(testGroupResponse, testGroupRequest);
        assert(element);
        const actual = element.tryGroup('randomInt' as 'fingerprint');
        expect(Result.isErr(actual)).toEqual(true);
    });

    it('should return undefined element from queried elements from first when no elements are present', () => {
        const response: RawFoldQueryResponse = {
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
        const element = queryable.first(response as RawFoldQueryResponse);
        expect(element).toEqual(undefined);
    });
});
