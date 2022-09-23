import { CommonAttributes } from '../src/common/attributes';
import { FoldedCoronerQueryBuilder } from '../src/implementation/queries/FoldCoronerQueryBuilder';
import { ICoronerQueryExecutor } from '../src/interfaces/ICoronerQueryExecutor';
import { IFoldCoronerSimpleResponseBuilder } from '../src/interfaces/responses/IFoldCoronerSimpleResponseBuilder';
import { createFoldRequest, FoldQueryRequest } from '../src/requests/fold';

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
        const queryable = new FoldedCoronerQueryBuilder(request, CommonAttributes, executorMock, builderMock);

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

        const queryable = new FoldedCoronerQueryBuilder(request, CommonAttributes, executorMock, builderMock);

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

        const queryable = new FoldedCoronerQueryBuilder(request, CommonAttributes, executorMock, builderMock);

        const newRequest = queryable.fold('b', 'max').json();

        expect(newRequest.fold).toEqual({
            a: [['head']],
            b: [['max']],
        });
    });

    it('should add order by fold for a new attribute when initial order is empty', () => {
        const request = createFoldRequest({
            fold: {
                a: [['tail'], ['head']],
            },
        } as const);

        const queryable = new FoldedCoronerQueryBuilder(request, CommonAttributes, executorMock, builderMock);
        const newRequest = queryable.order('a', 'ascending', 'head').json();

        expect(newRequest.order).toEqual([
            {
                name: 'a;1',
                ordering: 'ascending',
            },
        ]);
    });

    it('should add order by fold for a new attribute when initial order is not empty', () => {
        const request = createFoldRequest({
            fold: {
                a: [['tail'], ['head']],
            },
            order: [
                {
                    name: 'a;0',
                    ordering: 'ascending',
                },
            ],
        } as const);

        const queryable = new FoldedCoronerQueryBuilder(request, CommonAttributes, executorMock, builderMock);
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
        const request = createFoldRequest({
            fold: {
                a: [['head']],
            },
        } as const);

        const queryable = new FoldedCoronerQueryBuilder(request, CommonAttributes, executorMock, builderMock);
        const newRequest = queryable.order('a', 'ascending', 1).json();

        expect(newRequest.order).toEqual([
            {
                name: 'a;1',
                ordering: 'ascending',
            },
        ]);
    });

    it('should add order by index for a new attribute when initial order is not empty', () => {
        const request = createFoldRequest({
            fold: {
                a: [['head']],
            },
            order: [
                {
                    name: 'a;0',
                    ordering: 'ascending',
                },
            ],
        } as const);

        const queryable = new FoldedCoronerQueryBuilder(request, CommonAttributes, executorMock, builderMock);
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
        const request = createFoldRequest({
            fold: {
                a: [['tail'], ['head']],
            },
        } as const);

        const queryable = new FoldedCoronerQueryBuilder(request, CommonAttributes, executorMock, builderMock);
        const newRequest = queryable.orderByCount('ascending').json();

        expect(newRequest.order).toEqual([
            {
                name: ';count',
                ordering: 'ascending',
            },
        ]);
    });

    it('should add order by count when initial order is not empty', () => {
        const request = createFoldRequest({
            fold: {
                a: [['tail'], ['head']],
            },
            order: [
                {
                    name: 'a;0',
                    ordering: 'ascending',
                },
            ],
        } as const);

        const queryable = new FoldedCoronerQueryBuilder(request, CommonAttributes, executorMock, builderMock);
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

    it('should throw on post when fold or group was not made', async () => {
        const request: FoldQueryRequest = {};
        const queryable = new FoldedCoronerQueryBuilder(request, CommonAttributes, executorMock, builderMock);

        await expect(queryable.post()).rejects.toThrow('Fold or group query expected.');
    });
});
