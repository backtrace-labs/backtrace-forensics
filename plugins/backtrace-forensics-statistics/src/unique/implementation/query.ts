import { FoldedCoronerQuery, QuerySource } from '@backtrace/forensics';
import { Result } from '@backtrace/utils';
import { UniqueMetricsQuery } from '../query';
import { UniqueEventsRequest } from '../request';
import { GetUniqueCountInEventsQueryData } from './unique-count-in-events';
import { GetUniqueCountInReportsQuery } from './unique-count-in-reports';
import { UniqueCounts } from '../models';
import { NoUniqueAttributeError } from '../errors';

export class UniqueMetricsQueryBuilder implements UniqueMetricsQuery {
    readonly #request: UniqueEventsRequest;

    readonly #getUniqueCountInEventsQuery: GetUniqueCountInEventsQueryData;
    readonly #getUniqueCountInReports: GetUniqueCountInReportsQuery;

    constructor(
        query: UniqueEventsRequest,
        getUniqueCountInEventsQuery: GetUniqueCountInEventsQueryData,
        getUniqueCountInReports: GetUniqueCountInReportsQuery,
    ) {
        this.#request = query;

        this.#getUniqueCountInEventsQuery = getUniqueCountInEventsQuery;
        this.#getUniqueCountInReports = getUniqueCountInReports;
    }

    public uniqueAttribute(name: string): UniqueMetricsQuery {
        return this.buildSelf((request) => ({
            ...request,
            uniqueAttribute: name,
        }));
    }

    public async getCountInEventsQuery(source?: QuerySource): Promise<Result<FoldedCoronerQuery, Error>> {
        return Result.map(await this.#getUniqueCountInEventsQuery(this.#request, source), ({ query }) => query);
    }

    public async getCountInEvents(source?: QuerySource): Promise<Result<number, Error>> {
        const queryDataResult = await this.#getUniqueCountInEventsQuery(this.#request, source);
        if (Result.isErr(queryDataResult)) {
            return queryDataResult;
        }

        const { query, bucket, timeframe } = queryDataResult.data;
        const result = await query.post(source);
        if (Result.isErr(result)) {
            return result;
        }

        const sum = parseInt(result.data.first()?.fold('_count', 'sum') as string);
        if (isNaN(sum)) {
            return Result.ok(0);
        }

        const linearizationRatio = (timeframe.to - timeframe.from) / bucket.duration;
        const linearized = Math.round(sum * linearizationRatio);
        return Result.ok(linearized);
    }

    public getCountInReportsQuery(): Result<FoldedCoronerQuery, Error> {
        return this.#getUniqueCountInReports(this.#request);
    }

    public async getCountInReports(source?: QuerySource): Promise<Result<number, Error>> {
        if (!this.#request.uniqueAttribute) {
            return Result.err(new NoUniqueAttributeError());
        }

        const queryResult = this.getCountInReportsQuery();
        if (Result.isErr(queryResult)) {
            return queryResult;
        }

        const result = await queryResult.data.post(source);
        if (Result.isErr(result)) {
            return result;
        }

        const value = result.data.first()?.fold(this.#request.uniqueAttribute, 'unique');
        return Result.ok(value ?? 0);
    }

    public async getCounts(source?: QuerySource): Promise<Result<UniqueCounts, Error>> {
        const reportsResult = await this.getCountInReports(source);
        if (Result.isErr(reportsResult)) {
            return reportsResult;
        }

        const eventsResult = await this.getCountInEvents(source);
        if (Result.isErr(eventsResult)) {
            return eventsResult;
        }

        const crashFreeRate = Math.max(0, eventsResult.data === 0 ? 1 : 1 - reportsResult.data / eventsResult.data);

        return Result.ok({
            reports: reportsResult.data,
            events: eventsResult.data,
            crashFreeRate,
        });
    }

    private buildSelf(requestMutation: (query: UniqueEventsRequest) => UniqueEventsRequest) {
        return new UniqueMetricsQueryBuilder(
            requestMutation(this.#request),
            this.#getUniqueCountInEventsQuery,
            this.#getUniqueCountInReports,
        );
    }
}
