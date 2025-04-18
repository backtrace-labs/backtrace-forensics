import { FoldedCoronerQuery, Plugins, QueryFilter, QuerySource } from '@backtrace/forensics';
import { Result } from '@backtrace/utils';
import { EventBucket, getBucket } from '../buckets';
import * as Timestamp from '../../utils/timestamp';
import * as Duration from '../../utils/duration';
import { UniqueEventsRequest } from '../request';
import { NoTimeframeBucketError, NoTimeframeError, NoUniqueAttributeError } from '../errors';

export type GetUniqueCountInEventsQueryData = ReturnType<typeof uniqueCountInEventsQueryData>;

interface Timeframe {
    readonly from: number;
    readonly to: number;
}

interface UniqueCountInEventsQueryData {
    readonly query: FoldedCoronerQuery;
    readonly bucket: EventBucket;
    readonly timeframe: Timeframe;
}

export type UniqueAggregationsFiltersProvider = (
    uniqueAttribute: string,
    source: Partial<QuerySource>,
) => Promise<Result<string[], Error>>;

export function uniqueCountInEventsQueryData(
    context: Plugins.PluginContext,
    filtersProvider: UniqueAggregationsFiltersProvider,
) {
    return async function uniqueCountInEventsQueryData(
        request: UniqueEventsRequest,
        source?: QuerySource,
    ): Promise<Result<UniqueCountInEventsQueryData, Error>> {
        if (!request.uniqueAttribute) {
            return Result.err(new NoUniqueAttributeError());
        }

        const filters = request.query.json().filter?.[0];
        if (!filters) {
            return Result.err(new NoTimeframeError());
        }

        const timeframe = getTimeframe(filters);
        if (!timeframe) {
            return Result.err(new NoTimeframeError());
        }

        const bucket = getBucket(timeframe.from, timeframe.to);
        if (!bucket) {
            return Result.err(new NoTimeframeBucketError());
        }

        const querySource: Partial<QuerySource> = {
            ...source,
            ...context.options.defaultSource,
        };

        const usableFiltersResult = await getFilters(filtersProvider, request.uniqueAttribute, filters, querySource);
        if (Result.isErr(usableFiltersResult)) {
            return usableFiltersResult;
        }

        const usableFilters = usableFiltersResult.data;

        return Result.ok({
            query: context.forensics
                .create()
                .table(bucket.table)
                .filter('_end_timestamp', 'equal', Timestamp.seconds(bucket.end))
                .filter('_duration', 'equal', Duration.totalSeconds(bucket.duration))
                .filter('_name', 'equal', request.uniqueAttribute)
                .fold('_count', 'sum')
                .filter(usableFilters)
                .limit(1),
            bucket,
            timeframe,
        });
    };
}

function getTimeframe(filters: QueryFilter): Timeframe | undefined {
    const from = parseInt(
        filters['timestamp']?.find((f) => f[0] === 'at-least' || f[0] === 'greater-than')?.[1] as string,
    );

    const to = parseInt(filters['timestamp']?.find((f) => f[0] === 'at-most' || f[0] === 'less-than')?.[1] as string);

    if (isNaN(from) || isNaN(to)) {
        return undefined;
    }

    return { from: Timestamp.ofSeconds(from), to: Timestamp.ofSeconds(to) };
}

async function getFilters(
    filtersProvider: UniqueAggregationsFiltersProvider,
    uniqueAttribute: string,
    filters: QueryFilter,
    source: Partial<QuerySource>,
) {
    const filtersResult = await filtersProvider(uniqueAttribute, source);
    if (Result.isErr(filtersResult)) {
        return filtersResult;
    }

    const filterableAttributes = filtersResult.data;

    const newFilters = Object.fromEntries(
        Object.entries(filters).filter(([key]) => filterableAttributes.includes(key)),
    );

    return Result.ok(newFilters);
}
