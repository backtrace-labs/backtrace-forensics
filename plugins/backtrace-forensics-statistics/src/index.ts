import { Plugins } from '@backtrace/forensics';
import { UniqueMetricsQuery } from './unique/query';
import { UniqueMetricsQueryBuilder } from './unique/implementation/query';
import { uniqueCountInReportsQuery } from './unique/implementation/unique-count-in-reports';
import {
    UniqueAggregationsFiltersProvider,
    uniqueCountInEventsQueryData,
} from './unique/implementation/unique-count-in-events';
import {
    CharonInstanceProvider,
    charonUniqueFiltersProvider,
} from './unique/implementation/charon-unique-filters-provider';

export interface StatisticsPluginOptions {
    readonly uniqueAggregationsFiltersProvider?: UniqueAggregationsFiltersProvider;
    readonly charonInstanceProvider?: CharonInstanceProvider;
}

export { UniqueAggregationsFiltersProvider, CharonInstanceProvider };

declare module '@backtrace/forensics' {
    interface CoronerQuery {
        uniqueMetrics(): UniqueMetricsQuery;
    }
}

export function statisticsPlugin(options?: StatisticsPluginOptions) {
    return Plugins.createPlugin(
        Plugins.addQueryExtension((context) => ({
            uniqueMetrics() {
                const uniqueAggregationsFiltersProvider =
                    options?.uniqueAggregationsFiltersProvider ??
                    charonUniqueFiltersProvider(options?.charonInstanceProvider);

                return new UniqueMetricsQueryBuilder(
                    {
                        query: this,
                    },
                    uniqueCountInEventsQueryData(context, uniqueAggregationsFiltersProvider),
                    uniqueCountInReportsQuery(),
                );
            },
        })),
    );
}

export * from './unique';
