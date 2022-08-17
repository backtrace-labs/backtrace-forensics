import { CommonCoronerQuery } from '../queries/common';

export class CoronerRequestProvider {
    public getRequest(query: CommonCoronerQuery<never>) {
        return query.getRequest();
    }
}
