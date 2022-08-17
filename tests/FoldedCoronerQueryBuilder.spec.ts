import { FoldedCoronerQueryBuilder } from '../src/implementation/queries/FoldCoronerQueryBuilder';
import { ICoronerQueryExecutor } from '../src/interfaces/ICoronerQueryExecutor';
import { IFoldCoronerSimpleResponseBuilder } from '../src/interfaces/responses/IFoldCoronerSimpleResponseBuilder';
import { Attribute } from '../src/queries/common';
import { FoldQueryRequest, Folds } from '../src/requests/fold';

describe('FoldedCoronerQueryBuilder', () => {
    const executorMock: ICoronerQueryExecutor = {
        execute: jest.fn().mockReturnValue({ response: {} }),
    };

    const builderMock: IFoldCoronerSimpleResponseBuilder = {
        first: jest.fn().mockReturnValue({}),
        toArray: jest.fn().mockReturnValue([]),
    };

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it('should set fold params to provided fold when initial fold is empty', () => {
        const request: FoldQueryRequest<Attribute, Folds, string> = {};
        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.fold('a', 'head').getRequest();

        expect(newRequest.fold).toEqual({
            a: [['head']],
        });
    });

    it('should add fold params from provided fold for the same attribute when initial fold is not empty', () => {
        const request: FoldQueryRequest<Attribute, Folds, string> = {
            fold: {
                a: [['head']],
            },
        };

        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.fold('a', 'distribution', 3).getRequest();

        expect(newRequest.fold).toEqual({
            a: [['head'], ['distribution', 3]],
        });
    });

    it('should add fold params from provided fold for a new attribute when initial fold is not empty', () => {
        const request: FoldQueryRequest<Attribute, Folds, string> = {
            fold: {
                a: [['head']],
            },
        };

        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        const newRequest = queryable.fold('b', 'max').getRequest();

        expect(newRequest.fold).toEqual({
            a: [['head']],
            b: [['max']],
        });
    });

    it('should throw on getResponse when fold or group was not made', async () => {
        const request: FoldQueryRequest<Attribute, Folds, string> = {};
        const queryable = new FoldedCoronerQueryBuilder(request, executorMock, builderMock);

        await expect(queryable.getResponse()).rejects.toThrow('Fold or group query expected.');
    });
});
