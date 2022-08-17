import { FoldCoronerSimpleResponseBuilder } from '../src/implementation/responses/FoldCoronerSimpleResponseBuilder';
import { Attribute } from '../src/queries/common';
import { Folds } from '../src/requests/fold';
import { FoldQueryResponse } from '../src/responses/fold';

describe('FoldCoronerSimpleResponseBuilder', () => {
    it('should return first element from queried elements from first when elements are present', async () => {
        const response: FoldQueryResponse<Attribute, Folds, string> = {
            toArray: () => {
                throw new Error('not implemented');
            },
            first: () => {
                throw new Error('not implemented');
            },
            columns: [['head(a)', 'string']],
            columns_desc: [{ name: 'a', format: 'string', type: 'string', op: 'head' }],
            values: [['*', [['xyz']], 10]],
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
        const element = queryable.first(response as FoldQueryResponse<Attribute, Folds, string>);
        expect(element).toMatchObject({
            attributes: {
                a: {
                    head: 'xyz',
                },
            },
        });
    });

    it('should return undefined element from queried elements from first when no elements are present', async () => {
        const response: FoldQueryResponse<Attribute, Folds, string> = {
            toArray: () => {
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
        const element = queryable.first(response as FoldQueryResponse<Attribute, Folds, string>);
        expect(element).toEqual(undefined);
    });
});
