import { BacktraceForensicsOptions } from '../BacktraceForensics';
import {
    CoronerQuery,
    FailedFoldQueryResponse,
    FailedQueryResponse,
    FailedSelectQueryResponse,
    FoldCoronerQuery,
    FoldQueryResponse,
    FoldedCoronerQuery,
    QueryResponse,
    SelectCoronerQuery,
    SelectQueryResponse,
    SelectedCoronerQuery,
    SuccessfulFoldQueryResponse,
    SuccessfulQueryResponse,
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

        readonly responseExtensions?: readonly PluginExtension<QueryResponse>[];
        readonly failedResponseExtensions?: readonly PluginExtension<FailedQueryResponse>[];
        readonly successfulResponseExtensions?: readonly PluginExtension<SuccessfulQueryResponse>[];

        readonly foldResponseExtensions?: readonly PluginExtension<FoldQueryResponse>[];
        readonly failedFoldResponseExtensions?: readonly PluginExtension<FailedFoldQueryResponse>[];
        readonly successfulFoldResponseExtensions?: readonly PluginExtension<SuccessfulFoldQueryResponse>[];

        readonly selectResponseExtensions?: readonly PluginExtension<SelectQueryResponse>[];
        readonly failedSelectResponseExtensions?: readonly PluginExtension<FailedSelectQueryResponse>[];
        readonly successfulSelectResponseExtensions?: readonly PluginExtension<SuccessfulQueryResponse>[];
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

    export const addResponseExtension = pluginExtensionAdder('responseExtensions');
    export const addFailedResponseExtension = pluginExtensionAdder('failedResponseExtensions');
    export const addSuccessfulResponseExtension = pluginExtensionAdder('successfulResponseExtensions');

    export const addFoldResponseExtension = pluginExtensionAdder('foldResponseExtensions');
    export const addFailedFoldResponseExtension = pluginExtensionAdder('failedFoldResponseExtensions');
    export const addSuccessfulFoldResponseExtension = pluginExtensionAdder('successfulFoldResponseExtensions');

    export const addSelectResponseExtension = pluginExtensionAdder('selectResponseExtensions');
    export const addFailedSelectResponseExtension = pluginExtensionAdder('failedSelectResponseExtensions');
    export const addSuccessfulSelectResponseExtension = pluginExtensionAdder('successfulSelectResponseExtensions');

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
