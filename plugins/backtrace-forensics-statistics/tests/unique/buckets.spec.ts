import * as Timestamp from '../../src/utils/timestamp';
import * as Duration from '../../src/utils/duration';
import {
    CRDB_BUCKET_12_HOURS,
    CRDB_BUCKET_1_DAY,
    CRDB_BUCKET_1_HOUR,
    CRDB_BUCKET_1_MONTH,
    CRDB_BUCKET_1_WEEK,
    CRDB_BUCKET_1_YEAR,
    CRDB_BUCKET_30_MINUTES,
    CRDB_BUCKET_3_HOURS,
    CRDB_BUCKET_3_MONTHS,
    CRDB_BUCKET_6_HOURS,
    EventBucket,
    getBucket,
    StoredEventBucket,
} from '../../src/unique/buckets';

describe('getBucket', () => {
    function expectedBucket(bucket: StoredEventBucket, bucketEnd: Timestamp.T): EventBucket {
        return {
            start: bucketEnd - bucket.duration,
            end: bucketEnd,
            duration: bucket.duration,
            table: bucket.table,
        };
    }

    describe('non-expired buckets', () => {
        const now = Timestamp.ofDate(new Date('2025-04-03T09:51:06.463Z'));
        it('should resolve CRDB_BUCKET_30_MINUTES bucket', () => {
            const start = Timestamp.ofDate(new Date('2025-04-03T07:20:00.000Z'));
            const end = start + Duration.ofMinutes(5);
            const expected = expectedBucket(
                CRDB_BUCKET_30_MINUTES,
                Timestamp.ofDate(new Date('2025-04-03T07:30:00.000Z')),
            );

            const actual = getBucket(start, end, now);

            expect(actual).toEqual(expected);
        });

        it('should resolve CRDB_BUCKET_1_HOUR bucket', () => {
            const start = Timestamp.ofDate(new Date('2025-04-03T07:29:36.000Z'));
            const end = start + Duration.ofMinutes(5);
            const expected = expectedBucket(CRDB_BUCKET_1_HOUR, Timestamp.ofDate(new Date('2025-04-03T08:00:00.000Z')));

            const actual = getBucket(start, end, now);

            expect(actual).toEqual(expected);
        });

        it('should resolve CRDB_BUCKET_1_HOUR bucket', () => {
            const start = Timestamp.ofDate(new Date('2025-04-03T07:29:36.000Z'));
            const end = start + Duration.ofMinutes(30);
            const expected = expectedBucket(CRDB_BUCKET_1_HOUR, Timestamp.ofDate(new Date('2025-04-03T08:00:00.000Z')));

            const actual = getBucket(start, end, now);

            expect(actual).toEqual(expected);
        });

        it('should resolve CRDB_BUCKET_3_HOURS bucket', () => {
            const start = Timestamp.ofDate(new Date('2025-04-03T07:29:36.000Z'));
            const end = start + Duration.ofHours(1);
            const expected = expectedBucket(
                CRDB_BUCKET_3_HOURS,
                Timestamp.ofDate(new Date('2025-04-03T08:30:00.000Z')),
            );

            const actual = getBucket(start, end, now);

            expect(actual).toEqual(expected);
        });

        it('should resolve CRDB_BUCKET_6_HOURS bucket', () => {
            const start = Timestamp.ofDate(new Date('2025-04-03T07:29:36.000Z'));
            const end = start + Duration.ofHours(3);
            const expected = expectedBucket(
                CRDB_BUCKET_6_HOURS,
                Timestamp.ofDate(new Date('2025-04-03T10:30:00.000Z')),
            );

            const actual = getBucket(start, end, now);

            expect(actual).toEqual(expected);
        });

        it('should resolve CRDB_BUCKET_12_HOURS bucket', () => {
            const start = Timestamp.ofDate(new Date('2025-04-03T07:29:36.000Z'));
            const end = start + Duration.ofHours(7);
            const expected = expectedBucket(
                CRDB_BUCKET_12_HOURS,
                Timestamp.ofDate(new Date('2025-04-03T14:30:00.000Z')),
            );

            const actual = getBucket(start, end, now);

            expect(actual).toEqual(expected);
        });

        it('should resolve CRDB_BUCKET_1_DAY bucket', () => {
            const start = Timestamp.ofDate(new Date('2025-04-02T08:29:38.000Z'));
            const end = start + Duration.ofDays(1);
            const expected = expectedBucket(CRDB_BUCKET_1_DAY, Timestamp.ofDate(new Date('2025-04-03T08:30:00.000Z')));

            const actual = getBucket(start, end, now);

            expect(actual).toEqual(expected);
        });

        it('should resolve CRDB_BUCKET_1_WEEK bucket', () => {
            const start = Timestamp.ofDate(new Date('2025-03-27T09:29:39.000Z'));
            const end = start + Duration.ofDays(6) + Duration.ofHours(23);
            const expected = expectedBucket(CRDB_BUCKET_1_WEEK, Timestamp.ofDate(new Date('2025-04-03T08:30:00.000Z')));

            const actual = getBucket(start, end, now);

            expect(actual).toEqual(expected);
        });

        it('should resolve CRDB_BUCKET_1_MONTH bucket', () => {
            const start = Timestamp.ofDate(new Date('2025-03-03T09:29:41.000Z'));
            const end = start + Duration.ofDays(30) + Duration.ofHours(23);
            const expected = expectedBucket(
                CRDB_BUCKET_1_MONTH,
                Timestamp.ofDate(new Date('2025-04-03T09:00:00.000Z')),
            );

            const actual = getBucket(start, end, now);

            expect(actual).toEqual(expected);
        });

        it('should resolve CRDB_BUCKET_3_MONTHS bucket', () => {
            const start = Timestamp.ofDate(new Date('2025-01-03T09:29:42.000Z'));
            const end = start + Duration.ofDays(89) + Duration.ofHours(23);
            const expected = expectedBucket(
                CRDB_BUCKET_3_MONTHS,
                Timestamp.ofDate(new Date('2025-04-03T12:00:00.000Z')),
            );

            const actual = getBucket(start, end, now);

            expect(actual).toEqual(expected);
        });

        it('should resolve CRDB_BUCKET_1_YEAR bucket', () => {
            const start = Timestamp.ofDate(new Date('2024-04-03T08:29:47.000Z'));
            const end = start + Duration.ofDays(365);
            const expected = expectedBucket(CRDB_BUCKET_1_YEAR, Timestamp.ofDate(new Date('2025-04-04T00:00:00.000Z')));

            const actual = getBucket(start, end, now);

            expect(actual).toEqual(expected);
        });

        it('should resolve undefined for too large timeframes', () => {
            const start = Timestamp.ofDate(new Date('2024-04-03T08:29:47.000Z'));
            const end = start + Duration.ofDays(600);

            const actual = getBucket(start, end, now);

            expect(actual).toEqual(undefined);
        });
    });

    describe('expired buckets', () => {
        it('should resolve CRDB_BUCKET_1_HOUR bucket, because CRDB_BUCKET_30_MINUTES expired by then', () => {
            const now = Timestamp.ofDate(new Date('2025-04-03T09:51:06.463Z')) + CRDB_BUCKET_30_MINUTES.maxAge;

            const start = Timestamp.ofDate(new Date('2025-04-03T07:20:00.000Z'));
            const end = start + Duration.ofMinutes(5);
            const expected = expectedBucket(CRDB_BUCKET_1_HOUR, Timestamp.ofDate(new Date('2025-04-03T07:30:00.000Z')));

            const actual = getBucket(start, end, now);

            expect(actual).toEqual(expected);
        });

        it('should resolve CRDB_BUCKET_3_HOURS bucket, because CRDB_BUCKET_1_HOUR expired by then', () => {
            const now = Timestamp.ofDate(new Date('2025-04-03T09:51:06.463Z')) + CRDB_BUCKET_1_HOUR.maxAge;

            const start = Timestamp.ofDate(new Date('2025-04-03T07:20:00.000Z'));
            const end = start + Duration.ofMinutes(5);
            const expected = expectedBucket(
                CRDB_BUCKET_3_HOURS,
                Timestamp.ofDate(new Date('2025-04-03T07:30:00.000Z')),
            );

            const actual = getBucket(start, end, now);

            expect(actual).toEqual(expected);
        });

        it('should resolve CRDB_BUCKET_6_HOURS bucket, because CRDB_BUCKET_3_HOURS expired by then', () => {
            const now = Timestamp.ofDate(new Date('2025-04-03T09:51:06.463Z')) + CRDB_BUCKET_3_HOURS.maxAge;

            const start = Timestamp.ofDate(new Date('2025-04-03T07:20:00.000Z'));
            const end = start + Duration.ofMinutes(5);
            const expected = expectedBucket(
                CRDB_BUCKET_6_HOURS,
                Timestamp.ofDate(new Date('2025-04-03T07:30:00.000Z')),
            );

            const actual = getBucket(start, end, now);

            expect(actual).toEqual(expected);
        });

        it('should resolve CRDB_BUCKET_12_HOURS bucket, because CRDB_BUCKET_6_HOURS expired by then', () => {
            const now = Timestamp.ofDate(new Date('2025-04-03T09:51:06.463Z')) + CRDB_BUCKET_6_HOURS.maxAge;

            const start = Timestamp.ofDate(new Date('2025-04-03T07:20:00.000Z'));
            const end = start + Duration.ofMinutes(5);
            const expected = expectedBucket(
                CRDB_BUCKET_12_HOURS,
                Timestamp.ofDate(new Date('2025-04-03T07:30:00.000Z')),
            );

            const actual = getBucket(start, end, now);

            expect(actual).toEqual(expected);
        });

        it('should resolve CRDB_BUCKET_1_DAY bucket, because CRDB_BUCKET_12_HOURS expired by then', () => {
            const now = Timestamp.ofDate(new Date('2025-04-03T09:51:06.463Z')) + CRDB_BUCKET_12_HOURS.maxAge;

            const start = Timestamp.ofDate(new Date('2025-04-03T07:20:00.000Z'));
            const end = start + Duration.ofMinutes(5);
            const expected = expectedBucket(CRDB_BUCKET_1_DAY, Timestamp.ofDate(new Date('2025-04-03T07:30:00.000Z')));

            const actual = getBucket(start, end, now);

            expect(actual).toEqual(expected);
        });

        it('should resolve CRDB_BUCKET_1_WEEK bucket, because CRDB_BUCKET_1_DAY expired by then', () => {
            const now = Timestamp.ofDate(new Date('2025-04-03T09:51:06.463Z')) + CRDB_BUCKET_1_DAY.maxAge;

            const start = Timestamp.ofDate(new Date('2025-04-03T07:20:00.000Z'));
            const end = start + Duration.ofMinutes(5);
            const expected = expectedBucket(CRDB_BUCKET_1_WEEK, Timestamp.ofDate(new Date('2025-04-03T07:30:00.000Z')));

            const actual = getBucket(start, end, now);

            expect(actual).toEqual(expected);
        });

        it('should resolve CRDB_BUCKET_1_WEEK bucket because it does not expire', () => {
            const now = Timestamp.ofDate(new Date('2025-04-03T09:51:06.463Z')) + Duration.ofDays(365 * 100);

            const start = Timestamp.ofDate(new Date('2025-04-03T07:20:00.000Z'));
            const end = start + Duration.ofMinutes(5);
            const expected = expectedBucket(CRDB_BUCKET_1_WEEK, Timestamp.ofDate(new Date('2025-04-03T07:30:00.000Z')));

            const actual = getBucket(start, end, now);

            expect(actual).toEqual(expected);
        });
    });
});
