import { QuerySource } from '../models/QuerySource';

export interface ICoronerApiCaller {
    post<R>(resource: string, source: Partial<QuerySource>, body?: string): Promise<R>;
}
