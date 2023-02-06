import { FoldedCoronerQuery, FoldQueryRequest, ICoronerQueryExecutor, IFoldCoronerSimpleResponseBuilder } from '../src';
import { FoldedCoronerQueryBuilder } from '../src/implementation/queries/FoldCoronerQueryBuilder';

describe('FoldedCoronerQueryBuilder', () => {
    const executorMock: ICoronerQueryExecutor = {
        execute: jest.fn().mockReturnValue({ response: {} }),
    };

    const builderMock: IFoldCoronerSimpleResponseBuilder = {
        first: jest.fn().mockReturnValue({}),
        rows: jest.fn().mockReturnValue([]),
    };

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it('should set fold params to provided fold when initial fold is empty', () => {
        const request: FoldQueryRequest = {};
        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.fold('a', 'head').json();

        expect(newRequest.fold).toEqual({
            a: [['head']],
        });
    });

    it('should add fold params from provided fold for the same attribute when initial fold is not empty', () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['head']],
            },
        };

        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.fold('a', 'distribution', 3).json();

        expect(newRequest.fold).toEqual({
            a: [['head'], ['distribution', 3]],
        });
    });

    it('should add fold params from provided fold for a new attribute when initial fold is not empty', () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['head']],
            },
        };

        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.fold('b', 'max').json();

        expect(newRequest.fold).toEqual({
            a: [['head']],
            b: [['max']],
        });
    });

    it('should add order by fold for a new attribute when initial order is empty', () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['tail'], ['head']],
            },
        } as const;

        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);
        const newRequest = queryable.order('a', 'ascending', 'head').json();

        expect(newRequest.order).toEqual([
            {
                name: 'a;1',
                ordering: 'ascending',
            },
        ]);
    });

    it('should add order by fold for a new attribute when initial order is not empty', () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['tail'], ['head']],
            },
            order: [
                {
                    name: 'a;0',
                    ordering: 'ascending',
                },
            ],
        } as const;

        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);
        const newRequest = queryable.order('a', 'ascending', 'head').json();

        expect(newRequest.order).toEqual([
            {
                name: 'a;0',
                ordering: 'ascending',
            },
            {
                name: 'a;1',
                ordering: 'ascending',
            },
        ]);
    });

    it('should add order by index for a new attribute when initial order is empty', () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['head']],
            },
        } as const;

        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);
        const newRequest = queryable.order('a', 'ascending', 1).json();

        expect(newRequest.order).toEqual([
            {
                name: 'a;1',
                ordering: 'ascending',
            },
        ]);
    });

    it('should add order by index for a new attribute when initial order is not empty', () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['head']],
            },
            order: [
                {
                    name: 'a;0',
                    ordering: 'ascending',
                },
            ],
        } as const;

        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);
        const newRequest = queryable.order('a', 'ascending', 1).json();

        expect(newRequest.order).toEqual([
            {
                name: 'a;0',
                ordering: 'ascending',
            },
            {
                name: 'a;1',
                ordering: 'ascending',
            },
        ]);
    });

    it('should add order by count when initial order is empty', () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['tail'], ['head']],
            },
        } as const;

        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);
        const newRequest = queryable.orderByCount('ascending').json();

        expect(newRequest.order).toEqual([
            {
                name: ';count',
                ordering: 'ascending',
            },
        ]);
    });

    it('should add order by count when initial order is not empty', () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['tail'], ['head']],
            },
            order: [
                {
                    name: 'a;0',
                    ordering: 'ascending',
                },
            ],
        } as const;

        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);
        const newRequest = queryable.orderByCount('ascending').json();

        expect(newRequest.order).toEqual([
            {
                name: 'a;0',
                ordering: 'ascending',
            },
            {
                name: ';count',
                ordering: 'ascending',
            },
        ]);
    });

    it('should add virtual column when initial virtual columns are empty', () => {
        const request: FoldQueryRequest = {};

        const queryable: FoldedCoronerQuery = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable
            .virtualColumn('a', 'quantize_uint', { backing_column: 'b', offset: 123, size: 456 })
            .json();

        expect(newRequest.virtual_columns).toEqual([
            {
                name: 'a',
                type: 'quantize_uint',
                quantize_uint: {
                    backing_column: 'b',
                    offset: 123,
                    size: 456,
                },
            },
        ]);
    });

    it('should add virtual column when initial virtual columns are not empty', () => {
        const request: FoldQueryRequest = {
            virtual_columns: [
                {
                    name: 'a',
                    type: 'quantize_uint',
                    quantize_uint: {
                        backing_column: 'x',
                        offset: 123,
                        size: 456,
                    },
                },
            ],
        } as const;

        const queryable: FoldedCoronerQuery = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable
            .virtualColumn('b', 'truncate_timestamp', { backing_column: 'y', granularity: 'day' })
            .json();

        expect(newRequest.virtual_columns).toEqual([
            {
                name: 'a',
                type: 'quantize_uint',
                quantize_uint: {
                    backing_column: 'x',
                    offset: 123,
                    size: 456,
                },
            },
            {
                name: 'b',
                type: 'truncate_timestamp',
                truncate_timestamp: {
                    backing_column: 'y',
                    granularity: 'day',
                },
            },
        ]);
    });

    it('should add post-aggregation range filter by fold when initial having is empty', async () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['distribution', 3], ['range'], ['distribution', 5]],
            },
        };
        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.having('a', ['range'], '==', { from: 123, to: 456 }).json();

        expect(newRequest).toMatchObject({
            having: [
                {
                    op: '==',
                    params: [123],
                    property: ['a;1;0'],
                },
                {
                    op: '==',
                    params: [456],
                    property: ['a;1;1'],
                },
                {
                    op: 'boolean',
                    params: ['and'],
                },
            ],
        });
    });

    it('should add post-aggregation distribution filter by fold when initial having is empty', async () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['distribution', 3], ['range'], ['distribution', 5]],
            },
        };
        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.having('a', ['distribution', 5], '==', { keys: 123, tail: 456 }).json();

        expect(newRequest).toMatchObject({
            having: [
                {
                    op: '==',
                    params: [123],
                    property: ['a;2;0'],
                },
                {
                    op: '==',
                    params: [456],
                    property: ['a;2;1'],
                },
                {
                    op: 'boolean',
                    params: ['and'],
                },
            ],
        });
    });

    it('should add post-aggregation head filter by fold when initial having is empty', async () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['head']],
            },
        };
        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.having('a', ['head'], '==', 123).json();

        expect(newRequest).toMatchObject({
            having: [
                {
                    op: '==',
                    params: [123],
                    property: ['a;0;0'],
                },
            ],
        });
    });

    it('should add post-aggregation range filter by fold and value index when initial having is empty', async () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['distribution', 3], ['range'], ['distribution', 5]],
            },
        };
        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.having('a', ['range'], '==', 1, 123).json();

        expect(newRequest).toMatchObject({
            having: [
                {
                    op: '==',
                    params: [123],
                    property: ['a;1;1'],
                },
            ],
        });
    });

    it('should add post-aggregation distribution filter by fold when initial having is empty', async () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['distribution', 3], ['range'], ['distribution', 5]],
            },
        };
        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.having('a', ['distribution', 5], '==', 0, 123).json();

        expect(newRequest).toMatchObject({
            having: [
                {
                    op: '==',
                    params: [123],
                    property: ['a;2;0'],
                },
            ],
        });
    });

    it('should add post-aggregation head filter by fold when initial having is empty', async () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['head']],
            },
        };
        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.having('a', ['head'], '==', 0, 123).json();

        expect(newRequest).toMatchObject({
            having: [
                {
                    op: '==',
                    params: [123],
                    property: ['a;0;0'],
                },
            ],
        });
    });

    it('should add post-aggregation head filter by index when initial having is empty', async () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['head']],
            },
        };
        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.having('a', 0, 'equal', 123).json();

        expect(newRequest).toMatchObject({
            having: [
                {
                    op: '==',
                    params: [123],
                    property: ['a;0;0'],
                },
            ],
        });
    });

    it('should add post-aggregation range filter by index when initial having is empty', async () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['distribution', 3], ['range'], ['distribution', 5]],
            },
        };
        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.having('a', 1, '==', { from: 123, to: 456 }).json();

        expect(newRequest).toMatchObject({
            having: [
                {
                    op: '==',
                    params: [123],
                    property: ['a;1;0'],
                },
                {
                    op: '==',
                    params: [456],
                    property: ['a;1;1'],
                },
                {
                    op: 'boolean',
                    params: ['and'],
                },
            ],
        });
    });

    it('should add post-aggregation distribution filter by index when initial having is empty', async () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['distribution', 3], ['range'], ['distribution', 5]],
            },
        };
        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.having('a', 2, '==', { keys: 123, tail: 456 }).json();

        expect(newRequest).toMatchObject({
            having: [
                {
                    op: '==',
                    params: [123],
                    property: ['a;2;0'],
                },
                {
                    op: '==',
                    params: [456],
                    property: ['a;2;1'],
                },
                {
                    op: 'boolean',
                    params: ['and'],
                },
            ],
        });
    });

    it('should add post-aggregation filter by index and value index when initial having is empty', async () => {
        const request: FoldQueryRequest = {};
        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.having('a', 2, '==', 0, 123).json();

        expect(newRequest).toMatchObject({
            having: [
                {
                    op: '==',
                    params: [123],
                    property: ['a;2;0'],
                },
            ],
        });
    });

    it('should add post-aggregation filter by index and value index when initial having is not empty', async () => {
        const request: FoldQueryRequest = {
            having: [
                {
                    op: '<=',
                    params: [456],
                    property: ['a;1;0'],
                },
            ],
        };

        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.having('a', 2, '==', 0, 123).json();

        expect(newRequest).toMatchObject({
            having: [
                {
                    op: '<=',
                    params: [456],
                    property: ['a;1;0'],
                },
                {
                    op: '==',
                    params: [123],
                    property: ['a;2;0'],
                },
                {
                    op: 'boolean',
                    params: ['and'],
                },
            ],
        });
    });

    it('should add post-aggregation filter by index and value index when initial having is not empty', async () => {
        const request: FoldQueryRequest = {
            having: [
                {
                    op: '<=',
                    params: [456],
                    property: ['a;1;0'],
                },
                {
                    op: '>=',
                    params: [789],
                    property: ['a;1;0'],
                },
                {
                    op: 'boolean',
                    params: ['and'],
                },
            ],
        };

        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.having('a', 2, '==', 0, 123).json();

        expect(newRequest).toMatchObject({
            having: [
                {
                    op: '<=',
                    params: [456],
                    property: ['a;1;0'],
                },
                {
                    op: '>=',
                    params: [789],
                    property: ['a;1;0'],
                },
                {
                    op: 'boolean',
                    params: ['and'],
                },
                {
                    op: '==',
                    params: [123],
                    property: ['a;2;0'],
                },
                {
                    op: 'boolean',
                    params: ['and'],
                },
            ],
        });
    });

    it('should add post-aggregation filter on count when initial having is empty', () => {
        const request: FoldQueryRequest = {};
        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.havingCount('==', 50).json();

        expect(newRequest).toMatchObject({
            having: [
                {
                    op: '==',
                    params: [50],
                    property: [';count'],
                },
            ],
        });
    });

    it('should add post-aggregation filter on count when initial having is not empty', () => {
        const request: FoldQueryRequest = {
            having: [
                {
                    op: '<=',
                    params: [456],
                    property: [';count'],
                },
                {
                    op: '>=',
                    params: [789],
                    property: ['a;1;0'],
                },
                {
                    op: 'boolean',
                    params: ['and'],
                },
            ],
        };

        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.havingCount('==', 123).json();

        expect(newRequest).toMatchObject({
            having: [
                {
                    op: '<=',
                    params: [456],
                    property: [';count'],
                },
                {
                    op: '>=',
                    params: [789],
                    property: ['a;1;0'],
                },
                {
                    op: 'boolean',
                    params: ['and'],
                },
                {
                    op: '==',
                    params: [123],
                    property: [';count'],
                },
                {
                    op: 'boolean',
                    params: ['and'],
                },
            ],
        });
    });

    it('should remove all instances of fold on removeFold', () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['distribution', 5], ['distribution', 3], ['range'], ['distribution', 5]],
            },
        };

        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.removeFold('a', 'distribution', 5).json();
        expect(newRequest).toMatchObject({
            fold: {
                a: [['distribution', 3], ['range']],
            },
        });
    });

    it('should remove all instances of partial fold on removeFold', () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['distribution', 5], ['distribution', 3], ['range'], ['distribution', 5]],
            },
        };

        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.removeFold('a', 'distribution').json();
        expect(newRequest).toMatchObject({
            fold: {
                a: [['range']],
            },
        });
    });

    it('should remove all folds on attribute on removeFold', () => {
        const request: FoldQueryRequest = {
            fold: {
                a: [['distribution', 5], ['distribution', 3], ['range'], ['distribution', 5]],
                b: [['distribution', 5], ['distribution', 3], ['range'], ['distribution', 5]],
            },
        };

        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.removeFold('a').json();
        expect(newRequest).toMatchObject({
            fold: {
                b: [['distribution', 5], ['distribution', 3], ['range'], ['distribution', 5]],
            },
        });
        expect(newRequest.fold?.['a']).toBeUndefined();
    });
});
