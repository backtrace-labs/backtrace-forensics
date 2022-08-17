import { Attribute } from '../queries/common';
import { DefaultGroup } from '../queries/fold';
import { CommonQueryRequest } from '../requests/common';
import { FoldQueryRequest, Folds } from '../requests/fold';
import { SelectQueryRequest } from '../requests/select';
import { CoronerResponse } from '../responses/common';

export class CoronerQueryExecutor {
    readonly #address: string;
    readonly #token: string;

    constructor(address: string, token: string) {
        this.#address = address;
        this.#token = token;
    }

    public execute(request: CommonQueryRequest): Promise<CoronerResponse<never>> {
        if ('fold' in request || 'group' in request) {
            const foldRequest = request as FoldQueryRequest<Attribute, Folds, DefaultGroup>;
        } else if ('select' in request) {
            const selectRequest = request as SelectQueryRequest<Attribute, []>;
        } else {
            throw new Error('Invalid request.');
        }

        throw new Error('not implemented');
    }
}
