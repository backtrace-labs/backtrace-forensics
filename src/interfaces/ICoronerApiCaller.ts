import { QuerySource } from '../models/QuerySource';

export interface ICoronerApiCaller {
    post<R>(url: URL, source: Partial<QuerySource>, body?: string): Promise<R>;
}
