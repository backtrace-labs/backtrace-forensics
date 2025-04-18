import { QuerySource } from '@backtrace/forensics';
import { UniqueAggregationsFiltersProvider } from './unique-count-in-events';
import { Instance, ProjectKey, UniverseKey } from '@backtrace/charon';
import { UniqueAggregations } from '@backtrace/charon';
import { Result } from '@backtrace/utils';
import { NoUniqueAggregationsError } from '../errors';
import { MissingAddressError, MissingProjectError } from '@backtrace/forensics';

export type CharonInstanceProvider = (
    url: URL,
    source: Partial<QuerySource>,
) => Instance | Promise<Instance> | Result<Instance, Error> | Promise<Result<Instance, Error>>;

export function charonUniqueFiltersProvider(
    instanceProvider?: CharonInstanceProvider,
): UniqueAggregationsFiltersProvider {
    const _instanceProvider =
        instanceProvider ??
        ((url, source) =>
            Instance.ofEndpoint(url, {
                token: source.token,
            }));

    return async function charonUniqueFiltersProvider(uniqueAttribute: string, source: Partial<QuerySource>) {
        const { address, project, universe } = source;

        if (!address) {
            return Result.err(new MissingAddressError());
        }

        if (!project) {
            return Result.err(new MissingProjectError());
        }

        const instanceResult = Result.wrapOk(await _instanceProvider(new URL(address), source));
        if (Result.isErr(instanceResult)) {
            return instanceResult;
        }

        const instance = instanceResult.data;
        const uniqueAggregationsResult = await UniqueAggregations.fetchForInstance(
            instance,
            universe ? UniverseKey.ofName(universe) : UniverseKey.ofAny(),
            ProjectKey.ofName(project),
        );

        if (Result.isErr(uniqueAggregationsResult)) {
            return uniqueAggregationsResult;
        }

        const projectUniqueAggregations = uniqueAggregationsResult.data as UniqueAggregations;
        if (!projectUniqueAggregations) {
            return Result.err(new NoUniqueAggregationsError());
        }

        const uniqueAggregations = projectUniqueAggregations.getUniqueAggregations();

        const uniqueAggregation = uniqueAggregations.find((u) =>
            u.uniqueAggregation.unique_attributes.includes(uniqueAttribute),
        );
        if (!uniqueAggregation) {
            return Result.err(new NoUniqueAggregationsError());
        }

        return Result.ok(uniqueAggregation.uniqueAggregation.linked_attributes);
    };
}
