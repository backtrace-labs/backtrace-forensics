import { CommonCoronerQuery } from '../queries/common';

export class CoronerResponseProvider {
    public getResponse(query: CommonCoronerQuery<never>) {
        return query.getRequest();
    }
}
