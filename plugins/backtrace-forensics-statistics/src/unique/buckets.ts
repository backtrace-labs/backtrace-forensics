import * as Timestamp from '../utils/timestamp';
import * as Duration from '../utils/duration';

export interface StoredEventBucket {
    /**
     * Bucket table name.
     */
    readonly table: string;

    /**
     * Duration of a bucket.
     */
    readonly duration: Duration.T;

    /**
     * Time between buckets.
     */
    readonly spacing: Duration.T;

    /**
     * Maximum age of bucket. After this time is passed, buckets are aggregated into larger buckets.
     */
    readonly maxAge: Duration.T;
}

export const CRDB_BUCKET_30_MINUTES: StoredEventBucket = {
    table: 'unique_aggregations',
    duration: Duration.ofMinutes(30),
    spacing: Duration.ofMinutes(30),
    maxAge: Duration.WEEK,
};

export const CRDB_BUCKET_1_HOUR: StoredEventBucket = {
    table: 'unique_aggregations',
    duration: Duration.ofHours(1),
    spacing: Duration.ofMinutes(30),
    maxAge: Duration.of(Duration.WEEK * 2),
};

export const CRDB_BUCKET_3_HOURS: StoredEventBucket = {
    table: 'unique_aggregations_coarse',
    duration: Duration.ofHours(3),
    spacing: Duration.ofMinutes(30),
    maxAge: Duration.LONGEST_MONTH,
};

export const CRDB_BUCKET_6_HOURS: StoredEventBucket = {
    table: 'unique_aggregations_coarse',
    duration: Duration.ofHours(6),
    spacing: Duration.ofMinutes(30),
    maxAge: Duration.LONGEST_QUARTER,
};

export const CRDB_BUCKET_12_HOURS: StoredEventBucket = {
    table: 'unique_aggregations_coarse',
    duration: Duration.ofHours(12),
    spacing: Duration.ofMinutes(30),
    maxAge: Duration.of(Duration.LONGEST_MONTH * 6),
};

export const CRDB_BUCKET_1_DAY: StoredEventBucket = {
    table: 'unique_aggregations_coarse',
    duration: Duration.of(Duration.ofDays(1) + Duration.ofMinutes(30)),
    spacing: Duration.ofMinutes(30),
    maxAge: Duration.LONGEST_YEAR,
};

export const CRDB_BUCKET_1_WEEK: StoredEventBucket = {
    table: 'unique_aggregations_coarse',
    duration: Duration.of(Duration.ofDays(7) + Duration.ofMinutes(30)),
    spacing: Duration.ofMinutes(30),
    maxAge: Duration.INFINITE,
};

export const CRDB_BUCKET_1_MONTH: StoredEventBucket = {
    table: 'unique_aggregations_coarse',
    duration: Duration.of(Duration.ofDays(31) + Duration.ofHours(3)),
    spacing: Duration.ofHours(3),
    maxAge: Duration.INFINITE,
};

export const CRDB_BUCKET_3_MONTHS: StoredEventBucket = {
    table: 'unique_aggregations_coarse',
    duration: Duration.of(Duration.ofDays(92) + Duration.ofHours(6)),
    spacing: Duration.ofHours(6),
    maxAge: Duration.INFINITE,
};

export const CRDB_BUCKET_1_YEAR: StoredEventBucket = {
    table: 'unique_aggregations_coarse',
    duration: Duration.ofDays(367),
    spacing: Duration.ofDays(1),
    maxAge: Duration.INFINITE,
};

const STORED_EVENT_BUCKETS: StoredEventBucket[] = [
    CRDB_BUCKET_30_MINUTES,
    CRDB_BUCKET_1_HOUR,
    CRDB_BUCKET_3_HOURS,
    CRDB_BUCKET_6_HOURS,
    CRDB_BUCKET_12_HOURS,
    CRDB_BUCKET_1_DAY,
    CRDB_BUCKET_1_WEEK,
    CRDB_BUCKET_1_MONTH,
    CRDB_BUCKET_3_MONTHS,
    CRDB_BUCKET_1_YEAR,
];

export interface EventBucket {
    readonly start: Timestamp.T;
    readonly end: Timestamp.T;
    readonly duration: Duration.T;
    readonly table: string;
}

export function getBucket(start: Timestamp.T, end: Timestamp.T, now?: Timestamp.T): EventBucket | undefined {
    now ??= Timestamp.now();
    const age = Duration.of(now - end);

    for (const storedBucket of STORED_EVENT_BUCKETS) {
        if (!isNotExpired(storedBucket, age)) {
            continue;
        }

        const bucket = closestBucket(storedBucket, end);
        if (!coversTimeframe(bucket, start, end)) {
            continue;
        }

        return bucket;
    }

    return undefined;
}

function isNotExpired(bucket: StoredEventBucket, age: Duration.T) {
    return bucket.maxAge > age;
}

function coversTimeframe(bucket: EventBucket, start: Timestamp.T, end: Timestamp.T) {
    return bucket.start <= start && bucket.end >= end;
}

function closestBucket(bucket: StoredEventBucket, timeframeEnd: Timestamp.T): EventBucket {
    // Round down timeframe to bucket end
    let bucketEnd = Timestamp.of(timeframeEnd - (timeframeEnd % bucket.spacing));

    // If bucket does not cover the end, add spacing
    if (bucketEnd < timeframeEnd) {
        bucketEnd += bucket.spacing;
    }

    return {
        start: bucketEnd - bucket.duration,
        end: bucketEnd,
        duration: bucket.duration,
        table: bucket.table,
    };
}
