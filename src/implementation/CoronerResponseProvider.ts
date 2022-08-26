import { CommonCoronerQuery } from '../queries/common';

export class CoronerResponseProvider {
    public getResponse(query: CommonCoronerQuery) {
        return query.getRequest();
    }
}
