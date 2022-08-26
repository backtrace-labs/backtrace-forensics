import { CommonCoronerQuery } from '../queries/common';

export class CoronerRequestProvider {
    public getRequest(query: CommonCoronerQuery) {
        return query.getRequest();
    }
}
