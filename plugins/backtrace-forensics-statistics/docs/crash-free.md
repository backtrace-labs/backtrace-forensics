# Crash-free users

To discover crash-free users rate, two queries need to be made for a given period of time:

-   [total number of unique users that sent reports](#total-number-of-unique-users-that-sent-reports),
-   [total number of unique users](#total-number-of-unique-users).

A crash-free error rate is then calculated by using this formula:

```
rate = 1 - reports_unique_users / unique_users
```

## Total number of unique users that sent reports

This is a simple Coroner query folding over unique number of configured attribute values for user ID (default: `guid`).
The query should be filtered by all supplied filters.

A sample query may look like this:

```json
{
    "filter": {
        "timestamp": [
            ["at-least", 1758238834],
            ["at-most", 1758325234]
        ],
        "foo": [["equal", "bar"]]
    },
    "fold": {
        "guid": [["unique"]]
    }
}
```

## Total number of unique users

This query is a tad more complicated. The query must be made to a `unique_aggregations` or `unique_aggregations_coarse`
table, depending on the timeframe size.

The rule of thumb is:

-   time frame is less or equal to an hour (3600 seconds) - `unique_aggregations`,
-   time frame is more than an hour (3600 seconds) - `unique_aggregations_coarse`.

### Data structure

To understand how the time aperture is picked, one needs to know how the data is stored in CRDB.

The table structure looks like this:

| Name               | Type         | Description                                   |
| ------------------ | ------------ | --------------------------------------------- |
| `_name`            | `dictionary` | Name of this time bucket (default: `guid`).   |
| `_start_timestamp` | `uint64`     | Start timestamp for this data point.          |
| `_end_timestamp`   | `uint64`     | End timestamp for this data point.            |
| `_duration`        | `uint64`     | Duration the data point covers.               |
| `_count`           | `uint64`     | Count of events for this data point.          |
| `*`                | `*`          | [Other unique attributes](#other-attributes). |

#### Bucket durations

Each bucket begins at a timestamp divisible by **spacing**, and has a **duration**. As more time passes, events are
aggregated into larger buckets to conserve space.

The following bucket durations are stored:

| Duration [s] |                   | Spacing [s] |            | Max age [s] |          | `unique_aggregations` | `unique_aggregations_coarse` |
| ------------ | ----------------- | ----------- | ---------- | ----------- | -------- | --------------------- | ---------------------------- |
| 1800         | 30 minutes        | 1800        | 30 minutes | 604800      | 7 days   | &check;               |                              |
| 3600         | 1 hour            | 1800        | 30 minutes | 1209600     | 14 days  | &check;               |                              |
| 10800        | 3 hours           | 1800        | 30 minutes | 2678400     | 31 days  |                       | &check;                      |
| 21600        | 6 hours           | 1800        | 30 minutes | 7948800     | 92 days  |                       | &check;                      |
| 43200        | 12 hours          | 1800        | 30 minutes | 16070400    | 186 days |                       | &check;                      |
| 88200        | 1 day 30 minutes  | 1800        | 30 minutes | 31622400    | 366 days |                       | &check;                      |
| 606600       | 7 days 30 minutes | 1800        | 30 minutes | -           | -        |                       | &check;                      |
| 2689200      | 31 days 3 hours   | 10800       | 3 hours    | -           | -        |                       | &check;                      |
| 7970400      | 92 days 6 hours   | 21600       | 6 hours    | -           | -        |                       | &check;                      |
| 31708800     | 367 days          | 86400       | 1 day      | -           | -        |                       | &check;                      |

An example of buckets starting between dates 2025-03-30 11:28:29 and 2025-03-30 13:35:10 could look like this:

| Start               | End                 | Duration [s] | Count |
| ------------------- | ------------------- | ------------ | ----- |
| 2025-03-30 11:30:00 | 2025-03-30 14:30:00 | 10800        | 10    |
| 2025-03-30 12:00:00 | 2025-03-30 15:00:00 | 10800        | 7     |
| 2025-03-30 12:30:00 | 2025-03-30 15:30:00 | 10800        | 18    |
| 2025-03-30 13:00:00 | 2025-03-30 16:00:00 | 10800        | 17    |
| 2025-03-30 13:30:00 | 2025-03-30 16:30:00 | 10800        | 18    |

#### Other attributes

Each bucket contains the unique attribute (`_name`) and other attributes which determine the users' characteristics. By
default, the attributes are:

-   `application.version`
-   `uname.sysname`

These are configurable via the `unique_aggregations` BPG object. There's no user-accessible method as of writing this
document.

Buckets with attributes will have separate buckets having all combinations of them. For example, for versions 1.0.3,
1.0.4 and operating systems Linux and Windows, a single time frame will have 4 buckets:

| Start               | End                 | Duration [s] | Count | `application.version` | `uname.sysname` |
| ------------------- | ------------------- | ------------ | ----- | --------------------- | --------------- |
| 2025-03-30 11:30:00 | 2025-03-30 14:30:00 | 10800        | 10    | 1.0.3                 | Windows         |
| 2025-03-30 11:30:00 | 2025-03-30 14:30:00 | 10800        | 7     | 1.0.4                 | Windows         |
| 2025-03-30 11:30:00 | 2025-03-30 14:30:00 | 10800        | 18    | 1.0.3                 | Linux           |
| 2025-03-30 11:30:00 | 2025-03-30 14:30:00 | 10800        | 17    | 1.0.4                 | Linux           |

Counts can be summed, i.e. if you want to get all user counts regardless of the attributes (or for multiple certain
values).

**Note**: each unique user can be counted **only once** within a time frame. This can cause missing users when their
attributes change. For example, if a user uses application with a version `1.0.3`, and they update to `1.0.4`, they will
not be counted again for different attributes. This is a known limitation and may cause invalid results.

### Getting the correct event bucket

A smallest available event bucket must be picked that:

-   envelops the time frame entirely,
-   is not expired.

For a given `timeframe.start` and `timeframe.end` timestamps, two values are calculated:

-   `timeframe.age` - `now - timeframe.end`,
-   `timeframe.duration` - `timeframe.end - timeframe.start`.

Each granularity has a set max age, after which it should not be taken into consideration. Max age must be compared to
the calculated age, and only buckets having `bucket.maxAge > timeframe.age` are considered.

The next step is to calculate the considered `bucket.start` and `bucket.end` dates. The `bucket.end` date should be
calculated first, and then the `bucket.start` date based on `bucket.end` and `bucket.duration`.

To calculate `bucket.end`, use the following formula:

```
bucket.end = timeframe.end - (timeframe.end % bucket.spacing)
if (bucket.end < timeframe.end) {
    // add a single spacing if bucket does not cover the end
    bucket.end += bucket.spacing
}
```

This formula essentially rounds up the `timeframe.end` date to `bucket.spacing` and adds a single `bucket.spacing`, if
necessary, to the end, marking the end of the bucket.

Calculating `bucket.start` is then straightforward:

```
bucket.start = bucket.end - bucket.duration
```

To check if bucket envelops the time frame, we compare the dates accordingly:

```
result = bucket.start <= timeframe.start && bucket.end >= timeframe.end
```

If `result` is `true`, the bucket is valid and can be returned with previously calculated `bucket.start` and
`bucket.end` values. Otherwise, a larger bucket must be checked with the same steps.

### Linearizing the result

As the bucket timeframe will often be larger than the actual timeframe, the result needs to be linearized. This is done
by multiplying the result by ratio of `timeframe.duration` to `bucket.duration`:

```
linearized_ratio = bucket.duration/timeframe.duration
linearized = round(result * linearized_ratio)
```

For example, if we take a timeframe of 1 day, the selected bucket will have a length of 1 day and 30 minutes. The ratio
will be then:

```
linearized_ratio = 88200/86400 = 0.9795918367
```

If bucket has a `count` value of 4823, the final result will be:

```
linearized = round(4823 * 0.9795918367) = round(4724.5714284041) = 4725
```

### Example

Assuming that:

```
now = 2025-04-15 10:15:00
timeframe.start = 2025-04-03 07:29:36
timeframe.end = 2025-04-03 09:45:36
```

then:

```
timeframe.age = 2025-04-03 10:15:00 - 2025-04-03 08:29:36 = 1w 1h 45m 24s
timeframe.duration = 2025-04-03 09:45:36 - 2025-04-03 07:29:36 = 2h 16m
```

| Duration            | Spacing        | Max age     | Is not expired? | Closest bucket                                | Overlaps timeframe? |
| ------------------- | -------------- | ----------- | --------------- | --------------------------------------------- | ------------------- |
| 30 minutes          | 30 minutes     | 7 days      | &cross;         | 2025-04-03 07:00:00 - 2025-04-03 07:30:00     | &cross;             |
| 1 hour              | 30 minutes     | 14 days     | &check;         | 2025-04-03 09:00:00 - 2025-04-03 10:00:00     | &cross;             |
| **3 hours**         | **30 minutes** | **31 days** | **&check;**     | **2025-04-03 07:00:00 - 2025-04-03 10:00:00** | _&check;_           |
| _6 hours_           | _30 minutes_   | _92 days_   | _&check;_       | _2025-04-03 04:00:00 - 2025-04-03 10:00:00_   | _&check;_           |
| _12 hours_          | _30 minutes_   | _186 days_  | _&check;_       | _2025-04-02 22:00:00 - 2025-04-03 10:00:00_   | _&check;_           |
| _1 day 30 minutes_  | _30 minutes_   | _366 days_  | _&check;_       | _2025-04-02 09:30:00 - 2025-04-03 10:00:00_   | _&check;_           |
| _7 days 30 minutes_ | _30 minutes_   | _-_         | _&check;_       | _2025-03-27 10:30:00 - 2025-04-03 10:00:00_   | _&check;_           |
| _31 days 3 hours_   | _3 hours_      | _-_         | _&check;_       | _2025-03-03 09:00:00 - 2025-04-03 12:00:00_   | _&check;_           |
| _92 days 6 hours_   | _6 hours_      | _-_         | _&check;_       | _2025-01-01 06:00:00 - 2025-04-03 12:00:00_   | _&check;_           |
| _367 days_          | _1 day_        | _-_         | _&check;_       | _2024-04-02 04:00:00 - 2025-04-04 00:00:00_   | _&check;_           |

Result: a bucket ranging from **2025-04-03 07:00:00 - 2025-04-03 10:00:00** is returned.

#### Filtering

Not all filters can be used. To determine which filters can be used, the `unique_aggregations` BPG object should be
checked for a given project.

The `unique_aggregation` object contains a `configuration` field, which is a JSON object with the following structure:

```json
{
    "unique": [
        {
            "unique_attributes": ["guid"], // guid for unique users, or other attributes
            "linked_attributes": ["application.version", "uname.sysname"] // or other attributes
        }
    ]
}
```

Only attributes listed in `linked_attributes` can be used for filtering.
