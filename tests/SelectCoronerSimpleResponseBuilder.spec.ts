import { SelectCoronerSimpleResponseBuilder } from '../src/implementation/responses/SelectCoronerSimpleResponseBuilder';
import { Attribute } from '../src/queries/common';
import { SelectQueryResponse } from '../src/responses/select';

describe('SelectCoronerSimpleResponseBuilder', () => {
    it('should return first element from queried elements from first when elements are present', async () => {
        const response: SelectQueryResponse<Attribute, string[]> = {
            toArray: () => {
                throw new Error('doopa');
            },
            first: () => {
                throw new Error('doopa');
            },
            columns: [
                ['fingerprint', 'sha256'],
                ['randomInt', 'none'],
            ],
            columns_desc: [
                { name: 'fingerprint', format: 'sha256', type: 'dictionary' },
                { name: 'randomInt', format: 'none', type: 'uint32' },
            ],
            objects: [
                [
                    '*',
                    [
                        [341],
                        [340],
                        [339],
                        [338],
                        [337],
                        [336],
                        [335],
                        [334],
                        [333],
                        [332],
                        [331],
                        [330],
                        [329],
                        [328],
                        [327],
                        [326],
                        [325],
                        [324],
                        [323],
                        [322],
                    ],
                ],
            ],
            values: [
                [
                    '*',
                    ['d6eee36c3b255b27268091ad585e32e6bd9f9692eb8bb0c7f1cf3995cb8ff1bc', 2],
                    ['0e2a4590cf070c5fbe86a9b000a27c414050f3347917fec191b8a70f2f3d83ee', 4],
                    ['d6eee36c3b255b27268091ad585e32e6bd9f9692eb8bb0c7f1cf3995cb8ff1bc', 1],
                    ['3adc2af686e2fcb63c74c4c778753e0eb0248374c14243a72a3f7b8a119dfaa2', 1],
                    ['58785ec127bd48dc500da8972de467750178e5995e139733ac4fabae5da51ddd', 1],
                    ['82c60b2309a8e16fda421e07483681e75242560bf0484d5c88c4fb575dde845f', 1],
                    ['98728cd55a983f275f0d62819c3005fe7506a1c0c9bc52a87a93a8d3d10ee80c', 1],
                    ['f2f558bafe87bff35387a31f8cd42cfa83d92ae1fa35d86fca66b888911d4e65', 1],
                    ['58785ec127bd48dc500da8972de467750178e5995e139733ac4fabae5da51ddd', 1],
                    ['fc76efcf8f3800e47f233bc86eacecc598daadae886872e853d474c1550f1d26', 1],
                    ['3ce749a3d93e774420add136113c143ce8320795da569e26d6ad13ee10e1b0af', 1],
                    ['b056f61acc4ec1eaf03f2d4df60ebe2911673536b7c89218374b0c1c762b38f7', 1],
                    ['2a455dab41669d8b85ad2bfab6d47b010e4d0d76f7725182ca2a9af6f261ada5', 1],
                    ['9984467d362daa8d037e81ac100acce3c10298f09111a7d1122b93e9579e2416', 1],
                    ['58785ec127bd48dc500da8972de467750178e5995e139733ac4fabae5da51ddd', 1],
                    ['ffe2703f36969f4d63d791bd5b680a284573d691c3125f3f59f803d6e8586ddc', 1],
                ],
                ['*', [300, 20]],
            ],
            version: '0',
            encoding: 'rle',
            seq: 0,
            pagination: { limit: 0, offset: 0 },
        };

        const builder = new SelectCoronerSimpleResponseBuilder();
        const element = builder.first(response);
        expect(element).toEqual({
            fingerprint: 'd6eee36c3b255b27268091ad585e32e6bd9f9692eb8bb0c7f1cf3995cb8ff1bc',
            randomInt: 300,
        });
    });

    it('should return undefined element from queried elements from first when no elements are present', async () => {
        const response: SelectQueryResponse<Attribute, string[]> = {
            toArray: () => {
                throw new Error('doopa');
            },
            first: () => {
                throw new Error('doopa');
            },
            columns: [
                ['fingerprint', 'sha256'],
                ['randomInt', 'none'],
            ],
            columns_desc: [
                { name: 'fingerprint', format: 'sha256', type: 'dictionary' },
                { name: 'randomInt', format: 'none', type: 'uint32' },
            ],
            objects: [],
            values: [],
            version: '0',
            encoding: 'rle',
            seq: 0,
            pagination: { limit: 0, offset: 0 },
        };

        const builder = new SelectCoronerSimpleResponseBuilder();
        const element = builder.first(response);
        expect(element).toEqual(undefined);
    });
});
