import { ForensicsError } from '@backtrace/forensics';

export class NoUniqueAttributeError extends ForensicsError {
    constructor() {
        super('Unique attribute is not set.');
    }
}

export class NoTimeframeError extends ForensicsError {
    constructor() {
        super('No timeframe is set. Make sure to add time bounds by filtering on the "timestamp" column.');
    }
}

export class NoTimeframeBucketError extends ForensicsError {
    constructor() {
        super('Bucket does not exist for a given timeframe.');
    }
}

export class NoUniqueAggregationsError extends ForensicsError {
    constructor() {
        super('No unique aggregation found.');
    }
}
