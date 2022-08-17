import { SelectedCoronerQueryBuilder } from '../src/implementation/queries/SelectCoronerQueryBuilder';
import { ICoronerQueryExecutor } from '../src/interfaces/ICoronerQueryExecutor';
import { ISelectCoronerSimpleResponseBuilder } from '../src/interfaces/responses/ISelectCoronerSimpleResponseBuilder';
import { Attribute } from '../src/queries/common';
import { SelectQueryRequest } from '../src/requests/select';

describe('SelectedCoronerQueryBuilder', () => {
    const executorMock: ICoronerQueryExecutor = {
        execute: jest.fn().mockReturnValue({ response: {} }),
    };

    const builderMock: ISelectCoronerSimpleResponseBuilder = {
        first: jest.fn().mockReturnValue({}),
        toArray: jest.fn().mockReturnValue([]),
    };

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it('should set select keys to passed keys when initial keys are empty', () => {
        const request: SelectQueryRequest<Attribute, string[]> = {};
        const queryable = new SelectedCoronerQueryBuilder(request, executorMock, builderMock);
        const expectedKeys = ['a', 'b', 'c'];

        const newRequest = queryable.select('a').select('b').select('c').getRequest();

        expect(newRequest.select).toEqual(expectedKeys);
    });

    it('should add select keys from passed keys when initial keys are not empty', () => {
        const request: SelectQueryRequest<Attribute, string[]> = {
            select: ['a'],
        };
        const queryable = new SelectedCoronerQueryBuilder(request, executorMock, builderMock);
        const expectedKeys = ['a', 'b', 'c'];

        const newRequest = queryable.select('b').select('c').getRequest();

        expect(newRequest.select).toEqual(expectedKeys);
    });

    it('should not add select keys from passed keys when keys already exist', () => {
        const request: SelectQueryRequest<Attribute, string[]> = {
            select: ['a', 'b', 'c'],
        };
        const queryable = new SelectedCoronerQueryBuilder(request, executorMock, builderMock);
        const expectedKeys = ['a', 'b', 'c'];

        const newRequest = queryable.select('a').select('b').select('c').getRequest();

        expect(newRequest.select).toEqual(expectedKeys);
    });
});
