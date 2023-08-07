import { CoronerQuery, FoldCoronerQuery, Plugins } from '@backtrace/forensics';
import { UpdateIssuesQuery } from './coroner/issues/query';
import { postRequests } from './implementation';
import { CoronerIssueExecutor } from './implementation/CoronerIssueExecutor';
import { UpdateIssuesQueryBuilder } from './implementation/issues/UpdateIssuesQueryBuilder';
import { getRequests } from './implementation/issues/requests/getRequests';

declare module '@backtrace/forensics' {
    interface CoronerQuery {
        fingerprints(): UpdateIssuesQuery;
    }

    interface FoldedCoronerQuery {
        fingerprints(): UpdateIssuesQuery;
    }

    interface SuccessfulFoldQueryResponse {
        fingerprints(): UpdateIssuesQuery;
    }
}

export function fingerprints(context: Plugins.PluginContext) {
    return function fingerprints(query: CoronerQuery | FoldCoronerQuery) {
        const requestsPoster = postRequests(
            new CoronerIssueExecutor(context.apiCallerFactory, context.options.defaultSource),
        );
        return new UpdateIssuesQueryBuilder(query, {}, getRequests, requestsPoster);
    };
}

export function fingerprintPlugin() {
    return Plugins.createPlugin(
        Plugins.addQueryExtension((context) => ({
            fingerprints() {
                return fingerprints(context)(this);
            },
        })),

        Plugins.addFoldedQueryExtension((context) => ({
            fingerprints() {
                return fingerprints(context)(this);
            },
        })),

        Plugins.addSuccessfulFoldResponseExtension((context) => ({
            fingerprints() {
                return fingerprints(context)(this.query);
            },
        })),
    );
}

export * from './coroner';
export * from './implementation';
export * from './interfaces';
export * from './invariants';
