import { Result } from '@backtrace/utils';
import { QuerySource } from '../../models';
import { MissingAddressError } from '../../common/errors';

export function createRequestData(querySource: Partial<QuerySource>, resource: string) {
    const { address, token, universe, project, location, params } = querySource;
    if (!address) {
        return Result.err(new MissingAddressError());
    }

    const qs = new URLSearchParams();
    if (project) {
        qs.set('project', project);
    }

    if (universe) {
        qs.set('universe', universe);
    }

    for (const param in params) {
        const values = params[param];
        if (Array.isArray(values)) {
            for (const value of values) {
                qs.append(param, value);
            }
        } else {
            qs.append(param, values);
        }
    }

    const headers: Record<string, string> = {
        'X-Coroner-Location': location ?? address,
    };

    if (token) {
        headers['X-Coroner-Token'] = token;
    }

    const resourceWithQuery = resource.includes('?') ? `${resource}&${qs.toString()}` : `${resource}?${qs.toString()}`;
    const url = new URL(resourceWithQuery, address);
    return Result.ok({ url, headers });
}
