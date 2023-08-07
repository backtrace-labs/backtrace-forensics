import { FailedQueryResponse, SuccessfulFoldQueryResponse, ValueConverter } from '@backtrace/forensics';
import { OkCoronerIssueResponse } from '../../coroner';
import {
    FailedFingerprintIssueResult,
    FailedQueryIssueResult,
    FailedRequestFingerprintIssueResult,
    FingerprintIssueResult,
    IssueRequestResponse,
    OkFingerprintIssueResult,
    OkIssueResult,
    OkIssueResults,
} from '../../coroner/issues/results';
import { memoize } from '../utils';
import { DEFAULT_TICKET_WATCHER } from './query';

export function toQueryFailedResult(result: FailedQueryResponse): FailedQueryIssueResult {
    return {
        error: result.json().error.message,
        errorCause: 'query-failed',
        queryResponse: result,
        success: false,
        failed() {
            return [toQueryFailedResult(result)];
        },
    };
}

function toOkIssueResult(response: OkCoronerIssueResponse): OkIssueResult {
    const tickets = response.ticket ? ValueConverter.toTickets(response.ticket) : [];
    const assigneeTicket = tickets.find((t) => t.watcher === DEFAULT_TICKET_WATCHER) ?? tickets[0];

    return {
        id: response.id,
        fingerprint: response.fingerprint,
        state: response.state,
        invariants: response.invariants ? ValueConverter.toIssueInvariants(response.invariants) : undefined,
        invariant_reopen_count: response.invariant_reopen_count,
        invariant_reopen_last_time: response.invariant_reopen_last_time
            ? new Date(response.invariant_reopen_last_time * 1000)
            : undefined,
        tags: response.tags ? ValueConverter.toLabels(response.tags) : [],
        tickets,
        blame_last_modified: response.blame_last_modified ? new Date(response.blame_last_modified * 1000) : undefined,
        blame: response.blame,
        assignees: assigneeTicket?.assignees,
    };
}

function toFingerprintResult(response: IssueRequestResponse): FingerprintIssueResult[] {
    if (response.response.error) {
        const errorResponse = response.response;
        return response.request.fingerprint.map((f) => ({
            errorCause: 'request-failed',
            error: errorResponse.error.message,
            fingerprint: f,
            responseJson: errorResponse,
            success: false,
        }));
    }

    const okResponse = response.response;
    return okResponse.results.map((r) => {
        if (r.error) {
            const result: FailedFingerprintIssueResult = {
                success: false,
                error: r.error,
                errorCause: 'fingerprint-failed',
                fingerprint: r.fingerprint,
                issue: r,
                json: r,
                responseJson: okResponse,
            };
            return result;
        }

        const okIssueResponse = r as OkCoronerIssueResponse;

        const result: OkFingerprintIssueResult = {
            success: true,
            fingerprint: r.fingerprint,
            issue: toOkIssueResult(okIssueResponse),
            json: okIssueResponse,
            responseJson: okResponse,
        };

        return result;
    });
}

export function toResults(result: SuccessfulFoldQueryResponse, responses: IssueRequestResponse[]): OkIssueResults {
    const all = memoize(() => responses.flatMap(toFingerprintResult));

    function isFingerprintResultFailed(
        result: FingerprintIssueResult,
    ): result is FailedFingerprintIssueResult | FailedRequestFingerprintIssueResult {
        return !result.success;
    }

    return {
        success: true,
        queryResponse: result,
        json: responses.map((r) => r.response),
        failed: memoize(() => all().filter(isFingerprintResultFailed)),
        all,
        first: memoize(() => toFingerprintResult(responses[0])[0]),
        fingerprint(fp) {
            return all().find((r) => r.fingerprint === fp);
        },
    };
}
