import {
    ICoronerQueryExecutor,
    IFoldCoronerQueryBuilderFactory,
    ISelectCoronerQueryBuilderFactory,
    QueryRequest,
} from '../src';
import { CoronerQueryBuilder } from '../src/implementation/queries/CoronerQueryBuilder';

describe('CoronerQueryBuilder', () => {
    const foldQueryableMock = {
        json: jest.fn(),
        post: jest.fn(),
        template: jest.fn().mockReturnThis(),
        fold: jest.fn().mockReturnThis(),
        removeFold: jest.fn().mockReturnThis(),
        group: jest.fn().mockReturnThis(),
        filter: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        orderByCount: jest.fn().mockReturnThis(),
        orderByGroup: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        havingCount: jest.fn().mockReturnThis(),
        table: jest.fn().mockReturnThis(),
        virtualColumn: jest.fn().mockReturnThis(),
    };

    const foldFactory: IFoldCoronerQueryBuilderFactory = {
        create: () => foldQueryableMock,
    };

    const selectQueryableMock = {
        json: jest.fn(),
        post: jest.fn(),
        template: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        filter: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        table: jest.fn().mockReturnThis(),
        selectAll: jest.fn().mockReturnThis(),
    };

    const selectFactory: ISelectCoronerQueryBuilderFactory = {
        create: () => selectQueryableMock,
    };

    const executorMock: ICoronerQueryExecutor = {
        execute: jest.fn().mockReturnValue({ response: {} }),
    };

    function buildQueryBuilder(request: QueryRequest) {
        return new CoronerQueryBuilder(request, executorMock, buildQueryBuilder, foldFactory, selectFactory);
    }

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it('should set limit to passed value', () => {
        const request: QueryRequest = {};
        const queryable = buildQueryBuilder(request);

        const limit = 1337;
        const newRequest = queryable.limit(limit).json();

        expect(newRequest).toHaveProperty('limit', limit);
    });

    it('should set offset to passed value', () => {
        const request: QueryRequest = {};
        const queryable = buildQueryBuilder(request);

        const offset = 1337;
        const newRequest = queryable.offset(offset).json();

        expect(newRequest).toHaveProperty('offset', offset);
    });

    it('should set filter to passed props when no filter was set', () => {
        const request: QueryRequest = {};
        const queryable = buildQueryBuilder(request);

        const newRequest = queryable.filter('a', 'at-least', 123).json();

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
        const queryable = buildQueryBuilder(request);

        const newRequest = queryable.filter('a', 'at-least', 123).json();

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
        const queryable = buildQueryBuilder(request);

        const newRequest = queryable.filter('a', 'at-least', 123).json();

        expect(newRequest).toHaveProperty('filter', [
            {
                a: [
                    ['at-most', 56],
                    ['at-least', 123],
                ],
            },
        ]);
    });

    it('should add multpile filters for multiple attributes', () => {
        const request: QueryRequest = {
            filter: [
                {
                    a: [['at-most', 56]],
                },
            ],
        };
        const queryable = buildQueryBuilder(request);

        const newRequest = queryable
            .filter({
                a: [
                    ['equal', 123],
                    ['greater-than', 456],
                ],
                b: [['contains', 'test']],
            })
            .json();

        expect(newRequest).toHaveProperty('filter', [
            {
                a: [
                    ['at-most', 56],
                    ['equal', 123],
                    ['greater-than', 456],
                ],
                b: [['contains', 'test']],
            },
        ]);
    });

    it('should add multiple filters for one attribute', () => {
        const request: QueryRequest = {
            filter: [
                {
                    a: [['at-most', 56]],
                },
            ],
        };
        const queryable = buildQueryBuilder(request);

        const newRequest = queryable
            .filter('a', [
                ['equal', 123],
                ['greater-than', 456],
            ])
            .json();

        expect(newRequest).toHaveProperty('filter', [
            {
                a: [
                    ['at-most', 56],
                    ['equal', 123],
                    ['greater-than', 456],
                ],
            },
        ]);
    });

    it('should add one filter for one attribute', () => {
        const request: QueryRequest = {
            filter: [
                {
                    a: [['at-most', 56]],
                },
            ],
        };
        const queryable = buildQueryBuilder(request);

        const newRequest = queryable.filter('a', 'contains', '123', { case_insensitive: true }).json();

        expect(newRequest).toHaveProperty('filter', [
            {
                a: [
                    ['at-most', 56],
                    ['contains', '123', { case_insensitive: true }],
                ],
            },
        ]);
    });

    it('should return an instance of select queryable when selected', () => {
        const request: QueryRequest = {};
        const queryable = buildQueryBuilder(request);

        const selectQueryable = queryable.select('a');

        expect(selectQueryable).toEqual(selectQueryableMock);
    });

    it('should call select on select queryable when selected', () => {
        const request: QueryRequest = {};
        const queryable = buildQueryBuilder(request);

        queryable.select('a');

        expect(selectQueryableMock.select).toBeCalled();
    });

    it('should return an instance of fold queryable when folded', () => {
        const request: QueryRequest = {};
        const queryable = buildQueryBuilder(request);

        const foldQueryable = queryable.fold('a', 'head');

        expect(foldQueryable).toEqual(foldQueryableMock);
    });

    it('should call fold on fold queryable when folded', () => {
        const request: QueryRequest = {};
        const queryable = buildQueryBuilder(request);

        queryable.fold('a', 'head');

        expect(foldQueryableMock.fold).toBeCalled();
    });
});
