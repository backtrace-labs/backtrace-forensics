import { ICoronerApiCaller } from '../../interfaces';
import { ICoronerApiCallerFactory } from '../../interfaces/factories/ICoronerQueryMakerFactory';

export class PlatformCoronerApiCallerFactory implements ICoronerApiCallerFactory {
    public async create() {
        let result: ICoronerApiCaller;

        /// #if TARGET == "node"
        result = new (await import('../NodeCoronerApiCaller')).NodeCoronerApiCaller();
        /// #elif TARGET == "web"
        result = new (await import('../FetchCoronerApiCaller')).FetchCoronerApiCaller();
        /// #endif

        return result;
    }
}
