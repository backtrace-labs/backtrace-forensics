import { BacktraceForensicsOptions } from '../BacktraceForensics';
import {
    CoronerQuery,
    FoldCoronerQuery,
    FoldedCoronerQuery,
    SelectCoronerQuery,
    SelectedCoronerQuery,
} from '../coroner';
import { ICoronerApiCallerFactory } from '../interfaces';
import { Extension } from './extensions';

export namespace Plugins {
    export interface PluginContext {
        readonly options: BacktraceForensicsOptions;
        readonly apiCallerFactory: ICoronerApiCallerFactory;
    }

    export type PluginExtension<T> = (context: PluginContext) => Extension<T>;
    export type PluginBuilder = (plugin: BacktraceForensicsPlugin) => BacktraceForensicsPlugin;

    export interface BacktraceForensicsPlugin {
        readonly queryExtensions?: readonly PluginExtension<CoronerQuery>[];

        readonly foldQueryExtensions?: readonly PluginExtension<FoldCoronerQuery>[];
        readonly foldedQueryExtensions?: readonly PluginExtension<FoldedCoronerQuery>[];

        readonly selectQueryExtensions?: readonly PluginExtension<SelectCoronerQuery>[];
        readonly selectedQueryExtensions?: readonly PluginExtension<SelectedCoronerQuery>[];
    }

    function pluginExtensionAdder<P extends keyof BacktraceForensicsPlugin>(prop: P) {
        return function addExtension(extension: NonNullable<BacktraceForensicsPlugin[P]>[number]): PluginBuilder {
            return function addExtension(plugin: BacktraceForensicsPlugin): BacktraceForensicsPlugin {
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

    export function createPlugin(...extensions: PluginBuilder[]) {
        return extensions.reduce((plugin, extend) => extend(plugin), {} as BacktraceForensicsPlugin);
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
