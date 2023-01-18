import { ICoronerQueryExecutor, ISelectCoronerSimpleResponseBuilder, SelectQueryRequest } from '../src';
import { SelectedCoronerQueryBuilder } from '../src/implementation/queries/SelectCoronerQueryBuilder';

describe('SelectedCoronerQueryBuilder', () => {
    const executorMock: ICoronerQueryExecutor = {
        execute: jest.fn().mockReturnValue({ response: {} }),
    };

    const builderMock: ISelectCoronerSimpleResponseBuilder = {
        first: jest.fn().mockReturnValue({}),
        rows: jest.fn().mockReturnValue([]),
    };

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it('should set select keys to passed keys when initial keys are empty', () => {
        const request: SelectQueryRequest = {};
        const queryable = new SelectedCoronerQueryBuilder(request, executorMock, builderMock);
        const expectedKeys = ['a', 'b', 'c'];

        const newRequest = queryable.select('a').select('b').select('c').json();

        expect(newRequest.select).toEqual(expectedKeys);
    });

    it('should add select keys from passed keys when initial keys are not empty', () => {
        const request: SelectQueryRequest = {
            select: ['a'],
        };
        const queryable = new SelectedCoronerQueryBuilder(request, executorMock, builderMock);
        const expectedKeys = ['a', 'b', 'c'];

        const newRequest = queryable.select('b').select('c').json();

        expect(newRequest.select).toEqual(expectedKeys);
    });

    it('should add order for a attribute when initial order is empty', () => {
        const request: SelectQueryRequest = {};
        const queryable = new SelectedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.order('a', 'descending').json();

        expect(newRequest.order).toEqual([
            {
                name: 'a',
                ordering: 'descending',
            },
        ]);
    });

    it('should add order for a attribute when initial order is not empty', () => {
        const request: SelectQueryRequest = {
            order: [
                {
                    name: 'b',
                    ordering: 'ascending',
                },
            ],
        };
        const queryable = new SelectedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.order('a', 'descending').json();

        expect(newRequest.order).toEqual([
            {
                name: 'b',
                ordering: 'ascending',
            },
            {
                name: 'a',
                ordering: 'descending',
            },
        ]);
    });
});
