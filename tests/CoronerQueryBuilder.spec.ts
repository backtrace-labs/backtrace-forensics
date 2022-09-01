import { CoronerQueryBuilder } from '../src/implementation/queries/CoronerQueryBuilder';
import { IFoldCoronerQueryBuilderFactory } from '../src/interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ISelectCoronerQueryBuilderFactory } from '../src/interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { QueryRequest } from '../src/requests/common';

describe('CoronerQueryBuilder', () => {
    const foldQueryableMock = {
        getRequest: jest.fn(),
        getResponse: jest.fn(),
        template: jest.fn().mockReturnThis(),
        fold: jest.fn().mockReturnThis(),
        dynamicFold: jest.fn().mockReturnThis(),
        group: jest.fn().mockReturnThis(),
        filter: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        orderByCount: jest.fn().mockReturnThis(),
    };

    const foldFactory: IFoldCoronerQueryBuilderFactory = {
        create: () => foldQueryableMock,
    };

    const selectQueryableMock = {
        getRequest: jest.fn(),
        getResponse: jest.fn(),
        template: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        dynamicSelect: jest.fn().mockReturnThis(),
        filter: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
    };

    const selectFactory: ISelectCoronerQueryBuilderFactory = {
        create: () => selectQueryableMock,
    };

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it('should set limit to passed value', () => {
        const request: QueryRequest = {};
        const queryable = new CoronerQueryBuilder(request, foldFactory, selectFactory);

        const limit = 1337;
        const newRequest = queryable.limit(limit).getRequest();

        expect(newRequest).toHaveProperty('limit', limit);
    });

    it('should set offset to passed value', () => {
        const request: QueryRequest = {};
        const queryable = new CoronerQueryBuilder(request, foldFactory, selectFactory);

        const offset = 1337;
        const newRequest = queryable.offset(offset).getRequest();

        expect(newRequest).toHaveProperty('offset', offset);
    });

    it('should set filter to passed props when no filter was set', () => {
        const request: QueryRequest = {};
        const queryable = new CoronerQueryBuilder(request, foldFactory, selectFactory);

        const newRequest = queryable.filter('a', 'at-least', 123).getRequest();

        expect(newRequest).toHaveProperty('filter', [
            {
                a: [['at-least', 123]],
            },
        ]);
    });

    it('should add filter from passed props when filter for a different attribute was set', () => {
        const request: QueryRequest = {
            filter: [
                {
                    b: [['at-most', 56]],
                },
            ],
        };
        const queryable = new CoronerQueryBuilder(request, foldFactory, selectFactory);

        const newRequest = queryable.filter('a', 'at-least', 123).getRequest();

        expect(newRequest).toHaveProperty('filter', [
            Object.assign({}, request.filter![0], {
                a: [['at-least', 123]],
            }),
        ]);
    });

    it('should add filter to an attibute from passed props when filter for the attribute was set', () => {
        const request: QueryRequest = {
            filter: [
                {
                    a: [['at-most', 56]],
                },
            ],
        };
        const queryable = new CoronerQueryBuilder(request, foldFactory, selectFactory);

        const newRequest = queryable.filter('a', 'at-least', 123).getRequest();

        expect(newRequest).toHaveProperty('filter', [
            {
                a: [
                    ['at-most', 56],
                    ['at-least', 123],
                ],
            },
        ]);
    });

    it('should return an instance of select queryable when selected', () => {
        const request: QueryRequest = {};
        const queryable = new CoronerQueryBuilder(request, foldFactory, selectFactory);

        const selectQueryable = queryable.select('a');

        expect(selectQueryable).toEqual(selectQueryableMock);
    });

    it('should call select on select queryable when selected', () => {
        const request: QueryRequest = {};
        const queryable = new CoronerQueryBuilder(request, foldFactory, selectFactory);

        queryable.select('a');

        expect(selectQueryableMock.select).toBeCalled();
    });

    it('should return an instance of fold queryable when folded', () => {
        const request: QueryRequest = {};
        const queryable = new CoronerQueryBuilder(request, foldFactory, selectFactory);

        const foldQueryable = queryable.fold('a', 'head');

        expect(foldQueryable).toEqual(foldQueryableMock);
    });

    it('should call fold on fold queryable when folded', () => {
        const request: QueryRequest = {};
        const queryable = new CoronerQueryBuilder(request, foldFactory, selectFactory);

        queryable.fold('a', 'head');

        expect(foldQueryableMock.fold).toBeCalled();
    });
});
