import { ICoronerApiCaller } from '../ICoronerApiCaller';

export interface ICoronerApiCallerFactory {
    create(): Promise<ICoronerApiCaller>;
}

export type CoronerApiCallerProvider = ICoronerApiCaller | (() => ICoronerApiCaller | Promise<ICoronerApiCaller>);

export function getApiCallerFactory(
    provider: CoronerApiCallerProvider | ICoronerApiCallerFactory,
): ICoronerApiCallerFactory {
    if (typeof provider === 'function') {
        return {
            create: async () => await provider(),
        };
    } else if (typeof provider === 'object' && 'create' in provider) {
        return provider;
    } else {
        return {
            create: () => Promise.resolve(provider),
        };
    }
}
