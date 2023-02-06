import { ICoronerApiCaller } from '../ICoronerApiCaller';

export interface ICoronerApiCallerFactory {
    create(): Promise<ICoronerApiCaller>;
}
