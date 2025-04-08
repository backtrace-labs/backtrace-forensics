import { Forensics, ForensicsOptions } from '../Forensics';
import {
    CoronerQuery,
    FoldCoronerQuery,
    FoldQueryResponse,
    FoldedCoronerQuery,
    QueryResponse,
    SelectCoronerQuery,
    SelectQueryResponse,
    SelectedCoronerQuery,
} from '../coroner';
import { ICoronerApiCallerFactory } from '../interfaces';
import { Extension } from './extensions';

export namespace Plugins {
    export interface PluginContext {
        readonly options: ForensicsOptions;
        readonly apiCallerFactory: ICoronerApiCallerFactory;
        readonly forensics: Forensics;
    }

    export type PluginExtension<T> = (context: PluginContext) => Extension<T>;
    export type PluginBuilder = (plugin: ForensicsPlugin) => ForensicsPlugin;

    export interface ForensicsPlugin {
        readonly queryExtensions?: readonly PluginExtension<CoronerQuery>[];

        readonly foldQueryExtensions?: readonly PluginExtension<FoldCoronerQuery>[];
        readonly foldedQueryExtensions?: readonly PluginExtension<FoldedCoronerQuery>[];

        readonly selectQueryExtensions?: readonly PluginExtension<SelectCoronerQuery>[];
        readonly selectedQueryExtensions?: readonly PluginExtension<SelectedCoronerQuery>[];

        readonly responseExtensions?: readonly PluginExtension<QueryResponse>[];
        readonly successfulResponseExtensions?: readonly PluginExtension<QueryResponse>[];

        readonly foldResponseExtensions?: readonly PluginExtension<FoldQueryResponse>[];
        readonly successfulFoldResponseExtensions?: readonly PluginExtension<FoldQueryResponse>[];

        readonly selectResponseExtensions?: readonly PluginExtension<SelectQueryResponse>[];
        readonly successfulSelectResponseExtensions?: readonly PluginExtension<SelectQueryResponse>[];
    }

    function pluginExtensionAdder<P extends keyof ForensicsPlugin>(prop: P) {
        return function addExtension(extension: NonNullable<ForensicsPlugin[P]>[number]): PluginBuilder {
            return function addExtension(plugin: ForensicsPlugin): ForensicsPlugin {
                const array = plugin[prop];
                return {
                    ...plugin,
                    [prop]: [...(array ?? []), extension],
                };
            };
        };
    }

    export const addQueryExtension = pluginExtensionAdder('queryExtensions');

    export const addFoldQueryExtension = pluginExtensionAdder('foldQueryExtensions');
    export const addFoldedQueryExtension = pluginExtensionAdder('foldedQueryExtensions');

    export const addSelectQueryExtension = pluginExtensionAdder('selectQueryExtensions');
    export const addSelectedQueryExtension = pluginExtensionAdder('selectedQueryExtensions');

    export const addResponseExtension = pluginExtensionAdder('responseExtensions');
    export const addSuccessfulResponseExtension = pluginExtensionAdder('successfulResponseExtensions');

    export const addFoldResponseExtension = pluginExtensionAdder('foldResponseExtensions');
    export const addSuccessfulFoldResponseExtension = pluginExtensionAdder('successfulFoldResponseExtensions');

    export const addSelectResponseExtension = pluginExtensionAdder('selectResponseExtensions');
    export const addSuccessfulSelectResponseExtension = pluginExtensionAdder('successfulSelectResponseExtensions');

    export function createPlugin(...extensions: PluginBuilder[]) {
        return extensions.reduce((plugin, extend) => extend(plugin), {} as ForensicsPlugin);
    }

    export function extend<T>(obj: T, extensions: Extension<T>[]): T {
        type KeyType = keyof T;

        for (const extension of extensions) {
            for (const key in extension) {
                obj[key as KeyType] = extension[key] as T[KeyType];
            }
        }

        return obj;
    }
}
